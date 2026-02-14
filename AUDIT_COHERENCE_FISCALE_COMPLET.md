# 🔍 AUDIT DE COHÉRENCE FISCALE - FISCASYNC
## Édition de Liasse Fiscale SYSCOHADA/IFRS
**Date**: 2025-10-08
**Auditeur**: Expert Senior Architecture Logicielle & Conformité Fiscale
**Périmètre**: Workflow End-to-End & Cohérence Front-Back
**Score Global**: 62/100 ⚠️

---

## 📋 RÉSUMÉ EXÉCUTIF

### Points Clés

#### ✅ Points Forts
1. **Architecture Django bien structurée** - Séparation claire des modules (generation, tax, balance, parametrage)
2. **Mapping SYSCOHADA complet** - Correspondance plan comptable → états financiers bien documentée (liasseDataService.ts)
3. **Modèle de données riche** - Entités métier bien définies (LiasseFiscale, DeclarationFiscale, TransmissionElectronique)
4. **API Client robuste** - Gestion JWT avec refresh automatique, intercepteurs Axios
5. **Workflow de génération** - Process en 5 étapes (PREPARATION → CALCULS → VALIDATION → GENERATION_FICHIERS → FINALISATION)

#### ❌ Risques Critiques Identifiés

| Sévérité | Zone | Impact Conformité | Impact Fiabilité | Délai Correction |
|----------|------|-------------------|------------------|------------------|
| 🔴 **CRITIQUE** | Absence millésime fiscal | **MAJEUR** - Non-conformité réglementaire | **MAJEUR** - Impossibilité de gérer versions fiscales | **2-4 semaines** |
| 🔴 **CRITIQUE** | Pas de verrouillage post-validation | **MAJEUR** - Risque altération liasse validée | **MAJEUR** - Audit trail compromis | **1-2 semaines** |
| 🔴 **CRITIQUE** | Mapping côté frontend uniquement | **MODÉRÉ** - Calculs non traçables backend | **MAJEUR** - Logique métier vulnérable | **3-4 semaines** |
| 🟠 **MAJEUR** | Traçabilité limitée | **MODÉRÉ** - Audit incomplet | **MODÉRÉ** - Pas d'immuabilité | **2-3 semaines** |
| 🟠 **MAJEUR** | OpenAPI/Swagger cassé | **MINEUR** - Doc indisponible | **MODÉRÉ** - Contrats non vérifiables | **3-5 jours** |
| 🟡 **MINEUR** | Contrôles fiscaux incomplets | **MODÉRÉ** - Formules non systématiques | **MODÉRÉ** - Validation partielle | **4-6 semaines** |

### Gains Attendus

**Court terme (0-3 mois)**:
- ✅ Conformité réglementaire totale avec gestion millésimes
- ✅ Sécurisation du workflow (verrouillage, audit trail)
- ✅ Documentation API automatique fonctionnelle

**Moyen terme (3-6 mois)**:
- ✅ Calculs backend centralisés et traçables
- ✅ Contrôles fiscaux systématiques par millésime
- ✅ Tests de non-régression par millésime

---

## 🗺️ CARTOGRAPHIE DES FLUX MÉTIER

### Vue d'Ensemble du Workflow

```
┌─────────────────┐
│ 1. IMPORT       │ ← Balance validée, Comptes, Écritures
│    COMPTABLE    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ 2. MAPPING      │ ← SYSCOHADA_MAPPING (frontend)
│    COMPTA→FISCAL│   Règles de correspondance comptes→rubriques
└────────┬────────┘
         │
         v
┌─────────────────┐
│ 3. CALCULS      │ ← RegleCalcul.objects.filter(type_liasse)
│    FISCAUX      │   Agrégations, formules, retraitements
└────────┬────────┘
         │
         v
┌─────────────────┐
│ 4. CONTRÔLES    │ ← Validation cohérence (actif=passif)
│    RÉGLEMENTAIRES│  Contrôles millésime (MANQUANT)
└────────┬────────┘
         │
         v
┌─────────────────┐
│ 5. PRÉVISUALISATION│ États financiers (Bilan, C/R, TAFIRE)
│    & CORRECTIONS │  Corrections manuelles traçables
└────────┬────────┘
         │
         v
┌─────────────────┐
│ 6. VALIDATION   │ ← Changement statut BROUILLON→VALIDEE
│    FINALE       │   Pas de verrouillage actuel (RISQUE)
└────────┬────────┘
         │
         v
┌─────────────────┐
│ 7. GÉNÉRATION   │ ← Formats: EXCEL, PDF, XML, JSON
│    FICHIERS     │   Templates: TemplateEtat.objects
└────────┬────────┘
         │
         v
┌─────────────────┐
│ 8. TÉLÉDÉCLARATION│ TransmissionElectronique
│    EDI          │   → AdministrationFiscale (DGI, etc.)
└────────┬────────┘
         │
         v
┌─────────────────┐
│ 9. ARCHIVAGE    │ Statut ARCHIVEE, Conservation légale
│                 │
└─────────────────┘
```

### Composants Backend Identifiés

| Module | Modèles Clés | Endpoints | Responsabilité |
|--------|--------------|-----------|----------------|
| **apps.generation** | LiasseFiscale, EtatFinancier, RegleCalcul, ProcessusGeneration | `/api/v1/generation/liasses/`<br>`/api/v1/generation/etats/`<br>`POST /generer_complete` | Génération automatique liasses |
| **apps.tax** | DeclarationFiscale, TransmissionElectronique, AdministrationFiscale, CalendrierFiscal | `/api/v1/tax/` (vide actuellement) | Télédéclaration & calendrier fiscal |
| **apps.balance** | Balance, Compte, PlanComptable, LigneBalance | `/api/v1/balance/` | Import balances, validation équilibre |
| **apps.parametrage** | Entreprise, ExerciceComptable, TypeLiasse | `/api/v1/parametrage/` | Configuration entreprises |
| **apps.audit** | PisteAudit, EvenementAudit | `/api/v1/audit/` | Traçabilité (partielle) |

### Composants Frontend Identifiés

| Composant | Fichier | Responsabilité |
|-----------|---------|----------------|
| **apiClient** | `services/apiClient.ts` | Client HTTP avec JWT, refresh auto |
| **liasseDataService** | `services/liasseDataService.ts` | **MAPPING SYSCOHADA** côté front (⚠️ PROBLÈME) |
| **Types** | `types/index.ts` | Interfaces TypeScript |
| **Sheets Liasse** | `components/liasse/sheets/` | Composants états financiers |

---

## 📊 MATRICE D'ALIGNEMENT FRONT-BACK

### Endpoints Critiques Analysés

| Endpoint | Méthode | Request | Response | Status OK | Erreurs | Divergences | Sévérité |
|----------|---------|---------|----------|-----------|---------|-------------|----------|
| **`/api/v1/auth/login/`** | POST | `{username, password}` | `{access, refresh}` | 200 | 401, 400 | ✅ Aligné | - |
| **`/api/v1/auth/refresh/`** | POST | `{refresh}` | `{access}` | 200 | 401 | ✅ Aligné | - |
| **`/api/v1/generation/liasses/`** | GET | Query: `?entreprise=X&exercice=Y` | `LiasseFiscale[]` | 200 | 401, 404 | ⚠️ Serializer incomplet | 🟡 MINEUR |
| **`/api/v1/generation/liasses/generer_complete/`** | POST | `{entreprise_id, exercice_id, balance_id, type_liasse}` | `{liasse_id, status}` | 201 | 400, 404 | ✅ Aligné | - |
| **`/api/v1/balance/import/`** | POST | FormData: file | `{balance_id, nb_lignes}` | 201 | 400, 415 | ❌ **MANQUANT backend** | 🔴 CRITIQUE |
| **`/api/v1/generation/liasses/:id/calculer/`** | POST | - | `{etats_generes, controles}` | 200 | 500 | ❌ **MANQUANT backend** | 🔴 CRITIQUE |
| **`/api/v1/generation/liasses/:id/valider/`** | POST | - | `{statut, timestamp}` | 200 | 400 | ❌ **Pas de verrouillage** | 🔴 CRITIQUE |
| **`/api/v1/generation/liasses/:id/generer_pdf/`** | POST | `{format}` | FileResponse | 200 | 500 | ❌ **MANQUANT backend** | 🟠 MAJEUR |
| **`/api/v1/tax/teledeclaration/`** | POST | `{liasse_id, pays, options}` | `{transmission_id, accuse}` | 200 | 400, 500 | ❌ **MANQUANT backend** | 🔴 CRITIQUE |
| **`/api/schema/`** | GET | - | OpenAPI 3.0 | 200 | - | ❌ **ERREUR 500 AutoSchema** | 🟠 MAJEUR |

### Analyse des Divergences

#### 1. Mapping SYSCOHADA côté Frontend (CRITIQUE ⚠️)

**Fichier**: `frontend/src/services/liasseDataService.ts:32-353`

**Problème**:
```typescript
// La logique métier de MAPPING est côté client!
export const SYSCOHADA_MAPPING = {
  actif: {
    AQ: { comptes: ['201'], amortComptes: ['2801', '2901'] },
    AR: { comptes: ['202'], amortComptes: ['2802', '2902'] },
    // ... 100+ lignes de mapping
  }
}

export class LiasseDataService {
  generateBilanActif(): any {
    const rows: any[] = []
    Object.entries(SYSCOHADA_MAPPING.actif).forEach(([ref, mapping]) => {
      const brut = this.calculateBrut(mapping.comptes) // CALCUL CLIENT!
      const amortProv = this.calculateAmortProv(mapping.amortComptes || [])
      const net = brut - amortProv
      rows.push({ ref, brut, amortProv, net, net_n1: 0 })
    })
    return rows
  }
}
```

**Impact**:
- 🔴 **Conformité**: Calculs fiscaux non auditables (exécutés navigateur)
- 🔴 **Sécurité**: Mapping modifiable côté client
- 🔴 **Traçabilité**: Aucune trace backend des calculs
- 🔴 **Régression**: Tests backend impossibles

**Backend attendu** (MANQUANT):
```python
# apps/generation/models.py
class RegleCalcul(BaseModel):
    type_liasse = models.ForeignKey(TypeLiasse)
    code_rubrique = models.CharField(max_length=50)  # Ex: "AQ", "AR"
    comptes_sources = models.JSONField()  # ['201']
    amort_comptes = models.JSONField()    # ['2801', '2901']
    type_calcul = models.CharField()  # SOMME, FORMULE, etc.

# Service backend
class CalculLiasseService:
    def calculer_poste(self, rubrique_code, balance):
        regle = RegleCalcul.objects.get(code_rubrique=rubrique_code)
        montant_brut = sum(balance.filter(compte__in=regle.comptes_sources).values('solde'))
        montant_amort = sum(balance.filter(compte__in=regle.amort_comptes).values('solde'))
        return montant_brut - montant_amort
```

#### 2. Absence de Millésime Fiscal (CRITIQUE ⚠️)

**Modèles Backend**: `apps/generation/models.py`, `apps/tax/models.py`

**Problème**:
- Aucun champ `millesime` dans `LiasseFiscale`, `TypeLiasse`, `RegleCalcul`
- Pas de `MillesimeFiscal` model pour gérer versions règles
- Frontend hardcode millésime dans types: `exercice: string` au lieu de référence millésime

**Impact**:
- 🔴 **Conformité**: Impossible de gérer changements réglementaires (ex: SYSCOHADA 2017 → 2024)
- 🔴 **Migrations**: Pas de stratégie pour appliquer nouvelles règles fiscales
- 🔴 **Audit**: Impossibilité de prouver quelle version règles appliquée à la génération

**Backend attendu** (MANQUANT):
```python
class MillesimeFiscal(BaseModel):
    code = models.CharField(max_length=20, unique=True)  # "2024", "2023"
    libelle = models.CharField(max_length=200)
    norme = models.CharField()  # SYSCOHADA, IFRS
    date_debut_application = models.DateField()
    date_fin_application = models.DateField(null=True)
    est_actif = models.BooleanField(default=True)
    referentiel_formulaires = models.JSONField()
    referentiel_controles = models.JSONField()

class LiasseFiscale(BaseModel):
    millesime = models.ForeignKey(MillesimeFiscal, on_delete=models.PROTECT)  # AJOUT
    version_generateur = models.CharField()  # Déjà présent mais pas lié millésime

class RegleCalcul(BaseModel):
    millesime = models.ForeignKey(MillesimeFiscal)  # AJOUT
    # Permet multiples versions de même règle selon millésime
```

#### 3. Pas de Verrouillage Post-Validation (CRITIQUE ⚠️)

**Modèle**: `apps/generation/models.py:43`

**Problème**:
```python
# LiasseFiscale.statut: BROUILLON → GENEREE → VALIDEE → DECLAREE → ARCHIVEE
# Mais aucun mécanisme de verrouillage après VALIDEE

# Attendu:
class LiasseFiscale(BaseModel):
    est_verrouillee = models.BooleanField(default=False)  # MANQUANT
    date_verrouillage = models.DateTimeField(null=True)  # MANQUANT
    utilisateur_verrouillage = models.ForeignKey(User, null=True)  # MANQUANT
    hash_integrite = models.CharField(max_length=256, blank=True)  # MANQUANT

    def verrouiller(self, user):
        if self.statut != 'VALIDEE':
            raise ValidationError("Seule une liasse VALIDEE peut être verrouillée")
        self.est_verrouillee = True
        self.date_verrouillage = timezone.now()
        self.utilisateur_verrouillage = user
        # Calculer hash SHA256 de toutes les données JSON
        self.hash_integrite = self._calculate_integrity_hash()
        self.save()

    def save(self, *args, **kwargs):
        if self.pk and self.est_verrouillee and self.tracker.has_changed('donnees_json'):
            raise ValidationError("Liasse verrouillée, modification interdite")
        super().save(*args, **kwargs)
```

**Impact**:
- 🔴 **Conformité**: Liasse validée modifiable = risque fraude
- 🔴 **Audit**: Pas de garantie d'immuabilité post-validation
- 🔴 **Légal**: Contestation possible si liasse altérée après dépôt

#### 4. Traçabilité Limitée (MAJEUR ⚠️)

**Modules Audit**: `apps/audit/models.py`

**Problème**:
- Audit trail existe mais:
  - Pas de log **immuable** (blockchain ou append-only)
  - Pas de traçabilité des **corrections manuelles** sur rubriques
  - Pas de **correlation_id** entre frontend/backend
  - Pas de **diff** automatique entre versions liasse

**Backend attendu**:
```python
class JournalAuditImmutable(models.Model):
    # Table append-only, pas de UPDATE/DELETE
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    correlation_id = models.UUIDField()  # UUID généré côté client
    utilisateur = models.ForeignKey(User)
    entite_type = models.CharField()  # LiasseFiscale, EtatFinancier
    entite_id = models.CharField()
    action = models.CharField()  # CREATE, UPDATE, DELETE, VALIDATE, LOCK
    champs_modifies = models.JSONField()
    valeurs_avant = models.JSONField()
    valeurs_apres = models.JSONField()
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    hash_previous = models.CharField(max_length=256)  # Chain pour blockchain-like
    hash_current = models.CharField(max_length=256, unique=True)

    class Meta:
        permissions = [('cannot_delete', 'Cannot delete audit entries')]
```

#### 5. Contrôles Fiscaux Incomplets (MINEUR ⚠️)

**Service**: `frontend/src/services/liasseDataService.ts:488-511`

**Problème**:
```typescript
validateCoherence(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // ✅ Contrôle équilibre bilan
  if (Math.abs(totalActif - totalPassif) > 0.01) {
    errors.push(`Le bilan n'est pas équilibré: Actif=${totalActif}, Passif=${totalPassif}`)
  }

  // ✅ Contrôle cohérence résultat
  if (Math.abs(resultatBilan - resultatCompte) > 0.01) {
    errors.push(`Incohérence du résultat: Bilan=${resultatBilan}, Compte=${resultatCompte}`)
  }

  // ❌ MANQUANTS:
  // - Formules SYSCOHADA officielles (ex: VA = Production - Consommations)
  // - Contrôles de cohérence inter-tableaux (TAFIRE, Notes annexes)
  // - Vérification des seuils réglementaires (ex: provisions < 30% CA)
  // - Détection anomalies fiscales (charges non déductibles, etc.)

  return { isValid: errors.length === 0, errors }
}
```

**Backend attendu**:
```python
class ControleCoherence(BaseModel):
    millesime = models.ForeignKey(MillesimeFiscal)
    code_controle = models.CharField(unique=True)  # "CTRL_EQUIL_BILAN"
    libelle = models.CharField()
    type_controle = models.CharField(choices=[
        ('EGALITE', 'Égalité stricte'),
        ('FORMULE', 'Formule de calcul'),
        ('SEUIL_MIN', 'Seuil minimum'),
        ('SEUIL_MAX', 'Seuil maximum'),
        ('COHERENCE_INTER', 'Cohérence inter-tableaux'),
    ])
    formule_attendue = models.TextField()  # Expression Python: "sum(actif) == sum(passif)"
    tolerance = models.DecimalField(default=0.01)
    severite = models.CharField()  # BLOQUANT, AVERTISSEMENT, INFO
    message_erreur = models.TextField()
    recommandation = models.TextField()

class ServiceControles:
    def executer_controles(self, liasse: LiasseFiscale):
        controles = ControleCoherence.objects.filter(millesime=liasse.millesime)
        resultats = []
        for ctrl in controles:
            resultat = self._evaluer_formule(ctrl.formule_attendue, liasse)
            if not resultat:
                resultats.append({
                    'code': ctrl.code_controle,
                    'severite': ctrl.severite,
                    'message': ctrl.message_erreur,
                    'recommandation': ctrl.recommandation
                })
        return resultats
```

#### 6. OpenAPI/Swagger Cassé (MAJEUR ⚠️)

**Erreur**: `http://localhost:8000/api/schema/`

```
AssertionError: Incompatible AutoSchema used on View <class 'drf_spectacular.views.SpectacularSwaggerView'>.
Is DRF's DEFAULT_SCHEMA_CLASS pointing to "drf_spectacular.openapi.AutoSchema"?
```

**Cause**: `backend/config/settings/base.py:187`
```python
REST_FRAMEWORK = {
    # ...
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',  # Déjà présent
}
```

**Fix**:
```python
# backend/config/settings/base.py
REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',  # ✅ OK
    # Mais vérifier que toutes les views héritent correctement
}

# Vérifier les ViewSets
# backend/apps/generation/views.py:59-69
def get_serializer_class(self):
    # Utilise un SimpleLiasseSerializer inline
    # Devrait utiliser un vrai serializer défini
    from rest_framework import serializers
    class SimpleLiasseSerializer(serializers.ModelSerializer):
        class Meta:
            model = LiasseFiscale
            fields = ['id', 'nom', 'statut', 'pourcentage_completion', 'created_at']
    return SimpleLiasseSerializer  # ⚠️ Inline serializer = problème AutoSchema
```

**Solution**:
```bash
# 1. Créer serializers.py complet
# backend/apps/generation/serializers.py
from rest_framework import serializers
from .models import LiasseFiscale, EtatFinancier

class LiasseFiscaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiasseFiscale
        fields = '__all__'

# 2. Modifier views.py
class LiasseFiscaleViewSet(viewsets.ModelViewSet):
    serializer_class = LiasseFiscaleSerializer  # Référence statique

# 3. Redémarrer serveur
```

---

## 🚨 INCOHÉRENCES PAR ZONE

### Zone 1: Modélisation des Données

| # | Sévérité | Détail | Impact | Preuve | Fix |
|---|----------|--------|--------|--------|-----|
| 1.1 | 🔴 CRITIQUE | **Absence millésime fiscal** dans modèles | Non-conformité, impossibilité gérer versions réglementaires | `apps/generation/models.py:15-105`<br>`apps/parametrage/models.py:216-248` | Ajouter modèle `MillesimeFiscal` + FK dans `LiasseFiscale`, `TypeLiasse`, `RegleCalcul` |
| 1.2 | 🔴 CRITIQUE | **Pas de champ verrouillage** après validation | Liasse validée modifiable, risque fraude | `apps/generation/models.py:43` (statut VALIDEE) | Ajouter `est_verrouillee`, `date_verrouillage`, `hash_integrite`, override `save()` |
| 1.3 | 🟠 MAJEUR | **ExerciceComptable sans référence millésime** | Impossible de lier exercice → version fiscale applicable | `apps/parametrage/models.py:159-184` | Ajouter `millesime_fiscal = ForeignKey(MillesimeFiscal)` |
| 1.4 | 🟡 MINEUR | **RegleCalcul sans ordre topologique** | Risque dépendances circulaires dans calculs | `apps/generation/models.py:152-204` (ordre_execution) | Implémenter graphe DAG pour résolution ordre |
| 1.5 | 🟡 MINEUR | **Pas de version sémantique liasse** | Difficile de gérer corrections itératives | Pas de champ `version` ni `parent_version_id` | Ajouter versionnement (v1, v2, etc.) avec FK vers version précédente |

### Zone 2: Endpoints API & Contrats

| # | Sévérité | Détail | Impact | Preuve | Fix |
|---|----------|--------|--------|--------|-----|
| 2.1 | 🔴 CRITIQUE | **POST /balance/import/ manquant backend** | Import balance impossible via API | Frontend appelle endpoint inexistant | Créer `apps/balance/views.py::BalanceImportView` |
| 2.2 | 🔴 CRITIQUE | **POST /liasses/:id/calculer/ manquant** | Calculs exécutés frontend uniquement | Pas d'endpoint dans `apps/generation/urls.py` | Ajouter action `@action(detail=True) def calculer()` |
| 2.3 | 🟠 MAJEUR | **OpenAPI schema cassé (500)** | Documentation Swagger inaccessible | `http://localhost:8000/api/schema/` → AssertionError | Créer serializers.py complets, remplacer inline serializers |
| 2.4 | 🟠 MAJEUR | **Pas d'endpoint télédéclaration** | Module tax incomplet | `apps/tax/urls.py:13-16` (router vide) | Créer `TeledeclarationViewSet` avec action `transmettre()` |
| 2.5 | 🟡 MINEUR | **Pas de pagination configurée** | Risque timeout sur grandes listes | Pagination défaut 50 dans `base.py:169` mais pas toujours appliquée | Forcer pagination sur tous ViewSets |
| 2.6 | 🟡 MINEUR | **Pas de rate limiting** | Risque abus sur import/génération | Pas de middleware throttling | Ajouter `rest_framework.throttling.UserRateThrottle` |

### Zone 3: Workflow & États

| # | Sévérité | Détail | Impact | Preuve | Fix |
|---|----------|--------|--------|--------|-----|
| 3.1 | 🔴 CRITIQUE | **Transitions d'état non contrôlées** | Peut passer BROUILLON → DECLAREE directement | Pas de validation dans `LiasseFiscale.save()` | Implémenter FSM (django-fsm) avec transitions autorisées |
| 3.2 | 🟠 MAJEUR | **Pas d'idempotence sur calculs** | Ré-exécuter calculs peut donner résultats différents | Pas de cache/hash des inputs | Ajouter `hash_inputs` pour détecter changements, skip si identique |
| 3.3 | 🟠 MAJEUR | **Pas de gestion locks concurrent** | 2 users peuvent modifier même liasse simultanément | Pas de champ `locked_by`, `locked_at` | Implémenter optimistic locking ou locks DB |
| 3.4 | 🟡 MINEUR | **ProcessusGeneration déconnecté workflow** | Processus créé mais statut liasse indépendant | `apps/generation/models.py:250-298` | Synchroniser statut liasse ↔ processus via signals |

### Zone 4: Calculs & Mapping

| # | Sévérité | Détail | Impact | Preuve | Fix |
|---|----------|--------|--------|--------|-----|
| 4.1 | 🔴 CRITIQUE | **Logique métier SYSCOHADA côté frontend** | Calculs non auditables, modifiables client | `frontend/src/services/liasseDataService.ts:32-353` | Migrer mapping + calculs vers backend service |
| 4.2 | 🟠 MAJEUR | **Formules non versionnées par millésime** | Impossible d'appliquer changements réglementaires | `RegleCalcul.formule_calcul` sans lien millésime | Ajouter `millesime` FK, supporter multiples versions |
| 4.3 | 🟡 MINEUR | **Pas de validation formules à la saisie** | Risque erreurs syntaxe dans formules custom | `RegleCalcul.formule_calcul` TextField libre | Parser & valider formules (AST Python), whitelist fonctions |
| 4.4 | 🟡 MINEUR | **Arrondis non déterministes** | Écarts mineurs entre exécutions | Decimal mais pas de mode arrondi explicite | Forcer `ROUND_HALF_UP` globalement |

### Zone 5: Contrôles & Validation

| # | Sévérité | Détail | Impact | Preuve | Fix |
|---|----------|--------|--------|--------|-----|
| 5.1 | 🟠 MAJEUR | **Contrôles fiscaux hardcodés frontend** | Seulement 2 contrôles (équilibre bilan, cohérence résultat) | `frontend/src/services/liasseDataService.ts:488-511` | Créer modèle `ControleCoherence` backend avec formules |
| 5.2 | 🟠 MAJEUR | **Pas de référentiel contrôles par millésime** | Impossibilité d'appliquer nouvelles règles fiscales | Pas de lien millésime ↔ contrôles | Ajouter `ControleCoherence.millesime` FK |
| 5.3 | 🟡 MINEUR | **Pas de détection anomalies fiscales** | Charges non déductibles, amortissements excessifs non signalés | Contrôles simplistes | Implémenter règles métier (ex: dotations > 20% CA = alerte) |
| 5.4 | 🟡 MINEUR | **Pas de tests de cohérence inter-tableaux** | TAFIRE vs Bilan, Notes annexes vs États principaux | Contrôles isolés par état | Créer contrôles cross-tables |

### Zone 6: Génération & EDI

| # | Sévérité | Détail | Impact | Preuve | Fix |
|---|----------|--------|--------|--------|-----|
| 6.1 | 🔴 CRITIQUE | **Génération PDF/Excel manquante backend** | Fichiers générés frontend uniquement | Pas d'action `generer_fichier()` | Créer service génération avec reportlab/openpyxl |
| 6.2 | 🟠 MAJEUR | **Format EDI non validé par schéma** | Risque rejet par administration fiscale | `TransmissionElectronique.format_transmission` string libre | Implémenter validation XSD/JSON Schema par pays |
| 6.3 | 🟠 MAJEUR | **Pas d'empreinte d'intégrité EDI** | Impossibilité de prouver non-altération après envoi | `TransmissionElectronique.hash_fichier` présent mais non utilisé systématiquement | Calculer SHA256 avant transmission, stocker dans AR |
| 6.4 | 🟡 MINEUR | **Retry logic non configurable** | Nombre tentatives hardcodé | `TransmissionElectronique.nb_tentatives` incrémenté mais pas de max | Ajouter config `MAX_RETRY_TRANSMISSION` par pays |

### Zone 7: Sécurité & Traçabilité

| # | Sévérité | Détail | Impact | Preuve | Fix |
|---|----------|--------|--------|--------|-----|
| 7.1 | 🟠 MAJEUR | **Pas d'audit log immuable** | Logs modifiables/supprimables | `apps/audit/models.py` standard (UPDATE/DELETE possibles) | Créer table append-only avec hash chain |
| 7.2 | 🟠 MAJEUR | **Corrections manuelles non traçées** | Utilisateur modifie rubrique sans justification | Pas de modèle `CorrectionManuelle` | Ajouter champ `corrections` JSONField avec user/date/motif |
| 7.3 | 🟡 MINEUR | **Pas de correlation_id** | Impossible de lier requêtes frontend ↔ logs backend | Logs sans UUID de corrélation | Générer UUID côté client, passer via header `X-Correlation-ID` |
| 7.4 | 🟡 MINEUR | **RBAC incomplet sur actions sensibles** | Permissions par vue mais pas par action | `IsAuthenticated` global, pas de `IsReviseur`, `IsSuperviseur` | Créer permissions custom pour validation, verrouillage, télédéclaration |

### Zone 8: Performance & Scalabilité

| # | Sévérité | Détail | Impact | Preuve | Fix |
|---|----------|--------|--------|--------|-----|
| 8.1 | 🟡 MINEUR | **Calculs synchrones bloquants** | Import 100k lignes balance = timeout | Pas de task queue sur `generer_complete()` | Utiliser Celery pour générations async |
| 8.2 | 🟡 MINEUR | **Pas de cache référentiels** | Plans comptables, règles rechargés à chaque calcul | Pas de `@cached_property` ou Redis | Mettre en cache millésimes, règles par entreprise |
| 8.3 | 🟡 MINEUR | **N+1 queries sur états liasse** | `liasse.etats.all()` sans prefetch | `LiasseFiscaleViewSet.queryset` a `prefetch_related('etats')` mais pas partout | Auditer ORM, ajouter `select_related` systématique |

---

## 📋 PLAN DE REMÉDIATION PHASÉ

### Phase 0: Quick Wins (0-2 semaines)

**Objectif**: Corrections bloquantes minimales pour stabiliser

| Action | Fichiers | Effort | Impact |
|--------|----------|--------|--------|
| **Fix OpenAPI schema** | `apps/*/serializers.py` (créer), `apps/*/views.py` (remplacer inline serializers) | 2j | Documentation Swagger fonctionnelle |
| **Ajouter verrouillage basique** | `apps/generation/models.py::LiasseFiscale` (ajouter `est_verrouillee`, override `save()`) | 1j | Empêcher modifications post-validation |
| **Créer endpoint calculer** | `apps/generation/views.py::@action(detail=True, methods=['post']) def calculer()` | 1j | Déclencher calculs backend |
| **Ajouter correlation_id logs** | `apps/core/middleware.py` (nouveau), modifier `LOGGING` pour UUID | 0.5j | Traçabilité requêtes |
| **Config rate limiting** | `REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES']` dans `base.py` | 0.5j | Protection abus |

**Total**: 5 jours-personne

### Phase 1: Court Terme (2-6 semaines)

**Objectif**: Conformité réglementaire & sécurité

| Action | Fichiers | Effort | Impact |
|--------|----------|--------|--------|
| **Implémenter MillesimeFiscal** | `apps/parametrage/models.py` (nouveau modèle), migrations, seeds données | 5j | Support multi-millésimes |
| **Lier liasse → millésime** | `LiasseFiscale.millesime` FK, `ExerciceComptable.millesime` FK, update views | 3j | Traçabilité version fiscale |
| **Migrer mapping SYSCOHADA backend** | `apps/generation/services.py::MappingService`, `RegleCalcul` data migration | 8j | Calculs auditables |
| **Créer service calculs backend** | `apps/generation/services.py::CalculLiasseService`, intégrer dans `generer_complete()` | 5j | Centralisation logique métier |
| **Audit log immuable** | `apps/audit/models.py::JournalAuditImmutable`, middleware capture automatique | 3j | Traçabilité légale |
| **FSM transitions liasse** | Install `django-fsm`, modifier `LiasseFiscale.statut`, définir transitions | 2j | Workflow sécurisé |
| **Tests unitaires calculs** | `apps/generation/tests/test_calculs.py`, fixtures balance SYSCOHADA | 5j | Non-régression |

**Total**: 31 jours-personne (6 semaines avec 1 dev)

### Phase 2: Moyen Terme (6-12 semaines)

**Objectif**: Contrôles fiscaux & génération complète

| Action | Fichiers | Effort | Impact |
|--------|----------|--------|--------|
| **Modèle ControleCoherence** | `apps/generation/models.py`, seeds formules SYSCOHADA par millésime | 5j | Contrôles systématiques |
| **Service contrôles fiscaux** | `apps/generation/services.py::ServiceControles`, exécuteur formules safe | 8j | Validation réglementaire |
| **Générateur PDF backend** | `apps/generation/services.py::PDFGenerator` avec reportlab, templates officiels | 8j | Fichiers conformes |
| **Générateur EDI/XML** | `apps/tax/services.py::EDIGenerator`, validation XSD par pays | 10j | Télédéclaration sécurisée |
| **Endpoint télédéclaration** | `apps/tax/views.py::TeledeclarationViewSet`, intégration DGI APIs | 10j | Transmission automatique |
| **Tests intégration E2E** | `apps/generation/tests/test_integration.py`, scénarios complets par millésime | 8j | Garantie qualité |
| **Feature flags millésimes** | Install `django-waffle`, flags par millésime, UI bascule | 3j | Déploiement progressif |
| **Documentation utilisateur** | Guides par rôle (préparateur, réviseur, superviseur), vidéos | 5j | Adoption |

**Total**: 57 jours-personne (12 semaines avec 1 dev)

### Phase 3: Long Terme (3-6 mois)

**Objectif**: Optimisations & industrialisation

| Action | Effort | Impact |
|--------|--------|--------|
| **Async tasks Celery** | 5j | Performance imports |
| **Cache Redis référentiels** | 3j | Accélération calculs |
| **Optimistic locking** | 3j | Concurrence multi-users |
| **Blockchain audit trail** | 10j | Preuve d'intégrité incontestable |
| **Référentiel contrôles DGFiP** | 15j | Conformité 100% |
| **Tests charge (JMeter)** | 5j | Scalabilité validée |
| **CI/CD complet** | 5j | Déploiement automatisé |

**Total**: 46 jours-personne

---

## ✅ CHECKLISTS DE VALIDATION

### Checklist Mapping

- [ ] Mapping SYSCOHADA 2017 complet (Bilan Actif/Passif, C/R, TAFIRE)
- [ ] Règles de calcul stockées en base (modèle `RegleCalcul`)
- [ ] Mapping exécuté backend (service `MappingService`)
- [ ] Traçabilité des comptes sources par rubrique
- [ ] Support multi-millésimes (règles versionnées)
- [ ] Tests unitaires par rubrique (AQ, AR, AS, etc.)
- [ ] Documentation mapping (matrice comptes → rubriques)

### Checklist Calculs

- [ ] Service calculs backend (`CalculLiasseService`)
- [ ] Formules SYSCOHADA officielles implémentées
- [ ] Calculs idempotents (même inputs → mêmes outputs)
- [ ] Gestion arrondis déterministe (ROUND_HALF_UP)
- [ ] Logs détaillés par calcul (inputs, formule, output)
- [ ] Tests de non-régression par millésime
- [ ] Validation formules custom (AST parsing, whitelist)

### Checklist Contrôles

- [ ] Modèle `ControleCoherence` créé
- [ ] Référentiel contrôles par millésime
- [ ] Contrôles obligatoires: équilibre bilan, cohérence résultat, formules SIG
- [ ] Contrôles optionnels: seuils, anomalies fiscales
- [ ] Niveaux de sévérité (BLOQUANT, AVERTISSEMENT, INFO)
- [ ] Messages d'erreur explicites avec recommandations
- [ ] Tests contrôles avec jeux de données erronés

### Checklist Génération PDF/EDI

- [ ] Templates PDF officiels par millésime
- [ ] Génération backend (reportlab ou équivalent)
- [ ] Watermark & mentions légales
- [ ] Schémas EDI/XML par pays (XSD validation)
- [ ] Empreinte SHA256 avant transmission
- [ ] Archivage fichiers générés (rétention légale)
- [ ] Tests génération par type liasse (SN, SMT, SA, etc.)

### Checklist Télédéclaration

- [ ] Endpoint `POST /api/v1/tax/teledeclaration/`
- [ ] Intégration APIs administrations (DGI CI, etc.)
- [ ] Signature électronique (certificats)
- [ ] Retry logic configurable par pays
- [ ] Traçabilité transmissions (id unique, date, AR)
- [ ] Gestion erreurs EDI (codes retour standardisés)
- [ ] Tests avec environnement sandbox

### Checklist Verrouillage & Validation

- [ ] Transitions FSM strictes (django-fsm)
- [ ] Verrouillage automatique après validation finale
- [ ] Hash d'intégrité calculé (SHA256 de toutes données JSON)
- [ ] Interdiction modifications si `est_verrouillee=True`
- [ ] Corrections via nouvelle version liasse (v2, v3, etc.)
- [ ] Permissions spéciales pour déverrouillage (admin uniquement)
- [ ] Tests tentatives modification post-verrouillage

### Checklist Millésimes

- [ ] Modèle `MillesimeFiscal` créé
- [ ] Données seeds par millésime (2017, 2018, ..., 2024)
- [ ] FK `millesime` dans `LiasseFiscale`, `ExerciceComptable`, `RegleCalcul`, `ControleCoherence`
- [ ] Feature flags par millésime (activation progressive)
- [ ] Tests bascule millésime (migration liasse 2023 → 2024)
- [ ] Documentation changements réglementaires

---

## 📎 ANNEXES

### A. Exemples de Contrôles Fiscaux

```python
# apps/generation/fixtures/controles_syscohada_2024.json
[
  {
    "code_controle": "CTRL_EQUIL_BILAN",
    "libelle": "Équilibre du Bilan",
    "type_controle": "EGALITE",
    "formule_attendue": "sum(actif.net) == sum(passif.montant)",
    "tolerance": 0.01,
    "severite": "BLOQUANT",
    "message_erreur": "Le bilan n'est pas équilibré (écart: {ecart})",
    "recommandation": "Vérifier les comptes de régularisation et le report à nouveau"
  },
  {
    "code_controle": "CTRL_COHÉR_RESULTAT",
    "libelle": "Cohérence Résultat Bilan/C.R",
    "type_controle": "EGALITE",
    "formule_attendue": "passif.CE == (sum(produits) - sum(charges))",
    "tolerance": 0.01,
    "severite": "BLOQUANT",
    "message_erreur": "Le résultat du bilan ({bilan}) ne correspond pas au C/R ({cr})"
  },
  {
    "code_controle": "CTRL_VA_FORMULE",
    "libelle": "Formule Valeur Ajoutée (SIG)",
    "type_controle": "FORMULE",
    "formule_attendue": "VA == (TB + TC + TD - RA - RC - RE - RG)",
    "tolerance": 0.01,
    "severite": "AVERTISSEMENT",
    "message_erreur": "La Valeur Ajoutée ne respecte pas la formule SYSCOHADA"
  },
  {
    "code_controle": "CTRL_AMORT_MAX",
    "libelle": "Amortissements excessifs",
    "type_controle": "SEUIL_MAX",
    "formule_attendue": "sum(dotations_amort) <= sum(immobilisations_brutes) * 0.30",
    "severite": "AVERTISSEMENT",
    "message_erreur": "Dotations aux amortissements > 30% des immobilisations (possible erreur)"
  }
]
```

### B. Exemple Test de Contrat API

```python
# apps/generation/tests/test_api_contracts.py
import pytest
from rest_framework.test import APIClient
from apps.parametrage.models import Entreprise, ExerciceComptable
from apps.balance.models import Balance

@pytest.mark.django_db
class TestLiasseGenerationContract:
    """Tests de contrat API génération liasse"""

    def test_generer_complete_success(self, authenticated_client, sample_balance):
        """Test POST /generer_complete avec succès"""
        payload = {
            "entreprise_id": sample_balance.entreprise.id,
            "exercice_id": sample_balance.exercice.id,
            "balance_id": sample_balance.id,
            "type_liasse": "SN"
        }

        response = authenticated_client.post(
            '/api/v1/generation/liasses/generer_complete/',
            data=payload
        )

        # Contract assertions
        assert response.status_code == 201
        assert 'liasse_id' in response.data
        assert 'status' in response.data
        assert response.data['status'] == 'BROUILLON'

    def test_generer_complete_missing_balance(self, authenticated_client):
        """Test erreur si balance manquante"""
        payload = {
            "entreprise_id": 999,
            "exercice_id": 999,
            "balance_id": 999,
            "type_liasse": "SN"
        }

        response = authenticated_client.post(
            '/api/v1/generation/liasses/generer_complete/',
            data=payload
        )

        # Contract assertions
        assert response.status_code == 404
        assert 'error' in response.data
        assert 'non trouvée' in response.data['error'].lower()
```

### C. Gabarit d'Erreurs Unifiées

```python
# apps/core/exceptions.py
from rest_framework.exceptions import APIException

class FiscaSyncException(APIException):
    """Exception de base FiscaSync"""
    status_code = 400
    default_code = 'fiscasync_error'

    def __init__(self, code, message, details=None, status_code=None):
        self.code = code
        self.message = message
        self.details = details or {}
        if status_code:
            self.status_code = status_code
        super().__init__(detail={
            'error': self.code,
            'message': self.message,
            'details': self.details
        })

class ValidationError(FiscaSyncException):
    status_code = 400
    default_code = 'VALIDATION_ERROR'

class ConformiteError(FiscaSyncException):
    """Erreur de conformité fiscale"""
    status_code = 422
    default_code = 'CONFORMITE_ERROR'

# Exemples d'utilisation
raise ValidationError(
    code='BILAN_DESEQUILIBRE',
    message='Le bilan n\'est pas équilibré',
    details={
        'actif_total': 1500000,
        'passif_total': 1500500,
        'ecart': 500
    }
)

raise ConformiteError(
    code='FORMULE_SYSCOHADA_INVALIDE',
    message='La formule de Valeur Ajoutée ne respecte pas SYSCOHADA 2024',
    details={
        'formule_attendue': 'VA = Production - Consommations',
        'valeur_calculee': 250000,
        'valeur_attendue': 252000,
        'ecart': -2000
    }
)
```

### D. Exemple Feature Flag Millésime

```python
# apps/parametrage/middleware.py
from waffle import flag_is_active

class MillesimeFeatureFlagMiddleware:
    """Active millésimes selon feature flags"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Injecter millésimes actifs dans contexte
        request.millesimes_actifs = []

        if flag_is_active(request, 'millesime_2024'):
            request.millesimes_actifs.append('2024')
        if flag_is_active(request, 'millesime_2023'):
            request.millesimes_actifs.append('2023')

        return self.get_response(request)

# Vue
class LiasseFiscaleViewSet(viewsets.ModelViewSet):
    def create(self, request):
        millesime = request.data.get('millesime')
        if millesime not in request.millesimes_actifs:
            raise ValidationError(
                code='MILLESIME_INACTIF',
                message=f'Le millésime {millesime} n\'est pas encore activé',
                details={'millesimes_disponibles': request.millesimes_actifs}
            )
        # ...
```

---

## 📧 CONTACT & SUIVI

**Questions/Clarifications**: Créer issue dans repo avec tag `[AUDIT]`
**Priorisation**: À discuter en comité technique
**Revue**: Audit à renouveler après chaque phase de remédiation

**Prochaine étape recommandée**: Phase 0 (Quick Wins) - 5 jours

---

**FIN DU RAPPORT D'AUDIT**
*Généré par Expert Architecture Logicielle & Conformité Fiscale*
*Version 1.0 - 2025-10-08*
