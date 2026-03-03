/**
 * ML Auto-Categorization Service
 * Learns from validated user corrections to suggest account mappings.
 *
 * Algorithm: TF-IDF-like similarity on normalized labels.
 * Training data is stored per-tenant in Supabase for privacy isolation.
 * Falls back to a local dictionary for common French accounting terms.
 */

import { supabase } from '@/config/supabase'
import { isSupabaseEnabled } from '@/types/cloud'

// ============================================================
// Types
// ============================================================

export interface AccountSuggestion {
  numero_compte: string
  libelle: string
  confidence: number     // 0-1
  source: 'ml' | 'dictionary' | 'history'
}

export interface TrainingEntry {
  libelle_original: string
  compte_suggere: string
  compte_valide: string
  source: 'manual' | 'ocr' | 'import'
}

// ============================================================
// Text normalization
// ============================================================

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, ' ')   // Keep only alphanum + spaces
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter(t => t.length > 2)
}

/**
 * Jaccard similarity between two token sets
 */
function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a)
  const setB = new Set(b)
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

// ============================================================
// Built-in dictionary (common French accounting terms → SYSCOHADA accounts)
// ============================================================

const DICTIONARY: Array<{ keywords: string[]; compte: string; libelle: string }> = [
  { keywords: ['achat', 'marchandise'], compte: '601', libelle: 'Achats de marchandises' },
  { keywords: ['achat', 'matiere', 'premiere'], compte: '602', libelle: "Achats de matieres premieres" },
  { keywords: ['variation', 'stock', 'marchandise'], compte: '6031', libelle: 'Variations de stocks de marchandises' },
  { keywords: ['transport', 'achat'], compte: '611', libelle: 'Transports sur achats' },
  { keywords: ['loyer', 'bail', 'location'], compte: '622', libelle: 'Locations et charges locatives' },
  { keywords: ['entretien', 'reparation', 'maintenance'], compte: '624', libelle: 'Entretien, reparations' },
  { keywords: ['assurance', 'prime'], compte: '625', libelle: 'Primes d\'assurance' },
  { keywords: ['telecommunication', 'telephone', 'internet'], compte: '628', libelle: 'Frais de telecommunication' },
  { keywords: ['honoraire', 'consultant', 'conseil'], compte: '632', libelle: 'Remunerations d\'intermediaires et honoraires' },
  { keywords: ['publicite', 'annonce', 'marketing'], compte: '627', libelle: 'Publicite, publications' },
  { keywords: ['impot', 'taxe', 'patente'], compte: '64', libelle: 'Impots et taxes' },
  { keywords: ['salaire', 'remuneration', 'personnel'], compte: '661', libelle: 'Remunerations du personnel' },
  { keywords: ['charge', 'sociale', 'cnps', 'cotisation'], compte: '664', libelle: 'Charges sociales' },
  { keywords: ['dotation', 'amortissement'], compte: '681', libelle: 'Dotations aux amortissements' },
  { keywords: ['dotation', 'provision'], compte: '691', libelle: 'Dotations aux provisions' },
  { keywords: ['interet', 'emprunt', 'financier'], compte: '671', libelle: 'Interets des emprunts' },
  { keywords: ['vente', 'marchandise'], compte: '701', libelle: 'Ventes de marchandises' },
  { keywords: ['vente', 'produit', 'fini'], compte: '702', libelle: 'Ventes de produits finis' },
  { keywords: ['prestation', 'service'], compte: '706', libelle: 'Services vendus' },
  { keywords: ['produit', 'accessoire'], compte: '707', libelle: 'Produits accessoires' },
  { keywords: ['subvention', 'exploitation'], compte: '71', libelle: "Subventions d'exploitation" },
  { keywords: ['produit', 'financier', 'interet', 'recu'], compte: '77', libelle: 'Revenus financiers' },
  { keywords: ['transfert', 'charge'], compte: '781', libelle: 'Transferts de charges' },
  { keywords: ['reprise', 'provision'], compte: '791', libelle: 'Reprises de provisions' },
  { keywords: ['fournisseur'], compte: '401', libelle: 'Fournisseurs' },
  { keywords: ['client'], compte: '411', libelle: 'Clients' },
  { keywords: ['banque', 'compte', 'bancaire'], compte: '521', libelle: 'Banques locales' },
  { keywords: ['caisse', 'espece'], compte: '571', libelle: 'Caisse' },
  { keywords: ['capital', 'social'], compte: '101', libelle: 'Capital social' },
  { keywords: ['reserve', 'legale'], compte: '111', libelle: 'Reserve legale' },
  { keywords: ['report', 'nouveau'], compte: '121', libelle: 'Report a nouveau' },
  { keywords: ['resultat', 'exercice'], compte: '131', libelle: "Resultat de l'exercice" },
  { keywords: ['emprunt', 'dette', 'financiere'], compte: '16', libelle: 'Emprunts et dettes financieres' },
  { keywords: ['immobilisation', 'corporelle', 'materiel'], compte: '24', libelle: 'Immobilisations corporelles' },
  { keywords: ['terrain'], compte: '22', libelle: 'Terrains' },
  { keywords: ['batiment', 'construction'], compte: '23', libelle: 'Batiments' },
  { keywords: ['materiel', 'transport', 'vehicule'], compte: '245', libelle: 'Materiel de transport' },
  { keywords: ['stock', 'marchandise'], compte: '31', libelle: 'Stocks de marchandises' },
  { keywords: ['tva', 'collectee', 'facturee'], compte: '4431', libelle: 'TVA facturee sur ventes' },
  { keywords: ['tva', 'deductible', 'recuperable'], compte: '4451', libelle: 'TVA recuperable sur achats' },
]

// ============================================================
// Core: suggest accounts
// ============================================================

/**
 * Get account suggestions for a given label
 */
export async function suggestAccounts(libelle: string, topK = 3): Promise<AccountSuggestion[]> {
  const tokens = tokenize(libelle)
  if (tokens.length === 0) return []

  const suggestions: AccountSuggestion[] = []

  // 1. Check ML training data (Supabase) if available
  if (isSupabaseEnabled()) {
    try {
      const { data: trainingData } = await supabase
        .from('ml_training_data')
        .select('compte_valide, libelle_valide, libelle_normalized')
        .order('created_at', { ascending: false })
        .limit(500)

      if (trainingData && trainingData.length > 0) {
        for (const td of trainingData) {
          const tdTokens = tokenize(td.libelle_normalized || '')
          const similarity = jaccardSimilarity(tokens, tdTokens)
          if (similarity > 0.3) {
            suggestions.push({
              numero_compte: td.compte_valide,
              libelle: td.libelle_valide || td.libelle_normalized,
              confidence: Math.min(similarity + 0.2, 0.95), // Boost for ML data
              source: 'ml',
            })
          }
        }
      }
    } catch {
      // Fall through to dictionary
    }
  }

  // 2. Check local dictionary
  for (const entry of DICTIONARY) {
    const dictTokens = entry.keywords
    const similarity = jaccardSimilarity(tokens, dictTokens)
    if (similarity > 0.25) {
      suggestions.push({
        numero_compte: entry.compte,
        libelle: entry.libelle,
        confidence: similarity * 0.8, // Slightly lower than ML
        source: 'dictionary',
      })
    }
  }

  // 3. Deduplicate by account, keep highest confidence
  const deduped = new Map<string, AccountSuggestion>()
  for (const s of suggestions) {
    const existing = deduped.get(s.numero_compte)
    if (!existing || s.confidence > existing.confidence) {
      deduped.set(s.numero_compte, s)
    }
  }

  // Sort by confidence descending, return topK
  return Array.from(deduped.values())
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, topK)
}

// ============================================================
// Training: record validated corrections
// ============================================================

/**
 * Record a validated account mapping for future learning
 */
export async function recordTraining(entry: TrainingEntry): Promise<void> {
  if (!isSupabaseEnabled()) {
    // Store locally as fallback
    const key = 'fiscasync_ml_local'
    const existing = JSON.parse(localStorage.getItem(key) || '[]')
    existing.push({ ...entry, created_at: new Date().toISOString() })
    localStorage.setItem(key, JSON.stringify(existing.slice(-1000))) // Keep last 1000
    return
  }

  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('ml_training_data').insert({
    libelle_original: entry.libelle_original,
    libelle_normalized: normalize(entry.libelle_original),
    compte_suggere: entry.compte_suggere,
    compte_valide: entry.compte_valide,
    source: entry.source,
    validated_by: user?.id || null,
  })
}

/**
 * Get training data stats
 */
export async function getTrainingStats(): Promise<{
  total_entries: number
  unique_accounts: number
  sources: Record<string, number>
}> {
  if (!isSupabaseEnabled()) {
    const local = JSON.parse(localStorage.getItem('fiscasync_ml_local') || '[]')
    return {
      total_entries: local.length,
      unique_accounts: new Set(local.map((e: TrainingEntry) => e.compte_valide)).size,
      sources: { local: local.length },
    }
  }

  const { data, error } = await supabase
    .from('ml_training_data')
    .select('source, compte_valide')

  if (error || !data) return { total_entries: 0, unique_accounts: 0, sources: {} }

  const sources: Record<string, number> = {}
  const accounts = new Set<string>()
  for (const d of data) {
    sources[d.source] = (sources[d.source] || 0) + 1
    accounts.add(d.compte_valide)
  }

  return { total_entries: data.length, unique_accounts: accounts.size, sources }
}
