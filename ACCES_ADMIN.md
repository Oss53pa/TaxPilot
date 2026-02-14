# 🔐 Accès Superadmin - FiscaSync

**Date** : 26 octobre 2025

---

## 🎯 Qu'est-ce qu'un superadmin ?

Le **superadmin** est un compte administrateur avec tous les privilèges qui permet de :
- Accéder à l'admin Django (interface d'administration backend)
- Gérer toutes les organisations
- Créer/modifier/supprimer des utilisateurs
- Gérer les modèles de données
- Voir les logs et statistiques
- Tester toutes les fonctionnalités

---

## 🚀 Création rapide d'un superadmin

### Méthode 1 : Commande Django (Recommandée)

```bash
cd backend
python manage.py createsuperuser
```

**Répondez aux questions** :
```
Email: admin@fiscasync.com
First name: Admin
Last name: FiscaSync
Password: ******** (votre mot de passe sécurisé)
Password (again): ********
```

**Résultat** :
```
Superuser created successfully.
```

---

### Méthode 2 : Script automatisé

Si la base de données existe déjà avec des données :

```bash
cd backend
python manage.py shell
```

Puis dans le shell Python :

```python
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization, OrganizationMember

User = get_user_model()

# Créer le superadmin
email = 'admin@fiscasync.com'
password = 'admin123'  # Changez ce mot de passe !

user = User.objects.create_superuser(
    email=email,
    password=password,
    first_name='Admin',
    last_name='FiscaSync'
)

print(f"Superadmin créé : {user.email}")

# Créer une organisation pour ce superadmin
org = Organization.objects.create(
    name='FiscaSync Admin',
    slug='fiscasync-admin',
    owner=user,
    subscription_plan='ENTERPRISE',
    subscription_status='ACTIVE',
    liasses_quota=999,
    users_quota=50,
    is_verified=True
)

# Créer le membership
OrganizationMember.objects.create(
    organization=org,
    user=user,
    role='OWNER'
)

print(f"Organisation créée : {org.name}")
print(f"\nEmail: {email}")
print(f"Password: {password}")
```

---

## 🌐 URLs d'accès

Après création du superadmin, vous pouvez accéder à :

### 1. Admin Django (Backend)
**URL** : http://localhost:8000/admin/

**Connexion** :
- Email : `admin@fiscasync.com`
- Mot de passe : celui que vous avez défini

**Ce que vous pouvez faire** :
- ✅ Gérer les organisations
- ✅ Gérer les membres
- ✅ Gérer les invitations
- ✅ Gérer les abonnements
- ✅ Voir tous les utilisateurs
- ✅ Modifier les quotas
- ✅ Gérer les permissions

### 2. Frontend (Interface utilisateur)
**URL** : http://localhost:3006

**Connexion** : Même identifiants

**Ce que vous pouvez voir** :
- ✅ Page Membres (/settings/members)
- ✅ Page Abonnement (/settings/subscription)
- ✅ Page Invitations (/settings/invitations)
- ✅ Dashboard
- ✅ Toutes les fonctionnalités

### 3. API Documentation
**URL** : http://localhost:8000/api/docs/

**Pas de connexion requise** pour consulter la doc
**Token JWT requis** pour tester les endpoints

---

## 🔑 Obtenir un token JWT pour tester l'API

### Via cURL

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fiscasync.com",
    "password": "votre-mot-de-passe"
  }'
```

**Réponse** :
```json
{
  "access": "eyJ0eXAiOiJKV1QiLC...",
  "refresh": "eyJ0eXAiOiJKV1QiLC...",
  "user": {
    "id": 1,
    "email": "admin@fiscasync.com",
    "first_name": "Admin",
    "last_name": "FiscaSync"
  }
}
```

Copiez le token `access` et utilisez-le dans les headers :
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLC...
```

---

## 🧪 Tester avec le superadmin

### 1. Connectez-vous au frontend

1. Ouvrez http://localhost:3006
2. Cliquez sur "Se connecter"
3. Entrez :
   - Email : `admin@fiscasync.com`
   - Mot de passe : votre mot de passe

### 2. Testez les pages Organisations

Une fois connecté, allez dans :
- Menu latéral → **"Organisation"**
- Cliquez sur **"Membres"**, **"Abonnement"**, **"Invitations"**

### 3. Testez l'admin Django

1. Ouvrez http://localhost:8000/admin/
2. Connectez-vous avec les mêmes identifiants
3. Naviguez dans :
   - **Organizations** → Organizations
   - **Organizations** → Organization members
   - **Organizations** → Organization invitations
   - **Organizations** → Subscriptions

---

## 🛠️ Dépannage

### "Table auth_user doesn't exist"

La base de données n'est pas initialisée. Exécutez :

```bash
cd backend
python manage.py migrate
```

### "Email already exists"

Un utilisateur avec cet email existe déjà. Options :

**Option 1** : Utiliser un autre email
```bash
python manage.py createsuperuser
# Entrez : admin2@fiscasync.com
```

**Option 2** : Réinitialiser le mot de passe
```bash
python manage.py changepassword admin@fiscasync.com
```

**Option 3** : Supprimer et recréer
```bash
python manage.py shell
```
```python
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.filter(email='admin@fiscasync.com').delete()
```

### "Permission denied"

Le superadmin n'a pas les bons flags. Vérifiez :

```bash
python manage.py shell
```
```python
from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.get(email='admin@fiscasync.com')
user.is_staff = True
user.is_superuser = True
user.save()

print(f"Staff: {user.is_staff}, Superuser: {user.is_superuser}")
```

---

## 📊 Vérifier les accès

### Depuis le shell Django

```bash
cd backend
python manage.py shell
```

```python
from django.contrib.auth import get_user_model
from apps.organizations.models import Organization

User = get_user_model()

# Lister tous les superadmins
superadmins = User.objects.filter(is_superuser=True)
for admin in superadmins:
    print(f"Email: {admin.email}, Name: {admin.get_full_name()}")

# Lister toutes les organisations
orgs = Organization.objects.all()
for org in orgs:
    print(f"Org: {org.name}, Owner: {org.owner.email}, Plan: {org.subscription_plan}")
```

---

## 🔐 Sécurité - Bonnes pratiques

### Développement
- ✅ Email : `admin@fiscasync.com`
- ✅ Mot de passe simple : `admin123` (OK pour dev local)

### Production
- ⚠️ Email : Utilisez un vrai email d'entreprise
- ⚠️ Mot de passe : Minimum 12 caractères, complexe
- ⚠️ Activez l'authentification à deux facteurs (2FA)
- ⚠️ Limitez les accès superadmin
- ⚠️ Utilisez des rôles spécifiques (ADMIN vs OWNER)

---

## 💡 Comptes de test recommandés

Pour tester différents rôles, créez plusieurs comptes :

### Superadmin (vous)
```
Email: admin@fiscasync.com
Role: SUPERUSER (accès total)
```

### Owner d'organisation
```
Email: owner@exemple.com
Role: OWNER (contrôle total de son organisation)
```

### Admin d'organisation
```
Email: admin.org@exemple.com
Role: ADMIN (gestion membres, paramètres)
```

### Comptable
```
Email: comptable@exemple.com
Role: ACCOUNTANT (saisie et consultation)
```

### Observateur
```
Email: viewer@exemple.com
Role: VIEWER (lecture seule)
```

---

## 📞 Besoin d'aide ?

### Documentation
- **Quick Start** : `QUICK_START_ORGANISATIONS.md`
- **Guide de test** : `GUIDE_TEST_ORGANISATIONS.md`
- **Configuration** : `CONFIGURATION_ORGANISATIONS_COMPLETE.md`

### Commandes utiles
```bash
# Créer un superadmin
python manage.py createsuperuser

# Changer un mot de passe
python manage.py changepassword email@example.com

# Shell Django
python manage.py shell

# Lister les utilisateurs
python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); [print(u.email) for u in User.objects.all()]"
```

---

## ✅ Checklist de vérification

Après création du superadmin, vérifiez :

- [ ] Connexion réussie à http://localhost:8000/admin/
- [ ] Connexion réussie à http://localhost:3006
- [ ] Accès aux pages Organisations (Membres, Abonnement, Invitations)
- [ ] Possibilité de créer/modifier des organisations
- [ ] Possibilité d'inviter des membres
- [ ] Token JWT obtenu via l'API
- [ ] Test des endpoints avec Swagger

---

**Créé le** : 26 octobre 2025
**Mis à jour le** : 26 octobre 2025
**Version** : 1.0.0

---

**🔑 Résumé rapide**

```bash
# 1. Créer le superadmin
cd backend
python manage.py createsuperuser

# 2. Se connecter
# Frontend: http://localhost:3006
# Admin: http://localhost:8000/admin/
# Email: admin@fiscasync.com
# Password: celui que vous avez défini

# 3. Tester
# Menu "Organisation" → Membres, Abonnement, Invitations
```

**Bon test ! 🚀**
