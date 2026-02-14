# Installation et Configuration - Celery & PyTorch ✅

## Résumé de l'installation

### ✅ PyTorch
- **Version installée** : 2.7.1+cu118 (avec support CUDA 11.8)
- **Statut** : Opérationnel
- **Tests** : Import et opérations de base réussis
- **Note** : CUDA non disponible (pas de GPU compatible détecté)

### ✅ Celery
- **Version installée** : 5.5.3 (immunity)
- **Statut** : Opérationnel
- **Broker** : Redis (localhost:6379)
- **Result Backend** : Redis (localhost:6379)
- **Configuration** : `config/celery.py`

### ✅ Redis
- **Statut** : Démarré via Docker Compose
- **Port** : 6379
- **Connexion** : Testée et validée

---

## Configuration Celery

### Fichiers créés/modifiés

1. **`backend/config/celery.py`** ✨ NOUVEAU
   - Configuration principale de Celery
   - Définition des tâches (debug, audit, nettoyage, métriques)
   - Configuration des queues et du routing
   - Tâches périodiques

2. **`backend/config/__init__.py`** 🔧 MODIFIÉ
   - Chargement automatique de Celery au démarrage de Django

3. **`backend/celery_config.py`** ⚠️ ANCIEN
   - Peut être conservé pour rétrocompatibilité
   - Utiliser `config.celery` pour les nouvelles tâches

---

## Tâches Celery Enregistrées

```
✅ config.celery.debug_task - Tâche de test/debug
✅ config.celery.audit_quotidien - Audit automatique quotidien (2h)
✅ config.celery.nettoyer_cache - Nettoyage cache (1h)
✅ config.celery.sauvegarder_metriques - Sauvegarde métriques (30min)
```

---

## Scripts de Démarrage Créés

### 1. `backend/start_celery_worker.bat`
Démarre le worker Celery avec :
- Vérification automatique de Redis
- Activation de l'environnement virtuel
- Configuration optimale pour Windows (pool=solo)

**Usage** :
```bash
cd backend
.\start_celery_worker.bat
```

### 2. `backend/start_celery_beat.bat`
Démarre Celery Beat pour les tâches périodiques

**Usage** :
```bash
cd backend
.\start_celery_beat.bat
```

### 3. `backend/CELERY_README.md`
Guide complet avec :
- Commandes de démarrage
- Utilisation des tâches
- Monitoring
- Troubleshooting
- Configuration production

---

## Tests Créés

### 1. `backend/test_celery_simple.py`
Test en mode synchrone (eager)
```bash
python test_celery_simple.py
```

### 2. `backend/test_celery_connection.py`
Vérification de la connexion Redis/Celery et détection des workers
```bash
python test_celery_connection.py
```

### 3. `backend/test_celery_direct.py` ⭐ RECOMMANDÉ
Test d'exécution asynchrone avec worker
```bash
python test_celery_direct.py
```

---

## Démarrage Rapide

### 1. Démarrer Redis
```bash
# À la racine du projet
docker-compose up -d redis
```

### 2. Démarrer le Worker Celery
```bash
cd backend
.\start_celery_worker.bat
```

### 3. Tester l'exécution
```bash
# Dans un autre terminal
cd backend
venv\Scripts\activate
python test_celery_direct.py
```

**Résultat attendu** :
```
============================================================
Test Direct Celery - send_task
============================================================

1. Envoi de tache via app.send_task...
   [OK] Tache envoyee - ID: b0c4bb59-445d-47b7-991d-b5bac94ae63c
   Status: PENDING

2. Attente du resultat (10 secondes max)...
   [OK] Tache executee avec succes!
   Status: SUCCESS
   Resultat: {'status': 'debug_ok', 'task_id': '...'}

============================================================
TEST REUSSI!
============================================================
```

---

## Utilisation dans le Code

### Import
```python
from config.celery import debug_task, audit_quotidien
# Ou
from config import celery_app
```

### Exécution Asynchrone
```python
# Méthode 1 : Via la tâche directement
result = debug_task.delay()

# Méthode 2 : Via l'app
result = celery_app.send_task('config.celery.debug_task')

# Récupérer le résultat
task_result = result.get(timeout=10)
print(f"Status: {result.status}")  # SUCCESS
print(f"Result: {task_result}")    # {'status': 'debug_ok', ...}
```

### Vérifier le statut
```python
if result.ready():
    if result.successful():
        print(f"Résultat: {result.result}")
    else:
        print(f"Erreur: {result.traceback}")
else:
    print("Tâche en cours...")
```

---

## Commandes Celery Utiles

### Monitoring
```bash
# Inspecter les workers actifs
celery -A config inspect active

# Voir les tâches enregistrées
celery -A config inspect registered

# Ping des workers
celery -A config inspect ping

# Statistiques
celery -A config inspect stats
```

### Gestion
```bash
# Purger toutes les tâches en attente
celery -A config purge

# Révoquer une tâche
celery -A config control revoke <task_id>
```

---

## Configuration des Queues

Les tâches sont automatiquement routées vers différentes queues :

| Queue | Usage | Priorité |
|-------|-------|----------|
| `celery` | Tâches génériques | Normal |
| `audit` | Tâches d'audit | Normal |
| `audit_priority` | Audits critiques | Haute |
| `generation` | Génération de liasses | Normal |
| `generation_priority` | Génération urgente | Haute |
| `balance` | Import de balances | Normal |
| `long_tasks` | Tâches longues | Basse |

### Démarrer un worker pour une queue spécifique
```bash
celery -A config worker -Q audit -l info --pool=solo
```

---

## Troubleshooting

### Redis ne démarre pas
```bash
# Vérifier Docker
docker ps

# Redémarrer Redis
docker-compose restart redis
```

### Worker ne reçoit pas les tâches
1. Vérifier que Redis fonctionne
2. Vérifier que le worker utilise `-A config` et non `-A celery_config`
3. Vérifier les logs du worker

### Erreur "pool=solo not found"
Sur Windows, toujours utiliser `--pool=solo` :
```bash
celery -A config worker -l info --pool=solo
```

---

## Performance

### Configuration Actuelle
- **Prefetch multiplier** : 4 tâches
- **Task acks late** : Activé (plus sûr)
- **Concurrency** : 8 (solo pool)
- **Sérialisation** : JSON uniquement
- **Expiration résultats** : 1 heure

### Optimisation Production
```bash
# Augmenter la concurrence
celery -A config worker -l info --concurrency=16

# Plusieurs workers pour différentes queues
celery -A config worker -Q audit,generation -l info --pool=solo
```

---

## Sécurité

✅ **Sérialisation** : JSON uniquement (pas de pickle)
✅ **Accept content** : JSON uniquement
✅ **Expiration** : Résultats expirés après 1 heure
✅ **Task acks late** : Acquittement après exécution

---

## Prochaines Étapes

### 1. Créer vos propres tâches
```python
# Dans apps/mon_app/tasks.py
from config import celery_app

@celery_app.task
def ma_tache(param1, param2):
    # Votre code ici
    return {'result': 'success'}
```

### 2. Configurer Celery Beat pour les tâches périodiques
```python
# Dans config/celery.py
@app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=0, minute=0),  # Minuit
        ma_tache_quotidienne.s(),
        name='Ma tâche quotidienne'
    )
```

### 3. Monitoring avec Flower
```bash
pip install flower
celery -A config flower
# Accéder à http://localhost:5555
```

---

## Ressources

- 📚 [Documentation Celery](https://docs.celeryproject.org/)
- 🐍 [PyTorch Documentation](https://pytorch.org/docs/)
- 📖 [Guide complet](backend/CELERY_README.md)

---

## Statut Final

| Composant | Statut | Version |
|-----------|--------|---------|
| PyTorch | ✅ Opérationnel | 2.7.1+cu118 |
| Celery | ✅ Opérationnel | 5.5.3 |
| Redis | ✅ Opérationnel | 7-alpine |
| Configuration | ✅ Complète | config/celery.py |
| Tests | ✅ Réussis | 3 scripts de test |
| Documentation | ✅ Complète | CELERY_README.md |

---

**Date de configuration** : 2025-10-09
**Testeur** : Claude Code
**Résultat** : ✅ SUCCÈS COMPLET
