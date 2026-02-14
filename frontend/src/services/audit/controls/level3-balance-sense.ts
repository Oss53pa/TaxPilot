/**
 * Niveau 3 - Sens de solde et montants (SS-001 a SS-010, MA-001 a MA-006)
 * 16 controles verifiant le sens des soldes et les montants aberrants
 */

import { AuditContext, ResultatControle, NiveauControle, EcritureComptable } from '@/types/audit.types'
import { BalanceEntry } from '@/services/liasseDataService'
import { controlRegistry } from '../controlRegistry'

const NIVEAU: NiveauControle = 3

function ok(ref: string, nom: string, msg: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'OK', severite: 'OK', message: msg, timestamp: new Date().toISOString() }
}

function anomalie(
  ref: string, nom: string, sev: ResultatControle['severite'], msg: string,
  det?: ResultatControle['details'], sug?: string,
  ecr?: EcritureComptable[], refR?: string
): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite: sev, message: msg,
    details: det, suggestion: sug, ecrituresCorrectives: ecr,
    referenceReglementaire: refR, timestamp: new Date().toISOString() }
}

function solde(l: BalanceEntry): number {
  return (l.solde_debit || 0) - (l.solde_credit || 0)
}

function findByPrefix(bal: BalanceEntry[], prefix: string): BalanceEntry[] {
  return bal.filter((l) => l.compte.toString().startsWith(prefix))
}

function totalBilan(bal: BalanceEntry[]): number {
  // Total actif uniquement (comptes classes 1-5 à solde débiteur)
  return bal
    .filter((l) => { const cl = parseInt(l.compte.charAt(0)); return cl >= 1 && cl <= 5 })
    .reduce((s, l) => { const sd = solde(l); return s + (sd > 0 ? sd : 0) }, 0)
}

// --- Controles de sens SS-001 a SS-010 ---

function checkSensClasse(ctx: AuditContext, ref: string, nom: string, prefix: string, sensAttendu: 'DEBITEUR' | 'CREDITEUR', description: string): ResultatControle {
  const entries = findByPrefix(ctx.balanceN, prefix)
  const inverses: string[] = []
  for (const l of entries) {
    const s = solde(l)
    if (sensAttendu === 'DEBITEUR' && s < -1) {
      inverses.push(`${l.compte} (${l.intitule}): ${s.toLocaleString('fr-FR')}`)
    }
    if (sensAttendu === 'CREDITEUR' && s > 1) {
      inverses.push(`${l.compte} (${l.intitule}): ${s.toLocaleString('fr-FR')}`)
    }
  }
  if (inverses.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${inverses.length} compte(s) ${prefix}x a sens inverse (${description})`,
      { comptes: inverses.slice(0, 10) },
      `Les comptes ${prefix}x sont normalement ${sensAttendu === 'DEBITEUR' ? 'debiteurs' : 'crediteurs'}`)
  }
  return ok(ref, nom, `Tous les comptes ${prefix}x ont un sens normal`)
}

// SS-001: Immobilisations (classe 2) normalement debitrices
function SS001(ctx: AuditContext): ResultatControle {
  return checkSensClasse(ctx, 'SS-001', 'Sens immobilisations', '2', 'DEBITEUR', 'immobilisations creditrices')
}

// SS-002: Stocks (classe 3) normalement debiteurs
function SS002(ctx: AuditContext): ResultatControle {
  return checkSensClasse(ctx, 'SS-002', 'Sens stocks', '3', 'DEBITEUR', 'stocks crediteurs')
}

// SS-003: Charges (classe 6) normalement debitrices
function SS003(ctx: AuditContext): ResultatControle {
  return checkSensClasse(ctx, 'SS-003', 'Sens charges', '6', 'DEBITEUR', 'charges creditrices')
}

// SS-004: Produits (classe 7) normalement crediteurs
function SS004(ctx: AuditContext): ResultatControle {
  return checkSensClasse(ctx, 'SS-004', 'Sens produits', '7', 'CREDITEUR', 'produits debiteurs')
}

// SS-005: Clients (411x) normalement debiteurs → reclassement si crediteur
function SS005(ctx: AuditContext): ResultatControle {
  const ref = 'SS-005', nom = 'Clients crediteurs'
  const clients = findByPrefix(ctx.balanceN, '411')
  const crediteurs: string[] = []
  let montantReclass = 0
  for (const l of clients) {
    const s = solde(l)
    if (s < -1) {
      crediteurs.push(`${l.compte}: ${s.toLocaleString('fr-FR')}`)
      montantReclass += Math.abs(s)
    }
  }
  if (crediteurs.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${crediteurs.length} client(s) crediteur(s) pour ${montantReclass.toLocaleString('fr-FR')}`,
      { comptes: crediteurs, montants: { montantReclassement: montantReclass } },
      'Reclasser au passif (avances recues) ou verifier les avoirs non imputes',
      [{
        journal: 'OD', date: new Date().toISOString().slice(0, 10),
        lignes: [
          { sens: 'D' as const, compte: '411000', libelle: 'Clients - reclassement', montant: montantReclass },
          { sens: 'C' as const, compte: '419000', libelle: 'Clients crediteurs (passif)', montant: montantReclass },
        ],
        commentaire: 'Reclassement clients crediteurs au passif'
      }])
  }
  return ok(ref, nom, 'Tous les clients sont debiteurs')
}

// SS-006: Fournisseurs (401x) normalement crediteurs → reclassement si debiteur
function SS006(ctx: AuditContext): ResultatControle {
  const ref = 'SS-006', nom = 'Fournisseurs debiteurs'
  const fournis = findByPrefix(ctx.balanceN, '401')
  const debiteurs: string[] = []
  let montantReclass = 0
  for (const l of fournis) {
    const s = solde(l)
    if (s > 1) {
      debiteurs.push(`${l.compte}: ${s.toLocaleString('fr-FR')}`)
      montantReclass += s
    }
  }
  if (debiteurs.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${debiteurs.length} fournisseur(s) debiteur(s) pour ${montantReclass.toLocaleString('fr-FR')}`,
      { comptes: debiteurs, montants: { montantReclassement: montantReclass } },
      'Reclasser a l\'actif (avances versees) ou verifier les avoirs',
      [{
        journal: 'OD', date: new Date().toISOString().slice(0, 10),
        lignes: [
          { sens: 'D' as const, compte: '409000', libelle: 'Fournisseurs debiteurs (actif)', montant: montantReclass },
          { sens: 'C' as const, compte: '401000', libelle: 'Fournisseurs - reclassement', montant: montantReclass },
        ],
        commentaire: 'Reclassement fournisseurs debiteurs a l\'actif'
      }])
  }
  return ok(ref, nom, 'Tous les fournisseurs sont crediteurs')
}

// SS-007: Banques (52x) normalement debitrices → reclassement si creditrice
function SS007(ctx: AuditContext): ResultatControle {
  const ref = 'SS-007', nom = 'Banques creditrices'
  const banques = findByPrefix(ctx.balanceN, '52')
  const creditrices: string[] = []
  let montantReclass = 0
  for (const l of banques) {
    const s = solde(l)
    if (s < -1) {
      creditrices.push(`${l.compte}: ${s.toLocaleString('fr-FR')}`)
      montantReclass += Math.abs(s)
    }
  }
  if (creditrices.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${creditrices.length} banque(s) creditrice(s) pour ${montantReclass.toLocaleString('fr-FR')} (decouvert)`,
      { comptes: creditrices, montants: { montantReclassement: montantReclass } },
      'Reclasser en tresorerie-passif (concours bancaires)')
  }
  return ok(ref, nom, 'Toutes les banques sont debitrices')
}

// SS-008: Amortissements (28x) normalement crediteurs
function SS008(ctx: AuditContext): ResultatControle {
  return checkSensClasse(ctx, 'SS-008', 'Sens amortissements', '28', 'CREDITEUR', 'amortissements debiteurs')
}

// SS-009: Provisions (29x/39x/49x) normalement creditrices
function SS009(ctx: AuditContext): ResultatControle {
  const ref = 'SS-009', nom = 'Sens provisions'
  const prefixes = ['29', '39', '49']
  const inverses: string[] = []
  for (const prefix of prefixes) {
    for (const l of findByPrefix(ctx.balanceN, prefix)) {
      if (solde(l) > 1) {
        inverses.push(`${l.compte}: ${solde(l).toLocaleString('fr-FR')}`)
      }
    }
  }
  if (inverses.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${inverses.length} provision(s) a sens inverse`,
      { comptes: inverses.slice(0, 10) })
  }
  return ok(ref, nom, 'Toutes les provisions ont un sens normal')
}

// SS-010: Capital negatif
function SS010(ctx: AuditContext): ResultatControle {
  const ref = 'SS-010', nom = 'Capital negatif'
  const capital = findByPrefix(ctx.balanceN, '101')
  const montant = capital.reduce((s, l) => s + (l.credit - l.debit), 0)
  if (montant < 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `Capital social negatif: ${montant.toLocaleString('fr-FR')}`,
      { montants: { capitalSocial: montant } },
      'Un capital negatif est anormal et doit etre corrige')
  }
  return ok(ref, nom, `Capital social positif: ${montant.toLocaleString('fr-FR')}`)
}

// --- Controles de montants MA-001 a MA-006 ---

// MA-001: Montant > 50% total bilan
function MA001(ctx: AuditContext): ResultatControle {
  const ref = 'MA-001', nom = 'Concentration montants'
  const tb = totalBilan(ctx.balanceN)
  if (tb === 0) return ok(ref, nom, 'Bilan nul')
  const concentres: string[] = []
  for (const l of ctx.balanceN) {
    const cl = parseInt(l.compte.charAt(0))
    if (cl >= 1 && cl <= 5 && Math.abs(solde(l)) > tb * 0.5) {
      concentres.push(`${l.compte}: ${Math.abs(solde(l)).toLocaleString('fr-FR')} (${((Math.abs(solde(l)) / tb) * 100).toFixed(1)}%)`)
    }
  }
  if (concentres.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${concentres.length} compte(s) representant plus de 50% du total bilan`,
      { comptes: concentres },
      'Forte concentration - verifier la repartition des postes')
  }
  return ok(ref, nom, 'Pas de concentration excessive')
}

// MA-002: Centimes suspects
function MA002(ctx: AuditContext): ResultatControle {
  const ref = 'MA-002', nom = 'Centimes suspects'
  const suspects: string[] = []
  for (const l of ctx.balanceN) {
    for (const montant of [l.debit, l.credit]) {
      if (montant > 0) {
        const cents = Math.round((montant % 1) * 100)
        if (cents === 1 || cents === 99) {
          suspects.push(`${l.compte}: ${montant}`)
        }
      }
    }
  }
  if (suspects.length > 3) {
    return anomalie(ref, nom, 'INFO',
      `${suspects.length} montant(s) avec centimes suspects (.01 ou .99)`,
      { comptes: suspects.slice(0, 10) },
      'Montants en .01 ou .99 peuvent indiquer des erreurs d\'arrondi')
  }
  return ok(ref, nom, 'Pas de centimes suspects')
}

// MA-003: Montant negatif
function MA003(ctx: AuditContext): ResultatControle {
  const ref = 'MA-003', nom = 'Montants negatifs'
  const negatifs: string[] = []
  for (const l of ctx.balanceN) {
    if (l.debit < 0 || l.credit < 0) {
      negatifs.push(`${l.compte}: D=${l.debit}, C=${l.credit}`)
    }
  }
  if (negatifs.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${negatifs.length} ligne(s) avec montants negatifs en debit/credit`,
      { comptes: negatifs.slice(0, 10) },
      'Les montants en debit et credit doivent etre positifs (utiliser le sens oppose)')
  }
  return ok(ref, nom, 'Aucun montant negatif')
}

// MA-004: Resultat deficitaire > 50% capital
function MA004(ctx: AuditContext): ResultatControle {
  const ref = 'MA-004', nom = 'Deficit vs capital'
  const capital = findByPrefix(ctx.balanceN, '101').reduce((s, l) => s + (l.credit - l.debit), 0)
  const resultat = findByPrefix(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  if (capital > 0 && resultat < 0 && Math.abs(resultat) > capital * 0.5) {
    return anomalie(ref, nom, 'INFO',
      `Deficit (${resultat.toLocaleString('fr-FR')}) depasse 50% du capital (${capital.toLocaleString('fr-FR')})`,
      { montants: { resultat, capital, ratio: ((Math.abs(resultat) / capital) * 100) } },
      'Un deficit important peut signaler une situation de continuite d\'exploitation delicate')
  }
  return ok(ref, nom, 'Deficit dans les limites acceptables')
}

// MA-005: Capitaux propres negatifs
function MA005(ctx: AuditContext): ResultatControle {
  const ref = 'MA-005', nom = 'Capitaux propres negatifs'
  const classes1 = ctx.balanceN.filter((l) => {
    const num = l.compte.toString()
    return num.startsWith('10') || num.startsWith('11') || num.startsWith('12') || num.startsWith('13') || num.startsWith('14')
  })
  const capitauxPropres = classes1.reduce((s, l) => s + ((l.credit || 0) - (l.debit || 0)), 0)
  if (capitauxPropres < 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `Capitaux propres negatifs: ${capitauxPropres.toLocaleString('fr-FR')}`,
      { montants: { capitauxPropres } },
      'Situation d\'alerte - obligation legale de regulariser sous 2 ans (Art. 664 AUSCGIE)',
      undefined,
      'Art. 664 AUSCGIE')
  }
  return ok(ref, nom, `Capitaux propres positifs: ${capitauxPropres.toLocaleString('fr-FR')}`)
}

// MA-006: Tresorerie nette tres negative
function MA006(ctx: AuditContext): ResultatControle {
  const ref = 'MA-006', nom = 'Tresorerie nette'
  const tresoActif = findByPrefix(ctx.balanceN, '5').reduce((s, l) => s + Math.max(0, solde(l)), 0)
  const tresoPassif = findByPrefix(ctx.balanceN, '5').reduce((s, l) => s + Math.max(0, -solde(l)), 0)
  const tresoNette = tresoActif - tresoPassif
  const tb = totalBilan(ctx.balanceN)
  if (tb > 0 && tresoNette < 0 && Math.abs(tresoNette) > tb * 0.3) {
    return anomalie(ref, nom, 'INFO',
      `Tresorerie nette tres negative: ${tresoNette.toLocaleString('fr-FR')} (${((Math.abs(tresoNette) / tb) * 100).toFixed(1)}% du bilan)`,
      { montants: { tresoNette, tresoActif, tresoPassif } },
      'Risque de tension de tresorerie importante')
  }
  return ok(ref, nom, `Tresorerie nette: ${tresoNette.toLocaleString('fr-FR')}`)
}

// --- Enregistrement ---

export function registerLevel3Controls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['SS-001', 'Sens immobilisations', 'Verifie le sens debiteur des immobilisations', 'MINEUR', SS001],
    ['SS-002', 'Sens stocks', 'Verifie le sens debiteur des stocks', 'MINEUR', SS002],
    ['SS-003', 'Sens charges', 'Verifie le sens debiteur des charges', 'MINEUR', SS003],
    ['SS-004', 'Sens produits', 'Verifie le sens crediteur des produits', 'MINEUR', SS004],
    ['SS-005', 'Clients crediteurs', 'Detecte les clients a solde crediteur', 'MINEUR', SS005],
    ['SS-006', 'Fournisseurs debiteurs', 'Detecte les fournisseurs a solde debiteur', 'MINEUR', SS006],
    ['SS-007', 'Banques creditrices', 'Detecte les banques a solde crediteur', 'MINEUR', SS007],
    ['SS-008', 'Sens amortissements', 'Verifie le sens crediteur des amortissements', 'MINEUR', SS008],
    ['SS-009', 'Sens provisions', 'Verifie le sens crediteur des provisions', 'MINEUR', SS009],
    ['SS-010', 'Capital negatif', 'Detecte un capital social negatif', 'MAJEUR', SS010],
    ['MA-001', 'Concentration montants', 'Detecte les comptes > 50% du bilan', 'MINEUR', MA001],
    ['MA-002', 'Centimes suspects', 'Detecte les montants en .01 ou .99', 'INFO', MA002],
    ['MA-003', 'Montants negatifs', 'Detecte les montants negatifs en D/C', 'MINEUR', MA003],
    ['MA-004', 'Deficit vs capital', 'Verifie deficit < 50% capital', 'INFO', MA004],
    ['MA-005', 'Capitaux propres negatifs', 'Detecte des capitaux propres negatifs', 'MAJEUR', MA005],
    ['MA-006', 'Tresorerie nette', 'Verifie la tresorerie nette', 'INFO', MA006],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_1', actif: true },
      fn
    )
  }
}
