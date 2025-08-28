#!/bin/bash

# ===============================
# Script de test CRUD Licenses
# ===============================

API_URL="https://api-chantiersync-production.up.railway.app/api/licenses"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMyNWYyNTM4LWY0ZGYtNDljYi04YjBiLThlZWFiMmNlNjJkZSIsInJvbGUiOiJTVVBFUkFETUlOIiwiaWF0IjoxNzU2MzU0MDA3LCJleHAiOjE3NTY0NDA0MDd9.TXLMwfMo0muq8MGH3aTFVXHEYcqgzSaPUiAns4DsdT4"

echo "🔍 Test GET all licenses"
curl -s -X GET $API_URL \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n-e \n---\n"

# ID de test à récupérer (prend le premier trouvé)
LICENSE_ID=$(curl -s -X GET $API_URL \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

echo "🔍 Test GET license by ID ($LICENSE_ID)"
curl -s -X GET $API_URL/$LICENSE_ID \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n-e \n---\n"

echo "➕ Test CREATE license"
NEW_LICENSE=$(curl -s -X POST $API_URL \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enterprise_id": "a77c6345-c79d-4c31-a1b1-2459e8178c05",
    "type": "ANNUAL",
    "start_date": "2025-09-01T00:00:00.000Z",
    "end_date": "2026-09-01T00:00:00.000Z",
    "max_users": 150,
    "status": "active"
  }')
echo $NEW_LICENSE | jq
NEW_ID=$(echo $NEW_LICENSE | jq -r '.id')
echo "👉 New license ID: $NEW_ID"
echo -e "\n-e \n---\n"

echo "✏️ Test UPDATE license ($NEW_ID)"
curl -s -X PUT $API_URL/$NEW_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "max_users": 200,
    "status": "suspended"
  }' | jq
echo -e "\n-e \n---\n"

echo "🗑️ Test DELETE license ($NEW_ID)"
curl -s -X DELETE $API_URL/$NEW_ID \
  -H "Authorization: Bearer $TOKEN" | jq
echo -e "\n-e \n---\n"

echo "✅ Tests terminés."

