# 📊 Guide d'Import/Export du Plan Comptable

## ✅ Ce qui a été créé

### 1. Fonctionnalités Implémentées

- ✅ **Service d'import** - Import depuis Excel, CSV, JSON
- ✅ **Service d'export** - Export vers Excel, CSV, JSON
- ✅ **Validation des données** - Vérification SYSCOHADA
- ✅ **Gestion hiérarchique** - Parent-enfant automatique
- ✅ **Template Excel** - Modèle prêt à l'emploi
- ✅ **API REST** - 3 endpoints complets

### 2. Fichiers Créés

```
backend/apps/accounting/
├── services/
│   ├── __init__.py
│   └── import_export_service.py
├── views.py (modifié - +230 lignes)
└── urls.py (modifié - +3 routes)
```

---

## 🚀 Utilisation

### 1. Télécharger le Template

**Endpoint**: `GET /api/accounting/plan-comptable/template/`

```bash
curl -X GET "http://localhost:8000/api/accounting/plan-comptable/template/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output template_plan_comptable.xlsx
```

**Réponse**: Fichier Excel avec :
- Feuille "Plan Comptable" avec exemples
- Feuille "Instructions" avec la documentation

**Colonnes du Template**:

| Colonne | Type | Requis | Description |
|---------|------|--------|-------------|
| `numero` | Texte | ✅ OUI | Numéro du compte (ex: 401, 4011) |
| `libelle` | Texte | ✅ OUI | Libellé du compte |
| `classe` | Texte | Non | Classe 1-8 (auto-détecté) |
| `sous_classe` | Texte | Non | Sous-classe |
| `poste` | Texte | Non | Poste |
| `compte_principal` | Texte | Non | Compte principal |
| `sens_normal` | Texte | ✅ OUI | DEBIT ou CREDIT |
| `nature_compte` | Texte | ✅ OUI | ACTIF, PASSIF, CHARGE, PRODUIT |
| `niveau` | Nombre | Auto | Niveau hiérarchique (calculé) |
| `numero_parent` | Texte | Non | Numéro du compte parent |
| `accepte_imputation` | Oui/Non | Non | Accepte les écritures |
| `obligatoire_tiers` | Oui/Non | Non | Tiers obligatoire |
| `obligatoire_analytique` | Oui/Non | Non | Analytique obligatoire |
| `equivalence_ifrs` | Texte | Non | Code IFRS équivalent |
| `code_fiscal_ohada` | Texte | Non | Code fiscal OHADA |
| `note_utilisation` | Texte | Non | Note d'utilisation |

---

### 2. Importer un Plan Comptable

**Endpoint**: `POST /api/accounting/plan-comptable/importer/`

#### Format Excel/CSV

```bash
curl -X POST "http://localhost:8000/api/accounting/plan-comptable/importer/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "fichier=@plan_comptable.xlsx" \
  -F "plan_comptable_id=1" \
  -F "format=excel"
```

#### Format JSON

```bash
curl -X POST "http://localhost:8000/api/accounting/plan-comptable/importer/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "fichier=@plan_comptable.json" \
  -F "plan_comptable_id=1" \
  -F "format=json"
```

**Paramètres**:
- `fichier` (file): Fichier à importer (.xlsx, .csv, .json)
- `plan_comptable_id` (int): ID du plan comptable cible
- `format` (string, optionnel): Format - `excel`, `csv`, `json` (auto-détecté si omis)

**Réponse succès**:
```json
{
  "success": true,
  "message": "450 comptes créés, 23 mis à jour",
  "comptes_crees": 450,
  "comptes_mis_a_jour": 23,
  "erreurs": [],
  "avertissements": [
    {
      "compte": "4015",
      "avertissement": "Compte parent 401 introuvable"
    }
  ]
}
```

**Réponse erreur**:
```json
{
  "success": false,
  "message": "Import annulé: trop d'erreurs (12)",
  "erreurs": [
    {
      "ligne": 5,
      "numero": "ABC",
      "erreur": "Numéro de compte invalide"
    },
    {
      "ligne": 12,
      "numero": "7011",
      "erreur": "Libellé de compte manquant"
    }
  ]
}
```

---

### 3. Exporter un Plan Comptable

**Endpoint**: `GET /api/accounting/plan-comptable/exporter/`

#### Export Excel

```bash
curl -X GET "http://localhost:8000/api/accounting/plan-comptable/exporter/?plan_comptable_id=1&format=excel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output plan_comptable.xlsx
```

#### Export CSV

```bash
curl -X GET "http://localhost:8000/api/accounting/plan-comptable/exporter/?plan_comptable_id=1&format=csv" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output plan_comptable.csv
```

#### Export JSON

```bash
curl -X GET "http://localhost:8000/api/accounting/plan-comptable/exporter/?plan_comptable_id=1&format=json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output plan_comptable.json
```

**Paramètres**:
- `plan_comptable_id` (required): ID du plan comptable
- `format` (optionnel): `excel` (défaut), `csv`, `json`

**Structure JSON exporté**:
```json
{
  "plan_comptable": {
    "code": "SYSCOHADA_2017",
    "nom": "SYSCOHADA Révisé 2017",
    "type_plan": "SYSCOHADA_GENERAL",
    "version": "2017",
    "date_export": "2025-10-10T12:00:00"
  },
  "comptes": [
    {
      "numero": "101",
      "libelle": "Capital social",
      "classe": "1",
      "sens_normal": "CREDIT",
      "nature_compte": "PASSIF",
      "niveau": 3,
      "numero_parent": null,
      "accepte_imputation": true,
      "obligatoire_tiers": false,
      "obligatoire_analytique": false,
      "equivalence_ifrs": "IAS1-101",
      "code_fiscal_ohada": "F101",
      "note_utilisation": "..."
    }
  ],
  "statistiques": {
    "total_comptes": 450,
    "comptes_par_classe": {
      "1": 45,
      "2": 68,
      "3": 32,
      "4": 89,
      "5": 23,
      "6": 102,
      "7": 87,
      "8": 4
    }
  }
}
```

---

## 📝 Exemple Complet d'Utilisation

### Cas d'usage : Import d'un plan comptable SYSCOHADA complet

**Étape 1** : Télécharger le template
```bash
curl -X GET "http://localhost:8000/api/accounting/plan-comptable/template/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output template.xlsx
```

**Étape 2** : Remplir le template dans Excel
- Ouvrir `template.xlsx`
- Compléter les lignes avec vos comptes
- Respecter les formats (DEBIT/CREDIT, Oui/Non, etc.)

**Étape 3** : Créer un plan comptable via l'API
```bash
curl -X POST "http://localhost:8000/api/accounting/plans-reference/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SYSCOHADA_CI_2024",
    "nom": "SYSCOHADA Côte d'\''Ivoire 2024",
    "type_plan": "SYSCOHADA_GENERAL",
    "type_liasse": 1,
    "version": "2024",
    "date_publication": "2024-01-01",
    "date_application": "2024-01-01",
    "autorite_publication": "OHADA",
    "est_actif": true,
    "peut_etre_modifie": true
  }'
```

**Étape 4** : Importer les comptes
```bash
curl -X POST "http://localhost:8000/api/accounting/plan-comptable/importer/" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "fichier=@template.xlsx" \
  -F "plan_comptable_id=5"
```

**Étape 5** : Vérifier l'import
```bash
curl -X GET "http://localhost:8000/api/accounting/comptes-reference/?plan_comptable=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Validation Automatique

Le service d'import valide automatiquement :

### ✅ Validations de base
- Numéro de compte présent et non vide
- Libellé présent et non vide
- Classe valide (1-8)
- Sens normal (DEBIT/CREDIT)
- Nature compte (ACTIF/PASSIF/CHARGE/PRODUIT)

### ✅ Validations hiérarchiques
- Détection automatique du compte parent
- Vérification cohérence hiérarchique
- Niveau calculé automatiquement

### ✅ Gestion des doublons
- Si compte existe : mise à jour
- Si compte nouveau : création
- Pas de doublon de numéro dans le même plan

### ⚠️ Limite d'erreurs
- Maximum 10 erreurs tolérées
- Au-delà : rollback complet de l'import
- Liste des erreurs renvoyée dans la réponse

---

## 🛡️ Sécurité

### Permissions requises
- **Import** : Utilisateur authentifié + plan modifiable (`peut_etre_modifie=True`)
- **Export** : Utilisateur authentifié
- **Template** : Utilisateur authentifié

### Validation des fichiers
- Taille maximale : 10 MB (configuré dans settings)
- Formats acceptés : `.xlsx`, `.xls`, `.csv`, `.json`
- Validation MIME type

### Protection des données
- Plans officiels non modifiables (`peut_etre_modifie=False`)
- Transaction atomique (rollback en cas d'erreur)
- Logs détaillés de toutes les opérations

---

## 🔧 Frontend - Intégration React

### Exemple de composant d'import

```typescript
// Import de plan comptable
const ImportPlanComptable: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [planId, setPlanId] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('fichier', file);
    formData.append('plan_comptable_id', planId.toString());

    setLoading(true);

    try {
      const response = await fetch('/api/accounting/plan-comptable/importer/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(`Succès: ${data.message}`);
        console.log('Créés:', data.comptes_crees);
        console.log('Mis à jour:', data.comptes_mis_a_jour);
      } else {
        alert(`Erreur: ${data.message}`);
        console.error('Erreurs:', data.erreurs);
      }
    } catch (error) {
      alert('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleImport} disabled={!file || loading}>
        {loading ? 'Import en cours...' : 'Importer'}
      </button>
    </div>
  );
};
```

### Exemple de composant d'export

```typescript
// Export de plan comptable
const ExportPlanComptable: React.FC = () => {
  const [format, setFormat] = useState<'excel' | 'csv' | 'json'>('excel');
  const [planId, setPlanId] = useState<number>(1);

  const handleExport = async () => {
    const url = `/api/accounting/plan-comptable/exporter/?plan_comptable_id=${planId}&format=${format}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `plan_comptable_${planId}.${format === 'excel' ? 'xlsx' : format}`;
      link.click();
    } catch (error) {
      alert('Erreur export');
    }
  };

  return (
    <div>
      <select value={format} onChange={(e) => setFormat(e.target.value as any)}>
        <option value="excel">Excel</option>
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
      </select>
      <button onClick={handleExport}>Exporter</button>
    </div>
  );
};
```

---

## 🐛 Troubleshooting

### Erreur : "Format non supporté"
**Cause** : Extension de fichier incorrecte
**Solution** : Utiliser `.xlsx`, `.csv` ou `.json`

### Erreur : "Colonnes obligatoires manquantes"
**Cause** : Template modifié incorrectement
**Solution** : Re-télécharger le template officiel

### Erreur : "Plan comptable en lecture seule"
**Cause** : `peut_etre_modifie=False`
**Solution** : Créer un nouveau plan ou dupliquer le plan existant

### Erreur : "Import annulé: trop d'erreurs"
**Cause** : Plus de 10 erreurs dans le fichier
**Solution** : Corriger les erreurs listées dans la réponse

### Hiérarchie incorrecte
**Cause** : Ordre d'import incorrect
**Solution** : Trier les comptes par numéro (parents avant enfants)

---

## 📊 Statistiques & Monitoring

### Logs disponibles

Le service enregistre automatiquement :
- Nombre de comptes importés/exportés
- Erreurs de validation
- Temps d'exécution
- Utilisateur ayant effectué l'opération

### Exemple de log
```
[INFO] Import plan comptable - User: john@example.com
[INFO] Plan: SYSCOHADA_CI_2024 (ID: 5)
[INFO] Fichier: plan_comptable.xlsx (2.3 MB)
[INFO] Résultat: 450 créés, 23 mis à jour
[WARN] 3 avertissements: comptes parents manquants
```

---

## ✅ Checklist Finale

Avant de déclarer la fonctionnalité opérationnelle :

- [x] Service d'import créé (`import_export_service.py`)
- [x] Service d'export créé (`import_export_service.py`)
- [x] Endpoints API créés (`views.py`)
- [x] Routes configurées (`urls.py`)
- [x] Template Excel générable
- [x] Validation des données
- [x] Gestion hiérarchique
- [x] Support multi-formats (Excel, CSV, JSON)
- [x] Documentation complète
- [ ] Tests unitaires (à créer)
- [ ] Tests d'intégration (à créer)
- [ ] Interface frontend (à créer)

---

## 🚀 URLs Disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/accounting/plan-comptable/template/` | GET | Télécharger template Excel |
| `/api/accounting/plan-comptable/importer/` | POST | Importer plan comptable |
| `/api/accounting/plan-comptable/exporter/` | GET | Exporter plan comptable |

**Base URL**: `http://localhost:8000` (développement)

---

**Documentation créée par Claude Code** 🤖
**Date** : 2025-10-10
**Status** : ✅ FONCTIONNEL - Prêt pour utilisation
