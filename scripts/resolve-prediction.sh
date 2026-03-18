#!/bin/bash
# Resolve a prediction and distribute Zeus Credits
# Usage: ./resolve-prediction.sh <prediction_id> <status> [resolved_note]
# Status: hit | miss | partial
# Example: ./resolve-prediction.sh 1 hit "Oil stayed above $85 through May"

PRED_ID=$1
STATUS=$2
NOTE=$3
SUPA_URL="https://ruuksrwlgsenkkkkapbu.supabase.co"
SUPA_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dWtzcndsZ3Nlbmtra2thcGJ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNzcyOSwiZXhwIjoyMDg4ODAzNzI5fQ.GQMJ4NBQkcckF6HL96sFn1DCeZ-2dPXim98K_h82vds"
AUTH="-H \"apikey: $SUPA_KEY\" -H \"Authorization: Bearer $SUPA_KEY\" -H \"Content-Type: application/json\""

if [ -z "$PRED_ID" ] || [ -z "$STATUS" ]; then
  echo "Usage: ./resolve-prediction.sh <prediction_id> <hit|miss|partial> [note]"
  exit 1
fi

if [ "$STATUS" != "hit" ] && [ "$STATUS" != "miss" ] && [ "$STATUS" != "partial" ]; then
  echo "Error: status must be hit, miss, or partial"
  exit 1
fi

echo "=== Resolving prediction #$PRED_ID as $STATUS ==="

# 1. Update prediction status
echo "{\"status\":\"$STATUS\",\"resolved_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"resolved_note\":\"$NOTE\"}" > /tmp/pred_resolve.json
curl -s -X PATCH "$SUPA_URL/rest/v1/predictions?id=eq.$PRED_ID" \
  -H "apikey: $SUPA_KEY" -H "Authorization: Bearer $SUPA_KEY" -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d @/tmp/pred_resolve.json
echo ""

# 2. Get all votes for this prediction
echo "=== Fetching votes ==="
VOTES=$(curl -s "$SUPA_URL/rest/v1/prediction_votes?prediction_id=eq.$PRED_ID&select=user_id,vote" \
  -H "apikey: $SUPA_KEY" -H "Authorization: Bearer $SUPA_KEY")
echo "$VOTES"

# 3. Determine winning vote
if [ "$STATUS" = "hit" ]; then
  WINNING_VOTE="agree"
  CREDITS=3
elif [ "$STATUS" = "miss" ]; then
  WINNING_VOTE="disagree"
  CREDITS=3
else
  # partial: everyone who voted gets 1
  WINNING_VOTE="both"
  CREDITS=1
fi

echo "=== Distributing credits (winning vote: $WINNING_VOTE, amount: $CREDITS) ==="

# 4. Extract user IDs and distribute credits
echo "$VOTES" | grep -o '"user_id":"[^"]*"' | while read -r line; do
  USER_ID=$(echo "$line" | grep -o '"user_id":"[^"]*"' | cut -d'"' -f4)
  USER_VOTE=$(echo "$VOTES" | grep -o "{[^}]*\"user_id\":\"$USER_ID\"[^}]*}" | grep -o '"vote":"[^"]*"' | cut -d'"' -f4)

  if [ "$WINNING_VOTE" = "both" ] || [ "$USER_VOTE" = "$WINNING_VOTE" ]; then
    echo "  +$CREDITS credits -> $USER_ID (voted $USER_VOTE)"
    # Get current credits
    CURRENT=$(curl -s "$SUPA_URL/rest/v1/profiles?id=eq.$USER_ID&select=zeus_credits" \
      -H "apikey: $SUPA_KEY" -H "Authorization: Bearer $SUPA_KEY" | grep -o '"zeus_credits":[0-9]*' | cut -d: -f2)
    CURRENT=${CURRENT:-0}
    NEW=$((CURRENT + CREDITS))
    # Update
    echo "{\"zeus_credits\":$NEW}" > /tmp/credit_update.json
    curl -s -X PATCH "$SUPA_URL/rest/v1/profiles?id=eq.$USER_ID" \
      -H "apikey: $SUPA_KEY" -H "Authorization: Bearer $SUPA_KEY" -H "Content-Type: application/json" \
      -d @/tmp/credit_update.json > /dev/null
    echo "    Updated: $CURRENT -> $NEW"
  else
    echo "  0 credits -> $USER_ID (voted $USER_VOTE, wrong)"
  fi
done

echo "=== Done ==="
