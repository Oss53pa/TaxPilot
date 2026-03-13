/**
 * Service de generation des donnees d'annexe SYSCOHADA
 * Genere les donnees calculees depuis la balance pour les notes 1-39
 *
 * IMPORTANT: les numeros de notes correspondent aux onglets Excel de reference.
 * Les colonnes de chaque note DOIVENT correspondre exactement a celles definies
 * dans NOTES_DATA de NotesRestantes.tsx.
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
  tableaux?: NoteTableau[]
  details?: Record<string, Record<string, string> | string>
}

const fmt = (n: number) => n === 0 ? '' : Math.round(n).toLocaleString('fr-FR')
const fmtVar = (n: number, n1: number) => n1 === 0 ? '' : fmt(n - n1)
const fmtVarPct = (n: number, n1: number) => n1 === 0 ? '' : `${(((n - n1) / n1) * 100).toFixed(1)}%`

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

function sumDebitN1(entries: BalanceEntry[], prefixes: string[]): number {
  return entries
    .filter(e => prefixes.some(p => e.compte.startsWith(p)))
    .reduce((s, e) => s + Math.max(0, (e.solde_debit_n1 ?? 0) - (e.solde_credit_n1 ?? 0)), 0)
}

function sumCreditN1(entries: BalanceEntry[], prefixes: string[]): number {
  return entries
    .filter(e => prefixes.some(p => e.compte.startsWith(p)))
    .reduce((s, e) => s + Math.max(0, (e.solde_credit_n1 ?? 0) - (e.solde_debit_n1 ?? 0)), 0)
}

// Helper: build a 5-col debit row [label, N, N-1, var, var%]
function dRow(e: BalanceEntry[], label: string, pfx: string[]): string[] {
  const n = sumDebit(e, pfx), n1 = sumDebitN1(e, pfx)
  return [label, fmt(n), fmt(n1), fmtVar(n, n1), fmtVarPct(n, n1)]
}
// Helper: build a 5-col credit row
function cRow(e: BalanceEntry[], label: string, pfx: string[]): string[] {
  const n = sumCredit(e, pfx), n1 = sumCreditN1(e, pfx)
  return [label, fmt(n), fmt(n1), fmtVar(n, n1), fmtVarPct(n, n1)]
}
// Helper: 6-col debit row with echeance (all CT by default)
function dRow6(e: BalanceEntry[], label: string, pfx: string[]): string[] {
  const n = sumDebit(e, pfx), n1 = sumDebitN1(e, pfx)
  return [label, fmt(n), fmt(n1), fmtVar(n, n1), fmt(n), '']
}
// Helper: 6-col credit row with echeance (all CT by default)
function cRow6(e: BalanceEntry[], label: string, pfx: string[]): string[] {
  const n = sumCredit(e, pfx), n1 = sumCreditN1(e, pfx)
  return [label, fmt(n), fmt(n1), fmtVar(n, n1), fmt(n), '']
}

// ═══ Note 4: Immobilisations financieres (26x, 27x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote4(entries: BalanceEntry[]): NoteData {
  const items = [
    dRow(entries, 'Titres de participation', ['26']),
    dRow(entries, 'Autres titres immobilises', ['271', '272', '273', '274']),
    dRow(entries, 'Prets et creances non commerciales', ['276', '277']),
    dRow(entries, 'Depots et cautionnements verses', ['275']),
    dRow(entries, 'Creances rattachees a des participations', ['266', '267']),
    dRow(entries, 'Prets au personnel', ['278']),
    dRow(entries, 'Interets courus sur prets', ['279']),
  ]
  const total = sumDebit(entries, ['26', '27']), totalN1 = sumDebitN1(entries, ['26', '27'])
  items.push(['TOTAL', fmt(total), fmt(totalN1), fmtVar(total, totalN1), fmtVarPct(total, totalN1)])
  return {
    titre: 'Immobilisations financieres',
    tableau: {
      titre: 'Detail des immobilisations financieres',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: items
    }
  }
}

// ═══ Note 7: Clients (41x) ═══
function generateNote7(entries: BalanceEntry[]): NoteData {
  const prov = sumCredit(entries, ['491']), provN1 = sumCreditN1(entries, ['491'])
  const totalBrut = sumDebit(entries, ['411', '412', '413', '416']), totalBrutN1 = sumDebitN1(entries, ['411', '412', '413', '416'])
  const totalNet = totalBrut - prov, totalNetN1 = totalBrutN1 - provN1
  return {
    titre: 'Clients',
    tableau: {
      titre: 'Creances clients et comptes rattaches',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        dRow(entries, 'Clients — ventes de biens', ['411']),
        dRow(entries, 'Clients — prestations de services', ['412']),
        dRow(entries, 'Clients — effets a recevoir', ['413']),
        dRow(entries, 'Clients douteux ou litigieux', ['416']),
        ['Provisions pour depreciation des clients', fmt(-prov), fmt(-provN1), fmtVar(-prov, -provN1), ''],
        ['TOTAL NET', fmt(totalNet), fmt(totalNetN1), fmtVar(totalNet, totalNetN1), fmtVarPct(totalNet, totalNetN1)],
      ]
    }
  }
}

// ═══ Note 8: Autres creances (42x-47x) ═══
function generateNote8(entries: BalanceEntry[]): NoteData {
  const total = sumDebit(entries, ['409', '42', '43', '44', '47', '476'])
  const totalN1 = sumDebitN1(entries, ['409', '42', '43', '44', '47', '476'])
  return {
    titre: 'Autres creances',
    tableau: {
      titre: 'Detail des autres creances',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Echeance < 1 an', 'Echeance > 1 an'],
      lignes: [
        dRow6(entries, 'Fournisseurs, avances versees', ['409']),
        dRow6(entries, 'Personnel', ['42']),
        dRow6(entries, 'Organismes sociaux', ['43']),
        dRow6(entries, 'Etat et collectivites', ['44']),
        dRow6(entries, 'Debiteurs divers', ['47']),
        dRow6(entries, 'Charges constatees d\'avance', ['476']),
        ['TOTAL', fmt(total), fmt(totalN1), fmtVar(total, totalN1), fmt(total), ''],
      ]
    }
  }
}

// ═══ Note 9: Titres de placement (50x) ═══
function generateNote9(entries: BalanceEntry[]): NoteData {
  const prov = sumCredit(entries, ['590']), provN1 = sumCreditN1(entries, ['590'])
  const totalBrut = sumDebit(entries, ['501', '502', '503', '504', '505', '506', '507', '508'])
  const totalBrutN1 = sumDebitN1(entries, ['501', '502', '503', '504', '505', '506', '507', '508'])
  const net = totalBrut - prov, netN1 = totalBrutN1 - provN1
  return {
    titre: 'Titres de placement',
    tableau: {
      titre: 'Titres de placement et valeurs mobilieres',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        dRow(entries, 'Actions cotees', ['501']),
        dRow(entries, 'Actions non cotees', ['502']),
        dRow(entries, 'Obligations et bons', ['503', '504', '505', '506']),
        dRow(entries, 'Depots a terme', ['507', '508']),
        ['Provisions pour depreciation des titres', fmt(-prov), fmt(-provN1), fmtVar(-prov, -provN1), ''],
        ['TOTAL NET', fmt(net), fmt(netN1), fmtVar(net, netN1), fmtVarPct(net, netN1)],
      ]
    }
  }
}

// ═══ Note 11: Disponibilites (51x-58x) ═══
function generateNote11(entries: BalanceEntry[]): NoteData {
  const total = sumDebit(entries, ['521', '522', '523', '524', '525', '526', '527', '57', '54', '58'])
  const totalN1 = sumDebitN1(entries, ['521', '522', '523', '524', '525', '526', '527', '57', '54', '58'])
  return {
    titre: 'Disponibilites',
    tableau: {
      titre: 'Detail des disponibilites',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        dRow(entries, 'Banques en monnaie nationale', ['521']),
        dRow(entries, 'Banques en devises', ['522', '523', '524', '525', '526', '527']),
        dRow(entries, 'Caisse', ['57']),
        dRow(entries, 'Regies d\'avances', ['54']),
        dRow(entries, 'Virements de fonds', ['58']),
        ['TOTAL', fmt(total), fmt(totalN1), fmtVar(total, totalN1), fmtVarPct(total, totalN1)],
      ]
    }
  }
}

// ═══ Note 13: Capital (10x) ═══
function generateNote13(entries: BalanceEntry[]): NoteData {
  const cs = sumCredit(entries, ['101']), csN1 = sumCreditN1(entries, ['101'])
  const cna = sumDebit(entries, ['109']), cnaN1 = sumDebitN1(entries, ['109'])
  const canv = sumDebit(entries, ['1011']), canvN1 = sumDebitN1(entries, ['1011'])
  const total = cs - cna - canv, totalN1 = csN1 - cnaN1 - canvN1
  return {
    titre: 'Capital',
    tableau: {
      titre: 'Capital social et actionnaires',
      colonnes: ['Elements', 'Montant N', 'Montant N-1', 'Variation'],
      lignes: [
        ['Capital social', fmt(cs), fmt(csN1), fmtVar(cs, csN1)],
        ['Actionnaires, capital souscrit non appele', fmt(cna), fmt(cnaN1), fmtVar(cna, cnaN1)],
        ['Actionnaires, capital souscrit appele non verse', fmt(canv), fmt(canvN1), fmtVar(canv, canvN1)],
        ['TOTAL', fmt(total), fmt(totalN1), fmtVar(total, totalN1)],
      ]
    }
  }
}

// ═══ Note 14: Primes et reserves (105x, 11x, 12x, 13x) ═══
function generateNote14(entries: BalanceEntry[]): NoteData {
  const rn = sumCredit(entries, ['12']) - sumDebit(entries, ['12'])
  const rnN1 = sumCreditN1(entries, ['12']) - sumDebitN1(entries, ['12'])
  const res = sumCredit(entries, ['13']) - sumDebit(entries, ['13'])
  const resN1 = sumCreditN1(entries, ['13']) - sumDebitN1(entries, ['13'])
  return {
    titre: 'Primes et reserves',
    tableau: {
      titre: 'Detail des primes et reserves',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        cRow(entries, 'Primes d\'emission', ['1051']),
        cRow(entries, 'Primes d\'apport', ['1052', '1053', '1054']),
        cRow(entries, 'Reserve legale', ['111']),
        cRow(entries, 'Reserves statutaires', ['112']),
        cRow(entries, 'Reserves facultatives', ['118']),
        cRow(entries, 'Reserves reglementees', ['113', '114', '115', '116', '117']),
        ['Report a nouveau', fmt(rn), fmt(rnN1), fmtVar(rn, rnN1), fmtVarPct(rn, rnN1)],
        ['Resultat net de l\'exercice', fmt(res), fmt(resN1), fmtVar(res, resN1), fmtVarPct(res, resN1)],
        (() => {
          const t = sumCredit(entries, ['1051', '1052', '1053', '1054', '111', '112', '118', '113', '114', '115', '116', '117']) + rn + res
          const tN1 = sumCreditN1(entries, ['1051', '1052', '1053', '1054', '111', '112', '118', '113', '114', '115', '116', '117']) + rnN1 + resN1
          return ['TOTAL', fmt(t), fmt(tN1), fmtVar(t, tN1), fmtVarPct(t, tN1)]
        })(),
      ]
    }
  }
}

// ═══ Note 17: Fournisseurs d'exploitation (40x) ═══
function generateNote17(entries: BalanceEntry[]): NoteData {
  const total = sumCredit(entries, ['401', '402', '408', '404', '4017'])
  const totalN1 = sumCreditN1(entries, ['401', '402', '408', '404', '4017'])
  return {
    titre: 'Fournisseurs d\'exploitation',
    tableau: {
      titre: 'Detail des dettes fournisseurs',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Echeance < 1 an', 'Echeance > 1 an'],
      lignes: [
        cRow6(entries, 'Fournisseurs, dettes en compte', ['401']),
        cRow6(entries, 'Fournisseurs, effets a payer', ['402']),
        cRow6(entries, 'Fournisseurs, factures non parvenues', ['408']),
        cRow6(entries, 'Fournisseurs d\'investissements', ['404']),
        cRow6(entries, 'Fournisseurs, retenues de garantie', ['4017']),
        ['TOTAL', fmt(total), fmt(totalN1), fmtVar(total, totalN1), fmt(total), ''],
      ]
    }
  }
}

// ═══ Note 18: Dettes fiscales et sociales (43x, 44x) ═══
function generateNote18(entries: BalanceEntry[]): NoteData {
  const total = sumCredit(entries, ['422', '43', '441', '443', '4441', '442', '445', '446', '447', '448', '449', '4491', '4492', '4499'])
  const totalN1 = sumCreditN1(entries, ['422', '43', '441', '443', '4441', '442', '445', '446', '447', '448', '449', '4491', '4492', '4499'])
  return {
    titre: 'Dettes fiscales et sociales',
    tableau: {
      titre: 'Dettes fiscales et sociales',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        cRow(entries, 'Personnel — remunerations dues', ['422']),
        cRow(entries, 'Organismes sociaux', ['43']),
        cRow(entries, 'Etat — impots sur les benefices', ['441']),
        cRow(entries, 'Etat — TVA due', ['443', '4441']),
        cRow(entries, 'Etat — autres impots et taxes', ['442', '445', '446', '447', '448', '449']),
        cRow(entries, 'Autres dettes fiscales', ['4491', '4492', '4499']),
        ['TOTAL', fmt(total), fmt(totalN1), fmtVar(total, totalN1), fmtVarPct(total, totalN1)],
      ]
    }
  }
}

// ═══ Note 19: Autres dettes et provisions pour risques (19x, 47x) ═══
function generateNote19(entries: BalanceEntry[]): NoteData {
  const provR = sumCredit(entries, ['151', '152', '153', '155', '156', '157', '158'])
  const provRN1 = sumCreditN1(entries, ['151', '152', '153', '155', '156', '157', '158'])
  const provC = sumCredit(entries, ['19']), provCN1 = sumCreditN1(entries, ['19'])
  const total = sumCredit(entries, ['441', '442', '443', '444', '445', '43', '477', '47']) + provR + provC
  const totalN1 = sumCreditN1(entries, ['441', '442', '443', '444', '445', '43', '477', '47']) + provRN1 + provCN1
  return {
    titre: 'Autres dettes et provisions pour risques et charges',
    tableau: {
      titre: 'Detail des autres dettes et provisions pour risques',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Echeance < 1 an', 'Echeance > 1 an'],
      lignes: [
        cRow6(entries, 'Dettes fiscales courantes', ['441', '442', '443', '444', '445']),
        cRow6(entries, 'Dettes sociales courantes', ['43']),
        cRow6(entries, 'Produits constates d\'avance', ['477']),
        cRow6(entries, 'Crediteurs divers', ['47']),
        ['Provisions pour risques', fmt(provR), fmt(provRN1), fmtVar(provR, provRN1), '', fmt(provR)],
        ['Provisions pour charges', fmt(provC), fmt(provCN1), fmtVar(provC, provCN1), '', fmt(provC)],
        ['TOTAL', fmt(total), fmt(totalN1), fmtVar(total, totalN1), '', ''],
      ]
    }
  }
}

// ═══ Note 20: Banques, credit d'escompte et de tresorerie (52x credit, 56x) ═══
function generateNote20(entries: BalanceEntry[]): NoteData {
  const total = sumCredit(entries, ['52', '56', '55'])
  const totalN1 = sumCreditN1(entries, ['52', '56', '55'])
  return {
    titre: 'Banques, credit d\'escompte et de tresorerie',
    tableau: {
      titre: 'Tresorerie passive',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        cRow(entries, 'Banques — soldes crediteurs', ['52']),
        cRow(entries, 'Credits d\'escompte', ['56']),
        cRow(entries, 'Credits de tresorerie', ['55']),
        cRow(entries, 'Decouverts bancaires', ['521']),
        ['TOTAL', fmt(total), fmt(totalN1), fmtVar(total, totalN1), fmtVarPct(total, totalN1)],
      ]
    }
  }
}

// ═══ Note 21: Chiffre d'affaires et autres produits (70x-75x) ═══
function generateNote21(entries: BalanceEntry[]): NoteData {
  const total = sumCredit(entries, ['701', '702', '703', '704', '705', '706', '707', '71', '75'])
  const totalN1 = sumCreditN1(entries, ['701', '702', '703', '704', '705', '706', '707', '71', '75'])
  return {
    titre: 'Chiffre d\'affaires et autres produits',
    tableau: {
      titre: 'Chiffre d\'affaires et autres produits',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        cRow(entries, 'Ventes de marchandises', ['701']),
        cRow(entries, 'Ventes de produits fabriques', ['702', '703']),
        cRow(entries, 'Travaux et services vendus', ['704', '705', '706']),
        cRow(entries, 'Produits accessoires', ['707']),
        cRow(entries, 'Subventions d\'exploitation', ['71']),
        cRow(entries, 'Autres produits', ['75']),
        ['TOTAL', fmt(total), fmt(totalN1), fmtVar(total, totalN1), fmtVarPct(total, totalN1)],
      ]
    }
  }
}

// ═══ Note 22: Achats (60x, 61x) ═══
function generateNote22(entries: BalanceEntry[]): NoteData {
  const total = sumDebit(entries, ['601', '602', '604', '605', '606', '608', '603'])
  const totalN1 = sumDebitN1(entries, ['601', '602', '604', '605', '606', '608', '603'])
  return {
    titre: 'Achats',
    tableau: {
      titre: 'Achats de l\'exercice',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        dRow(entries, 'Achats de marchandises', ['601']),
        dRow(entries, 'Achats de matieres premieres', ['602']),
        dRow(entries, 'Achats de fournitures liees', ['604', '605', '606']),
        dRow(entries, 'Achats d\'emballages', ['608']),
        dRow(entries, 'Variation de stocks', ['603']),
        ['TOTAL', fmt(total), fmt(totalN1), fmtVar(total, totalN1), fmtVarPct(total, totalN1)],
      ]
    }
  }
}

// ═══ Note 28: Dotations et charges pour provisions (68x, 69x, 79x) ═══
function generateNote28(entries: BalanceEntry[]): NoteData {
  const d1 = sumDebit(entries, ['681']), d1N1 = sumDebitN1(entries, ['681'])
  const d2 = sumDebit(entries, ['691']), d2N1 = sumDebitN1(entries, ['691'])
  const d3 = sumDebit(entries, ['6817', '6818', '697']), d3N1 = sumDebitN1(entries, ['6817', '6818', '697'])
  const r1 = sumCredit(entries, ['791', '797']), r1N1 = sumCreditN1(entries, ['791', '797'])
  const r2 = sumCredit(entries, ['7817', '7818']), r2N1 = sumCreditN1(entries, ['7817', '7818'])
  const net = d1 + d2 + d3 - r1 - r2, netN1 = d1N1 + d2N1 + d3N1 - r1N1 - r2N1
  return {
    titre: 'Dotations et charges pour provisions et depreciations',
    tableau: {
      titre: 'Dotations aux amortissements, depreciations et provisions',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        dRow(entries, 'Dotations aux amortissements d\'exploitation', ['681']),
        dRow(entries, 'Dotations aux provisions d\'exploitation', ['691']),
        dRow(entries, 'Dotations aux depreciations', ['6817', '6818', '697']),
        cRow(entries, 'Reprises de provisions', ['791', '797']),
        cRow(entries, 'Reprises de depreciations', ['7817', '7818']),
        ['TOTAL NET', fmt(net), fmt(netN1), fmtVar(net, netN1), fmtVarPct(net, netN1)],
      ]
    }
  }
}

// ═══ Note 29: Charges et revenus financiers (67x, 77x, 79x) ═══
function generateNote29(entries: BalanceEntry[]): NoteData {
  const totalProd = sumCredit(entries, ['771', '772', '773', '774', '775', '776', '797'])
  const totalProdN1 = sumCreditN1(entries, ['771', '772', '773', '774', '775', '776', '797'])
  const totalCh = sumDebit(entries, ['671', '672', '676', '697'])
  const totalChN1 = sumDebitN1(entries, ['671', '672', '676', '697'])
  const rf = totalProd - totalCh, rfN1 = totalProdN1 - totalChN1
  return {
    titre: 'Charges et revenus financiers',
    tableau: {
      titre: 'Resultat financier',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['PRODUITS FINANCIERS:', '', '', '', ''],
        cRow(entries, 'Revenus des titres de participation', ['771', '772']),
        cRow(entries, 'Interets et produits assimiles', ['773', '774', '775', '776']),
        cRow(entries, 'Gains de change', ['776']),
        cRow(entries, 'Reprises de provisions financieres', ['797']),
        ['Total produits financiers', fmt(totalProd), fmt(totalProdN1), fmtVar(totalProd, totalProdN1), fmtVarPct(totalProd, totalProdN1)],
        ['CHARGES FINANCIERES:', '', '', '', ''],
        dRow(entries, 'Interets et charges assimilees', ['671', '672']),
        dRow(entries, 'Pertes de change', ['676']),
        dRow(entries, 'Dotations provisions financieres', ['697']),
        ['Total charges financieres', fmt(totalCh), fmt(totalChN1), fmtVar(totalCh, totalChN1), fmtVarPct(totalCh, totalChN1)],
        ['RESULTAT FINANCIER', fmt(rf), fmt(rfN1), fmtVar(rf, rfN1), fmtVarPct(rf, rfN1)],
      ]
    }
  }
}

// ═══ Note 31: Repartition du resultat (12x, 13x) ═══
// Colonnes: ['Elements', 'Montant']
function generateNote31(entries: BalanceEntry[]): NoteData {
  const resultatNet = sumCredit(entries, ['13']) - sumDebit(entries, ['13'])
  const reportAN = sumCredit(entries, ['12']) - sumDebit(entries, ['12'])
  const totalAffecter = resultatNet + reportAN
  const reserveLegale = Math.round(resultatNet * 0.05)
  return {
    titre: 'Repartition du resultat et autres elements caracteristiques',
    tableau: {
      titre: 'Proposition d\'affectation du resultat',
      colonnes: ['Elements', 'Montant'],
      lignes: [
        ['Resultat net de l\'exercice', fmt(resultatNet)],
        ['Report a nouveau anterieur', fmt(reportAN)],
        ['TOTAL A AFFECTER', fmt(totalAffecter)],
        ['Reserve legale (5%)', fmt(reserveLegale)],
        ['Autres reserves', ''],
        ['Dividendes', ''],
        ['Report a nouveau', fmt(totalAffecter - reserveLegale)],
      ]
    }
  }
}

// ═══ Note 37: Determination impots sur le resultat ═══
// Colonnes: ['Elements', 'Montant']
function generateNote37(entries: BalanceEntry[]): NoteData {
  const produits = sumCredit(entries, ['70', '71', '72', '73', '74', '75', '77', '78', '79', '82', '84', '86', '88'])
  const charges = sumDebit(entries, ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '81', '83', '85', '87', '89'])
  const resultatComptable = produits - charges
  // Reintegrations et deductions simplifiees
  const reintegrations = sumDebit(entries, ['671']) // interets excessifs
  const deductions = sumCredit(entries, ['771']) // revenus non imposables
  const resultatFiscal = resultatComptable + reintegrations - deductions
  const is25 = Math.round(Math.max(0, resultatFiscal) * 0.25)
  const ca = sumCredit(entries, ['70'])
  const imf = Math.round(ca * 0.01) // IMF 1% du CA (base = comptes 70x uniquement)
  const impotDu = Math.max(is25, imf)
  return {
    titre: 'Determination impots sur le resultat',
    tableau: {
      titre: 'Calcul de l\'impot sur le resultat',
      colonnes: ['Elements', 'Montant'],
      lignes: [
        ['Resultat comptable avant impot', fmt(resultatComptable)],
        ['Reintegrations fiscales', fmt(reintegrations)],
        ['Deductions fiscales', fmt(deductions)],
        ['Resultat fiscal', fmt(resultatFiscal)],
        ['Impot sur les societes (25%)', fmt(is25)],
        ['Impot minimum forfaitaire', fmt(imf)],
        ['Impot du', fmt(impotDu)],
      ]
    }
  }
}

/**
 * Genere les donnees d'annexe depuis la balance importee.
 * Les numeros de notes correspondent aux onglets Excel SYSCOHADA de reference.
 */
export function generateAnnexeData(entries: BalanceEntry[]): Record<number, NoteData> {
  if (!entries || entries.length === 0) return {}
  return {
    4: generateNote4(entries),
    7: generateNote7(entries),
    8: generateNote8(entries),
    9: generateNote9(entries),
    11: generateNote11(entries),
    13: generateNote13(entries),
    14: generateNote14(entries),
    17: generateNote17(entries),
    18: generateNote18(entries),
    19: generateNote19(entries),
    20: generateNote20(entries),
    21: generateNote21(entries),
    22: generateNote22(entries),
    28: generateNote28(entries),
    29: generateNote29(entries),
    31: generateNote31(entries),
    37: generateNote37(entries),
  }
}
