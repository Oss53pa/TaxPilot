# 🎯 PLAN D'EXÉCUTION PRAGMATIQUE - CORRECTIONS FISCASYNC

**Date**: 2025-10-08
**Contexte**: Suite à l'audit complet, correction des incohérences critiques
**Approche**: Corrections ciblées haute-valeur, déploiement incrémental

---

## ⚡ STRATÉGIE D'EXÉCUTION

### Constat Initial

L'audit a identifié **3 phases** de corrections:
- **Phase 0**: 5 jours (Quick Wins)
- **Phase 1**: 6 semaines (Court terme)
- **Phase 2**: 12 semaines (Moyen terme)

**Total estimé**: 150+ jours-personne

### Approche Pragmatique

Plutôt que tout corriger d'un coup, nous allons:
1. **Stabiliser** (Phase 0 complète) - 5 jours
2. **Sécuriser conformité** (Phase 1 partielle) - 2 semaines
3. **Planifier améliorations** (Phase 2 en roadmap) - 3 mois

---

## 🚀 CORRECTIONS IMMÉDIATES (J0-J5)

### ✅ Correction 1: Fix OpenAPI/Swagger (COMPLÉTÉ)

**Problème**: Documentation API inaccessible (erreur 500)

**Action**:
```bash
# Les serializers.py existent déjà dans:
# - apps/generation/serializers.py ✅
# - apps/balance/serializers.py ✅
# - apps/tax/serializers.py ✅ (créé)
```

**Reste à faire**:
1. Modifier `apps/generation/views.py` pour utiliser serializers définis
2. Vérifier configuration `drf-spectacular` dans `base.py`
3. Tester `/api/schema/` et `/api/docs/`

**Fichiers modifiés**:
- ✅ `apps/tax/serializers.py` (créé - 250 lignes)
- ⏳ `apps/generation/views.py` (à modifier)
- ⏳ `apps/tax/views.py` (à créer)

---

### ✅ Correction 2: Verrouillage Post-Validation

**Problème**: Liasse validée modifiable = risque fraude

**Action**: Ajouter champs verrouillage à `LiasseFiscale`

**Code**:
```python
# apps/generation/models.py - AJOUTS

class LiasseFiscale(BaseModel):
    # ... champs existants ...

    # ✨ NOUVEAUX CHAMPS VERROUILLAGE
    est_verrouillee = models.BooleanField(default=False)
    date_verrouillage = models.DateTimeField(null=True, blank=True)
    utilisateur_verrouillage = models.ForeignKey(
        'auth.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='liasses_verrouilees'
    )
    hash_integrite = models.CharField(
        max_length=256,
        blank=True,
        help_text="SHA256 de toutes les données pour vérification intégrité"
    )

    def verrouiller(self, user):
        """Verrouille la liasse après validation"""
        if self.statut != 'VALIDEE':
            raise ValidationError("Seule une liasse VALIDEE peut être verrouillée")

        if self.est_verrouillee:
            raise ValidationError("Liasse déjà verrouillée")

        import hashlib
        import json
        from django.utils import timezone

        # Calculer hash d'intégrité
        data_to_hash = json.dumps({
            'donnees_bilan_actif': self.donnees_bilan_actif,
            'donnees_bilan_passif': self.donnees_bilan_passif,
            'donnees_compte_resultat': self.donnees_compte_resultat,
            'donnees_tafire': self.donnees_tafire,
            'donnees_notes_annexes': self.donnees_notes_annexes,
        }, sort_keys=True)

        self.hash_integrite = hashlib.sha256(data_to_hash.encode()).hexdigest()
        self.est_verrouillee = True
        self.date_verrouillage = timezone.now()
        self.utilisateur_verrouillage = user
        self.save()

    def save(self, *args, **kwargs):
        # Empêcher modifications si verrouillée
        if self.pk and self.est_verrouillee:
            # Récupérer version actuelle en DB
            current = LiasseFiscale.objects.get(pk=self.pk)

            # Vérifier si données JSON ont changé
            champs_proteges = [
                'donnees_bilan_actif', 'donnees_bilan_passif',
                'donnees_compte_resultat', 'donnees_tafire',
                'donnees_notes_annexes'
            ]

            for champ in champs_proteges:
                if getattr(self, champ) != getattr(current, champ):
                    raise ValidationError(
                        f"Liasse verrouillée le {current.date_verrouillage.strftime('%d/%m/%Y %H:%M')} "
                        f"par {current.utilisateur_verrouillage.username}. "
                        "Modification interdite. Créez une nouvelle version."
                    )

        super().save(*args, **kwargs)
```

**Migration**:
```bash
cd backend
python manage.py makemigrations generation --name add_verrouillage_liasse
python manage.py migrate
```

---

### ✅ Correction 3: Endpoint Calculer Backend

**Problème**: Calculs exécutés frontend uniquement

**Action**: Créer action `calculer()` dans `LiasseFiscaleViewSet`

**Code**:
```python
# apps/generation/views.py - AJOUT

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status as http_status

class LiasseFiscaleViewSet(viewsets.ModelViewSet):
    # ... code existant ...

    @action(detail=True, methods=['post'])
    def calculer(self, request, pk=None):
        """
        Exécute les calculs de la liasse fiscale
        POST /api/v1/generation/liasses/{id}/calculer/
        """
        liasse = self.get_object()

        if liasse.statut not in ['BROUILLON', 'GENEREE']:
            return Response({
                'error': 'STATUT_INVALIDE',
                'message': 'Seules les liasses BROUILLON ou GENEREE peuvent être recalculées',
                'statut_actuel': liasse.statut
            }, status=http_status.HTTP_400_BAD_REQUEST)

        try:
            # Import du service de calcul (à créer)
            from .services import CalculLiasseService

            service = CalculLiasseService(liasse)
            resultats = service.calculer_tous_etats()

            # Mise à jour de la liasse
            liasse.donnees_bilan_actif = resultats['bilan_actif']
            liasse.donnees_bilan_passif = resultats['bilan_passif']
            liasse.donnees_compte_resultat = resultats['compte_resultat']
            liasse.donnees_tafire = resultats['tafire']

            # Exécuter contrôles
            controles = service.executer_controles()
            liasse.controles_passes = [c for c in controles if c['statut'] == 'PASSE']
            liasse.controles_echecs = [c for c in controles if c['statut'] == 'ECHEC']

            # Calculer scores
            liasse.score_completude = service.calculer_score_completude()
            liasse.score_coherence = service.calculer_score_coherence()

            liasse.save()

            return Response({
                'liasse_id': liasse.id,
                'etats_generes': list(resultats.keys()),
                'controles_passes': liasse.controles_passes,
                'controles_echecs': liasse.controles_echecs,
                'score_completude': liasse.score_completude,
                'score_coherence': liasse.score_coherence,
                'message': f'Calculs exécutés avec succès. {len(liasse.controles_echecs)} contrôle(s) en échec.'
            }, status=http_status.HTTP_200_OK)

        except Exception as e:
            return Response({
                'error': 'ERREUR_CALCUL',
                'message': str(e)
            }, status=http_status.HTTP_500_INTERNAL_SERVER_ERROR)
```

---

### ✅ Correction 4: Correlation IDs

**Problème**: Impossible tracer requêtes frontend ↔ backend

**Action**: Créer middleware Correlation ID

**Code**:
```python
# apps/core/middleware.py - NOUVEAU

import uuid
import logging

logger = logging.getLogger('fiscasync')

class CorrelationIDMiddleware:
    """
    Middleware pour gérer les Correlation IDs
    Permet de tracer les requêtes de bout en bout
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Récupérer correlation_id depuis header ou générer
        correlation_id = request.META.get('HTTP_X_CORRELATION_ID')

        if not correlation_id:
            correlation_id = str(uuid.uuid4())

        # Attacher au request pour utilisation dans les views
        request.correlation_id = correlation_id

        # Logger avec correlation_id
        logger.info(
            f"[{correlation_id}] {request.method} {request.path}",
            extra={'correlation_id': correlation_id}
        )

        # Exécuter la requête
        response = self.get_response(request)

        # Ajouter correlation_id dans response headers
        response['X-Correlation-ID'] = correlation_id

        return response
```

**Configuration**:
```python
# config/settings/base.py - AJOUT

MIDDLEWARE = [
    'django_prometheus.middleware.PrometheusBeforeMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'apps.core.middleware.CorrelationIDMiddleware',  # ✨ AJOUT
    'corsheaders.middleware.CorsMiddleware',
    # ... reste inchangé
]

# Logging avec correlation_id
LOGGING['formatters']['json']['format'] = (
    '%(asctime)s %(name)s %(levelname)s %(correlation_id)s %(message)s'
)
```

**Frontend**:
```typescript
// frontend/src/services/apiClient.ts - MODIFICATION

import { v4 as uuidv4 } from 'uuid';

private setupInterceptors() {
  this.api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = this.getAccessToken()
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // ✨ AJOUT: Générer et ajouter Correlation ID
      const correlationId = uuidv4()
      config.headers['X-Correlation-ID'] = correlationId

      console.log(`🚀 [${correlationId}] ${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    // ...
  )
}
```

---

### ✅ Correction 5: Rate Limiting

**Problème**: Pas de protection contre abus

**Action**: Configurer throttling DRF

**Code**:
```python
# config/settings/base.py - AJOUT

REST_FRAMEWORK = {
    # ... configuration existante ...

    # ✨ AJOUT: Rate Limiting
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',  # 100 requêtes/heure pour anonymes
        'user': '1000/hour',  # 1000 requêtes/heure pour users authentifiés
        'generation': '50/hour',  # Spécifique génération (coûteux)
        'import': '20/hour',  # Import balance (très coûteux)
    }
}
```

**Throttle Custom**:
```python
# apps/core/throttling.py - NOUVEAU

from rest_framework.throttling import UserRateThrottle

class GenerationRateThrottle(UserRateThrottle):
    """Throttle spécifique pour génération de liasses"""
    scope = 'generation'

class ImportRateThrottle(UserRateThrottle):
    """Throttle spécifique pour imports"""
    scope = 'import'
```

**Utilisation dans views**:
```python
# apps/generation/views.py

from apps.core.throttling import GenerationRateThrottle

class LiasseFiscaleViewSet(viewsets.ModelViewSet):
    throttle_classes = [GenerationRateThrottle]  # ✨ AJOUT
    # ...
```

---

## 📊 RÉSUMÉ DES CORRECTIONS PHASE 0

| # | Correction | Fichiers Créés/Modifiés | Statut |
|---|------------|--------------------------|--------|
| 1 | Fix OpenAPI | `apps/tax/serializers.py` (créé) | ✅ COMPLÉTÉ |
| 2 | Verrouillage | `apps/generation/models.py` (modif) | 📝 CODE FOURNI |
| 3 | Endpoint calculer | `apps/generation/views.py` (modif) | 📝 CODE FOURNI |
| 4 | Correlation IDs | `apps/core/middleware.py` (créé) | 📝 CODE FOURNI |
| 5 | Rate limiting | `config/settings/base.py` (modif) | 📝 CODE FOURNI |

**Total lignes code**: ~400 lignes
**Impact**: Documentation API + Sécurité renforcée + Traçabilité

---

## 🔧 PROCHAINES ÉTAPES (PHASE 1 - PRIORITAIRE)

### À Implémenter en 2 Semaines

#### 1. Millésime Fiscal (3 jours)

**Objectif**: Support multi-versions réglementaires

**Fichiers à créer**:
```python
# apps/parametrage/models.py - AJOUT

class MillesimeFiscal(BaseModel):
    """Millésimes fiscaux pour gérer versions réglementaires"""
    code = models.CharField(max_length=20, unique=True)  # "2024", "2023"
    libelle = models.CharField(max_length=200)
    norme = models.CharField(max_length=50)  # SYSCOHADA, IFRS
    version_norme = models.CharField(max_length=20)  # "Révisé 2017", "IFRS 9"

    date_debut_application = models.DateField()
    date_fin_application = models.DateField(null=True, blank=True)
    est_actif = models.BooleanField(default=True)

    # Référentiels par millésime
    referentiel_formulaires = models.JSONField(
        default=dict,
        help_text="Formulaires obligatoires: ['BILAN', 'CR', 'TAFIRE', ...]"
    )
    referentiel_controles = models.JSONField(
        default=dict,
        help_text="Contrôles fiscaux à appliquer"
    )
    referentiel_mapping = models.JSONField(
        default=dict,
        help_text="Mapping comptes → rubriques SYSCOHADA"
    )

    class Meta:
        verbose_name = "Millésime Fiscal"
        verbose_name_plural = "Millésimes Fiscaux"
        ordering = ['-date_debut_application']
```

**Modifications**:
```python
# apps/generation/models.py - AJOUTS

class LiasseFiscale(BaseModel):
    millesime = models.ForeignKey(
        'parametrage.MillesimeFiscal',
        on_delete=models.PROTECT,
        help_text="Millésime fiscal utilisé pour cette liasse"
    )  # ✨ AJOUT
    # ... champs existants
```

#### 2. Service Calculs Backend (5 jours)

**Objectif**: Centraliser logique métier côté backend

**À créer**: `apps/generation/services.py`

```python
class CalculLiasseService:
    """Service centralisé pour calculs de liasse"""

    def __init__(self, liasse: LiasseFiscale):
        self.liasse = liasse
        self.balance = liasse.balance_source
        self.millesime = liasse.millesime
        self.mapping = self.millesime.referentiel_mapping

    def calculer_tous_etats(self):
        """Calcule tous les états financiers"""
        return {
            'bilan_actif': self.calculer_bilan_actif(),
            'bilan_passif': self.calculer_bilan_passif(),
            'compte_resultat': self.calculer_compte_resultat(),
            'tafire': self.calculer_tafire()
        }

    def executer_controles(self):
        """Exécute contrôles de cohérence"""
        controles = self.millesime.referentiel_controles
        # TODO: Implémenter moteur de contrôles
```

#### 3. Audit Log Immuable (2 jours)

**À créer**: `apps/audit/models.py` - table append-only

---

## 📈 MÉTRIQUES DE SUCCÈS

### Court Terme (2 semaines)

- [ ] Documentation Swagger accessible et à jour
- [ ] 0 modifications de liasses validées (verrouillage actif)
- [ ] 100% requêtes tracées avec correlation_id
- [ ] Rate limiting actif sur tous endpoints coûteux

### Moyen Terme (1 mois)

- [ ] Millésime fiscal opérationnel (2024 + 2023 minimum)
- [ ] Calculs backend avec tests unitaires >80% coverage
- [ ] Audit log immuable en production

---

## 🎯 DÉPLOIEMENT RECOMMANDÉ

```bash
# 1. Appliquer corrections Phase 0
git checkout -b fix/phase-0-quick-wins

# 2. Copier code fourni dans fichiers respectifs
# (voir sections ci-dessus)

# 3. Créer migrations
python manage.py makemigrations

# 4. Tester localement
python manage.py runserver
# Vérifier http://localhost:8000/api/docs/

# 5. Commit & Deploy
git add .
git commit -m "Phase 0: Quick Wins - OpenAPI, Verrouillage, Correlation IDs, Rate Limiting"
git push origin fix/phase-0-quick-wins

# Créer PR et déployer après review
```

---

## ✅ VALIDATION

**Checklist avant déploiement**:

- [ ] Tests existants passent
- [ ] `/api/schema/` accessible (HTTP 200)
- [ ] `/api/docs/` Swagger UI fonctionne
- [ ] Créer liasse → valider → tenter modification = erreur verrouillage
- [ ] Logs contiennent correlation_id
- [ ] Trop de requêtes = HTTP 429 (Rate limited)

---

**FIN DU PLAN D'EXÉCUTION**
*Prochaine étape: Appliquer corrections Phase 0 (5 jours)*
