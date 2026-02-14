# 🚀 Guide de Déploiement Rapide - FiscaSync

**Version:** 1.0.0
**Date:** 21 Octobre 2025
**Temps estimé:** 2-3 heures

---

## 📋 Pré-requis

### Serveur
- **OS:** Ubuntu 22.04 LTS (recommandé) ou Debian 11+
- **CPU:** Minimum 4 vCPU (8 vCPU recommandé)
- **RAM:** Minimum 8 GB (16 GB recommandé)
- **Stockage:** Minimum 100 GB SSD
- **Réseau:** IP publique + nom de domaine

### Logiciels requis
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Nginx
- Docker & Docker Compose (optionnel)

---

## 🎯 Méthode 1: Déploiement Docker (Recommandé)

### Étape 1: Préparer le serveur

```bash
# Se connecter au serveur
ssh user@your-server-ip

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo apt install docker-compose -y

# Redémarrer la session
exit
ssh user@your-server-ip
```

### Étape 2: Cloner le projet

```bash
# Créer le répertoire de déploiement
sudo mkdir -p /opt/fiscasync
sudo chown $USER:$USER /opt/fiscasync
cd /opt/fiscasync

# Cloner le repository
git clone https://github.com/votre-org/fiscasync.git .

# Ou uploader via rsync
# rsync -avz --exclude 'node_modules' --exclude 'venv' \
#   /chemin/local/FiscaSync/ user@your-server:/opt/fiscasync/
```

### Étape 3: Configurer les variables d'environnement

```bash
# Copier le template
cp backend/.env.production.template backend/.env.production

# Générer SECRET_KEY
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Éditer le fichier
nano backend/.env.production
```

**Variables CRITIQUES à modifier:**
```env
SECRET_KEY=<votre-clé-générée-ci-dessus>
ALLOWED_HOSTS=your-domain.com,www.your-domain.com,api.your-domain.com
DATABASE_URL=postgresql://fiscasync_user:PASSWORD@postgres:5432/fiscasync_prod
REDIS_URL=redis://redis:6379
CORS_ALLOWED_ORIGINS=https://your-domain.com
EMAIL_HOST_USER=noreply@your-domain.com
EMAIL_HOST_PASSWORD=<votre-mot-de-passe-email>
SENTRY_DSN=<votre-sentry-dsn>
```

### Étape 4: Créer docker-compose.production.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: fiscasync_postgres
    environment:
      POSTGRES_DB: fiscasync_prod
      POSTGRES_USER: fiscasync_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fiscasync_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: fiscasync_redis
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.production
    container_name: fiscasync_backend
    env_file:
      - backend/.env.production
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.production
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4"

  celery:
    build:
      context: ./backend
      dockerfile: Dockerfile.production
    container_name: fiscasync_celery
    env_file:
      - backend/.env.production
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.production
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    command: celery -A config worker -l info --concurrency=4

  celery-beat:
    build:
      context: ./backend
      dockerfile: Dockerfile.production
    container_name: fiscasync_celery_beat
    env_file:
      - backend/.env.production
    environment:
      - DJANGO_SETTINGS_MODULE=config.settings.production
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    command: celery -A config beat -l info

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.production
      args:
        - VITE_API_URL=https://api.your-domain.com
    container_name: fiscasync_frontend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: fiscasync_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static_volume:/var/www/static:ro
      - media_volume:/var/www/media:ro
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
```

### Étape 5: Configurer Nginx

```bash
# Créer le répertoire de configuration
mkdir -p nginx

# Créer nginx.conf
cat > nginx/nginx.conf <<'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:3000;
    }

    # Redirection HTTP -> HTTPS
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    # Frontend
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

    # Backend API
    server {
        listen 443 ssl http2;
        server_name api.your-domain.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        client_max_body_size 50M;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;

        location /static/ {
            alias /var/www/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location /media/ {
            alias /var/www/media/;
            expires 1y;
            add_header Cache-Control "public";
        }

        location / {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
```

### Étape 6: Obtenir certificat SSL (Let's Encrypt)

```bash
# Installer certbot
sudo apt install certbot -y

# Obtenir le certificat
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# Copier les certificats
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl

# Auto-renouvellement
sudo crontab -e
# Ajouter: 0 0 * * 0 certbot renew --quiet && docker-compose restart nginx
```

### Étape 7: Créer Dockerfile.production pour Backend

```bash
cat > backend/Dockerfile.production <<'EOF'
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Installer dépendances système
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copier et installer les requirements
COPY requirements/production.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code
COPY . .

# Créer utilisateur non-root
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]
EOF
```

### Étape 8: Créer Dockerfile.production pour Frontend

```bash
cat > frontend/Dockerfile.production <<'EOF'
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
EOF
```

### Étape 9: Lancer l'application

```bash
# Build et démarrage
docker-compose -f docker-compose.production.yml up -d --build

# Vérifier les logs
docker-compose -f docker-compose.production.yml logs -f

# Créer un superuser
docker-compose exec backend python manage.py createsuperuser

# Vérifier que tout fonctionne
docker-compose ps
```

### Étape 10: Vérifications post-déploiement

```bash
# Tester l'API
curl https://api.your-domain.com/api/health/

# Tester le frontend
curl https://your-domain.com/

# Vérifier les certificats SSL
openssl s_client -connect your-domain.com:443 -servername your-domain.com < /dev/null

# Vérifier les headers de sécurité
curl -I https://your-domain.com/
```

---

## 🎯 Méthode 2: Déploiement Manuel (Sans Docker)

### Étape 1: Installation des dépendances

```bash
# Python et PostgreSQL
sudo apt install python3.11 python3.11-venv python3-pip postgresql postgresql-contrib -y

# Redis
sudo apt install redis-server -y

# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Nginx
sudo apt install nginx -y
```

### Étape 2: Configuration PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE fiscasync_production;
CREATE USER fiscasync_user WITH PASSWORD 'CHANGE_ME_STRONG_PASSWORD';
ALTER ROLE fiscasync_user SET client_encoding TO 'utf8';
ALTER ROLE fiscasync_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE fiscasync_user SET timezone TO 'Africa/Abidjan';
GRANT ALL PRIVILEGES ON DATABASE fiscasync_production TO fiscasync_user;
\q
```

### Étape 3: Déployer le Backend

```bash
# Créer l'environnement virtuel
cd /opt/fiscasync/backend
python3.11 -m venv venv
source venv/bin/activate

# Installer les dépendances
pip install -r requirements/production.txt

# Configurer l'environnement
cp .env.production.template .env.production
nano .env.production  # Éditer les valeurs

# Migrations et collectstatic
export DJANGO_SETTINGS_MODULE=config.settings.production
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### Étape 4: Déployer le Frontend

```bash
cd /opt/fiscasync/frontend

# Installer les dépendances
npm ci

# Build de production
VITE_API_URL=https://api.your-domain.com npm run build

# Copier vers Nginx
sudo mkdir -p /var/www/fiscasync
sudo cp -r dist/* /var/www/fiscasync/
```

### Étape 5: Configurer systemd pour Backend

```bash
# Créer le service Gunicorn
sudo nano /etc/systemd/system/fiscasync-backend.service
```

```ini
[Unit]
Description=FiscaSync Backend (Gunicorn)
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/opt/fiscasync/backend
Environment="DJANGO_SETTINGS_MODULE=config.settings.production"
EnvironmentFile=/opt/fiscasync/backend/.env.production
ExecStart=/opt/fiscasync/backend/venv/bin/gunicorn \
    --workers 4 \
    --bind 0.0.0.0:8000 \
    --timeout 300 \
    --access-logfile /var/log/fiscasync/access.log \
    --error-logfile /var/log/fiscasync/error.log \
    config.wsgi:application

[Install]
WantedBy=multi-user.target
```

```bash
# Créer le service Celery Worker
sudo nano /etc/systemd/system/fiscasync-celery.service
```

```ini
[Unit]
Description=FiscaSync Celery Worker
After=network.target redis.service

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/opt/fiscasync/backend
Environment="DJANGO_SETTINGS_MODULE=config.settings.production"
EnvironmentFile=/opt/fiscasync/backend/.env.production
ExecStart=/opt/fiscasync/backend/venv/bin/celery -A config worker -l info

[Install]
WantedBy=multi-user.target
```

```bash
# Activer et démarrer les services
sudo mkdir -p /var/log/fiscasync
sudo chown www-data:www-data /var/log/fiscasync

sudo systemctl daemon-reload
sudo systemctl enable fiscasync-backend fiscasync-celery
sudo systemctl start fiscasync-backend fiscasync-celery

# Vérifier le statut
sudo systemctl status fiscasync-backend
sudo systemctl status fiscasync-celery
```

### Étape 6: Configurer Nginx (même que méthode Docker)

Suivre la configuration Nginx de la méthode 1.

---

## 🔍 Vérifications Finales

### Checklist de déploiement

```bash
# 1. Vérifier que tous les services sont up
docker-compose ps  # ou sudo systemctl status

# 2. Tester les endpoints
curl https://api.your-domain.com/api/health/
curl https://your-domain.com/

# 3. Vérifier les logs
docker-compose logs backend
# ou
sudo journalctl -u fiscasync-backend -f

# 4. Tester l'authentification
curl -X POST https://api.your-domain.com/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# 5. Vérifier Celery
docker-compose exec celery celery -A config inspect ping
# ou
celery -A config inspect ping

# 6. Scanner de sécurité
docker run --rm -v $(pwd):/src trufflesecurity/trufflehog filesystem /src
```

---

## 📊 Monitoring

### Configurer les logs

```bash
# Logrotate
sudo nano /etc/logrotate.d/fiscasync
```

```
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
        systemctl reload fiscasync-backend > /dev/null
    endscript
}
```

---

## 🚨 Troubleshooting

### Problème: Backend ne démarre pas

```bash
# Vérifier les logs
docker-compose logs backend

# Vérifier la connexion DB
docker-compose exec backend python manage.py dbshell

# Vérifier les migrations
docker-compose exec backend python manage.py showmigrations
```

### Problème: Erreur 502 Bad Gateway

```bash
# Vérifier que Gunicorn écoute
netstat -tulpn | grep 8000

# Vérifier les logs Nginx
sudo tail -f /var/log/nginx/error.log

# Tester directement Gunicorn
curl http://localhost:8000/
```

### Problème: Celery ne traite pas les tâches

```bash
# Vérifier la connexion Redis
redis-cli ping

# Vérifier les workers
celery -A config inspect active

# Purger les tâches
celery -A config purge
```

---

## 🎉 Félicitations !

Votre application FiscaSync est maintenant déployée en production !

### Prochaines étapes

1. ✅ Configurer les backups automatiques
2. ✅ Mettre en place le monitoring (Sentry, Prometheus)
3. ✅ Tester avec des utilisateurs bêta
4. ✅ Documenter les procédures opérationnelles
5. ✅ Planifier la maintenance régulière

---

**Support:** support@fiscasync.com
**Documentation:** https://docs.fiscasync.com
