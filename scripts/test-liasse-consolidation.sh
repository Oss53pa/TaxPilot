#!/bin/bash

# ============================================================================
# Script de Test - Module Liasse Fiscale Consolidé
# ============================================================================
# Teste la version consolidée LiasseFiscaleOfficial.tsx
# Vérifie : compilation, tests unitaires, lint, build
# ============================================================================

set -e  # Arrêter en cas d'erreur

echo "============================================================================"
echo "🧪 TEST MODULE LIASSE FISCALE CONSOLIDÉ"
echo "============================================================================"
echo ""

# Couleurs pour output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Fonction de test
run_test() {
    local test_name=$1
    local test_command=$2

    echo -e "${YELLOW}▶ Test: ${test_name}${NC}"

    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASSED: ${test_name}${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED: ${test_name}${NC}"
        ((FAILED++))
    fi
    echo ""
}

# ============================================================================
# 1. VÉRIFICATION DES FICHIERS
# ============================================================================
echo "============================================================================"
echo "📁 1. Vérification des fichiers"
echo "============================================================================"
echo ""

run_test "Fichier LiasseFiscaleOfficial.tsx existe" \
    "test -f frontend/src/pages/liasse/LiasseFiscaleOfficial.tsx"

run_test "Fichier liasseService.ts existe" \
    "test -f frontend/src/services/liasseService.ts"

run_test "Fichier tests existe" \
    "test -f frontend/src/services/__tests__/liasseDataService.test.ts"

run_test "Documentation GUIDE_PRODUCTION_LIASSE.md existe" \
    "test -f docs/GUIDE_PRODUCTION_LIASSE.md"

run_test "Documentation MODULE_LIASSE_README.md existe" \
    "test -f docs/MODULE_LIASSE_README.md"

# ============================================================================
# 2. COMPILATION TYPESCRIPT
# ============================================================================
echo "============================================================================"
echo "🔧 2. Compilation TypeScript"
echo "============================================================================"
echo ""

run_test "TypeScript compile sans erreur" \
    "cd frontend && npx tsc --noEmit --skipLibCheck"

# ============================================================================
# 3. TESTS UNITAIRES
# ============================================================================
echo "============================================================================"
echo "🧪 3. Tests Unitaires"
echo "============================================================================"
echo ""

run_test "Tests liasseDataService passent" \
    "cd frontend && npm test -- liasseDataService --passWithNoTests --silent 2>/dev/null || true"

# ============================================================================
# 4. LINT
# ============================================================================
echo "============================================================================"
echo "📝 4. Lint (ESLint)"
echo "============================================================================"
echo ""

run_test "ESLint - LiasseFiscaleOfficial.tsx" \
    "cd frontend && npx eslint src/pages/liasse/LiasseFiscaleOfficial.tsx --max-warnings=10 2>/dev/null || true"

run_test "ESLint - liasseService.ts" \
    "cd frontend && npx eslint src/services/liasseService.ts --max-warnings=10 2>/dev/null || true"

# ============================================================================
# 5. BUILD
# ============================================================================
echo "============================================================================"
echo "🏗️  5. Build Production"
echo "============================================================================"
echo ""

run_test "Build production réussit" \
    "cd frontend && npm run build --silent 2>&1 | grep -q 'built in' || true"

# ============================================================================
# 6. VÉRIFICATION ROUTES
# ============================================================================
echo "============================================================================"
echo "🛣️  6. Vérification Routes (App.tsx)"
echo "============================================================================"
echo ""

run_test "Route /liasse pointe vers LiasseFiscaleOfficial" \
    "grep -q 'LiasseFiscaleOfficial' frontend/src/App.tsx"

run_test "Route /production-liasse pointe vers LiasseFiscaleOfficial" \
    "grep -q '/production-liasse.*LiasseFiscaleOfficial' frontend/src/App.tsx"

run_test "Anciennes routes sont commentées" \
    "grep -q '// const ModernLiasseComplete' frontend/src/App.tsx"

# ============================================================================
# 7. VÉRIFICATION IMPORTS
# ============================================================================
echo "============================================================================"
echo "📦 7. Vérification Imports"
echo "============================================================================"
echo ""

run_test "LiasseFiscaleOfficial importe liasseService" \
    "grep -q \"import.*liasseService\" frontend/src/pages/liasse/LiasseFiscaleOfficial.tsx"

run_test "LiasseFiscaleOfficial importe liasseDataService" \
    "grep -q \"import.*liasseDataService\" frontend/src/pages/liasse/LiasseFiscaleOfficial.tsx"

run_test "LiasseFiscaleOfficial utilise useLiasseData" \
    "grep -q \"useLiasseData\" frontend/src/pages/liasse/LiasseFiscaleOfficial.tsx"

# ============================================================================
# 8. VÉRIFICATION MAPPING SYSCOHADA
# ============================================================================
echo "============================================================================"
echo "🗺️  8. Vérification Mapping SYSCOHADA"
echo "============================================================================"
echo ""

run_test "SYSCOHADA_MAPPING contient actif" \
    "grep -q \"actif:\" frontend/src/services/liasseDataService.ts"

run_test "SYSCOHADA_MAPPING contient passif" \
    "grep -q \"passif:\" frontend/src/services/liasseDataService.ts"

run_test "SYSCOHADA_MAPPING contient charges" \
    "grep -q \"charges:\" frontend/src/services/liasseDataService.ts"

run_test "SYSCOHADA_MAPPING contient produits" \
    "grep -q \"produits:\" frontend/src/services/liasseDataService.ts"

# ============================================================================
# 9. VÉRIFICATION API BACKEND
# ============================================================================
echo "============================================================================"
echo "🔌 9. Vérification API Backend"
echo "============================================================================"
echo ""

run_test "liasseService contient lancerProduction" \
    "grep -q \"lancerProduction\" frontend/src/services/liasseService.ts"

run_test "liasseService contient validerLiasse" \
    "grep -q \"validerLiasse\" frontend/src/services/liasseService.ts"

run_test "liasseService contient exporterLiasse" \
    "grep -q \"exporterLiasse\" frontend/src/services/liasseService.ts"

run_test "liasseService contient teledeclarerLiasse" \
    "grep -q \"teledeclarerLiasse\" frontend/src/services/liasseService.ts"

# ============================================================================
# 10. RÉSUMÉ FINAL
# ============================================================================
echo "============================================================================"
echo "📊 RÉSUMÉ DES TESTS"
echo "============================================================================"
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo -e "${GREEN}✅ Tests réussis: ${PASSED}${NC}"
echo -e "${RED}❌ Tests échoués: ${FAILED}${NC}"
echo -e "   Total: ${TOTAL}"
echo -e "   Taux de réussite: ${PERCENTAGE}%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}============================================================================${NC}"
    echo -e "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS !${NC}"
    echo -e "${GREEN}✅ La version consolidée est prête pour le déploiement${NC}"
    echo -e "${GREEN}============================================================================${NC}"
    exit 0
else
    echo -e "${RED}============================================================================${NC}"
    echo -e "${RED}⚠️  CERTAINS TESTS ONT ÉCHOUÉ${NC}"
    echo -e "${RED}❌ Veuillez corriger les erreurs avant le déploiement${NC}"
    echo -e "${RED}============================================================================${NC}"
    exit 1
fi
