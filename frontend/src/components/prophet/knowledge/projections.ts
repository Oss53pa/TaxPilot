/**
 * Knowledge — Projections multi-exercice (N+1, N+2)
 *
 * Projection forward des agrégats financiers à partir de l'historique N-1 et N.
 *
 * Méthodologie (volontairement explicite et conservatrice) :
 *   - Avec 2 points de données (N-1, N), on calcule un taux de croissance YoY et
 *     on l'extrapole linéairement. La confiance est marquée "low" (1 seul écart).
 *   - On ne peut pas estimer une vraie variance avec 2 points → on utilise une
 *     marge heuristique (±VOLATILITY_HEURISTIC) pour générer scénarios best/worst.
 *   - Si l'historique est plus riche dans le futur (3+ points), basculer vers
 *     régression linéaire + std-dev des résidus → confidence "medium" / "high".
 *
 * Ces projections sont des EXTRAPOLATIONS, pas des prévisions garanties.
 * Le footer narratif l'indique explicitement à l'utilisateur.
 */

import type { Agregats } from './predictiveAnalysis'

/** Marge heuristique appliquée au taux de croissance pour calculer les scénarios. */
const VOLATILITY_HEURISTIC = 0.10 // ±10 points autour du taux observé

/** Plafond de croissance positive (anti-extrapolation absurde). */
const GROWTH_CAP_POS = 1.0   // +100% / an maximum
/** Plancher de croissance négative. */
const GROWTH_CAP_NEG = -0.5  // -50% / an maximum

export type ProjectionConfidence = 'low' | 'medium' | 'high'

export interface ProjectionScenario {
  /** Identifiant lisible du scénario */
  label: 'pessimiste' | 'probable' | 'optimiste'
  /** Taux de croissance annuel appliqué dans ce scénario */
  growthRate: number
  /** Valeurs projetées pour N+1, N+2, ... (autant d'entrées que `periods`) */
  values: number[]
}

export interface AggregateProjection {
  /** Libellé court de l'agrégat (ex: 'CA', 'Résultat', 'Trésorerie') */
  label: string
  /** Valeur N-1 (peut être undefined si non disponible) */
  valueN1: number | undefined
  /** Valeur N (référence) */
  valueN: number
  /** Taux de croissance YoY observé (N / N-1 - 1). undefined si N-1 absent ou nul. */
  growthYoY: number | undefined
  /** 3 scénarios projetés (pessimiste, probable, optimiste) */
  scenarios: ProjectionScenario[]
}

export interface ProjectionResult {
  /** Nombre de périodes projetées (par défaut 2 : N+1, N+2) */
  periods: number
  /** Confiance globale dans la projection */
  confidence: ProjectionConfidence
  /** Méthodologie utilisée */
  methodology: string
  /** Avertissements (ex: pas de N-1, croissance plafonnée, valeurs négatives) */
  warnings: string[]
  /** Projections par agrégat */
  aggregates: AggregateProjection[]
}

// ─── Helpers ──────────────────────────────────────────────────────────

function clampGrowth(g: number): number {
  if (g > GROWTH_CAP_POS) return GROWTH_CAP_POS
  if (g < GROWTH_CAP_NEG) return GROWTH_CAP_NEG
  return g
}

/**
 * Calcule la série projetée d'une valeur de base à un taux de croissance donné.
 * Retourne `[N+1, N+2, ...]` (taille = periods).
 */
function projectSeries(base: number, growth: number, periods: number): number[] {
  const out: number[] = []
  let cur = base
  for (let i = 0; i < periods; i++) {
    cur = cur * (1 + growth)
    out.push(Math.round(cur))
  }
  return out
}

/**
 * Calcule le taux de croissance YoY entre N-1 et N.
 * Retourne undefined si N-1 absent ou nul (pas de croissance calculable).
 */
function computeGrowth(valueN: number, valueN1: number | undefined): number | undefined {
  if (valueN1 === undefined || valueN1 === 0) return undefined
  // Pour les valeurs négatives (ex: résultat déficitaire), on utilise abs en base
  // pour que l'amélioration de -100 → -50 soit reconnue comme +50% (réduction de
  // déficit) plutôt qu'un -50% trompeur.
  const growth = (valueN - valueN1) / Math.abs(valueN1)
  return clampGrowth(growth)
}

/**
 * Projette un seul agrégat sur `periods` années avec 3 scénarios.
 */
function projectAggregate(
  label: string,
  valueN: number,
  valueN1: number | undefined,
  periods: number,
): AggregateProjection {
  const growthYoY = computeGrowth(valueN, valueN1)

  // Si pas de N-1 → projection plate (croissance 0)
  const baseGrowth = growthYoY ?? 0

  const scenarios: ProjectionScenario[] = [
    {
      label: 'pessimiste',
      growthRate: clampGrowth(baseGrowth - VOLATILITY_HEURISTIC),
      values: projectSeries(valueN, clampGrowth(baseGrowth - VOLATILITY_HEURISTIC), periods),
    },
    {
      label: 'probable',
      growthRate: baseGrowth,
      values: projectSeries(valueN, baseGrowth, periods),
    },
    {
      label: 'optimiste',
      growthRate: clampGrowth(baseGrowth + VOLATILITY_HEURISTIC),
      values: projectSeries(valueN, clampGrowth(baseGrowth + VOLATILITY_HEURISTIC), periods),
    },
  ]

  return { label, valueN1, valueN, growthYoY, scenarios }
}

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Projette les agrégats financiers à `periods` années dans le futur (par défaut 2 = N+1, N+2).
 *
 * @param aggN  Agrégats de l'exercice courant (obligatoire)
 * @param aggN1 Agrégats de l'exercice précédent (optionnel — projection plate si absent)
 * @param periods Nombre de périodes à projeter (défaut: 2)
 */
export function projectAggregates(
  aggN: Agregats,
  aggN1?: Agregats,
  periods = 2,
): ProjectionResult {
  const warnings: string[] = []
  const aggregates: AggregateProjection[] = []

  // Sélection des agrégats clés à projeter
  const targets: Array<{ label: string; getN: (a: Agregats) => number }> = [
    { label: "Chiffre d'affaires", getN: (a) => a.ca },
    { label: 'Résultat net', getN: (a) => a.resultat },
    { label: 'Trésorerie', getN: (a) => a.tresorerie },
    { label: 'Charges de personnel', getN: (a) => a.chargesPersonnel },
    { label: 'Charges financières', getN: (a) => a.chargesFinancieres },
    { label: 'Capitaux propres', getN: (a) => a.capitauxPropres },
    { label: 'Dettes financières', getN: (a) => a.dettesTotal },
  ]

  for (const t of targets) {
    const valueN = t.getN(aggN)
    const valueN1 = aggN1 ? t.getN(aggN1) : undefined
    const proj = projectAggregate(t.label, valueN, valueN1, periods)
    aggregates.push(proj)

    // Warning si la croissance a été plafonnée
    if (proj.growthYoY !== undefined && (proj.growthYoY === GROWTH_CAP_POS || proj.growthYoY === GROWTH_CAP_NEG)) {
      warnings.push(`${t.label} : taux de croissance plafonné à ${(proj.growthYoY * 100).toFixed(0)}% (variation N/N-1 jugée extrême).`)
    }
  }

  // Confidence
  let confidence: ProjectionConfidence = 'low'
  let methodology: string

  if (!aggN1) {
    confidence = 'low'
    methodology = "Projection plate (aucune donnée historique N-1 disponible) : N+1 = N+2 = N. Importez la balance N-1 pour activer une projection avec taux de croissance."
    warnings.unshift('Balance N-1 absente — projection limitée à une extrapolation plate.')
  } else {
    confidence = 'low'
    methodology = `Extrapolation linéaire à taux de croissance constant calculé sur 1 période (N vs N-1). Scénarios pessimiste/optimiste = taux ±${(VOLATILITY_HEURISTIC * 100).toFixed(0)} points (heuristique de volatilité, faute de plus d'historique). Pour passer en confidence "medium", importez au moins la balance N-2.`
  }

  // Warning global : signe du résultat
  if (aggN.resultat < 0) {
    warnings.push("Le résultat de l'exercice N est négatif : la projection extrapole une perte croissante si la tendance se confirme. Évaluez l'impact des mesures correctives (réduction de charges, hausse de prix).")
  }

  return { periods, confidence, methodology, warnings, aggregates }
}

/**
 * Helper d'affichage : formate une projection en lignes lisibles
 * (utile pour les indicateurs de PredictionCard).
 */
export function formatProjectionForCard(
  proj: ProjectionResult,
  scenario: ProjectionScenario['label'] = 'probable',
): { label: string; value: string; status: 'excellent' | 'bon' | 'acceptable' | 'critique' }[] {
  const out: { label: string; value: string; status: 'excellent' | 'bon' | 'acceptable' | 'critique' }[] = []

  for (const agg of proj.aggregates) {
    const sc = agg.scenarios.find((s) => s.label === scenario)
    if (!sc) continue
    for (let i = 0; i < sc.values.length; i++) {
      const yearLabel = `N+${i + 1}`
      const v = sc.values[i]
      const growthPct = sc.growthRate * 100
      const trend = growthPct > 1 ? '↑' : growthPct < -1 ? '↓' : '→'
      const status: 'excellent' | 'bon' | 'acceptable' | 'critique' =
        agg.label === 'Résultat net'
          ? v > 0 ? (growthPct > 5 ? 'excellent' : 'bon') : 'critique'
          : agg.label === "Chiffre d'affaires"
            ? growthPct > 5 ? 'bon' : growthPct > 0 ? 'acceptable' : 'critique'
            : agg.label === 'Trésorerie'
              ? v > 0 ? (growthPct > 0 ? 'bon' : 'acceptable') : 'critique'
              : 'acceptable'
      out.push({
        label: `${agg.label} ${yearLabel}`,
        value: `${v.toLocaleString('fr-FR')} ${trend} (${growthPct >= 0 ? '+' : ''}${growthPct.toFixed(1)}%)`,
        status,
      })
    }
  }

  return out
}
