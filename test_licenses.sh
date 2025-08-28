#!/bin/bash
API_URL="https://api-chantiersync-production.up.railway.app/api/licenses"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMyNWYyNTM4LWY0ZGYtNDljYi04YjBiLThlZWFiMmNlNjJkZSIsInJvbGUiOiJTVVBFUkFETUlOIiwiaWF0IjoxNzU2MzU0MDA3LCJleHAiOjE3NTY0NDA0MDd9.TXLMwfMo0muq8MGH3aTFVXHEYcqgzSaPUiAns4DsdT4"

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # reset

# Helper pour afficher en tableau
pretty_table() {
  jq -r '
    (["ID","Type","Status","Max Users"] | (., map(length*"-"))),
    (.[] | [.id, .type, .status, (.max_users|tostring)])
    | @tsv' | column -t
}

check_success() {
  if echo "$1" | jq -e .id >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Succès${NC}"
  else
    echo -e "${RED}❌ Erreur${NC}"
  fi
}

echo -e "${YELLOW}🔍 Test GET all licenses${NC}"
ALL=$(curl -s -X GET $API_URL -H "Authorization: Bearer $TOKEN")
echo "$ALL" | pretty_table
echo "$ALL" | jq
echo -e "\n---"

LICENSE_ID=$(echo "$ALL" | jq -r '.[0].id')

echo -e "${YELLOW}🔍 Test GET license by ID ($LICENSE_ID)${NC}"
ONE=$(curl -s -X GET $API_URL/$LICENSE_ID -H "Authorization: Bearer $TOKEN")
echo "$ONE" | jq
check_success "$ONE"
echo -e "\n---"

echo -e "${YELLOW}➕ Test CREATE license${NC}"
CREATE=$(curl -s -X POST $API_URL \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"enterprise_id":"a77c6345-c79d-4c31-a1b1-2459e8178c05","type":"ANNUAL","start_date":"2025-09-01","end_date":"2026-09-01","max_users":150,"status":"active"}')
echo "$CREATE" | jq
check_success "$CREATE"
NEW_ID=$(echo "$CREATE" | jq -r '.id')
echo "👉 New license ID: $NEW_ID"
echo -e "\n---"

echo -e "${YELLOW}✏️ Test UPDATE license ($NEW_ID)${NC}"
UPDATE=$(curl -s -X PUT $API_URL/$NEW_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"max_users":200,"status":"suspended"}')
echo "$UPDATE" | jq
check_success "$UPDATE"
echo -e "\n---"

echo -e "${YELLOW}🗑️ Test DELETE license ($NEW_ID)${NC}"
DELETE=$(curl -s -X DELETE $API_URL/$NEW_ID -H "Authorization: Bearer $TOKEN")
echo "$DELETE" | jq
if echo "$DELETE" | grep -q "succès"; then
  echo -e "${GREEN}✅ License supprimée avec succès${NC}"
else
  echo -e "${RED}❌ Suppression échouée${NC}"
fi
echo -e "\n---"

echo -e "${GREEN}🎉 Tests terminés.${NC}"
