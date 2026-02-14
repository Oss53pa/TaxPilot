/**
 * Knowledge — Analyse Predictive depuis la Balance
 */

import { calculerIS } from '@/config/taux-fiscaux-ci'
import type { Balance } from '@/types'
import type { Proph3tResponse, PredictionCard } from '../types'

function fmt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR')
}

// ── Agrégats ─────────────────────────────────────────────────────────

interface Agregats {
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

function calculerAgregats(balance: Balance[]): Agregats {
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

    // Immobilisations (2x)
    if (/^2[0-7]/.test(c)) immoBrutes += line.debit
    if (c.startsWith('28') || c.startsWith('29')) amortissements += line.credit

    // Stocks (3x)
    if (c.startsWith('3')) stocksNets += solde

    // Clients (41)
    if (c.startsWith('41')) clientsNets += solde

    // Fournisseurs (40, excluding 409 avances)
    if (c.startsWith('40') && !c.startsWith('409')) fournisseurs += Math.abs(solde)

    // TVA
    if (c.startsWith('4431')) tvaCollectee += line.credit
    if (c.startsWith('4452')) tvaDeductible += line.debit

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

    // P&L: Produits (cl.7) / Charges (cl.6) — for resultat calculation
    if (c.startsWith('7')) totalProduits += line.credit
    if (c.startsWith('6')) totalCharges += line.debit

    // CA (70-75)
    if (/^7[0-5]/.test(c)) ca += line.credit

    // Charges personnel (66)
    if (c.startsWith('66')) chargesPersonnel += line.debit

    // Charges financières (67)
    if (c.startsWith('67')) chargesFinancieres += line.debit
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

// ── Prediction IS ────────────────────────────────────────────────────

export function handlePredictionIS(balance: Balance[]): Proph3tResponse {
  if (!balance || balance.length === 0) return noBalanceResponse()

  const agg = calculerAgregats(balance)

  // Résultat fiscal approx = produits classe 7 - charges classe 6
  let produits = 0, charges = 0
  for (const line of balance) {
    if (line.compte.startsWith('7')) produits += line.credit
    if (line.compte.startsWith('6')) charges += line.debit
  }
  const resultatFiscal = produits - charges
  const isResult = calculerIS(resultatFiscal, agg.ca)

  const status: Status = resultatFiscal > 0 ? (isResult.base === 'IS' ? 'bon' : 'acceptable') : 'critique'

  const card: PredictionCard = {
    type: 'prediction',
    title: 'Estimation IS',
    indicators: [
      { label: 'Chiffre d\'affaires', value: `${fmt(agg.ca)} FCFA`, status: agg.ca > 0 ? 'bon' : 'critique' },
      { label: 'Produits (cl. 7)', value: `${fmt(produits)} FCFA`, status: 'bon' },
      { label: 'Charges (cl. 6)', value: `${fmt(charges)} FCFA`, status: 'bon' },
      { label: 'Resultat fiscal', value: `${fmt(resultatFiscal)} FCFA`, status: resultatFiscal > 0 ? 'bon' : 'critique' },
      { label: 'IS brut (25%)', value: `${fmt(isResult.is_brut)} FCFA`, status },
      { label: 'IMF', value: `${fmt(isResult.imf)} FCFA`, status: isResult.base === 'IMF' ? 'acceptable' : 'bon' },
      { label: 'IS du', value: `${fmt(isResult.is_du)} FCFA`, status },
    ],
    narrative: `Base retenue : **${isResult.base}**. ${isResult.base === 'IMF' ? "L'entreprise est soumise a l'Impot Minimum Forfaitaire car l'IS brut est inferieur a l'IMF." : "L'IS brut est superieur a l'IMF, c'est donc l'IS qui s'applique."}`,
    recommendations: resultatFiscal < 0
      ? ['Resultat deficitaire — verifier les charges deductibles', 'Le deficit est reportable sur 5 ans']
      : isResult.base === 'IMF'
        ? ['Resultat insuffisant pour depasser l\'IMF', 'Optimiser le ratio charges/produits']
        : ['Provisionner les acomptes trimestriels', 'Verifier les charges non deductibles'],
  }

  return {
    text: `**Estimation de l'IS** a partir de votre balance`,
    content: [card],
    suggestions: ['Prediction TVA', 'Mes ratios', 'Detection anomalies'],
  }
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

// ── Prediction Ratios ────────────────────────────────────────────────

export function handlePredictionRatios(balance: Balance[]): Proph3tResponse {
  if (!balance || balance.length === 0) return noBalanceResponse()

  const agg = calculerAgregats(balance)

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

  const liquidite = agg.passifCirculant > 0 ? agg.actifCirculant / agg.passifCirculant : (agg.actifCirculant > 0 ? 99 : 0)
  const endettement = agg.capitauxPropres !== 0 ? agg.dettesTotal / Math.abs(agg.capitauxPropres) : 0
  const rentaCP = agg.capitauxPropres !== 0 ? (agg.resultat / Math.abs(agg.capitauxPropres)) * 100 : 0
  const fondsRoulement = agg.capitauxPropres - agg.immoNettes
  const bfr = agg.actifCirculant - agg.passifCirculant
  const tresoNette = fondsRoulement - bfr
  const rotationClients = agg.ca > 0 ? (agg.clientsNets / agg.ca) * 360 : 0

  const card: PredictionCard = {
    type: 'prediction',
    title: 'Ratios Financiers',
    indicators: [
      {
        label: 'Liquidite generale',
        value: liquidite.toFixed(2),
        status: evalRatio(liquidite, [1.5, 1.0, 0.7]),
      },
      {
        label: 'Endettement',
        value: endettement.toFixed(2),
        status: evalInverse(endettement, [0.5, 1.0, 2.0]),
      },
      {
        label: 'Rentabilite CP',
        value: `${rentaCP.toFixed(1)}%`,
        status: evalRatio(rentaCP, [15, 8, 3]),
      },
      {
        label: 'Tresorerie nette',
        value: `${fmt(tresoNette)} FCFA`,
        status: tresoNette >= 0 ? 'bon' : 'critique',
      },
      {
        label: 'Fonds de roulement',
        value: `${fmt(fondsRoulement)} FCFA`,
        status: fondsRoulement >= 0 ? 'bon' : 'critique',
      },
      {
        label: 'Rotation clients',
        value: `${Math.round(rotationClients)} jours`,
        status: evalInverse(rotationClients, [30, 60, 90]),
      },
    ],
    narrative: `Liquidite generale de **${liquidite.toFixed(2)}** ${liquidite >= 1 ? '(satisfaisante)' : '(insuffisante)'}. Endettement de **${endettement.toFixed(2)}** ${endettement < 1 ? '(maitrise)' : '(eleve)'}. Rotation clients de **${Math.round(rotationClients)} jours**.`,
    recommendations: [
      ...(liquidite < 1 ? ['Ameliorer la liquidite en reduisant les dettes court terme'] : []),
      ...(endettement > 2 ? ['Reduire l\'endettement ou renforcer les capitaux propres'] : []),
      ...(rotationClients > 90 ? ['Delai clients trop long — revoir la politique de recouvrement'] : []),
      ...(tresoNette < 0 ? ['Tresorerie nette negative — risque de tension de cash'] : []),
      ...(fondsRoulement < 0 ? ['Fonds de roulement negatif — les immobilisations ne sont pas couvertes par les CP'] : []),
    ],
  }

  return {
    text: `**Ratios Financiers** a partir de votre balance`,
    content: [card],
    suggestions: ['Estimation IS', 'Detection anomalies', 'Tendances'],
  }
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
    // Passif créditeur attendu
    if (/^1[0-5]/.test(c) && line.solde > 0 && line.debit > line.credit) {
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

// ── Prediction General ───────────────────────────────────────────────

export function handlePredictionGeneral(balanceN: Balance[], _balanceN1?: Balance[]): Proph3tResponse {
  if (!balanceN || balanceN.length === 0) return noBalanceResponse()

  const agg = calculerAgregats(balanceN)

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

  score = Math.max(0, Math.min(100, score))

  const healthStatus: Status = score >= 75 ? 'excellent' : score >= 50 ? 'bon' : score >= 30 ? 'acceptable' : 'critique'

  const card: PredictionCard = {
    type: 'prediction',
    title: 'Synthese Financiere',
    indicators: [
      { label: 'Score sante', value: `${score}/100`, status: healthStatus },
      { label: 'Chiffre d\'affaires', value: `${fmt(agg.ca)} FCFA`, status: agg.ca > 0 ? 'bon' : 'critique' },
      { label: 'Resultat', value: `${fmt(agg.resultat)} FCFA`, status: agg.resultat > 0 ? 'bon' : 'critique' },
      { label: 'Tresorerie', value: `${fmt(agg.tresorerie)} FCFA`, status: agg.tresorerie >= 0 ? 'bon' : 'critique' },
      { label: 'Capitaux propres', value: `${fmt(agg.capitauxPropres)} FCFA`, status: agg.capitauxPropres > 0 ? 'bon' : 'critique' },
      { label: 'Liquidite', value: liquidite.toFixed(2), status: liquidite >= 1 ? 'bon' : 'critique' },
    ],
    narrative: `Score de sante financiere : **${score}/100** (${healthStatus}). ${forces.length > 0 ? 'Points forts : ' + forces.slice(0, 3).join(', ') + '.' : ''} ${risques.length > 0 ? 'Risques : ' + risques.slice(0, 3).join(', ') + '.' : ''}`,
    recommendations: [
      ...risques.slice(0, 3).map(r => `Corriger : ${r}`),
      ...(score >= 50 ? ['Maintenir la bonne gestion'] : ['Attention — situation financiere fragile']),
    ],
  }

  return {
    text: `**Diagnostic Financier Global**`,
    content: [card],
    suggestions: ['Mes ratios', 'Estimation IS', 'Detection anomalies', 'Tendances'],
  }
}
