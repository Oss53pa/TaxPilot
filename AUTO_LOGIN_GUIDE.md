# 🚀 Guide Auto-Login FiscaSync

## ✅ Configuration terminée !

Un système d'authentification automatique a été mis en place pour faciliter le développement.

## 📋 Identifiants de connexion

### Utilisateur Admin
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** admin@fiscasync.com
- **Rôle:** Superuser & Staff

## 🎯 3 façons de se connecter

### 1. 🚀 Auto-login (Le plus rapide)
Sur la page de login, cliquez sur le bouton vert :
```
🚀 Connexion automatique (Dev)
```
✅ Connexion instantanée sans saisir d'identifiants !

### 2. 🔑 Login manuel
Utilisez les identifiants :
- Username: `admin`
- Password: `admin123`

### 3. 📡 API Auto-login
Endpoint disponible pour tests automatisés :
```bash
curl -X POST http://localhost:8000/api/v1/auth/auto-login/
```

Réponse :
```json
{
  "message": "Auto-login successful",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@fiscasync.com",
    "first_name": "Admin",
    "last_name": "FiscaSync",
    "is_staff": true,
    "is_superuser": true
  },
  "tokens": {
    "access": "eyJ...",
    "refresh": "eyJ..."
  },
  "credentials": {
    "username": "admin",
    "password": "admin123"
  }
}
```

## 🔒 Sécurité

- ⚠️ L'auto-login est **UNIQUEMENT disponible en mode DEBUG**
- ✅ En production, l'endpoint retourne une erreur 403
- ✅ Désactivation automatique quand `DEBUG=False`

## 🛠️ Commandes utiles

### Réinitialiser le mot de passe admin
```bash
cd backend
source venv/Scripts/activate  # Linux/Mac
# ou
.\venv\Scripts\activate  # Windows

python create_test_user.py
```

### Créer un nouveau superuser
```bash
cd backend
source venv/Scripts/activate
python manage.py createsuperuser
```

## 📍 URLs importantes

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3006 |
| **Backend API** | http://localhost:8000 |
| **Admin Django** | http://localhost:8000/admin |
| **API Docs (Swagger)** | http://localhost:8000/api/docs/ |
| **Auto-login endpoint** | http://localhost:8000/api/v1/auth/auto-login/ |

## ✨ Fonctionnalités

✅ Utilisateur admin créé automatiquement
✅ Endpoint d'auto-login pour développement
✅ Bouton d'auto-login dans l'interface
✅ Tokens JWT générés automatiquement
✅ Configuration SQLite pour développement local
✅ Sécurité : désactivé automatiquement en production

## 🎉 C'est prêt !

Rendez-vous sur http://localhost:3006 et cliquez sur **"🚀 Connexion automatique (Dev)"** pour accéder instantanément au dashboard !

---
**Note:** Ce système est conçu pour faciliter le développement. En production, utilisez toujours des identifiants sécurisés et l'authentification standard.
