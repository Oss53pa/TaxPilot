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
  let totalInverse = 0
  let totalClasse = 0
  for (const l of entries) {
    const s = solde(l)
    totalClasse += Math.abs(s)
    if (sensAttendu === 'DEBITEUR' && s < -1) {
      inverses.push(`${l.compte} (${l.intitule}): ${s.toLocaleString('fr-FR')}`)
      totalInverse += Math.abs(s)
    }
    if (sensAttendu === 'CREDITEUR' && s > 1) {
      inverses.push(`${l.compte} (${l.intitule}): ${s.toLocaleString('fr-FR')}`)
      totalInverse += Math.abs(s)
    }
  }
  if (inverses.length > 0) {
    const pctInverse = totalClasse > 0 ? (totalInverse / totalClasse * 100) : 0
    const nomsClasses: Record<string, string> = { '2': 'Immobilisations', '3': 'Stocks', '6': 'Charges', '7': 'Produits', '28': 'Amortissements', '29': 'Depreciations immob.', '39': 'Depreciations stocks', '49': 'Depreciations tiers' }
    return anomalie(ref, nom, 'MINEUR',
      `${inverses.length} compte(s) ${prefix}x a sens inverse (${description})`,
      {
        comptes: inverses.slice(0, 10),
        montants: { totalMontantInverse: totalInverse, totalClasse, pctInverse: Math.round(pctInverse), comptesInverses: inverses.length },
        description: `${inverses.length} comptes de la classe ${prefix}x (${nomsClasses[prefix] || prefix}) presentent un solde ${sensAttendu === 'DEBITEUR' ? 'crediteur' : 'debiteur'} pour un total de ${totalInverse.toLocaleString('fr-FR')} FCFA (${pctInverse.toFixed(1)}% du total classe). Un solde inverse peut indiquer une erreur de comptabilisation ou un reclassement necessaire.`,
        attendu: `Solde ${sensAttendu === 'DEBITEUR' ? 'debiteur' : 'crediteur'} pour les comptes ${prefix}x`,
        constate: `${inverses.length} compte(s) ${prefix}x a solde inverse pour ${totalInverse.toLocaleString('fr-FR')} FCFA (${pctInverse.toFixed(1)}%)`,
        impactFiscal: 'Presentation erronee des etats financiers - reclassements a effectuer avant generation de la liasse',
      },
      `Les comptes ${prefix}x sont normalement ${sensAttendu === 'DEBITEUR' ? 'debiteurs' : 'crediteurs'}. Verifier les ecritures et effectuer les reclassements necessaires.`,
      undefined,
      'Art. 35 Acte Uniforme OHADA - Presentation des comptes')
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
      {
        comptes: crediteurs, montants: { montantReclassement: montantReclass, clientsCrediteurs: crediteurs.length },
        description: `${crediteurs.length} comptes clients (411x) presentent un solde crediteur pour un total de ${montantReclass.toLocaleString('fr-FR')} FCFA. Un client crediteur signifie que l\'entreprise doit au client (avoirs non imputes, trop-percus, avances recues). Ces montants doivent etre reclasses au passif du bilan (compte 419) pour une presentation conforme.`,
        attendu: 'Comptes clients (411x) a solde debiteur',
        constate: `${crediteurs.length} client(s) crediteur(s) pour ${montantReclass.toLocaleString('fr-FR')} FCFA`,
        impactFiscal: 'Non-respect du principe de non-compensation - reclassement au passif (419) obligatoire',
      },
      'Reclasser les clients crediteurs au passif (compte 419 - Clients crediteurs) ou imputer les avoirs en attente. Verifier l\'origine de chaque solde crediteur.',
      [{
        journal: 'OD', date: new Date().toISOString().slice(0, 10),
        lignes: [
          { sens: 'D' as const, compte: '411000', libelle: 'Clients - reclassement', montant: montantReclass },
          { sens: 'C' as const, compte: '419000', libelle: 'Clients crediteurs (passif)', montant: montantReclass },
        ],
        commentaire: 'Reclassement clients crediteurs au passif'
      }],
      'Art. 39 Acte Uniforme OHADA - Non-compensation')
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
      {
        comptes: debiteurs, montants: { montantReclassement: montantReclass, fournisseursDebiteurs: debiteurs.length },
        description: `${debiteurs.length} comptes fournisseurs (401x) presentent un solde debiteur pour un total de ${montantReclass.toLocaleString('fr-FR')} FCFA. Un fournisseur debiteur signifie que le fournisseur doit a l\'entreprise (avances versees, avoirs en attente, trop-payes). Ces montants doivent etre reclasses a l\'actif du bilan (compte 409).`,
        attendu: 'Comptes fournisseurs (401x) a solde crediteur',
        constate: `${debiteurs.length} fournisseur(s) debiteur(s) pour ${montantReclass.toLocaleString('fr-FR')} FCFA`,
        impactFiscal: 'Non-respect du principe de non-compensation - reclassement a l\'actif (409) obligatoire',
      },
      'Reclasser les fournisseurs debiteurs a l\'actif (compte 409 - Fournisseurs debiteurs) ou imputer les avoirs. Verifier l\'origine de chaque solde debiteur.',
      [{
        journal: 'OD', date: new Date().toISOString().slice(0, 10),
        lignes: [
          { sens: 'D' as const, compte: '409000', libelle: 'Fournisseurs debiteurs (actif)', montant: montantReclass },
          { sens: 'C' as const, compte: '401000', libelle: 'Fournisseurs - reclassement', montant: montantReclass },
        ],
        commentaire: 'Reclassement fournisseurs debiteurs a l\'actif'
      }],
      'Art. 39 Acte Uniforme OHADA - Non-compensation')
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
      {
        comptes: creditrices, montants: { montantReclassement: montantReclass, banquesCreditrices: creditrices.length },
        description: `${creditrices.length} comptes bancaires (52x) presentent un solde crediteur pour un total de ${montantReclass.toLocaleString('fr-FR')} FCFA. Un solde crediteur sur un compte banque indique un decouvert bancaire. Ces montants doivent etre reclasses en tresorerie-passif pour une presentation correcte du bilan.`,
        attendu: 'Comptes bancaires (52x) a solde debiteur (tresorerie active)',
        constate: `${creditrices.length} banque(s) en decouvert pour ${montantReclass.toLocaleString('fr-FR')} FCFA`,
        impactFiscal: 'Reclassement en tresorerie-passif obligatoire - decouverts a presenter en concours bancaires courants',
      },
      'Reclasser les soldes crediteurs en tresorerie-passif (concours bancaires courants). Verifier les releves bancaires et la concordance des soldes.',
      [{
        journal: 'OD', date: new Date().toISOString().slice(0, 10),
        lignes: [
          { sens: 'D' as const, compte: '521000', libelle: 'Banque - reclassement decouvert', montant: montantReclass },
          { sens: 'C' as const, compte: '565000', libelle: 'Concours bancaires courants', montant: montantReclass },
        ],
        commentaire: 'Reclassement decouverts bancaires en tresorerie-passif'
      }],
      'Art. 39 Acte Uniforme OHADA - Non-compensation')
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
      {
        comptes: inverses.slice(0, 10),
        montants: { provisionsInverses: inverses.length },
        description: `${inverses.length} comptes de provisions (29x, 39x, 49x) presentent un solde debiteur au lieu du solde crediteur attendu. Les provisions doivent etre creditrices car elles representent une depreciation (diminution de valeur) des actifs correspondants.`,
        attendu: 'Comptes de provisions (29x, 39x, 49x) a solde crediteur',
        constate: `${inverses.length} provision(s) a solde debiteur (sens inverse)`,
        impactFiscal: 'Depreciations incorrectement presentees - risque de surestimation des actifs dans les etats financiers',
      },
      'Corriger le sens des provisions. Un solde debiteur sur un compte de provision est anormal et peut indiquer une reprise excedant la dotation initiale.',
      undefined,
      'Art. 46 Acte Uniforme OHADA - Depreciations et provisions')
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
      {
        montants: { capitalSocial: montant },
        description: `Le capital social est negatif (${montant.toLocaleString('fr-FR')} FCFA), ce qui est juridiquement impossible. Cela indique une erreur de comptabilisation (debit/credit inverses) ou une confusion avec un autre compte. Le capital doit toujours etre crediteur (solde du cote du passif).`,
        attendu: 'Capital social positif (solde crediteur au passif)',
        constate: `Capital social negatif: ${montant.toLocaleString('fr-FR')} FCFA`,
        impactFiscal: 'Anomalie bloquante - un capital negatif rend la liasse fiscale incoherente et juridiquement invalide',
      },
      'Verifier le sens des ecritures sur le compte 101x. Corriger l\'inversion debit/credit si necessaire.',
      undefined,
      'Art. 311 AUSCGIE - Capital social minimum')
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
      {
        comptes: concentres,
        montants: { comptesConcentres: concentres.length, totalBilan: tb },
        description: `${concentres.length} compte(s) de bilan represente(nt) individuellement plus de 50% du total bilan (${tb.toLocaleString('fr-FR')} FCFA). Une concentration excessive sur un seul poste augmente le risque d\'erreur significative et merite une attention particuliere lors de la revision.`,
        attendu: 'Repartition equilibree des postes de bilan',
        constate: `${concentres.length} compte(s) representant individuellement plus de 50% du total bilan`,
        impactFiscal: 'Risque d\'erreur significative sur un poste majeur - attention renforcee de l\'administration fiscale',
      },
      'Verifier la repartition des postes de bilan. Une forte concentration peut etre normale (ex: immobilier pour une SCI) mais doit etre justifiee dans l\'annexe.')
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
      {
        comptes: suspects.slice(0, 10),
        montants: { montantsSuspects: suspects.length },
        description: `${suspects.length} montants se terminent par .01 ou .99 FCFA. En zone FCFA, les montants sont generalement en nombres entiers (pas de centimes). Des centimes a .01 ou .99 peuvent indiquer des erreurs d\'arrondi, des conversions de devises mal calibrees, ou des ajustements automatiques.`,
        attendu: 'Montants en nombres entiers (zone FCFA sans centimes)',
        constate: `${suspects.length} montant(s) avec centimes suspects (.01 ou .99 FCFA)`,
        impactFiscal: 'Aucun impact direct - anomalie technique liee a l\'arrondi ou a la conversion de devises',
      },
      'Verifier l\'origine de ces centimes. Arrondir les montants si necessaire, surtout en zone FCFA ou les centimes n\'ont pas cours.')
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
      {
        comptes: negatifs.slice(0, 10),
        montants: { lignesNegatives: negatifs.length },
        description: `${negatifs.length} lignes contiennent des montants negatifs dans les colonnes debit ou credit. En comptabilite en partie double, les montants sont toujours positifs - c\'est le sens (debit ou credit) qui determine la nature de l\'operation. Un montant negatif indique un export non conforme ou des extournes mal encodees.`,
        attendu: 'Montants debit et credit strictement positifs en partie double',
        constate: `${negatifs.length} ligne(s) avec montants negatifs en debit ou credit`,
        impactFiscal: 'Export non conforme - risque d\'erreur de calcul dans les etats financiers generes',
      },
      'Convertir les montants negatifs en ecritures au sens oppose (un debit negatif = un credit, et inversement). Verifier le parametre d\'export du logiciel comptable.',
      undefined,
      'Art. 19 Acte Uniforme OHADA - Enregistrement en partie double')
  }
  return ok(ref, nom, 'Aucun montant negatif')
}

// MA-004: Resultat deficitaire > 50% capital
function MA004(ctx: AuditContext): ResultatControle {
  const ref = 'MA-004', nom = 'Deficit vs capital'
  const capital = findByPrefix(ctx.balanceN, '101').reduce((s, l) => s + (l.credit - l.debit), 0)
  const resultat = findByPrefix(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  if (capital > 0 && resultat < 0 && Math.abs(resultat) > capital * 0.5) {
    const ratio = (Math.abs(resultat) / capital) * 100
    return anomalie(ref, nom, 'INFO',
      `Deficit (${resultat.toLocaleString('fr-FR')}) depasse 50% du capital (${capital.toLocaleString('fr-FR')})`,
      {
        montants: { resultat, capital, ratioPct: Math.round(ratio) },
        description: `Le deficit de l\'exercice (${resultat.toLocaleString('fr-FR')} FCFA) represente ${ratio.toFixed(0)}% du capital social (${capital.toLocaleString('fr-FR')} FCFA). Un deficit superieur a 50% du capital est un signal d\'alerte sur la continuite d\'exploitation et peut necessiter une decision en assemblee generale.`,
        attendu: 'Deficit inferieur a 50% du capital social',
        constate: `Deficit de ${resultat.toLocaleString('fr-FR')} FCFA soit ${ratio.toFixed(0)}% du capital`,
        impactFiscal: 'Signal d\'alerte sur la continuite d\'exploitation - obligation legale d\'AGE si capitaux propres < 50% du capital',
      },
      'Evaluer la situation de continuite d\'exploitation. Si les capitaux propres deviennent inferieurs a la moitie du capital, une AG extraordinaire doit statuer sur la poursuite de l\'activite.',
      undefined,
      'Art. 664 AUSCGIE - Capitaux propres inferieurs a la moitie du capital')
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
      {
        montants: { capitauxPropres },
        description: `Les capitaux propres sont negatifs (${capitauxPropres.toLocaleString('fr-FR')} FCFA), ce qui signifie que les dettes depassent les actifs nets de l\'entreprise. C\'est une situation d\'alerte majeure qui impose legalement la tenue d\'une assemblee generale extraordinaire dans les 4 mois suivant l\'approbation des comptes. Les associes doivent decider de la poursuite ou de la dissolution de la societe.`,
        attendu: 'Capitaux propres positifs (actif net superieur aux dettes)',
        constate: `Capitaux propres negatifs: ${capitauxPropres.toLocaleString('fr-FR')} FCFA`,
        impactFiscal: 'Obligation legale de convoquer une AGE sous 4 mois - risque de dissolution judiciaire si non regularise sous 2 ans',
      },
      'Convoquer une AGE pour statuer sur la poursuite de l\'activite. Si la decision est de poursuivre, regulariser les capitaux propres dans les 2 ans (augmentation de capital, abandon de creances, etc.).',
      undefined,
      'Art. 664 AUSCGIE - Obligation de regularisation sous 2 ans')
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
    const pctBilan = (Math.abs(tresoNette) / tb) * 100
    return anomalie(ref, nom, 'INFO',
      `Tresorerie nette tres negative: ${tresoNette.toLocaleString('fr-FR')} (${pctBilan.toFixed(1)}% du bilan)`,
      {
        montants: { tresoNette, tresoActif, tresoPassif, totalBilan: tb, pctBilanPct: Math.round(pctBilan) },
        description: `La tresorerie nette est negative de ${Math.abs(tresoNette).toLocaleString('fr-FR')} FCFA, soit ${pctBilan.toFixed(1)}% du total bilan. L\'entreprise est en situation de dependance bancaire elevee (concours bancaires > disponibilites). Cela peut impacter la capacite a honorer les engagements a court terme.`,
        attendu: 'Tresorerie nette positive ou faiblement negative',
        constate: `Tresorerie nette negative de ${Math.abs(tresoNette).toLocaleString('fr-FR')} FCFA (${pctBilan.toFixed(1)}% du bilan)`,
        impactFiscal: 'Aucun impact fiscal direct - situation de dependance bancaire a signaler dans l\'annexe',
      },
      'Analyser la structure de financement: verifier le fonds de roulement et le besoin en fonds de roulement. Envisager un renforcement des fonds propres ou une renagociation des lignes de credit.')
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
