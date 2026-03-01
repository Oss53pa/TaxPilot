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

// ═══ Note 4: Immobilisations financieres (26x, 27x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote4(entries: BalanceEntry[]): NoteData {
  const titresPartic = sumDebit(entries, ['26'])
  const autresTitres = sumDebit(entries, ['271', '272', '273', '274'])
  const prets = sumDebit(entries, ['276', '277'])
  const depots = sumDebit(entries, ['275'])
  const creancesRattachees = sumDebit(entries, ['266', '267'])
  const pretsPersonnel = sumDebit(entries, ['278'])
  const interetsCourus = sumDebit(entries, ['279'])
  const total = titresPartic + autresTitres + prets + depots + creancesRattachees + pretsPersonnel + interetsCourus
  return {
    titre: 'Immobilisations financieres',
    tableau: {
      titre: 'Detail des immobilisations financieres',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Titres de participation', fmt(titresPartic), '', '', ''],
        ['Autres titres immobilises', fmt(autresTitres), '', '', ''],
        ['Prets et creances non commerciales', fmt(prets), '', '', ''],
        ['Depots et cautionnements verses', fmt(depots), '', '', ''],
        ['Creances rattachees a des participations', fmt(creancesRattachees), '', '', ''],
        ['Prets au personnel', fmt(pretsPersonnel), '', '', ''],
        ['Interets courus sur prets', fmt(interetsCourus), '', '', ''],
        ['TOTAL', fmt(total), '', '', ''],
      ]
    }
  }
}

// ═══ Note 7: Clients (41x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote7(entries: BalanceEntry[]): NoteData {
  const ventesBiens = sumDebit(entries, ['411'])
  const prestations = sumDebit(entries, ['412'])
  const effets = sumDebit(entries, ['413'])
  const douteux = sumDebit(entries, ['416'])
  const provisions = sumCredit(entries, ['491'])
  const totalBrut = ventesBiens + prestations + effets + douteux
  const totalNet = totalBrut - provisions
  return {
    titre: 'Clients',
    tableau: {
      titre: 'Creances clients et comptes rattaches',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Clients — ventes de biens', fmt(ventesBiens), '', '', ''],
        ['Clients — prestations de services', fmt(prestations), '', '', ''],
        ['Clients — effets a recevoir', fmt(effets), '', '', ''],
        ['Clients douteux ou litigieux', fmt(douteux), '', '', ''],
        ['Provisions pour depreciation des clients', fmt(-provisions), '', '', ''],
        ['TOTAL NET', fmt(totalNet), '', '', ''],
      ]
    }
  }
}

// ═══ Note 8: Autres creances (42x-47x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Echeance < 1 an', 'Echeance > 1 an']
function generateNote8(entries: BalanceEntry[]): NoteData {
  const fournisseursAvances = sumDebit(entries, ['409'])
  const personnel = sumDebit(entries, ['42'])
  const orgSociaux = sumDebit(entries, ['43'])
  const etat = sumDebit(entries, ['44'])
  const debiteursDivers = sumDebit(entries, ['47'])
  const chargesConstatees = sumDebit(entries, ['476'])
  const total = fournisseursAvances + personnel + orgSociaux + etat + debiteursDivers + chargesConstatees
  return {
    titre: 'Autres creances',
    tableau: {
      titre: 'Detail des autres creances',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Echeance < 1 an', 'Echeance > 1 an'],
      lignes: [
        ['Fournisseurs, avances versees', fmt(fournisseursAvances), '', '', fmt(fournisseursAvances), ''],
        ['Personnel', fmt(personnel), '', '', fmt(personnel), ''],
        ['Organismes sociaux', fmt(orgSociaux), '', '', fmt(orgSociaux), ''],
        ['Etat et collectivites', fmt(etat), '', '', fmt(etat), ''],
        ['Debiteurs divers', fmt(debiteursDivers), '', '', fmt(debiteursDivers), ''],
        ['Charges constatees d\'avance', fmt(chargesConstatees), '', '', fmt(chargesConstatees), ''],
        ['TOTAL', fmt(total), '', '', fmt(total), ''],
      ]
    }
  }
}

// ═══ Note 9: Titres de placement (50x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote9(entries: BalanceEntry[]): NoteData {
  const actionsCotees = sumDebit(entries, ['501'])
  const actionsNonCotees = sumDebit(entries, ['502'])
  const obligations = sumDebit(entries, ['503', '504', '505', '506'])
  const depots = sumDebit(entries, ['507', '508'])
  const provisions = sumCredit(entries, ['590'])
  const totalBrut = actionsCotees + actionsNonCotees + obligations + depots
  return {
    titre: 'Titres de placement',
    tableau: {
      titre: 'Titres de placement et valeurs mobilieres',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Actions cotees', fmt(actionsCotees), '', '', ''],
        ['Actions non cotees', fmt(actionsNonCotees), '', '', ''],
        ['Obligations et bons', fmt(obligations), '', '', ''],
        ['Depots a terme', fmt(depots), '', '', ''],
        ['Provisions pour depreciation des titres', fmt(-provisions), '', '', ''],
        ['TOTAL NET', fmt(totalBrut - provisions), '', '', ''],
      ]
    }
  }
}

// ═══ Note 11: Disponibilites (51x-58x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote11(entries: BalanceEntry[]): NoteData {
  const banquesNationales = sumDebit(entries, ['521'])
  const banquesDevises = sumDebit(entries, ['522', '523', '524', '525', '526', '527'])
  const caisse = sumDebit(entries, ['57'])
  const regies = sumDebit(entries, ['54'])
  const virements = sumDebit(entries, ['58'])
  const total = banquesNationales + banquesDevises + caisse + regies + virements
  return {
    titre: 'Disponibilites',
    tableau: {
      titre: 'Detail des disponibilites',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Banques en monnaie nationale', fmt(banquesNationales), '', '', ''],
        ['Banques en devises', fmt(banquesDevises), '', '', ''],
        ['Caisse', fmt(caisse), '', '', ''],
        ['Regies d\'avances', fmt(regies), '', '', ''],
        ['Virements de fonds', fmt(virements), '', '', ''],
        ['TOTAL', fmt(total), '', '', ''],
      ]
    }
  }
}

// ═══ Note 13: Capital (10x) ═══
// Colonnes: ['Elements', 'Montant N', 'Montant N-1', 'Variation']
function generateNote13(entries: BalanceEntry[]): NoteData {
  const capitalSocial = sumCredit(entries, ['101'])
  const capitalNonAppele = sumDebit(entries, ['109'])
  const capitalAppeleNonVerse = sumDebit(entries, ['1011'])
  const total = capitalSocial - capitalNonAppele - capitalAppeleNonVerse
  return {
    titre: 'Capital',
    tableau: {
      titre: 'Capital social et actionnaires',
      colonnes: ['Elements', 'Montant N', 'Montant N-1', 'Variation'],
      lignes: [
        ['Capital social', fmt(capitalSocial), '', ''],
        ['Actionnaires, capital souscrit non appele', fmt(capitalNonAppele), '', ''],
        ['Actionnaires, capital souscrit appele non verse', fmt(capitalAppeleNonVerse), '', ''],
        ['TOTAL', fmt(total), '', ''],
      ]
    }
  }
}

// ═══ Note 14: Primes et reserves (105x, 11x, 12x, 13x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote14(entries: BalanceEntry[]): NoteData {
  const primesEmission = sumCredit(entries, ['1051'])
  const primesApport = sumCredit(entries, ['1052', '1053', '1054'])
  const reserveLegale = sumCredit(entries, ['111'])
  const reservesStatutaires = sumCredit(entries, ['112'])
  const reservesFacultatives = sumCredit(entries, ['118'])
  const reservesReglementees = sumCredit(entries, ['113', '114', '115', '116', '117'])
  const reportNouveau = sumCredit(entries, ['12'])
  const resultatNet = sumCredit(entries, ['13'])
  const total = primesEmission + primesApport + reserveLegale + reservesStatutaires + reservesFacultatives + reservesReglementees + reportNouveau + resultatNet
  return {
    titre: 'Primes et reserves',
    tableau: {
      titre: 'Detail des primes et reserves',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Primes d\'emission', fmt(primesEmission), '', '', ''],
        ['Primes d\'apport', fmt(primesApport), '', '', ''],
        ['Reserve legale', fmt(reserveLegale), '', '', ''],
        ['Reserves statutaires', fmt(reservesStatutaires), '', '', ''],
        ['Reserves facultatives', fmt(reservesFacultatives), '', '', ''],
        ['Reserves reglementees', fmt(reservesReglementees), '', '', ''],
        ['Report a nouveau', fmt(reportNouveau), '', '', ''],
        ['Resultat net de l\'exercice', fmt(resultatNet), '', '', ''],
        ['TOTAL', fmt(total), '', '', ''],
      ]
    }
  }
}

// ═══ Note 17: Fournisseurs d'exploitation (40x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Echeance < 1 an', 'Echeance > 1 an']
function generateNote17(entries: BalanceEntry[]): NoteData {
  const fournisseurs = sumCredit(entries, ['401'])
  const effets = sumCredit(entries, ['402'])
  const facturesNP = sumCredit(entries, ['408'])
  const fournisseursInvest = sumCredit(entries, ['404'])
  const retenuesGarantie = sumCredit(entries, ['4017'])
  const total = fournisseurs + effets + facturesNP + fournisseursInvest + retenuesGarantie
  return {
    titre: 'Fournisseurs d\'exploitation',
    tableau: {
      titre: 'Detail des dettes fournisseurs',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Echeance < 1 an', 'Echeance > 1 an'],
      lignes: [
        ['Fournisseurs, dettes en compte', fmt(fournisseurs), '', '', fmt(fournisseurs), ''],
        ['Fournisseurs, effets a payer', fmt(effets), '', '', fmt(effets), ''],
        ['Fournisseurs, factures non parvenues', fmt(facturesNP), '', '', fmt(facturesNP), ''],
        ['Fournisseurs d\'investissements', fmt(fournisseursInvest), '', '', fmt(fournisseursInvest), ''],
        ['Fournisseurs, retenues de garantie', fmt(retenuesGarantie), '', '', fmt(retenuesGarantie), ''],
        ['TOTAL', fmt(total), '', '', fmt(total), ''],
      ]
    }
  }
}

// ═══ Note 18: Dettes fiscales et sociales (43x, 44x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote18(entries: BalanceEntry[]): NoteData {
  const personnelRemun = sumCredit(entries, ['422'])
  const orgSociaux = sumCredit(entries, ['43'])
  const etatIS = sumCredit(entries, ['441'])
  const etatTVA = sumCredit(entries, ['443', '4441'])
  const etatAutres = sumCredit(entries, ['442', '445', '446', '447', '448', '449'])
  const autresFiscales = sumCredit(entries, ['4491', '4492', '4499'])
  const total = personnelRemun + orgSociaux + etatIS + etatTVA + etatAutres + autresFiscales
  return {
    titre: 'Dettes fiscales et sociales',
    tableau: {
      titre: 'Dettes fiscales et sociales',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Personnel — remunerations dues', fmt(personnelRemun), '', '', ''],
        ['Organismes sociaux', fmt(orgSociaux), '', '', ''],
        ['Etat — impots sur les benefices', fmt(etatIS), '', '', ''],
        ['Etat — TVA due', fmt(etatTVA), '', '', ''],
        ['Etat — autres impots et taxes', fmt(etatAutres), '', '', ''],
        ['Autres dettes fiscales', fmt(autresFiscales), '', '', ''],
        ['TOTAL', fmt(total), '', '', ''],
      ]
    }
  }
}

// ═══ Note 19: Autres dettes et provisions pour risques (19x, 47x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Echeance < 1 an', 'Echeance > 1 an']
function generateNote19(entries: BalanceEntry[]): NoteData {
  const dettesFiscales = sumCredit(entries, ['441', '442', '443', '444', '445'])
  const dettesSociales = sumCredit(entries, ['43'])
  const produitsConstates = sumCredit(entries, ['477'])
  const crediteursDivers = sumCredit(entries, ['47'])
  const provisionsRisques = sumCredit(entries, ['151', '152', '153', '155', '156', '157', '158'])
  const provisionsCharges = sumCredit(entries, ['19'])
  const total = dettesFiscales + dettesSociales + produitsConstates + crediteursDivers + provisionsRisques + provisionsCharges
  return {
    titre: 'Autres dettes et provisions pour risques et charges',
    tableau: {
      titre: 'Detail des autres dettes et provisions pour risques',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Echeance < 1 an', 'Echeance > 1 an'],
      lignes: [
        ['Dettes fiscales courantes', fmt(dettesFiscales), '', '', fmt(dettesFiscales), ''],
        ['Dettes sociales courantes', fmt(dettesSociales), '', '', fmt(dettesSociales), ''],
        ['Produits constates d\'avance', fmt(produitsConstates), '', '', fmt(produitsConstates), ''],
        ['Crediteurs divers', fmt(crediteursDivers), '', '', fmt(crediteursDivers), ''],
        ['Provisions pour risques', fmt(provisionsRisques), '', '', '', fmt(provisionsRisques)],
        ['Provisions pour charges', fmt(provisionsCharges), '', '', '', fmt(provisionsCharges)],
        ['TOTAL', fmt(total), '', '', '', ''],
      ]
    }
  }
}

// ═══ Note 20: Banques, credit d'escompte et de tresorerie (52x credit, 56x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote20(entries: BalanceEntry[]): NoteData {
  const banquesCredit = sumCredit(entries, ['52'])
  const creditsEscompte = sumCredit(entries, ['56'])
  const creditsTresorerie = sumCredit(entries, ['55'])
  const decouvertsB = sumCredit(entries, ['521'])
  const total = banquesCredit + creditsEscompte + creditsTresorerie
  return {
    titre: 'Banques, credit d\'escompte et de tresorerie',
    tableau: {
      titre: 'Tresorerie passive',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Banques — soldes crediteurs', fmt(banquesCredit), '', '', ''],
        ['Credits d\'escompte', fmt(creditsEscompte), '', '', ''],
        ['Credits de tresorerie', fmt(creditsTresorerie), '', '', ''],
        ['Decouverts bancaires', fmt(decouvertsB), '', '', ''],
        ['TOTAL', fmt(total), '', '', ''],
      ]
    }
  }
}

// ═══ Note 21: Chiffre d'affaires et autres produits (70x-75x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote21(entries: BalanceEntry[]): NoteData {
  const ventesMarch = sumCredit(entries, ['701'])
  const ventesProdFab = sumCredit(entries, ['702', '703'])
  const travauxServices = sumCredit(entries, ['704', '705', '706'])
  const produitsAccess = sumCredit(entries, ['707'])
  const subventionsExploit = sumCredit(entries, ['71'])
  const autresProduits = sumCredit(entries, ['75'])
  const total = ventesMarch + ventesProdFab + travauxServices + produitsAccess + subventionsExploit + autresProduits
  return {
    titre: 'Chiffre d\'affaires et autres produits',
    tableau: {
      titre: 'Chiffre d\'affaires et autres produits',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Ventes de marchandises', fmt(ventesMarch), '', '', ''],
        ['Ventes de produits fabriques', fmt(ventesProdFab), '', '', ''],
        ['Travaux et services vendus', fmt(travauxServices), '', '', ''],
        ['Produits accessoires', fmt(produitsAccess), '', '', ''],
        ['Subventions d\'exploitation', fmt(subventionsExploit), '', '', ''],
        ['Autres produits', fmt(autresProduits), '', '', ''],
        ['TOTAL', fmt(total), '', '', ''],
      ]
    }
  }
}

// ═══ Note 22: Achats (60x, 61x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote22(entries: BalanceEntry[]): NoteData {
  const achatsMarch = sumDebit(entries, ['601'])
  const achatsMatieres = sumDebit(entries, ['602'])
  const achatsFournitures = sumDebit(entries, ['604', '605', '606'])
  const achatsEmballages = sumDebit(entries, ['608'])
  const variationStocks = sumDebit(entries, ['603'])
  const total = achatsMarch + achatsMatieres + achatsFournitures + achatsEmballages + variationStocks
  return {
    titre: 'Achats',
    tableau: {
      titre: 'Achats de l\'exercice',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Achats de marchandises', fmt(achatsMarch), '', '', ''],
        ['Achats de matieres premieres', fmt(achatsMatieres), '', '', ''],
        ['Achats de fournitures liees', fmt(achatsFournitures), '', '', ''],
        ['Achats d\'emballages', fmt(achatsEmballages), '', '', ''],
        ['Variation de stocks', fmt(variationStocks), '', '', ''],
        ['TOTAL', fmt(total), '', '', ''],
      ]
    }
  }
}

// ═══ Note 28: Dotations et charges pour provisions (68x, 69x, 79x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote28(entries: BalanceEntry[]): NoteData {
  const dotAmortExploit = sumDebit(entries, ['681'])
  const dotProvExploit = sumDebit(entries, ['691'])
  const dotDepreciations = sumDebit(entries, ['6817', '6818', '697'])
  const reprisesProvisions = sumCredit(entries, ['791', '797'])
  const reprisesDepreciations = sumCredit(entries, ['7817', '7818'])
  const totalNet = dotAmortExploit + dotProvExploit + dotDepreciations - reprisesProvisions - reprisesDepreciations
  return {
    titre: 'Dotations et charges pour provisions et depreciations',
    tableau: {
      titre: 'Dotations aux amortissements, depreciations et provisions',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['Dotations aux amortissements d\'exploitation', fmt(dotAmortExploit), '', '', ''],
        ['Dotations aux provisions d\'exploitation', fmt(dotProvExploit), '', '', ''],
        ['Dotations aux depreciations', fmt(dotDepreciations), '', '', ''],
        ['Reprises de provisions', fmt(reprisesProvisions), '', '', ''],
        ['Reprises de depreciations', fmt(reprisesDepreciations), '', '', ''],
        ['TOTAL NET', fmt(totalNet), '', '', ''],
      ]
    }
  }
}

// ═══ Note 29: Charges et revenus financiers (67x, 77x, 79x) ═══
// Colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %']
function generateNote29(entries: BalanceEntry[]): NoteData {
  const revenusTitres = sumCredit(entries, ['771', '772'])
  const interetsProduits = sumCredit(entries, ['773', '774', '775', '776'])
  const gainsChange = sumCredit(entries, ['776'])
  const reprisesFinancieres = sumCredit(entries, ['797'])
  const totalProduits = revenusTitres + interetsProduits + gainsChange + reprisesFinancieres
  const interetsCharges = sumDebit(entries, ['671', '672'])
  const pertesChange = sumDebit(entries, ['676'])
  const dotationsFinancieres = sumDebit(entries, ['697'])
  const totalCharges = interetsCharges + pertesChange + dotationsFinancieres
  const resultatFinancier = totalProduits - totalCharges
  return {
    titre: 'Charges et revenus financiers',
    tableau: {
      titre: 'Resultat financier',
      colonnes: ['Nature', 'Montant N', 'Montant N-1', 'Variation', 'Variation %'],
      lignes: [
        ['PRODUITS FINANCIERS:', '', '', '', ''],
        ['Revenus des titres de participation', fmt(revenusTitres), '', '', ''],
        ['Interets et produits assimiles', fmt(interetsProduits), '', '', ''],
        ['Gains de change', fmt(gainsChange), '', '', ''],
        ['Reprises de provisions financieres', fmt(reprisesFinancieres), '', '', ''],
        ['Total produits financiers', fmt(totalProduits), '', '', ''],
        ['CHARGES FINANCIERES:', '', '', '', ''],
        ['Interets et charges assimilees', fmt(interetsCharges), '', '', ''],
        ['Pertes de change', fmt(pertesChange), '', '', ''],
        ['Dotations provisions financieres', fmt(dotationsFinancieres), '', '', ''],
        ['Total charges financieres', fmt(totalCharges), '', '', ''],
        ['RESULTAT FINANCIER', fmt(resultatFinancier), '', '', ''],
      ]
    }
  }
}

// ═══ Note 31: Repartition du resultat (12x, 13x) ═══
// Colonnes: ['Elements', 'Montant']
function generateNote31(entries: BalanceEntry[]): NoteData {
  const resultatNet = sumCredit(entries, ['13'])
  const reportAN = sumCredit(entries, ['12'])
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
  const imf = Math.round(produits * 0.01) // IMF 1% du CA
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
