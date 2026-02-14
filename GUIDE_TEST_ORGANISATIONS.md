# 🧪 Guide de Test - Module Organisations

**Durée estimée** : 10-15 minutes
**Prérequis** : Backend et Frontend lancés

---

## ✅ Étape 1 : Vérifier que les serveurs tournent

### Frontend
```
✅ URL : http://localhost:3006
✅ Statut : Running (déjà lancé)
```

### Backend
Si pas encore lancé :
```bash
cd backend
python manage.py runserver 8000
```
```
✅ URL : http://localhost:8000
```

---

## 🔐 Étape 2 : Se connecter

1. Ouvrez votre navigateur : **http://localhost:3006**
2. Connectez-vous avec vos identifiants

**Si vous n'avez pas de compte** :
```bash
cd backend
python manage.py createsuperuser
```
Ou créez un compte via l'interface de signup.

---

## 📊 Étape 3 : Tester la page Membres

### Accéder à la page
1. Dans le menu latéral, cherchez la section **"Organisation"**
2. Cliquez sur **"Membres"** (icône 👥)
3. URL : http://localhost:3006/settings/members

### Que tester ?

#### ✅ Affichage de la liste
- [ ] La page se charge sans erreur
- [ ] Un tableau des membres s'affiche
- [ ] Les colonnes sont : Email, Nom, Rôle, Date d'ajout, Actions
- [ ] Vous voyez au moins votre utilisateur actuel

#### ✅ Inviter un membre
1. Cliquez sur le bouton **"Inviter un membre"**
2. Remplissez le formulaire :
   - Email : `test@example.com`
   - Rôle : Sélectionnez "Comptable" (ACCOUNTANT)
3. Cliquez sur **"Envoyer l'invitation"**

**Résultat attendu** :
- ✅ Message de succès affiché
- ✅ La page se rafraîchit
- ✅ Si email configuré : Email envoyé (vérifier console backend)

#### ✅ Modifier un rôle
1. Sur la ligne d'un membre (pas OWNER), cliquez sur **"Modifier"**
2. Changez le rôle
3. Validez

**Résultat attendu** :
- ✅ Rôle mis à jour dans le tableau
- ✅ Message de confirmation

#### ✅ Retirer un membre
1. Sur la ligne d'un membre (pas OWNER), cliquez sur **"Retirer"**
2. Confirmez dans la boîte de dialogue

**Résultat attendu** :
- ✅ Membre retiré de la liste
- ✅ Message de confirmation

---

## 💳 Étape 4 : Tester la page Abonnement

### Accéder à la page
1. Menu latéral → **"Organisation"** → **"Abonnement"** (icône 💳)
2. URL : http://localhost:3006/settings/subscription

### Que tester ?

#### ✅ Affichage des informations
- [ ] Le plan actuel s'affiche (STARTER / BUSINESS / ENTERPRISE)
- [ ] Badge avec couleur selon le plan
- [ ] Statut de l'abonnement (TRIAL / ACTIVE)

#### ✅ Affichage des quotas
- [ ] **Liasses** : X/Y utilisées
- [ ] Barre de progression avec pourcentage
- [ ] Couleur de la barre (vert si <70%, orange si 70-90%, rouge si >90%)
- [ ] Pour ENTERPRISE : "Illimité" affiché

#### ✅ Quotas utilisateurs
- [ ] Nombre d'utilisateurs actifs affiché
- [ ] Quota maximum affiché

#### ✅ Stockage
- [ ] Quota de stockage affiché (en GB)

#### ✅ Informations de facturation
- [ ] Email de facturation affiché (si renseigné)
- [ ] Date de début d'abonnement
- [ ] Date de fin de période d'essai (si en TRIAL)

#### ✅ Actions
1. Cliquez sur **"Changer de plan"**

**Résultat attendu** :
- ✅ Modal ou redirection vers page de sélection de plan
- ✅ Si Stripe configuré : Page de paiement
- ✅ Si Stripe non configuré : Message informatif

---

## ✉️ Étape 5 : Tester la page Invitations

### Accéder à la page
1. Menu latéral → **"Organisation"** → **"Invitations"** (icône ✉️)
2. URL : http://localhost:3006/settings/invitations

### Que tester ?

#### ✅ Onglet "Invitations envoyées"
- [ ] Liste des invitations que vous avez envoyées
- [ ] Colonnes : Email, Rôle, Statut, Date d'envoi, Expire le, Actions
- [ ] Statuts avec couleurs (En attente = jaune, Acceptée = vert, Expirée = gris)

**Pour chaque invitation** :
- [ ] Bouton **"Renvoyer"** disponible (si en attente)
- [ ] Bouton **"Annuler"** disponible (si en attente)
- [ ] Statut correct affiché

#### ✅ Envoyer une nouvelle invitation
1. Cliquez sur **"Envoyer une invitation"**
2. Remplissez :
   - Email : `nouveau@membre.com`
   - Rôle : Sélectionnez "Observateur" (VIEWER)
   - Message (optionnel) : "Bienvenue dans l'équipe !"
3. Envoyez

**Résultat attendu** :
- ✅ Invitation créée
- ✅ Apparaît dans l'onglet "Invitations envoyées"
- ✅ Si email configuré : Email envoyé

#### ✅ Renvoyer une invitation
1. Trouvez une invitation en attente
2. Cliquez sur **"Renvoyer"**

**Résultat attendu** :
- ✅ Date d'expiration prolongée de 7 jours
- ✅ Si email configuré : Nouvel email envoyé
- ✅ Message de confirmation

#### ✅ Annuler une invitation
1. Trouvez une invitation en attente
2. Cliquez sur **"Annuler"**
3. Confirmez

**Résultat attendu** :
- ✅ Invitation supprimée de la liste
- ✅ Message de confirmation

#### ✅ Onglet "Invitations reçues"
1. Cliquez sur l'onglet **"Invitations reçues"**
2. Si vous avez été invité à une autre organisation, vous verrez les invitations ici

**Pour chaque invitation reçue** :
- [ ] Organisation qui invite
- [ ] Rôle proposé
- [ ] Date d'expiration
- [ ] Bouton **"Accepter"** disponible

#### ✅ Accepter une invitation (si disponible)
1. Cliquez sur **"Accepter"** sur une invitation reçue

**Résultat attendu** :
- ✅ Vous rejoignez l'organisation
- ✅ Vous êtes redirigé ou la page se rafraîchit
- ✅ L'invitation disparaît de l'onglet
- ✅ Si email configuré : L'invitant reçoit un email de confirmation

---

## 🔍 Étape 6 : Vérifier les API (optionnel)

### Accéder à la documentation Swagger
Ouvrez : **http://localhost:8000/api/docs/**

### Tester les endpoints

#### 1. Organisations
```
GET /api/v1/organizations/
```
- [ ] Retourne la liste de vos organisations
- [ ] Status 200

#### 2. Membres
```
GET /api/v1/members/
```
- [ ] Retourne la liste des membres
- [ ] Status 200

#### 3. Invitations
```
GET /api/v1/invitations/
```
- [ ] Retourne la liste des invitations
- [ ] Status 200

#### 4. Statistiques
```
GET /api/v1/organizations/{slug}/stats/
```
- [ ] Retourne les statistiques de l'organisation
- [ ] Quotas, membres, abonnement
- [ ] Status 200

---

## 📧 Étape 7 : Tester les emails (optionnel)

### Configuration Console (plus simple)

1. **Configurer le backend** :
```bash
# backend/.env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
FRONTEND_URL=http://localhost:3006
```

2. **Redémarrer le backend** :
```bash
cd backend
python manage.py runserver 8000
```

3. **Envoyer une invitation** depuis l'interface

4. **Vérifier la console backend** :
```
✅ Vous devriez voir le contenu de l'email HTML
✅ Avec le lien d'acceptation
✅ Formatage complet
```

### Configuration Gmail (envoi réel)

1. **Créer un mot de passe d'application** :
   - Compte Google → Sécurité → Validation en deux étapes
   - Mots de passe d'application → Créer

2. **Configurer** :
```bash
# backend/.env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-mot-de-passe-application
DEFAULT_FROM_EMAIL=votre-email@gmail.com
FRONTEND_URL=http://localhost:3006
```

3. **Redémarrer le backend**

4. **Envoyer une invitation** avec votre vraie adresse email

5. **Vérifier votre boîte mail** :
```
✅ Email reçu avec design HTML
✅ Bouton "Accepter l'invitation" cliquable
✅ Expéditeur correct
```

---

## 🐛 Étape 8 : Tester les erreurs

### Erreurs à tester

#### 1. Quota d'utilisateurs atteint
1. Changez le quota dans l'admin : http://localhost:8000/admin/
2. Organisations → Votre org → `users_quota = 1`
3. Essayez d'inviter un nouveau membre

**Résultat attendu** :
- ❌ Message d'erreur : "Quota d'utilisateurs atteint"
- ❌ Invitation non créée

#### 2. Email déjà invité
1. Envoyez une invitation à `test@example.com`
2. Renvoyez une invitation au même email

**Résultat attendu** :
- ❌ Message d'erreur : "Cet email a déjà été invité"
- ❌ Ou invitation existante mise à jour

#### 3. Retirer le OWNER
1. Essayez de retirer l'utilisateur avec le rôle OWNER

**Résultat attendu** :
- ❌ Message d'erreur : "Impossible de retirer le propriétaire"
- ❌ Action bloquée

#### 4. Modifier son propre rôle (si OWNER)
1. En tant que OWNER, essayez de changer votre propre rôle

**Résultat attendu** :
- ❌ Message d'erreur ou action bloquée
- ❌ Le rôle OWNER est protégé

#### 5. Accepter une invitation expirée
1. Dans l'admin, trouvez une invitation
2. Changez `expires_at` à une date passée
3. Essayez de l'accepter

**Résultat attendu** :
- ❌ Message d'erreur : "Cette invitation a expiré"
- ❌ Action bloquée

---

## 🎨 Étape 9 : Vérifier le design

### Layout général
- [ ] Menu "Organisation" visible dans le sidebar
- [ ] Icônes correctes (People, Payment, Mail)
- [ ] Couleurs cohérentes avec le thème
- [ ] Responsive (réduire la fenêtre)

### Pages
- [ ] Titres clairs
- [ ] Tableaux bien formatés
- [ ] Boutons avec icônes
- [ ] Loading spinners pendant les requêtes
- [ ] Messages de succès/erreur visibles
- [ ] Modals centrées

### États
- [ ] Loading : Spinner ou skeleton
- [ ] Empty : Message si aucune donnée
- [ ] Error : Message d'erreur en rouge
- [ ] Success : Message en vert

---

## 📊 Étape 10 : Vérifier les permissions

### Créer un utilisateur VIEWER

1. **Dans l'admin** : http://localhost:8000/admin/
2. Créez un utilisateur avec le rôle VIEWER
3. Connectez-vous avec ce compte

### Tester les restrictions
- [ ] Page Membres : ❌ Ne peut pas inviter
- [ ] Page Membres : ❌ Ne peut pas modifier les rôles
- [ ] Page Membres : ❌ Ne peut pas retirer
- [ ] Page Abonnement : ✅ Peut consulter
- [ ] Page Invitations : ❌ Ne peut pas envoyer

### Créer un utilisateur ADMIN

1. Créez un utilisateur avec le rôle ADMIN
2. Connectez-vous avec ce compte

### Tester les permissions
- [ ] Page Membres : ✅ Peut inviter
- [ ] Page Membres : ✅ Peut modifier les rôles
- [ ] Page Membres : ✅ Peut retirer (sauf OWNER)
- [ ] Page Abonnement : ✅ Peut changer de plan
- [ ] Page Invitations : ✅ Peut envoyer

---

## ✅ Checklist finale

### Fonctionnalités testées
- [ ] Navigation vers les 3 pages
- [ ] Affichage des listes (membres, invitations)
- [ ] Création d'invitation
- [ ] Modification de rôle
- [ ] Retrait de membre
- [ ] Affichage des quotas
- [ ] Renvoyer une invitation
- [ ] Annuler une invitation
- [ ] Accepter une invitation

### API testées
- [ ] GET /api/v1/organizations/
- [ ] GET /api/v1/members/
- [ ] GET /api/v1/invitations/
- [ ] POST /api/v1/invitations/
- [ ] GET /api/v1/organizations/{slug}/stats/

### Sécurité testée
- [ ] OWNER protégé
- [ ] Quotas respectés
- [ ] Permissions par rôle
- [ ] Invitations expirées bloquées

### Design testé
- [ ] Layout cohérent
- [ ] Responsive
- [ ] Loading states
- [ ] Messages d'erreur/succès

### Emails testés (optionnel)
- [ ] Configuration console
- [ ] Envoi d'invitation
- [ ] Template HTML correct
- [ ] Lien d'acceptation fonctionnel

---

## 🎉 Félicitations !

Si tous les tests passent, le module Organisations est **100% fonctionnel** !

### Prochaines étapes
1. ✅ Module testé et validé
2. ⚙️ Configurer l'email pour la production (SendGrid/Mailgun)
3. 💳 Configurer Stripe pour les paiements
4. 🚀 Déployer en production

### Besoin d'aide ?
- **Configuration Email** : `CONFIGURATION_ORGANISATIONS_COMPLETE.md`
- **Configuration Stripe** : `CONFIGURATION_ORGANISATIONS_COMPLETE.md`
- **Troubleshooting** : `CONFIGURATION_ORGANISATIONS_COMPLETE.md`

---

**Date de création** : 26 octobre 2025
**Version** : 1.0.0
**Statut** : ✅ Production-Ready
