# 🔄 Guide de Migration - Version Consolidée Liasse Fiscale

> Migration de 7 versions vers **LiasseFiscaleOfficial** (version unique)

---

## 📋 Vue d'ensemble

### Versions à remplacer

| Fichier obsolète | Lignes | À remplacer par |
|------------------|--------|-----------------|
| `Liasses.tsx` | 515 | `LiasseFiscaleOfficial.tsx` |
| `LiasseViewer.tsx` | 625 | `LiasseFiscaleOfficial.tsx` |
| `LiasseComplete.tsx` | 481 | `LiasseFiscaleOfficial.tsx` |
| `LiasseCompleteV2.tsx` | 560 | `LiasseFiscaleOfficial.tsx` |
| `LiasseCompleteFinal.tsx` | 343 | `LiasseFiscaleOfficial.tsx` |
| `DirectLiasseAccess.tsx` | 302 | `LiasseFiscaleOfficial.tsx` |
| `ModernLiasseProduction.tsx` | 1317 | `LiasseFiscaleOfficial.tsx` |

---

## 🚀 Plan de migration

### Phase 1 : Préparation (Jour 1)

#### 1.1 Backup du code actuel

```bash
# Créer une branche de backup
git checkout -b backup/liasse-old-versions
git add .
git commit -m "Backup: anciennes versions liasse avant consolidation"
git push origin backup/liasse-old-versions

# Retour sur develop/main
git checkout develop
```

#### 1.2 Créer dossier deprecated

```bash
mkdir -p frontend/src/pages/liasse/deprecated
```

#### 1.3 Vérifier les dépendances

```bash
# Rechercher toutes les importations
grep -r "import.*Liasses\|import.*LiasseViewer\|import.*LiasseComplete" frontend/src/
```

### Phase 2 : Déploiement version consolidée (Jour 1)

#### 2.1 Copier les nouveaux fichiers

```bash
# Déjà fait via les recommandations
✅ frontend/src/pages/liasse/LiasseFiscaleOfficial.tsx
✅ frontend/src/services/liasseService.ts
✅ frontend/src/services/__tests__/liasseDataService.test.ts
```

#### 2.2 Mettre à jour App.tsx

```typescript
// frontend/src/App.tsx

// ❌ AVANT
const ModernLiasseComplete = React.lazy(() => import('@/pages/liasse/ModernLiasseComplete'))
const ModernLiasseProduction = React.lazy(() => import('@/pages/liasse/ModernLiasseProduction'))
const LiasseCompleteFinal = React.lazy(() => import('@/pages/LiasseCompleteFinal'))
const DirectLiasseAccess = React.lazy(() => import('@/pages/DirectLiasseAccess'))

// Routes
<Route path="/liasse" element={<LiasseDataProvider><ModernLiasseComplete /></LiasseDataProvider>} />
<Route path="/production-liasse" element={<LiasseDataProvider><ModernLiasseProduction /></LiasseDataProvider>} />
<Route path="/liasse-complete-final" element={<LiasseDataProvider><LiasseCompleteFinal /></LiasseDataProvider>} />
<Route path="/direct-liasse" element={<DirectLiasseAccess />} />

// ✅ APRÈS
const LiasseFiscaleOfficial = React.lazy(() => import('@/pages/liasse/LiasseFiscaleOfficial'))

// Routes (toutes pointent vers la version consolidée)
<Route path="/liasse" element={<LiasseDataProvider><LiasseFiscaleOfficial /></LiasseDataProvider>} />
<Route path="/production-liasse" element={<LiasseDataProvider><LiasseFiscaleOfficial /></LiasseDataProvider>} />
<Route path="/liasse-complete-final" element={<LiasseDataProvider><LiasseFiscaleOfficial /></LiasseDataProvider>} />
<Route path="/direct-liasse" element={<LiasseDataProvider><LiasseFiscaleOfficial /></LiasseDataProvider>} />
```

#### 2.3 Mettre à jour Sidebar/Navigation

```typescript
// frontend/src/components/shared/Sidebar.tsx

// ❌ AVANT
{ path: '/liasse', label: 'Liasse Complète' },
{ path: '/production-liasse', label: 'Production Liasse' },
{ path: '/direct-liasse', label: 'Accès Direct' },

// ✅ APRÈS (simplifier)
{ path: '/liasse', label: 'Liasse Fiscale', icon: <Description /> },
```

#### 2.4 Tester la nouvelle version

```bash
# Lancer les tests
npm test liasseDataService

# Lancer l'app en mode dev
npm run dev

# Tester les routes
http://localhost:5173/liasse
http://localhost:5173/production-liasse
http://localhost:5173/direct-liasse
```

### Phase 3 : Migration données utilisateurs (Jour 2-3)

#### 3.1 Vérifier la compatibilité backend

```bash
# Tester les endpoints API
curl http://localhost:8000/api/generation/liasses/
curl http://localhost:8000/api/generation/etats/
```

#### 3.2 Migration progressive

**Option A : Big Bang (recommandé pour petite base)**
```bash
# Déployer directement la nouvelle version
git checkout develop
git merge feature/consolidation-liasse
git push origin develop
```

**Option B : Canary Deployment (recommandé pour grande base)**
```typescript
// frontend/src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  USE_CONSOLIDATED_LIASSE: false, // Mettre à true progressivement
}

// frontend/src/App.tsx
const LiasseComponent = FEATURE_FLAGS.USE_CONSOLIDATED_LIASSE
  ? LiasseFiscaleOfficial
  : ModernLiasseComplete // Fallback

<Route path="/liasse" element={<LiasseComponent />} />
```

### Phase 4 : Dépréciation anciennes versions (Jour 3-5)

#### 4.1 Marquer comme deprecated

```typescript
// frontend/src/pages/liasse/deprecated/ModernLiasseComplete.tsx

/**
 * @deprecated Utiliser LiasseFiscaleOfficial à la place
 * @see frontend/src/pages/liasse/LiasseFiscaleOfficial.tsx
 */
const ModernLiasseComplete: React.FC = () => {
  console.warn('⚠️ ModernLiasseComplete est déprécié. Utilisez LiasseFiscaleOfficial')
  // ... code existant
}
```

#### 4.2 Déplacer vers deprecated/

```bash
# Déplacer les anciennes versions
mv frontend/src/pages/Liasses.tsx frontend/src/pages/liasse/deprecated/
mv frontend/src/pages/LiasseViewer.tsx frontend/src/pages/liasse/deprecated/
mv frontend/src/pages/LiasseComplete.tsx frontend/src/pages/liasse/deprecated/
mv frontend/src/pages/LiasseCompleteV2.tsx frontend/src/pages/liasse/deprecated/
mv frontend/src/pages/LiasseCompleteFinal.tsx frontend/src/pages/liasse/deprecated/
mv frontend/src/pages/DirectLiasseAccess.tsx frontend/src/pages/liasse/deprecated/
mv frontend/src/pages/liasse/ModernLiasseProduction.tsx frontend/src/pages/liasse/deprecated/

# Commit
git add .
git commit -m "refactor: déprécier anciennes versions liasse"
```

#### 4.3 Créer README dans deprecated/

```markdown
# ⚠️ Fichiers dépréciés

Ces fichiers sont **obsolètes** et seront **supprimés** dans la version 2.0.0.

**Utilisez à la place** : `LiasseFiscaleOfficial.tsx`

## Raisons de dépréciation

- Duplication de code
- Maintenance difficile
- Incohérences fonctionnelles

## Migration

Voir : `MIGRATION_GUIDE.md`

## Suppression prévue

**Date** : 1er avril 2025 (v2.0.0)
```

### Phase 5 : Suppression définitive (Jour 30+)

#### 5.1 Vérifier l'utilisation

```bash
# Après 30 jours, vérifier qu'aucune référence n'existe
grep -r "ModernLiasseComplete\|ModernLiasseProduction\|DirectLiasseAccess" frontend/src/ --exclude-dir=deprecated
```

#### 5.2 Supprimer les fichiers

```bash
# Si aucune référence trouvée
rm -rf frontend/src/pages/liasse/deprecated/

# Commit final
git add .
git commit -m "chore: suppression définitive anciennes versions liasse"
git tag v2.0.0
git push origin develop --tags
```

---

## 🧪 Tests de non-régression

### Checklist de validation

Avant de déployer en production, valider :

#### Fonctionnalités de base
- [ ] Créer une nouvelle liasse
- [ ] Importer une balance
- [ ] Générer automatiquement le bilan actif
- [ ] Générer automatiquement le bilan passif
- [ ] Générer le compte de résultat
- [ ] Valider la cohérence (score /100)
- [ ] Exporter en PDF
- [ ] Exporter en Excel
- [ ] Télédéclarer (mode test)

#### Navigation
- [ ] Route `/liasse` fonctionne
- [ ] Route `/production-liasse` fonctionne
- [ ] Route `/direct-liasse` fonctionne
- [ ] Drawer latéral (73 onglets) s'affiche
- [ ] Navigation entre onglets fluide

#### Performance
- [ ] Production < 30 min
- [ ] Génération Bilan Actif < 100ms
- [ ] Génération Bilan Passif < 100ms
- [ ] Validation cohérence < 200ms

#### Backend
- [ ] API `/api/generation/liasses/` répond
- [ ] Création liasse fonctionne
- [ ] Mise à jour liasse fonctionne
- [ ] Export fonctionne
- [ ] Télédéclaration (test) fonctionne

---

## 📊 Mapping fonctionnalités

### Correspondance features

| Feature | Ancienne(s) version(s) | Nouvelle version | Statut |
|---------|----------------------|------------------|--------|
| **Liste liasses** | `Liasses.tsx` | `LiasseFiscaleOfficial` (Dashboard tab) | ✅ |
| **Visualisation** | `LiasseViewer.tsx` | `LiasseFiscaleOfficial` (Drawer + Content) | ✅ |
| **Édition complète** | `LiasseComplete.tsx` | `LiasseFiscaleOfficial` (73 onglets) | ✅ |
| **Édition V2** | `LiasseCompleteV2.tsx` | `LiasseFiscaleOfficial` | ✅ |
| **Finalisation** | `LiasseCompleteFinal.tsx` | `LiasseFiscaleOfficial` (Validation tab) | ✅ |
| **Accès direct** | `DirectLiasseAccess.tsx` | `LiasseFiscaleOfficial` | ✅ |
| **Production auto** | `ModernLiasseProduction.tsx` | `LiasseFiscaleOfficial` (Production tab) | ✅ |
| **Templates sectoriels** | `ModernLiasseProduction.tsx` | `LiasseFiscaleOfficial` (Templates tab) | ✅ |
| **Validation** | `LiasseCompleteFinal.tsx` | `LiasseFiscaleOfficial` (Validations tab) | ✅ |
| **Export PDF** | Toutes | `liasseService.exporterLiasse()` | ✅ |
| **Télédéclaration** | Aucune | `liasseService.teledeclarerLiasse()` | ✅ Nouveau |

---

## 🐛 Problèmes connus et solutions

### Problème 1 : Imports cassés après migration

**Symptôme** :
```bash
Module not found: Error: Can't resolve '@/pages/liasse/ModernLiasseComplete'
```

**Solution** :
```bash
# Rechercher toutes les occurrences
grep -r "ModernLiasseComplete" frontend/src/

# Remplacer par
sed -i 's/ModernLiasseComplete/LiasseFiscaleOfficial/g' frontend/src/**/*.tsx
```

### Problème 2 : Données utilisateur non migrées

**Symptôme** :
```bash
Liasses créées avant migration ne s'affichent pas
```

**Solution** :
```sql
-- Vérifier les données en base
SELECT id, type_liasse, statut, progression FROM generation_liassefiscale;

-- Si nécessaire, migrer les données
UPDATE generation_liassefiscale
SET donnees_json = jsonb_set(donnees_json, '{version}', '"1.0.0"')
WHERE donnees_json->>'version' IS NULL;
```

### Problème 3 : Performance dégradée

**Symptôme** :
```bash
Production > 30 min (alors qu'avant < 30 min)
```

**Solution** :
```typescript
// Vérifier le cache
liasseDataService.loadBalance(balanceData) // Force rebuild cache

// Vérifier la taille de la balance
console.log(`Balance: ${balanceData.length} lignes`)
// Si > 10000 lignes, optimiser la balance
```

---

## 📞 Support migration

### Contacts

**Questions techniques** :
- 📧 Email : dev@liasspilot.com
- 💬 Slack : #migration-liasse
- 📚 Wiki : https://wiki.liasspilot.com/migration

**Bugs/Incidents** :
- 🐛 GitHub Issues : https://github.com/liasspilot/issues
- 🔴 Urgent : support@liasspilot.com

### Office Hours

**Sessions de support** :
- 🗓️ Lundi 14h-16h (GMT+1)
- 🗓️ Mercredi 10h-12h (GMT+1)
- 🗓️ Vendredi 16h-18h (GMT+1)

---

## ✅ Checklist finale

Avant de considérer la migration terminée :

- [ ] Nouvelle version déployée en production
- [ ] Toutes les routes redirigent vers `LiasseFiscaleOfficial`
- [ ] Tests de non-régression passés (100%)
- [ ] Aucune référence aux anciennes versions (hors deprecated/)
- [ ] Documentation mise à jour
- [ ] Équipe formée sur nouvelle version
- [ ] Monitoring actif (logs, métriques)
- [ ] Backup réalisé avant migration
- [ ] Plan de rollback prêt (si besoin)
- [ ] Communication utilisateurs envoyée

---

**🎉 Migration réussie !**

*Version : 1.0.0*
*Date : 19 janvier 2025*
