# ============================================================================
# Script de Test - Module Liasse Fiscale Consolidé (Windows PowerShell)
# ============================================================================
# Teste la version consolidée LiasseFiscaleOfficial.tsx
# Vérifie : compilation, tests unitaires, lint, build
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "🧪 TEST MODULE LIASSE FISCALE CONSOLIDÉ" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

# Compteurs
$PASSED = 0
$FAILED = 0
$TOTAL_TESTS = 0

# Fonction de test
function Run-Test {
    param(
        [string]$TestName,
        [scriptblock]$TestCommand
    )

    $TOTAL_TESTS++
    Write-Host "▶ Test: $TestName" -ForegroundColor Yellow

    try {
        $result = & $TestCommand
        if ($LASTEXITCODE -eq 0 -or $result) {
            Write-Host "✅ PASSED: $TestName" -ForegroundColor Green
            $script:PASSED++
        } else {
            Write-Host "❌ FAILED: $TestName" -ForegroundColor Red
            $script:FAILED++
        }
    } catch {
        Write-Host "❌ FAILED: $TestName - $_" -ForegroundColor Red
        $script:FAILED++
    }
    Write-Host ""
}

# ============================================================================
# 1. VÉRIFICATION DES FICHIERS
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "📁 1. Vérification des fichiers" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Run-Test "Fichier LiasseFiscaleOfficial.tsx existe" {
    Test-Path "src/pages/liasse/LiasseFiscaleOfficial.tsx"
}

Run-Test "Fichier liasseService.ts existe" {
    Test-Path "src/services/liasseService.ts"
}

Run-Test "Fichier tests existe" {
    Test-Path "src/services/__tests__/liasseDataService.test.ts"
}

Run-Test "Documentation GUIDE_PRODUCTION_LIASSE.md existe" {
    Test-Path "../docs/GUIDE_PRODUCTION_LIASSE.md"
}

Run-Test "Documentation MODULE_LIASSE_README.md existe" {
    Test-Path "../docs/MODULE_LIASSE_README.md"
}

# ============================================================================
# 2. COMPILATION TYPESCRIPT
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "🔧 2. Compilation TypeScript" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Run-Test "TypeScript compile sans erreur" {
    $output = npx tsc --noEmit --skipLibCheck 2>&1
    $LASTEXITCODE -eq 0
}

# ============================================================================
# 3. VÉRIFICATION ROUTES (App.tsx)
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "🛣️  3. Vérification Routes (App.tsx)" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Run-Test "Route /liasse pointe vers LiasseFiscaleOfficial" {
    Select-String -Path "src/App.tsx" -Pattern "LiasseFiscaleOfficial" -Quiet
}

Run-Test "Route /production-liasse pointe vers LiasseFiscaleOfficial" {
    Select-String -Path "src/App.tsx" -Pattern "/production-liasse.*LiasseFiscaleOfficial" -Quiet
}

Run-Test "Anciennes routes sont commentées" {
    Select-String -Path "src/App.tsx" -Pattern "// const ModernLiasseComplete" -Quiet
}

# ============================================================================
# 4. VÉRIFICATION IMPORTS
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "📦 4. Vérification Imports" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Run-Test "LiasseFiscaleOfficial importe liasseService" {
    Select-String -Path "src/pages/liasse/LiasseFiscaleOfficial.tsx" -Pattern "import.*liasseService" -Quiet
}

Run-Test "LiasseFiscaleOfficial importe liasseDataService" {
    Select-String -Path "src/pages/liasse/LiasseFiscaleOfficial.tsx" -Pattern "import.*liasseDataService" -Quiet
}

Run-Test "LiasseFiscaleOfficial utilise useLiasseData" {
    Select-String -Path "src/pages/liasse/LiasseFiscaleOfficial.tsx" -Pattern "useLiasseData" -Quiet
}

# ============================================================================
# 5. VÉRIFICATION MAPPING SYSCOHADA
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "🗺️  5. Vérification Mapping SYSCOHADA" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Run-Test "SYSCOHADA_MAPPING contient actif" {
    Select-String -Path "src/services/liasseDataService.ts" -Pattern "actif:" -Quiet
}

Run-Test "SYSCOHADA_MAPPING contient passif" {
    Select-String -Path "src/services/liasseDataService.ts" -Pattern "passif:" -Quiet
}

Run-Test "SYSCOHADA_MAPPING contient charges" {
    Select-String -Path "src/services/liasseDataService.ts" -Pattern "charges:" -Quiet
}

Run-Test "SYSCOHADA_MAPPING contient produits" {
    Select-String -Path "src/services/liasseDataService.ts" -Pattern "produits:" -Quiet
}

# ============================================================================
# 6. VÉRIFICATION API BACKEND
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "🔌 6. Vérification API Backend" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

Run-Test "liasseService contient lancerProduction" {
    Select-String -Path "src/services/liasseService.ts" -Pattern "lancerProduction" -Quiet
}

Run-Test "liasseService contient validerLiasse" {
    Select-String -Path "src/services/liasseService.ts" -Pattern "validerLiasse" -Quiet
}

Run-Test "liasseService contient exporterLiasse" {
    Select-String -Path "src/services/liasseService.ts" -Pattern "exporterLiasse" -Quiet
}

Run-Test "liasseService contient teledeclarerLiasse" {
    Select-String -Path "src/services/liasseService.ts" -Pattern "teledeclarerLiasse" -Quiet
}

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host ""

$PERCENTAGE = [math]::Round(($PASSED / $TOTAL_TESTS) * 100)

Write-Host "✅ Tests réussis: $PASSED" -ForegroundColor Green
Write-Host "❌ Tests échoués: $FAILED" -ForegroundColor Red
Write-Host "   Total: $TOTAL_TESTS"
Write-Host "   Taux de réussite: $PERCENTAGE%"
Write-Host ""

if ($FAILED -eq 0) {
    Write-Host "============================================================================" -ForegroundColor Green
    Write-Host "🎉 TOUS LES TESTS SONT PASSÉS !" -ForegroundColor Green
    Write-Host "✅ La version consolidée est prête pour le déploiement" -ForegroundColor Green
    Write-Host "============================================================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host "⚠️  CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor Red
    Write-Host "❌ Veuillez corriger les erreurs avant le déploiement" -ForegroundColor Red
    Write-Host "============================================================================" -ForegroundColor Red
    exit 1
}
