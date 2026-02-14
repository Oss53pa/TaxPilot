@echo off
echo ========================================
echo   FISCASYNC - DEMARRAGE COMPLET
echo ========================================
echo.

REM Vérification Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
)

REM Vérification Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
)

echo [1/4] Installation des dépendances Backend...
cd backend\fiscasync
pip install -r requirements.txt >nul 2>&1
echo      ✓ Dépendances Backend installées

echo [2/4] Migrations de base de données...
python manage.py migrate >nul 2>&1
echo      ✓ Migrations appliquées

echo [3/4] Installation des dépendances Frontend...
cd ..\..\frontend
call npm install >nul 2>&1
echo      ✓ Dépendances Frontend installées

echo [4/4] Démarrage des serveurs...
echo.
echo ========================================
echo   SERVEURS EN COURS DE DEMARRAGE
echo ========================================
echo.
echo Backend API: http://localhost:8000
echo Frontend:    http://localhost:3006
echo Swagger UI:  http://localhost:8000/api/docs/
echo ReDoc:       http://localhost:8000/api/redoc/
echo.
echo Appuyez sur Ctrl+C pour arrêter les serveurs
echo ========================================
echo.

REM Démarrage Backend en arrière-plan
cd ..\backend\fiscasync
start /B python manage.py runserver 8000

REM Attente de 3 secondes pour que le backend démarre
timeout /t 3 /nobreak >nul

REM Démarrage Frontend
cd ..\..\frontend
npm run dev