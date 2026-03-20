-- ============================================
-- Zeus Credits Economy Migration
-- Run this in Supabase SQL Editor (one time)
-- ============================================

-- 1. Set default credits for new users to 9
ALTER TABLE profiles ALTER COLUMN zeus_credits SET DEFAULT 9;

-- 2. Create credit_transfers table (transfers + loans)
CREATE TABLE IF NOT EXISTS credit_transfers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  from_user_id uuid REFERENCES profiles(id) NOT NULL,
  to_user_id uuid REFERENCES profiles(id) NOT NULL,
  amount integer NOT NULL CHECK (amount >= 1),
  type text NOT NULL CHECK (type IN ('transfer', 'loan')),
  loan_status text CHECK (loan_status IN ('active', 'repaid') OR loan_status IS NULL),
  created_at timestamptz DEFAULT now(),
  repaid_at timestamptz
);

-- 3. RLS policies for credit_transfers
ALTER TABLE credit_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transfers"
  ON credit_transfers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create transfers"
  ON credit_transfers FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Borrowers can repay loans"
  ON credit_transfers FOR UPDATE
  USING (auth.uid() = to_user_id AND type = 'loan' AND loan_status = 'active');

-- 4. RPC: Atomic credit transfer (prevents race conditions)
CREATE OR REPLACE FUNCTION transfer_credits(
  p_from uuid,
  p_to uuid,
  p_amount integer,
  p_type text DEFAULT 'transfer'
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_from_balance integer;
BEGIN
  SELECT zeus_credits INTO v_from_balance FROM profiles WHERE id = p_from FOR UPDATE;
  IF v_from_balance IS NULL OR v_from_balance < p_amount THEN
    RETURN json_build_object('ok', false, 'error', 'Insufficient credits');
  END IF;
  UPDATE profiles SET zeus_credits = zeus_credits - p_amount WHERE id = p_from;
  UPDATE profiles SET zeus_credits = zeus_credits + p_amount WHERE id = p_to;
  INSERT INTO credit_transfers (from_user_id, to_user_id, amount, type, loan_status)
  VALUES (p_from, p_to, p_amount, p_type, CASE WHEN p_type = 'loan' THEN 'active' ELSE NULL END);
  RETURN json_build_object('ok', true);
END;
$$;

-- 5. RPC: Loan repayment
CREATE OR REPLACE FUNCTION repay_loan(
  p_loan_id bigint,
  p_borrower uuid
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_loan credit_transfers%ROWTYPE;
  v_borrower_balance integer;
BEGIN
  SELECT * INTO v_loan FROM credit_transfers
    WHERE id = p_loan_id AND to_user_id = p_borrower AND type = 'loan' AND loan_status = 'active';
  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'Loan not found');
  END IF;
  SELECT zeus_credits INTO v_borrower_balance FROM profiles WHERE id = p_borrower FOR UPDATE;
  IF v_borrower_balance < v_loan.amount THEN
    RETURN json_build_object('ok', false, 'error', 'Insufficient credits to repay');
  END IF;
  UPDATE profiles SET zeus_credits = zeus_credits - v_loan.amount WHERE id = p_borrower;
  UPDATE profiles SET zeus_credits = zeus_credits + v_loan.amount WHERE id = v_loan.from_user_id;
  UPDATE credit_transfers SET loan_status = 'repaid', repaid_at = now() WHERE id = p_loan_id;
  RETURN json_build_object('ok', true);
END;
$$;

-- 6. RPC: Atomic vote with credit deduction
CREATE OR REPLACE FUNCTION vote_prediction(
  p_user_id uuid,
  p_prediction_id bigint,
  p_vote text
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_balance integer;
  v_existing text;
BEGIN
  SELECT vote INTO v_existing FROM prediction_votes
    WHERE prediction_id = p_prediction_id AND user_id = p_user_id;
  IF v_existing IS NOT NULL THEN
    RETURN json_build_object('ok', false, 'error', 'Already voted');
  END IF;
  SELECT zeus_credits INTO v_balance FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < 1 THEN
    RETURN json_build_object('ok', false, 'error', 'No credits');
  END IF;
  UPDATE profiles SET zeus_credits = zeus_credits - 1 WHERE id = p_user_id;
  INSERT INTO prediction_votes (prediction_id, user_id, vote)
    VALUES (p_prediction_id, p_user_id, p_vote);
  RETURN json_build_object('ok', true);
END;
$$;
