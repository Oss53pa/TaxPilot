/**
 * Knowledge — Analyse Predictive depuis la Balance
 */

import { calculerIS } from '@/config/taux-fiscaux-ci'
import { calculerPassageFiscal } from '@/services/passageFiscalService'
import { generateAnnexeData } from '@/services/annexeDataService'
import type { Balance } from '@/types'
import type { Proph3tResponse, PredictionCard, FiscalInfoCard } from '../types'
import type { BalanceEntry } from '@/services/liasseDataService'

function fmt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR')
}

// ── Agrégats ─────────────────────────────────────────────────────────

export interface Agregats {
  capitauxPropres: number
  capitalSocial: number
  reserves: number
  resultat: number
  immoBrutes: number
  immoNettes: number
  amortissements: number
  stocksNets: number
  clientsNets: number
  fournisseurs: number
  tvaCollectee: number
  tvaDeductible: number
  tresorerie: number
  ca: number
  chargesPersonnel: number
  chargesFinancieres: number
  actifCirculant: number
  passifCirculant: number
  dettesTotal: number
}

export function calculerAgregats(balance: Balance[]): Agregats {
  let capitauxPropres = 0, capitalSocial = 0, reserves = 0
  let immoBrutes = 0, amortissements = 0
  let stocksNets = 0, clientsNets = 0, fournisseurs = 0
  let tvaCollectee = 0, tvaDeductible = 0
  let tresorerie = 0
  let ca = 0, chargesPersonnel = 0, chargesFinancieres = 0
  let actifCirculant = 0, passifCirculant = 0, dettesTotal = 0
  let totalProduits = 0, totalCharges = 0

  for (const line of balance) {
    const c = line.compte
    const solde = line.solde

    // Capitaux propres (10-14)
    if (c.startsWith('10')) capitalSocial += solde
    if (c.startsWith('11') || c.startsWith('12')) reserves += solde
    if (/^1[0-4]/.test(c)) capitauxPropres += solde

    // Immobilisations (2x) — solde debiteur = valeur brute
    if (/^2[0-7]/.test(c)) immoBrutes += Math.max(0, solde)
    // Amortissements — solde crediteur (negatif) = cumul
    if (c.startsWith('28') || c.startsWith('29')) amortissements += Math.max(0, -solde)

    // Stocks (3x)
    if (c.startsWith('3')) stocksNets += solde

    // Clients (41)
    if (c.startsWith('41')) clientsNets += solde

    // Fournisseurs (40, excluding 409 avances)
    if (c.startsWith('40') && !c.startsWith('409')) fournisseurs += Math.abs(solde)

    // TVA — soldes nets
    if (c.startsWith('4431')) tvaCollectee += Math.max(0, -solde)
    if (c.startsWith('4452')) tvaDeductible += Math.max(0, solde)

    // Trésorerie (5x)
    if (c.startsWith('5')) tresorerie += solde

    // Actif circulant (3x + 4x debiteur)
    if (c.startsWith('3') || c.startsWith('4')) {
      if (solde > 0) actifCirculant += solde
      else passifCirculant += Math.abs(solde)
    }

    // Dettes financières (16-19 only, not operating liabilities)
    if (/^1[6-9]/.test(c)) {
      dettesTotal += Math.abs(solde)
    }

    // P&L: Produits (cl.7 = solde crediteur) / Charges (cl.6 = solde debiteur)
    if (c.startsWith('7')) totalProduits += Math.max(0, -solde)
    if (c.startsWith('6')) totalCharges += Math.max(0, solde)

    // CA (70-75) — solde crediteur
    if (/^7[0-5]/.test(c)) ca += Math.max(0, -solde)

    // Charges personnel (66) — solde debiteur
    if (c.startsWith('66')) chargesPersonnel += Math.max(0, solde)

    // Charges financières (67) — solde debiteur
    if (c.startsWith('67')) chargesFinancieres += Math.max(0, solde)
  }

  // Resultat = Produits - Charges (always computed from P&L, not account 13)
  const resultat = totalProduits - totalCharges
  // Include P&L result in capitaux propres
  capitauxPropres += resultat

  return {
    capitauxPropres, capitalSocial, reserves, resultat,
    immoBrutes, immoNettes: immoBrutes - amortissements, amortissements,
    stocksNets, clientsNets, fournisseurs,
    tvaCollectee, tvaDeductible,
    tresorerie, ca, chargesPersonnel, chargesFinancieres,
    actifCirculant, passifCirculant, dettesTotal,
  }
}

type Status = 'excellent' | 'bon' | 'acceptable' | 'critique'

function noBalanceResponse(): Proph3tResponse {
  return {
    text: "**Analyse predictive** — Aucune balance disponible.\n\nPour utiliser l'analyse predictive, importez d'abord une balance comptable dans le module Balance de FiscaSync.",
    suggestions: ['Taux fiscaux CI', 'Controles audit', 'Aide'],
  }
}

// ── Bridge Balance[] → BalanceEntry[] for passageFiscalService ────────

function toPassageFiscalEntries(balance: Balance[]) {
  return balance.map(b => ({
    compte: b.compte,
    intitule: b.libelle_compte || '',
    debit: b.debit,
    credit: b.credit,
    solde_debit: Math.max(0, b.solde),
    solde_credit: Math.max(0, -b.solde),
  }))
}

// ── Prediction IS (via Passage Fiscal) ───────────────────────────────

export function handlePredictionIS(balance: Balance[]): Proph3tResponse {
  if (!balance || balance.length === 0) return noBalanceResponse()

  // Utiliser le vrai passage fiscal au lieu du calcul simplifié
  const entries = toPassageFiscalEntries(balance)
  const passage = calculerPassageFiscal(entries)

  const status: Status = passage.resultat_fiscal > 0
    ? (passage.base_is === 'IS' ? 'bon' : 'acceptable')
    : 'critique'

  // Card 1 : Synthèse passage fiscal
  const summaryCard: PredictionCard = {
    type: 'prediction',
    title: 'Passage Fiscal & IS',
    indicators: [
      { label: 'Chiffre d\'affaires', value: `${fmt(passage.chiffre_affaires)} FCFA`, status: passage.chiffre_affaires > 0 ? 'bon' : 'critique' },
      { label: 'Resultat comptable', value: `${fmt(passage.resultat_comptable)} FCFA`, status: passage.resultat_comptable > 0 ? 'bon' : 'critique' },
      { label: 'Reintegrations', value: `+ ${fmt(passage.total_reintegrations)} FCFA`, status: passage.total_reintegrations > 0 ? 'acceptable' : 'bon' },
      { label: 'Deductions', value: `- ${fmt(passage.total_deductions)} FCFA`, status: 'bon' },
      { label: 'Resultat fiscal', value: `${fmt(passage.resultat_fiscal)} FCFA`, status: passage.resultat_fiscal > 0 ? 'bon' : 'critique' },
      { label: 'IS brut (25%)', value: `${fmt(passage.is_brut)} FCFA`, status },
      { label: 'IMF (0.5% CA)', value: `${fmt(passage.imf)} FCFA`, status: passage.base_is === 'IMF' ? 'acceptable' : 'bon' },
      { label: 'IS du', value: `${fmt(passage.is_du)} FCFA`, status },
    ],
    narrative: buildISNarrative(passage),
    recommendations: buildISRecommendations(passage),
  }

  // Card 2 : Détail du tableau de passage fiscal avec références CGI
  const passageItems: { label: string; value: string }[] = [
    { label: 'Resultat comptable (Cl.7 - Cl.6)', value: `${fmt(passage.resultat_comptable)} FCFA` },
  ]

  if (passage.reintegrations.length > 0) {
    passageItems.push({ label: '── REINTEGRATIONS ──', value: '' })
    for (const r of passage.reintegrations) {
      passageItems.push({
        label: `${r.code} — ${r.libelle}`,
        value: `+ ${fmt(r.montant)} FCFA`,
      })
      passageItems.push({
        label: `   Compte ${r.compte_source}`,
        value: r.base_legale,
      })
    }
    passageItems.push({ label: 'Total reintegrations', value: `+ ${fmt(passage.total_reintegrations)} FCFA` })
  }

  if (passage.deductions.length > 0) {
    passageItems.push({ label: '── DEDUCTIONS ──', value: '' })
    for (const d of passage.deductions) {
      passageItems.push({
        label: `${d.code} — ${d.libelle}`,
        value: `- ${fmt(d.montant)} FCFA`,
      })
      passageItems.push({
        label: `   Compte ${d.compte_source}`,
        value: d.base_legale,
      })
    }
    passageItems.push({ label: 'Total deductions', value: `- ${fmt(passage.total_deductions)} FCFA` })
  }

  passageItems.push(
    { label: '── RESULTAT FISCAL ──', value: '' },
    { label: 'Base imposable', value: `${fmt(passage.resultat_fiscal)} FCFA` },
    { label: 'IS brut (25%)', value: `${fmt(passage.is_brut)} FCFA` },
    { label: 'IMF (0.5% CA, min 3M, max 35M)', value: `${fmt(passage.imf)} FCFA` },
    { label: `IS du (base ${passage.base_is})`, value: `${fmt(passage.is_du)} FCFA` },
  )

  const detailCard: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Tableau de Passage Fiscal',
    items: passageItems,
    calculation: {
      steps: [
        `Resultat comptable : ${fmt(passage.resultat_comptable)} FCFA`,
        `+ Reintegrations : ${fmt(passage.total_reintegrations)} FCFA (${passage.reintegrations.length} poste${passage.reintegrations.length > 1 ? 's' : ''})`,
        `- Deductions : ${fmt(passage.total_deductions)} FCFA (${passage.deductions.length} poste${passage.deductions.length > 1 ? 's' : ''})`,
        `= Resultat fiscal : ${fmt(passage.resultat_fiscal)} FCFA`,
        `IS brut = ${fmt(Math.max(0, passage.resultat_fiscal))} x 25% = ${fmt(passage.is_brut)} FCFA`,
        `IMF = max(3 000 000, min(${fmt(passage.chiffre_affaires)} x 0.5%, 35 000 000)) = ${fmt(passage.imf)} FCFA`,
        `IS du = max(IS brut, IMF) = ${fmt(passage.is_du)} FCFA`,
      ],
      result: `${fmt(passage.is_du)} FCFA (base ${passage.base_is})`,
    },
  }

  return {
    text: `**Estimation IS avec Passage Fiscal** — analyse complete a partir de votre balance`,
    content: [summaryCard, detailCard],
    suggestions: ['Prediction TVA', 'Mes ratios', 'Detection anomalies', 'Charges non deductibles'],
  }
}

function buildISNarrative(passage: ReturnType<typeof calculerPassageFiscal>): string {
  const parts: string[] = []

  // Écart comptable / fiscal
  const ecart = passage.resultat_fiscal - passage.resultat_comptable
  if (Math.abs(ecart) > 0) {
    parts.push(`Ecart comptable/fiscal de **${fmt(Math.abs(ecart))} FCFA** (${ecart > 0 ? 'augmentation' : 'diminution'} de la base imposable).`)
  } else {
    parts.push('Aucun ajustement fiscal — le resultat comptable = le resultat fiscal.')
  }

  // Réintégrations
  if (passage.reintegrations.length > 0) {
    const top = passage.reintegrations.sort((a, b) => b.montant - a.montant)[0]
    parts.push(`**${passage.reintegrations.length} reintegration${passage.reintegrations.length > 1 ? 's' : ''}** pour ${fmt(passage.total_reintegrations)} FCFA. La plus importante : ${top.libelle} (${fmt(top.montant)} FCFA, ${top.base_legale}).`)
  }

  // Base IS ou IMF
  parts.push(`Base retenue : **${passage.base_is}**. ${passage.base_is === 'IMF' ? "L'IS brut est inferieur a l'IMF — c'est l'Impot Minimum Forfaitaire qui s'applique." : "L'IS brut depasse l'IMF — c'est l'IS classique qui s'applique."}`)

  return parts.join(' ')
}

function buildISRecommendations(passage: ReturnType<typeof calculerPassageFiscal>): string[] {
  const recs: string[] = []

  if (passage.resultat_fiscal < 0) {
    recs.push('Resultat deficitaire — le deficit est reportable sur 5 exercices (CGI Art. 4)')
    recs.push('L\'IMF reste du meme en cas de deficit')
  }

  if (passage.base_is === 'IMF') {
    recs.push('Resultat insuffisant pour depasser l\'IMF — optimiser le ratio charges/produits')
  }

  // Conseils spécifiques par réintégration
  for (const r of passage.reintegrations) {
    switch (r.code) {
      case 'R01':
        recs.push('Amendes fiscales : toujours non deductibles — prevoir dans le budget fiscal')
        break
      case 'R03':
        recs.push('Cadeaux : plafond 1\u2030 du CA — documenter chaque cadeau pour justifier la deduction')
        break
      case 'R04':
        recs.push('Dons : plafond 5\u2030 du CA — verifier que les beneficiaires sont agreees')
        break
      case 'R06':
        recs.push('VP : amortissement plafonne — envisager le credit-bail pour les vehicules de prestige')
        break
      case 'R07':
        recs.push('Frais de reception : plafond 1% du CA — controler les notes de frais')
        break
    }
  }

  if (recs.length === 0) {
    recs.push('Provisionner les acomptes IS trimestriels (15 mars, 15 juin, 15 sept, 15 dec)')
    recs.push('Verifier les provisions pour s\'assurer de leur deductibilite')
  }

  return recs.slice(0, 5)
}

// ── Prediction TVA ───────────────────────────────────────────────────

export function handlePredictionTVA(balance: Balance[]): Proph3tResponse {
  if (!balance || balance.length === 0) return noBalanceResponse()

  const agg = calculerAgregats(balance)
  const soldeTVA = agg.tvaCollectee - agg.tvaDeductible
  const isCredit = soldeTVA < 0
  const status: Status = isCredit ? 'acceptable' : 'bon'

  const card: PredictionCard = {
    type: 'prediction',
    title: 'Position TVA',
    indicators: [
      { label: 'TVA collectee (4431)', value: `${fmt(agg.tvaCollectee)} FCFA`, status: 'bon' },
      { label: 'TVA deductible (4452)', value: `${fmt(agg.tvaDeductible)} FCFA`, status: 'bon' },
      { label: 'Solde TVA', value: `${fmt(Math.abs(soldeTVA))} FCFA`, status },
      { label: 'Position', value: isCredit ? 'Credit de TVA' : 'TVA a reverser', status },
    ],
    narrative: isCredit
      ? `L'entreprise dispose d'un **credit de TVA** de ${fmt(Math.abs(soldeTVA))} FCFA. Ce credit peut etre impute sur les prochaines declarations.`
      : `L'entreprise doit reverser **${fmt(soldeTVA)} FCFA** de TVA au Tresor Public.`,
    recommendations: isCredit
      ? ['Demander le remboursement du credit de TVA si > 3 mois', 'Verifier la coherence des deductions']
      : ['Provisionner le montant avant la declaration', 'Declaration due le 15 du mois suivant'],
  }

  return {
    text: `**Position TVA** a partir de votre balance`,
    content: [card],
    suggestions: ['Estimation IS', 'Mes ratios', 'Analyse generale'],
  }
}

// ── Prediction Ratios (24 ratios complets) ───────────────────────────

function evalRatio(val: number, thresholds: [number, number, number]): Status {
  if (val >= thresholds[0]) return 'excellent'
  if (val >= thresholds[1]) return 'bon'
  if (val >= thresholds[2]) return 'acceptable'
  return 'critique'
}

function evalInverse(val: number, thresholds: [number, number, number]): Status {
  if (val <= thresholds[0]) return 'excellent'
  if (val <= thresholds[1]) return 'bon'
  if (val <= thresholds[2]) return 'acceptable'
  return 'critique'
}

/** Agrégats supplémentaires pour ratios avancés (non dans Agregats de base) */
function calculerAgregatsEtendus(balance: Balance[]) {
  let achats = 0, chargesExternes = 0, impotsTaxes = 0
  let dotationsAmort = 0, totalCharges = 0, totalProduits = 0
  let produitsFinanciers = 0, produitsExploitation = 0
  let chargesExploitation = 0

  for (const line of balance) {
    const c = line.compte
    const s = line.solde
    // Achats (60)
    if (c.startsWith('60')) achats += Math.max(0, s)
    // Services extérieurs (61-62)
    if (c.startsWith('61') || c.startsWith('62')) chargesExternes += Math.max(0, s)
    // Impôts et taxes (63-64)
    if (c.startsWith('63') || c.startsWith('64')) impotsTaxes += Math.max(0, s)
    // Dotations amortissements (68)
    if (c.startsWith('68')) dotationsAmort += Math.max(0, s)
    // Total charges classe 6
    if (c.startsWith('6')) {
      totalCharges += Math.max(0, s)
      if (!c.startsWith('67') && !c.startsWith('69')) chargesExploitation += Math.max(0, s)
    }
    // Total produits classe 7
    if (c.startsWith('7')) {
      totalProduits += Math.max(0, -s)
      if (c.startsWith('77')) produitsFinanciers += Math.max(0, -s)
      if (!c.startsWith('77') && !c.startsWith('79')) produitsExploitation += Math.max(0, -s)
    }
  }

  return { achats, chargesExternes, impotsTaxes, dotationsAmort, totalCharges, totalProduits, produitsFinanciers, produitsExploitation, chargesExploitation }
}

export function handlePredictionRatios(balance: Balance[]): Proph3tResponse {
  if (!balance || balance.length === 0) return noBalanceResponse()

  const agg = calculerAgregats(balance)
  const ext = calculerAgregatsEtendus(balance)

  // ── LIQUIDITÉ ──
  const liquiditeGenerale = agg.passifCirculant > 0 ? agg.actifCirculant / agg.passifCirculant : (agg.actifCirculant > 0 ? 99 : 0)
  const liquiditeReduite = agg.passifCirculant > 0 ? (agg.actifCirculant - agg.stocksNets) / agg.passifCirculant : 0
  const liquiditeImmediate = agg.passifCirculant > 0 ? agg.tresorerie / agg.passifCirculant : 0

  // ── STRUCTURE & SOLVABILITÉ ──
  const fondsRoulement = agg.capitauxPropres - agg.immoNettes
  const bfr = agg.actifCirculant - agg.passifCirculant
  const tresoNette = fondsRoulement - bfr
  const totalActif = agg.immoNettes + agg.actifCirculant + Math.max(0, agg.tresorerie)
  const endettement = agg.capitauxPropres !== 0 ? agg.dettesTotal / Math.abs(agg.capitauxPropres) : 0
  const autonomieFinanciere = totalActif > 0 ? (Math.abs(agg.capitauxPropres) / totalActif) * 100 : 0
  const solvabiliteGenerale = (agg.dettesTotal + agg.passifCirculant) > 0 ? totalActif / (agg.dettesTotal + agg.passifCirculant) : 99
  const tauxAmortissement = agg.immoBrutes > 0 ? (agg.amortissements / agg.immoBrutes) * 100 : 0
  const couvertureImmo = agg.immoNettes > 0 ? Math.abs(agg.capitauxPropres) / agg.immoNettes : 0
  const poidsChargesFin = agg.ca > 0 ? (agg.chargesFinancieres / agg.ca) * 100 : 0

  // ── RENTABILITÉ ──
  const margeNette = agg.ca > 0 ? (agg.resultat / agg.ca) * 100 : 0
  const margeBrute = agg.ca > 0 ? ((agg.ca - ext.achats) / agg.ca) * 100 : 0
  const margeExploitation = agg.ca > 0 ? ((ext.produitsExploitation - ext.chargesExploitation) / agg.ca) * 100 : 0
  const roe = agg.capitauxPropres !== 0 ? (agg.resultat / Math.abs(agg.capitauxPropres)) * 100 : 0
  const roa = totalActif > 0 ? (agg.resultat / totalActif) * 100 : 0

  // ── ACTIVITÉ & ROTATION ──
  const rotationClients = agg.ca > 0 ? (agg.clientsNets / agg.ca) * 360 : 0
  const rotationFournisseurs = ext.achats > 0 ? (agg.fournisseurs / ext.achats) * 360 : 0
  const rotationStocks = ext.achats > 0 ? (agg.stocksNets / ext.achats) * 360 : 0
  const cycleExploitation = rotationClients + rotationStocks - rotationFournisseurs
  const intensiteCapitalistique = agg.ca > 0 ? (agg.immoNettes / agg.ca) * 100 : 0

  // ── CAF (Capacité d'Autofinancement) ──
  const caf = agg.resultat + ext.dotationsAmort
  const capaciteRemboursement = caf > 0 ? agg.dettesTotal / caf : 99

  // ── Card 1 : Synthèse (8 ratios clés) ──
  const summaryCard: PredictionCard = {
    type: 'prediction',
    title: 'Ratios Financiers — Synthese',
    indicators: [
      { label: 'Liquidite generale', value: liquiditeGenerale.toFixed(2), status: evalRatio(liquiditeGenerale, [1.5, 1.0, 0.7]) },
      { label: 'Liquidite reduite', value: liquiditeReduite.toFixed(2), status: evalRatio(liquiditeReduite, [1.0, 0.7, 0.5]) },
      { label: 'Endettement', value: endettement.toFixed(2), status: evalInverse(endettement, [0.5, 1.0, 2.0]) },
      { label: 'Autonomie financiere', value: `${autonomieFinanciere.toFixed(1)}%`, status: evalRatio(autonomieFinanciere, [50, 30, 20]) },
      { label: 'Marge nette', value: `${margeNette.toFixed(1)}%`, status: evalRatio(margeNette, [10, 5, 2]) },
      { label: 'ROE', value: `${roe.toFixed(1)}%`, status: evalRatio(roe, [15, 8, 3]) },
      { label: 'Rotation clients', value: `${Math.round(rotationClients)} j`, status: evalInverse(rotationClients, [30, 60, 90]) },
      { label: 'Tresorerie nette', value: `${fmt(tresoNette)} FCFA`, status: tresoNette >= 0 ? 'bon' : 'critique' },
    ],
    narrative: buildRatiosNarrative(liquiditeGenerale, endettement, margeNette, roe, rotationClients, tresoNette, fondsRoulement),
    recommendations: buildRatiosRecommendations(liquiditeGenerale, liquiditeReduite, endettement, autonomieFinanciere, margeNette, roe, rotationClients, rotationFournisseurs, tresoNette, fondsRoulement, tauxAmortissement, poidsChargesFin, cycleExploitation, capaciteRemboursement),
  }

  // ── Card 2 : Détail complet 24 ratios ──
  const detailItems: { label: string; value: string }[] = [
    { label: '── LIQUIDITE ──', value: '' },
    { label: 'Liquidite generale (AC/PC)', value: liquiditeGenerale.toFixed(2) },
    { label: 'Liquidite reduite ((AC-Stocks)/PC)', value: liquiditeReduite.toFixed(2) },
    { label: 'Liquidite immediate (Treso/PC)', value: liquiditeImmediate.toFixed(2) },

    { label: '── STRUCTURE FINANCIERE ──', value: '' },
    { label: 'Fonds de roulement (CP - Immo)', value: `${fmt(fondsRoulement)} FCFA` },
    { label: 'BFR (AC hors treso - PC hors treso)', value: `${fmt(bfr)} FCFA` },
    { label: 'Tresorerie nette (FR - BFR)', value: `${fmt(tresoNette)} FCFA` },
    { label: 'Couverture des immo (CP/Immo nettes)', value: couvertureImmo.toFixed(2) },
    { label: 'Taux d\'amortissement (Amort/Immo brutes)', value: `${tauxAmortissement.toFixed(1)}%` },

    { label: '── SOLVABILITE & ENDETTEMENT ──', value: '' },
    { label: 'Endettement (Dettes/CP)', value: endettement.toFixed(2) },
    { label: 'Autonomie financiere (CP/Total bilan)', value: `${autonomieFinanciere.toFixed(1)}%` },
    { label: 'Solvabilite generale (Actif/Dettes)', value: solvabiliteGenerale.toFixed(2) },
    { label: 'Capacite remboursement (Dettes/CAF)', value: `${capaciteRemboursement.toFixed(1)} ans` },
    { label: 'Poids charges financieres (CF/CA)', value: `${poidsChargesFin.toFixed(2)}%` },

    { label: '── RENTABILITE ──', value: '' },
    { label: 'Marge brute ((CA-Achats)/CA)', value: `${margeBrute.toFixed(1)}%` },
    { label: 'Marge d\'exploitation (Rex/CA)', value: `${margeExploitation.toFixed(1)}%` },
    { label: 'Marge nette (Resultat/CA)', value: `${margeNette.toFixed(1)}%` },
    { label: 'ROE — Rentabilite financiere (Res/CP)', value: `${roe.toFixed(1)}%` },
    { label: 'ROA — Rentabilite economique (Res/Actif)', value: `${roa.toFixed(1)}%` },
    { label: 'CAF (Resultat + Dotations amort)', value: `${fmt(caf)} FCFA` },

    { label: '── ACTIVITE & ROTATION ──', value: '' },
    { label: 'Rotation clients (Clients/CA x 360)', value: `${Math.round(rotationClients)} jours` },
    { label: 'Rotation fournisseurs (Fourn/Achats x 360)', value: `${Math.round(rotationFournisseurs)} jours` },
    { label: 'Rotation stocks (Stocks/Achats x 360)', value: `${Math.round(rotationStocks)} jours` },
    { label: 'Cycle d\'exploitation (Cl + St - Fr)', value: `${Math.round(cycleExploitation)} jours` },
    { label: 'Intensite capitalistique (Immo/CA)', value: `${intensiteCapitalistique.toFixed(1)}%` },

    { label: '── RATIOS COMPLEMENTAIRES ──', value: '' },
    { label: 'Couverture emplois stables (CP/Immo nettes)', value: couvertureImmo.toFixed(2) },
    { label: 'Capacite remboursement (Dettes/CAF)', value: `${capaciteRemboursement.toFixed(1)} ans` },
    { label: 'Taux marge EBE (EBE/CA)', value: `${(ext.produitsExploitation > 0 ? ((ext.produitsExploitation - ext.chargesExploitation + ext.dotationsAmort) / agg.ca) * 100 : 0).toFixed(1)}%` },
  ]

  const detailCard: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Analyse Financiere Complete — 27 Ratios',
    items: detailItems,
  }

  return {
    text: `**Analyse Financiere Complete** — 27 ratios calcules depuis votre balance`,
    content: [summaryCard, detailCard],
    suggestions: ['Estimation IS', 'Detection anomalies', 'Controle coherence', 'Tendances'],
  }
}

function buildRatiosNarrative(
  liquidite: number, endettement: number, margeNette: number, _roe: number,
  rotationClients: number, tresoNette: number, fondsRoulement: number,
): string {
  const parts: string[] = []

  // Liquidité
  if (liquidite >= 1.5) parts.push(`Liquidite **excellente** (${liquidite.toFixed(2)})`)
  else if (liquidite >= 1) parts.push(`Liquidite **correcte** (${liquidite.toFixed(2)})`)
  else parts.push(`Liquidite **insuffisante** (${liquidite.toFixed(2)}) — risque de tension de tresorerie`)

  // Endettement
  if (endettement < 0.5) parts.push(`Faible endettement (${endettement.toFixed(2)})`)
  else if (endettement < 1) parts.push(`Endettement maitrise (${endettement.toFixed(2)})`)
  else parts.push(`Endettement **eleve** (${endettement.toFixed(2)})`)

  // Rentabilité
  if (margeNette > 5) parts.push(`Marge nette saine de **${margeNette.toFixed(1)}%**`)
  else if (margeNette > 0) parts.push(`Marge nette faible (${margeNette.toFixed(1)}%)`)
  else parts.push(`Marge nette **negative** (${margeNette.toFixed(1)}%)`)

  // Rotation clients
  if (rotationClients > 90) parts.push(`Delai clients **preoccupant** (${Math.round(rotationClients)} j)`)
  else if (rotationClients > 60) parts.push(`Delai clients a surveiller (${Math.round(rotationClients)} j)`)

  // Equilibre financier
  if (fondsRoulement < 0) parts.push('FR negatif — les immo ne sont pas couvertes par les CP')
  if (tresoNette < 0) parts.push('Tresorerie nette negative')

  return parts.join('. ') + '.'
}

function buildRatiosRecommendations(
  liquidite: number, liquiditeReduite: number, endettement: number, autonomie: number,
  margeNette: number, roe: number, rotationClients: number, rotationFournisseurs: number,
  tresoNette: number, fondsRoulement: number, tauxAmort: number, poidsChargesFin: number,
  cycleExploitation: number, capaciteRemboursement: number,
): string[] {
  const recs: string[] = []

  // Liquidité
  if (liquidite < 1) recs.push('Liquidite critique — negocier des delais fournisseurs ou renforcer le BFR')
  else if (liquiditeReduite < 0.5) recs.push('Liquidite reduite faible — les stocks masquent un probleme de cash')

  // Endettement
  if (endettement > 2) recs.push('Endettement excessif — renforcer les capitaux propres ou reduire les dettes')
  if (autonomie < 20) recs.push('Autonomie financiere trop faible — dependance aux creanciers')
  if (capaciteRemboursement > 5) recs.push(`Capacite de remboursement de ${capaciteRemboursement.toFixed(1)} ans — delai trop long`)
  if (poidsChargesFin > 3) recs.push(`Charges financieres = ${poidsChargesFin.toFixed(1)}% du CA — negocier les taux`)

  // Rentabilité
  if (margeNette < 0) recs.push('Marge nette negative — analyser la structure des charges')
  if (roe < 3 && roe >= 0) recs.push('ROE faible — les capitaux propres ne sont pas suffisamment remuneres')

  // Rotation
  if (rotationClients > 90) recs.push('Delai clients > 90 j — risque de creances douteuses, relancer les impays')
  if (rotationFournisseurs < 30 && rotationClients > 60) recs.push('Vous payez plus vite que vous n\'encaissez — negocier de meilleurs delais')
  if (cycleExploitation > 120) recs.push(`Cycle d'exploitation de ${Math.round(cycleExploitation)} j — optimiser le BFR`)

  // Structure
  if (fondsRoulement < 0) recs.push('FR negatif — envisager un emprunt LT ou une augmentation de capital')
  if (tresoNette < 0) recs.push('Tresorerie nette negative — surveiller le risque de cessation de paiement')
  if (tauxAmort > 85) recs.push(`Immobilisations amorties a ${tauxAmort.toFixed(0)}% — prevoir le renouvellement`)

  if (recs.length === 0) recs.push('Bonne sante financiere globale — maintenir la gestion actuelle')

  return recs.slice(0, 6)
}

// ── Prediction Trend ─────────────────────────────────────────────────

export function handlePredictionTrend(balanceN: Balance[], balanceN1?: Balance[]): Proph3tResponse {
  if (!balanceN || balanceN.length === 0) return noBalanceResponse()

  if (!balanceN1 || balanceN1.length === 0) {
    return {
      text: "**Analyse de tendance** — Pour comparer N et N-1, importez les balances des deux exercices.\n\nActuellement, seule la balance de l'exercice courant est disponible.",
      suggestions: ['Mes ratios', 'Estimation IS', 'Detection anomalies'],
    }
  }

  const aggN = calculerAgregats(balanceN)
  const aggN1 = calculerAgregats(balanceN1)

  function variation(n: number, n1: number): { pct: string; trend: 'up' | 'down' | 'stable' } {
    if (n1 === 0) return { pct: 'N/A', trend: 'stable' }
    const p = ((n - n1) / Math.abs(n1)) * 100
    return { pct: `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`, trend: p > 1 ? 'up' : p < -1 ? 'down' : 'stable' }
  }

  const vCA = variation(aggN.ca, aggN1.ca)
  const vResultat = variation(aggN.resultat, aggN1.resultat)
  const vTreso = variation(aggN.tresorerie, aggN1.tresorerie)
  const vDettes = variation(aggN.dettesTotal, aggN1.dettesTotal)

  const card: PredictionCard = {
    type: 'prediction',
    title: 'Tendances N vs N-1',
    indicators: [
      { label: 'Chiffre d\'affaires', value: `${fmt(aggN.ca)} (${vCA.pct})`, status: vCA.trend === 'up' ? 'bon' : vCA.trend === 'down' ? 'critique' : 'acceptable', trend: vCA.trend },
      { label: 'Resultat', value: `${fmt(aggN.resultat)} (${vResultat.pct})`, status: vResultat.trend === 'up' ? 'bon' : vResultat.trend === 'down' ? 'critique' : 'acceptable', trend: vResultat.trend },
      { label: 'Tresorerie', value: `${fmt(aggN.tresorerie)} (${vTreso.pct})`, status: vTreso.trend === 'up' ? 'bon' : 'acceptable', trend: vTreso.trend },
      { label: 'Endettement', value: `${fmt(aggN.dettesTotal)} (${vDettes.pct})`, status: vDettes.trend === 'down' ? 'bon' : vDettes.trend === 'up' ? 'critique' : 'acceptable', trend: vDettes.trend },
    ],
  }

  return {
    text: `**Tendances N vs N-1**`,
    content: [card],
    suggestions: ['Mes ratios', 'Estimation IS', 'Analyse generale'],
  }
}

// ── Prediction Anomaly ───────────────────────────────────────────────

export function handlePredictionAnomaly(balance: Balance[]): Proph3tResponse {
  if (!balance || balance.length === 0) return noBalanceResponse()

  const agg = calculerAgregats(balance)
  const anomalies: { label: string; value: string; status: Status }[] = []
  const recommendations: string[] = []

  // Comptes à solde inversé
  for (const line of balance) {
    const c = line.compte
    // Actif débiteur attendu
    if (/^[2-3]/.test(c) && line.solde < 0) {
      anomalies.push({ label: `Compte ${c} (solde inverse)`, value: `${fmt(line.solde)} FCFA`, status: 'critique' })
    }
    // Passif créditeur attendu (solde devrait etre negatif/crediteur)
    if (/^1[0-5]/.test(c) && line.solde > 0) {
      anomalies.push({ label: `Compte ${c} (solde debiteur)`, value: `${fmt(line.solde)} FCFA`, status: 'critique' })
    }
    // Fournisseurs débiteurs
    if (c.startsWith('40') && line.solde > 0) {
      anomalies.push({ label: `Fournisseur ${c} debiteur`, value: `${fmt(line.solde)} FCFA`, status: 'acceptable' })
    }
  }
  if (anomalies.filter(a => a.label.includes('solde inverse')).length > 0) {
    recommendations.push('Verifier les comptes a solde inverse — erreur de saisie probable')
  }

  // Ratio clients/CA > 6 mois
  if (agg.ca > 0 && (agg.clientsNets / agg.ca) * 360 > 180) {
    anomalies.push({
      label: 'Creances clients > 6 mois',
      value: `${Math.round((agg.clientsNets / agg.ca) * 360)} jours`,
      status: 'critique',
    })
    recommendations.push('Creances clients anormalement elevees — risque de creances douteuses')
  }

  // Trésorerie negative
  if (agg.tresorerie < 0) {
    anomalies.push({ label: 'Tresorerie negative', value: `${fmt(agg.tresorerie)} FCFA`, status: 'critique' })
    recommendations.push('Tresorerie negative — surveiller le risque de cessation de paiement')
  }

  // Résultat vs IMF
  const isResult = calculerIS(agg.resultat, agg.ca)
  if (agg.resultat > 0 && isResult.base === 'IMF') {
    anomalies.push({ label: 'Resultat < seuil IMF', value: `IS: ${fmt(isResult.is_brut)} < IMF: ${fmt(isResult.imf)}`, status: 'acceptable' })
    recommendations.push('Resultat insuffisant pour depasser l\'IMF — verifier les charges')
  }

  if (anomalies.length === 0) {
    anomalies.push({ label: 'Aucune anomalie detectee', value: 'OK', status: 'excellent' })
    recommendations.push('Aucune anomalie majeure detectee dans la balance')
  }

  const card: PredictionCard = {
    type: 'prediction',
    title: 'Detection d\'Anomalies',
    indicators: anomalies.slice(0, 8),
    narrative: `**${anomalies.filter(a => a.status === 'critique').length}** anomalie(s) critique(s) detectee(s) sur ${balance.length} lignes de balance.`,
    recommendations,
  }

  return {
    text: `**Detection d'anomalies** sur votre balance`,
    content: [card],
    suggestions: ['Mes ratios', 'Estimation IS', 'Analyse generale'],
  }
}

// ── Contrôle de Cohérence (depuis la balance) ────────────────────────

interface CoherenceResult {
  id: string
  description: string
  statut: 'CONFORME' | 'ECART' | 'ERREUR'
  valeur1: string
  valeur2: string
  ecart?: number
  recommandation?: string
}

function evalEcart(v1: number, v2: number, seuil: number): 'CONFORME' | 'ECART' | 'ERREUR' {
  const e = Math.abs(v1 - v2)
  if (e === 0) return 'CONFORME'
  if (e <= seuil) return 'ECART'
  return 'ERREUR'
}

export function handleCoherenceCheck(balance: Balance[]): Proph3tResponse {
  if (!balance || balance.length === 0) return noBalanceResponse()

  const controles: CoherenceResult[] = []
  const recommendations: string[] = []

  // ── C01 — Equilibre balance générale : sum(debit) = sum(credit) ──
  let totalDebit = 0, totalCredit = 0
  for (const line of balance) {
    totalDebit += line.debit || 0
    totalCredit += line.credit || 0
  }
  const ecartBalance = Math.abs(totalDebit - totalCredit)
  controles.push({
    id: 'C01',
    description: 'Equilibre balance generale (Debits = Credits)',
    statut: evalEcart(totalDebit, totalCredit, 10),
    valeur1: `Debits: ${fmt(totalDebit)}`,
    valeur2: `Credits: ${fmt(totalCredit)}`,
    ecart: ecartBalance,
    recommandation: ecartBalance > 10 ? 'La balance n\'est pas equilibree — verifier les ecritures de cloture' : undefined,
  })

  // ── C02 — Equilibre bilan : Actif = Passif ──
  // Actif = classes 2-5 (solde débiteur) = immobilisations + stocks + trésorerie + créances
  // Passif = classe 1 (capitaux) + classe 4 créditeur (fournisseurs, dettes fiscales)
  let totalActif = 0, totalPassif = 0
  for (const line of balance) {
    const c = line.compte
    const s = line.solde
    // Actif : classes 2,3,5 + classe 4 débiteur
    if (/^[235]/.test(c)) {
      if (s > 0) totalActif += s
      else totalPassif += Math.abs(s)
    }
    // Classe 4 : débiteur = actif, créditeur = passif
    if (c.startsWith('4')) {
      if (s > 0) totalActif += s
      else totalPassif += Math.abs(s)
    }
    // Classe 1 : capitaux propres + dettes (toujours passif)
    if (c.startsWith('1')) {
      totalPassif += Math.abs(s)
    }
  }
  // Résultat P&L (classe 7 - classe 6) doit être inclus dans le passif
  const agg = calculerAgregats(balance)
  // agg.resultat is already included in agg.capitauxPropres, and classe 1 is in totalPassif
  // But classes 6 and 7 are not in actif/passif — they affect result which is in equity
  // The result is the bridge between P&L and balance sheet
  const ecartBilan = Math.abs(totalActif - totalPassif - agg.resultat)
  controles.push({
    id: 'C02',
    description: 'Equilibre bilan (Actif = Passif + Resultat)',
    statut: evalEcart(totalActif, totalPassif + agg.resultat, 1000),
    valeur1: `Actif: ${fmt(totalActif)}`,
    valeur2: `Passif+Res: ${fmt(totalPassif + agg.resultat)}`,
    ecart: ecartBilan,
    recommandation: ecartBilan > 1000 ? 'L\'equilibre du bilan n\'est pas respecte — verifier les comptes de liaison et d\'attente' : undefined,
  })

  // ── C03 — Résultat cohérent : (Cl.7 - Cl.6) ≈ solde compte 13 ──
  const resultatPL = agg.resultat
  let resultatBilan = 0
  let hasCompte13 = false
  for (const line of balance) {
    if (line.compte.startsWith('13')) {
      resultatBilan += line.solde
      hasCompte13 = true
    }
  }
  if (hasCompte13) {
    // Le compte 13 est créditeur (solde négatif = bénéfice), le résultat P&L est positif = bénéfice
    // Attention : le résultat P&L de l'exercice en cours n'est souvent pas encore affecté au compte 13
    const ecartResultat = Math.abs(resultatPL + resultatBilan) // resultatBilan est négatif si bénéfice
    controles.push({
      id: 'C03',
      description: 'Resultat P&L vs Compte 13 (report a nouveau)',
      statut: ecartResultat < 1000 ? 'CONFORME' : 'ECART',
      valeur1: `P&L (Cl.7-Cl.6): ${fmt(resultatPL)}`,
      valeur2: `Compte 13: ${fmt(-resultatBilan)}`,
      ecart: ecartResultat,
      recommandation: ecartResultat >= 1000 ? 'Normal si le resultat N n\'est pas encore affecte au compte 13. Verifier apres cloture.' : undefined,
    })
  }

  // ── C04 — Amortissements ≤ Immobilisations brutes ──
  if (agg.immoBrutes > 0) {
    const ratioAmort = agg.amortissements / agg.immoBrutes
    controles.push({
      id: 'C04',
      description: 'Amortissements ≤ Immobilisations brutes',
      statut: agg.amortissements <= agg.immoBrutes ? 'CONFORME' : 'ERREUR',
      valeur1: `Amort (28-29): ${fmt(agg.amortissements)}`,
      valeur2: `Immo brut (20-27): ${fmt(agg.immoBrutes)}`,
      ecart: agg.amortissements > agg.immoBrutes ? agg.amortissements - agg.immoBrutes : 0,
      recommandation: agg.amortissements > agg.immoBrutes
        ? 'ERREUR : les amortissements depassent les immobilisations brutes — verifier les ecritures de cession'
        : ratioAmort > 0.9 ? 'Immobilisations amorties a plus de 90% — prevoir le renouvellement' : undefined,
    })
  }

  // ── C05 — TVA cohérente : TVA nette ≈ TVA collectée - TVA déductible ──
  if (agg.tvaCollectee > 0 || agg.tvaDeductible > 0) {
    let tvaNette4441 = 0
    for (const line of balance) {
      if (line.compte.startsWith('4441') || line.compte.startsWith('4449')) {
        tvaNette4441 += line.solde
      }
    }
    const tvaCalculee = agg.tvaCollectee - agg.tvaDeductible
    // Si pas de compte 4441, on vérifie juste la cohérence des sous-comptes
    if (Math.abs(tvaNette4441) > 0) {
      const ecartTVA = Math.abs(tvaCalculee - Math.abs(tvaNette4441))
      controles.push({
        id: 'C05',
        description: 'Coherence TVA (4431 - 4452 ≈ 4441)',
        statut: evalEcart(tvaCalculee, Math.abs(tvaNette4441), 5000),
        valeur1: `Calcule: ${fmt(tvaCalculee)}`,
        valeur2: `Compte 4441: ${fmt(Math.abs(tvaNette4441))}`,
        ecart: ecartTVA,
        recommandation: ecartTVA > 5000 ? 'Ecart entre TVA calculee et TVA declaree — verifier les declarations mensuelles' : undefined,
      })
    } else {
      controles.push({
        id: 'C05',
        description: 'Position TVA (collectee vs deductible)',
        statut: 'CONFORME',
        valeur1: `Collectee (4431): ${fmt(agg.tvaCollectee)}`,
        valeur2: `Deductible (4452): ${fmt(agg.tvaDeductible)}`,
        recommandation: tvaCalculee > 0 ? `TVA a reverser : ${fmt(tvaCalculee)} FCFA` : `Credit de TVA : ${fmt(Math.abs(tvaCalculee))} FCFA`,
      })
    }
  }

  // ── C06 — Capital social positif ──
  if (agg.capitalSocial !== 0) {
    // Capital social doit être créditeur (solde négatif dans notre convention solde = debit - credit)
    const capitalOK = agg.capitalSocial < 0 // Créditeur = valeur négative
    controles.push({
      id: 'C06',
      description: 'Capital social (compte 10) — solde crediteur attendu',
      statut: capitalOK ? 'CONFORME' : 'ERREUR',
      valeur1: `Capital: ${fmt(Math.abs(agg.capitalSocial))} FCFA`,
      valeur2: capitalOK ? 'Crediteur (correct)' : 'Debiteur (anormal)',
      recommandation: !capitalOK ? 'ERREUR : capital social debiteur — verifier les ecritures de constitution ou d\'augmentation' : undefined,
    })
  }

  // ── C07 — Fournisseurs débiteurs suspects ──
  const fournDebiteurs: string[] = []
  for (const line of balance) {
    if (line.compte.startsWith('40') && !line.compte.startsWith('409') && line.solde > 0) {
      fournDebiteurs.push(line.compte)
    }
  }
  if (fournDebiteurs.length > 0) {
    controles.push({
      id: 'C07',
      description: `Fournisseurs debiteurs (${fournDebiteurs.length} compte${fournDebiteurs.length > 1 ? 's' : ''})`,
      statut: fournDebiteurs.length > 3 ? 'ECART' : 'CONFORME',
      valeur1: `${fournDebiteurs.length} comptes`,
      valeur2: fournDebiteurs.slice(0, 5).join(', '),
      recommandation: fournDebiteurs.length > 3 ? 'Nombre eleve de fournisseurs debiteurs — verifier les avances et les acomptes' : undefined,
    })
  }

  // ── C08 — Clients créditeurs suspects ──
  const clientsCrediteurs: string[] = []
  for (const line of balance) {
    if (line.compte.startsWith('41') && line.solde < 0) {
      clientsCrediteurs.push(line.compte)
    }
  }
  if (clientsCrediteurs.length > 0) {
    controles.push({
      id: 'C08',
      description: `Clients crediteurs (${clientsCrediteurs.length} compte${clientsCrediteurs.length > 1 ? 's' : ''})`,
      statut: clientsCrediteurs.length > 3 ? 'ECART' : 'CONFORME',
      valeur1: `${clientsCrediteurs.length} comptes`,
      valeur2: clientsCrediteurs.slice(0, 5).join(', '),
      recommandation: clientsCrediteurs.length > 3 ? 'Nombre eleve de clients crediteurs — verifier les avances recues et les avoirs' : undefined,
    })
  }

  // ── C09-C11 — Cross-statement controls (balance vs annexes) ──
  try {
    const annexeEntries = toBalanceEntries(balance)
    const annexes = generateAnnexeData(annexeEntries)

    // C09: Immobilisations bilan vs Note 4
    if (annexes[4]?.tableau) {
      const note4Total = annexes[4].tableau.lignes?.reduce((s: number, l: any) => s + (l.brut_n || 0), 0) || 0
      if (note4Total > 0) {
        const ecartImmo = Math.abs(agg.immoBrutes - note4Total)
        controles.push({
          id: 'C09',
          description: 'Immo brutes bilan vs Note 4',
          statut: evalEcart(agg.immoBrutes, note4Total, 1000),
          valeur1: `Bilan (20-27): ${fmt(agg.immoBrutes)}`,
          valeur2: `Note 4: ${fmt(note4Total)}`,
          ecart: ecartImmo,
          recommandation: ecartImmo > 1000 ? 'Ecart entre immobilisations du bilan et Note 4 — verifier les mouvements' : undefined,
        })
      }
    }

    // C10: Clients bilan vs Note 7
    if (annexes[7]?.tableau) {
      const note7Total = annexes[7].tableau.lignes?.reduce((s: number, l: any) => s + (l.brut_n || l.net_n || 0), 0) || 0
      if (note7Total > 0) {
        const ecartClients = Math.abs(agg.clientsNets - note7Total)
        controles.push({
          id: 'C10',
          description: 'Clients bilan vs Note 7',
          statut: evalEcart(agg.clientsNets, note7Total, 1000),
          valeur1: `Bilan (41): ${fmt(agg.clientsNets)}`,
          valeur2: `Note 7: ${fmt(note7Total)}`,
          ecart: ecartClients,
          recommandation: ecartClients > 1000 ? 'Ecart entre creances clients et Note 7 — verifier les provisions pour depreciation' : undefined,
        })
      }
    }
  } catch {
    // Annexe generation failed — skip cross-statement controls
  }

  // C11: Total CA = somme comptes 70-75
  {
    let ca7075 = 0
    for (const line of balance) {
      if (/^7[0-5]/.test(line.compte)) ca7075 += Math.max(0, -line.solde)
    }
    if (ca7075 > 0) {
      controles.push({
        id: 'C11',
        description: 'CA total = somme comptes 70 a 75',
        statut: agg.ca === ca7075 ? 'CONFORME' : 'ECART',
        valeur1: `Agregat CA: ${fmt(agg.ca)}`,
        valeur2: `Somme 70-75: ${fmt(ca7075)}`,
        ecart: Math.abs(agg.ca - ca7075),
        recommandation: agg.ca !== ca7075 ? 'Ecart dans le calcul du CA — verifier la methode d\'agregation' : undefined,
      })
    }
  }

  // ── Build response ──
  const conformes = controles.filter(c => c.statut === 'CONFORME').length
  const ecarts = controles.filter(c => c.statut === 'ECART').length
  const erreurs = controles.filter(c => c.statut === 'ERREUR').length
  const score = controles.length > 0 ? Math.round((conformes / controles.length) * 100) : 0

  const scoreStatus: Status = score >= 90 ? 'excellent' : score >= 70 ? 'bon' : score >= 50 ? 'acceptable' : 'critique'

  // Indicators for summary card
  const indicators: PredictionCard['indicators'] = [
    { label: 'Score coherence', value: `${score}%`, status: scoreStatus },
    { label: 'Controles', value: `${controles.length}`, status: 'bon' },
    { label: 'Conformes', value: `${conformes}`, status: conformes === controles.length ? 'excellent' : 'bon' },
    { label: 'Ecarts', value: `${ecarts}`, status: ecarts === 0 ? 'bon' : 'acceptable' },
    { label: 'Erreurs', value: `${erreurs}`, status: erreurs === 0 ? 'bon' : 'critique' },
  ]

  // Add detail indicators for non-CONFORME checks
  for (const c of controles) {
    if (c.statut !== 'CONFORME') {
      indicators.push({
        label: `${c.id} — ${c.description}`,
        value: c.ecart ? `Ecart: ${fmt(c.ecart)}` : c.valeur1,
        status: c.statut === 'ERREUR' ? 'critique' : 'acceptable',
      })
    }
  }

  // Recommendations from failures
  for (const c of controles) {
    if (c.recommandation && c.statut !== 'CONFORME') {
      recommendations.push(c.recommandation)
    }
  }
  if (recommendations.length === 0) {
    recommendations.push('Tous les controles de coherence sont conformes — excellente qualite comptable')
  }

  // Detail card with all checks
  const detailItems: { label: string; value: string }[] = []
  for (const c of controles) {
    const icon = c.statut === 'CONFORME' ? 'OK' : c.statut === 'ECART' ? '/!\\' : 'ERR'
    detailItems.push({
      label: `[${icon}] ${c.id} — ${c.description}`,
      value: c.statut,
    })
    detailItems.push({
      label: `   ${c.valeur1}`,
      value: c.valeur2,
    })
    if (c.recommandation) {
      detailItems.push({ label: `   Recommandation`, value: c.recommandation })
    }
  }

  const summaryCard: PredictionCard = {
    type: 'prediction',
    title: 'Controle de Coherence',
    indicators: indicators.slice(0, 12),
    narrative: `**${controles.length} controles** de coherence executes. Score : **${score}%** (${scoreStatus}). ${erreurs > 0 ? `**${erreurs} erreur${erreurs > 1 ? 's' : ''}** detectee${erreurs > 1 ? 's' : ''} — correction necessaire.` : ecarts > 0 ? `${ecarts} ecart${ecarts > 1 ? 's' : ''} mineur${ecarts > 1 ? 's' : ''} a surveiller.` : 'Aucune anomalie de coherence detectee.'}`,
    recommendations: recommendations.slice(0, 5),
  }

  const detailCard: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Detail des Controles de Coherence',
    items: detailItems,
  }

  return {
    text: `**Controle de Coherence Comptable** — ${controles.length} verifications croisees`,
    content: [summaryCard, detailCard],
    suggestions: ['Estimation IS', 'Mes ratios', 'Detection anomalies', 'Analyse generale'],
  }
}

// ── Prediction General ───────────────────────────────────────────────

export function handlePredictionGeneral(balanceN: Balance[], _balanceN1?: Balance[]): Proph3tResponse {
  if (!balanceN || balanceN.length === 0) return noBalanceResponse()

  const agg = calculerAgregats(balanceN)
  const ext = calculerAgregatsEtendus(balanceN)

  // Health score (0-100)
  let score = 50
  const forces: string[] = []
  const risques: string[] = []

  const liquidite = agg.passifCirculant > 0 ? agg.actifCirculant / agg.passifCirculant : (agg.actifCirculant > 0 ? 99 : 0)
  const endettement = agg.capitauxPropres !== 0 ? agg.dettesTotal / Math.abs(agg.capitauxPropres) : 0

  // Liquidité
  if (liquidite >= 1.5) { score += 10; forces.push(`Liquidite excellente (${liquidite.toFixed(2)})`) }
  else if (liquidite >= 1) { score += 5; forces.push(`Liquidite correcte (${liquidite.toFixed(2)})`) }
  else { score -= 10; risques.push(`Liquidite insuffisante (${liquidite.toFixed(2)})`) }

  // Endettement
  if (endettement < 0.5) { score += 10; forces.push('Faible endettement') }
  else if (endettement < 1) { score += 5 }
  else if (endettement > 2) { score -= 15; risques.push(`Endettement eleve (${endettement.toFixed(2)})`) }
  else { score -= 5; risques.push(`Endettement modere (${endettement.toFixed(2)})`) }

  // Résultat
  if (agg.resultat > 0) { score += 10; forces.push(`Resultat positif (${fmt(agg.resultat)} FCFA)`) }
  else { score -= 15; risques.push('Resultat deficitaire') }

  // Trésorerie
  if (agg.tresorerie > 0) { score += 5; forces.push('Tresorerie positive') }
  else { score -= 10; risques.push('Tresorerie negative') }

  // CA
  if (agg.ca > 0) { score += 5 }
  else { score -= 10; risques.push('Pas de chiffre d\'affaires') }

  // Fonds de roulement
  const fr = agg.capitauxPropres - agg.immoNettes
  if (fr > 0) { score += 5; forces.push('Fonds de roulement positif') }
  else { score -= 5; risques.push('Fonds de roulement negatif') }

  // BFR check
  const bfr = agg.actifCirculant - agg.passifCirculant
  const tresoNette = fr - bfr
  if (bfr > fr && fr > 0) { score -= 5; risques.push('BFR > Fonds de roulement') }
  else if (bfr <= 0) { score += 3; forces.push('BFR maitrise') }

  // EBE check (simple)
  const entries = toBalanceEntries(balanceN)
  const ventesM = sigProduits(entries, ['701'])
  const achatsM = sigCharges(entries, ['601'])
  const mc = ventesM - achatsM
  const prodVendue = sigProduits(entries, ['702', '703', '704', '705', '706', '707'])
  const production = prodVendue + sigProduits(entries, ['73', '72'])
  const va = mc + production - sigCharges(entries, ['602', '604', '605', '608', '61', '62', '63', '6032', '6033'])
  const ebe = va + sigProduits(entries, ['71']) - sigCharges(entries, ['64']) - sigCharges(entries, ['66'])
  if (ebe > 0) { score += 3; forces.push(`EBE positif (${fmt(ebe)} FCFA)`) }
  else if (ebe < 0) { score -= 5; risques.push('EBE negatif') }

  // Seuil de rentabilité check
  const cf = agg.chargesPersonnel + ext.dotationsAmort + agg.chargesFinancieres + ext.chargesExternes
  const cv = ext.achats + ext.impotsTaxes
  const tauxMCV = agg.ca > 0 ? 1 - (cv / agg.ca) : 0
  const seuil = tauxMCV > 0 ? cf / tauxMCV : 0
  if (agg.ca > seuil && seuil > 0) { score += 3; forces.push('CA > seuil de rentabilite') }
  else if (seuil > 0) { score -= 5; risques.push('CA < seuil de rentabilite') }

  score = Math.max(0, Math.min(100, score))

  const healthStatus: Status = score >= 75 ? 'excellent' : score >= 50 ? 'bon' : score >= 30 ? 'acceptable' : 'critique'

  const card: PredictionCard = {
    type: 'prediction',
    title: 'Synthese Financiere',
    indicators: [
      { label: 'Score sante', value: `${score}/100`, status: healthStatus },
      { label: 'Chiffre d\'affaires', value: `${fmt(agg.ca)} FCFA`, status: agg.ca > 0 ? 'bon' : 'critique' },
      { label: 'Resultat', value: `${fmt(agg.resultat)} FCFA`, status: agg.resultat > 0 ? 'bon' : 'critique' },
      { label: 'EBE', value: `${fmt(ebe)} FCFA`, status: ebe > 0 ? 'bon' : 'critique' },
      { label: 'BFR', value: `${fmt(bfr)} FCFA`, status: bfr <= fr ? 'bon' : 'critique' },
      { label: 'Tresorerie nette', value: `${fmt(tresoNette)} FCFA`, status: tresoNette >= 0 ? 'bon' : 'critique' },
      { label: 'Seuil rentabilite', value: seuil > 0 ? `${fmt(seuil)} FCFA` : 'N/A', status: agg.ca > seuil ? 'bon' : 'critique' },
      { label: 'Liquidite', value: liquidite.toFixed(2), status: liquidite >= 1 ? 'bon' : 'critique' },
    ],
    narrative: `Score de sante financiere : **${score}/100** (${healthStatus}). ${forces.length > 0 ? 'Points forts : ' + forces.slice(0, 4).join(', ') + '.' : ''} ${risques.length > 0 ? 'Risques : ' + risques.slice(0, 4).join(', ') + '.' : ''}`,
    recommendations: [
      ...risques.slice(0, 3).map(r => `Corriger : ${r}`),
      ...(score >= 50 ? ['Maintenir la bonne gestion'] : ['Attention — situation financiere fragile']),
    ],
  }

  return {
    text: `**Diagnostic Financier Global**`,
    content: [card],
    suggestions: ['SIG', 'BFR', 'Seuil de rentabilite', 'Mes ratios', 'Estimation IS'],
  }
}

// ── Bridge Balance[] → BalanceEntry[] for liasseDataService ─────────

function toBalanceEntries(balance: Balance[]): BalanceEntry[] {
  return balance.map(b => ({
    compte: b.compte,
    intitule: b.libelle_compte || '',
    debit: b.debit,
    credit: b.credit,
    solde_debit: Math.max(0, b.solde),
    solde_credit: Math.max(0, -b.solde),
  }))
}

// ── SIG helpers ─────────────────────────────────────────────────────

function sigProduits(entries: BalanceEntry[], prefixes: string[]): number {
  let total = 0
  for (const e of entries) {
    for (const p of prefixes) {
      if (e.compte.startsWith(p)) { total += e.solde_credit; break }
    }
  }
  return total
}

function sigCharges(entries: BalanceEntry[], prefixes: string[]): number {
  let total = 0
  for (const e of entries) {
    for (const p of prefixes) {
      if (e.compte.startsWith(p)) { total += e.solde_debit; break }
    }
  }
  return total
}

// ── PREDICTION_SIG ──────────────────────────────────────────────────

export function handlePredictionSIG(balance: Balance[]): Proph3tResponse {
  if (!balance || balance.length === 0) return noBalanceResponse()

  const entries = toBalanceEntries(balance)

  // Marge Commerciale = Ventes marchandises (701) - Achats marchandises (601) - Var stocks (6031)
  const ventesM = sigProduits(entries, ['701'])
  const achatsM = sigCharges(entries, ['601'])
  const varStocksM = sigCharges(entries, ['6031'])
  const margeCommerciale = ventesM - achatsM - varStocksM

  // Production de l'Exercice = Prod vendue (702-707) + Prod stockée (73) + Prod immobilisée (72)
  const prodVendue = sigProduits(entries, ['702', '703', '704', '705', '706', '707'])
  const prodStockee = sigProduits(entries, ['73'])
  const prodImmobilisee = sigProduits(entries, ['72'])
  const production = prodVendue + prodStockee + prodImmobilisee

  // Valeur Ajoutée = MC + Prod - Achats matières (602) - Var stocks mat (6032,6033) - Services ext (604-63)
  const achatsMat = sigCharges(entries, ['602'])
  const varStocksMat = sigCharges(entries, ['6032', '6033'])
  const servicesExt = sigCharges(entries, ['604', '605', '608', '61', '62', '63'])
  const valeurAjoutee = margeCommerciale + production - achatsMat - varStocksMat - servicesExt

  // EBE = VA + Subventions expl (71) - Impôts/taxes (64) - Charges personnel (66)
  const subventions = sigProduits(entries, ['71'])
  const impotsTaxes = sigCharges(entries, ['64'])
  const chargesPersonnel = sigCharges(entries, ['66'])
  const ebe = valeurAjoutee + subventions - impotsTaxes - chargesPersonnel

  // Résultat d'Exploitation = EBE + Reprises (791,798,799) + Transferts charges (781,782) + Autres prod (75) - Dotations (681,691) - Autres charges (65)
  const reprises = sigProduits(entries, ['791', '798', '799'])
  const transferts = sigProduits(entries, ['781', '782'])
  const autresProd = sigProduits(entries, ['75'])
  const dotations = sigCharges(entries, ['681', '691'])
  const autresCharges = sigCharges(entries, ['65'])
  const resultatExpl = ebe + reprises + transferts + autresProd - dotations - autresCharges

  // Résultat Financier = Produits financiers (77,787,797) - Charges financières (67,687,697)
  const prodFin = sigProduits(entries, ['77', '787', '797'])
  const chargesFin = sigCharges(entries, ['67', '687', '697'])
  const resultatFin = prodFin - chargesFin

  // RAO = Résultat exploitation + Résultat financier
  const rao = resultatExpl + resultatFin

  // Résultat HAO
  const prodHAO = sigProduits(entries, ['82', '84', '86', '88'])
  const chargesHAO = sigCharges(entries, ['81', '83', '85'])
  const resultatHAO = prodHAO - chargesHAO

  // Résultat Net = RAO + HAO - Impôt (87) - Participation (89)
  const impotBenef = sigCharges(entries, ['87'])
  const participation = sigCharges(entries, ['89'])
  const resultatNet = rao + resultatHAO - impotBenef - participation

  // CAFG = Résultat net + Dotations amort (68) - Reprises amort (78) + VNC cessions (81) - Prod cessions (82)
  const dotationsAll = sigCharges(entries, ['68'])
  const reprisesAll = sigProduits(entries, ['78'])
  const vncCessions = sigCharges(entries, ['81'])
  const prodCessions = sigProduits(entries, ['82'])
  const cafg = resultatNet + dotationsAll - reprisesAll + vncCessions - prodCessions

  const evalSIG = (v: number): Status => v > 0 ? 'bon' : v === 0 ? 'acceptable' : 'critique'

  const card: PredictionCard = {
    type: 'prediction',
    title: 'Soldes Intermediaires de Gestion (SIG)',
    indicators: [
      { label: 'Marge commerciale', value: `${fmt(margeCommerciale)} FCFA`, status: evalSIG(margeCommerciale) },
      { label: 'Valeur ajoutee', value: `${fmt(valeurAjoutee)} FCFA`, status: evalSIG(valeurAjoutee) },
      { label: 'EBE', value: `${fmt(ebe)} FCFA`, status: evalSIG(ebe) },
      { label: 'Resultat exploitation', value: `${fmt(resultatExpl)} FCFA`, status: evalSIG(resultatExpl) },
      { label: 'Resultat financier', value: `${fmt(resultatFin)} FCFA`, status: evalSIG(resultatFin) },
      { label: 'Resultat net', value: `${fmt(resultatNet)} FCFA`, status: evalSIG(resultatNet) },
      { label: 'CAFG', value: `${fmt(cafg)} FCFA`, status: evalSIG(cafg) },
    ],
    narrative: buildSIGNarrative(margeCommerciale, valeurAjoutee, ebe, resultatExpl, resultatNet, cafg),
    recommendations: buildSIGRecommendations(margeCommerciale, valeurAjoutee, ebe, resultatExpl, resultatFin, resultatNet, cafg),
  }

  // Detail card with full cascade
  const detailItems: { label: string; value: string }[] = [
    { label: '── ACTIVITE COMMERCIALE ──', value: '' },
    { label: 'Ventes de marchandises (701)', value: `${fmt(ventesM)} FCFA` },
    { label: '- Achats de marchandises (601)', value: `${fmt(achatsM)} FCFA` },
    { label: '- Variation stocks marchandises (6031)', value: `${fmt(varStocksM)} FCFA` },
    { label: '= MARGE COMMERCIALE', value: `${fmt(margeCommerciale)} FCFA` },
    { label: '── PRODUCTION ──', value: '' },
    { label: 'Production vendue (702-707)', value: `${fmt(prodVendue)} FCFA` },
    { label: 'Production stockee (73)', value: `${fmt(prodStockee)} FCFA` },
    { label: 'Production immobilisee (72)', value: `${fmt(prodImmobilisee)} FCFA` },
    { label: '= PRODUCTION DE L\'EXERCICE', value: `${fmt(production)} FCFA` },
    { label: '── VALEUR AJOUTEE ──', value: '' },
    { label: 'MC + Production', value: `${fmt(margeCommerciale + production)} FCFA` },
    { label: '- Consommations intermediaires', value: `${fmt(achatsMat + varStocksMat + servicesExt)} FCFA` },
    { label: '= VALEUR AJOUTEE', value: `${fmt(valeurAjoutee)} FCFA` },
    { label: '── EBE ──', value: '' },
    { label: 'VA + Subventions expl (71)', value: `${fmt(valeurAjoutee + subventions)} FCFA` },
    { label: '- Impots et taxes (64)', value: `${fmt(impotsTaxes)} FCFA` },
    { label: '- Charges personnel (66)', value: `${fmt(chargesPersonnel)} FCFA` },
    { label: '= EBE', value: `${fmt(ebe)} FCFA` },
    { label: '── RESULTATS ──', value: '' },
    { label: 'Resultat d\'exploitation', value: `${fmt(resultatExpl)} FCFA` },
    { label: 'Resultat financier', value: `${fmt(resultatFin)} FCFA` },
    { label: 'RAO (expl + fin)', value: `${fmt(rao)} FCFA` },
    { label: 'Resultat HAO', value: `${fmt(resultatHAO)} FCFA` },
    { label: 'Resultat net', value: `${fmt(resultatNet)} FCFA` },
    { label: 'CAFG', value: `${fmt(cafg)} FCFA` },
  ]

  const detailCard: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Cascade SIG Complete — SYSCOHADA Revise',
    items: detailItems,
  }

  return {
    text: `**Soldes Intermediaires de Gestion (SIG)** — cascade complete depuis votre balance`,
    content: [card, detailCard],
    suggestions: ['Seuil de rentabilite', 'BFR', 'Mes ratios', 'Estimation IS'],
  }
}

function buildSIGNarrative(mc: number, va: number, ebe: number, rex: number, rn: number, cafg: number): string {
  const parts: string[] = []
  if (mc > 0) parts.push(`Marge commerciale de **${fmt(mc)} FCFA**`)
  else if (mc === 0) parts.push('Pas d\'activite de negoce')
  else parts.push(`Marge commerciale **negative** — achats > ventes`)

  if (va > 0) parts.push(`Valeur ajoutee **${fmt(va)} FCFA** — richesse creee par l'entreprise`)
  else parts.push(`VA **negative** — les consommations intermediaires depassent la production`)

  if (ebe > 0) parts.push(`EBE positif (${fmt(ebe)} FCFA)`)
  else parts.push(`EBE **negatif** — l'exploitation ne genere pas de tresorerie`)

  if (rn !== rex) parts.push(`Ecart exploitation/net de ${fmt(Math.abs(rn - rex))} FCFA`)
  if (cafg > 0) parts.push(`CAFG de ${fmt(cafg)} FCFA — capacite d'autofinancement`)

  return parts.join('. ') + '.'
}

function buildSIGRecommendations(mc: number, va: number, ebe: number, rex: number, rf: number, rn: number, cafg: number): string[] {
  const recs: string[] = []
  if (mc < 0) recs.push('Marge commerciale negative — revoir la politique tarifaire ou negocier les achats')
  if (va < 0) recs.push('VA negative — l\'entreprise detruit de la valeur, reduire les charges externes')
  if (ebe < 0) recs.push('EBE negatif — l\'exploitation ne genere pas de cash, restructurer les charges fixes')
  if (rex > 0 && rf < 0 && Math.abs(rf) > rex * 0.5) recs.push('Charges financieres excessives — elles absorbent plus de 50% du resultat d\'exploitation')
  if (rn < 0) recs.push('Resultat net deficitaire — analyser les causes (exploitation, financier ou HAO)')
  if (cafg <= 0) recs.push('CAFG nulle ou negative — aucune capacite d\'autofinancement')
  if (cafg > 0 && va > 0) recs.push(`Taux de CAFG/VA = ${((cafg / va) * 100).toFixed(1)}% — ${cafg / va > 0.15 ? 'bon niveau' : 'a ameliorer'}`)
  if (recs.length === 0) recs.push('Cascade SIG equilibree — bonne performance globale')
  return recs.slice(0, 5)
}

// ── PREDICTION_BREAKEVEN (Seuil de Rentabilité) ─────────────────────

export function handlePredictionBreakeven(balance: Balance[]): Proph3tResponse {
  if (!balance || balance.length === 0) return noBalanceResponse()

  const agg = calculerAgregats(balance)
  const ext = calculerAgregatsEtendus(balance)

  // Charges fixes (CF) ≈ charges personnel (66) + dotations (68) + charges financières (67) + loyers/assurances (61-62 approx)
  const cf = agg.chargesPersonnel + ext.dotationsAmort + agg.chargesFinancieres + ext.chargesExternes
  // Charges variables (CV) ≈ achats (60) + variations stocks + impôts taxes (63-64)
  const cv = ext.achats + ext.impotsTaxes
  // CA
  const ca = agg.ca

  if (ca <= 0) {
    return {
      text: "**Seuil de rentabilite** — Impossible a calculer sans chiffre d'affaires.\n\nImportez une balance avec des produits d'exploitation (comptes 70-75).",
      suggestions: ['Estimation IS', 'Mes ratios', 'Aide'],
    }
  }

  const tauxMCV = 1 - (cv / ca) // Taux de marge sur coûts variables
  const seuil = tauxMCV > 0 ? cf / tauxMCV : 0
  const margeSecurite = ca > 0 ? ((ca - seuil) / ca) * 100 : 0
  const pointMortJours = ca > 0 ? (seuil / ca) * 360 : 0
  const indiceSecurite = ca > seuil

  const seuilStatus: Status = indiceSecurite ? 'bon' : 'critique'
  const margeStatus: Status = margeSecurite > 20 ? 'excellent' : margeSecurite > 10 ? 'bon' : margeSecurite > 0 ? 'acceptable' : 'critique'

  const card: PredictionCard = {
    type: 'prediction',
    title: 'Seuil de Rentabilite',
    indicators: [
      { label: 'Chiffre d\'affaires', value: `${fmt(ca)} FCFA`, status: 'bon' },
      { label: 'Charges fixes', value: `${fmt(cf)} FCFA`, status: 'bon' },
      { label: 'Charges variables', value: `${fmt(cv)} FCFA`, status: 'bon' },
      { label: 'Taux MCV', value: `${(tauxMCV * 100).toFixed(1)}%`, status: tauxMCV > 0.3 ? 'bon' : 'acceptable' },
      { label: 'Seuil de rentabilite', value: `${fmt(seuil)} FCFA`, status: seuilStatus },
      { label: 'Marge de securite', value: `${margeSecurite.toFixed(1)}%`, status: margeStatus },
      { label: 'Point mort', value: `${Math.round(pointMortJours)} jours`, status: pointMortJours <= 270 ? 'bon' : 'critique' },
    ],
    narrative: indiceSecurite
      ? `Le CA de **${fmt(ca)} FCFA** depasse le seuil de rentabilite de **${fmt(seuil)} FCFA**. Marge de securite de **${margeSecurite.toFixed(1)}%** — le point mort est atteint au **jour ${Math.round(pointMortJours)}** de l'exercice.`
      : `Le CA de **${fmt(ca)} FCFA** est **inferieur** au seuil de rentabilite de **${fmt(seuil)} FCFA**. L'entreprise est en zone de perte.`,
    recommendations: buildBreakevenRecommendations(indiceSecurite, margeSecurite, cf, cv, ca, tauxMCV),
  }

  const detailItems: { label: string; value: string }[] = [
    { label: '── DECOMPOSITION DES CHARGES ──', value: '' },
    { label: 'Charges de personnel (66)', value: `${fmt(agg.chargesPersonnel)} FCFA` },
    { label: 'Dotations amort/prov (68)', value: `${fmt(ext.dotationsAmort)} FCFA` },
    { label: 'Charges financieres (67)', value: `${fmt(agg.chargesFinancieres)} FCFA` },
    { label: 'Services exterieurs (61-62)', value: `${fmt(ext.chargesExternes)} FCFA` },
    { label: 'Total charges fixes', value: `${fmt(cf)} FCFA` },
    { label: 'Achats (60)', value: `${fmt(ext.achats)} FCFA` },
    { label: 'Impots et taxes (63-64)', value: `${fmt(ext.impotsTaxes)} FCFA` },
    { label: 'Total charges variables', value: `${fmt(cv)} FCFA` },
    { label: '── CALCUL ──', value: '' },
    { label: 'Taux MCV = 1 - (CV/CA)', value: `${(tauxMCV * 100).toFixed(1)}%` },
    { label: 'Seuil = CF / Taux MCV', value: `${fmt(seuil)} FCFA` },
    { label: 'Marge securite = (CA - Seuil) / CA', value: `${margeSecurite.toFixed(1)}%` },
    { label: 'Point mort = (Seuil / CA) x 360', value: `${Math.round(pointMortJours)} jours` },
  ]

  const detailCard: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Detail Seuil de Rentabilite',
    items: detailItems,
  }

  return {
    text: `**Seuil de Rentabilite** — analyse depuis votre balance`,
    content: [card, detailCard],
    suggestions: ['SIG', 'BFR', 'Mes ratios', 'Analyse generale'],
  }
}

function buildBreakevenRecommendations(profitable: boolean, marge: number, cf: number, cv: number, ca: number, tauxMCV: number): string[] {
  const recs: string[] = []
  if (!profitable) {
    recs.push('CA inferieur au seuil — augmenter le volume de ventes ou reduire les charges fixes')
    recs.push('Analyser chaque poste de charges fixes pour identifier des economies possibles')
  }
  if (marge < 10 && profitable) recs.push('Marge de securite < 10% — situation fragile, toute baisse de CA peut entrainer des pertes')
  if (tauxMCV < 0.2) recs.push('Taux de MCV tres faible — les charges variables absorbent l\'essentiel du CA')
  if (cf > ca * 0.5) recs.push(`Charges fixes = ${((cf / ca) * 100).toFixed(0)}% du CA — structure trop lourde`)
  if (cv > ca * 0.7) recs.push(`Charges variables = ${((cv / ca) * 100).toFixed(0)}% du CA — negocier les prix d'achat`)
  if (recs.length === 0) recs.push('Bon niveau de rentabilite — maintenir la maitrise des charges')
  return recs.slice(0, 5)
}

// ── PREDICTION_BFR ──────────────────────────────────────────────────

export function handlePredictionBFR(balance: Balance[]): Proph3tResponse {
  if (!balance || balance.length === 0) return noBalanceResponse()

  const agg = calculerAgregats(balance)
  const ext = calculerAgregatsEtendus(balance)

  // DSO (Days Sales Outstanding) = Clients / CA x 360
  const dso = agg.ca > 0 ? (agg.clientsNets / agg.ca) * 360 : 0
  // DPO (Days Payable Outstanding) = Fournisseurs / Achats x 360
  const dpo = ext.achats > 0 ? (agg.fournisseurs / ext.achats) * 360 : 0
  // DSI (Days Sales of Inventory) = Stocks / Achats x 360
  const dsi = ext.achats > 0 ? (agg.stocksNets / ext.achats) * 360 : 0
  // Cycle de trésorerie (Cash Cycle) = DSO + DSI - DPO
  const cycleCash = dso + dsi - dpo

  // FR (Fonds de Roulement) = Capitaux propres + Dettes LT - Immobilisations nettes
  const fr = agg.capitauxPropres + agg.dettesTotal - agg.immoNettes
  // BFR = Actif circulant (hors trésorerie) - Passif circulant (hors trésorerie)
  const bfr = agg.actifCirculant - agg.passifCirculant
  // Trésorerie nette = FR - BFR
  const tresoNette = fr - bfr

  const bfrStatus: Status = bfr <= 0 ? 'excellent' : bfr < fr ? 'bon' : 'critique'
  const frStatus: Status = fr > 0 ? 'bon' : 'critique'
  const tresoStatus: Status = tresoNette >= 0 ? 'bon' : 'critique'

  const card: PredictionCard = {
    type: 'prediction',
    title: 'BFR & Cycle de Tresorerie',
    indicators: [
      { label: 'DSO (delai clients)', value: `${Math.round(dso)} jours`, status: evalInverse(dso, [30, 60, 90]) },
      { label: 'DPO (delai fournisseurs)', value: `${Math.round(dpo)} jours`, status: evalRatio(dpo, [60, 30, 15]) },
      { label: 'DSI (rotation stocks)', value: `${Math.round(dsi)} jours`, status: evalInverse(dsi, [30, 60, 120]) },
      { label: 'Cycle cash (DSO+DSI-DPO)', value: `${Math.round(cycleCash)} jours`, status: evalInverse(cycleCash, [30, 60, 90]) },
      { label: 'Fonds de roulement', value: `${fmt(fr)} FCFA`, status: frStatus },
      { label: 'BFR', value: `${fmt(bfr)} FCFA`, status: bfrStatus },
      { label: 'Tresorerie nette (FR-BFR)', value: `${fmt(tresoNette)} FCFA`, status: tresoStatus },
    ],
    narrative: buildBFRNarrative(dso, dpo, dsi, cycleCash, fr, bfr, tresoNette),
    recommendations: buildBFRRecommendations(dso, dpo, dsi, cycleCash, fr, bfr, tresoNette),
  }

  const detailItems: { label: string; value: string }[] = [
    { label: '── DELAIS DE ROTATION ──', value: '' },
    { label: 'Clients (41) / CA x 360', value: `${Math.round(dso)} jours` },
    { label: 'Fournisseurs (40) / Achats x 360', value: `${Math.round(dpo)} jours` },
    { label: 'Stocks (3x) / Achats x 360', value: `${Math.round(dsi)} jours` },
    { label: 'Cycle de tresorerie', value: `${Math.round(cycleCash)} jours` },
    { label: '── EQUILIBRE FINANCIER ──', value: '' },
    { label: 'Capitaux propres', value: `${fmt(agg.capitauxPropres)} FCFA` },
    { label: '+ Dettes LT (16-19)', value: `${fmt(agg.dettesTotal)} FCFA` },
    { label: '- Immobilisations nettes', value: `${fmt(agg.immoNettes)} FCFA` },
    { label: '= Fonds de roulement (FR)', value: `${fmt(fr)} FCFA` },
    { label: 'Actif circulant', value: `${fmt(agg.actifCirculant)} FCFA` },
    { label: '- Passif circulant', value: `${fmt(agg.passifCirculant)} FCFA` },
    { label: '= BFR', value: `${fmt(bfr)} FCFA` },
    { label: 'Tresorerie nette = FR - BFR', value: `${fmt(tresoNette)} FCFA` },
  ]

  const detailCard: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Detail BFR & Cycle de Tresorerie',
    items: detailItems,
  }

  return {
    text: `**BFR & Cycle de Tresorerie** — analyse depuis votre balance`,
    content: [card, detailCard],
    suggestions: ['SIG', 'Seuil de rentabilite', 'Mes ratios', 'Analyse generale'],
  }
}

function buildBFRNarrative(dso: number, dpo: number, dsi: number, cycle: number, fr: number, bfr: number, treso: number): string {
  const parts: string[] = []

  // Cycle
  parts.push(`Cycle de tresorerie de **${Math.round(cycle)} jours** (clients ${Math.round(dso)}j + stocks ${Math.round(dsi)}j - fournisseurs ${Math.round(dpo)}j)`)

  // FR vs BFR
  if (fr > bfr) parts.push(`Le FR (**${fmt(fr)} FCFA**) couvre le BFR (**${fmt(bfr)} FCFA**) — equilibre financier respecte`)
  else if (fr > 0) parts.push(`Le FR (**${fmt(fr)} FCFA**) ne couvre pas entierement le BFR (**${fmt(bfr)} FCFA**) — tension de tresorerie`)
  else parts.push(`FR **negatif** — les immobilisations ne sont pas couvertes par les ressources permanentes`)

  // Trésorerie
  if (treso >= 0) parts.push(`Tresorerie nette positive de **${fmt(treso)} FCFA**`)
  else parts.push(`Tresorerie nette **negative** de **${fmt(treso)} FCFA**`)

  return parts.join('. ') + '.'
}

function buildBFRRecommendations(dso: number, dpo: number, dsi: number, cycle: number, fr: number, bfr: number, treso: number): string[] {
  const recs: string[] = []

  if (dso > 90) recs.push(`DSO de ${Math.round(dso)} j — relancer les impayes et durcir les conditions de paiement`)
  else if (dso > 60) recs.push(`DSO de ${Math.round(dso)} j — surveiller les delais de paiement clients`)

  if (dpo < 30 && dso > 60) recs.push('Vous payez plus vite que vous n\'encaissez — negocier des delais fournisseurs plus longs')

  if (dsi > 90) recs.push(`Rotation stocks lente (${Math.round(dsi)} j) — optimiser la gestion des stocks`)

  if (cycle > 90) recs.push(`Cycle de tresorerie long (${Math.round(cycle)} j) — risque de besoin de financement CT`)

  if (fr < 0) recs.push('FR negatif — envisager un emprunt LT ou une augmentation de capital')
  if (bfr > fr && fr > 0) recs.push('BFR > FR — le BFR est finance en partie par la tresorerie, situation fragile')
  if (treso < 0) recs.push('Tresorerie nette negative — risque de cessation de paiement, negocier un credit de tresorerie')

  if (recs.length === 0) recs.push('Equilibre financier sain — BFR maitrise et tresorerie positive')
  return recs.slice(0, 6)
}
