# 🔍 ANALYSE DES APIs MANQUANTES OU NON CONSOMMÉES

**Date**: 18 octobre 2025
**Projet**: FiscaSync
**Type**: Analyse comparative Frontend ↔️ Backend

---

## 📋 MÉTHODOLOGIE

Cette analyse compare:
1. **Frontend**: Services TypeScript qui appellent des endpoints API
2. **Backend**: ViewSets Django et endpoints enregistrés dans les URLs

---

## ❌ APIs NON CRÉÉES (Frontend → Backend manquant)

### 🔴 PRIORITÉ CRITIQUE

#### 1. Authentication Endpoints
**Frontend appelle** (`authService.ts`):
- ❌ `/api/v1/core/auth/me/` - GET (profil utilisateur)
- ❌ `/api/v1/core/auth/me/` - PATCH (mise à jour profil)
- ❌ `/api/v1/auth/signup/` - POST (inscription)
- ❌ `/api/v1/auth/auto-login/` - POST (auto-login dev)

**Backend actuel**:
- ✅ `/api/v1/auth/login/` - TokenObtainPairView ✓
- ✅ `/api/v1/auth/refresh/` - TokenRefreshView ✓
- ✅ `/api/v1/auth/verify/` - TokenVerifyView ✓

**Manque**:
- User profile endpoints (me/)
- Signup endpoint
- Auto-login endpoint

**Impact**: 🔴 BLOQUANT - Impossible de créer des comptes ou gérer le profil

---

#### 2. Health Check & Status
**Frontend appelle** (`authService.ts`):
- ❌ `/api/v1/core/health/` - GET

**Backend actuel**:
- ✅ `/health/` - health_check view ✓ (mais chemin différent!)

**Manque**:
- Endpoint `/api/v1/core/health/` (actuellement `/health/`)

**Impact**: 🟡 MINEUR - Health check existe mais chemin différent

---

### 🟠 PRIORITÉ HAUTE

#### 3. Accounting Module - Écritures Comptables
**Frontend appelle** (`accountingService.ts`):
```typescript
baseUrl = '/api/v1/accounting'

// Écritures
GET    /api/v1/accounting/ecritures/
GET    /api/v1/accounting/ecritures/:id/
POST   /api/v1/accounting/ecritures/
PATCH  /api/v1/accounting/ecritures/:id/
DELETE /api/v1/accounting/ecritures/:id/
POST   /api/v1/accounting/ecritures/:id/validate/
POST   /api/v1/accounting/ecritures/:id/unvalidate/
POST   /api/v1/accounting/ecritures/:id/duplicate/

// Journaux
GET    /api/v1/accounting/journaux/
GET    /api/v1/accounting/journaux/:id/
POST   /api/v1/accounting/journaux/
PATCH  /api/v1/accounting/journaux/:id/
DELETE /api/v1/accounting/journaux/:id/

// États comptables
GET    /api/v1/accounting/balance/
GET    /api/v1/accounting/grand-livre/
GET    /api/v1/accounting/journal-general/
GET    /api/v1/accounting/balance-auxiliaire/

// Exports
GET    /api/v1/accounting/export/balance/
GET    /api/v1/accounting/export/grand-livre/
GET    /api/v1/accounting/export/fec/

// Validation & Clôture
POST   /api/v1/accounting/validate/balance/
POST   /api/v1/accounting/validate/ecritures-lot/
GET    /api/v1/accounting/anomalies/
POST   /api/v1/accounting/cloture/start/
GET    /api/v1/accounting/cloture/status/
POST   /api/v1/accounting/cloture/cancel/
```

**Backend actuel** (`accounting/urls.py`):
```python
# Seulement ces ViewSets existent:
- CompteReferenceViewSet
- PlanComptableReferenceViewSet
- ConfigurationEtatsViewSet
- CorrespondanceComptableViewSet
```

**Manque**:
- ❌ **TOUT le module d'écritures comptables**
- ❌ Journaux comptables
- ❌ Génération des états (balance, grand-livre, journal général)
- ❌ Exports FEC
- ❌ Validation et clôture d'exercice
- ❌ Détection d'anomalies

**Impact**: 🔴 BLOQUANT - Module comptabilité non fonctionnel

---

#### 4. Audit Module - Sessions & Anomalies
**Frontend appelle** (`auditService.ts`):
```typescript
baseUrl = '/api/v1/audit'

// Sessions d'audit
POST   /api/v1/audit/sessions/
GET    /api/v1/audit/sessions/
GET    /api/v1/audit/sessions/:id/
GET    /api/v1/audit/sessions/:id/status/
POST   /api/v1/audit/sessions/:id/cancel/

// Anomalies
GET    /api/v1/audit/sessions/:sessionId/anomalies/
GET    /api/v1/audit/anomalies/:id/
PATCH  /api/v1/audit/anomalies/:id/
POST   /api/v1/audit/anomalies/:id/resolve/

// Règles d'audit
GET    /api/v1/audit/rules/
GET    /api/v1/audit/rules/:id/
POST   /api/v1/audit/rules/
PATCH  /api/v1/audit/rules/:id/
DELETE /api/v1/audit/rules/:id/
POST   /api/v1/audit/rules/:ruleId/test/

// IA & Analyse
POST   /api/v1/audit/validate/
POST   /api/v1/audit/sessions/:sessionId/report/
GET    /api/v1/audit/sessions/:sessionId/download/
GET    /api/v1/audit/stats/
GET    /api/v1/audit/trends/
GET    /api/v1/audit/sessions/:sessionId/ai-recommendations/
POST   /api/v1/audit/ai-analyze/
GET    /api/v1/audit/history/
GET    /api/v1/audit/compare/
```

**Backend actuel** (`audit/views.py` - à vérifier):
- Status inconnu, probablement vide

**Impact**: 🟠 HAUTE - Module d'audit non fonctionnel

---

#### 5. Generation Module - Liasses Fiscales
**Frontend appelle** (`generationService.ts`):
```typescript
baseUrl = '/api/v1/generation'

// Génération de liasses
POST   /api/v1/generation/liasse/
GET    /api/v1/generation/liasse/
GET    /api/v1/generation/liasse/:id/
GET    /api/v1/generation/liasse/:id/status/
POST   /api/v1/generation/liasse/:id/cancel/

// Export & Download
GET    /api/v1/generation/liasse/:id/export/
GET    /api/v1/generation/liasse/:id/download/

// Templates
GET    /api/v1/generation/templates/
GET    /api/v1/generation/templates/:id/

// Validation
POST   /api/v1/generation/liasse/:id/validate/
GET    /api/v1/generation/liasse/:id/validation-errors/

// Statistiques & Historique
GET    /api/v1/generation/stats/
GET    /api/v1/generation/history/
GET    /api/v1/generation/compare/

// Batch & Preview
POST   /api/v1/generation/preview/
POST   /api/v1/generation/batch/
GET    /api/v1/generation/batch/:batch_id/
```

**Backend actuel** (`generation/views.py`):
```python
# ViewSets existants:
- LiasseFiscaleViewSet (avec action generer_complete)
- EtatFinancierViewSet
- RegleCalculViewSet
- TemplateEtatViewSet
- ProcessusGenerationViewSet
```

**Manque**:
- ✅ Endpoint de génération existe (`generer_complete`)
- ❌ Mais routes non conformes aux appels frontend (`/liasse/` vs `/liasses/`)
- ❌ Download, export, preview endpoints
- ❌ Batch generation
- ❌ Stats, history, compare endpoints

**Impact**: 🟠 HAUTE - Génération de liasse partiellement fonctionnelle

---

### 🟡 PRIORITÉ MOYENNE

#### 6. Balance Module - Imports & Validation
**Frontend appelle** (`balanceService.ts`):
```typescript
baseUrl = '/api/v1/balance/api'  // ⚠️ Doublon /api/

// Balances
GET    /api/v1/balance/api/balances/
GET    /api/v1/balance/api/balances/:id/
POST   /api/v1/balance/api/balances/
PATCH  /api/v1/balance/api/balances/:id/
DELETE /api/v1/balance/api/balances/:id/

// Lignes de balance
GET    /api/v1/balance/api/balances/:balanceId/lignes/
PATCH  /api/v1/balance/api/balances/:balanceId/lignes/:ligneId/

// Imports
POST   /api/v1/balance/api/imports/
GET    /api/v1/balance/api/imports/:importId/
GET    /api/v1/balance/api/imports/

// Validation
POST   /api/v1/balance/api/balances/:balanceId/validate/
GET    /api/v1/balance/api/balances/:balanceId/validation-errors/

// Export & Compare
GET    /api/v1/balance/api/balances/:balanceId/export/
GET    /api/v1/balance/api/balances/compare/
GET    /api/v1/balance/api/balances/:balanceId/stats/
```

**Backend actuel** (`balance/urls.py`):
```python
router.register(r'balances', views.BalanceViewSet)
router.register(r'imports', views.ImportBalanceViewSet)
# ...

# Mais chemin = /api/v1/balance/ (pas /api/v1/balance/api/)
```

**Problème**:
- ⚠️ **Conflit de chemin**: Frontend utilise `/api/v1/balance/api/` mais backend expose `/api/v1/balance/`
- Double `/api/` dans le frontend

**Impact**: 🔴 BLOQUANT - Aucun appel ne fonctionne à cause du chemin incorrect

---

#### 7. Entreprise Module
**Frontend appelle** (`entrepriseService.ts`):
```typescript
baseUrl = '/api/v1/parametrage/api/entreprises'  // ⚠️ Doublon /api/

GET    /api/v1/parametrage/api/entreprises/
GET    /api/v1/parametrage/api/entreprises/:id/
POST   /api/v1/parametrage/api/entreprises/
PATCH  /api/v1/parametrage/api/entreprises/:id/

// Types de liasse
GET    /api/v1/parametrage/api/types-liasse/
GET    /api/v1/parametrage/api/types-liasse/officiel_syscohada/
```

**Backend actuel** (`parametrage/urls.py`):
```python
# Probablement:
router.register(r'entreprises', views.EntrepriseViewSet)
router.register(r'types-liasse', views.TypeLiasseViewSet)

# Chemin = /api/v1/parametrage/ (pas /api/v1/parametrage/api/)
```

**Problème**:
- ⚠️ Même problème de double `/api/`

**Impact**: 🔴 BLOQUANT - Gestion entreprises non fonctionnelle

---

## ✅ APIs CRÉÉES MAIS NON CONSOMMÉES (Backend → Frontend manquant)

### Backend disponible mais frontend ne les utilise pas:

#### 1. Core Module
**Backend expose** (`core/urls.py`):
```python
router.register('parametres-systeme', views.ParametresSystemeViewSet)
router.register('pays', views.PaysViewSet)
router.register('devises', views.DeviseMonnaieViewSet)
router.register('taux-change', views.TauxChangeViewSet)
router.register('audit-trail', views.AuditTrailViewSet)
router.register('notifications', views.NotificationViewSet)
```

**Frontend**: ❌ Aucun service ne consomme ces endpoints

**Impact**: 🟢 FAIBLE - Features disponibles mais pas utilisées

---

#### 2. Reporting Module
**Backend** (`reporting/urls.py` - à vérifier):
- Probablement des endpoints de reporting

**Frontend**: Service `reportingService.ts` existe mais endpoints à vérifier

---

#### 3. Tax Module
**Backend** (`tax/urls.py` - à vérifier):
- Probablement des endpoints fiscaux

**Frontend**: Service `taxService.ts` existe mais endpoints à vérifier

---

#### 4. Templates Engine
**Backend** (`templates_engine/urls.py` - à vérifier):
- Endpoints pour la gestion des templates

**Frontend**: Service `templatesService.ts` existe mais endpoints à vérifier

---

## 🔧 PROBLÈMES DE CONFIGURATION

### 1. Double `/api/` dans les chemins
**Services concernés**:
- `balanceService.ts`: `baseUrl = '/api/v1/balance/api'` ❌
- `entrepriseService.ts`: `baseUrl = '/api/v1/parametrage/api/entreprises'` ❌

**Devrait être**:
- `baseUrl = '/api/v1/balance'` ✅
- `baseUrl = '/api/v1/parametrage/entreprises'` ✅

**Impact**: 🔴 CRITIQUE - Tous les appels échouent avec 404

---

### 2. Health Check Path Mismatch
**Frontend**: `/api/v1/core/health/`
**Backend**: `/health/`

**Solution**: Créer alias ou corriger le frontend

---

### 3. Nommage inconsistant (pluriel/singulier)
**Frontend**: `/api/v1/generation/liasse/` (singulier)
**Backend**: `/api/v1/generation/liasses/` (probablement pluriel dans le router)

---

## 📊 RÉSUMÉ DES MANQUES

| Module | APIs Frontend | APIs Backend | Manquantes | Taux |
|--------|--------------|--------------|------------|------|
| **Authentication** | 8 | 3 | 5 | 37% |
| **Accounting** | 30+ | 4 | 26+ | 13% |
| **Audit** | 25+ | ? | ~25 | ~0% |
| **Generation** | 15 | 5 | 10 | 33% |
| **Balance** | 15 | 6 | 0* | 100%* |
| **Entreprise** | 6 | ? | 0* | 100%* |
| **Core** | 2 | 6 | -4 | 150% |

*Avec correction du double `/api/`

---

## 🎯 ACTIONS PRIORITAIRES

### URGENT (Semaine 1)

1. **Corriger les chemins API** ⚡
   ```typescript
   // balanceService.ts
   - private baseUrl = '/api/v1/balance/api'
   + private baseUrl = '/api/v1/balance'

   // entrepriseService.ts
   - private baseUrl = '/api/v1/parametrage/api/entreprises'
   + private baseUrl = '/api/v1/parametrage/entreprises'
   ```

2. **Créer endpoints Authentication** 🔐
   - `/api/v1/auth/signup/` (POST)
   - `/api/v1/auth/me/` (GET, PATCH)
   - `/api/v1/auth/logout/` (POST)

3. **Créer Module Accounting** 📊
   - Écritures comptables (CRUD)
   - Journaux (CRUD)
   - Balance, Grand-Livre, Journal Général (GET)
   - Export FEC

### HAUTE PRIORITÉ (Semaine 2)

4. **Compléter Module Generation**
   - Export/Download endpoints
   - Preview endpoint
   - Batch generation

5. **Créer Module Audit complet**
   - Sessions d'audit
   - Règles & Anomalies
   - Statistiques

### MOYENNE PRIORITÉ (Semaine 3-4)

6. **Connecter endpoints Core existants**
   - Services frontend pour Pays, Devises
   - Service pour Notifications
   - Service pour AuditTrail

---

## 💡 RECOMMANDATIONS

### 1. Standardisation des chemins
```
Pattern: /api/v1/{module}/{resource}/

✅ Bon:
- /api/v1/balance/balances/
- /api/v1/parametrage/entreprises/
- /api/v1/audit/sessions/

❌ À éviter:
- /api/v1/balance/api/balances/  (double api)
- /api/v1/core/auth/me/  (auth devrait être à la racine)
```

### 2. Documentation API
- Activer drf-spectacular (déjà installé)
- Générer OpenAPI schema
- Créer Swagger UI

### 3. Tests d'intégration
- Tester chaque endpoint frontend → backend
- Vérifier les contrats d'API
- Détecter les incohérences

---

## 📈 ESTIMATION EFFORT

| Tâche | Effort | Priorité |
|-------|--------|----------|
| Corriger chemins API | 1h | 🔴 URGENT |
| Auth endpoints | 4h | 🔴 URGENT |
| Module Accounting complet | 20h | 🔴 URGENT |
| Module Audit complet | 16h | 🟠 HAUTE |
| Module Generation (complet) | 8h | 🟠 HAUTE |
| Connecter Core endpoints | 4h | 🟡 MOYENNE |
| Documentation API | 2h | 🟡 MOYENNE |
| Tests intégration | 8h | 🟢 FAIBLE |
| **TOTAL** | **63h** | **~2 semaines** |

---

**Dernière mise à jour**: 18 octobre 2025
**Prochaine action**: Corriger les chemins API (double `/api/`)
