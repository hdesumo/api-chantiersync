#!/bin/bash
API_URL="https://api-chantiersync-production.up.railway.app/api/licenses"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMyNWYyNTM4LWY0ZGYtNDljYi04YjBiLThlZWFiMmNlNjJkZSIsInJvbGUiOiJTVVBFUkFETUlOIiwiaWF0IjoxNzU2MzU0MDA3LCJleHAiOjE3NTY0NDA0MDd9.TXLMwfMo0muq8MGH3aTFVXHEYcqgzSaPUiAns4DsdT4"

echo "============================="
echo "   🔍 TEST CRUD LICENSES"
echo "============================="

# Fonction utilitaire
test_api() {
  description=$1
  method=$2
  url=$3
  data=$4

  echo -e "\n--- $description ---"
  
  if [ "$method" == "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
      -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
  elif [ "$method" == "POST" ]; then
    response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
      -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
      -d "$data")
  elif [ "$method" == "PUT" ]; then
    response=$(curl -s -w "\n%{http_code}" -X PUT "$url" \
      -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
      -d "$data")
  elif [ "$method" == "DELETE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$url" \
      -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
  fi

  body=$(echo "$response" | head -n -1)
  status=$(echo "$response" | tail -n1)

  echo "Status: $status"
  echo "Body: $body"

  if [[ "$status" =~ ^2 ]]; then
    echo "✅ $description réussi"
  else
    echo "❌ $description échoué"
  fi

  echo "$body"
}

# 1. GET all licenses
test_api "GET all licenses" GET "$API_URL"

# Récupère un ID existant
LICENSE_ID=$(curl -s -X GET "$API_URL" -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

# 2. GET license by ID
test_api "GET license by ID" GET "$API_URL/$LICENSE_ID"

# 3. CREATE license
NEW_LICENSE=$(test_api "CREATE license" POST "$API_URL" '{"enterprise_id":"a77c6345-c79d-4c31-a1b1-2459e8178c05","type":"ANNUAL","start_date":"2025-09-01T00:00:00.000Z","end_date":"2026-09-01T00:00:00.000Z","max_users":120,"status":"active"}')
NEW_LICENSE_ID=$(echo "$NEW_LICENSE" | jq -r '.id')

# 4. UPDATE license
test_api "UPDATE license" PUT "$API_URL/$NEW_LICENSE_ID" '{"max_users":200,"status":"suspended"}'

# 5. DELETE license
test_api "DELETE license" DELETE "$API_URL/$NEW_LICENSE_ID"

echo -e "\n============================="
echo "   ✅ FIN DES TESTS CRUD"
echo "============================="


