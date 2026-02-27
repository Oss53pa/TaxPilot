# Test Simple - Module Liasse Fiscale

Write-Host "Test Module Liasse Fiscale Consolide" -ForegroundColor Cyan
Write-Host ""

$passed = 0
$failed = 0

# Test 1: Fichiers existent
Write-Host "Test 1: Verification fichiers..." -ForegroundColor Yellow
if (Test-Path "src/pages/liasse/LiasseFiscaleOfficial.tsx") {
    Write-Host "  PASS: LiasseFiscaleOfficial.tsx existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL: LiasseFiscaleOfficial.tsx manquant" -ForegroundColor Red
    $failed++
}

if (Test-Path "src/services/liasseService.ts") {
    Write-Host "  PASS: liasseService.ts existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL: liasseService.ts manquant" -ForegroundColor Red
    $failed++
}

if (Test-Path "src/services/__tests__/liasseDataService.test.ts") {
    Write-Host "  PASS: Tests existent" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL: Tests manquants" -ForegroundColor Red
    $failed++
}

# Test 2: Documentation
Write-Host ""
Write-Host "Test 2: Documentation..." -ForegroundColor Yellow
if (Test-Path "../docs/GUIDE_PRODUCTION_LIASSE.md") {
    Write-Host "  PASS: Guide production existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL: Guide production manquant" -ForegroundColor Red
    $failed++
}

if (Test-Path "../docs/MODULE_LIASSE_README.md") {
    Write-Host "  PASS: Guide technique existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL: Guide technique manquant" -ForegroundColor Red
    $failed++
}

# Test 3: App.tsx
Write-Host ""
Write-Host "Test 3: Routes App.tsx..." -ForegroundColor Yellow
if (Select-String -Path "src/App.tsx" -Pattern "LiasseFiscaleOfficial" -Quiet) {
    Write-Host "  PASS: LiasseFiscaleOfficial importe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL: Import manquant" -ForegroundColor Red
    $failed++
}

# Resultat
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "RESULTAT FINAL" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "Tests reussis: $passed" -ForegroundColor Green
Write-Host "Tests echoues: $failed" -ForegroundColor Red
Write-Host ""

if ($failed -eq 0) {
    Write-Host "SUCCES: Tous les tests sont passes!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "ERREUR: Certains tests ont echoue" -ForegroundColor Red
    exit 1
}
