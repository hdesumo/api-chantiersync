#!/bin/bash

API="https://api-chantiersync-production.up.railway.app/api/licenses"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMyNWYyNTM4LWY0ZGYtNDljYi04YjBiLThlZWFiMmNlNjJkZSIsInJvbGUiOiJTVVBFUkFETUlOIiwiaWF0IjoxNzU2MzU0MDA3LCJleHAiOjE3NTY0NDA0MDd9.TXLMwfMo0muq8MGH3aTFVXHEYcqgzSaPUiAns4DsdT4"

echo "============================="
echo "   🔍 TEST CRUD LICENSES"
echo "============================="

# --- GET ALL
echo -e "\n--- GET all licenses ---"
curl -s -w "\nStatus: %{http_code}\n" -H "Authorization: Bearer $TOKEN" "$API"

# --- CREATE
echo -e "\n--- CREATE new license ---"
CREATE_BODY=$(curl -s -X POST "$API" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "enterprise_id": "a77c6345-c79d-4c31-a1b1-2459e8178c05",
        "type": "ANNUAL",
        "start_date": "2025-09-01T00:00:00.000Z",
        "end_date": "2026-09-01T00:00:00.000Z",
        "max_users": 120,
        "status": "active"
      }')

echo "Body: $CREATE_BODY"
NEW_ID=$(echo "$CREATE_BODY" | jq -r '.id')
echo "👉 New license ID: $NEW_ID"

# --- GET BY ID
echo -e "\n--- GET license by ID ($NEW_ID) ---"
curl -s -w "\nStatus: %{http_code}\n" -H "Authorization: Bearer $TOKEN" "$API/$NEW_ID"

# --- UPDATE
echo -e "\n--- UPDATE license ($NEW_ID) ---"
curl -s -w "\nStatus: %{http_code}\n" -X PUT "$API/$NEW_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
        "max_users": 200,
        "status": "suspended"
      }'

# --- DELETE
echo -e "\n--- DELETE license ($NEW_ID) ---"
curl -s -w "\nStatus: %{http_code}\n" -X DELETE "$API/$NEW_ID" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n============================="
echo "   ✅ FIN DES TESTS CRUD"
echo "============================="

