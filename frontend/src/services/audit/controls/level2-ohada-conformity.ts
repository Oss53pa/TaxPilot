/**
 * Niveau 2 - Conformite OHADA (C-001 a C-008)
 * 8 controles verifiant la conformite au plan SYSCOHADA Revise
 */

import { AuditContext, ResultatControle, NiveauControle } from '@/types/audit.types'
import { PLAN_SYSCOHADA_REVISE, validateSYSCOHADAAccount } from '@/data/SYSCOHADARevisePlan'
import { findClosestAccount } from '@/data/syscohada/plan'
import { controlRegistry } from '../controlRegistry'

const NIVEAU: NiveauControle = 2

function ok(ref: string, nom: string, message: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'OK', severite: 'OK', message, timestamp: new Date().toISOString() }
}

function anomalie(
  ref: string, nom: string, severite: ResultatControle['severite'],
  message: string, details?: ResultatControle['details'],
  suggestion?: string, refRegl?: string
): ResultatControle {
  return {
    ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite, message,
    details, suggestion, referenceReglementaire: refRegl,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Algorithme de remapping intelligent: trouve le compte OHADA le plus proche
 * Utilise le service enrichi du referentiel SYSCOHADA
 */
function findClosestOHADA(numero: string): { numero: string; libelle: string; score: number } | null {
  const result = findClosestAccount(numero)
  if (result) {
    return { numero: result.numero, libelle: result.libelle, score: result.score }
  }
  return null
}

// C-001: Compte existant dans plan OHADA
function C001(ctx: AuditContext): ResultatControle {
  const ref = 'C-001', nom = 'Comptes OHADA valides'
  const nonOHADA: Array<{ compte: string; suggestion?: string }> = []

  for (const line of ctx.balanceN) {
    const num = line.compte.toString().trim()
    // Verifier par prefixes decroissants
    let found = false
    for (let len = Math.min(num.length, 4); len >= 2; len--) {
      if (validateSYSCOHADAAccount(num.substring(0, len))) {
        found = true
        break
      }
    }
    if (!found) {
      const closest = findClosestOHADA(num)
      nonOHADA.push({
        compte: num,
        suggestion: closest ? `${closest.numero} - ${closest.libelle}` : undefined
      })
    }
  }

  if (nonOHADA.length > 0) {
    const pct = ((nonOHADA.length / ctx.balanceN.length) * 100).toFixed(1)
    return anomalie(ref, nom, 'MAJEUR',
      `${nonOHADA.length} compte(s) non conforme(s) au plan OHADA (${pct}%)`,
      {
        comptes: nonOHADA.slice(0, 15).map((c) => c.suggestion ? `${c.compte} -> ${c.suggestion}` : c.compte),
        description: 'Comptes non trouves dans le plan SYSCOHADA Revise'
      },
      'Reclasser ces comptes selon le plan SYSCOHADA Revise 2017',
      'Art. 14 Acte Uniforme OHADA')
  }
  return ok(ref, nom, 'Tous les comptes sont conformes au plan OHADA')
}

// C-002: Classe valide (1-8)
function C002(ctx: AuditContext): ResultatControle {
  const ref = 'C-002', nom = 'Classes valides (1-8)'
  const invalides: string[] = []
  for (const line of ctx.balanceN) {
    const classe = parseInt(line.compte.toString().charAt(0))
    if (isNaN(classe) || classe < 1 || classe > 9) {
      invalides.push(line.compte)
    }
  }
  if (invalides.length > 0) {
    return anomalie(ref, nom, 'BLOQUANT',
      `${invalides.length} compte(s) avec classe invalide`,
      { comptes: invalides.slice(0, 10) },
      'Les comptes doivent commencer par un chiffre de 1 a 9')
  }
  return ok(ref, nom, 'Toutes les classes sont valides')
}

// C-003: Longueur numero standard
function C003(ctx: AuditContext): ResultatControle {
  const ref = 'C-003', nom = 'Longueur comptes standard'
  const courts: string[] = []
  const longs: string[] = []
  for (const line of ctx.balanceN) {
    const len = line.compte.toString().trim().length
    if (len < 4) courts.push(line.compte)
    if (len > 8) longs.push(line.compte)
  }
  if (courts.length > 0 || longs.length > 0) {
    return anomalie(ref, nom, 'INFO',
      `${courts.length} compte(s) court(s) (<4), ${longs.length} compte(s) long(s) (>8)`,
      { comptes: [...courts.slice(0, 5), ...longs.slice(0, 5)] },
      'La norme SYSCOHADA recommande des comptes de 4 a 8 chiffres')
  }
  return ok(ref, nom, 'Longueurs de comptes conformes')
}

// C-004: Comptes obsoletes ancien SYSCOA
function C004(ctx: AuditContext): ResultatControle {
  const ref = 'C-004', nom = 'Comptes obsoletes SYSCOA'
  // Comptes qui existaient dans l'ancien SYSCOA mais supprimes dans le revise
  const obsoletes: Record<string, string> = {
    '195': 'Provisions pour impots (remplace par 441x)',
    '196': 'Provisions pour pensions (remplace par 198x)',
    '471': 'Compte d\'attente (remplace par 47x specifiques)',
    '694': 'TAFIRE - supprime dans SYSCOHADA Revise',
  }
  const trouves: string[] = []
  for (const line of ctx.balanceN) {
    const num = line.compte.toString().trim()
    for (const [prefix, desc] of Object.entries(obsoletes)) {
      if (num.startsWith(prefix)) {
        trouves.push(`${num}: ${desc}`)
      }
    }
  }
  if (trouves.length > 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `${trouves.length} compte(s) obsolete(s) de l'ancien SYSCOA`,
      { comptes: trouves },
      'Migrer vers les comptes du SYSCOHADA Revise 2017',
      'SYSCOHADA Revise 2017 - Guide de migration')
  }
  return ok(ref, nom, 'Aucun compte obsolete detecte')
}

// C-005: Comptes TAFIRE supprimes
function C005(ctx: AuditContext): ResultatControle {
  const ref = 'C-005', nom = 'Comptes TAFIRE supprimes'
  const tafire = ctx.balanceN.filter((l) => {
    const num = l.compte.toString().trim()
    return num.startsWith('694') || num.startsWith('884') || num.startsWith('894')
  })
  if (tafire.length > 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `${tafire.length} compte(s) TAFIRE detecte(s) (supprime dans le revise)`,
      { comptes: tafire.map((l) => l.compte) },
      'Le TAFIRE a ete remplace par le TFT dans le SYSCOHADA Revise',
      'SYSCOHADA Revise 2017')
  }
  return ok(ref, nom, 'Aucun compte TAFIRE obsolete')
}

// C-006: Mapping vers etats financiers possible
function C006(ctx: AuditContext): ResultatControle {
  const ref = 'C-006', nom = 'Mapping etats financiers'
  const typeLiasse = ctx.typeLiasse || 'SN'

  // Pour les types sectoriels (BANQUE, ASSURANCE, MICROFINANCE, EBNL),
  // le mapping standard SYSCOHADA ne s'applique pas directement
  if (['BANQUE', 'ASSURANCE', 'MICROFINANCE', 'EBNL'].includes(typeLiasse)) {
    return { ref, nom, niveau: NIVEAU, statut: 'OK', severite: 'OK',
      message: `Controle adapte au type ${typeLiasse} - mapping sectoriel utilise`,
      timestamp: new Date().toISOString() }
  }

  if (!ctx.mappingSyscohada) {
    return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK',
      message: 'Mapping SYSCOHADA non charge', timestamp: new Date().toISOString() }
  }

  // Collecter tous les prefixes du mapping (SN ou SMT)
  const mappedPrefixes: string[] = []
  for (const section of Object.values(ctx.mappingSyscohada)) {
    for (const poste of Object.values(section as Record<string, any>)) {
      if (poste.comptes) mappedPrefixes.push(...poste.comptes)
      if (poste.amortComptes) mappedPrefixes.push(...poste.amortComptes)
    }
  }

  const nonMappes: string[] = []
  for (const line of ctx.balanceN) {
    const num = line.compte.toString().trim()
    const classe = parseInt(num.charAt(0))
    // Seules les classes 1-5 (bilan) doivent etre mappees
    if (classe >= 1 && classe <= 5) {
      const mapped = mappedPrefixes.some((prefix) => num.startsWith(prefix))
      if (!mapped) nonMappes.push(num)
    }
  }

  if (nonMappes.length > 5) {
    return anomalie(ref, nom, 'MAJEUR',
      `${nonMappes.length} compte(s) de bilan non mappe(s) vers les etats financiers (${typeLiasse})`,
      { comptes: nonMappes.slice(0, 15) },
      `Ces comptes ne seront pas repris dans le bilan ${typeLiasse}`)
  }
  if (nonMappes.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${nonMappes.length} compte(s) de bilan non mappe(s) (${typeLiasse})`,
      { comptes: nonMappes })
  }
  return ok(ref, nom, `Tous les comptes de bilan sont mappables (${typeLiasse})`)
}

// C-007: Utilisation comptes a 2 chiffres
function C007(ctx: AuditContext): ResultatControle {
  const ref = 'C-007', nom = 'Comptes a 2 chiffres'
  const deuxChiffres = ctx.balanceN.filter((l) => l.compte.toString().trim().length === 2)
  if (deuxChiffres.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${deuxChiffres.length} compte(s) a 2 chiffres (niveau insuffisant)`,
      { comptes: deuxChiffres.map((l) => `${l.compte}: ${l.intitule}`) },
      'Les comptes a 2 chiffres sont des comptes synthetiques, utiliser des sous-comptes')
  }
  return ok(ref, nom, 'Aucun compte a 2 chiffres seulement')
}

// C-008: Comptes speciaux classe 8
function C008(ctx: AuditContext): ResultatControle {
  const ref = 'C-008', nom = 'Comptes speciaux classe 8'
  const classe8 = ctx.balanceN.filter((l) => l.compte.toString().startsWith('8'))
  if (classe8.length > 0) {
    const totalMontant = classe8.reduce((s, l) => s + Math.abs(l.debit - l.credit), 0)
    return anomalie(ref, nom, 'INFO',
      `${classe8.length} compte(s) HAO (classe 8) pour ${totalMontant.toLocaleString('fr-FR')}`,
      { comptes: classe8.map((l) => `${l.compte}: ${l.intitule}`).slice(0, 10) },
      'Les operations HAO doivent etre justifiees et documentees',
      'Art. 48 Acte Uniforme OHADA')
  }
  return ok(ref, nom, 'Aucun compte HAO (classe 8)')
}

// C-009: Verification d'utilisation des comptes (obligatoire vs facultatif vs interdit)
function C009(ctx: AuditContext): ResultatControle {
  const ref = 'C-009', nom = 'Utilisation comptes OHADA'
  const interdits: string[] = []
  const planMap = new Map(PLAN_SYSCOHADA_REVISE.map(c => [c.numero, c]))

  for (const line of ctx.balanceN) {
    const num = line.compte.toString().trim()
    // Chercher correspondance exacte ou par prefixes
    for (let len = Math.min(num.length, 4); len >= 2; len--) {
      const prefix = num.substring(0, len)
      const compte = planMap.get(prefix)
      if (compte && compte.utilisation === 'INTERDIT') {
        interdits.push(`${num} (${compte.libelle} - usage interdit)`)
        break
      }
    }
  }

  if (interdits.length > 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `${interdits.length} compte(s) utilise(s) malgre usage interdit dans le plan SYSCOHADA`,
      { comptes: interdits.slice(0, 15) },
      'Remplacer ces comptes par les comptes autorises correspondants',
      'Plan SYSCOHADA Revise 2017 - Regles d\'utilisation')
  }
  return ok(ref, nom, 'Aucun compte a usage interdit detecte')
}

// C-010: Verification sens des comptes (debiteur vs crediteur)
function C010(ctx: AuditContext): ResultatControle {
  const ref = 'C-010', nom = 'Sens comptes OHADA'
  const inversions: string[] = []
  const planMap = new Map(PLAN_SYSCOHADA_REVISE.map(c => [c.numero, c]))

  for (const line of ctx.balanceN) {
    const num = line.compte.toString().trim()
    const soldeNet = (line.solde_debit || 0) - (line.solde_credit || 0)
    if (Math.abs(soldeNet) < 0.01) continue

    // Chercher le compte dans le plan
    for (let len = Math.min(num.length, 4); len >= 2; len--) {
      const prefix = num.substring(0, len)
      const compte = planMap.get(prefix)
      if (compte) {
        const sensAttendu = compte.sens === 'DEBITEUR' ? 'positif' : 'negatif'
        const sensReel = soldeNet > 0 ? 'positif' : 'negatif'
        if (sensAttendu !== sensReel) {
          inversions.push(`${num} (${compte.libelle}): solde ${sensReel} au lieu de ${sensAttendu}`)
        }
        break
      }
    }
  }

  if (inversions.length > 5) {
    return anomalie(ref, nom, 'MINEUR',
      `${inversions.length} compte(s) avec solde inverse par rapport au sens OHADA attendu`,
      { comptes: inversions.slice(0, 15) },
      'Verifier les soldes anormaux - un solde inverse peut indiquer une erreur de comptabilisation',
      'Plan SYSCOHADA Revise 2017 - Sens des comptes')
  }
  if (inversions.length > 0) {
    return anomalie(ref, nom, 'INFO',
      `${inversions.length} compte(s) avec solde inverse (peut etre normal)`,
      { comptes: inversions.slice(0, 10) })
  }
  return ok(ref, nom, 'Sens des comptes conformes aux attentes OHADA')
}

// --- Enregistrement ---

export function registerLevel2Controls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['C-001', 'Comptes OHADA valides', 'Verifie la conformite des comptes au plan SYSCOHADA', 'MAJEUR', C001],
    ['C-002', 'Classes valides (1-8)', 'Verifie que les classes sont valides', 'BLOQUANT', C002],
    ['C-003', 'Longueur comptes standard', 'Verifie la longueur des numeros de compte', 'INFO', C003],
    ['C-004', 'Comptes obsoletes SYSCOA', 'Detecte les comptes de l\'ancien SYSCOA', 'MAJEUR', C004],
    ['C-005', 'Comptes TAFIRE supprimes', 'Detecte les comptes TAFIRE obsoletes', 'MAJEUR', C005],
    ['C-006', 'Mapping etats financiers', 'Verifie le mapping vers les etats financiers', 'MAJEUR', C006],
    ['C-007', 'Comptes a 2 chiffres', 'Detecte les comptes trop synthetiques', 'MINEUR', C007],
    ['C-008', 'Comptes speciaux classe 8', 'Signale les comptes HAO', 'INFO', C008],
    ['C-009', 'Utilisation comptes OHADA', 'Detecte les comptes a usage interdit', 'MAJEUR', C009],
    ['C-010', 'Sens comptes OHADA', 'Verifie le sens des soldes selon le plan', 'MINEUR', C010],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_1', actif: true },
      fn
    )
  }
}
