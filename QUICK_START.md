# 🚀 FiscaSync - Guide de Démarrage Rapide

## 📋 Prérequis
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

## ⚡ Démarrage en 1 clic
```bash
# Windows
start_fiscasync.bat

# Linux/Mac
./start_fiscasync.sh
```

## 🔧 Installation manuelle

### Backend
```bash
cd backend/fiscasync
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 URLs importantes

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3006 | Interface utilisateur React |
| **Backend API** | http://localhost:8000 | API Django REST |
| **Swagger UI** | http://localhost:8000/api/docs/ | Documentation interactive |
| **ReDoc** | http://localhost:8000/api/redoc/ | Documentation alternative |
| **Admin Django** | http://localhost:8000/admin/ | Interface d'administration |
| **Health Check** | http://localhost:8000/api/v1/core/health/ | État du système |

## 🔑 Compte de test
- **Username:** admin
- **Password:** Admin123!

## 📁 Structure du projet
```
FiscaSync/
├── backend/
│   └── fiscasync/         # API Django + Services
├── frontend/              # React + TypeScript
├── .env                   # Variables d'environnement
└── start_fiscasync.bat    # Script de démarrage
```

## 🎯 Fonctionnalités principales
- ✅ Génération de liasses fiscales SYSCOHADA
- ✅ Import/Export Excel
- ✅ Audit IA intégré
- ✅ Multi-entreprise
- ✅ Dashboard analytics
- ✅ API REST complète

## 🛠️ Commandes utiles

### Tests
```bash
# Backend
cd backend/fiscasync
python manage.py test

# Frontend
cd frontend
npm test
```

### Créer un superuser
```bash
cd backend/fiscasync
python manage.py createsuperuser
```

### Linter
```bash
# Backend
cd backend/fiscasync
python manage.py check

# Frontend
cd frontend
npm run lint
```

## 📝 Configuration

### Variables d'environnement Backend
Créez `backend/fiscasync/.env`:
```env
DEBUG=True
SECRET_KEY=votre-cle-secrete
DATABASE_URL=postgresql://user:pass@localhost/fiscasync_db
```

### Variables d'environnement Frontend
Créez `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🐛 Résolution des problèmes

### Port déjà utilisé
```bash
# Windows - Libérer le port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

### Erreur de migration
```bash
python manage.py migrate --run-syncdb
python manage.py makemigrations
python manage.py migrate
```

### Erreur CORS
Vérifiez que `CORS_ALLOWED_ORIGINS` dans `settings.py` contient:
- http://localhost:3006
- http://127.0.0.1:3006

## 📚 Documentation complète
- [Architecture](./docs/ARCHITECTURE.md)
- [API Reference](http://localhost:8000/api/docs/)
- [Guide développeur](./docs/DEVELOPER_GUIDE.md)

## 🤝 Support
- Email: support@fiscasync.com
- Documentation: https://docs.fiscasync.com
- Issues: https://github.com/fiscasync/issues

---
**Version:** 1.0.0 | **Dernière mise à jour:** 18/09/2025