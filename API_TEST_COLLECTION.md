# 🧪 FiscaSync - Collection de Tests API

## 🔑 Authentication

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!"
  }'
```

### Register
```bash
curl -X POST http://localhost:8000/api/v1/core/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@test.com",
    "password": "Test123!",
    "password_confirm": "Test123!",
    "first_name": "New",
    "last_name": "User"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/v1/auth/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

## 📊 Core API

### Health Check
```bash
# Simple health check
curl http://localhost:8000/api/v1/core/health/

# Detailed health check
curl http://localhost:8000/api/v1/core/status/
```

### Current User
```bash
curl http://localhost:8000/api/v1/core/auth/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📁 Paramètres Système

### List Parameters
```bash
curl http://localhost:8000/api/v1/core/api/parametres-systeme/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get Parameter by Key
```bash
curl http://localhost:8000/api/v1/core/api/parametres-systeme/by_key/?cle=TAUX_TVA \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🌍 Référentiels

### List Countries
```bash
curl http://localhost:8000/api/v1/core/api/pays/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### OHADA Countries
```bash
curl http://localhost:8000/api/v1/core/api/pays/ohada/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Currencies
```bash
curl http://localhost:8000/api/v1/core/api/devises/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Exchange Rates
```bash
# Current rates
curl http://localhost:8000/api/v1/core/api/taux-change/current_rates/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create new rate
curl -X POST http://localhost:8000/api/v1/core/api/taux-change/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "devise_base": 1,
    "devise_cible": 2,
    "taux": 655.957,
    "date_application": "2025-01-01",
    "source": "BCEAO"
  }'
```

## 🔔 Notifications

### List User Notifications
```bash
curl http://localhost:8000/api/v1/core/api/notifications/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Unread Count
```bash
curl http://localhost:8000/api/v1/core/api/notifications/unread_count/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Mark as Read
```bash
curl -X POST http://localhost:8000/api/v1/core/api/notifications/{id}/mark_read/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📝 Audit Trail

### List Audit Logs
```bash
curl http://localhost:8000/api/v1/core/api/audit-trail/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Filter by User
```bash
curl "http://localhost:8000/api/v1/core/api/audit-trail/?utilisateur=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Filter by Action
```bash
curl "http://localhost:8000/api/v1/core/api/audit-trail/?action=CREATE" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🧮 Balance & Accounting

### Import Balance
```bash
curl -X POST http://localhost:8000/api/v1/balance/import/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@balance.xlsx" \
  -F "entreprise_id=1" \
  -F "exercice=2024"
```

### Get Balance
```bash
curl http://localhost:8000/api/v1/balance/entreprise/1/exercice/2024/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📊 Liasse Generation

### Generate Liasse
```bash
curl -X POST http://localhost:8000/api/v1/generation/liasse/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise_id": 1,
    "exercice": 2024,
    "type_liasse": "SYSCOHADA"
  }'
```

### Export to Excel
```bash
curl -X GET "http://localhost:8000/api/v1/generation/export/excel/?liasse_id=1" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -o liasse_2024.xlsx
```

## 🤖 AI Audit

### Run AI Audit
```bash
curl -X POST http://localhost:8000/api/v1/audit/ai/analyze/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "liasse_id": 1,
    "type_audit": "COHERENCE",
    "niveau": "APPROFONDI"
  }'
```

### Get Audit Results
```bash
curl http://localhost:8000/api/v1/audit/results/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📈 Reporting

### Dashboard Stats
```bash
curl http://localhost:8000/api/v1/reporting/dashboard/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Generate Report
```bash
curl -X POST http://localhost:8000/api/v1/reporting/generate/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "FINANCIAL_SUMMARY",
    "entreprise_id": 1,
    "exercice": 2024,
    "format": "PDF"
  }'
```

## 🔧 Batch Operations

### Bulk Import
```bash
curl -X POST http://localhost:8000/api/v1/batch/import/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "files[]=@company1.xlsx" \
  -F "files[]=@company2.xlsx" \
  -F "mode=PARALLEL"
```

### Batch Status
```bash
curl http://localhost:8000/api/v1/batch/status/{batch_id}/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📝 Variables d'environnement pour les tests

Créez un fichier `.env.test`:
```bash
# API Base URL
API_URL=http://localhost:8000

# Test User Credentials
TEST_USER=admin
TEST_PASS=Admin123!

# Test Company
TEST_COMPANY_ID=1
TEST_EXERCISE=2024

# JWT Token (à mettre à jour après login)
ACCESS_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
REFRESH_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## 🚀 Script de test automatisé

```bash
#!/bin/bash
# test_api.sh

source .env.test

# Login and save token
RESPONSE=$(curl -s -X POST $API_URL/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USER\",\"password\":\"$TEST_PASS\"}")

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.data.access')
echo "Token: $ACCESS_TOKEN"

# Test health check
echo "Testing Health Check..."
curl -s $API_URL/api/v1/core/health/ | jq '.'

# Test authenticated endpoint
echo "Testing User Info..."
curl -s $API_URL/api/v1/core/auth/me/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'

echo "All tests completed!"
```

---
**Version:** 1.0.0 | **Date:** 18/09/2025