@echo off
echo ========================================
echo   FISCASYNC - DEMARRAGE RAPIDE DEV
echo ========================================
echo.

echo [1/3] Creation de l'utilisateur admin...
cd backend
call venv\Scripts\activate
python create_test_user.py
echo.

echo [2/3] Demarrage du backend...
start /B python manage.py runserver 8000
echo      Backend demarre sur http://localhost:8000
echo.

echo [3/3] Demarrage du frontend...
cd ..\frontend
start cmd /k "npm run dev"
echo      Frontend demarre sur http://localhost:3006
echo.

echo ========================================
echo   FISCASYNC EST PRET !
echo ========================================
echo.
echo Frontend:    http://localhost:3006
echo Backend:     http://localhost:8000
echo Auto-login:  Cliquez sur le bouton vert
echo.
echo Identifiants:
echo   Username: admin
echo   Password: admin123
echo.
echo Appuyez sur une touche pour ouvrir le navigateur...
pause >nul

start http://localhost:3006
