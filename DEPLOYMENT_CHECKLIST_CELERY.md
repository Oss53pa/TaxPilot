# ✅ Checklist de Déploiement - Celery & PyTorch

## Avant de Mettre en Production

### 1. ✅ Vérifications Locales (TERMINÉ)

- [x] PyTorch installé (v2.7.1+cu118)
- [x] Celery installé (v5.5.3)
- [x] Configuration Celery créée (`config/celery.py`)
- [x] Redis fonctionne via Docker
- [x] Tests asynchrones réussis
- [x] Worker démarre correctement
- [x] Docker-compose utilise `-A config`

### 2. ⚠️ Actions Avant Déploiement

#### A. Variables d'Environnement

✅ **Déjà configuré dans docker-compose.yml !**

Le fichier `docker-compose.yml` contient maintenant les bonnes variables :

```yaml
environment:
  - CELERY_BROKER_URL=redis://redis:6379/0
  - CELERY_RESULT_BACKEND=redis://redis:6379/0
```

Ces variables **surchargent** les valeurs par défaut de `base.py` pour utiliser le hostname Docker correct (`redis` au lieu de `localhost`).

✅ **Rien à modifier** - tout fonctionne !

#### B. Services à Démarrer

```bash
# 1. Base de données
docker-compose up -d db

# 2. Redis (REQUIS pour Celery)
docker-compose up -d redis

# 3. Backend Django
docker-compose up -d backend

# 4. Worker Celery (IMPORTANT!)
docker-compose up -d celery

# 5. Frontend (optionnel)
docker-compose up -d frontend
```

#### C. Celery Beat (Tâches Périodiques)

Si vous voulez les tâches périodiques, ajoutez au `docker-compose.yml` :

```yaml
celery-beat:
  build:
    context: ./backend
    dockerfile: Dockerfile
  command: celery -A config beat -l info
  volumes:
    - ./backend:/app
  depends_on:
    - redis
    - db
  environment:
    - DEBUG=0
    - DB_NAME=fiscasync
    - DB_USER=fiscasync
    - DB_PASSWORD=fiscasync
    - DB_HOST=db
    - DB_PORT=5432
```

### 3. 🔍 Vérifications Post-Déploiement

#### Vérifier Redis
```bash
docker-compose exec redis redis-cli ping
# Doit retourner: PONG
```

#### Vérifier le Worker Celery
```bash
docker-compose logs celery
# Doit afficher: "celery@... ready."
```

#### Tester une Tâche
```bash
docker-compose exec backend python manage.py shell
>>> from config.celery import debug_task
>>> result = debug_task.delay()
>>> result.get(timeout=5)
# Doit retourner: {'status': 'debug_ok', 'task_id': '...'}
```

#### Inspecter les Workers
```bash
docker-compose exec backend celery -A config inspect active
docker-compose exec backend celery -A config inspect registered
```

### 4. 📊 Monitoring (Optionnel mais Recommandé)

#### Option A : Flower (Interface Web)

Ajoutez au `docker-compose.yml` :

```yaml
flower:
  build:
    context: ./backend
    dockerfile: Dockerfile
  command: celery -A config flower --port=5555
  ports:
    - "5555:5555"
  depends_on:
    - redis
    - celery
  environment:
    - CELERY_BROKER_URL=redis://redis:6379/0
```

Puis installez Flower :
```bash
docker-compose exec backend pip install flower
docker-compose up -d flower
```

Accédez à : `http://votre-serveur:5555`

#### Option B : Logs Docker

```bash
# Suivre les logs en temps réel
docker-compose logs -f celery

# Voir les derniers logs
docker-compose logs --tail=100 celery
```

### 5. 🚨 Points Critiques

#### ⚠️ IMPORTANT : Pool sur Linux

En production (Linux), changez le pool dans docker-compose.yml :

```yaml
# ❌ Windows
command: celery -A config worker -l info --pool=solo

# ✅ Linux/Production
command: celery -A config worker -l info --concurrency=4
```

#### ⚠️ Sécurité

- Changez les credentials Redis en production
- Utilisez des secrets Docker ou variables d'environnement
- N'exposez pas Redis publiquement (port 6379)

#### ⚠️ Performance

Ajustez la concurrence selon vos besoins :

```yaml
# Tâches légères
command: celery -A config worker -l info --concurrency=8

# Tâches lourdes (PyTorch, etc.)
command: celery -A config worker -l info --concurrency=2
```

### 6. 🐛 Troubleshooting en Production

#### Worker ne démarre pas
```bash
# Vérifier les logs
docker-compose logs celery

# Redémarrer le worker
docker-compose restart celery
```

#### Redis inaccessible
```bash
# Vérifier que Redis tourne
docker-compose ps redis

# Tester la connexion
docker-compose exec backend python -c "import redis; r = redis.Redis(host='redis', port=6379); print(r.ping())"
```

#### Tâches en PENDING
```bash
# Vérifier que le worker écoute
docker-compose exec backend celery -A config inspect active

# Purger les tâches bloquées
docker-compose exec backend celery -A config purge
```

### 7. 📝 Configuration (Déjà Faite ✅)

#### Configuration Actuelle

**Tout est déjà configuré !** Vous n'avez rien à ajouter :

✅ **`config/celery.py`** - Configuration principale :
- Worker prefetch: 4
- Task acks late: True
- Monitoring: Events activés
- Queues: audit, generation, balance, etc.

✅ **`config/settings/base.py`** - URLs Redis :
```python
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
```

#### Variables d'Environnement (Optionnel)

En production, vous pouvez **surcharger** via variables d'environnement :

```bash
# Dans docker-compose.yml ou .env
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

**Mais ce n'est pas nécessaire** - les valeurs par défaut fonctionnent déjà !

### 8. ✅ Checklist Finale

Avant de déclarer "prêt pour production" :

- [ ] Redis accessible depuis les containers
- [ ] Worker Celery démarre sans erreur
- [ ] Test d'une tâche réussit (debug_task)
- [ ] Logs du worker montrent "ready"
- [ ] Variables d'environnement configurées
- [ ] Pool adapté à la plateforme (solo=Windows, prefork=Linux)
- [ ] Concurrence ajustée selon les besoins
- [ ] Monitoring configuré (logs ou Flower)
- [ ] Celery Beat démarré si tâches périodiques nécessaires
- [ ] Backups Redis configurés (si stockage critique)

---

## 🎯 État Actuel

| Item | Local | Production |
|------|-------|------------|
| PyTorch | ✅ 2.7.1 | ⏳ À déployer |
| Celery | ✅ 5.5.3 | ⏳ À déployer |
| Redis | ✅ Docker | ⏳ À déployer |
| Config | ✅ config/celery.py | ✅ Prêt |
| Tests | ✅ Réussis | ⏳ À tester |
| Docker | ✅ Configuré | ✅ Prêt |
| Monitoring | ⚠️ Logs | ⏳ Flower recommandé |

---

## 🚀 Commande de Déploiement Rapide

```bash
# Sur le serveur de production
git pull
docker-compose build backend celery
docker-compose up -d redis db backend celery

# Vérifier
docker-compose ps
docker-compose logs celery

# Tester
docker-compose exec backend python manage.py shell
>>> from config.celery import debug_task
>>> debug_task.delay().get(timeout=5)
```

---

## 📞 Support

En cas de problème, consultez :
- `backend/CELERY_README.md` - Guide complet
- `CELERY_PYTORCH_SETUP_COMPLETE.md` - Résumé installation
- Logs : `docker-compose logs celery`
- Flower : `http://votre-serveur:5555` (si installé)

---

**Prêt pour la production ? OUI, avec les vérifications ci-dessus !** ✅
