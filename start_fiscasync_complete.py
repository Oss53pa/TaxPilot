#!/usr/bin/env python
"""
🚀 Script de démarrage complet FiscaSync
Initialise la base de données et démarre les services
"""

import os
import sys
import subprocess
import django
from pathlib import Path

def setup_environment():
    """Configure l'environnement Django"""
    # Force la configuration FiscaSync
    os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.fiscasync.config.settings.local'
    
    # Ajoute le répertoire backend au PYTHONPATH
    backend_path = Path(__file__).parent / 'backend' / 'fiscasync'
    sys.path.insert(0, str(backend_path))
    
    print(f"[SETUP] DJANGO_SETTINGS_MODULE: {os.environ['DJANGO_SETTINGS_MODULE']}")
    print(f"[SETUP] Backend path: {backend_path}")

def initialize_django():
    """Initialise Django"""
    django.setup()
    
    from django.conf import settings
    from django.core.management import execute_from_command_line
    
    print(f"[OK] Django initialisé avec: {settings.SETTINGS_MODULE}")
    print(f"[OK] Base de données: {settings.DATABASES['default']['NAME']}")
    print(f"[OK] Root URLconf: {settings.ROOT_URLCONF}")
    
    return settings

def create_superuser():
    """Crée un superutilisateur si il n'existe pas"""
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    
    if not User.objects.filter(username='admin').exists():
        try:
            User.objects.create_superuser(
                username='admin',
                email='admin@fiscasync.com',
                password='admin123',
                first_name='Admin',
                last_name='FiscaSync'
            )
            print("[OK] Superutilisateur 'admin' créé (password: admin123)")
        except Exception as e:
            print(f"[ERROR] Erreur création superutilisateur: {e}")
    else:
        print("[OK] Superutilisateur 'admin' existe déjà")

def run_migrations():
    """Execute les migrations"""
    try:
        from django.core.management import execute_from_command_line
        execute_from_command_line(['manage.py', 'migrate', '--noinput'])
        print("[OK] Migrations appliquées")
    except Exception as e:
        print(f"[ERROR] Erreur migrations: {e}")

def start_server():
    """Démarre le serveur Django"""
    try:
        os.chdir(Path(__file__).parent / 'backend' / 'fiscasync')
        
        print("[START] Démarrage serveur FiscaSync sur http://localhost:8000")
        print("[INFO] Frontend disponible sur http://localhost:3012")
        print("[INFO] Utilisateur admin: admin / admin123")
        print("=" * 60)
        
        from django.core.management import execute_from_command_line
        execute_from_command_line(['manage.py', 'runserver', '0.0.0.0:8000'])
        
    except KeyboardInterrupt:
        print("\n[STOP] Arrêt du serveur FiscaSync")
    except Exception as e:
        print(f"[ERROR] Erreur serveur: {e}")

def main():
    """Fonction principale"""
    print("🚀 FISCASYNC - Démarrage complet")
    print("=" * 60)
    
    try:
        # 1. Configuration environnement
        setup_environment()
        
        # 2. Initialisation Django
        initialize_django()
        
        # 3. Migrations
        run_migrations()
        
        # 4. Création superutilisateur
        create_superuser()
        
        # 5. Démarrage serveur
        start_server()
        
    except Exception as e:
        print(f"[FATAL] Erreur fatale: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()