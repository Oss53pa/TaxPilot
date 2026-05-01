# Proph3t — Assistant fiscal/comptable SYSCOHADA

**Système expert rule-based** embarqué dans FiscaSync. 100% TypeScript frontend,
zéro appel LLM externe — chaque question est routée par pattern matching vers
un handler typé qui calcule à partir de la balance importée et de la
configuration fiscale du pays actif.

> ⚠️ **Honnêteté méthodologique** : Proph3t n'est **pas un LLM**. C'est un moteur
> de règles + lookup tables + templates. Il est déterministe, hors-ligne, et ses
> réponses sont reproductibles. Il ne comprend pas le langage naturel comme un
> modèle d'IA — il reconnaît des patterns regex et des mots-clés.

---

## 📦 Architecture

```
prophet/
├── Proph3tEngine.ts          ← Routeur principal (770 lignes)
├── Proph3tChatPanel.tsx      ← UI chat (440 lignes)
├── Proph3tFloatingBall.tsx   ← Bouton flottant (61 lignes)
├── Proph3tMessageBubble.tsx  ← Rendu messages (625 lignes)
├── types.ts                  ← Types Intent, RichContent, Context
├── nlp/
│   ├── intentDetector.ts     ← Score-based intent matching (438 lignes)
│   ├── normalize.ts          ← Nettoyage texte, tokenization
│   ├── synonyms.ts           ← 19 groupes de synonymes
│   └── fuzzyMatch.ts         ← Levenshtein distance ≤ 2
└── knowledge/
    ├── fiscalKnowledge.ts        ← Taux IS/TVA/CNPS, calculs, calendrier
    ├── liasseKnowledge.ts        ← Mapping comptes ↔ postes liasse
    ├── auditKnowledge.ts         ← Exécution des 169 contrôles
    ├── auditRemediation.ts       ← Actions concrètes (Phase 7)
    ├── predictiveAnalysis.ts     ← SIG, BFR, ratios, IS estimé (1726 lignes)
    ├── projections.ts            ← Forecast N+1/N+2 (Phase 3)
    ├── regimesSpeciaux.ts        ← PME / Zone franche / EBNL (Phase 6)
    ├── conditionalReasoning.ts   ← Diagnostic fiscal adaptatif
    └── memoryRecall.ts           ← Mémoire conversationnelle (Phase 8)
```

**Total** : ~7 300 lignes de TypeScript, **119 tests** unitaires, 0 dépendance LLM.

---

## 🎯 Liste des 38 intents reconnus

### Domaine SYSCOHADA (10 intents)

| Intent | Exemples de questions |
|---|---|
| `GREETING` | "bonjour", "salut" |
| `HELP` | "aide", "que peux-tu faire" |
| `ACCOUNT_LOOKUP` | "compte 601", "411" |
| `FONCTIONNEMENT` | "fonctionnement 401", "débit/crédit du 521" |
| `CHAPITRE_LOOKUP` | "chapitre 12", "opérations chapitre 22" |
| `OPERATION_SEARCH` | "comptabiliser un emprunt", "écriture cession" |
| `ACCOUNT_SEARCH` | "quel compte pour TVA", "chercher fournisseur" |
| `CLASS_INFO` | "classe 4", "classe 6" |
| `VALIDATE_ACCOUNT` | "valide 4011", "le compte 999 existe ?" |
| `STATS` | "statistiques", "combien de comptes" |

### Domaine Fiscal (5 intents)

| Intent | Exemples |
|---|---|
| `FISCAL_TAX_RATE` | "taux IS", "taux TVA", "taux CNPS" |
| `FISCAL_CALCULATION` | "calculer IS sur 50M", "calculer TVA sur 10M" |
| `FISCAL_DEDUCTIBILITY` | "charges déductibles", "plafond cadeaux" |
| `FISCAL_CALENDAR` | "calendrier fiscal", "échéance acompte" |
| `FISCAL_GENERAL` | "fiscalité CI", "impôts" (fallback) |

### Domaine Liasse (4 intents)

| Intent | Exemples |
|---|---|
| `LIASSE_SHEET` | "Note 15", "feuillet actif" |
| `LIASSE_REGIME` | "régime réel normal", "SMT" |
| `LIASSE_CATEGORY` | "états financiers", "notes annexes" |
| `LIASSE_MAPPING` | "où va le compte 213", "poste AD" |

### Domaine Audit (4 intents)

| Intent | Exemples |
|---|---|
| `AUDIT_CONTROL` | "contrôle FI-003", "détail SS-101" |
| `AUDIT_LEVEL` | "niveau 3", "niveau fiscal" |
| `AUDIT_GENERAL` | "audit", "vue d'ensemble audit" |
| `AUDIT_EXECUTE` | "lance un audit", "audite ma balance" |

### Domaine Prédictif (11 intents)

| Intent | Exemples |
|---|---|
| `PREDICTION_IS` | "estimation IS", "calcul IS" |
| `PREDICTION_TVA` | "prédiction TVA", "TVA à décaisser" |
| `PREDICTION_RATIOS` | "mes ratios", "indicateurs financiers" |
| `PREDICTION_TREND` | "tendances N/N-1", "évolution" |
| `PREDICTION_FORECAST` | "projection N+1", "scénarios optimiste/pessimiste" |
| `PREDICTION_ANOMALY` | "anomalies", "alertes" |
| `PREDICTION_COHERENCE` | "cohérence bilan", "équilibre" |
| `PREDICTION_GENERAL` | "analyse globale", "synthèse" |
| `PREDICTION_SIG` | "SIG", "soldes intermédiaires" |
| `PREDICTION_BREAKEVEN` | "seuil de rentabilité", "point mort" |
| `PREDICTION_BFR` | "BFR", "DSO/DPO/DSI" |

### Domaine Diagnostic (1 intent)

| Intent | Exemples |
|---|---|
| `CONDITIONAL_DIAGNOSTIC` | "diagnostic", "mon régime", "obligations fiscales" |

### Mémoire (2 intents — Phase 8)

| Intent | Exemples |
|---|---|
| `MEMORY_RECALL` | "rappelle-moi", "mémoire", "récap", "où en est-on" |
| `WHAT_IF` | "et si CA = 300M", "imagine 50M de charges", "considère un déficit de 30M" |

### Fallback (1 intent)

| Intent | Comportement |
|---|---|
| `UNKNOWN` | Fuzzy match sur ~1000 comptes → suggestion compte le plus proche |

---

## 🔄 Flow d'une question

```
User input "et si CA = 300M"
    ↓
normalize() → "et si ca = 300m"
    ↓
tokenize() + canonicalize() → ["et", "si", "ca", "300m"]
    ↓
detectIntent(input, context):
  - score WHAT_IF: 95 (regex "et\s*si" match)
  - score FISCAL_GENERAL: 60 (canonical "ca" match)
  - winner: WHAT_IF
    ↓
Proph3tEngine.processQuery() → handleWhatIf(input, context)
    ↓
parseWhatIf("et si ca = 300m") → { key: 'ca_hypothetique', value: 300_000_000 }
    ↓
addHypothesis(context, 'ca_hypothetique', 300_000_000, ...)
    ↓
return { response: { text, content[Card] }, newContext }
    ↓
appendToHistory(newContext, 'user', input)
appendToHistory(newContext, 'assistant', response.text)
    ↓
Proph3tChatPanel renders RichContent + suggestions
```

---

## 🧠 Mémoire conversationnelle (Phase 8)

`ConversationContext` stocke :
- `lastComputation` — dernier calcul effectué (intent, summary, data structurée)
- `lastForecast` — dernière projection (CA N+1/N+2, résultats, confidence)
- `userHypotheses` — hypothèses utilisateur persistantes (avec TTL optionnel)
- `history` — 10 derniers échanges (FIFO)

**Exemples d'utilisation** :
```
> rappelle-moi
[Affiche dernier calcul + projection + hypothèses + 3 derniers messages]

> et si déficit antérieur = 30M
[Enregistre l'hypothèse]

> estimation IS
[Calcule IS en tenant compte du déficit hypothétique]
```

---

## ⚙️ Configuration multi-pays (17 pays OHADA)

Toutes les règles fiscales lisent depuis `tauxFiscauxStore` (Zustand) :
- `getTauxFiscaux()` → taux du pays actif + overrides utilisateur
- `getTauxMeta()` → version Loi de Finances + date d'effet + alerte d'obsolescence
- `getFiscalConfig(countryCode)` → 17 pays via Supabase

**Régimes spéciaux supportés (Phase 6)** : NORMAL · PME (Art. 33 bis) · ZONE_FRANCHE · EBNL · COOPERATIVE.

---

## 📊 169 contrôles d'audit (9 niveaux)

| Niveau | Nom | Nombre | Préfixe |
|---|---|---|---|
| 0 | Structurel | 10 | `S-` |
| 1 | Fondamental | 15 | `F-` |
| 2 | Conformité OHADA | 10 | `C-` |
| 3 | Sens des soldes | 16 | `SS-` |
| 4 | Inter-comptes | 25 | `IC-` |
| 5 | Year-over-Year + Comparison | 14+8 | `YO-` |
| 6 | États financiers | 44 | `EF-` |
| 7 | Fiscal | 20 | `FI-` |
| 8 | Archivage | 7 | `AR-` |

Chaque anomalie génère une **`RemediationAction`** (Phase 7) avec :
- type (`modify_account` / `reclassify` / `verify_doc` / etc.)
- description actionnable (compte, écart, montant suggéré)
- confidence (`high` / `medium` / `low`)
- base légale CGI/OHADA

---

## 🧪 Tests

**119 tests** dans `__tests__/Proph3tEngine.test.ts`. 23 suites groupées par phase :

| Suite | Phase | Tests |
|---|---|---|
| Test 1 | Passage fiscal & IS | 2 |
| Test 2 | Cohérence comptable | 1 |
| Test 3 | Ratios financiers | 1 |
| Test 4 | Mapping liasse | 2 |
| Test 5 | Audit execute | 1 |
| Test 6 | Diagnostic conditionnel | 2 |
| Test 7-10 | NLP base (négation/temporel/multi-intent/core) | 9 |
| Test 11 | Synonymes enrichis | 1 |
| Test 12-14 | SIG / Breakeven / BFR | 6 |
| Test 14B | Projection N+1/N+2 (Phase 3) | 8 |
| Test 14C | Passage fiscal granulaire (Phase 4) | 9 |
| Test 14D | Régimes spéciaux (Phase 6) | 15 |
| Test 15 | Error recovery | 1 |
| Test 16-21 | Edge cases (Phase 5) | 30 |
| Test 22 | Audit remediation (Phase 7) | 12 |
| Test 23 | Mémoire conversationnelle (Phase 8) | 18 |

**Lancer** : `cd frontend && npm test -- prophet`

---

## ➕ Comment ajouter un nouvel intent

1. Ajouter le label au type `Intent` dans [`types.ts`](./types.ts)
2. Détecter dans [`nlp/intentDetector.ts`](./nlp/intentDetector.ts) :
   ```ts
   if (/\bregex_pattern\b/.test(normalized)) {
     add('MON_INTENT', 85)  // score 0-100
   }
   ```
3. Créer le handler dans `knowledge/<domain>.ts` :
   ```ts
   export function handleMonIntent(...): Proph3tResponse {
     return { text, content: [Card], suggestions: [...] }
   }
   ```
4. Exporter via [`knowledge/index.ts`](./knowledge/index.ts)
5. Wirer dans [`Proph3tEngine.ts`](./Proph3tEngine.ts) :
   ```ts
   case 'MON_INTENT':
     response = handleMonIntent(...)
     break
   ```
6. Ajouter au moins 1 test dans `__tests__/Proph3tEngine.test.ts`

---

## ⚠️ Limitations honnêtes

- **Pas de LLM** : Proph3t ne comprend pas une question reformulée de manière inédite. Si vous écrivez "que pense-tu du ratio liquidité ?" il faut que les mots-clés `ratio` ou `liquidite` apparaissent.
- **Confidence "low" sur les projections** : faute de plus de 2 points d'historique, les projections N+1/N+2 utilisent une heuristique de volatilité ±10pts. Pour passer à `medium`, il faudra importer la balance N-2.
- **Mapping liasse statique** : 700+ postes hardcodés. Si SYSCOHADA évolue, il faudra mettre à jour les tables manuellement.
- **Taux fiscaux 2025** : le code expose `getTauxMeta()` qui alerte si la date du jour dépasse `prochaineRevisionEstimee`. À chaque Loi de Finances, mettre à jour `_meta` dans [`taux-fiscaux-ci.ts`](../../config/taux-fiscaux-ci.ts).
- **Régimes spéciaux opt-in** : PME/Zone franche/EBNL ne s'appliquent que si l'utilisateur les déclare explicitement (`pmeEligible: true`, etc.). Proph3t détecte les opportunités mais n'applique rien sans confirmation.

---

## 📜 Historique des évolutions (8 phases)

| Phase | Sujet | Tests ajoutés |
|---|---|---|
| 1 | Compteurs dynamiques (108→169 contrôles) | — |
| 2 | Métadonnées temporelles + alerte obsolescence | — |
| 3 | Projection N+1/N+2 (3 scénarios) | +8 |
| 4 | Passage fiscal granulaire (overrides + warnings) | +9 |
| 5 | Edge cases (balance/déficit/projection/NLP) | +30 |
| 6 | Régimes spéciaux (PME/ZF/EBNL/franchise TVA) | +15 |
| 7 | Audit remediation actionnable | +12 |
| 8 | Mémoire conversationnelle multi-tours | +18 |

**Test count** : 27 (initial) → **119** (post-Phase 8) — **+340%**.
