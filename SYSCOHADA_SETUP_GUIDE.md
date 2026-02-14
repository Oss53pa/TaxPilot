# 🎯 Guide d'Installation et d'Utilisation - SYSCOHADA RAG

## ✅ Ce qui a été fait

### 1. Infrastructure Créée

- ✅ **App `apps.knowledge`** - Base de connaissances complète
- ✅ **Modèles Django** - `SyscohadaSection` et `SyscohadaQuery`
- ✅ **Service d'embeddings** - Recherche sémantique avec sentence-transformers
- ✅ **Parser PDF** - Découpage intelligent du guide SYSCOHADA
- ✅ **Tâches Celery** - Ingestion asynchrone
- ✅ **Commande Django** - `ingest_syscohada` pour lancement facile

### 2. Dépendances Installées

```
✅ sentence-transformers==5.1.1 (modèle français CamemBERT)
✅ pgvector==0.4.1 (extension PostgreSQL)
✅ pdfplumber==0.11.7 (extraction PDF)
✅ PyTorch 2.7.1+cu118 (déjà installé)
```

### 3. Configuration

- ✅ App ajoutée à `INSTALLED_APPS`
- ✅ Prêt pour migrations

---

## 🚀 Étapes d'Installation

### Étape 1 : Installer l'extension pgvector dans PostgreSQL

#### Option A : PostgreSQL via Docker (Recommandé)

```bash
# 1. Démarrer le container PostgreSQL
docker-compose up -d db

# 2. Se connecter au container
docker-compose exec db psql -U fiscasync -d fiscasync

# 3. Créer l'extension
CREATE EXTENSION IF NOT EXISTS vector;

# 4. Vérifier l'installation
\dx vector

# Sortie attendue:
#                          List of installed extensions
#   Name   | Version | Schema |                   Description
# ---------+---------+--------+-----------------------------------------------
#  vector  | 0.7.0   | public | vector data type and ivfflat/hnsw access methods

# 5. Quitter
\q
```

#### Option B : PostgreSQL Local

```bash
# En tant qu'administrateur PostgreSQL
psql -U postgres

# Créer l'extension
\c fiscasync
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

---

### Étape 2 : Créer et Appliquer les Migrations

```bash
cd backend

# Activer l'environnement virtuel
venv\Scripts\activate

# Créer les migrations
python manage.py makemigrations knowledge

# Sortie attendue:
# Migrations for 'knowledge':
#   apps/knowledge/migrations/0001_initial.py
#     - Create model SyscohadaSection
#     - Create model SyscohadaQuery
#     - Create index syscohada_search_idx on field(s) search_vector of model syscohadasection
#     - Create index syscohada_cat_idx on field(s) categorie, chapitre of model syscohadasection
#     - Create index syscohada_active_idx on field(s) is_active of model syscohadasection

# Appliquer les migrations
python manage.py migrate knowledge

# Sortie attendue:
# Operations to perform:
#   Apply all migrations: knowledge
# Running migrations:
#   Applying knowledge.0001_initial... OK
```

---

### Étape 3 : Ingérer le Guide SYSCOHADA

#### Préparation

Votre fichier PDF est ici :
```
C:\Users\User\Dropbox\PRAEDIUM TECH- CONTROLLED DOCUMENT\SYSCOHADA REVISE_BRAZZA     26.01.17_TEXTE FINAL.pdf
```

#### Méthode 1 : Commande Django (Simple)

```bash
# Ingestion synchrone (pour voir la progression)
python manage.py ingest_syscohada "C:\Users\User\Dropbox\PRAEDIUM TECH- CONTROLLED DOCUMENT\SYSCOHADA REVISE_BRAZZA     26.01.17_TEXTE FINAL.pdf"

# Avec suppression des anciennes données
python manage.py ingest_syscohada "C:\Users\User\Dropbox\PRAEDIUM TECH- CONTROLLED DOCUMENT\SYSCOHADA REVISE_BRAZZA     26.01.17_TEXTE FINAL.pdf" --clear
```

**Temps estimé** : 5-10 minutes

**Sortie attendue** :
```
============================================================
Ingestion du Guide SYSCOHADA
============================================================

Fichier PDF: C:\Users\User\Dropbox\...
Supprimer existants: False
Mode asynchrone: False

Ingestion synchrone (peut prendre plusieurs minutes)...

Step 1/4: Parsing PDF...
Processed 100/500 pages
Processed 200/500 pages
...
Parsed 450 sections

Step 2/4: Generating embeddings...
Generated 450 embeddings

Step 3/4: Creating database entries...
Prepared 100/450 sections
Prepared 200/450 sections
...
Created 450 sections in database

Step 4/4: Updating search vectors...

============================================================
INGESTION REUSSIE
============================================================

Statistiques:
  - Pages traitées: 500
  - Sections créées: 450
  - Embeddings générés: 450

  Répartition par catégorie:
    - plan_comptable: 180
    - etats_financiers: 120
    - evaluation: 80
    - autre: 70

Longueur moyenne des sections: 1500 caractères
```

#### Méthode 2 : Mode Asynchrone (Pour grosse ingestion)

```bash
# Lancer en tâche Celery (asynchrone)
python manage.py ingest_syscohada "C:\Users\User\Dropbox\PRAEDIUM TECH- CONTROLLED DOCUMENT\SYSCOHADA REVISE_BRAZZA     26.01.17_TEXTE FINAL.pdf" --async --clear

# Sortie:
# Tâche Celery lancée: a1b2c3d4-e5f6-7890-abcd-ef1234567890
# Utilisez ce ID pour suivre la progression.
```

**Suivre la tâche** :
```python
python manage.py shell

>>> from celery.result import AsyncResult
>>> task = AsyncResult('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
>>> print(task.status)  # PENDING, STARTED, SUCCESS, FAILURE
>>> print(task.result)  # Résultat final
```

---

## 🔍 Test de la Recherche

### Test 1 : Recherche Sémantique

```python
python manage.py shell

>>> from apps.knowledge.services import EmbeddingService
>>>
>>> service = EmbeddingService()
>>>
>>> # Recherche en langage naturel
>>> results = service.search_similar(
...     query="Comment comptabiliser les immobilisations corporelles ?",
...     limit=3
... )
>>>
>>> for result in results:
...     print(f"\nScore: {result['similarity_score']:.2f}")
...     print(f"Titre: {result['titre']}")
...     print(f"Chapitre: {result['chapitre']}")
...     print(f"Extrait: {result['contenu'][:100]}...")
...     print("-" * 60)
```

**Résultat attendu** :
```
Score: 0.92
Titre: Chapitre 3 - Immobilisations Corporelles
Chapitre: Classe 2 - Comptes d'Actif Immobilisé
Extrait: Les immobilisations corporelles sont des actifs physiques détenus par une entreprise...
------------------------------------------------------------

Score: 0.87
Titre: Article 2.21 - Terrains
Chapitre: Classe 2 - Comptes d'Actif Immobilisé
Extrait: Les terrains comprennent les sols et sous-sols...
------------------------------------------------------------
```

### Test 2 : Recherche par Compte

```python
>>> # Recherche par numéro de compte
>>> results = service.search_by_compte("2154", limit=2)
>>>
>>> for result in results:
...     print(f"\nTitre: {result['titre']}")
...     print(f"Comptes concernés: {result['comptes_concernes']}")
...     print(f"Article: {result['numero_article']}")
```

### Test 3 : Vérifier les Données

```python
>>> from apps.knowledge.models import SyscohadaSection
>>>
>>> # Statistiques
>>> print(f"Total sections: {SyscohadaSection.objects.count()}")
>>> print(f"Sections actives: {SyscohadaSection.objects.filter(is_active=True).count()}")
>>>
>>> # Par catégorie
>>> from django.db.models import Count
>>> categories = SyscohadaSection.objects.values('categorie').annotate(
...     count=Count('id')
... )
>>> for cat in categories:
...     print(f"{cat['categorie']}: {cat['count']}")
```

---

## 🎯 Utilisation dans le Code

### 1. Intégration dans l'Audit Engine

```python
# apps/audit/services/audit_engine.py

from apps.knowledge.services import EmbeddingService

class AuditEngineService:

    def __init__(self):
        self.syscohada_knowledge = EmbeddingService()

    def verifier_conformite_compte(self, numero_compte, libelle):
        """
        Vérifie la conformité d'un compte selon SYSCOHADA
        """
        # Recherche dans la base de connaissances
        query = f"compte {numero_compte} {libelle}"
        results = self.syscohada_knowledge.search_similar(query, limit=3)

        if not results:
            return {
                'conforme': False,
                'raison': 'Compte non trouvé dans SYSCOHADA',
                'anomalie_niveau': 'CRITIQUE'
            }

        best_match = results[0]

        # Vérifier le score de similarité
        if best_match['similarity_score'] > 0.75:
            return {
                'conforme': True,
                'reference': best_match['titre'],
                'article': best_match['numero_article'],
                'score_confiance': best_match['similarity_score'],
                'explication': best_match['contenu'][:200]
            }
        else:
            return {
                'conforme': False,
                'raison': 'Correspondance faible avec SYSCOHADA',
                'suggestion': best_match['titre'],
                'anomalie_niveau': 'AVERTISSEMENT'
            }

    def audit_balance_avec_syscohada(self, balance_id):
        """
        Audit complet d'une balance avec validation SYSCOHADA
        """
        from apps.balance.models import BalanceLigne

        balance_lignes = BalanceLigne.objects.filter(balance_id=balance_id)

        anomalies_syscohada = []

        for ligne in balance_lignes:
            # Vérifier chaque ligne avec SYSCOHADA
            conformite = self.verifier_conformite_compte(
                ligne.numero_compte,
                ligne.libelle
            )

            if not conformite['conforme']:
                anomalies_syscohada.append({
                    'compte': ligne.numero_compte,
                    'libelle': ligne.libelle,
                    'montant': ligne.montant,
                    'raison': conformite['raison'],
                    'suggestion': conformite.get('suggestion'),
                    'niveau': conformite.get('anomalie_niveau')
                })

        return {
            'anomalies_syscohada': anomalies_syscohada,
            'nb_anomalies': len(anomalies_syscohada),
            'taux_conformite': 1 - (len(anomalies_syscohada) / balance_lignes.count())
        }
```

### 2. API REST (À créer)

```python
# apps/knowledge/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from .services import EmbeddingService

class SyscohadaSearchView(APIView):
    """API de recherche dans SYSCOHADA"""

    def post(self, request):
        query = request.data.get('query')
        mode = request.data.get('mode', 'semantic')
        limit = request.data.get('limit', 5)

        service = EmbeddingService()

        if mode == 'semantic':
            results = service.search_similar(query, limit=limit, user=request.user)
        elif mode == 'compte':
            results = service.search_by_compte(query, limit=limit, user=request.user)

        return Response({
            'query': query,
            'results': results,
            'count': len(results)
        })
```

---

## 📊 Monitoring & Maintenance

### Statistiques

```python
from apps.knowledge.models import SyscohadaSection, SyscohadaQuery

# Sections
stats = {
    'total': SyscohadaSection.objects.count(),
    'actives': SyscohadaSection.objects.filter(is_active=True).count(),
    'avec_embeddings': SyscohadaSection.objects.exclude(embedding__isnull=True).count(),
}

# Requêtes (dernières 24h)
from django.utils import timezone
from datetime import timedelta

recent_queries = SyscohadaQuery.objects.filter(
    created_at__gte=timezone.now() - timedelta(days=1)
).count()
```

### Regénérer les Embeddings

```python
# Si besoin de changer de modèle ou régénérer
from apps.knowledge.tasks import regenerate_all_embeddings

task = regenerate_all_embeddings.delay()
print(f"Task ID: {task.id}")
```

---

## 🐛 Troubleshooting

### Problème 1 : Extension pgvector non trouvée

**Erreur** :
```
django.db.utils.OperationalError: type "vector" does not exist
```

**Solution** :
```sql
-- Se connecter à PostgreSQL
\c fiscasync
CREATE EXTENSION vector;
```

### Problème 2 : Modèle d'embeddings ne se télécharge pas

**Erreur** :
```
OSError: Can't find model 'dangvantuan/sentence-camembert-large'
```

**Solution** :
```python
# Téléchargement manuel
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('dangvantuan/sentence-camembert-large')
# Le modèle sera mis en cache
```

### Problème 3 : Mémoire insuffisante lors de l'ingestion

**Solution** :
Utiliser le mode asynchrone et ajuster le `chunk_size` :

```python
# Dans parser_service.py, ligne 149
parser.parse_sections(chunk_size=800)  # Au lieu de 1500
```

---

## ✅ Checklist Finale

Avant de déclarer l'installation réussie :

- [ ] Extension pgvector installée dans PostgreSQL
- [ ] Migrations appliquées sans erreur
- [ ] Ingestion du PDF SYSCOHADA réussie (450+ sections)
- [ ] Test de recherche sémantique fonctionne
- [ ] Test de recherche par compte fonctionne
- [ ] Statistiques affichent les bonnes données
- [ ] (Optionnel) Intégration dans l'audit engine testée

---

## 🚀 Prochaines Étapes

1. **Créer l'API REST** pour le frontend
2. **Intégrer dans l'audit engine** (fichier exemple fourni ci-dessus)
3. **Interface admin Django** pour gérer les sections
4. **Feedback utilisateur** pour améliorer la recherche
5. **Dashboard de monitoring** pour suivre l'utilisation

---

## 📞 Support

Documentation complète dans : `backend/apps/knowledge/README.md`

Fichiers créés :
- `apps/knowledge/models.py` - Modèles de données
- `apps/knowledge/services/embedding_service.py` - Recherche sémantique
- `apps/knowledge/services/parser_service.py` - Parser PDF
- `apps/knowledge/tasks.py` - Tâches Celery
- `apps/knowledge/management/commands/ingest_syscohada.py` - Commande Django

---

**Installation créée par Claude Code** 🤖
**Date** : 2025-10-09
**Status** : ✅ PRÊT POUR TESTS
