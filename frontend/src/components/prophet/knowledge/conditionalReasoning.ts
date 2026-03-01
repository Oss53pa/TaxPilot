/**
 * Knowledge — Raisonnement conditionnel
 * Conseils adaptatifs selon regime, seuils, deductibilite
 * Conforme CGI Cote d'Ivoire — Loi de Finances 2025
 */

import { getTauxFiscaux, calculerIS } from '@/config/taux-fiscaux-ci'
import { calculerPassageFiscal } from '@/services/passageFiscalService'
import type { Balance } from '@/types'
import type { Proph3tResponse, PredictionCard, FiscalInfoCard } from '../types'

// ── Helpers ──────────────────────────────────────────────────────────

function fmt(n: number): string {
  return Math.round(n).toLocaleString('fr-FR')
}

function pct(n: number): string {
  const val = n * 100
  return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}%`
}

function sumDebitByPrefix(balance: Balance[], prefixes: string[]): number {
  return balance
    .filter(b => prefixes.some(p => b.compte.startsWith(p)))
    .reduce((sum, b) => sum + Math.max(0, b.solde), 0)
}

function sumCreditByPrefix(balance: Balance[], prefixes: string[]): number {
  return balance
    .filter(b => prefixes.some(p => b.compte.startsWith(p)))
    .reduce((sum, b) => sum + Math.max(0, -b.solde), 0)
}

// ── Seuils de regime (CGI Art. 34) ──────────────────────────────────

interface RegimeInfo {
  code: string
  label: string
  seuilMax: number
  obligations: string[]
}

const REGIMES: RegimeInfo[] = [
  {
    code: 'MICRO',
    label: 'Micro-entreprise',
    seuilMax: 50_000_000,
    obligations: ['Declaration simplifiee annuelle', 'Pas de TVA', 'Pas de liasse fiscale', 'Tenue comptabilite simplifiee'],
  },
  {
    code: 'FORFAITAIRE',
    label: 'Regime forfaitaire',
    seuilMax: 50_000_000,
    obligations: ['Declaration simplifiee annuelle', 'Pas de TVA', 'Pas de liasse fiscale', 'Bilan simplifie SMT'],
  },
  {
    code: 'REEL_SIMPLIFIE',
    label: 'Reel simplifie',
    seuilMax: 150_000_000,
    obligations: ['Declaration annuelle IS + TVA', 'Liasse SMT', 'TVA trimestrielle', 'Bilan + CdR'],
  },
  {
    code: 'REEL_NORMAL',
    label: 'Reel normal',
    seuilMax: Infinity,
    obligations: ['Declaration annuelle IS + TVA', 'Liasse SN (87 pages)', 'TVA mensuelle', 'Bilan + CdR + Notes 1-39 + TFT + TAFIRE', '4 acomptes IS trimestriels'],
  },
]

function detectRegimeFromCA(ca: number): RegimeInfo {
  if (ca <= 50_000_000) return REGIMES[1] // Forfaitaire
  if (ca <= 150_000_000) return REGIMES[2] // Reel simplifie
  return REGIMES[3] // Reel normal
}

function normalizeRegime(regime?: string): string | undefined {
  if (!regime) return undefined
  const r = regime.toLowerCase().replace(/[^a-z]/g, '')
  if (r.includes('normal')) return 'REEL_NORMAL'
  if (r.includes('simplifie')) return 'REEL_SIMPLIFIE'
  if (r.includes('forfait')) return 'FORFAITAIRE'
  if (r.includes('micro')) return 'MICRO'
  return undefined
}

// ── Deductibility checks ─────────────────────────────────────────────

interface DeductibilityIssue {
  code: string
  label: string
  montant: number
  plafond: number
  excedent: number
  baseLegale: string
}

function scanDeductibility(balance: Balance[], ca: number): DeductibilityIssue[] {
  const taux = getTauxFiscaux()
  const issues: DeductibilityIssue[] = []

  // 1. Cadeaux clients (6234/6257) — plafond 1‰ CA (CGI Art. 18-8)
  const cadeaux = sumDebitByPrefix(balance, ['6234', '6257'])
  const plafondCadeaux = ca * taux.DEDUCTIBILITE.plafond_cadeaux
  if (cadeaux > plafondCadeaux && plafondCadeaux > 0) {
    issues.push({
      code: 'DED-01',
      label: 'Cadeaux clients',
      montant: cadeaux,
      plafond: plafondCadeaux,
      excedent: cadeaux - plafondCadeaux,
      baseLegale: 'CGI Art. 18-8 — Plafond 1‰ du CA',
    })
  }

  // 2. Dons et liberalites (6238) — plafond 5‰ CA (CGI Art. 18-9)
  const dons = sumDebitByPrefix(balance, ['6238'])
  const plafondDons = ca * taux.DEDUCTIBILITE.plafond_dons
  if (dons > plafondDons && plafondDons > 0) {
    issues.push({
      code: 'DED-02',
      label: 'Dons et liberalites',
      montant: dons,
      plafond: plafondDons,
      excedent: dons - plafondDons,
      baseLegale: 'CGI Art. 18-9 — Plafond 5‰ du CA',
    })
  }

  // 3. Amendes et penalites (6581/6582) — non deductibles (CGI Art. 18-4)
  const amendes = sumDebitByPrefix(balance, ['6581', '6582', '6711'])
  if (amendes > 0) {
    issues.push({
      code: 'DED-03',
      label: 'Amendes et penalites',
      montant: amendes,
      plafond: 0,
      excedent: amendes,
      baseLegale: 'CGI Art. 18-4 — Non deductibles',
    })
  }

  // 4. Amortissement vehicules de tourisme — plafond 14M (CGI Art. 18-5)
  const amortVP = sumCreditByPrefix(balance, ['2845', '28245'])
  if (amortVP > taux.DEDUCTIBILITE.amort_vehicule_plafond) {
    issues.push({
      code: 'DED-04',
      label: 'Amortissement vehicules tourisme',
      montant: amortVP,
      plafond: taux.DEDUCTIBILITE.amort_vehicule_plafond,
      excedent: amortVP - taux.DEDUCTIBILITE.amort_vehicule_plafond,
      baseLegale: 'CGI Art. 18-5 — Plafond 14 000 000 FCFA',
    })
  }

  // 5. Provisions non deductibles (691 sans justif = risque)
  const provisions = sumDebitByPrefix(balance, ['691', '6911', '6912', '6913'])
  if (provisions > 0) {
    issues.push({
      code: 'DED-05',
      label: 'Provisions (a justifier)',
      montant: provisions,
      plafond: 0,
      excedent: provisions,
      baseLegale: 'CGI Art. 18-7 — Deductibles si justifiees et individualisees',
    })
  }

  return issues
}

// ── Main handler ────────────────────────────────────────────────────

export function handleConditionalDiagnostic(
  balanceN: Balance[],
  regime?: string,
  entreprise?: {
    nom?: string
    regime_imposition?: string
    capital?: number
    effectifs?: number
    secteur_activite?: string
  },
): Proph3tResponse {
  // ── 1. Calculer les agregats ──
  const ca = sumCreditByPrefix(balanceN, ['701', '702', '703', '704', '705', '706', '707'])
  const totalCharges = sumDebitByPrefix(balanceN, ['6'])
  const totalProduits = sumCreditByPrefix(balanceN, ['7'])
  const resultatComptable = totalProduits - totalCharges
  const chargesPersonnel = sumDebitByPrefix(balanceN, ['66'])

  // ── 2. Detection regime ──
  const declaredRegimeCode = normalizeRegime(regime || entreprise?.regime_imposition)
  const regimeDetecte = detectRegimeFromCA(ca)
  const regimeDeclare = declaredRegimeCode
    ? REGIMES.find(r => r.code === declaredRegimeCode) || regimeDetecte
    : regimeDetecte

  const regimeMismatch = declaredRegimeCode ? declaredRegimeCode !== regimeDetecte.code : false

  // ── 3. Passage fiscal ──
  const entries = balanceN.map(b => ({
    compte: b.compte,
    intitule: b.libelle_compte || '',
    debit: b.debit,
    credit: b.credit,
    solde_debit: Math.max(0, b.solde),
    solde_credit: Math.max(0, -b.solde),
  }))
  const passageFiscal = calculerPassageFiscal(entries)
  const isResult = calculerIS(passageFiscal.resultat_fiscal, ca)

  // ── 4. Scan deductibilite ──
  const deductIssues = scanDeductibility(balanceN, ca)
  const totalReintegrations = deductIssues.reduce((s, d) => s + d.excedent, 0)

  // ── 5. Seuils et alertes ──
  const alerts: string[] = []

  // Regime mismatch
  if (regimeMismatch) {
    alerts.push(`⚠ Regime declare (${regimeDeclare.label}) incompatible avec le CA de ${fmt(ca)} FCFA → le regime ${regimeDetecte.label} s'impose (CGI Art. 34)`)
  }

  // Proximity to regime threshold
  if (ca > 40_000_000 && ca <= 50_000_000) {
    alerts.push(`CA proche du seuil de 50M FCFA — passage au Reel Simplifie si depassement`)
  }
  if (ca > 130_000_000 && ca <= 150_000_000) {
    alerts.push(`CA proche du seuil de 150M FCFA — passage au Reel Normal obligatoire si depassement`)
  }

  // IS vs IMF
  if (isResult.base === 'IMF') {
    alerts.push(`IS sur base IMF (${fmt(isResult.imf)} > IS brut ${fmt(isResult.is_brut)}) — Verifier que le CA est correct`)
  }

  // Deficit
  if (passageFiscal.resultat_fiscal < 0) {
    alerts.push(`Deficit fiscal de ${fmt(Math.abs(passageFiscal.resultat_fiscal))} FCFA — reportable sur les 5 exercices suivants (CGI Art. 4)`)
  }

  // TVA
  const tvaCollectee = sumCreditByPrefix(balanceN, ['4431', '4432', '4433'])
  const tvaDeductible = sumDebitByPrefix(balanceN, ['4451', '4452', '4453', '4454'])
  const tvaADecaisser = tvaCollectee - tvaDeductible

  if (regimeDetecte.code === 'REEL_NORMAL' || regimeDetecte.code === 'REEL_SIMPLIFIE') {
    if (tvaCollectee === 0 && ca > 0) {
      alerts.push(`Aucune TVA collectee detectee alors que le regime ${regimeDetecte.label} impose la collecte de TVA`)
    }
  }

  // Charges personnel / VA ratio
  const va = ca - sumDebitByPrefix(balanceN, ['601', '602', '604', '605', '608', '6031', '6032', '6033'])
  if (va > 0 && chargesPersonnel / va > 0.65) {
    alerts.push(`Charges de personnel = ${pct(chargesPersonnel / va)} de la VA — ratio eleve (seuil d'alerte : 65%)`)
  }

  // ── Build response ──

  // PredictionCard : resume conditionnel
  const statusGlobal = alerts.length === 0 ? 'excellent' : alerts.length <= 2 ? 'bon' : alerts.length <= 4 ? 'acceptable' : 'critique'
  const summaryCard: PredictionCard = {
    type: 'prediction',
    title: `Diagnostic Fiscal Conditionnel`,
    indicators: [
      { label: 'CA detecte', value: `${fmt(ca)} FCFA`, status: 'bon' },
      { label: 'Regime adapte', value: regimeDetecte.label, status: regimeMismatch ? 'critique' : 'excellent' },
      { label: 'Resultat comptable', value: `${fmt(resultatComptable)} FCFA`, status: resultatComptable >= 0 ? 'bon' : 'acceptable' },
      { label: 'Resultat fiscal', value: `${fmt(passageFiscal.resultat_fiscal)} FCFA`, status: passageFiscal.resultat_fiscal >= 0 ? 'bon' : 'acceptable' },
      { label: 'IS du', value: `${fmt(isResult.is_du)} FCFA (${isResult.base})`, status: isResult.base === 'IMF' ? 'acceptable' : 'bon' },
      { label: 'Reintegrations', value: passageFiscal.reintegrations.length > 0 ? `${passageFiscal.reintegrations.length} postes` : 'Aucune', status: passageFiscal.reintegrations.length > 0 ? 'acceptable' : 'excellent' },
      { label: 'Problemes deductibilite', value: deductIssues.length > 0 ? `${deductIssues.length} detecte(s)` : 'Aucun', status: deductIssues.length > 0 ? 'acceptable' : 'excellent' },
      { label: 'Alertes', value: `${alerts.length}`, status: statusGlobal },
    ],
    narrative: buildDiagnosticNarrative(ca, regimeDetecte, regimeDeclare, isResult, passageFiscal.resultat_fiscal, deductIssues, alerts),
    recommendations: buildDiagnosticRecommendations(regimeDetecte, regimeMismatch, isResult, deductIssues, alerts, tvaADecaisser),
  }

  // FiscalInfoCard : detail deductibilite + obligations regime
  const detailItems: { label: string; value: string }[] = []

  // Obligations du regime
  detailItems.push({ label: '── REGIME ──', value: regimeDetecte.label })
  for (const obl of regimeDetecte.obligations) {
    detailItems.push({ label: 'Obligation', value: obl })
  }

  // TVA
  if (tvaCollectee > 0 || tvaDeductible > 0) {
    detailItems.push({ label: '── TVA ──', value: '' })
    detailItems.push({ label: 'TVA collectee', value: `${fmt(tvaCollectee)} FCFA` })
    detailItems.push({ label: 'TVA deductible', value: `${fmt(tvaDeductible)} FCFA` })
    detailItems.push({ label: 'TVA a decaisser', value: `${fmt(tvaADecaisser)} FCFA` })
  }

  // Deductibilite
  if (deductIssues.length > 0) {
    detailItems.push({ label: '── DEDUCTIBILITE ──', value: '' })
    for (const issue of deductIssues) {
      detailItems.push({
        label: `${issue.code} ${issue.label}`,
        value: `${fmt(issue.montant)} > plafond ${fmt(issue.plafond)} → reintegration ${fmt(issue.excedent)} FCFA (${issue.baseLegale})`,
      })
    }
    detailItems.push({ label: 'Total reintegrations deductibilite', value: `${fmt(totalReintegrations)} FCFA` })
  }

  const detailCard: FiscalInfoCard = {
    type: 'fiscal_info',
    category: `Diagnostic — ${entreprise?.nom || 'Entreprise'}`,
    items: detailItems,
  }

  // Text
  const alertsText = alerts.length > 0
    ? `\n\n**${alerts.length} alerte${alerts.length > 1 ? 's' : ''} :**\n${alerts.map(a => `- ${a}`).join('\n')}`
    : '\n\nAucune alerte — situation fiscale conforme.'

  const text = `**Diagnostic fiscal conditionnel**\n\nCA : **${fmt(ca)} FCFA** → Regime : **${regimeDetecte.label}**${regimeMismatch ? ` *(declare: ${regimeDeclare.label})*` : ''}\nResultat fiscal : **${fmt(passageFiscal.resultat_fiscal)} FCFA** → IS du : **${fmt(isResult.is_du)} FCFA** (base ${isResult.base})${alertsText}`

  return {
    text,
    content: [summaryCard, detailCard],
    suggestions: [
      'Estimation IS',
      'Analyse ratios',
      deductIssues.length > 0 ? 'Charges deductibles' : 'Coherence',
      'Calendrier fiscal',
    ],
  }
}

function buildDiagnosticNarrative(
  ca: number,
  regimeDetecte: RegimeInfo,
  regimeDeclare: RegimeInfo,
  isResult: { is_brut: number; imf: number; is_du: number; base: string },
  resultatFiscal: number,
  issues: DeductibilityIssue[],
  alerts: string[],
): string {
  const parts: string[] = []

  // Regime
  if (regimeDetecte.code !== regimeDeclare.code) {
    parts.push(`Attention : votre CA de ${fmt(ca)} FCFA impose le ${regimeDetecte.label}, pas le ${regimeDeclare.label}.`)
  } else {
    parts.push(`Le CA de ${fmt(ca)} FCFA correspond bien au ${regimeDetecte.label}.`)
  }

  // IS
  if (isResult.base === 'IMF') {
    parts.push(`L'entreprise est soumise a l'IMF (${fmt(isResult.imf)} FCFA) car l'IS brut (${fmt(isResult.is_brut)} FCFA) est inferieur.`)
  } else if (resultatFiscal < 0) {
    parts.push(`L'entreprise est en deficit fiscal. L'IMF de ${fmt(isResult.imf)} FCFA reste du.`)
  }

  // Deductibilite
  if (issues.length > 0) {
    parts.push(`${issues.length} probleme(s) de deductibilite detecte(s) — charges depassant les plafonds CGI.`)
  }

  if (alerts.length === 0) {
    parts.push('Situation fiscale globalement conforme.')
  }

  return parts.join(' ')
}

function buildDiagnosticRecommendations(
  regimeDetecte: RegimeInfo,
  regimeMismatch: boolean | undefined,
  isResult: { is_du: number; base: string },
  issues: DeductibilityIssue[],
  alerts: string[],
  tvaADecaisser: number,
): string[] {
  const recs: string[] = []

  if (regimeMismatch) {
    recs.push(`Mettre a jour le regime d'imposition en ${regimeDetecte.label} aupres du centre des impots`)
  }

  if (issues.length > 0) {
    const totalExcedent = issues.reduce((s, i) => s + i.excedent, 0)
    recs.push(`Reintegrer ${fmt(totalExcedent)} FCFA de charges non deductibles dans la declaration IS`)
    for (const issue of issues.slice(0, 3)) {
      recs.push(`${issue.code} : ${issue.label} — excedent de ${fmt(issue.excedent)} FCFA (${issue.baseLegale})`)
    }
  }

  if (isResult.base === 'IMF') {
    recs.push('Verifier les charges non comptabilisees qui pourraient augmenter le resultat fiscal au-dessus de l\'IMF')
  }

  if (tvaADecaisser > 0 && (regimeDetecte.code === 'REEL_NORMAL' || regimeDetecte.code === 'REEL_SIMPLIFIE')) {
    recs.push(`Provisionner ${fmt(tvaADecaisser)} FCFA de TVA a decaisser`)
  }

  if (regimeDetecte.code === 'REEL_NORMAL') {
    recs.push('Preparer la liasse SN complete (87 feuillets) avec notes annexes 1 a 39')
  }

  if (alerts.length === 0 && recs.length === 0) {
    recs.push('Situation conforme — poursuivre la preparation de la liasse fiscale')
  }

  return recs.slice(0, 6)
}
