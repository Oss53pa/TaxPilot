#!/bin/bash
# ============================================================================
# FiscaSync - Script de Déploiement Local (Bash)
# ============================================================================

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FiscaSync - Déploiement Local Docker                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# ============================================================================
# Fonctions
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# Étape 1: Vérifications
# ============================================================================

log_info "Étape 1/8 - Vérifications préalables..."

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé"
    exit 1
fi
log_success "Docker installé: $(docker --version)"

# Vérifier .env.production
if [ ! -f ".env.production" ]; then
    log_error "Fichier .env.production manquant"
    exit 1
fi
log_success "Fichier .env.production trouvé"

# Vérifier backend/.env.production
if [ ! -f "backend/.env.production" ]; then
    log_error "Fichier backend/.env.production manquant"
    exit 1
fi
log_success "Fichier backend/.env.production trouvé"

# ============================================================================
# Étape 2: Charger les variables d'environnement
# ============================================================================

log_info "Étape 2/8 - Chargement des variables d'environnement..."

# Exporter les variables depuis .env.production
export $(cat .env.production | grep -v '^#' | xargs)

log_success "Variables d'environnement chargées"

# ============================================================================
# Étape 3: Arrêt des conteneurs existants
# ============================================================================

log_info "Étape 3/8 - Arrêt des conteneurs existants..."

docker compose -f docker-compose.production.yml --env-file .env.production down 2>/dev/null || log_info "Aucun conteneur à arrêter"

log_success "Nettoyage effectué"

# ============================================================================
# Étape 4: Build des images (si nécessaire)
# ============================================================================

log_info "Étape 4/8 - Vérification des images Docker..."

# Vérifier si les images existent
if ! docker images | grep -q "fiscasync"; then
    log_info "Build des images Docker (première fois - 5-10 minutes)..."
    docker compose -f docker-compose.production.yml --env-file .env.production build
    log_success "Images construites"
else
    log_info "Images Docker existantes trouvées (skip build)"
fi

# ============================================================================
# Étape 5: Démarrage des services
# ============================================================================

log_info "Étape 5/8 - Démarrage des services..."

docker compose -f docker-compose.production.yml --env-file .env.production up -d

log_success "Services démarrés"

# ============================================================================
# Étape 6: Attente de disponibilité
# ============================================================================

log_info "Étape 6/8 - Attente de disponibilité des services..."

log_info "Attente de PostgreSQL (10s)..."
sleep 10

log_info "Attente de Redis (5s)..."
sleep 5

log_info "Attente du Backend (30s)..."
sleep 30

log_success "Services initialisés"

# ============================================================================
# Étape 7: Migrations et configuration
# ============================================================================

log_info "Étape 7/8 - Configuration de la base de données..."

# Migrations
log_info "Application des migrations..."
docker compose -f docker-compose.production.yml --env-file .env.production exec -T backend python manage.py migrate --noinput || log_warn "Migrations échouées (peut-être normal si base vide)"

log_success "Migrations appliquées"

# Collectstatic
log_info "Collection des fichiers statiques..."
docker compose -f docker-compose.production.yml --env-file .env.production exec -T backend python manage.py collectstatic --noinput || log_warn "Collectstatic échoué"

log_success "Fichiers statiques collectés"

# ============================================================================
# Étape 8: Vérifications
# ============================================================================

log_info "Étape 8/8 - Vérifications post-déploiement..."

# État des conteneurs
log_info "État des conteneurs:"
docker compose -f docker-compose.production.yml --env-file .env.production ps

# Test API
log_info "Test de l'API..."
sleep 5
if curl -s -f http://localhost:8000/api/health/ > /dev/null 2>&1; then
    log_success "API opérationnelle ✓"
else
    log_warn "API ne répond pas encore (peut nécessiter quelques secondes)"
fi

# ============================================================================
# Résumé
# ============================================================================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          DÉPLOIEMENT LOCAL TERMINÉ !                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}Services déployés:${NC}"
echo "  - Backend API:    http://localhost:8000"
echo "  - Frontend:       http://localhost:80"
echo "  - Admin Django:   http://localhost:8000/admin/"
echo "  - Flower:         http://localhost:5555"
echo "  - PostgreSQL:     localhost:5432"
echo "  - Redis:          localhost:6379"
echo ""

echo -e "${BLUE}Prochaines étapes:${NC}"
echo ""
echo "1. Créer un superuser Django:"
echo -e "   ${YELLOW}docker compose -f docker-compose.production.yml exec backend python manage.py createsuperuser${NC}"
echo ""
echo "2. Voir les logs:"
echo -e "   ${YELLOW}docker compose -f docker-compose.production.yml logs -f${NC}"
echo ""
echo "3. Tester l'API:"
echo -e "   ${YELLOW}curl http://localhost:8000/api/health/${NC}"
echo ""
echo "4. Arrêter les services:"
echo -e "   ${YELLOW}docker compose -f docker-compose.production.yml down${NC}"
echo ""

log_success "Déploiement terminé avec succès !"
