-- ============================================
-- Zeus Credits: Bonus (Dead Chips) Migration
-- Run this in Supabase SQL Editor (one time)
-- ============================================

-- 1. Add bonus_credits column (泥码 = dead chips, only for voting)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bonus_credits integer DEFAULT 9;

-- 2. Set existing users' bonus_credits
-- Users who already have credits: their bonus = min(9, current credits)
UPDATE profiles SET bonus_credits = LEAST(9, zeus_credits) WHERE bonus_credits IS NULL;

-- 3. Update transfer_credits to block bonus credits from being transferred
CREATE OR REPLACE FUNCTION transfer_credits(
  p_from uuid,
  p_to uuid,
  p_amount integer,
  p_type text DEFAULT 'transfer'
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_balance integer;
  v_bonus integer;
  v_transferable integer;
BEGIN
  SELECT zeus_credits, COALESCE(bonus_credits, 0)
    INTO v_balance, v_bonus
    FROM profiles WHERE id = p_from FOR UPDATE;
  -- Transferable = total - bonus (can't send dead chips)
  v_transferable := GREATEST(0, v_balance - v_bonus);
  IF v_transferable < p_amount THEN
    RETURN json_build_object('ok', false, 'error', 'Insufficient transferable credits');
  END IF;
  UPDATE profiles SET zeus_credits = zeus_credits - p_amount WHERE id = p_from;
  UPDATE profiles SET zeus_credits = zeus_credits + p_amount WHERE id = p_to;
  INSERT INTO credit_transfers (from_user_id, to_user_id, amount, type, loan_status)
  VALUES (p_from, p_to, p_amount, 'transfer', NULL);
  RETURN json_build_object('ok', true);
END;
$$;

-- 4. Update vote_prediction to consume bonus_credits first
CREATE OR REPLACE FUNCTION vote_prediction(
  p_user_id uuid,
  p_prediction_id bigint,
  p_vote text
) RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_balance integer;
  v_bonus integer;
  v_existing text;
BEGIN
  SELECT vote INTO v_existing FROM prediction_votes
    WHERE prediction_id = p_prediction_id AND user_id = p_user_id;
  IF v_existing IS NOT NULL THEN
    RETURN json_build_object('ok', false, 'error', 'Already voted');
  END IF;
  SELECT zeus_credits, COALESCE(bonus_credits, 0)
    INTO v_balance, v_bonus
    FROM profiles WHERE id = p_user_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < 1 THEN
    RETURN json_build_object('ok', false, 'error', 'No credits');
  END IF;
  -- Deduct 1 credit; consume bonus first
  UPDATE profiles SET
    zeus_credits = zeus_credits - 1,
    bonus_credits = CASE WHEN bonus_credits > 0 THEN bonus_credits - 1 ELSE 0 END
  WHERE id = p_user_id;
  INSERT INTO prediction_votes (prediction_id, user_id, vote)
    VALUES (p_prediction_id, p_user_id, p_vote);
  RETURN json_build_object('ok', true);
END;
$$;
