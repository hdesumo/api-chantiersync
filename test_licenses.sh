
#!/bin/bash

# ==========================================
# Tests CRUD API ChantierSync - Licenses
# ==========================================

# ⚠️ Remplace par ton vrai token SUPERADMIN
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMyNWYyNTM4LWY0ZGYtNDljYi04YjBiLThlZWFiMmNlNjJkZSIsInJvbGUiOiJTVVBFUkFETUlOIiwiaWF0IjoxNzU2MzU0MDA3LCJleHAiOjE3NTY0NDA0MDd9.TXLMwfMo0muq8MGH3aTFVXHEYcqgzSaPUiAns4DsdT4"
# ⚠️ URL de base
BASE_URL="https://api.chantiersync.com/api/licenses"

# Exemple d’UUID existant (remplace si besoin)
EXISTING_ID="76acaada-0ff9-46b1-8a99-45dba941d3c6"

echo "🔍 Test GET all licenses"
curl -s -X GET $BASE_URL \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n---\n"

echo "🔍 Test GET license by ID ($EXISTING_ID)"
curl -s -X GET $BASE_URL/$EXISTING_ID \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n---\n"

echo "➕ Test CREATE license"
NEW_LICENSE=$(curl -s -X POST $BASE_URL \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enterprise_id": "a77c6345-c79d-4c31-a1b1-2459e8178c05",
    "type": "ANNUAL",
    "start_date": "2025-09-01T00:00:00.000Z",
    "end_date": "2026-09-01T00:00:00.000Z",
    "max_users": 150,
    "status": "active"
  }' | jq)
echo $NEW_LICENSE
NEW_ID=$(echo $NEW_LICENSE | jq -r '.id')
echo "👉 New license ID: $NEW_ID"
echo -e "\n---\n"

echo "✏️ Test UPDATE license ($NEW_ID)"
curl -s -X PUT $BASE_URL/$NEW_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"max_users":200,"status":"suspended"}' | jq
echo -e "\n---\n"

echo "🗑️ Test DELETE license ($NEW_ID)"
curl -s -X DELETE $BASE_URL/$NEW_ID \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n---\n"

echo "✅ Tests terminés."

