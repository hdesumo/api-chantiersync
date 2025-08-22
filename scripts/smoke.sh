#!/usr/bin/env bash
set -euo pipefail
API="${API:-https://api.chantiersync.com}"
EMAIL="${EMAIL:-admin@demo.local}"
PASS="${PASS:-admin123}"

echo "== Health =="
curl -sSI "$API/" | head -n1
curl -sSI "$API/status" | head -n1

echo "== Login =="
LOGIN_JSON=$(curl -sS -X POST "$API/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
echo "$LOGIN_JSON" | jq . || echo "$LOGIN_JSON"
TOKEN=$(echo "$LOGIN_JSON" | jq -r '.token')

echo "== Debug auth =="
curl -sS -H "Authorization: Bearer $TOKEN" "$API/debug/ping-auth" | jq .

echo "== Sites =="
curl -sS -H "Authorization: Bearer $TOKEN" "$API/api/sites?limit=5" | jq .

echo "== Reports =="
curl -sS -H "Authorization: Bearer $TOKEN" "$API/api/reports?limit=5" | jq .

