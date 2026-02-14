# 🚀 Guide Complet de Déploiement - FiscaSync Production

**Version:** 1.0.0
**Date:** 21 Octobre 2025
**Statut:** ✅ Prêt pour Production

---

## 📚 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Scripts et Fichiers Créés](#scripts-et-fichiers-créés)
3. [Déploiement Docker](#déploiement-docker)
4. [Configuration Sentry](#configuration-sentry)
5. [Système de Backups](#système-de-backups)
6. [Commandes Utiles](#commandes-utiles)
7. [Monitoring et Alertes](#monitoring-et-alertes)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Vue d'ensemble

Ce guide rassemble tous les scripts et configurations créés pour déployer FiscaSync en production de manière sécurisée et automatisée.

### Architecture Déployée

```
┌─────────────────────────────────────────────────────────┐
│                    Internet (HTTPS)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                ┌────▼────┐
                │  Nginx  │ (Reverse Proxy + SSL)
                └────┬────┘
         ┌───────────┼───────────┐
         │                       │
    ┌────▼────┐            ┌────▼────┐
    │ Backend │            │Frontend │
    │  (API)  │            │ (React) │
    └────┬────┘            └─────────┘
         │
    ┌────┼────┐
    │         │
┌───▼──┐  ┌──▼───┐  ┌────────┐
│Postgres Redis │  │ Celery │
│  (DB)  │(Cache)│  │Workers │
└───┬───┘  └─────┘  └────────┘
    │
┌───▼───┐
│Backup │
│Service│
└───────┘
```

---

## 📦 Scripts et Fichiers Créés

### 1. **Docker et Déploiement**

| Fichier | Description |
|---------|-------------|
| `docker-compose.production.yml` | Configuration Docker Compose complète (9 services) |
| `backend/Dockerfile.production` | Image Docker optimisée pour le backend |
| `frontend/Dockerfile.production` | Image Docker multi-stage pour le frontend |
| `frontend/nginx.conf` | Configuration Nginx pour le frontend |
| `.env.docker.production` | Template des variables Docker |
| `scripts/deploy.sh` | **Script de déploiement automatique** (10 étapes) |
| `scripts/rollback.sh` | Script de rollback en cas de problème |

### 2. **Monitoring avec Sentry**

| Fichier | Description |
|---------|-------------|
| `backend/apps/core/middleware/sentry_middleware.py` | Middleware Sentry avec contexte enrichi |
| `backend/apps/core/management/commands/setup_sentry.py` | Commande Django pour tester Sentry |
| `frontend/src/sentry.ts` | Configuration Sentry React |
| `scripts/setup_sentry.sh` | **Script d'installation Sentry** (interactif) |

### 3. **Système de Backups**

| Fichier | Description |
|---------|-------------|
| `scripts/backup/backup.sh` | **Script de backup automatique** (DB + Media + Config) |
| `scripts/backup/restore.sh` | **Script de restauration** (interactif) |
| `scripts/backup/Dockerfile` | Image Docker pour le service de backup |
| `scripts/backup/docker-entrypoint.sh` | Point d'entrée du conteneur de backup |
| `scripts/backup/README.md` | Documentation complète des backups |

### 4. **Documentation**

| Fichier | Description |
|---------|-------------|
| `RAPPORT_PRE_PRODUCTION.md` | Rapport d'audit complet (95/100) |
| `GUIDE_DEPLOIEMENT_RAPIDE.md` | Guide pas-à-pas (Docker + Manuel) |
| `CORRECTIONS_APPLIQUEES_2025-10-21.md` | Détails des corrections effectuées |
| `backend/.env.production.template` | Template de configuration production |
| `scripts/pre_deploy_check.sh` | Script de vérification pré-déploiement |

---

## 🐳 Déploiement Docker

### Étape 1: Préparation

```bash
# 1. Cloner ou synchroniser le projet
cd /opt/fiscasync

# 2. Générer les mots de passe
openssl rand -base64 32  # Pour POSTGRES_PASSWORD
openssl rand -base64 32  # Pour REDIS_PASSWORD
openssl rand -base64 16  # Pour FLOWER_PASSWORD

# 3. Configurer les variables
cp .env.docker.production .env.production
nano .env.production
# Remplir: POSTGRES_PASSWORD, REDIS_PASSWORD, FLOWER_PASSWORD

# 4. Configurer le backend
cp backend/.env.production.template backend/.env.production
nano backend/.env.production
# Remplir toutes les variables (voir template)
```

### Étape 2: Génération de SECRET_KEY

```bash
# Générer une SECRET_KEY sécurisée
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# L'ajouter dans backend/.env.production
```

### Étape 3: Certificat SSL

```bash
# Installer Certbot
sudo apt install certbot -y

# Obtenir le certificat (méthode standalone - arrêter Nginx d'abord)
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  -d api.your-domain.com

# Copier les certificats
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
```

### Étape 4: Déploiement Automatique

```bash
# Rendre le script exécutable
chmod +x scripts/deploy.sh

# Lancer le déploiement
./scripts/deploy.sh
```

Le script effectue automatiquement :
1. ✅ Vérifications préalables (Docker, .env, etc.)
2. ✅ Backup pré-déploiement
3. ✅ Pull du code (si Git)
4. ✅ Build des images Docker
5. ✅ Arrêt des conteneurs existants
6. ✅ Démarrage des services
7. ✅ Attente de disponibilité
8. ✅ Migrations + collectstatic
9. ✅ Vérifications post-déploiement
10. ✅ Nettoyage

### Étape 5: Vérifications

```bash
# Vérifier que tous les conteneurs sont actifs
docker-compose -f docker-compose.production.yml ps

# Tester l'API
curl https://api.your-domain.com/api/health/

# Tester le frontend
curl https://your-domain.com/

# Voir les logs en temps réel
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🔍 Configuration Sentry

### Étape 1: Créer un Compte Sentry

1. Aller sur https://sentry.io/
2. Créer un compte (gratuit: 5000 événements/mois)
3. Créer un projet de type "Django"
4. Copier le DSN fourni

### Étape 2: Configuration Interactive

```bash
# Rendre le script exécutable
chmod +x scripts/setup_sentry.sh

# Lancer la configuration
./scripts/setup_sentry.sh
```

Le script :
- ✅ Installe sentry-sdk si nécessaire
- ✅ Demande le DSN Sentry
- ✅ Configure backend et frontend
- ✅ Crée les fichiers de configuration
- ✅ Teste la connexion

### Étape 3: Intégration Frontend

Ajouter dans `frontend/src/main.tsx` :

```typescript
import { initSentry } from './sentry';

// Initialiser Sentry AVANT le rendu de l'app
initSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Étape 4: Test

```bash
# Tester le backend
docker-compose exec backend python manage.py setup_sentry --test-error

# Tester le frontend
# Dans la console du navigateur:
# throw new Error('Test Sentry Frontend');

# Vérifier sur https://sentry.io/organizations/your-org/issues/
```

### Étape 5: Configurer les Alertes

Dans Sentry Dashboard:
1. Aller dans **Settings > Alerts**
2. Créer une règle pour les erreurs critiques
3. Configurer les notifications (Email, Slack, etc.)

**Exemple de règle:**
```
Nom: Erreurs critiques Production
Conditions:
  - Event level = error OR fatal
  - Environment = production
  - First seen
Actions:
  - Send email to: admin@fiscasync.com
  - Send Slack notification to: #alerts-production
```

---

## 💾 Système de Backups

### Configuration

Les backups sont **automatiques** via le conteneur `backup` :

```yaml
# Dans docker-compose.production.yml
backup:
  # Backups quotidiens à 02:00 UTC
  # Rétention: 30 jours (quotidiens), 8 semaines (hebdo), 12 mois (mensuels)
```

### Backups Manuels

```bash
# Exécuter un backup immédiat
docker-compose exec backup /usr/local/bin/backup.sh

# Vérifier les backups
ls -lh backups/
```

### Restauration

```bash
# Lancer la restauration interactive
docker-compose exec -it backup /usr/local/bin/restore.sh

# Le script vous guidera:
# 1. Sélection du backup
# 2. Confirmation (taper "YES")
# 3. Backup de sécurité automatique
# 4. Restauration DB + Media
# 5. Vérification
```

### Upload vers S3 (Optionnel)

```bash
# 1. Configurer dans .env.production
S3_ENABLED=true
S3_BUCKET=fiscasync-backups
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

# 2. Créer le bucket
aws s3 mb s3://fiscasync-backups --region eu-west-1

# 3. Les backups seront automatiquement uploadés
```

### Structure des Backups

```
backups/
├── 20251021_140530/              # Backup quotidien
│   ├── database/
│   │   ├── postgres_dump.custom  # Format binaire (optimal)
│   │   ├── postgres_dump.sql.gz  # Format SQL (portable)
│   │   └── schema.sql            # Schéma seul
│   ├── media/
│   │   └── media_files.tar.gz
│   ├── config/
│   │   └── env.sample
│   └── backup_info.json
│
├── weekly/                        # Backups hebdomadaires (dimanche)
├── monthly/                       # Backups mensuels (1er du mois)
└── last_backup_status.json       # Statut du dernier backup
```

---

## 🛠️ Commandes Utiles

### Gestion des Conteneurs

```bash
# Démarrer tous les services
docker-compose -f docker-compose.production.yml up -d

# Arrêter tous les services
docker-compose -f docker-compose.production.yml down

# Redémarrer un service spécifique
docker-compose -f docker-compose.production.yml restart backend

# Voir les logs d'un service
docker-compose -f docker-compose.production.yml logs -f backend

# Voir l'état des services
docker-compose -f docker-compose.production.yml ps

# Statistiques de ressources
docker stats
```

### Gestion de la Base de Données

```bash
# Se connecter à PostgreSQL
docker-compose exec postgres psql -U fiscasync_user fiscasync_prod

# Créer un backup manuel
docker-compose exec postgres pg_dump -U fiscasync_user fiscasync_prod > backup.sql

# Voir les tables
docker-compose exec postgres psql -U fiscasync_user fiscasync_prod -c "\dt"

# Voir les connexions actives
docker-compose exec postgres psql -U fiscasync_user -c "SELECT * FROM pg_stat_activity;"
```

### Gestion de Celery

```bash
# Voir les workers actifs
docker-compose exec celery_worker celery -A config inspect active

# Purger les tâches en attente
docker-compose exec celery_worker celery -A config purge

# Statistiques
docker-compose exec celery_worker celery -A config inspect stats

# Accéder à Flower (monitoring Celery)
# http://localhost:5555
```

### Django Management

```bash
# Créer un superuser
docker-compose exec backend python manage.py createsuperuser

# Exécuter les migrations
docker-compose exec backend python manage.py migrate

# Collecter les fichiers statiques
docker-compose exec backend python manage.py collectstatic --noinput

# Shell Django
docker-compose exec backend python manage.py shell

# Vérifier la configuration
docker-compose exec backend python manage.py check --deploy
```

### Rollback en Cas de Problème

```bash
# Rendre le script exécutable
chmod +x scripts/rollback.sh

# Lancer le rollback
./scripts/rollback.sh

# Le script :
# 1. Affiche les backups disponibles
# 2. Vous laisse choisir
# 3. Restaure automatiquement
```

---

## 📊 Monitoring et Alertes

### Endpoints de Santé

```bash
# Backend Health Check
curl https://api.your-domain.com/api/health/

# Response:
# {
#   "status": "ok",
#   "database": "ok",
#   "redis": "ok",
#   "celery": "ok"
# }

# Flower (Celery Monitoring)
# http://localhost:5555
# Authentification: FLOWER_USER / FLOWER_PASSWORD
```

### Logs Centralisés

```bash
# Tous les logs
docker-compose logs

# Logs spécifiques avec suivi
docker-compose logs -f backend
docker-compose logs -f celery_worker
docker-compose logs -f nginx

# Logs depuis un certain temps
docker-compose logs --since 1h backend

# Dernières 100 lignes
docker-compose logs --tail=100 backend
```

### Métriques à Surveiller

| Métrique | Seuil Critique | Action |
|----------|----------------|--------|
| Taux d'erreur 5xx | > 1% | Vérifier Sentry + logs |
| Temps de réponse P95 | > 2s | Optimiser requêtes DB |
| CPU | > 80% | Scale horizontal |
| RAM | > 85% | Augmenter ressources |
| Disk | > 80% | Nettoyer/augmenter |
| Queue Celery | > 1000 tâches | Ajouter workers |
| Backup Age | > 48h | Vérifier service backup |

### Script de Monitoring Simple

```bash
#!/bin/bash
# check_health.sh

# API Health
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health/)
if [ "$API_STATUS" != "200" ]; then
    echo "ALERT: API down (HTTP $API_STATUS)"
    # Envoyer notification (email, Slack, etc.)
fi

# Backup Age
LAST_BACKUP=$(cat backups/last_backup_status.json | jq -r '.timestamp')
BACKUP_DATE=$(date -d "$LAST_BACKUP" +%s)
NOW=$(date +%s)
AGE=$((NOW - BACKUP_DATE))

if [ $AGE -gt 172800 ]; then  # 48h
    echo "ALERT: Backup trop ancien ($(($AGE / 3600))h)"
fi

# Disk Space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERT: Disk usage ${DISK_USAGE}%"
fi
```

---

## 🚨 Troubleshooting

### Problème: Conteneur ne démarre pas

```bash
# Voir les logs détaillés
docker-compose logs [service_name]

# Vérifier la configuration
docker-compose config

# Reconstruire l'image
docker-compose build --no-cache [service_name]
docker-compose up -d [service_name]
```

### Problème: Erreur 502 Bad Gateway

```bash
# Vérifier que le backend est actif
docker-compose ps backend

# Vérifier les logs backend
docker-compose logs backend

# Vérifier que Gunicorn écoute sur le bon port
docker-compose exec backend netstat -tulpn | grep 8000

# Tester directement le backend
curl http://localhost:8000/api/health/

# Redémarrer Nginx
docker-compose restart nginx
```

### Problème: Base de données inaccessible

```bash
# Vérifier que PostgreSQL est actif
docker-compose ps postgres

# Tester la connexion
docker-compose exec postgres pg_isready -U fiscasync_user

# Voir les logs PostgreSQL
docker-compose logs postgres

# Se connecter manuellement
docker-compose exec postgres psql -U fiscasync_user fiscasync_prod
```

### Problème: Celery ne traite pas les tâches

```bash
# Vérifier les workers
docker-compose exec celery_worker celery -A config inspect active

# Voir la queue
docker-compose exec celery_worker celery -A config inspect reserved

# Vérifier Redis
docker-compose exec redis redis-cli ping

# Redémarrer Celery
docker-compose restart celery_worker celery_beat
```

### Problème: Backup échoue

```bash
# Voir les logs du backup
docker-compose logs backup

# Tester manuellement
docker-compose exec backup /usr/local/bin/backup.sh

# Vérifier l'espace disque
df -h

# Vérifier les permissions
docker-compose exec backup ls -la /backups/
```

### Problème: Sentry ne reçoit pas les événements

```bash
# Vérifier la configuration
grep SENTRY_DSN backend/.env.production

# Tester la connexion
docker-compose exec backend python manage.py setup_sentry --test-error

# Vérifier les logs
docker-compose logs backend | grep -i sentry

# Vérifier sur Sentry Dashboard
# https://sentry.io/organizations/your-org/projects/
```

---

## 🎓 Bonnes Pratiques

### Sécurité

1. ✅ Toujours utiliser HTTPS en production
2. ✅ Ne jamais committer les fichiers `.env`
3. ✅ Changer les mots de passe par défaut
4. ✅ Limiter l'accès SSH aux IPs connues
5. ✅ Activer le firewall (UFW)
6. ✅ Mettre à jour régulièrement les images Docker

### Performance

1. ✅ Utiliser un CDN pour les assets statiques
2. ✅ Activer le cache Redis
3. ✅ Optimiser les requêtes N+1
4. ✅ Dimensionner correctement les workers Celery
5. ✅ Monitorer les métriques régulièrement

### Maintenance

1. ✅ Backups quotidiens automatiques
2. ✅ Tests de restauration mensuels
3. ✅ Mise à jour des dépendances
4. ✅ Review des logs d'erreur Sentry
5. ✅ Nettoyage des anciens backups

---

## 📞 Support et Ressources

### Documentation

- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Sentry Documentation](https://docs.sentry.io/)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)

### Commandes d'Aide

```bash
# Aide Docker Compose
docker-compose --help

# Aide Django
docker-compose exec backend python manage.py help

# Aide Celery
docker-compose exec celery_worker celery --help
```

---

## ✅ Checklist de Production

### Avant le Lancement

- [ ] Toutes les variables d'environnement configurées
- [ ] SECRET_KEY générée (50+ caractères)
- [ ] Certificat SSL obtenu et installé
- [ ] PostgreSQL configuré et sécurisé
- [ ] Redis configuré avec mot de passe
- [ ] Backups automatiques testés
- [ ] Sentry configuré et testé
- [ ] Monitoring actif
- [ ] Alertes configurées
- [ ] Tests de charge effectués
- [ ] Documentation à jour

### Jour du Lancement

- [ ] Backup complet pré-déploiement
- [ ] Déploiement via `./scripts/deploy.sh`
- [ ] Vérification de tous les services
- [ ] Tests fonctionnels complets
- [ ] Monitoring intensif actif
- [ ] Équipe disponible pour support

### Post-Lancement (Semaine 1)

- [ ] Review quotidienne des métriques
- [ ] Review des erreurs Sentry
- [ ] Vérification des backups
- [ ] Tests de performance
- [ ] Collecte feedback utilisateurs
- [ ] Corrections rapides si nécessaire

---

**Dernière mise à jour:** 21 Octobre 2025
**Version:** 1.0.0
**Contact:** support@fiscasync.com

🚀 **FiscaSync est prêt pour la production !**
