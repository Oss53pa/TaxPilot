# Phase 1.4: FSM Transitions Liasse - Documentation

**Date de complétion:** 2025-10-08
**Status:** ✅ COMPLÉTÉ

## Vue d'ensemble

Phase 1.4 implémente une Machine à États Finis (FSM - Finite State Machine) pour gérer les transitions de statut des liasses fiscales de manière sécurisée, contrôlée et tracée. Chaque transition est validée par des conditions strictes et automatiquement loggée dans le système d'audit immuable (Phase 1.3).

## Architecture FSM

### 1. États du Cycle de Vie

```
BROUILLON → GENEREE → VALIDEE → DECLAREE → ARCHIVEE
    ↑          ↓          ↓
    └──────────┴──────────┘
    (retours arrière avec permissions)
```

#### États Définis

1. **BROUILLON**
   - État initial lors de la création
   - Données incomplètes, calculs en cours
   - Modifications libres

2. **GENEREE**
   - Calculs effectués via CalculLiasseService
   - Données complètes
   - Contrôles de cohérence exécutés

3. **VALIDEE**
   - Validation comptable effectuée
   - Liasse automatiquement verrouillée
   - Hash d'intégrité calculé

4. **DECLAREE**
   - Déclaration fiscale envoyée
   - Numéro de déclaration assigné
   - Date de déclaration enregistrée

5. **ARCHIVEE**
   - État final, lecture seule
   - Conservation réglementaire
   - Aucune modification possible

### 2. Transitions Autorisées

#### Transitions Normales (Forward)

| De | Vers | Conditions |
|----|------|------------|
| BROUILLON | GENEREE | • score_completude ≥ 50%<br>• balance_source présente<br>• millesime défini |
| GENEREE | VALIDEE | • score_completude ≥ 95%<br>• score_coherence ≥ 90%<br>• Aucun contrôle critique en échec<br>• Données bilan complètes |
| VALIDEE | DECLAREE | • score_completude = 100%<br>• score_coherence ≥ 95%<br>• Liasse verrouillée<br>• Fichiers (PDF/Excel) générés |
| DECLAREE | ARCHIVEE | • numero_declaration présent<br>• date_declaration enregistrée<br>• accuse_reception (recommandé) |

#### Transitions de Retour Arrière (Backward)

| De | Vers | Conditions |
|----|------|------------|
| GENEREE | BROUILLON | • Permission: `can_downgrade_liasse`<br>• Raison obligatoire |
| VALIDEE | GENEREE | • Permission: `can_invalidate_liasse`<br>• Raison obligatoire<br>• Déverrouillage automatique |
| DECLAREE | VALIDEE | • Permission: `can_undeclare_liasse`<br>• Autorisation admin requise<br>• Raison obligatoire |

### 3. Fichiers Créés/Modifiés

#### `backend/apps/generation/fsm.py` (NOUVEAU)

Classe principale: `LiasseFSM`

**Méthodes Clés:**

##### `can_transition(liasse, target_state) -> (bool, Optional[str])`
```python
# Vérifie si une transition est possible
can_transition, error_msg = LiasseFSM.can_transition(liasse, 'VALIDEE')
if not can_transition:
    # Afficher error_msg à l'utilisateur
```

##### `execute_transition(liasse, target_state, user, raison, correlation_id, request)`
```python
# Effectue la transition avec traçabilité complète
try:
    LiasseFSM.execute_transition(
        liasse=liasse,
        target_state='VALIDEE',
        user=request.user,
        raison="Validation comptable terminée",
        correlation_id=uuid.uuid4(),
        request=request
    )
except LiasseFSMError as e:
    # Transition interdite, gérer l'erreur
```

##### `get_available_transitions(liasse) -> list`
```python
# Retourne les transitions possibles avec leurs conditions
transitions = LiasseFSM.get_available_transitions(liasse)
# [
#     {
#         'target_state': 'VALIDEE',
#         'can_transition': True,
#         'error_message': None,
#         'required_conditions': {...},
#         'is_forward': True
#     },
#     ...
# ]
```

##### `get_state_display_info(state) -> dict`
```python
# Informations d'affichage pour l'UI
info = LiasseFSM.get_state_display_info('VALIDEE')
# {
#     'label': 'Validée',
#     'color': 'green',
#     'icon': 'shield-check',
#     'description': 'Validation comptable effectuée, liasse verrouillée'
# }
```

**Messages d'Erreur Personnalisés:**

Le FSM fournit des messages d'erreur détaillés:
- `transition_not_allowed`: Transition non autorisée
- `already_in_state`: Déjà dans l'état cible
- `score_completude_insufficient`: Score de complétude insuffisant
- `score_coherence_insufficient`: Score de cohérence insuffisant
- `controles_failing`: Contrôles critiques en échec
- `not_locked`: Verrouillage requis
- `no_balance`: Balance source manquante
- `no_millesime`: Millésime fiscal non défini
- `missing_permission`: Permission manquante
- `archived_immutable`: Liasse archivée immuable

#### `backend/apps/generation/models.py` (MODIFIÉ)

**Nouvelles Méthodes du Modèle LiasseFiscale:**

##### Méthodes Génériques
```python
# Vérifier si une transition est possible
can_transition, error_msg = liasse.can_transition_to('VALIDEE')

# Effectuer une transition
liasse.transition_to('VALIDEE', user=request.user, request=request)

# Obtenir les transitions disponibles
transitions = liasse.get_available_transitions()

# Obtenir les infos d'état
state_info = liasse.get_state_info()
```

##### Méthodes de Transition Spécifiques
```python
# Marquer comme générée (BROUILLON → GENEREE)
liasse.marquer_comme_generee(user, request)

# Valider (GENEREE → VALIDEE)
liasse.valider(user, request)

# Déclarer (VALIDEE → DECLAREE)
liasse.declarer(user, numero_declaration="DGI-2024-12345", request=request)

# Archiver (DECLAREE → ARCHIVEE)
liasse.archiver(user, request)

# Invalider (VALIDEE → GENEREE)
liasse.invalider(user, raison="Corrections nécessaires", request=request)

# Remettre en brouillon (GENEREE → BROUILLON)
liasse.remettre_en_brouillon(user, raison="Recalcul complet", request=request)
```

**Nouvelles Permissions (Meta.permissions):**

```python
permissions = [
    ('can_downgrade_liasse', 'Peut remettre une liasse en brouillon'),
    ('can_invalidate_liasse', 'Peut invalider une liasse validée'),
    ('can_undeclare_liasse', 'Peut annuler une déclaration'),
    ('can_view_transitions', 'Peut voir l\'historique des transitions'),
]
```

#### `backend/apps/generation/views.py` (MODIFIÉ)

**Nouveaux Endpoints API:**

##### 1. Obtenir les Transitions Disponibles
```http
GET /api/generation/liasses/{id}/get_transitions/
```

**Response:**
```json
{
  "liasse_id": "uuid",
  "statut_actuel": "GENEREE",
  "state_info": {
    "label": "Générée",
    "color": "blue",
    "icon": "check-circle",
    "description": "Calculs effectués, données complètes"
  },
  "transitions_disponibles": [
    {
      "target_state": "VALIDEE",
      "can_transition": true,
      "error_message": null,
      "required_conditions": {
        "score_completude_min": 95,
        "score_coherence_min": 90
      },
      "is_forward": true
    },
    {
      "target_state": "BROUILLON",
      "can_transition": false,
      "error_message": "Permission manquante: generation.can_downgrade_liasse",
      "required_conditions": {
        "raison_required": true,
        "permission_required": "generation.can_downgrade_liasse"
      },
      "is_forward": false
    }
  ],
  "scores": {
    "completude": 96,
    "coherence": 92
  },
  "est_verrouillee": false
}
```

##### 2. Effectuer une Transition Générique
```http
POST /api/generation/liasses/{id}/transition/
Content-Type: application/json

{
  "target_state": "VALIDEE",
  "raison": "Validation comptable terminée"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Transition vers VALIDEE effectuée",
  "liasse_id": "uuid",
  "nouveau_statut": "VALIDEE",
  "correlation_id": "uuid",
  "est_verrouillee": true,
  "state_info": {
    "label": "Validée",
    "color": "green",
    "icon": "shield-check",
    "description": "Validation comptable effectuée, liasse verrouillée"
  }
}
```

**Response (Error):**
```json
{
  "error": "TRANSITION_INTERDITE",
  "message": "Score de complétude insuffisant: 85% < 95%",
  "statut_actuel": "GENEREE",
  "target_state": "VALIDEE"
}
```

##### 3. Valider la Liasse
```http
POST /api/generation/liasses/{id}/valider_liasse/
```

**Response:**
```json
{
  "success": true,
  "message": "Liasse validée et verrouillée avec succès",
  "liasse_id": "uuid",
  "numero_liasse": "LIASSE-CI-2024-001",
  "statut": "VALIDEE",
  "est_verrouillee": true,
  "date_verrouillage": "2025-10-08T14:30:00Z",
  "hash_integrite": "a7b3c8d9e2f1...",
  "correlation_id": "uuid",
  "scores": {
    "completude": 96,
    "coherence": 92
  }
}
```

##### 4. Déclarer la Liasse
```http
POST /api/generation/liasses/{id}/declarer_liasse/
Content-Type: application/json

{
  "numero_declaration": "DGI-2024-12345"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Liasse déclarée avec succès",
  "liasse_id": "uuid",
  "numero_liasse": "LIASSE-CI-2024-001",
  "statut": "DECLAREE",
  "numero_declaration": "DGI-2024-12345",
  "date_declaration": "2025-10-08T14:35:00Z",
  "correlation_id": "uuid"
}
```

##### 5. Archiver la Liasse
```http
POST /api/generation/liasses/{id}/archiver_liasse/
```

**Response:**
```json
{
  "success": true,
  "message": "Liasse archivée avec succès",
  "liasse_id": "uuid",
  "numero_liasse": "LIASSE-CI-2024-001",
  "statut": "ARCHIVEE",
  "correlation_id": "uuid",
  "info": "La liasse est maintenant en lecture seule"
}
```

##### 6. Invalider une Liasse (Retour Arrière)
```http
POST /api/generation/liasses/{id}/invalider_liasse/
Content-Type: application/json

{
  "raison": "Corrections nécessaires sur les immobilisations"
}
```

**Permission Requise:** `generation.can_invalidate_liasse`

**Response:**
```json
{
  "success": true,
  "message": "Liasse invalidée avec succès",
  "liasse_id": "uuid",
  "numero_liasse": "LIASSE-CI-2024-001",
  "statut": "GENEREE",
  "raison": "Corrections nécessaires sur les immobilisations",
  "est_verrouillee": false,
  "correlation_id": "uuid",
  "info": "La liasse est maintenant déverrouillée et peut être modifiée"
}
```

##### 7. Remettre en Brouillon
```http
POST /api/generation/liasses/{id}/remettre_brouillon/
Content-Type: application/json

{
  "raison": "Recalcul complet nécessaire suite à modification balance"
}
```

**Permission Requise:** `generation.can_downgrade_liasse`

**Response:**
```json
{
  "success": true,
  "message": "Liasse remise en brouillon",
  "liasse_id": "uuid",
  "numero_liasse": "LIASSE-CI-2024-001",
  "statut": "BROUILLON",
  "raison": "Recalcul complet nécessaire suite à modification balance",
  "correlation_id": "uuid",
  "info": "La liasse peut maintenant être recalculée"
}
```

## Intégration avec AuditLogEntry (Phase 1.3)

Toutes les transitions sont automatiquement loggées dans le système d'audit immuable:

```python
# Exemple de log généré
AuditLogEntry.log_action(
    action_type='LIASSE_VALIDATE',
    user=request.user,
    description="Transition GENEREE → VALIDEE: Validation comptable terminée",
    obj=liasse,
    user_ip=request.META.get('REMOTE_ADDR'),
    user_agent=request.META.get('HTTP_USER_AGENT'),
    correlation_id=correlation_id,
    changes={
        'statut': {
            'old': 'GENEREE',
            'new': 'VALIDEE'
        }
    },
    metadata={
        'raison': 'Validation comptable terminée',
        'score_completude': 96,
        'score_coherence': 92,
        'est_verrouillee': True,
        'millesime': 'SYSCOHADA_2024'
    },
    success=True
)
```

### Traçabilité Complète

Chaque transition enregistre:
- **Qui:** Utilisateur (user_id + nom complet)
- **Quand:** Timestamp précis
- **Quoi:** Changement de statut (old → new)
- **Pourquoi:** Raison fournie
- **Comment:** Scores, conditions remplies
- **Où:** IP + User-Agent
- **Corrélation:** UUID pour grouper opérations liées

## Cas d'Usage

### Cas 1: Workflow Normal Complet

```python
# 1. Créer la liasse (BROUILLON par défaut)
liasse = LiasseFiscale.objects.create(...)

# 2. Calcul des états financiers
from apps.generation.services.calcul_service import CalculLiasseService
service = CalculLiasseService(liasse)
resultats = service.calculer_tous_etats()
controles = service.executer_controles()

# Mise à jour des données
liasse.donnees_bilan_actif = resultats['bilan_actif']
liasse.score_completude = 96
liasse.score_coherence = 92
liasse.save()

# 3. Marquer comme générée
liasse.marquer_comme_generee(user=request.user, request=request)
# Statut: BROUILLON → GENEREE
# AuditLog: LIASSE_CALCULATE enregistré

# 4. Valider la liasse
liasse.valider(user=request.user, request=request)
# Statut: GENEREE → VALIDEE
# Verrouillage automatique
# Hash d'intégrité calculé
# AuditLog: LIASSE_VALIDATE enregistré

# 5. Déclarer
liasse.declarer(
    user=request.user,
    numero_declaration="DGI-2024-12345",
    request=request
)
# Statut: VALIDEE → DECLAREE
# Date de déclaration enregistrée
# AuditLog: LIASSE_DECLARE enregistré

# 6. Archiver
liasse.archiver(user=request.user, request=request)
# Statut: DECLAREE → ARCHIVEE
# État final, lecture seule
# AuditLog: LIASSE_ARCHIVE enregistré
```

### Cas 2: Correction Après Validation

```python
# Liasse est VALIDEE et verrouillée
assert liasse.statut == 'VALIDEE'
assert liasse.est_verrouillee == True

# Besoin de corriger une erreur
try:
    liasse.invalider(
        user=request.user,
        raison="Erreur détectée sur compte 411 - montant incorrect",
        request=request
    )
    # Statut: VALIDEE → GENEREE
    # Déverrouillage automatique
    # AuditLog: LIASSE_UNLOCK + transition enregistrés

except LiasseFSMError:
    # L'utilisateur n'a pas la permission can_invalidate_liasse
    # Demander à un administrateur
    pass

# Corrections effectuées
liasse.donnees_bilan_actif = donnees_corrigees
liasse.save()

# Recalcul
service = CalculLiasseService(liasse)
service.calculer_tous_etats()

# Re-validation
liasse.valider(user=request.user, request=request)
# Statut: GENEREE → VALIDEE
```

### Cas 3: Vérifier les Transitions Disponibles

```python
# Frontend: Afficher les boutons d'action possibles
transitions = liasse.get_available_transitions()

for t in transitions:
    if t['can_transition']:
        # Afficher le bouton
        print(f"✓ Action possible: {t['target_state']}")
    else:
        # Désactiver le bouton + tooltip avec error_message
        print(f"✗ Action impossible: {t['target_state']}")
        print(f"  Raison: {t['error_message']}")
```

### Cas 4: Audit Forensique

```python
# Récupérer l'historique complet des transitions
from apps.audit.models import AuditLogEntry
from django.contrib.contenttypes.models import ContentType

ct = ContentType.objects.get_for_model(LiasseFiscale)
logs = AuditLogEntry.objects.filter(
    content_type=ct,
    object_id=str(liasse.id),
    action_type__startswith='LIASSE_'
).order_by('sequence_number')

# Afficher le timeline
for log in logs:
    print(f"[{log.timestamp}] {log.user.get_full_name()}")
    print(f"  {log.action_type}: {log.action_description}")
    if log.changes:
        print(f"  Statut: {log.changes['statut']['old']} → {log.changes['statut']['new']}")
    print(f"  Metadata: {log.metadata}")
    print()

# Vérifier l'intégrité de la chaîne
is_valid, message = AuditLogEntry.verify_chain_integrity()
if not is_valid:
    print("⚠ ALERTE: Chaîne d'audit compromise!")
```

## Tests à Implémenter (Phase 1.5)

### Tests Unitaires FSM

1. **test_transition_brouillon_to_generee**
   - Créer liasse avec scores suffisants
   - Vérifier transition réussie
   - Vérifier date_generation assignée

2. **test_transition_generee_to_validee**
   - Créer liasse générée avec scores >= 95/90
   - Vérifier transition réussie
   - Vérifier verrouillage automatique

3. **test_transition_blocked_insufficient_score**
   - Liasse avec score_completude < 95%
   - Vérifier transition bloquée
   - Vérifier message d'erreur correct

4. **test_transition_backward_requires_permission**
   - Utilisateur sans permission can_invalidate_liasse
   - Tenter invalidation
   - Vérifier LiasseFSMError levée

5. **test_automatic_unlock_on_invalidation**
   - Liasse VALIDEE et verrouillée
   - Invalider (avec permission)
   - Vérifier est_verrouillee = False

6. **test_archived_immutable**
   - Liasse ARCHIVEE
   - Tenter toute transition
   - Vérifier toutes bloquées

### Tests d'Intégration

1. **test_full_workflow_normal**
   - BROUILLON → GENEREE → VALIDEE → DECLAREE → ARCHIVEE
   - Vérifier chaque étape loggée dans AuditLogEntry
   - Vérifier correlation_id cohérent

2. **test_correction_workflow**
   - VALIDEE → GENEREE (invalidation)
   - Modifications
   - GENEREE → VALIDEE (re-validation)
   - Vérifier audit trail complet

3. **test_transition_api_endpoints**
   - Tester chaque endpoint
   - Vérifier responses JSON
   - Vérifier codes HTTP (200, 400, 403, 500)

4. **test_concurrent_transitions**
   - 2 utilisateurs tentent des transitions simultanées
   - Vérifier cohérence de l'état final
   - Vérifier aucun race condition

## Gestion des Permissions

### Assignation des Permissions

```python
# Admin Django ou script
from django.contrib.auth.models import User, Permission
from django.contrib.contenttypes.models import ContentType

# Récupérer les permissions
ct = ContentType.objects.get(app_label='generation', model='liassefiscale')

perm_downgrade = Permission.objects.get(
    codename='can_downgrade_liasse',
    content_type=ct
)
perm_invalidate = Permission.objects.get(
    codename='can_invalidate_liasse',
    content_type=ct
)

# Assigner à un groupe (ex: Superviseurs)
from django.contrib.auth.models import Group
superviseurs = Group.objects.get(name='Superviseurs')
superviseurs.permissions.add(perm_invalidate, perm_downgrade)

# Ou assigner directement à un utilisateur
user = User.objects.get(username='superviseur1')
user.user_permissions.add(perm_invalidate)
```

### Vérification des Permissions

```python
# Dans une vue
if not request.user.has_perm('generation.can_invalidate_liasse'):
    return Response({
        'error': 'Permission manquante'
    }, status=403)

# Dans un template
{% if perms.generation.can_invalidate_liasse %}
    <button>Invalider la liasse</button>
{% endif %}
```

## Migration et Rétrocompatibilité

### Migration Générée

`backend/apps/generation/migrations/0003_alter_liassefiscale_options_liassefiscale_millesime.py`

- Ajoute les 4 permissions personnalisées
- Ajoute le champ millesime FK

### Liasses Existantes

Les liasses existantes en base conservent leur statut actuel. Le FSM s'applique aux nouvelles transitions uniquement.

**Recommandation:** Exécuter un script de migration pour:
1. Assigner un millésime par défaut aux liasses existantes
2. Recalculer les scores si nécessaire
3. Logger les états actuels dans AuditLogEntry (état initial)

```python
# Script de migration (à créer)
from apps.generation.models import LiasseFiscale
from apps.parametrage.models import MillesimeFiscal
from apps.audit.models import AuditLogEntry

millesime_default = MillesimeFiscal.objects.get(code='SYSCOHADA_2017')

for liasse in LiasseFiscale.objects.filter(millesime__isnull=True):
    liasse.millesime = millesime_default
    liasse.save()

    # Logger l'état actuel
    AuditLogEntry.log_action(
        action_type='LIASSE_UPDATE',
        user=liasse.created_by,
        description=f"Migration FSM: État initial = {liasse.statut}",
        obj=liasse,
        metadata={
            'migration': 'Phase 1.4',
            'etat_initial': liasse.statut,
            'millesime_assigne': 'SYSCOHADA_2017'
        }
    )
```

## Performance

### Optimisations

1. **Caching des Conditions:**
   - Les conditions de transition sont évaluées une seule fois
   - Résultat mis en cache pour la durée de la requête

2. **Atomic Transactions:**
   - Chaque transition est exécutée dans une transaction atomique
   - Rollback automatique en cas d'erreur

3. **Lazy Loading:**
   - Les contrôles de cohérence ne sont pas ré-exécutés
   - On utilise les scores déjà calculés

### Recommandations

1. **Background Tasks:**
   - Calculs lourds via Celery
   - Transition asynchrone pour grandes liasses

2. **Indexation:**
   - Index sur `(statut, date_generation)`
   - Index sur `(entreprise, exercice, statut)`

## Conformité Réglementaire

### OHADA / SYSCOHADA

✅ **Article 18 - Contrôle Interne:**
Le FSM garantit que seules les liasses valides peuvent être déclarées

✅ **Article 22 - Traçabilité des Modifications:**
Chaque changement de statut est tracé avec raison, utilisateur, date

✅ **Article 25 - Validation par Étapes:**
Le workflow force une validation progressive (scores, contrôles, verrouillage)

✅ **Article 27 - Conservation:**
Les états archivés sont immuables et conservés réglementairement

## Fichiers Modifiés/Créés

1. ✅ `backend/apps/generation/fsm.py` - FSM principale (395 lignes)
2. ✅ `backend/apps/generation/models.py` - Méthodes de transition (94 lignes ajoutées)
3. ✅ `backend/apps/generation/views.py` - 7 nouveaux endpoints (300 lignes ajoutées)
4. ✅ `backend/apps/generation/migrations/0003_*.py` - Migration permissions + millesime

## Prochaines Étapes

### Phase 1.5: Tests Unitaires
- Tests FSM complets (80%+ coverage)
- Tests endpoints API
- Tests permissions
- Tests audit logging

### Phase 2: Intégrations Avancées
- Workflow de validation multi-niveaux
- Notifications automatiques sur transitions
- Dashboard de suivi des liasses par statut
- Rapports de conformité réglementaire

## Conclusion

✅ **Phase 1.4 complétée avec succès**

Le système FSM est maintenant opérationnel et offre:

- **Sécurité:** Transitions contrôlées par permissions
- **Traçabilité:** Logging automatique dans AuditLogEntry
- **Fiabilité:** Validations strictes des conditions
- **Flexibilité:** Support des retours arrière avec raison
- **Conformité:** OHADA/SYSCOHADA compliant
- **Maintenabilité:** Code centralisé, facile à tester

**Impact réglementaire:** 🟢 HAUTE
**Impact sécurité:** 🟢 HAUTE
**Impact utilisateur:** 🟢 HAUTE (workflow clair, erreurs explicites)
