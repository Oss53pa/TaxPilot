# ⚡ Déploiement Rapide Docker - FiscaSync Production

Guide ultra-rapide pour déployer FiscaSync en production avec Docker.

---

## 🚀 Déploiement en 5 Minutes

### 1️⃣ Prérequis (1 min)

```bash
# Vérifier que Docker est installé
docker --version
docker-compose --version

# Se placer dans le répertoire du projet
cd /opt/fiscasync
```

### 2️⃣ Configuration (2 min)

```bash
# Générer les mots de passe
POSTGRES_PWD=$(openssl rand -base64 32)
REDIS_PWD=$(openssl rand -base64 32)
DJANGO_SECRET=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")

# Créer .env.production
cat > .env.production <<EOF
POSTGRES_DB=fiscasync_prod
POSTGRES_USER=fiscasync_user
POSTGRES_PASSWORD=$POSTGRES_PWD
REDIS_PASSWORD=$REDIS_PWD
VITE_API_URL=https://api.your-domain.com
FLOWER_USER=admin
FLOWER_PASSWORD=$(openssl rand -base64 16)
EOF

# Créer backend/.env.production
cat > backend/.env.production <<EOF
SECRET_KEY=$DJANGO_SECRET
DEBUG=False
ENVIRONMENT=production
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,api.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
DATABASE_URL=postgresql://fiscasync_user:$POSTGRES_PWD@postgres:5432/fiscasync_prod
REDIS_URL=redis://:$REDIS_PWD@redis:6379
CELERY_BROKER_URL=redis://:$REDIS_PWD@redis:6379/0
EOF

echo "✅ Configuration créée !"
```

### 3️⃣ Déploiement (2 min)

```bash
# Rendre les scripts exécutables
chmod +x scripts/*.sh
chmod +x scripts/backup/*.sh

# Lancer le déploiement automatique
./scripts/deploy.sh
```

**C'est tout !** Le script fait automatiquement :
- ✅ Build des images Docker
- ✅ Démarrage des services
- ✅ Migrations de base de données
- ✅ Collection des fichiers statiques
- ✅ Vérifications de santé

---

## 📋 Commandes Essentielles

### Gestion des Services

```bash
# Démarrer
docker-compose -f docker-compose.production.yml up -d

# Arrêter
docker-compose -f docker-compose.production.yml down

# Redémarrer
docker-compose -f docker-compose.production.yml restart

# Logs en temps réel
docker-compose -f docker-compose.production.yml logs -f

# Statut
docker-compose -f docker-compose.production.yml ps
```

### Backup & Restauration

```bash
# Backup manuel
docker-compose exec backup /usr/local/bin/backup.sh

# Restauration interactive
docker-compose exec -it backup /usr/local/bin/restore.sh

# Lister les backups
ls -lh backups/
```

### Django Management

```bash
# Créer un superuser
docker-compose exec backend python manage.py createsuperuser

# Shell Django
docker-compose exec backend python manage.py shell

# Migrations
docker-compose exec backend python manage.py migrate
```

### Monitoring

```bash
# Health check API
curl http://localhost:8000/api/health/

# Flower (Celery monitoring)
# http://localhost:5555

# Voir les métriques
docker stats
```

---

## 🔧 Configuration Sentry (Optionnel - 3 min)

```bash
# 1. Aller sur https://sentry.io/ et créer un compte
# 2. Créer un projet Django
# 3. Copier le DSN

# 4. Lancer le script de configuration
./scripts/setup_sentry.sh

# 5. Suivre les instructions interactives

# 6. Tester
docker-compose exec backend python manage.py setup_sentry --test-error
```

---

## 📦 Services Déployés

| Service | URL/Port | Authentification |
|---------|----------|------------------|
| Frontend | http://localhost:80 | - |
| Backend API | http://localhost:8000 | JWT Token |
| Admin Django | http://localhost:8000/admin/ | Superuser |
| Flower (Celery) | http://localhost:5555 | FLOWER_USER/FLOWER_PASSWORD |
| PostgreSQL | localhost:5432 | POSTGRES_USER/POSTGRES_PASSWORD |
| Redis | localhost:6379 | REDIS_PASSWORD |

---

## 🆘 Problèmes Fréquents

### Service ne démarre pas

```bash
# Voir les logs
docker-compose logs [service_name]

# Reconstruire
docker-compose build --no-cache [service_name]
docker-compose up -d [service_name]
```

### Erreur 502 Bad Gateway

```bash
# Vérifier le backend
docker-compose logs backend

# Redémarrer Nginx
docker-compose restart nginx
```

### Base de données inaccessible

```bash
# Vérifier PostgreSQL
docker-compose exec postgres pg_isready

# Voir les logs
docker-compose logs postgres
```

---

## 📚 Documentation Complète

- **Guide Complet:** `DEPLOIEMENT_GUIDE_COMPLET.md`
- **Rapport Pré-Production:** `RAPPORT_PRE_PRODUCTION.md`
- **Guide Déploiement Détaillé:** `GUIDE_DEPLOIEMENT_RAPIDE.md`
- **Documentation Backups:** `scripts/backup/README.md`

---

## ✅ Checklist Post-Déploiement

- [ ] Tous les conteneurs sont actifs (`docker-compose ps`)
- [ ] API répond (`curl http://localhost:8000/api/health/`)
- [ ] Frontend accessible (`curl http://localhost`)
- [ ] Créer un superuser Django
- [ ] Configurer Sentry (optionnel)
- [ ] Tester un backup
- [ ] Configurer le monitoring
- [ ] Configurer SSL/HTTPS pour production

---

## 🎯 Prochaines Étapes

1. **SSL/HTTPS:** Installer Let's Encrypt
   ```bash
   sudo certbot certonly --standalone -d your-domain.com
   ```

2. **Domaine:** Configurer DNS A/AAAA records

3. **Firewall:** Configurer UFW
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

4. **Monitoring:** Configurer Sentry et alertes

5. **Backups Cloud:** Configurer S3 pour backups distants

---

**🚀 FiscaSync est maintenant déployé !**

Pour toute question: support@fiscasync.com
