# Plan d'Intégration SYSCOHADA - Guide d'Application

## 🎯 Objectif

Intégrer le guide d'application SYSCOHADA pour permettre à l'IA de :
- Contrôler la conformité comptable OHADA
- Auditer automatiquement selon les règles SYSCOHADA
- Suggérer des corrections basées sur la réglementation
- Répondre aux questions sur les normes comptables

---

## 📋 3 Approches Possibles

### 1️⃣ Solution Simple - Full-Text Search (PostgreSQL)

**Complexité** : ⭐ Faible
**Temps** : 1-2 jours
**Coût** : Gratuit

#### Architecture
```
Guide SYSCOHADA (PDF/TXT)
    ↓
Découpage en sections/articles
    ↓
Stockage PostgreSQL + full-text search
    ↓
API de recherche
    ↓
Intégration dans l'audit engine
```

#### Avantages
- ✅ Rapide à implémenter
- ✅ Pas de coûts supplémentaires
- ✅ Recherche par mots-clés efficace
- ✅ Utilise l'infrastructure existante

#### Inconvénients
- ❌ Recherche basée sur les mots-clés (pas sémantique)
- ❌ Moins "intelligent"

---

### 2️⃣ Solution Moyenne - RAG avec Embeddings (Recommandée ⭐)

**Complexité** : ⭐⭐ Moyenne
**Temps** : 3-5 jours
**Coût** : Gratuit (avec modèles open-source)

#### Architecture
```
Guide SYSCOHADA (PDF/TXT)
    ↓
Découpage en chunks sémantiques
    ↓
Génération d'embeddings (sentence-transformers)
    ↓
Stockage PostgreSQL + pgvector
    ↓
Recherche vectorielle sémantique
    ↓
RAG : Récupération + Génération de réponse
    ↓
Intégration dans l'audit engine
```

#### Avantages
- ✅ Recherche sémantique (comprend le contexte)
- ✅ Gratuit avec modèles open-source
- ✅ Meilleure précision
- ✅ Peut répondre à des questions complexes

#### Inconvénients
- ⚠️ Nécessite pgvector
- ⚠️ Plus complexe à mettre en place

---

### 3️⃣ Solution Avancée - LLM Fine-tuné

**Complexité** : ⭐⭐⭐ Élevée
**Temps** : 2-3 semaines
**Coût** : Variable (GPU nécessaire)

#### Architecture
```
Guide SYSCOHADA
    ↓
Préparation dataset Q&A
    ↓
Fine-tuning LLM (LLaMA, Mistral)
    ↓
Déploiement du modèle
    ↓
API d'inférence
```

#### Avantages
- ✅ IA "experte" en SYSCOHADA
- ✅ Réponses très précises
- ✅ Peut générer des explications détaillées

#### Inconvénients
- ❌ Très complexe
- ❌ Coûts GPU
- ❌ Maintenance lourde

---

## 🎯 Recommandation : Solution 2 (RAG avec Embeddings)

**Pourquoi ?**
- ⚖️ Bon équilibre complexité/performance
- 💰 Gratuit (modèles open-source)
- 🚀 Résultats de qualité
- 🔧 Utilise PyTorch (déjà installé)

---

## 🏗️ Architecture Détaillée (Solution RAG)

### 1. Modèle de Données

```python
# apps/knowledge/models.py

class SyscohadaSection(models.Model):
    """Section du guide SYSCOHADA"""

    titre = models.CharField(max_length=500)
    chapitre = models.CharField(max_length=200)
    numero_article = models.CharField(max_length=50, null=True)

    contenu = models.TextField()
    contenu_chunk = models.TextField()  # Version découpée pour embeddings

    # Métadonnées
    page_debut = models.IntegerField(null=True)
    page_fin = models.IntegerField(null=True)
    categorie = models.CharField(max_length=100)  # Plan comptable, États financiers, etc.

    # Pour la recherche
    embedding = VectorField(dimensions=384)  # pgvector
    search_vector = SearchVectorField()  # Full-text search

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'syscohada_sections'
        indexes = [
            GinIndex(fields=['search_vector']),
            models.Index(fields=['categorie', 'chapitre']),
        ]
```

### 2. Service de Génération d'Embeddings

```python
# apps/knowledge/services/embedding_service.py

from sentence_transformers import SentenceTransformer
import torch

class EmbeddingService:
    """Service de génération d'embeddings pour SYSCOHADA"""

    def __init__(self):
        # Modèle français optimisé
        self.model = SentenceTransformer('dangvantuan/sentence-camembert-large')

    def generate_embedding(self, text: str) -> list:
        """Génère un embedding pour un texte"""
        with torch.no_grad():
            embedding = self.model.encode(text)
        return embedding.tolist()

    def find_similar(self, query: str, limit: int = 5):
        """Recherche sémantique dans SYSCOHADA"""
        query_embedding = self.generate_embedding(query)

        # Recherche vectorielle dans PostgreSQL
        results = SyscohadaSection.objects.annotate(
            similarity=CosineDistance('embedding', query_embedding)
        ).order_by('similarity')[:limit]

        return results
```

### 3. Tâche Celery d'Ingestion

```python
# apps/knowledge/tasks.py

from config import celery_app
import PyPDF2

@celery_app.task
def ingest_syscohada_document(file_path: str):
    """Ingère le guide SYSCOHADA et crée les embeddings"""

    # 1. Extraction du PDF
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        full_text = ""
        for page in pdf_reader.pages:
            full_text += page.extract_text()

    # 2. Découpage en sections
    sections = parse_syscohada_sections(full_text)

    # 3. Génération des embeddings
    embedding_service = EmbeddingService()

    for section in sections:
        embedding = embedding_service.generate_embedding(section['contenu'])

        SyscohadaSection.objects.create(
            titre=section['titre'],
            chapitre=section['chapitre'],
            contenu=section['contenu'],
            embedding=embedding,
            categorie=section['categorie']
        )

    return {'sections_created': len(sections)}
```

### 4. API de Recherche

```python
# apps/knowledge/views.py

from rest_framework.views import APIView
from .services.embedding_service import EmbeddingService

class SyscohadaSearchView(APIView):
    """Recherche dans le guide SYSCOHADA"""

    def post(self, request):
        query = request.data.get('query')
        mode = request.data.get('mode', 'semantic')  # semantic ou fulltext

        if mode == 'semantic':
            # Recherche vectorielle
            service = EmbeddingService()
            results = service.find_similar(query, limit=5)
        else:
            # Recherche full-text
            results = SyscohadaSection.objects.filter(
                search_vector=SearchQuery(query)
            )[:5]

        return Response({
            'query': query,
            'results': [
                {
                    'titre': r.titre,
                    'chapitre': r.chapitre,
                    'contenu': r.contenu,
                    'score': r.similarity if mode == 'semantic' else None
                }
                for r in results
            ]
        })
```

### 5. Intégration dans l'Audit Engine

```python
# apps/audit/services/audit_engine.py

from apps.knowledge.services.embedding_service import EmbeddingService

class AuditEngineService:

    def __init__(self):
        self.syscohada = EmbeddingService()

    def verifier_conformite_compte(self, numero_compte, libelle, montant):
        """Vérifie la conformité d'un compte selon SYSCOHADA"""

        # Recherche dans SYSCOHADA
        query = f"compte {numero_compte} {libelle}"
        sections = self.syscohada.find_similar(query, limit=3)

        # Analyse de conformité
        for section in sections:
            if self.est_conforme(numero_compte, section):
                return {
                    'conforme': True,
                    'reference': section.titre,
                    'article': section.numero_article
                }

        return {
            'conforme': False,
            'recommandation': sections[0].contenu if sections else None
        }
```

---

## 📦 Dépendances Nécessaires

```bash
# Modèle d'embeddings français
pip install sentence-transformers

# Extension PostgreSQL pour vecteurs
# Dans PostgreSQL
CREATE EXTENSION vector;

# Python
pip install pgvector

# Traitement PDF (si besoin)
pip install PyPDF2 pdfplumber
```

---

## 🗂️ Structure des Fichiers

```
backend/
├── apps/
│   └── knowledge/              # Nouvelle app
│       ├── models.py           # SyscohadaSection
│       ├── tasks.py            # Ingestion Celery
│       ├── views.py            # API recherche
│       ├── services/
│       │   ├── embedding_service.py
│       │   └── parser_service.py
│       └── management/
│           └── commands/
│               └── ingest_syscohada.py
├── data/
│   └── syscohada/
│       └── guide_application.pdf
```

---

## 🚀 Plan d'Implémentation

### Phase 1 : Infrastructure (Jour 1)
- [ ] Créer l'app `knowledge`
- [ ] Installer pgvector
- [ ] Créer le modèle `SyscohadaSection`
- [ ] Migrations

### Phase 2 : Ingestion (Jour 2)
- [ ] Script de parsing du PDF
- [ ] Service d'embeddings
- [ ] Tâche Celery d'ingestion
- [ ] Commande Django `ingest_syscohada`

### Phase 3 : Recherche (Jour 3)
- [ ] API de recherche sémantique
- [ ] API de recherche full-text
- [ ] Tests unitaires

### Phase 4 : Intégration Audit (Jour 4-5)
- [ ] Intégration dans AuditEngine
- [ ] Règles de validation SYSCOHADA
- [ ] Tests d'intégration
- [ ] Documentation

---

## 💡 Exemple d'Utilisation

### 1. Ingestion du Guide
```bash
# Commande Django
python manage.py ingest_syscohada data/syscohada/guide_application.pdf

# Ou via Celery (asynchrone)
from apps.knowledge.tasks import ingest_syscohada_document
result = ingest_syscohada_document.delay('data/syscohada/guide_application.pdf')
```

### 2. Recherche
```python
# API REST
POST /api/knowledge/syscohada/search/
{
    "query": "comment comptabiliser les immobilisations corporelles",
    "mode": "semantic"
}

# Réponse
{
    "results": [
        {
            "titre": "Chapitre 3 - Immobilisations corporelles",
            "chapitre": "Plan des comptes - Classe 2",
            "contenu": "Les immobilisations corporelles sont des actifs...",
            "score": 0.92
        }
    ]
}
```

### 3. Audit Automatique
```python
# Dans l'audit engine
audit_engine = AuditEngineService()
conformite = audit_engine.verifier_conformite_compte(
    numero_compte="2154",
    libelle="Matériel de transport",
    montant=50000
)

# Résultat
{
    'conforme': True,
    'reference': 'Chapitre 3 - Classe 2, Compte 215',
    'article': 'Article 2.154'
}
```

---

## 📊 Estimations

| Tâche | Temps | Complexité |
|-------|-------|------------|
| Setup infrastructure | 4h | ⭐⭐ |
| Parsing PDF + Ingestion | 8h | ⭐⭐ |
| Service embeddings | 4h | ⭐⭐ |
| API recherche | 6h | ⭐⭐ |
| Intégration audit | 8h | ⭐⭐⭐ |
| Tests + Documentation | 6h | ⭐ |
| **TOTAL** | **~36h (5 jours)** | |

---

## 🎯 Bénéfices Attendus

### Fonctionnel
- ✅ Audits conformes SYSCOHADA automatiquement
- ✅ Suggestions de corrections basées sur la réglementation
- ✅ Réponses aux questions comptables
- ✅ Validation des plans comptables

### Technique
- ✅ Utilise l'infrastructure existante (Celery, PyTorch)
- ✅ Scalable (PostgreSQL + pgvector)
- ✅ Recherche rapide (<100ms)
- ✅ Open-source (gratuit)

### Business
- ✅ Différenciation concurrentielle forte
- ✅ Réduction des erreurs de conformité
- ✅ Gain de temps pour les comptables
- ✅ Expertise SYSCOHADA intégrée

---

## ❓ Questions ?

**Souhaitez-vous que je commence l'implémentation ?**

Je peux créer :
1. La structure de l'app `knowledge`
2. Le modèle de données
3. Le service d'embeddings
4. Le script d'ingestion

**Ou préférez-vous d'abord :**
- Un prototype simple avec full-text search ?
- Plus de détails sur une partie spécifique ?
- Une démo de faisabilité ?
