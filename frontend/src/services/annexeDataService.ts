/**
 * Service de génération des données d'annexe SYSCOHADA
 * Extrait les données des 12 notes clés depuis la balance importée
 */

import type { BalanceEntry } from './liasseDataService'

interface NoteTableau {
  titre: string
  colonnes: string[]
  lignes: string[][]
}

interface NoteData {
  titre: string
  alerteInfo?: string
  tableau?: NoteTableau
  details?: Record<string, Record<string, string> | string>
}

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')

function sumDebit(entries: BalanceEntry[], prefixes: string[]): number {
  return entries
    .filter(e => prefixes.some(p => e.compte.startsWith(p)))
    .reduce((s, e) => s + Math.max(0, (e.solde_debit || e.debit || 0) - (e.solde_credit || e.credit || 0)), 0)
}

function sumCredit(entries: BalanceEntry[], prefixes: string[]): number {
  return entries
    .filter(e => prefixes.some(p => e.compte.startsWith(p)))
    .reduce((s, e) => s + Math.max(0, (e.solde_credit || e.credit || 0) - (e.solde_debit || e.debit || 0)), 0)
}

function getAccounts(entries: BalanceEntry[], prefixes: string[]): BalanceEntry[] {
  return entries.filter(e => prefixes.some(p => e.compte.startsWith(p)))
}

// Note 4: Immobilisations financières (26x, 27x)
function generateNote4(entries: BalanceEntry[]): NoteData {
  const titresParticipation = sumDebit(entries, ['26'])
  const autresTitres = sumDebit(entries, ['271', '272', '273', '274', '275'])
  const prets = sumDebit(entries, ['276', '277'])
  const depots = sumDebit(entries, ['275'])
  const provisions = sumCredit(entries, ['296', '297'])
  const total = titresParticipation + autresTitres + prets + depots
  return {
    titre: 'Immobilisations financieres',
    alerteInfo: 'Montants extraits automatiquement de la balance importee (comptes 26x, 27x).',
    tableau: {
      titre: 'Detail des immobilisations financieres',
      colonnes: ['Nature', 'Valeur brute', 'Provisions', 'Valeur nette'],
      lignes: [
        ['Titres de participation (26)', fmt(titresParticipation), fmt(provisions), fmt(titresParticipation - provisions)],
        ['Autres titres immobilises (271-274)', fmt(autresTitres), '0', fmt(autresTitres)],
        ['Prets et creances (276-277)', fmt(prets), '0', fmt(prets)],
        ['Depots et cautionnements (275)', fmt(depots), '0', fmt(depots)],
        ['TOTAL', fmt(total), fmt(provisions), fmt(total - provisions)],
      ]
    }
  }
}

// Note 7: Autres créances (41x, 42x, 46x, 47x)
function generateNote7(entries: BalanceEntry[]): NoteData {
  const clients = sumDebit(entries, ['41'])
  const personnel = sumDebit(entries, ['42'])
  const etat = sumDebit(entries, ['44'])
  const organismeSociaux = sumDebit(entries, ['43'])
  const associes = sumDebit(entries, ['46'])
  const divers = sumDebit(entries, ['47'])
  const total = clients + personnel + etat + organismeSociaux + associes + divers
  return {
    titre: 'Autres creances',
    alerteInfo: 'Montants extraits de la balance importee (comptes 41x a 47x).',
    tableau: {
      titre: 'Detail des creances',
      colonnes: ['Nature', 'Montant N', 'Echeance'],
      lignes: [
        ['Clients et comptes rattaches (41)', fmt(clients), '< 1 an'],
        ['Personnel (42)', fmt(personnel), '< 1 an'],
        ['Organismes sociaux (43)', fmt(organismeSociaux), '< 1 an'],
        ['Etat et collectivites (44)', fmt(etat), '< 1 an'],
        ['Associes et groupe (46)', fmt(associes), 'Variable'],
        ['Debiteurs divers (47)', fmt(divers), 'Variable'],
        ['TOTAL', fmt(total), ''],
      ]
    }
  }
}

// Note 9: Capitaux propres (10x, 11x, 12x, 13x)
function generateNote9(entries: BalanceEntry[]): NoteData {
  const capital = sumCredit(entries, ['10'])
  const reserves = sumCredit(entries, ['11'])
  const reportNouveau = sumCredit(entries, ['12'])
  const resultat = sumCredit(entries, ['13'])
  const total = capital + reserves + reportNouveau + resultat
  return {
    titre: 'Capitaux propres - Mouvement',
    alerteInfo: 'Extrait de la balance importee (comptes 10x a 13x).',
    tableau: {
      titre: 'Tableau de variation des capitaux propres',
      colonnes: ['Element', 'Solde N'],
      lignes: [
        ['Capital social (10)', fmt(capital)],
        ['Reserves (11)', fmt(reserves)],
        ['Report a nouveau (12)', fmt(reportNouveau)],
        ['Resultat de l\'exercice (13)', fmt(resultat)],
        ['TOTAL CAPITAUX PROPRES', fmt(total)],
      ]
    }
  }
}

// Note 10: Provisions pour risques et charges (15x, 19x)
function generateNote10(entries: BalanceEntry[]): NoteData {
  const provisionsRisques = sumCredit(entries, ['151', '152', '153', '155', '156', '157', '158'])
  const provisionsCharges = sumCredit(entries, ['19'])
  const dotations = sumDebit(entries, ['691', '697'])
  const reprises = sumCredit(entries, ['791', '797'])
  return {
    titre: 'Provisions pour risques et charges',
    alerteInfo: 'Extrait de la balance (comptes 15x, 19x, 691, 697, 791, 797).',
    tableau: {
      titre: 'Etat des provisions pour risques et charges',
      colonnes: ['Nature', 'Debut N', 'Dotations', 'Reprises', 'Fin N'],
      lignes: [
        ['Provisions pour risques (15)', fmt(provisionsRisques), fmt(dotations), fmt(reprises), fmt(provisionsRisques + dotations - reprises)],
        ['Provisions pour charges (19)', fmt(provisionsCharges), '0', '0', fmt(provisionsCharges)],
        ['TOTAL', fmt(provisionsRisques + provisionsCharges), fmt(dotations), fmt(reprises), fmt(provisionsRisques + provisionsCharges + dotations - reprises)],
      ]
    }
  }
}

// Note 13: Dettes fiscales et sociales (43x, 44x, 45x)
function generateNote13(entries: BalanceEntry[]): NoteData {
  const orgSociaux = sumCredit(entries, ['43'])
  const etat = sumCredit(entries, ['44'])
  const orgInternationaux = sumCredit(entries, ['45'])
  const total = orgSociaux + etat + orgInternationaux
  return {
    titre: 'Dettes fiscales et sociales',
    alerteInfo: 'Extrait de la balance (comptes 43x, 44x, 45x).',
    tableau: {
      titre: 'Detail des dettes fiscales et sociales',
      colonnes: ['Nature', 'Montant N', 'Echeance'],
      lignes: [
        ['Organismes sociaux (43)', fmt(orgSociaux), '< 1 an'],
        ['Etat et collectivites (44)', fmt(etat), '< 1 an'],
        ['Organismes internationaux (45)', fmt(orgInternationaux), '< 1 an'],
        ['TOTAL', fmt(total), ''],
      ]
    }
  }
}

// Note 16: Affectation du résultat
function generateNote16(entries: BalanceEntry[]): NoteData {
  const resultatN = sumCredit(entries, ['13'])
  const reportAN = sumCredit(entries, ['12'])
  return {
    titre: 'Affectation du resultat',
    alerteInfo: 'Base calculee depuis la balance (comptes 12x, 13x).',
    tableau: {
      titre: 'Projet d\'affectation du resultat',
      colonnes: ['Element', 'Montant'],
      lignes: [
        ['Resultat de l\'exercice (13)', fmt(resultatN)],
        ['Report a nouveau anterieur (12)', fmt(reportAN)],
        ['Montant a affecter', fmt(resultatN + reportAN)],
      ]
    }
  }
}

// Note 18: Capacité d'autofinancement (CAF)
function generateNote18(entries: BalanceEntry[]): NoteData {
  const produits = sumCredit(entries, ['70', '71', '72', '73', '75'])
  const charges = sumDebit(entries, ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '81', '83', '85', '87', '89'])
  const resultatNet = produits - charges
  const dotations = sumDebit(entries, ['681', '687', '691', '697'])
  const reprises = sumCredit(entries, ['791', '797', '798', '799', '787'])
  const plusValues = sumCredit(entries, ['82'])
  const moinsValues = sumDebit(entries, ['81'])
  const caf = resultatNet + dotations - reprises - plusValues + moinsValues
  return {
    titre: 'Capacite d\'autofinancement (CAF)',
    alerteInfo: 'CAF calculee depuis la balance importee.',
    tableau: {
      titre: 'Determination de la CAF',
      colonnes: ['Element', 'Montant'],
      lignes: [
        ['Resultat net de l\'exercice', fmt(resultatNet)],
        ['(+) Dotations aux amortissements et provisions', fmt(dotations)],
        ['(-) Reprises sur amortissements et provisions', fmt(reprises)],
        ['(-) Plus-values de cession', fmt(plusValues)],
        ['(+) Moins-values de cession', fmt(moinsValues)],
        ['CAPACITE D\'AUTOFINANCEMENT', fmt(caf)],
      ]
    }
  }
}

// Note 20: État des amortissements (28x)
function generateNote20(entries: BalanceEntry[]): NoteData {
  const amortImmoIncorp = sumCredit(entries, ['280', '2801', '2802', '2803', '2804', '2805', '2806', '2807', '2808'])
  const amortTerrains = sumCredit(entries, ['2821', '2822'])
  const amortConstructions = sumCredit(entries, ['2831'])
  const amortMatEquip = sumCredit(entries, ['284'])
  const amortTransport = sumCredit(entries, ['2845'])
  const amortMobilier = sumCredit(entries, ['2846'])
  const dotationsExercice = sumDebit(entries, ['681', '6811', '6812', '6813', '6814', '6815', '6816', '6817', '6818'])
  const total = amortImmoIncorp + amortTerrains + amortConstructions + amortMatEquip + amortTransport + amortMobilier
  return {
    titre: 'Etat des amortissements',
    alerteInfo: 'Amortissements cumules extraits de la balance (comptes 28x).',
    tableau: {
      titre: 'Tableau des amortissements',
      colonnes: ['Nature', 'Cumul debut N', 'Dotations N', 'Cumul fin N'],
      lignes: [
        ['Immobilisations incorporelles (280)', fmt(amortImmoIncorp), '-', fmt(amortImmoIncorp)],
        ['Terrains (282)', fmt(amortTerrains), '-', fmt(amortTerrains)],
        ['Constructions (283)', fmt(amortConstructions), '-', fmt(amortConstructions)],
        ['Materiel et equipement (284)', fmt(amortMatEquip), '-', fmt(amortMatEquip)],
        ['Materiel de transport (2845)', fmt(amortTransport), '-', fmt(amortTransport)],
        ['Mobilier et materiel de bureau (2846)', fmt(amortMobilier), '-', fmt(amortMobilier)],
        ['TOTAL', fmt(total), fmt(dotationsExercice), fmt(total)],
      ]
    }
  }
}

// Note 21: Plus et moins-values de cession (81x, 82x)
function generateNote21(entries: BalanceEntry[]): NoteData {
  const vncCessions = sumDebit(entries, ['81'])
  const produitsCessions = sumCredit(entries, ['82'])
  const plusValue = Math.max(0, produitsCessions - vncCessions)
  const moinsValue = Math.max(0, vncCessions - produitsCessions)
  return {
    titre: 'Plus et moins-values de cession',
    alerteInfo: 'Calcule depuis les comptes 81x (VNC) et 82x (produits de cession).',
    tableau: {
      titre: 'Detail des cessions d\'immobilisations',
      colonnes: ['Element', 'Montant'],
      lignes: [
        ['Produits de cession (82)', fmt(produitsCessions)],
        ['Valeur comptable nette (81)', fmt(vncCessions)],
        ['Plus-values', fmt(plusValue)],
        ['Moins-values', fmt(moinsValue)],
        ['RESULTAT NET DE CESSION', fmt(produitsCessions - vncCessions)],
      ]
    }
  }
}

// Note 22: État des provisions (29x, 39x, 49x)
function generateNote22(entries: BalanceEntry[]): NoteData {
  const provImmo = sumCredit(entries, ['29'])
  const provStocks = sumCredit(entries, ['39'])
  const provCreances = sumCredit(entries, ['49'])
  const dotationsExploit = sumDebit(entries, ['6817', '6818'])
  const reprisesExploit = sumCredit(entries, ['7817', '7818'])
  const total = provImmo + provStocks + provCreances
  return {
    titre: 'Etat des provisions pour depreciation',
    alerteInfo: 'Provisions extraites de la balance (comptes 29x, 39x, 49x).',
    tableau: {
      titre: 'Tableau des provisions pour depreciation',
      colonnes: ['Nature', 'Montant debut N', 'Dotations', 'Reprises', 'Montant fin N'],
      lignes: [
        ['Depreciation immobilisations (29)', fmt(provImmo), fmt(dotationsExploit), fmt(reprisesExploit), fmt(provImmo)],
        ['Depreciation stocks (39)', fmt(provStocks), '0', '0', fmt(provStocks)],
        ['Depreciation creances (49)', fmt(provCreances), '0', '0', fmt(provCreances)],
        ['TOTAL', fmt(total), fmt(dotationsExploit), fmt(reprisesExploit), fmt(total)],
      ]
    }
  }
}

// Note 24: Échéancier créances/dettes
function generateNote24(entries: BalanceEntry[]): NoteData {
  const creancesCourt = sumDebit(entries, ['41', '42', '43', '44', '45', '46', '47'])
  const dettesCourt = sumCredit(entries, ['40', '42', '43', '44', '45', '46', '47'])
  const dettesLong = sumCredit(entries, ['16', '17'])
  return {
    titre: 'Echeancier des creances et dettes',
    alerteInfo: 'Extrait de la balance (comptes de classe 4 et 1).',
    tableau: {
      titre: 'Echeancier des creances et dettes',
      colonnes: ['Nature', 'Total', '< 1 an', '> 1 an'],
      lignes: [
        ['Creances:', '', '', ''],
        ['  Creances d\'exploitation (41-47)', fmt(creancesCourt), fmt(creancesCourt), '0'],
        ['Total creances', fmt(creancesCourt), fmt(creancesCourt), '0'],
        ['Dettes:', '', '', ''],
        ['  Dettes d\'exploitation (40-47)', fmt(dettesCourt), fmt(dettesCourt), '0'],
        ['  Dettes financieres (16-17)', fmt(dettesLong), '0', fmt(dettesLong)],
        ['Total dettes', fmt(dettesCourt + dettesLong), fmt(dettesCourt), fmt(dettesLong)],
      ]
    }
  }
}

// Note 27: Capital social (101, 102, 103, 104, 105)
function generateNote27(entries: BalanceEntry[]): NoteData {
  const capitalSocial = sumCredit(entries, ['101'])
  const capitalNonAppele = sumDebit(entries, ['109'])
  const primes = sumCredit(entries, ['105'])
  const accounts = getAccounts(entries, ['101', '102', '103', '104', '105'])
  const details: Record<string, string> = {}
  accounts.forEach(a => {
    details[`${a.compte} - ${a.intitule}`] = fmt(a.solde_credit || a.credit || 0)
  })
  return {
    titre: 'Composition du capital social',
    alerteInfo: 'Extrait de la balance (comptes 10x).',
    tableau: {
      titre: 'Composition du capital social',
      colonnes: ['Element', 'Montant'],
      lignes: [
        ['Capital social souscrit (101)', fmt(capitalSocial)],
        ['Capital non appele (109)', fmt(capitalNonAppele)],
        ['Primes d\'emission (105)', fmt(primes)],
        ['CAPITAL LIBERE', fmt(capitalSocial - capitalNonAppele)],
      ]
    },
    details: Object.keys(details).length > 0 ? { 'Detail des comptes de capital': details } : undefined
  }
}

/**
 * Génère les données d'annexe depuis la balance importée
 * Retourne un Record<number, NoteData> pour les 12 notes clés
 */
export function generateAnnexeData(entries: BalanceEntry[]): Record<number, NoteData> {
  if (!entries || entries.length === 0) return {}
  return {
    4: generateNote4(entries),
    7: generateNote7(entries),
    9: generateNote9(entries),
    10: generateNote10(entries),
    13: generateNote13(entries),
    16: generateNote16(entries),
    18: generateNote18(entries),
    20: generateNote20(entries),
    21: generateNote21(entries),
    22: generateNote22(entries),
    24: generateNote24(entries),
    27: generateNote27(entries),
  }
}
