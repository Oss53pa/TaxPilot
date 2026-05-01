/**
 * Knowledge — Audit Remediation
 *
 * Convertit les anomalies détectées par les contrôles d'audit en **actions
 * concrètes** que l'utilisateur peut appliquer (au lieu du vague "Vérifier xxx").
 *
 * Approche : pattern-matching sur le préfixe de la référence du contrôle (S-, F-,
 * C-, SS-, IC-, EF-, FI-, AR-) + extraction des détails structurés (montants,
 * écarts, comptes) pour formuler une action exécutable.
 *
 * Phase 7 du plan d'audit Proph3t : passer de "détection" à "remédiation".
 */

import type { ResultatControle } from '@/types/audit.types'

export type RemediationType =
  | 'modify_account'    // Modifier un solde de compte
  | 'add_entry'         // Ajouter une écriture comptable
  | 'reclassify'        // Reclasser un montant entre 2 comptes
  | 'verify_doc'        // Vérifier un justificatif (mission, facture)
  | 'reimport'          // Réimporter le fichier balance
  | 'configure'         // Activer / configurer une option
  | 'recompute'         // Relancer un calcul

export type RemediationConfidence = 'high' | 'medium' | 'low'

export interface RemediationAction {
  /** Référence du contrôle d'audit qui a déclenché cette remédiation */
  refControle: string
  /** Type d'action attendue */
  type: RemediationType
  /** Description user-facing actionnable */
  description: string
  /** Compte impacté (si pertinent) */
  compte?: string
  /** Valeur observée actuelle (si pertinent) */
  montantActuel?: number
  /** Valeur cible suggérée (si calculable) */
  montantSuggere?: number
  /** Écart à corriger (montantSuggere - montantActuel) */
  ecartFCFA?: number
  /** Référence légale CGI/OHADA si applicable */
  baseLegale?: string
  /** Confiance dans la suggestion (high = chiffré exact, low = orientation) */
  confidence: RemediationConfidence
  /** Sévérité initiale du contrôle */
  severite: ResultatControle['severite']
}

// ─── Helpers ──────────────────────────────────────────────────────────

function fmt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR')
}

/** Extrait le préfixe de catégorie de la ref (ex: 'FI-003' → 'FI') */
function getPrefix(ref: string): string {
  const m = ref.match(/^([A-Z]+)-/)
  return m ? m[1] : ''
}

// ─── Inférence par catégorie ──────────────────────────────────────────

function remediationForStructurel(r: ResultatControle): RemediationAction {
  // S-001 à S-010 : problèmes d'import (encodage, colonnes, totaux, doublons)
  let description = r.suggestion ?? ''
  let type: RemediationType = 'reimport'

  if (r.ref === 'S-006') {
    // Doublons
    type = 'modify_account'
    description = `Supprimer les comptes en doublon dans le fichier source. ${r.details?.comptes?.length ? 'Comptes concernés : ' + r.details.comptes.slice(0, 3).join(', ') : ''}`
  } else if (r.ref === 'S-007') {
    // Encodage
    description = "Réenregistrer le fichier en UTF-8 (Excel : Enregistrer sous > CSV UTF-8) puis réimporter."
  } else if (r.ref === 'S-008') {
    // Lignes de totaux
    description = "Exclure les lignes 'TOTAL', 'SOUS-TOTAL' et 'CLASSE' du fichier source avant import. Dans la plupart des logiciels comptables : décocher 'Inclure les totaux' à l'export."
  } else if (r.ref === 'S-009' || r.ref === 'S-010') {
    type = 'configure'
    description = "Importer la balance N-1 dans la même session pour activer les contrôles comparatifs (8 contrôles supplémentaires de niveau 5)."
  }

  return {
    refControle: r.ref,
    type,
    description: description || `Réimporter le fichier balance en respectant le format attendu.`,
    baseLegale: r.referenceReglementaire,
    confidence: 'medium',
    severite: r.severite,
  }
}

function remediationForFundamental(r: ResultatControle): RemediationAction {
  // F-XXX : équilibre comptable, classes obligatoires
  const ecart = r.details?.ecart
  if (ecart !== undefined && ecart !== 0) {
    return {
      refControle: r.ref,
      type: 'modify_account',
      description: `Identifier la ligne créant l'écart de ${fmt(Math.abs(ecart))} FCFA et corriger le solde. Comptes suspects : ${r.details?.comptes?.slice(0, 3).join(', ') ?? 'à analyser'}.`,
      ecartFCFA: ecart,
      confidence: 'medium',
      severite: r.severite,
      baseLegale: r.referenceReglementaire,
    }
  }

  return {
    refControle: r.ref,
    type: 'verify_doc',
    description: r.suggestion ?? `Vérifier l'équilibre comptable Total Débit = Total Crédit. ${r.details?.constate ?? ''}`,
    confidence: 'medium',
    severite: r.severite,
    baseLegale: r.referenceReglementaire,
  }
}

function remediationForSensSoldes(r: ResultatControle): RemediationAction {
  // SS-XXX : compte avec solde inversé
  const compte = r.details?.comptes?.[0]
  const montants = r.details?.montants
  const soldeActuel = montants?.solde ?? montants?.soldeActuel
  const soldeAttendu = montants?.soldeAttendu

  if (compte && soldeActuel !== undefined) {
    const ecart = soldeAttendu !== undefined ? soldeAttendu - soldeActuel : -soldeActuel
    return {
      refControle: r.ref,
      type: 'modify_account',
      description: `Le compte **${compte}** présente un solde anormal (${fmt(soldeActuel)} FCFA). ${soldeAttendu !== undefined ? `Solde cohérent attendu : ${fmt(soldeAttendu)} FCFA.` : 'Vérifier les écritures du compte — risque d\'inversion débit/crédit.'}`,
      compte,
      montantActuel: soldeActuel,
      montantSuggere: soldeAttendu,
      ecartFCFA: ecart,
      confidence: soldeAttendu !== undefined ? 'high' : 'medium',
      severite: r.severite,
      baseLegale: r.referenceReglementaire,
    }
  }

  return {
    refControle: r.ref,
    type: 'modify_account',
    description: `Comptes avec sens de solde anormal : ${r.details?.comptes?.slice(0, 3).join(', ') ?? 'voir détail'}. Vérifier les écritures et inverser le sens si nécessaire.`,
    confidence: 'medium',
    severite: r.severite,
    baseLegale: r.referenceReglementaire,
  }
}

function remediationForInterComptes(r: ResultatControle): RemediationAction {
  // IC-XXX : rapprochement entre comptes (TVA, clients, etc.)
  const ecart = r.details?.ecart ?? r.details?.montants?.ecart
  const comptes = r.details?.comptes ?? []

  if (ecart !== undefined) {
    return {
      refControle: r.ref,
      type: 'reclassify',
      description: `Écart de ${fmt(Math.abs(ecart))} FCFA détecté entre ${comptes.length >= 2 ? `les comptes ${comptes[0]} et ${comptes[1]}` : 'comptes liés'}. Identifier l'écriture manquante ou erronée et passer la régularisation.`,
      ecartFCFA: ecart,
      compte: comptes[0],
      confidence: 'high',
      severite: r.severite,
      baseLegale: r.referenceReglementaire,
    }
  }

  return {
    refControle: r.ref,
    type: 'verify_doc',
    description: r.suggestion ?? `Rapprochement inter-comptes : vérifier la cohérence entre ${comptes.slice(0, 2).join(' et ') || 'les comptes liés'}.`,
    confidence: 'medium',
    severite: r.severite,
    baseLegale: r.referenceReglementaire,
  }
}

function remediationForFiscal(r: ResultatControle): RemediationAction {
  // FI-XXX : retraitements fiscaux (cadeaux excédentaires, amendes, etc.)
  const compte = r.details?.comptes?.[0]
  const ecart = r.details?.ecart
  const montants = r.details?.montants

  if (ecart !== undefined && compte) {
    return {
      refControle: r.ref,
      type: 'reclassify',
      description: `Réintégrer ${fmt(Math.abs(ecart))} FCFA du compte ${compte} dans le passage fiscal (charge non déductible). Voir CGI Art. 18 pour le détail.`,
      compte,
      ecartFCFA: ecart,
      montantActuel: montants?.total ?? montants?.charge,
      confidence: 'high',
      severite: r.severite,
      baseLegale: r.referenceReglementaire ?? 'CGI Art. 18',
    }
  }

  return {
    refControle: r.ref,
    type: 'reclassify',
    description: r.suggestion ?? `Retraitement fiscal recommandé : examiner les charges non-déductibles et les réintégrer dans le tableau de passage fiscal.`,
    confidence: 'medium',
    severite: r.severite,
    baseLegale: r.referenceReglementaire,
  }
}

function remediationForEtatsFinanciers(r: ResultatControle): RemediationAction {
  // EF-XXX : équilibre bilan, cohérence inter-feuillets
  const ecart = r.details?.ecart
  if (ecart !== undefined) {
    return {
      refControle: r.ref,
      type: 'recompute',
      description: `États financiers incohérents : écart de ${fmt(Math.abs(ecart))} FCFA. Régénérer le bilan/CdR après correction des comptes ${r.details?.comptes?.slice(0, 2).join(', ') ?? 'concernés'}.`,
      ecartFCFA: ecart,
      confidence: 'medium',
      severite: r.severite,
      baseLegale: r.referenceReglementaire,
    }
  }

  return {
    refControle: r.ref,
    type: 'recompute',
    description: r.suggestion ?? `Régénérer les états financiers après vérification des comptes en anomalie.`,
    confidence: 'low',
    severite: r.severite,
    baseLegale: r.referenceReglementaire,
  }
}

function remediationForArchive(r: ResultatControle): RemediationAction {
  // AR-XXX : archivage, intégrité SHA-256
  return {
    refControle: r.ref,
    type: 'configure',
    description: r.suggestion ?? "Activer l'archivage SHA-256 dans Paramètres > Sécurité avant le dépôt de la liasse.",
    confidence: 'medium',
    severite: r.severite,
    baseLegale: r.referenceReglementaire,
  }
}

function remediationForOhadaConformity(r: ResultatControle): RemediationAction {
  // C-XXX : conformité plan SYSCOHADA
  const compte = r.details?.comptes?.[0]
  return {
    refControle: r.ref,
    type: 'modify_account',
    description: compte
      ? `Le compte ${compte} n'est pas conforme au plan SYSCOHADA Révisé. Le reclasser sur un compte standard ou justifier son usage en annexe.`
      : (r.suggestion ?? `Vérifier la conformité des comptes au plan SYSCOHADA Révisé.`),
    compte,
    confidence: 'medium',
    severite: r.severite,
    baseLegale: r.referenceReglementaire ?? "Acte Uniforme OHADA Comptable Art. 1",
  }
}

function remediationForVariation(r: ResultatControle): RemediationAction {
  // YO-XXX (year-over-year) : variations N/N-1 anormales
  const ecart = r.details?.ecart ?? r.details?.montants?.variation
  const compte = r.details?.comptes?.[0]
  return {
    refControle: r.ref,
    type: 'verify_doc',
    description: ecart !== undefined && compte
      ? `Variation anormale sur le compte ${compte} : ${fmt(ecart)} FCFA entre N et N-1. Documenter la cause (acquisition, cession, changement de méthode) dans l'annexe.`
      : (r.suggestion ?? `Variation N/N-1 anormale détectée. Documenter dans l'annexe (Note 1 — Permanence des méthodes).`),
    compte,
    ecartFCFA: ecart,
    confidence: 'medium',
    severite: r.severite,
    baseLegale: r.referenceReglementaire ?? 'Art. 40 Acte Uniforme OHADA',
  }
}

// ─── Public API ───────────────────────────────────────────────────────

/**
 * Génère des actions de remédiation concrètes à partir d'une liste d'anomalies
 * d'audit. Pattern-match sur le préfixe de la ref du contrôle pour produire
 * une action structurée et exécutable.
 *
 * Tri : par sévérité décroissante (BLOQUANT → MAJEUR → MINEUR → INFO).
 */
export function inferRemediations(anomalies: ResultatControle[]): RemediationAction[] {
  const actions: RemediationAction[] = []

  for (const a of anomalies) {
    if (a.statut !== 'ANOMALIE' && a.statut !== 'ERREUR_EXEC') continue

    const prefix = getPrefix(a.ref)
    let action: RemediationAction

    switch (prefix) {
      case 'S':   action = remediationForStructurel(a); break
      case 'F':   action = remediationForFundamental(a); break
      case 'C':   action = remediationForOhadaConformity(a); break
      case 'SS':  action = remediationForSensSoldes(a); break
      case 'IC':  action = remediationForInterComptes(a); break
      case 'YO':  action = remediationForVariation(a); break
      case 'EF':  action = remediationForEtatsFinanciers(a); break
      case 'FI':  action = remediationForFiscal(a); break
      case 'AR':  action = remediationForArchive(a); break
      default:
        action = {
          refControle: a.ref,
          type: 'verify_doc',
          description: a.suggestion ?? a.message,
          confidence: 'low',
          severite: a.severite,
          baseLegale: a.referenceReglementaire,
        }
    }

    actions.push(action)
  }

  // Tri par sévérité (BLOQUANT > MAJEUR > MINEUR > INFO > OK)
  const order: Record<string, number> = { BLOQUANT: 0, MAJEUR: 1, MINEUR: 2, INFO: 3, OK: 4 }
  actions.sort((x, y) => (order[x.severite] ?? 4) - (order[y.severite] ?? 4))

  return actions
}

/**
 * Groupe les actions par compte impacté pour faciliter l'exécution
 * (l'utilisateur voit toutes les corrections à faire sur un même compte).
 */
export function groupRemediationsByAccount(
  actions: RemediationAction[],
): Map<string, RemediationAction[]> {
  const map = new Map<string, RemediationAction[]>()
  for (const a of actions) {
    const key = a.compte ?? '__sans_compte__'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(a)
  }
  return map
}

/**
 * Synthèse texte des remédiations pour affichage Markdown.
 * Limite à `maxLines` actions pour ne pas saturer l'UI.
 */
export function formatRemediationsAsMarkdown(
  actions: RemediationAction[],
  maxLines = 10,
): string {
  if (actions.length === 0) return ''

  const lines: string[] = []
  lines.push(`### Actions de remédiation (${actions.length})\n`)

  for (const a of actions.slice(0, maxLines)) {
    const sevIcon = a.severite === 'BLOQUANT' ? '🔴' : a.severite === 'MAJEUR' ? '🟠' : a.severite === 'MINEUR' ? '🟡' : 'ℹ️'
    const confIcon = a.confidence === 'high' ? '🎯' : a.confidence === 'medium' ? '📌' : '💭'
    const ecartStr = a.ecartFCFA !== undefined ? ` (écart ${fmt(Math.abs(a.ecartFCFA))} FCFA)` : ''
    lines.push(`- ${sevIcon} ${confIcon} **${a.refControle}** — ${a.description}${ecartStr}`)
    if (a.baseLegale) {
      lines.push(`  - _${a.baseLegale}_`)
    }
  }

  if (actions.length > maxLines) {
    lines.push(`\n_+ ${actions.length - maxLines} autres actions._`)
  }

  return lines.join('\n')
}
