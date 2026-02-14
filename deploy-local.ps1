# ============================================================================
# FiscaSync - Script de Déploiement Local (Windows PowerShell)
# ============================================================================

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║   FiscaSync - Déploiement Local Docker (Windows)      ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Variables
$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

# ============================================================================
# Fonctions
# ============================================================================

function Write-Info {
    param($message)
    Write-Host "[INFO] $message" -ForegroundColor Cyan
}

function Write-Success {
    param($message)
    Write-Host "[SUCCESS] $message" -ForegroundColor Green
}

function Write-Warning {
    param($message)
    Write-Host "[WARNING] $message" -ForegroundColor Yellow
}

function Write-Error {
    param($message)
    Write-Host "[ERROR] $message" -ForegroundColor Red
}

# ============================================================================
# Étape 1: Vérifications préalables
# ============================================================================

Write-Info "Étape 1/8 - Vérifications préalables..."

# Vérifier Docker
try {
    $dockerVersion = docker --version
    Write-Success "Docker installé: $dockerVersion"
} catch {
    Write-Error "Docker n'est pas installé ou n'est pas en cours d'exécution"
    Write-Info "Veuillez démarrer Docker Desktop"
    exit 1
}

# Vérifier Docker Compose
try {
    $composeVersion = docker compose version
    Write-Success "Docker Compose installé: $composeVersion"
} catch {
    Write-Error "Docker Compose n'est pas disponible"
    exit 1
}

# Vérifier les fichiers .env
if (-not (Test-Path ".\.env.production")) {
    Write-Error "Fichier .env.production manquant"
    exit 1
}
Write-Success "Fichier .env.production trouvé"

if (-not (Test-Path ".\backend\.env.production")) {
    Write-Error "Fichier backend\.env.production manquant"
    exit 1
}
Write-Success "Fichier backend\.env.production trouvé"

# ============================================================================
# Étape 2: Arrêt des conteneurs existants
# ============================================================================

Write-Info "Étape 2/8 - Arrêt des conteneurs existants..."

try {
    docker compose -f docker-compose.production.yml down 2>$null
    Write-Success "Conteneurs existants arrêtés"
} catch {
    Write-Info "Aucun conteneur existant à arrêter"
}

# ============================================================================
# Étape 3: Nettoyage (optionnel)
# ============================================================================

Write-Info "Étape 3/8 - Nettoyage des images inutilisées..."

try {
    docker system prune -f
    Write-Success "Nettoyage effectué"
} catch {
    Write-Warning "Nettoyage échoué, on continue..."
}

# ============================================================================
# Étape 4: Build des images Docker
# ============================================================================

Write-Info "Étape 4/8 - Build des images Docker (cela peut prendre 5-10 minutes)..."

try {
    Write-Info "Construction de l'image backend..."
    docker compose -f docker-compose.production.yml build backend

    Write-Info "Construction de l'image frontend..."
    docker compose -f docker-compose.production.yml build frontend

    Write-Success "Images Docker construites avec succès"
} catch {
    Write-Error "Échec du build des images Docker"
    Write-Info "Logs: docker compose -f docker-compose.production.yml logs"
    exit 1
}

# ============================================================================
# Étape 5: Démarrage des services
# ============================================================================

Write-Info "Étape 5/8 - Démarrage des services..."

try {
    docker compose -f docker-compose.production.yml up -d
    Write-Success "Services démarrés"
} catch {
    Write-Error "Échec du démarrage des services"
    exit 1
}

# ============================================================================
# Étape 6: Attente des services
# ============================================================================

Write-Info "Étape 6/8 - Attente du démarrage complet des services..."

Write-Info "Attente de PostgreSQL..."
Start-Sleep -Seconds 10

Write-Info "Attente de Redis..."
Start-Sleep -Seconds 5

Write-Info "Attente du Backend (peut prendre 1-2 minutes)..."
Start-Sleep -Seconds 30

# ============================================================================
# Étape 7: Migrations et configuration
# ============================================================================

Write-Info "Étape 7/8 - Exécution des migrations..."

try {
    docker compose -f docker-compose.production.yml exec -T backend python manage.py migrate --noinput
    Write-Success "Migrations appliquées"
} catch {
    Write-Warning "Migrations échouées, vérifier les logs"
}

Write-Info "Collection des fichiers statiques..."
try {
    docker compose -f docker-compose.production.yml exec -T backend python manage.py collectstatic --noinput
    Write-Success "Fichiers statiques collectés"
} catch {
    Write-Warning "Collectstatic échoué, vérifier les logs"
}

# ============================================================================
# Étape 8: Vérifications post-déploiement
# ============================================================================

Write-Info "Étape 8/8 - Vérifications post-déploiement..."

# Vérifier l'état des conteneurs
Write-Info "État des conteneurs:"
docker compose -f docker-compose.production.yml ps

# Test de l'API
Write-Info "Test de l'API..."
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:8000/api/health/" -Method Get -TimeoutSec 5
    if ($apiResponse.StatusCode -eq 200) {
        Write-Success "API opérationnelle (HTTP 200)"
    }
} catch {
    Write-Warning "API ne répond pas encore (peut nécessiter quelques secondes supplémentaires)"
}

# ============================================================================
# Résumé
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          DÉPLOIEMENT LOCAL TERMINÉ !                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Services déployés:" -ForegroundColor Cyan
Write-Host "  - Backend API:    http://localhost:8000" -ForegroundColor White
Write-Host "  - Frontend:       http://localhost:80" -ForegroundColor White
Write-Host "  - Admin Django:   http://localhost:8000/admin/" -ForegroundColor White
Write-Host "  - Flower:         http://localhost:5555" -ForegroundColor White
Write-Host "  - PostgreSQL:     localhost:5432" -ForegroundColor White
Write-Host "  - Redis:          localhost:6379" -ForegroundColor White
Write-Host ""

Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Créer un superuser:" -ForegroundColor White
Write-Host "     docker compose -f docker-compose.production.yml exec backend python manage.py createsuperuser" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Voir les logs:" -ForegroundColor White
Write-Host "     docker compose -f docker-compose.production.yml logs -f" -ForegroundColor Yellow
Write-Host ""
Write-Host "  3. Arrêter les services:" -ForegroundColor White
Write-Host "     docker compose -f docker-compose.production.yml down" -ForegroundColor Yellow
Write-Host ""

Write-Success "Déploiement terminé avec succès !"
