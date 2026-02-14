# 📦 Module Organizations - Documentation

## 🎯 Vue d'ensemble

Ce module gère toutes les fonctionnalités liées aux **organisations multi-tenant SaaS** dans TaxPilot :
- Gestion des membres
- Gestion des abonnements (subscriptions)
- Système d'invitations

## 📁 Structure

```
organization/
├── OrganizationMembersPage.tsx    # Page de gestion des membres
├── SubscriptionPage.tsx           # Page de gestion de l'abonnement
├── InvitationsPage.tsx            # Page de gestion des invitations
└── index.ts                       # Exports centralisés
```

## 🧩 Composants

### 1. OrganizationMembersPage

**Description:** Page pour gérer les membres d'une organisation.

**Fonctionnalités:**
- ✅ Liste de tous les membres avec leurs rôles
- ✅ Invitation de nouveaux membres par email
- ✅ Modification des rôles des membres
- ✅ Suppression de membres
- ✅ Affichage de qui a invité chaque membre

**Utilisation:**

```tsx
import { OrganizationMembersPage } from '@/pages/organization'

function MyOrganizationSettings() {
  const organizationSlug = 'my-org-slug'

  return <OrganizationMembersPage organizationSlug={organizationSlug} />
}
```

**Props:**
- `organizationSlug` (string, required) - Le slug de l'organisation

---

### 2. SubscriptionPage

**Description:** Page pour gérer l'abonnement d'une organisation.

**Fonctionnalités:**
- ✅ Affichage du plan actuel (STARTER, BUSINESS, ENTERPRISE)
- ✅ Visualisation de l'usage des quotas (liasses, stockage, utilisateurs)
- ✅ Alerte lorsque proche de la limite
- ✅ Comparaison des plans disponibles
- ✅ Mise à niveau (upgrade) vers un plan supérieur
- ✅ Annulation de l'abonnement
- ✅ Affichage de la période d'essai restante

**Utilisation:**

```tsx
import { SubscriptionPage } from '@/pages/organization'

function MySubscriptionSettings() {
  const organizationSlug = 'my-org-slug'

  return <SubscriptionPage organizationSlug={organizationSlug} />
}
```

**Props:**
- `organizationSlug` (string, required) - Le slug de l'organisation

**Plans disponibles:**

| Plan | Prix/mois | Liasses/an | Utilisateurs | Stockage | Support |
|------|-----------|------------|--------------|----------|---------|
| STARTER | Gratuit | 2 | 1 | 1 GB | Email |
| BUSINESS | 25,000 XOF | 12 | 5 | 10 GB | Prioritaire |
| ENTERPRISE | 75,000 XOF | Illimité | Illimité | Illimité | Dédié 24/7 |

---

### 3. InvitationsPage

**Description:** Page pour gérer les invitations (envoyées et reçues).

**Fonctionnalités:**
- ✅ Onglet "Invitations envoyées"
  - Liste des invitations envoyées par l'organisation
  - Statut de chaque invitation (PENDING, ACCEPTED, EXPIRED, CANCELLED)
  - Renvoi d'invitation
  - Annulation d'invitation
- ✅ Onglet "Invitations reçues"
  - Liste des invitations reçues par l'utilisateur
  - Acceptation d'invitation
  - Refus d'invitation

**Utilisation:**

```tsx
import { InvitationsPage } from '@/pages/organization'

function MyInvitationsManager() {
  const organizationSlug = 'my-org-slug'

  return <InvitationsPage organizationSlug={organizationSlug} />
}
```

**Props:**
- `organizationSlug` (string, required) - Le slug de l'organisation

---

### 4. InviteMemberDialog (Composant réutilisable)

**Description:** Dialog réutilisable pour inviter un membre.

**Utilisation:**

```tsx
import { InviteMemberDialog } from '@/components/organization'

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Inviter</Button>

      <InviteMemberDialog
        open={open}
        onClose={() => setOpen(false)}
        organizationSlug="my-org-slug"
        onSuccess={() => {
          console.log('Invitation envoyée!')
          // Recharger la liste des membres
        }}
      />
    </>
  )
}
```

**Props:**
- `open` (boolean, required) - État d'ouverture du dialog
- `onClose` (function, required) - Callback à l'appel de la fermeture
- `organizationSlug` (string, required) - Le slug de l'organisation
- `onSuccess` (function, optional) - Callback appelée après succès

---

## 🔌 Intégration avec le Backend

Tous ces composants utilisent le service `organizationService` qui communique avec les APIs backend :

```typescript
// APIs utilisées
GET    /api/v1/members/                 # Liste des membres
POST   /api/v1/members/                 # Ajouter un membre
PATCH  /api/v1/members/{id}/            # Modifier le rôle
DELETE /api/v1/members/{id}/            # Retirer un membre

GET    /api/v1/subscriptions/           # Liste des subscriptions
POST   /api/v1/subscriptions/           # Créer une subscription
PATCH  /api/v1/subscriptions/{id}/      # Mettre à niveau

GET    /api/v1/invitations/             # Liste des invitations
POST   /api/v1/invitations/             # Envoyer une invitation
POST   /api/v1/invitations/{id}/resend/ # Renvoyer une invitation
DELETE /api/v1/invitations/{id}/        # Annuler une invitation
POST   /api/v1/invitations/accept/      # Accepter une invitation
```

## 🎨 Personnalisation

### Couleurs des rôles

Les couleurs sont définies dans `organizationService.getMemberRoleColor()`:

```typescript
OWNER: '#6f42c1' (Violet)
ADMIN: '#007bff' (Bleu)
MEMBER: '#28a745' (Vert)
VIEWER: '#6c757d' (Gris)
```

### Couleurs des statuts d'invitation

```typescript
PENDING: '#ffc107' (Jaune)
ACCEPTED: '#28a745' (Vert)
EXPIRED: '#6c757d' (Gris)
CANCELLED: '#dc3545' (Rouge)
```

## 🔒 Permissions

### Rôles et permissions

| Action | OWNER | ADMIN | MEMBER | VIEWER |
|--------|-------|-------|--------|--------|
| Voir membres | ✅ | ✅ | ✅ | ✅ |
| Inviter membres | ✅ | ✅ | ❌ | ❌ |
| Modifier rôles | ✅ | ✅ | ❌ | ❌ |
| Retirer membres | ✅ | ✅ | ❌ | ❌ |
| Gérer subscription | ✅ | ❌ | ❌ | ❌ |
| Annuler subscription | ✅ | ❌ | ❌ | ❌ |

**Note:** Le rôle OWNER ne peut pas être modifié ou supprimé.

## 🧪 Tests

Pour tester les composants :

```bash
# Dans le répertoire frontend
npm run dev

# Naviguer vers
http://localhost:5173/organization/{slug}/members
http://localhost:5173/organization/{slug}/subscription
http://localhost:5173/organization/{slug}/invitations
```

## 🐛 Debugging

Tous les appels API sont loggés dans la console avec des emojis :

```
🔄 Fetching organization members from backend...
✅ Members loaded successfully
📤 Sending invitation...
✅ Invitation sent successfully
```

En cas d'erreur, vérifier :
1. La connexion au backend (API_BASE_URL dans .env)
2. Le token JWT dans sessionStorage
3. Les logs de la console navigateur
4. Les logs du backend Django

## 📝 TODO / Améliorations futures

- [ ] Ajouter la pagination pour la liste des membres
- [ ] Implémenter la recherche de membres
- [ ] Ajouter des filtres (par rôle, par date)
- [ ] Graphiques d'utilisation des quotas
- [ ] Historique des changements de plan
- [ ] Notifications par email pour invitations
- [ ] Export de la liste des membres en CSV
- [ ] Permissions granulaires personnalisables

## 🆘 Support

Pour toute question ou problème, consulter :
- Documentation API : `/api/docs/` (Swagger)
- Logs backend : `backend/logs/`
- Issues GitHub : https://github.com/votre-repo/issues
