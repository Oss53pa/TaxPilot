# Guide de Configuration Complet - Module Organisations

## 📋 Vue d'ensemble

Le module **Organisations** est maintenant **100% intégré** entre le frontend et le backend !

### ✅ Ce qui est déjà fait

1. **Backend Django** ✅
   - Modèles : `Organization`, `OrganizationMember`, `Subscription`, `OrganizationInvitation`
   - API ViewSets complets avec permissions
   - URLs enregistrées dans `/api/v1/`
   - Serializers avec validation

2. **Frontend React** ✅
   - Pages de gestion : Membres, Abonnement, Invitations
   - Service TypeScript complet (`organizationService.ts`)
   - Menu de navigation ajouté dans le Sidebar
   - Composants Material-UI prêts à l'emploi

3. **Intégration** ✅
   - Routes configurées : `/settings/members`, `/settings/subscription`, `/settings/invitations`
   - API Client configuré avec intercepteurs
   - Gestion des erreurs et loading states

---

## 🚀 Tester le module (Déjà fonctionnel)

### 1. Backend Django

```bash
cd backend
python manage.py runserver 8000
```

**URLs API disponibles :**
- `GET /api/v1/organizations/` - Liste des organisations
- `GET /api/v1/organizations/{slug}/` - Détails d'une organisation
- `POST /api/v1/organizations/{slug}/increment_liasse/` - Incrémenter le quota
- `GET /api/v1/organizations/{slug}/stats/` - Statistiques
- `GET /api/v1/members/` - Liste des membres
- `POST /api/v1/members/` - Ajouter un membre
- `PATCH /api/v1/members/{id}/` - Modifier un membre
- `DELETE /api/v1/members/{id}/` - Retirer un membre
- `GET /api/v1/invitations/` - Liste des invitations
- `POST /api/v1/invitations/` - Envoyer une invitation
- `POST /api/v1/invitations/accept/` - Accepter une invitation
- `POST /api/v1/invitations/{id}/resend/` - Renvoyer une invitation
- `GET /api/v1/subscriptions/` - Historique des abonnements

### 2. Frontend React

```bash
cd frontend
npm run dev
```

Ouvrez http://localhost:3006 et naviguez vers :
- **Organisations → Membres** : Gestion des membres et rôles
- **Organisations → Abonnement** : Quotas et changement de plan
- **Organisations → Invitations** : Invitations envoyées/reçues

---

## 📧 Configuration Email (Requis pour les invitations)

Pour que les invitations fonctionnent, vous devez configurer un service d'email.

### Option 1 : SendGrid (Recommandé)

1. **Créer un compte SendGrid** : https://signup.sendgrid.com/

2. **Générer une API Key** :
   - Dashboard → Settings → API Keys → Create API Key
   - Copiez la clé générée

3. **Installer le package Python** :
```bash
cd backend
pip install sendgrid
```

4. **Configurer `.env`** :
```bash
# backend/.env
EMAIL_BACKEND=sendgrid_backend.SendgridBackend
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxx
DEFAULT_FROM_EMAIL=noreply@votre-domaine.com
SENDGRID_SANDBOX_MODE_IN_DEBUG=False
```

5. **Créer le backend SendGrid** :

Créez `backend/sendgrid_backend.py` :
```python
from django.core.mail.backends.base import BaseEmailBackend
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings

class SendgridBackend(BaseEmailBackend):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.client = SendGridAPIClient(settings.SENDGRID_API_KEY)

    def send_messages(self, email_messages):
        for message in email_messages:
            mail = Mail(
                from_email=message.from_email,
                to_emails=message.to,
                subject=message.subject,
                html_content=message.body
            )
            try:
                self.client.send(mail)
            except Exception as e:
                if not self.fail_silently:
                    raise
        return len(email_messages)
```

### Option 2 : Mailgun

1. **Créer un compte Mailgun** : https://signup.mailgun.com/

2. **Obtenir vos credentials** :
   - Dashboard → API Keys
   - Notez votre Domain Name et API Key

3. **Installer le package** :
```bash
pip install django-mailgun
```

4. **Configurer `.env`** :
```bash
EMAIL_BACKEND=django_mailgun.MailgunBackend
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.votre-domaine.com
DEFAULT_FROM_EMAIL=noreply@votre-domaine.com
```

### Option 3 : Gmail SMTP (Développement uniquement)

⚠️ **Ne PAS utiliser en production !**

1. **Configurer `.env`** :
```bash
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-mot-de-passe-application
DEFAULT_FROM_EMAIL=votre-email@gmail.com
```

2. **Créer un mot de passe d'application Gmail** :
   - Compte Google → Sécurité → Validation en deux étapes
   - Mots de passe d'application → Créer

### Tester l'envoi d'emails

```bash
cd backend
python manage.py shell
```

```python
from django.core.mail import send_mail

send_mail(
    'Test Email',
    'Ceci est un test',
    'noreply@fiscasync.com',
    ['destinataire@example.com'],
    fail_silently=False,
)
```

---

## 💳 Configuration Stripe (Requis pour les paiements)

### 1. Créer un compte Stripe

1. **Inscription** : https://dashboard.stripe.com/register
2. **Mode Test** : Utilisez les clés de test pour le développement

### 2. Récupérer les clés API

Dans le Dashboard Stripe :
- Developers → API keys
- Notez votre **Publishable key** et **Secret key**

### 3. Installer Stripe

```bash
cd backend
pip install stripe
```

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 4. Configurer Backend

**Ajouter dans `backend/.env`** :
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Créer le service Stripe** - `backend/apps/organizations/stripe_service.py` :
```python
import stripe
from django.conf import settings
from .models import Organization

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    """Service pour gérer les paiements Stripe"""

    @staticmethod
    def create_customer(organization: Organization):
        """Créer un client Stripe"""
        customer = stripe.Customer.create(
            email=organization.billing_email,
            name=organization.name,
            metadata={
                'organization_id': str(organization.id),
                'organization_name': organization.name
            }
        )
        organization.stripe_customer_id = customer.id
        organization.save()
        return customer

    @staticmethod
    def create_subscription(organization: Organization, plan: str):
        """Créer un abonnement Stripe"""
        # Mapper les plans aux price_ids Stripe
        price_ids = {
            'STARTER': 'price_starter',  # Remplacer par vos vrais IDs
            'BUSINESS': 'price_business',
            'ENTERPRISE': 'price_enterprise'
        }

        if not organization.stripe_customer_id:
            StripeService.create_customer(organization)

        subscription = stripe.Subscription.create(
            customer=organization.stripe_customer_id,
            items=[{'price': price_ids[plan]}],
            metadata={
                'organization_id': str(organization.id)
            }
        )

        organization.stripe_subscription_id = subscription.id
        organization.subscription_plan = plan
        organization.subscription_status = 'ACTIVE'
        organization.save()

        return subscription

    @staticmethod
    def cancel_subscription(organization: Organization):
        """Annuler un abonnement"""
        if organization.stripe_subscription_id:
            stripe.Subscription.delete(organization.stripe_subscription_id)
            organization.subscription_status = 'CANCELLED'
            organization.save()
```

**Créer l'endpoint de paiement** - Ajouter dans `backend/apps/organizations/views.py` :
```python
from rest_framework.decorators import action
from .stripe_service import StripeService

class OrganizationViewSet(viewsets.ModelViewSet):
    # ... existing code ...

    @action(detail=True, methods=['post'])
    def create_checkout_session(self, request, slug=None):
        """Créer une session de paiement Stripe"""
        organization = self.get_object()
        plan = request.data.get('plan', 'BUSINESS')

        try:
            session = StripeService.create_checkout_session(
                organization=organization,
                plan=plan,
                success_url=request.data.get('success_url'),
                cancel_url=request.data.get('cancel_url')
            )

            return Response({
                'session_id': session.id,
                'url': session.url
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
```

### 5. Configurer Frontend

**Créer `frontend/src/config/stripe.ts`** :
```typescript
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
)
```

**Ajouter dans `frontend/.env`** :
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
```

### 6. Créer les produits dans Stripe Dashboard

1. Dashboard → Products → Add Product
2. Créer 3 produits :
   - **Starter** : Gratuit (ou 0€)
   - **Business** : Ex. 29€/mois
   - **Enterprise** : Ex. 99€/mois
3. Copiez les **Price IDs** et mettez-les dans `stripe_service.py`

### 7. Webhooks Stripe (Important pour la production)

```bash
# Installer Stripe CLI pour tester les webhooks
stripe listen --forward-to localhost:8000/api/v1/organizations/webhook/
```

**Créer l'endpoint webhook** :
```python
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META['HTTP_STRIPE_SIGNATURE']

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        return HttpResponse(status=400)

    # Gérer les événements
    if event['type'] == 'customer.subscription.updated':
        # Mettre à jour l'organisation
        pass
    elif event['type'] == 'invoice.payment_failed':
        # Suspendre l'organisation
        pass

    return HttpResponse(status=200)
```

---

## 🔧 Configuration Django Settings

Vérifiez que ces apps sont bien dans `INSTALLED_APPS` (`backend/config/settings/base.py`) :

```python
INSTALLED_APPS = [
    # ...
    'apps.organizations',
    'rest_framework',
    'rest_framework_simplejwt',
    # ...
]
```

---

## 📝 Exemple d'utilisation complet

### 1. Créer une organisation (Signup)

```bash
curl -X POST http://localhost:8000/api/v1/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ma Super Entreprise",
    "legal_form": "SARL",
    "user_email": "admin@entreprise.com",
    "user_password": "motdepasse123",
    "user_first_name": "Jean",
    "user_last_name": "Dupont"
  }'
```

### 2. Inviter un membre

```bash
curl -X POST http://localhost:8000/api/v1/invitations/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "organization": "organization-slug",
    "email": "nouveau@membre.com",
    "role": "ACCOUNTANT"
  }'
```

### 3. Accepter une invitation

```bash
curl -X POST http://localhost:8000/api/v1/invitations/accept/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invitation-token-uuid"
  }'
```

### 4. Changer de plan

```bash
curl -X POST http://localhost:8000/api/v1/organizations/my-org/create_checkout_session/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "BUSINESS",
    "success_url": "http://localhost:3006/settings/subscription?success=true",
    "cancel_url": "http://localhost:3006/settings/subscription?cancelled=true"
  }'
```

---

## 🧪 Tests

### Tester les endpoints

```bash
cd backend
python manage.py test apps.organizations.tests
```

### Créer des données de test

```bash
python manage.py shell
```

```python
from apps.organizations.models import Organization, OrganizationMember
from django.contrib.auth import get_user_model

User = get_user_model()

# Créer un utilisateur
user = User.objects.create_user(
    email='test@example.com',
    password='test123',
    first_name='Test',
    last_name='User'
)

# Créer une organisation
org = Organization.objects.create(
    name='Test Organization',
    owner=user,
    subscription_plan='BUSINESS'
)

# Ajouter l'owner comme membre
OrganizationMember.objects.create(
    organization=org,
    user=user,
    role='OWNER'
)

print(f"Created: {org}")
```

---

## 📊 Monitoring et Quotas

Le système gère automatiquement :
- ✅ **Quotas de liasses** : Vérifie avant chaque génération
- ✅ **Quotas d'utilisateurs** : Vérifie avant chaque invitation
- ✅ **Quotas de stockage** : Suit l'utilisation des fichiers
- ✅ **Périodes d'essai** : Calcule automatiquement les jours restants

---

## 🔐 Sécurité et Permissions

Le système implémente :
- **Authentication JWT** : Tous les endpoints requièrent un token valide
- **Authorization par rôle** :
  - `OWNER` : Contrôle total
  - `ADMIN` : Gestion des membres et paramètres
  - `MANAGER` : Création/modification de liasses
  - `ACCOUNTANT` : Consultation et modification limitée
  - `VIEWER` : Lecture seule
- **Isolation multi-tenant** : Chaque organisation voit uniquement ses données
- **Rate limiting** : Protection contre les abus

---

## 🚨 Troubleshooting

### Problème : Les invitations ne s'envoient pas

**Solution** :
1. Vérifiez que l'email backend est configuré dans `.env`
2. Testez l'envoi d'email manuellement (voir section Email)
3. Vérifiez les logs Django : `tail -f backend/logs/app.log`

### Problème : Erreur 403 Forbidden

**Solution** :
1. Vérifiez que l'utilisateur est bien membre de l'organisation
2. Vérifiez que le rôle a les permissions nécessaires
3. Vérifiez le token JWT dans les headers

### Problème : Les paiements Stripe ne fonctionnent pas

**Solution** :
1. Utilisez les clés de test Stripe (`pk_test_...` et `sk_test_...`)
2. Testez avec les cartes de test : `4242 4242 4242 4242`
3. Vérifiez que le webhook est bien enregistré

---

## 🎯 Prochaines étapes

### Améliorations possibles :

1. **Notifications en temps réel** (WebSocket)
   - Notification quand une invitation est acceptée
   - Alerte quota presque atteint

2. **Tableau de bord d'analytics**
   - Graphiques d'utilisation
   - Rapports mensuels

3. **Onboarding guidé**
   - Tour guidé pour les nouveaux utilisateurs
   - Checklist de configuration

4. **SSO / SAML**
   - Connexion avec Google Workspace
   - Connexion avec Microsoft 365

5. **API publique**
   - Webhooks sortants
   - Intégrations tierces

---

## 📞 Support

Pour toute question :
- Documentation : `/api/docs/` (Swagger UI)
- Issues GitHub : https://github.com/votre-repo/issues
- Email : support@fiscasync.com

---

**Fait avec ❤️ par l'équipe FiscaSync**
