# Checklist Sécurité FiscaSync - Production

## ✅ Configuration Django

- [ ] `DEBUG = False` en production
- [ ] `SECRET_KEY` unique et sécurisée (50+ caractères aléatoires)
- [ ] `ALLOWED_HOSTS` correctement configuré (pas de wildcard `*`)
- [ ] `SECURE_SSL_REDIRECT = True`
- [ ] `SESSION_COOKIE_SECURE = True`
- [ ] `CSRF_COOKIE_SECURE = True`
- [ ] `SESSION_COOKIE_HTTPONLY = True`
- [ ] `CSRF_COOKIE_HTTPONLY = True`
- [ ] `SESSION_COOKIE_SAMESITE = 'Lax'`
- [ ] `SECURE_BROWSER_XSS_FILTER = True`
- [ ] `SECURE_CONTENT_TYPE_NOSNIFF = True`
- [ ] `X_FRAME_OPTIONS = 'DENY'`
- [ ] `SECURE_HSTS_SECONDS = 31536000` (1 an minimum)
- [ ] `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`
- [ ] `SECURE_HSTS_PRELOAD = True`

## ✅ Base de Données

- [ ] Connexion PostgreSQL avec SSL (`sslmode=require`)
- [ ] Mot de passe base de données fort (16+ caractères)
- [ ] Utilisateur base de données avec privilèges minimaux
- [ ] Accès base de données restreint par IP/firewall
- [ ] Sauvegardes chiffrées et testées
- [ ] Logs des requêtes sensibles désactivés en production

## ✅ Authentification & Sessions

- [ ] Mots de passe avec validation forte (django.contrib.auth.password_validation)
- [ ] JWT avec expiration courte (1h pour access token)
- [ ] Rotation des refresh tokens activée
- [ ] Blacklist des tokens après rotation
- [ ] Protection contre force brute (django-axes installé et configuré)
- [ ] Rate limiting sur endpoints d'authentification

## ✅ CORS & API

- [ ] `CORS_ALLOW_ALL_ORIGINS = False`
- [ ] `CORS_ALLOWED_ORIGINS` liste explicite (pas de wildcard)
- [ ] `CORS_ALLOW_CREDENTIALS = True` uniquement si nécessaire
- [ ] Rate limiting actif sur tous les endpoints API
- [ ] Validation stricte des inputs (serializers DRF)
- [ ] Pas d'exposition d'informations sensibles dans les erreurs API

## ✅ Fichiers & Uploads

- [ ] Limite de taille de fichier définie (`FILE_UPLOAD_MAX_MEMORY_SIZE`)
- [ ] Validation du type MIME des fichiers uploadés
- [ ] Scan antivirus des fichiers uploadés (recommandé)
- [ ] Stockage des media sur cloud storage (S3, GCS) avec accès privé
- [ ] URLs media avec tokens temporaires pour fichiers privés
- [ ] Pas de chemins de fichiers exposés dans les URLs

## ✅ Secrets & Credentials

- [ ] Fichier `.env.production` avec permissions 600
- [ ] `.env*` dans `.gitignore`
- [ ] Pas de secrets hardcodés dans le code
- [ ] Rotation régulière des secrets (tous les 90 jours)
- [ ] Secrets stockés dans un gestionnaire (Vault, AWS Secrets Manager)
- [ ] Variables d'environnement utilisées pour tous les secrets

## ✅ HTTPS & SSL/TLS

- [ ] Certificats SSL/TLS valides et à jour
- [ ] Renouvellement automatique des certificats (Let's Encrypt)
- [ ] Score A+ sur SSL Labs (https://www.ssllabs.com/ssltest/)
- [ ] TLS 1.2+ uniquement (pas de TLS 1.0/1.1)
- [ ] Ciphers forts configurés
- [ ] HSTS préchargé sur browsers (hstspreload.org)

## ✅ Headers de Sécurité

- [ ] `Strict-Transport-Security` configuré
- [ ] `X-Frame-Options: DENY`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Content-Security-Policy` configuré
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Score A sur SecurityHeaders.com

## ✅ Logs & Monitoring

- [ ] Logging configuré en mode JSON pour parsing
- [ ] Logs ne contiennent pas de données sensibles (mots de passe, tokens)
- [ ] Sentry configuré pour erreurs en production
- [ ] Alertes configurées pour erreurs critiques
- [ ] Logs des tentatives de connexion échouées
- [ ] Monitoring des accès admin
- [ ] Rotation des logs configurée (logrotate)

## ✅ Infrastructure

- [ ] Firewall activé et configuré (ufw, iptables)
- [ ] Ports non utilisés fermés
- [ ] SSH configuré avec clés (pas de password)
- [ ] SSH sur port non-standard (recommandé)
- [ ] Root login SSH désactivé
- [ ] Fail2ban installé et configuré
- [ ] Mises à jour automatiques de sécurité activées
- [ ] Serveur dans un VPC/réseau privé

## ✅ Django Admin

- [ ] URL admin changée (pas `/admin/`)
- [ ] Accès admin restreint par IP (si possible)
- [ ] MFA activé pour comptes admin (django-otp)
- [ ] Comptes admin avec emails réels
- [ ] Pas de compte superuser en production (ou très limité)

## ✅ Données Sensibles

- [ ] Chiffrement des données sensibles en base (PII, finances)
- [ ] Audit trail pour toutes les modifications sensibles
- [ ] Suppression sécurisée des données (hard delete → anonymisation)
- [ ] RGPD: Droit à l'oubli implémenté
- [ ] Politique de rétention des données définie et appliquée

## ✅ Celery & Background Tasks

- [ ] Redis avec mot de passe configuré
- [ ] Celery n'execute pas de code arbitraire
- [ ] Tasks sensibles avec retry limité
- [ ] Timeout configuré pour toutes les tasks
- [ ] Logs des tasks pour audit

## ✅ Dependencies & Code

- [ ] Scan de vulnérabilités avec `safety check`
  ```bash
  pip install safety
  safety check --json
  ```
- [ ] Dependencies à jour (pas de CVE connues)
- [ ] Pas de dépendances abandonnées
- [ ] Code review avant déploiement
- [ ] Tests de sécurité automatisés (CI/CD)

## ✅ Rate Limiting & DDoS

- [ ] Rate limiting API (DRF throttling configuré)
- [ ] CloudFlare ou similaire devant l'application
- [ ] Limite de requêtes par IP
- [ ] Protection contre scraping
- [ ] Captcha sur endpoints sensibles (signup, login)

## ✅ Backup & Disaster Recovery

- [ ] Sauvegardes automatiques daily
- [ ] Sauvegardes stockées offsite (S3, etc.)
- [ ] Sauvegardes chiffrées
- [ ] Test de restauration mensuel
- [ ] Plan de disaster recovery documenté
- [ ] RTO/RPO définis et testés

## ✅ Compliance & Legal

- [ ] Politique de confidentialité publiée
- [ ] CGU/CGV publiées
- [ ] RGPD: Consentement utilisateur
- [ ] RGPD: Droit d'accès aux données
- [ ] RGPD: DPO désigné (si applicable)
- [ ] Mentions légales complètes

## ✅ Tests de Pénétration

- [ ] Scan OWASP ZAP ou Burp Suite
- [ ] Test d'injection SQL
- [ ] Test XSS
- [ ] Test CSRF
- [ ] Test énumération utilisateurs
- [ ] Test exposition d'informations sensibles
- [ ] Pen test professionnel annuel (recommandé)

## ✅ Social Engineering & Humain

- [ ] Formation sécurité pour l'équipe
- [ ] Politique de mots de passe forte
- [ ] MFA obligatoire pour tous les accès critiques
- [ ] Revue des accès trimestrielle
- [ ] Offboarding : révocation immédiate des accès

## 🔴 Red Flags à Corriger Immédiatement

Si l'un de ces éléments est présent, CORRIGER AVANT MISE EN PRODUCTION:

- ❌ `DEBUG = True` en production
- ❌ SECRET_KEY par défaut ou exposée
- ❌ Pas de HTTPS
- ❌ CORS avec `*` (allow all origins)
- ❌ Pas de rate limiting
- ❌ Base de données sans mot de passe
- ❌ Secrets dans Git
- ❌ Pas de sauvegardes
- ❌ Dépendances avec CVE critiques

## Outils Recommandés

### Scan de Sécurité
- **Safety**: `pip install safety && safety check`
- **Bandit**: `pip install bandit && bandit -r .`
- **OWASP ZAP**: https://www.zaproxy.org/
- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **SecurityHeaders**: https://securityheaders.com/

### Monitoring
- **Sentry**: Monitoring erreurs temps réel
- **CloudFlare**: Protection DDoS et WAF
- **UptimeRobot**: Monitoring uptime
- **Datadog/New Relic**: APM et metrics

### Compliance
- **OneTrust**: Gestion consentements RGPD
- **Termly**: Génération politique confidentialité

## Fréquence de Revue

- **Daily**: Logs Sentry
- **Weekly**: Revue logs accès
- **Monthly**: Scan vulnérabilités
- **Quarterly**: Revue accès et permissions
- **Yearly**: Pen test professionnel

## Contact Sécurité

Pour signaler une vulnérabilité: security@fiscasync.com
