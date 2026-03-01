/**
 * Controles de comparaison N vs N-1 (COMP-001 a COMP-008)
 * 8 controles declenches lors de l'import d'une nouvelle balance quand N-1 existe
 * S'integrent aussi dans le moteur d'audit au niveau 5
 */

import { AuditContext, ResultatControle, NiveauControle } from '@/types/audit.types'
import { BalanceEntry } from '@/services/liasseDataService'
import { controlRegistry } from '../controlRegistry'

const NIVEAU: NiveauControle = 5

function ok(ref: string, nom: string, msg: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'OK', severite: 'OK', message: msg, timestamp: new Date().toISOString() }
}

function anomalie(ref: string, nom: string, sev: ResultatControle['severite'], msg: string, det?: ResultatControle['details'], sug?: string, refR?: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite: sev, message: msg, details: det, suggestion: sug, referenceReglementaire: refR, timestamp: new Date().toISOString() }
}

function na(ref: string, nom: string, msg: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: msg, timestamp: new Date().toISOString() }
}

function solde(l: BalanceEntry): number { return (l.solde_debit || 0) - (l.solde_credit || 0) }

function find(bal: BalanceEntry[], prefix: string): BalanceEntry[] {
  return bal.filter(l => l.compte.toString().startsWith(prefix))
}

function needsN1(ref: string, nom: string, balanceN1?: BalanceEntry[]): ResultatControle | null {
  if (!balanceN1 || balanceN1.length === 0) return na(ref, nom, 'Balance N-1 absente')
  return null
}

// ── COMP-001: RAN solde cloture N-1 = solde ouverture N (classes 1-5) ──
function COMP001(balanceN: BalanceEntry[], balanceN1?: BalanceEntry[]): ResultatControle {
  const ref = 'COMP-001', nom = 'RAN: Cloture N-1 = Ouverture N'
  const skip = needsN1(ref, nom, balanceN1); if (skip) return skip

  // Comparer les soldes de bilan (classes 1-5)
  const mapN1 = new Map<string, number>()
  for (const l of balanceN1!) {
    const cl = parseInt(l.compte.charAt(0))
    if (cl >= 1 && cl <= 5) mapN1.set(l.compte, solde(l))
  }

  let totalEcart = 0
  const comptesEcart: string[] = []
  for (const l of balanceN) {
    const cl = parseInt(l.compte.charAt(0))
    if (cl < 1 || cl > 5) continue
    const soldeN1 = mapN1.get(l.compte) || 0
    const soldeN = solde(l)
    const ecart = Math.abs(soldeN - soldeN1)
    if (ecart > 1) {
      totalEcart += ecart
      if (comptesEcart.length < 10) {
        comptesEcart.push(`${l.compte}: N-1=${soldeN1.toLocaleString('fr-FR')} vs N=${soldeN.toLocaleString('fr-FR')}`)
      }
    }
  }

  if (totalEcart > 100) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Ecart total de ${totalEcart.toLocaleString('fr-FR')} sur les soldes de bilan entre N-1 et N`,
      {
        comptes: comptesEcart,
        montants: { ecartTotal: totalEcart, comptesAvecEcart: comptesEcart.length },
        description: `Les soldes de cloture N-1 ne correspondent pas aux soldes d'ouverture N pour les comptes de bilan (classes 1-5). Ecart total: ${totalEcart.toLocaleString('fr-FR')} FCFA.`,
        attendu: 'Soldes de cloture N-1 = Soldes d\'ouverture N pour les classes 1 a 5',
        constate: `Ecart de ${totalEcart.toLocaleString('fr-FR')} FCFA sur ${comptesEcart.length} compte(s)`,
        impactFiscal: 'La discontinuite des soldes de bilan fausse les etats financiers comparatifs et peut entrainer un rejet de la liasse.',
      },
      'Rapprocher les deux balances compte par compte. Verifier les ecritures de report a nouveau.',
      'Art. 40 Acte Uniforme OHADA - Continuite des exercices')
  }
  return ok(ref, nom, 'Soldes de bilan coherents entre N-1 et N')
}

// ── COMP-002: Comptes N-1 absents en N ──
function COMP002(balanceN: BalanceEntry[], balanceN1?: BalanceEntry[]): ResultatControle {
  const ref = 'COMP-002', nom = 'Comptes N-1 absents en N'
  const skip = needsN1(ref, nom, balanceN1); if (skip) return skip

  const comptesN = new Set(balanceN.map(l => l.compte))
  const absents: string[] = []
  for (const l of balanceN1!) {
    const cl = parseInt(l.compte.charAt(0))
    if (cl >= 1 && cl <= 5 && Math.abs(solde(l)) > 100 && !comptesN.has(l.compte)) {
      absents.push(`${l.compte} (${l.intitule || ''}): ${solde(l).toLocaleString('fr-FR')}`)
    }
  }

  if (absents.length > 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `${absents.length} compte(s) de bilan significatif(s) en N-1 absent(s) en N`,
      {
        comptes: absents.slice(0, 15),
        montants: { comptesAbsents: absents.length },
        description: `${absents.length} comptes de bilan presents en N-1 avec un solde > 100 sont absents de la balance N. Cela peut indiquer un oubli de report a nouveau ou une erreur d'import.`,
        attendu: 'Tous les comptes de bilan N-1 doivent etre reportes en N',
        constate: `${absents.length} compte(s) absent(s)`,
        impactFiscal: 'Comptes non reportes = bilan incomplet = risque de rejet par l\'administration fiscale.',
      },
      'Verifier que tous les comptes de bilan N-1 sont reportes dans la balance N. Ajouter les reports a nouveau manquants.')
  }
  return ok(ref, nom, 'Tous les comptes N-1 sont presents en N')
}

// ── COMP-003: Resultat N-1 affecte (13x → 12x/11x/46x) ──
function COMP003(balanceN: BalanceEntry[], balanceN1?: BalanceEntry[]): ResultatControle {
  const ref = 'COMP-003', nom = 'Affectation resultat N-1'
  const skip = needsN1(ref, nom, balanceN1); if (skip) return skip

  const resultatN1 = find(balanceN1!, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  if (Math.abs(resultatN1) < 1) return ok(ref, nom, 'Pas de resultat N-1 a affecter')

  const ran = find(balanceN, '12').reduce((s, l) => s + (l.credit - l.debit), 0)
  const reserves = find(balanceN, '11').reduce((s, l) => s + (l.credit - l.debit), 0)
  const dividendes = find(balanceN, '46').reduce((s, l) => s + (l.credit - l.debit), 0)
  const compte13N = find(balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)

  // Le resultat N-1 doit avoir ete solde (13x vide en N ou reporte dans 12x/11x/46x)
  if (Math.abs(compte13N) > 1) {
    return anomalie(ref, nom, 'MAJEUR',
      `Resultat N-1 (${resultatN1.toLocaleString('fr-FR')}) non affecte: compte 13x non solde en N (${compte13N.toLocaleString('fr-FR')})`,
      {
        montants: { resultatN1, ran, reserves, dividendes, compte13N },
        description: `Le compte 13x (resultat de l'exercice) n'a pas ete solde. Il doit etre affecte en report a nouveau (12x), reserves (11x) ou dividendes (46x).`,
        attendu: 'Compte 13x solde apres affectation du resultat',
        constate: `Compte 13x = ${compte13N.toLocaleString('fr-FR')} en N`,
        impactFiscal: 'L\'absence d\'affectation du resultat est une anomalie comptable majeure qui peut entrainer une regularisation fiscale.',
      },
      'Passer l\'ecriture d\'affectation du resultat: 13x → 12x (RAN) + 11x (reserves) + 46x (dividendes).',
      'Art. 36 Acte Uniforme OHADA - Affectation du resultat')
  }
  return ok(ref, nom, `Resultat N-1 correctement affecte`)
}

// ── COMP-004: Comptes gestion (6/7) remis a zero ──
function COMP004(balanceN: BalanceEntry[], balanceN1?: BalanceEntry[]): ResultatControle {
  const ref = 'COMP-004', nom = 'RAZ comptes de gestion'
  const skip = needsN1(ref, nom, balanceN1); if (skip) return skip

  // En debut d'exercice N, les soldes d'ouverture des comptes 6/7 doivent etre a zero
  // On verifie que les comptes de gestion N-1 ne se retrouvent pas avec le meme solde en N
  // (ce qui indiquerait un non-RAZ)
  const gestionN1Map = new Map<string, number>()
  for (const l of balanceN1!) {
    const cl = parseInt(l.compte.charAt(0))
    if ((cl === 6 || cl === 7) && Math.abs(solde(l)) > 100) {
      gestionN1Map.set(l.compte, solde(l))
    }
  }

  const nonRAZ: string[] = []
  for (const l of balanceN) {
    const cl = parseInt(l.compte.charAt(0))
    if (cl !== 6 && cl !== 7) continue
    const soldeN1 = gestionN1Map.get(l.compte)
    if (soldeN1 !== undefined) {
      const soldeN = solde(l)
      // Si le solde N est identique au solde N-1, c'est suspect
      if (Math.abs(soldeN - soldeN1) < 1 && Math.abs(soldeN) > 100) {
        nonRAZ.push(`${l.compte}: solde identique N-1/N = ${soldeN.toLocaleString('fr-FR')}`)
      }
    }
  }

  if (nonRAZ.length > 3) {
    return anomalie(ref, nom, 'BLOQUANT',
      `${nonRAZ.length} comptes de gestion avec solde identique a N-1 (probable non-RAZ)`,
      {
        comptes: nonRAZ.slice(0, 10),
        montants: { comptesNonRAZ: nonRAZ.length },
        description: `${nonRAZ.length} comptes de gestion (classes 6/7) ont exactement le meme solde en N qu'en N-1, ce qui indique que la remise a zero n'a probablement pas ete effectuee.`,
        attendu: 'Comptes de gestion remis a zero en debut d\'exercice N',
        constate: `${nonRAZ.length} compte(s) avec solde identique a N-1`,
        impactFiscal: 'Le non-RAZ des comptes de gestion fausse completement le resultat fiscal de l\'exercice N.',
      },
      'Effectuer la remise a zero des comptes de gestion (ecriture: 7xx D / 6xx C → 13x). Reimporter la balance apres correction.',
      'Art. 22 Acte Uniforme OHADA - Principe d\'independance des exercices')
  }
  return ok(ref, nom, 'Comptes de gestion correctement remis a zero')
}

// ── COMP-005: Equilibre des soldes d'ouverture N ──
function COMP005(balanceN: BalanceEntry[], balanceN1?: BalanceEntry[]): ResultatControle {
  const ref = 'COMP-005', nom = 'Equilibre ouverture N'
  const skip = needsN1(ref, nom, balanceN1); if (skip) return skip

  // Les soldes d'ouverture du bilan doivent etre equilibres
  const bilanN = balanceN.filter(l => {
    const cl = parseInt(l.compte.charAt(0))
    return cl >= 1 && cl <= 5
  })

  const totalDebit = bilanN.reduce((s, l) => s + (l.solde_debit || 0), 0)
  const totalCredit = bilanN.reduce((s, l) => s + (l.solde_credit || 0), 0)
  const ecart = Math.abs(totalDebit - totalCredit)

  if (ecart > 1) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Desequilibre des soldes de bilan N: debit=${totalDebit.toLocaleString('fr-FR')} credit=${totalCredit.toLocaleString('fr-FR')} ecart=${ecart.toLocaleString('fr-FR')}`,
      {
        montants: { totalDebit, totalCredit, ecart },
        description: `Les soldes de bilan de l'exercice N ne sont pas equilibres. L'ecart de ${ecart.toLocaleString('fr-FR')} indique une erreur dans les reports a nouveau.`,
        attendu: 'Total debit bilan = Total credit bilan',
        constate: `Ecart de ${ecart.toLocaleString('fr-FR')} FCFA`,
        impactFiscal: 'Bilan non equilibre = liasse irrecevable par l\'administration fiscale.',
      },
      'Identifier et corriger les ecarts dans les reports a nouveau. Verifier que total actif = total passif.')
  }
  return ok(ref, nom, 'Soldes de bilan equilibres')
}

// ── COMP-006: Continuite capitaux propres (classe 1) ──
function COMP006(balanceN: BalanceEntry[], balanceN1?: BalanceEntry[]): ResultatControle {
  const ref = 'COMP-006', nom = 'Continuite capitaux propres'
  const skip = needsN1(ref, nom, balanceN1); if (skip) return skip

  const cpN = find(balanceN, '1').filter(l => !l.compte.startsWith('13')).reduce((s, l) => s + (l.credit - l.debit), 0)
  const cpN1 = find(balanceN1!, '1').filter(l => !l.compte.startsWith('13')).reduce((s, l) => s + (l.credit - l.debit), 0)
  const resultatN1 = find(balanceN1!, '13').reduce((s, l) => s + (l.credit - l.debit), 0)

  // CP N devrait = CP N-1 + resultat N-1 (en simplifie)
  const cpAttendu = cpN1 + resultatN1
  const ecart = Math.abs(cpN - cpAttendu)
  const seuilPct = Math.abs(cpAttendu) > 0 ? (ecart / Math.abs(cpAttendu)) * 100 : 0

  if (seuilPct > 20 && ecart > 10000) {
    return anomalie(ref, nom, 'MAJEUR',
      `Capitaux propres N (${cpN.toLocaleString('fr-FR')}) != CP N-1 + Resultat N-1 (${cpAttendu.toLocaleString('fr-FR')})`,
      {
        montants: { cpN, cpN1, resultatN1, cpAttendu, ecart, variationPct: Math.round(seuilPct) },
        description: `Les capitaux propres N different de CP N-1 + Resultat N-1 de ${ecart.toLocaleString('fr-FR')} (${seuilPct.toFixed(0)}%). Sauf operations sur le capital ou les reserves, cette egalite doit etre verifiee.`,
        attendu: `CP N = CP N-1 (${cpN1.toLocaleString('fr-FR')}) + Resultat N-1 (${resultatN1.toLocaleString('fr-FR')}) = ${cpAttendu.toLocaleString('fr-FR')}`,
        constate: `CP N = ${cpN.toLocaleString('fr-FR')}, ecart de ${ecart.toLocaleString('fr-FR')}`,
        impactFiscal: 'Variation inexpliquee des capitaux propres impacte le tableau de variation et la credibilite des etats financiers.',
      },
      'Reconstituer la variation des capitaux propres: capital, reserves, RAN, resultat. Verifier le tableau de variation (Note 13B).',
      'Art. 74 Acte Uniforme OHADA - Variation des capitaux propres')
  }
  return ok(ref, nom, 'Continuite des capitaux propres verifiee')
}

// ── COMP-007: Nouveaux comptes en N avec RAN (info) ──
function COMP007(balanceN: BalanceEntry[], balanceN1?: BalanceEntry[]): ResultatControle {
  const ref = 'COMP-007', nom = 'Nouveaux comptes en N'
  const skip = needsN1(ref, nom, balanceN1); if (skip) return skip

  const comptesN1 = new Set(balanceN1!.map(l => l.compte))
  const nouveaux: string[] = []
  for (const l of balanceN) {
    const cl = parseInt(l.compte.charAt(0))
    if (cl >= 1 && cl <= 5 && Math.abs(solde(l)) > 100 && !comptesN1.has(l.compte)) {
      nouveaux.push(`${l.compte} (${l.intitule || ''}): ${solde(l).toLocaleString('fr-FR')}`)
    }
  }

  if (nouveaux.length > 0) {
    return anomalie(ref, nom, 'INFO',
      `${nouveaux.length} nouveau(x) compte(s) de bilan en N non present(s) en N-1`,
      {
        comptes: nouveaux.slice(0, 15),
        montants: { comptesNouveaux: nouveaux.length },
        description: `${nouveaux.length} comptes de bilan sont presents en N mais absents en N-1. Cela peut etre normal (nouvelle activite, investissement) ou indiquer un reclassement.`,
        attendu: 'Information: nouveaux comptes de bilan en N',
        constate: `${nouveaux.length} nouveau(x) compte(s)`,
      },
      'Verifier que ces nouveaux comptes correspondent a des operations reelles et sont correctement classes.')
  }
  return ok(ref, nom, 'Pas de nouveau compte de bilan significatif')
}

// ── COMP-008: Continuite total bilan ──
function COMP008(balanceN: BalanceEntry[], balanceN1?: BalanceEntry[]): ResultatControle {
  const ref = 'COMP-008', nom = 'Continuite total bilan'
  const skip = needsN1(ref, nom, balanceN1); if (skip) return skip

  const totalActifN = balanceN.filter(l => {
    const cl = parseInt(l.compte.charAt(0))
    return cl >= 2 && cl <= 5 && solde(l) > 0
  }).reduce((s, l) => s + solde(l), 0)

  const totalActifN1 = balanceN1!.filter(l => {
    const cl = parseInt(l.compte.charAt(0))
    return cl >= 2 && cl <= 5 && solde(l) > 0
  }).reduce((s, l) => s + solde(l), 0)

  if (totalActifN1 > 0) {
    const variation = ((totalActifN - totalActifN1) / totalActifN1) * 100
    if (Math.abs(variation) > 50) {
      return anomalie(ref, nom, 'MAJEUR',
        `Total bilan varie de ${variation > 0 ? '+' : ''}${variation.toFixed(0)}% entre N-1 et N`,
        {
          montants: { totalActifN, totalActifN1, variationPct: Math.round(variation) },
          description: `Le total du bilan a varie de ${variation.toFixed(0)}% (N-1: ${totalActifN1.toLocaleString('fr-FR')}, N: ${totalActifN.toLocaleString('fr-FR')}). Une telle variation necessite une justification.`,
          attendu: 'Variation du total bilan < 50% entre exercices',
          constate: `Variation de ${variation.toFixed(0)}%`,
          impactFiscal: 'Variation anormale du bilan peut indiquer des erreurs affectant la base imposable.',
        },
        'Identifier les postes a l\'origine de la variation et documenter dans l\'annexe.')
    }
  }
  return ok(ref, nom, 'Total bilan stable entre N-1 et N')
}

// ── Fonction standalone pour usage direct (import) ──

export function runComparisonControls(balanceN: BalanceEntry[], balanceN1: BalanceEntry[]): ResultatControle[] {
  return [
    COMP001(balanceN, balanceN1),
    COMP002(balanceN, balanceN1),
    COMP003(balanceN, balanceN1),
    COMP004(balanceN, balanceN1),
    COMP005(balanceN, balanceN1),
    COMP006(balanceN, balanceN1),
    COMP007(balanceN, balanceN1),
    COMP008(balanceN, balanceN1),
  ]
}

// ── Wrappers pour le moteur d'audit (AuditContext) ──

function wrapCtx(fn: (n: BalanceEntry[], n1?: BalanceEntry[]) => ResultatControle) {
  return (ctx: AuditContext) => fn(ctx.balanceN, ctx.balanceN1)
}

// ── Enregistrement dans le registre ──

export function registerComparisonControls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['COMP-001', 'RAN: Cloture N-1 = Ouverture N', 'Verifie la continuite des soldes de bilan', 'BLOQUANT', wrapCtx(COMP001)],
    ['COMP-002', 'Comptes N-1 absents en N', 'Detecte les comptes de bilan N-1 absents en N', 'MAJEUR', wrapCtx(COMP002)],
    ['COMP-003', 'Affectation resultat N-1', 'Verifie que le resultat N-1 est affecte', 'MAJEUR', wrapCtx(COMP003)],
    ['COMP-004', 'RAZ comptes de gestion', 'Verifie la remise a zero des comptes 6/7', 'BLOQUANT', wrapCtx(COMP004)],
    ['COMP-005', 'Equilibre ouverture N', 'Verifie l\'equilibre des soldes de bilan N', 'BLOQUANT', wrapCtx(COMP005)],
    ['COMP-006', 'Continuite capitaux propres', 'Verifie CP N = CP N-1 + Resultat N-1', 'MAJEUR', wrapCtx(COMP006)],
    ['COMP-007', 'Nouveaux comptes en N', 'Signale les comptes de bilan nouveaux en N', 'INFO', wrapCtx(COMP007)],
    ['COMP-008', 'Continuite total bilan', 'Verifie la variation du total bilan', 'MAJEUR', wrapCtx(COMP008)],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_1', actif: true },
      fn
    )
  }
}
