# 🧪 GUIDE DE TEST - INTÉGRATION FRONTEND/BACKEND FISCASYNC

**Date**: 19 octobre 2025
**Objectif**: Tester l'intégration complète des modules TAX et ACCOUNTING

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Démarrer le Backend Django

```bash
cd backend
python manage.py runserver 8000
```

✅ **Vérification**: Serveur démarre sur `http://localhost:8000`

### 2. Démarrer le Frontend React

```bash
cd frontend
npm run dev
```

✅ **Vérification**: Frontend démarre sur `http://localhost:5173`

---

## 🔐 ÉTAPE 1: AUTHENTIFICATION

### Auto-Login (Mode Développement)

```bash
curl -X POST http://localhost:8000/api/v1/auth/auto-login/ \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Réponse attendue**:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@fiscasync.com"
  }
}
```

### Exporter le Token

```bash
# Linux/Mac
export TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Windows (PowerShell)
$env:TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

# Windows (CMD)
set TOKEN=eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## 🧪 ÉTAPE 2: TESTS MODULE TAX

### Test 1: Liste des Impôts

```bash
curl -X GET "http://localhost:8000/api/v1/tax/impots/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Attendu**: Liste vide `[]` ou liste d'impôts

### Test 2: Créer un Impôt (IS Côte d'Ivoire)

```bash
curl -X POST "http://localhost:8000/api/v1/tax/impots/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "IS_CI",
    "libelle": "Impôt sur les Sociétés - Côte d'\''Ivoire",
    "type_impot": "IS",
    "pays": "PAYS_CI_UUID",
    "taux_normal": 25.00,
    "base_calcul": "BENEFICE",
    "periodicite": "ANNUELLE",
    "date_limite_declaration": "30 avril année N+1",
    "date_limite_paiement": "30 avril année N+1",
    "is_actif": true
  }'
```

**Attendu**: Impôt créé avec ID

### Test 3: Liste des Régimes Fiscaux

```bash
curl -X GET "http://localhost:8000/api/v1/tax/regimes/" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Liste des régimes fiscaux

### Test 4: Régime Fiscal Optimal

```bash
curl -X POST "http://localhost:8000/api/v1/tax/regimes/optimal/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pays": "CI",
    "chiffre_affaires": 50000000,
    "secteur": "Commerce"
  }'
```

**Attendu**: Régime fiscal recommandé

### Test 5: Calcul IS

```bash
curl -X POST "http://localhost:8000/api/v1/tax/calcul/is/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise_id": "ENTREPRISE_UUID",
    "exercice_id": "EXERCICE_UUID",
    "benefice_comptable": 10000000,
    "charges_non_deductibles": 500000,
    "charges_deductibles": 200000,
    "provisions_non_deductibles": 100000,
    "abattements_appliques": []
  }'
```

**Attendu**:
```json
{
  "base_imposable": 10400000,
  "taux_applique": 25.00,
  "montant_impot": 2600000,
  "details_calcul": [...]
}
```

### Test 6: Calcul TVA

```bash
curl -X POST "http://localhost:8000/api/v1/tax/calcul/tva/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise_id": "ENTREPRISE_UUID",
    "periode": "2025-10",
    "tva_collectee": 5000000,
    "tva_deductible": 3000000,
    "credit_tva_anterieur": 0
  }'
```

**Attendu**:
```json
{
  "tva_due": 2000000,
  "tva_a_payer": 2000000,
  "credit_reportable": 0
}
```

### Test 7: Calendrier des Obligations

```bash
curl -X GET "http://localhost:8000/api/v1/tax/obligations/calendar/?mois=10&annee=2025" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Liste des obligations fiscales du mois

### Test 8: Prochaines Échéances

```bash
curl -X GET "http://localhost:8000/api/v1/tax/obligations/echeances/?jours=30" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Obligations à venir dans les 30 prochains jours

### Test 9: Statistiques Fiscales

```bash
curl -X GET "http://localhost:8000/api/v1/tax/stats/?entreprise_id=ENTREPRISE_UUID&exercice_id=EXERCICE_UUID" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Statistiques complètes

### Test 10: Tendances Fiscales

```bash
curl -X GET "http://localhost:8000/api/v1/tax/trends/?entreprise_id=ENTREPRISE_UUID&periode=12" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Tendances sur 12 mois

---

## 🧪 ÉTAPE 3: TESTS MODULE ACCOUNTING

### Test 1: Liste Plans Comptables de Référence

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/plans-reference/" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Liste des plans SYSCOHADA, IFRS, etc.

### Test 2: Alias - Plans (compatibilité frontend)

```bash
# Test avec alias (frontend utilise /plans/ au lieu de /plans-reference/)
curl -X GET "http://localhost:8000/api/v1/accounting/plans/" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Redirection automatique vers `/plans-reference/` et même résultat

### Test 3: Liste Comptes de Référence

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/comptes-reference/?plan_id=PLAN_UUID" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Liste des comptes du plan

### Test 4: Filtrage Comptes par Classe

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/comptes-reference/?classe=6" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Comptes de classe 6 (Charges)

### Test 5: Balance Générale

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/balance/?entreprise_id=ENTREPRISE_UUID&exercice_id=EXERCICE_UUID" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**:
```json
{
  "entreprise": "...",
  "exercice": "...",
  "date_arret": "2025-10-19",
  "comptes": [
    {
      "numero": "6...",
      "libelle": "...",
      "debit": 1000000,
      "credit": 0,
      "solde_debiteur": 1000000,
      "solde_crediteur": 0
    }
  ],
  "totaux": {
    "total_debit": 10000000,
    "total_credit": 10000000
  }
}
```

### Test 6: Grand Livre

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/grand-livre/?compte_id=COMPTE_UUID&date_debut=2025-01-01&date_fin=2025-10-19" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Mouvements détaillés du compte

### Test 7: Journal Général

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/journal-general/?journal_id=JOURNAL_UUID&date_debut=2025-01-01&date_fin=2025-10-19" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Écritures chronologiques

### Test 8: Balance Auxiliaire

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/balance-auxiliaire/?type=clients&entreprise_id=ENTREPRISE_UUID" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: Balance clients ou fournisseurs

### Test 9: Export Balance (Excel)

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/export/balance/?entreprise_id=ENTREPRISE_UUID&exercice_id=EXERCICE_UUID&format=excel" \
  -H "Authorization: Bearer $TOKEN" \
  --output balance.xlsx
```

**Attendu**: Fichier Excel téléchargé

### Test 10: Export FEC

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/export/fec/?entreprise_id=ENTREPRISE_UUID&exercice_id=EXERCICE_UUID" \
  -H "Authorization: Bearer $TOKEN" \
  --output fec.txt
```

**Attendu**: Fichier FEC conforme normes fiscales

### Test 11: Détection Anomalies

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/anomalies/?entreprise_id=ENTREPRISE_UUID" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**:
```json
{
  "anomalies": [
    {
      "type": "ECRITURE_DESEQUILIBREE",
      "niveau": "ERROR",
      "message": "Écriture X non équilibrée",
      "ecriture_id": "..."
    }
  ],
  "total": 5
}
```

### Test 12: Validation Balance

```bash
curl -X POST "http://localhost:8000/api/v1/accounting/validate/balance/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entreprise_id": "ENTREPRISE_UUID",
    "exercice_id": "EXERCICE_UUID"
  }'
```

**Attendu**:
```json
{
  "statut": "VALIDE",
  "erreurs": [],
  "avertissements": []
}
```

### Test 13: Démarrer Clôture

```bash
curl -X POST "http://localhost:8000/api/v1/accounting/cloture/start/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exercice_id": "EXERCICE_UUID"
  }'
```

**Attendu**:
```json
{
  "cloture_id": "...",
  "statut": "EN_COURS",
  "etapes": [...]
}
```

### Test 14: Statut Clôture

```bash
curl -X GET "http://localhost:8000/api/v1/accounting/cloture/status/?exercice_id=EXERCICE_UUID" \
  -H "Authorization: Bearer $TOKEN"
```

**Attendu**: État de la clôture en cours

---

## 🌐 ÉTAPE 4: TESTS FRONTEND

### Test dans le Navigateur

1. **Ouvrir** `http://localhost:5173`
2. **Se connecter** (auto-login devrait fonctionner)
3. **Naviguer** vers la section Fiscalité
4. **Tester**:
   - Liste des impôts
   - Créer/modifier un impôt
   - Calculer IS
   - Calculer TVA
   - Voir calendrier obligations

### Test Console Navigateur

```javascript
// Ouvrir la console (F12)

// 1. Test service TAX
import { taxService } from './services/taxService'

const impots = await taxService.getImpots({ pays: 'CI' })
console.log('Impôts:', impots)

const calculIS = await taxService.calculerIS({
  entreprise_id: 'TEST',
  exercice_id: 'TEST',
  benefice_comptable: 10000000,
  charges_non_deductibles: 500000
})
console.log('Calcul IS:', calculIS)

// 2. Test service ACCOUNTING
import { accountingService } from './services/accountingService'

const plans = await accountingService.getPlans()
console.log('Plans comptables:', plans)

const balance = await accountingService.getBalance({
  entreprise_id: 'TEST',
  exercice_id: 'TEST'
})
console.log('Balance:', balance)
```

---

## ✅ CHECKLIST DE VALIDATION

### Backend

- [ ] Serveur Django démarre sans erreur
- [ ] Authentification JWT fonctionne
- [ ] Endpoints TAX répondent correctement
- [ ] Endpoints ACCOUNTING répondent correctement
- [ ] Aliases fonctionnent (redirections)
- [ ] Calculs fiscaux retournent résultats corrects
- [ ] Exports génèrent fichiers valides

### Frontend

- [ ] Serveur Vite démarre sans erreur
- [ ] Services TypeScript compilent sans erreur
- [ ] Appels API TAX fonctionnent
- [ ] Appels API ACCOUNTING fonctionnent
- [ ] Interface utilisateur affiche données
- [ ] Formulaires soumettent correctement
- [ ] Gestion erreurs fonctionne

### Intégration

- [ ] Frontend reçoit données du backend
- [ ] Backend enregistre données du frontend
- [ ] Types TypeScript correspondent aux modèles Django
- [ ] Formats de dates compatibles
- [ ] Formats de nombres compatibles
- [ ] Messages d'erreur clairs et exploitables

---

## 🐛 DÉBOGAGE

### Erreur: "Informations d'authentification non fournies"

**Solution**: Vérifier que le token JWT est bien envoyé dans le header `Authorization: Bearer {TOKEN}`

### Erreur: "CORS policy"

**Solution**: Vérifier que le frontend tourne sur `http://localhost:5173` (autorisé dans CORS backend)

### Erreur: "404 Not Found"

**Solution**: Vérifier l'URL exacte dans `urls.py` et utiliser les alias si nécessaire

### Erreur: "Field required"

**Solution**: Vérifier que tous les champs requis sont envoyés dans la requête

### Erreur: "Invalid data type"

**Solution**: Vérifier les types de données (nombres vs strings, dates ISO format)

---

## 📊 RÉSULTATS ATTENDUS

### Scénario de Test Complet

1. ✅ **Authentification** réussie
2. ✅ **Liste impôts** retourne données ou liste vide
3. ✅ **Créer impôt** retourne impôt créé avec ID
4. ✅ **Calcul IS** retourne montant correct
5. ✅ **Calcul TVA** retourne TVA due correcte
6. ✅ **Balance générale** retourne comptes équilibrés
7. ✅ **Export FEC** génère fichier conforme
8. ✅ **Détection anomalies** identifie problèmes
9. ✅ **Validation balance** confirme cohérence
10. ✅ **Frontend** affiche toutes les données correctement

### Temps de Test Estimé

- **Tests Backend uniquement**: 30-45 minutes
- **Tests Frontend uniquement**: 15-30 minutes
- **Tests Intégration complète**: 1-2 heures

---

## 📝 RAPPORT DE TEST

### Template à Remplir

```markdown
# RAPPORT DE TEST - INTÉGRATION FISCASYNC

**Date**: _______________
**Testeur**: _______________

## Résultats

### Backend
- [ ] Authentification: ☐ OK  ☐ KO
- [ ] Module TAX: ☐ OK  ☐ KO
- [ ] Module ACCOUNTING: ☐ OK  ☐ KO
- [ ] Aliases: ☐ OK  ☐ KO

### Frontend
- [ ] Services TAX: ☐ OK  ☐ KO
- [ ] Services ACCOUNTING: ☐ OK  ☐ KO
- [ ] Interface utilisateur: ☐ OK  ☐ KO

### Intégration
- [ ] Communication frontend ↔ backend: ☐ OK  ☐ KO
- [ ] Cohérence des données: ☐ OK  ☐ KO

## Problèmes Rencontrés

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

## Recommandations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

## Conclusion

☐ **PRÊT POUR PRODUCTION**
☐ **CORRECTIONS MINEURES REQUISES**
☐ **CORRECTIONS MAJEURES REQUISES**
```

---

**Date**: 19 octobre 2025
**Version**: 1.0
**Modules testés**: TAX, ACCOUNTING
**Environnement**: Développement local
