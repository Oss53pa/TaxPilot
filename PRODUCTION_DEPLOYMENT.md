# Guide de Déploiement en Production - FiscaSync

## Checklist Pré-Déploiement

### 1. Configuration Sécurité ✓

- [ ] **SECRET_KEY**: Génère une nouvelle clé unique et sécurisée
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- [ ] **DEBUG**: Vérifie que `DEBUG=False` dans `.env.production`
- [ ] **ALLOWED_HOSTS**: Configure tous les domaines autorisés
- [ ] **CORS_ALLOWED_ORIGINS**: Configure les origines frontend autorisées
- [ ] **SSL/HTTPS**: Configure les certificats SSL (Let's Encrypt recommandé)
- [ ] **HSTS**: Vérifie les paramètres HSTS (déjà configurés)
- [ ] **CSP**: Revue de la Content Security Policy

### 2. Base de Données

- [ ] **PostgreSQL**: Installe PostgreSQL 14+ avec SSL activé
  ```bash
  sudo apt-get install postgresql-14 postgresql-contrib
  ```
- [ ] **Backup**: Configure les sauvegardes automatiques
  ```bash
  # Exemple avec pg_dump
  0 2 * * * pg_dump fiscasync > /backups/fiscasync_$(date +\%Y\%m\%d).sql
  ```
- [ ] **SSL Mode**: Vérifie `sslmode=require` dans `DATABASE_URL`
- [ ] **Connection Pooling**: Configure PgBouncer (recommandé pour production)
- [ ] **Indexes**: Vérifie les index sur tables critiques

### 3. Cache & Redis

- [ ] **Redis**: Installe Redis 6+ avec persistence activée
  ```bash
  sudo apt-get install redis-server
  sudo systemctl enable redis-server
  ```
- [ ] **Redis Password**: Configure un mot de passe fort
  ```bash
  # Dans /etc/redis/redis.conf
  requirepass votre_mot_de_passe_securise
  ```
- [ ] **Maxmemory Policy**: Configure `maxmemory-policy allkeys-lru`
- [ ] **Persistence**: Active RDB + AOF pour durabilité

### 4. Variables d'Environnement

- [ ] Copie `.env.production.example` vers `.env.production`
  ```bash
  cp backend/.env.production.example backend/.env.production
  ```
- [ ] Remplis TOUTES les variables obligatoires
- [ ] Vérifie les permissions du fichier `.env.production` (600)
  ```bash
  chmod 600 backend/.env.production
  ```
- [ ] NE JAMAIS committer `.env.production` dans Git

### 5. Serveur Web

#### Option A: Nginx + Gunicorn (Recommandé)

**Installe Gunicorn:**
```bash
pip install gunicorn
```

**Crée un service systemd pour Gunicorn:**
```ini
# /etc/systemd/system/fiscasync.service
[Unit]
Description=FiscaSync Gunicorn Daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/fiscasync/backend
Environment="PATH=/var/www/fiscasync/backend/venv/bin"
ExecStart=/var/www/fiscasync/backend/venv/bin/gunicorn \
    --workers 4 \
    --bind unix:/run/fiscasync.sock \
    --timeout 120 \
    --access-logfile /var/log/fiscasync/access.log \
    --error-logfile /var/log/fiscasync/error.log \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

**Configure Nginx:**
```nginx
# /etc/nginx/sites-available/fiscasync
server {
    listen 443 ssl http2;
    server_name fiscasync.com www.fiscasync.com;

    ssl_certificate /etc/letsencrypt/live/fiscasync.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fiscasync.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    client_max_body_size 10M;

    location /static/ {
        alias /var/www/fiscasync/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /var/www/fiscasync/backend/media/;
        expires 1y;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://unix:/run/fiscasync.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name fiscasync.com www.fiscasync.com;
    return 301 https://$server_name$request_uri;
}
```

**Active et démarre les services:**
```bash
sudo systemctl enable fiscasync
sudo systemctl start fiscasync
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### 6. Celery (Tâches Asynchrones)

**Crée un service systemd pour Celery Worker:**
```ini
# /etc/systemd/system/fiscasync-celery.service
[Unit]
Description=FiscaSync Celery Worker
After=network.target redis.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/fiscasync/backend
Environment="PATH=/var/www/fiscasync/backend/venv/bin"
ExecStart=/var/www/fiscasync/backend/venv/bin/celery -A config worker \
    --loglevel=info \
    --logfile=/var/log/fiscasync/celery.log \
    --pidfile=/run/fiscasync-celery.pid

[Install]
WantedBy=multi-user.target
```

**Crée un service pour Celery Beat (tâches planifiées):**
```ini
# /etc/systemd/system/fiscasync-celery-beat.service
[Unit]
Description=FiscaSync Celery Beat
After=network.target redis.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/fiscasync/backend
Environment="PATH=/var/www/fiscasync/backend/venv/bin"
ExecStart=/var/www/fiscasync/backend/venv/bin/celery -A config beat \
    --loglevel=info \
    --logfile=/var/log/fiscasync/celery-beat.log \
    --pidfile=/run/fiscasync-celery-beat.pid

[Install]
WantedBy=multi-user.target
```

**Active et démarre:**
```bash
sudo systemctl enable fiscasync-celery
sudo systemctl start fiscasync-celery
sudo systemctl enable fiscasync-celery-beat
sudo systemctl start fiscasync-celery-beat
```

### 7. Monitoring & Logging

#### Sentry

- [ ] Crée un projet sur Sentry.io
- [ ] Configure `SENTRY_DSN` dans `.env.production`
- [ ] Teste l'envoi d'erreurs:
  ```python
  from sentry_sdk import capture_message
  capture_message('Test from production')
  ```

#### Logs

- [ ] Crée le répertoire des logs:
  ```bash
  sudo mkdir -p /var/log/fiscasync
  sudo chown www-data:www-data /var/log/fiscasync
  ```
- [ ] Configure logrotate:
  ```bash
  # /etc/logrotate.d/fiscasync
  /var/log/fiscasync/*.log {
      daily
      missingok
      rotate 14
      compress
      delaycompress
      notifempty
      create 0640 www-data www-data
      sharedscripts
      postrotate
          systemctl reload fiscasync > /dev/null 2>&1 || true
      endscript
  }
  ```

### 8. Static Files & Media

- [ ] Collecte les fichiers statiques:
  ```bash
  cd backend
  python manage.py collectstatic --noinput --settings=config.settings.production
  ```
- [ ] Configure les permissions:
  ```bash
  sudo chown -R www-data:www-data /var/www/fiscasync/backend/staticfiles
  sudo chown -R www-data:www-data /var/www/fiscasync/backend/media
  ```
- [ ] (Recommandé) Migre vers S3 ou Cloud Storage pour les fichiers media

### 9. Frontend

#### Build de Production

```bash
cd frontend
npm install
npm run build
```

#### Deploy avec Nginx

```nginx
# /etc/nginx/sites-available/fiscasync-frontend
server {
    listen 443 ssl http2;
    server_name app.fiscasync.com;

    ssl_certificate /etc/letsencrypt/live/app.fiscasync.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.fiscasync.com/privkey.pem;

    root /var/www/fiscasync/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 10. Base de Données - Migrations

- [ ] Sauvegarde la base AVANT les migrations:
  ```bash
  pg_dump fiscasync > backup_pre_deploy.sql
  ```
- [ ] Execute les migrations:
  ```bash
  python manage.py migrate --settings=config.settings.production
  ```
- [ ] Vérifie qu'aucune erreur

### 11. Tests Post-Déploiement

- [ ] **Health Check**: Teste l'endpoint de santé
  ```bash
  curl https://api.fiscasync.com/health/
  ```
- [ ] **Authentification**: Teste login/signup
- [ ] **Génération de liasse**: Teste une génération complète
- [ ] **Import balance**: Teste un import Excel
- [ ] **Export PDF**: Teste un export

### 12. Monitoring Continue

- [ ] Configure des alertes Sentry pour erreurs critiques
- [ ] Configure monitoring serveur (CPU, RAM, disque)
- [ ] Configure monitoring base de données (connexions, queries lentes)
- [ ] Configure monitoring Redis (mémoire, hit rate)
- [ ] Configure uptime monitoring (UptimeRobot, Pingdom, etc.)

### 13. Sauvegardes

- [ ] Sauvegarde base de données (daily)
- [ ] Sauvegarde fichiers media (weekly)
- [ ] Teste la restauration des sauvegardes
- [ ] Configure sauvegarde offsite (S3, Google Cloud, etc.)

### 14. Sécurité Post-Déploiement

- [ ] Scan de vulnérabilités avec `safety check`
  ```bash
  pip install safety
  safety check
  ```
- [ ] Scan SSL/TLS avec SSL Labs (https://www.ssllabs.com/ssltest/)
- [ ] Vérifie headers de sécurité avec SecurityHeaders.com
- [ ] Configure fail2ban pour protection DDoS
- [ ] Active le firewall (ufw)
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```

### 15. Performance

- [ ] Active Gzip compression (déjà configuré)
- [ ] Configure CDN pour static files (CloudFlare, etc.)
- [ ] Optimise les images (compression, WebP)
- [ ] Enable HTTP/2 (déjà configuré dans Nginx)
- [ ] Configure browser caching

## Commandes Utiles

### Restart Services
```bash
sudo systemctl restart fiscasync
sudo systemctl restart fiscasync-celery
sudo systemctl restart nginx
```

### Voir les Logs
```bash
# Django logs
sudo tail -f /var/log/fiscasync/error.log

# Celery logs
sudo tail -f /var/log/fiscasync/celery.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Status Services
```bash
sudo systemctl status fiscasync
sudo systemctl status fiscasync-celery
sudo systemctl status redis
sudo systemctl status postgresql
```

## Rollback en Cas de Problème

```bash
# 1. Restore database backup
psql fiscasync < backup_pre_deploy.sql

# 2. Revenir au commit précédent
git reset --hard <commit-hash-precedent>

# 3. Restart services
sudo systemctl restart fiscasync
sudo systemctl restart fiscasync-celery
```

## Support

En cas de problème:
1. Consulte les logs: `/var/log/fiscasync/`
2. Vérifie Sentry pour les erreurs
3. Consulte la documentation Django
4. Contact: support@fiscasync.com
