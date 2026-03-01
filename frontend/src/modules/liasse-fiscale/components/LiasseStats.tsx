import React, { useMemo } from 'react'
import { Box, Typography, IconButton, LinearProgress } from '@mui/material'
import {
  ChevronRight,
  InfoOutlined,
  FiberManualRecord,
  LocalHospital,
} from '@mui/icons-material'
import type { PageDef, EntrepriseData, BalanceEntry } from '../types'
import type { PredictionCard } from '@/components/prophet/types'
import type { Balance } from '@/types'
import {
  handlePredictionIS,
  handlePredictionTVA,
  handlePredictionRatios,
  handlePredictionAnomaly,
  handlePredictionGeneral,
  handlePredictionTrend,
  calculerAgregats,
} from '@/components/prophet/knowledge'
import type { Agregats } from '@/components/prophet/knowledge'
import { calculerIS } from '@/config/taux-fiscaux-ci'

// ── Balance type bridge ──
function toProph3tBalance(entries: BalanceEntry[]): Balance[] {
  return entries.map((e, i) => ({
    id: String(i),
    created_at: '',
    updated_at: '',
    is_active: true,
    exercice: '',
    compte: e.compte,
    debit: e.debit,
    credit: e.credit,
    solde: e.solde_debit - e.solde_credit,
    libelle_compte: e.libelle,
  }))
}

// ── Status colors (same as Proph3t chat) ──
const STATUS_COLORS: Record<string, string> = {
  excellent: '#16a34a', bon: '#3b82f6', acceptable: '#d97706', critique: '#dc2626',
}
const STATUS_BG: Record<string, string> = {
  excellent: '#f0fdf4', bon: '#eff6ff', acceptable: '#fffbeb', critique: '#fef2f2',
}
const TREND_ARROWS: Record<string, string> = {
  up: '\u2191', down: '\u2193', stable: '\u2192',
}

function fmt(n: number): string {
  if (n === 0) return '0'
  return Math.round(n).toLocaleString('fr-FR')
}

interface LiasseStatsProps {
  currentPage: PageDef
  entreprise: EntrepriseData
  balance: BalanceEntry[]
  balanceN1: BalanceEntry[]
  onCollapse?: () => void
}

// ── Page → Proph3t analysis mapping ──
// Each page gets a DIFFERENT analysis from Proph3t's expert engine

type AnalysisSection = {
  title: string
  cards: PredictionCard[]
}

function buildPageAnalysis(
  pageId: string,
  section: string,
  balN: Balance[],
  balN1: Balance[],
  agg: Agregats,
  entreprise: EntrepriseData,
): AnalysisSection {

  // ── ETATS FINANCIERS: each statement gets its own Proph3t analysis ──
  if (pageId === 'bilan' || pageId === 'actif' || pageId === 'passif') {
    const ratiosResp = handlePredictionRatios(balN)
    const anomalyResp = handlePredictionAnomaly(balN)
    const ratioCard = ratiosResp.content?.find(c => c.type === 'prediction') as PredictionCard | undefined

    // Build structure-specific card
    const structureIndicators: PredictionCard['indicators'] = []

    if (pageId === 'bilan' || pageId === 'actif') {
      const immosPct = agg.immoBrutes > 0 && (agg.immoBrutes + agg.actifCirculant) > 0
        ? (agg.immoBrutes / (agg.immoBrutes + agg.actifCirculant)) * 100 : 0
      const tauxAmort = agg.immoBrutes > 0 ? (agg.amortissements / agg.immoBrutes) * 100 : 0
      structureIndicators.push(
        { label: 'Immobilisations brutes', value: `${fmt(agg.immoBrutes)} FCFA`, status: 'bon' },
        { label: 'Immobilisations nettes', value: `${fmt(agg.immoNettes)} FCFA`, status: 'bon' },
        { label: 'Taux d\'amortissement', value: `${tauxAmort.toFixed(1)}%`, status: tauxAmort > 80 ? 'critique' : tauxAmort > 60 ? 'acceptable' : 'bon' },
        { label: 'Poids immos / Actif', value: `${immosPct.toFixed(1)}%`, status: 'bon' },
        { label: 'Actif circulant', value: `${fmt(agg.actifCirculant)} FCFA`, status: 'bon' },
        { label: 'Stocks nets', value: `${fmt(agg.stocksNets)} FCFA`, status: agg.stocksNets >= 0 ? 'bon' : 'critique' },
      )
    }
    if (pageId === 'bilan' || pageId === 'passif') {
      const autonomie = (agg.capitauxPropres + agg.dettesTotal) !== 0
        ? (agg.capitauxPropres / (agg.capitauxPropres + agg.dettesTotal)) * 100 : 0
      structureIndicators.push(
        { label: 'Capitaux propres', value: `${fmt(agg.capitauxPropres)} FCFA`, status: agg.capitauxPropres > 0 ? 'bon' : 'critique' },
        { label: 'Dettes financieres', value: `${fmt(agg.dettesTotal)} FCFA`, status: 'bon' },
        { label: 'Autonomie financiere', value: `${autonomie.toFixed(1)}%`, status: autonomie >= 50 ? 'bon' : autonomie >= 30 ? 'acceptable' : 'critique' },
        { label: 'Fournisseurs', value: `${fmt(agg.fournisseurs)} FCFA`, status: 'bon' },
      )
    }

    const structureCard: PredictionCard = {
      type: 'prediction',
      title: pageId === 'actif' ? 'Structure de l\'Actif' : pageId === 'passif' ? 'Structure du Passif' : 'Structure du Bilan',
      indicators: structureIndicators,
    }

    const cards: PredictionCard[] = [structureCard]
    if (ratioCard) cards.push(ratioCard)

    // Add anomalies if any critical
    const anomalyCard = anomalyResp.content?.find(c => c.type === 'prediction') as PredictionCard | undefined
    if (anomalyCard && anomalyCard.indicators.some(i => i.status === 'critique')) {
      cards.push(anomalyCard)
    }

    return { title: 'Analyse Bilan', cards }
  }

  if (pageId === 'resultat') {
    const isResp = handlePredictionIS(balN)
    const isCard = isResp.content?.find(c => c.type === 'prediction') as PredictionCard | undefined

    // Build SIG card
    const marges: PredictionCard = {
      type: 'prediction',
      title: 'Soldes Intermediaires de Gestion',
      indicators: [
        { label: 'Chiffre d\'affaires', value: `${fmt(agg.ca)} FCFA`, status: agg.ca > 0 ? 'bon' : 'critique' },
        { label: 'Charges de personnel', value: `${fmt(agg.chargesPersonnel)} FCFA`, status: 'bon' },
        {
          label: 'Poids personnel / CA',
          value: agg.ca > 0 ? `${((agg.chargesPersonnel / agg.ca) * 100).toFixed(1)}%` : 'N/A',
          status: agg.ca > 0 ? ((agg.chargesPersonnel / agg.ca) * 100 > 60 ? 'critique' : (agg.chargesPersonnel / agg.ca) * 100 > 40 ? 'acceptable' : 'bon') : 'acceptable',
        },
        { label: 'Resultat net', value: `${fmt(agg.resultat)} FCFA`, status: agg.resultat > 0 ? 'bon' : 'critique' },
        {
          label: 'Marge nette',
          value: agg.ca > 0 ? `${((agg.resultat / agg.ca) * 100).toFixed(1)}%` : 'N/A',
          status: agg.ca > 0 ? ((agg.resultat / agg.ca) * 100 > 10 ? 'excellent' : (agg.resultat / agg.ca) * 100 > 3 ? 'bon' : (agg.resultat / agg.ca) * 100 > 0 ? 'acceptable' : 'critique') : 'acceptable',
        },
        { label: 'Charges financieres', value: `${fmt(agg.chargesFinancieres)} FCFA`, status: agg.ca > 0 && (agg.chargesFinancieres / agg.ca) * 100 > 5 ? 'critique' : 'bon' },
      ],
      narrative: agg.resultat > 0
        ? `Resultat positif de **${fmt(agg.resultat)} FCFA** sur un CA de **${fmt(agg.ca)} FCFA**. Marge nette de **${agg.ca > 0 ? ((agg.resultat / agg.ca) * 100).toFixed(1) : 0}%**.`
        : `**Resultat deficitaire** de ${fmt(agg.resultat)} FCFA. Analyser la structure des charges.`,
    }

    const cards: PredictionCard[] = [marges]
    if (isCard) cards.push(isCard)
    return { title: 'Analyse du Resultat', cards }
  }

  if (pageId === 'tft') {
    const tvaResp = handlePredictionTVA(balN)
    const tvaCard = tvaResp.content?.find(c => c.type === 'prediction') as PredictionCard | undefined

    const tresoCard: PredictionCard = {
      type: 'prediction',
      title: 'Analyse Tresorerie',
      indicators: [
        { label: 'Tresorerie nette', value: `${fmt(agg.tresorerie)} FCFA`, status: agg.tresorerie >= 0 ? 'bon' : 'critique' },
        {
          label: 'Fonds de roulement',
          value: `${fmt(agg.capitauxPropres - agg.immoNettes)} FCFA`,
          status: (agg.capitauxPropres - agg.immoNettes) >= 0 ? 'bon' : 'critique',
        },
        {
          label: 'BFR',
          value: `${fmt(agg.actifCirculant - agg.passifCirculant)} FCFA`,
          status: 'bon',
        },
        { label: 'Clients', value: `${fmt(agg.clientsNets)} FCFA`, status: 'bon' },
        { label: 'Fournisseurs', value: `${fmt(agg.fournisseurs)} FCFA`, status: 'bon' },
        {
          label: 'Delai clients',
          value: agg.ca > 0 ? `${Math.round((agg.clientsNets / agg.ca) * 360)} jours` : 'N/A',
          status: agg.ca > 0 ? ((agg.clientsNets / agg.ca) * 360 > 90 ? 'critique' : (agg.clientsNets / agg.ca) * 360 > 60 ? 'acceptable' : 'bon') : 'acceptable',
        },
      ],
      narrative: agg.tresorerie >= 0
        ? `Tresorerie positive de **${fmt(agg.tresorerie)} FCFA**. ${(agg.capitauxPropres - agg.immoNettes) >= 0 ? 'Fonds de roulement positif, structure financiere equilibree.' : 'Attention : FR negatif malgre tresorerie positive.'}`
        : `**Tresorerie negative** de ${fmt(agg.tresorerie)} FCFA. Risque de tension sur le cash.`,
      recommendations: [
        ...(agg.tresorerie < 0 ? ['Negocier des delais fournisseurs ou une ligne de credit'] : []),
        ...(agg.ca > 0 && (agg.clientsNets / agg.ca) * 360 > 90 ? ['Delai clients excessif — renforcer le recouvrement'] : []),
      ],
    }

    const cards: PredictionCard[] = [tresoCard]
    if (tvaCard) cards.push(tvaCard)
    return { title: 'Flux & Tresorerie', cards }
  }

  if (pageId === 'fiche-r4') {
    const generalResp = handlePredictionGeneral(balN, balN1.length > 0 ? balN1 : undefined)
    const generalCard = generalResp.content?.find(c => c.type === 'prediction') as PredictionCard | undefined
    return { title: 'Diagnostic Global', cards: generalCard ? [generalCard] : [] }
  }

  // ── NOTES ANNEXES: each note gets analysis specific to its topic ──
  if (section === 'notes') {
    return buildNoteAnalysis(pageId, balN, balN1, agg)
  }

  // ── COUVERTURE / FICHES: show global health ──
  if (section === 'couverture' || section === 'fiches') {
    const generalResp = handlePredictionGeneral(balN, balN1.length > 0 ? balN1 : undefined)
    const generalCard = generalResp.content?.find(c => c.type === 'prediction') as PredictionCard | undefined

    const entCard: PredictionCard = {
      type: 'prediction',
      title: 'Fiche Entreprise',
      indicators: [
        { label: 'Capital social', value: `${fmt(entreprise.capital_social)} FCFA`, status: entreprise.capital_social > 0 ? 'bon' : 'acceptable' },
        { label: 'Effectif permanent', value: `${entreprise.effectif_permanent}`, status: entreprise.effectif_permanent > 0 ? 'bon' : 'acceptable' },
        { label: 'Masse salariale', value: `${fmt(entreprise.masse_salariale)} FCFA`, status: 'bon' },
        {
          label: 'Cout moyen / employe',
          value: entreprise.effectif_permanent > 0 ? `${fmt(entreprise.masse_salariale / entreprise.effectif_permanent)} FCFA` : 'N/A',
          status: 'bon',
        },
      ],
    }

    const cards: PredictionCard[] = [entCard]
    if (generalCard) cards.push(generalCard)
    return { title: 'Vue d\'ensemble', cards }
  }

  // ── SUPPLEMENTS / GARDES: show anomalies + trend ──
  const trendResp = handlePredictionTrend(balN, balN1.length > 0 ? balN1 : undefined)
  const trendCard = trendResp.content?.find(c => c.type === 'prediction') as PredictionCard | undefined
  const anomalyResp2 = handlePredictionAnomaly(balN)
  const anomalyCard2 = anomalyResp2.content?.find(c => c.type === 'prediction') as PredictionCard | undefined
  const cards: PredictionCard[] = []
  if (trendCard) cards.push(trendCard)
  if (anomalyCard2) cards.push(anomalyCard2)
  return { title: 'Controles', cards }
}

function buildNoteAnalysis(pageId: string, balN: Balance[], _balN1: Balance[], agg: Agregats): AnalysisSection {

  // Note 3A-3E only (note-3a, note-3b, note-3c, note-3c-bis, note-3d, note-3e)
  if (/^note-3[a-e]/.test(pageId) || pageId === 'note-3c-bis') {
    const tauxAmort = agg.immoBrutes > 0 ? (agg.amortissements / agg.immoBrutes) * 100 : 0
    const vetuste = 100 - tauxAmort
    const investNet = agg.immoBrutes - agg.amortissements

    const card: PredictionCard = {
      type: 'prediction',
      title: 'Analyse des Immobilisations',
      indicators: [
        { label: 'Immobilisations brutes', value: `${fmt(agg.immoBrutes)} FCFA`, status: 'bon' },
        { label: 'Amortissements cumules', value: `${fmt(agg.amortissements)} FCFA`, status: 'bon' },
        { label: 'Valeur nette', value: `${fmt(investNet)} FCFA`, status: investNet > 0 ? 'bon' : 'critique' },
        { label: 'Taux d\'amortissement', value: `${tauxAmort.toFixed(1)}%`, status: tauxAmort > 80 ? 'critique' : tauxAmort > 60 ? 'acceptable' : 'bon' },
        { label: 'Indice de vetuste', value: `${vetuste.toFixed(1)}%`, status: vetuste < 20 ? 'critique' : vetuste < 40 ? 'acceptable' : 'bon' },
      ],
      narrative: tauxAmort > 70
        ? `Immobilisations **vieillissantes** (taux d'amortissement ${tauxAmort.toFixed(1)}%). Un renouvellement pourrait s'averer necessaire.`
        : `Parc immobilise en **bon etat** avec un taux d'amortissement de ${tauxAmort.toFixed(1)}%.`,
      recommendations: [
        ...(tauxAmort > 70 ? ['Planifier le renouvellement des immobilisations amorties'] : []),
        ...(tauxAmort > 80 ? ['Verifier la presence d\'immobilisations totalement amorties encore en service'] : []),
      ],
    }
    return { title: 'Immobilisations', cards: [card] }
  }

  // Note 5: Stocks
  if (pageId === 'note-05') {
    const rotationStocks = agg.ca > 0 ? (agg.stocksNets / agg.ca) * 360 : 0
    const card: PredictionCard = {
      type: 'prediction',
      title: 'Analyse des Stocks',
      indicators: [
        { label: 'Stocks nets', value: `${fmt(agg.stocksNets)} FCFA`, status: agg.stocksNets >= 0 ? 'bon' : 'critique' },
        { label: 'Rotation stocks', value: agg.ca > 0 ? `${Math.round(rotationStocks)} jours` : 'N/A', status: rotationStocks > 120 ? 'critique' : rotationStocks > 60 ? 'acceptable' : 'bon' },
        { label: 'Poids stocks / CA', value: agg.ca > 0 ? `${((agg.stocksNets / agg.ca) * 100).toFixed(1)}%` : 'N/A', status: 'bon' },
      ],
      narrative: rotationStocks > 90
        ? `Rotation lente des stocks (**${Math.round(rotationStocks)} jours**). Risque de surstockage ou d'obsolescence.`
        : `Rotation des stocks correcte (**${Math.round(rotationStocks)} jours**).`,
      recommendations: rotationStocks > 90 ? ['Analyser les stocks dormants', 'Verifier les provisions pour depreciation'] : [],
    }
    return { title: 'Stocks', cards: [card] }
  }

  // Note 6: Clients
  if (pageId === 'note-06') {
    const delaiClients = agg.ca > 0 ? (agg.clientsNets / agg.ca) * 360 : 0
    const card: PredictionCard = {
      type: 'prediction',
      title: 'Analyse Clients',
      indicators: [
        { label: 'Creances clients nettes', value: `${fmt(agg.clientsNets)} FCFA`, status: 'bon' },
        { label: 'Delai encaissement', value: agg.ca > 0 ? `${Math.round(delaiClients)} jours` : 'N/A', status: delaiClients > 90 ? 'critique' : delaiClients > 60 ? 'acceptable' : 'bon' },
        { label: 'Poids clients / CA', value: agg.ca > 0 ? `${((agg.clientsNets / agg.ca) * 100).toFixed(1)}%` : 'N/A', status: 'bon' },
        { label: 'CA', value: `${fmt(agg.ca)} FCFA`, status: agg.ca > 0 ? 'bon' : 'critique' },
      ],
      narrative: delaiClients > 90
        ? `Delai d'encaissement **anormalement long** (${Math.round(delaiClients)} jours). Risque de creances irrecouvrables.`
        : delaiClients > 60
          ? `Delai d'encaissement **moyen** (${Math.round(delaiClients)} jours).`
          : `Bon recouvrement : delai de **${Math.round(delaiClients)} jours**.`,
      recommendations: [
        ...(delaiClients > 90 ? ['Relancer les clients en retard', 'Provisionner les creances douteuses'] : []),
        ...(delaiClients > 60 ? ['Envisager l\'affacturage ou l\'escompte'] : []),
      ],
    }
    return { title: 'Creances Clients', cards: [card] }
  }

  // Note 8: Tresorerie
  if (pageId === 'note-08' || pageId === 'note-8a' || pageId === 'note-8b' || pageId === 'note-8c') {
    const fr = agg.capitauxPropres - agg.immoNettes
    const bfr = agg.actifCirculant - agg.passifCirculant
    const card: PredictionCard = {
      type: 'prediction',
      title: 'Equilibre Financier',
      indicators: [
        { label: 'Tresorerie nette', value: `${fmt(agg.tresorerie)} FCFA`, status: agg.tresorerie >= 0 ? 'bon' : 'critique' },
        { label: 'Fonds de roulement', value: `${fmt(fr)} FCFA`, status: fr >= 0 ? 'bon' : 'critique' },
        { label: 'BFR', value: `${fmt(bfr)} FCFA`, status: 'bon' },
        { label: 'FR - BFR', value: `${fmt(fr - bfr)} FCFA`, status: (fr - bfr) >= 0 ? 'bon' : 'critique' },
      ],
      narrative: `**FR** = ${fmt(fr)} — **BFR** = ${fmt(bfr)} — **Tresorerie** = ${fmt(agg.tresorerie)}. ${agg.tresorerie >= 0 ? 'Equilibre satisfaisant.' : 'Desequilibre financier a surveiller.'}`,
    }
    return { title: 'Tresorerie', cards: [card] }
  }

  // Notes 9-13: Capitaux propres
  if (['note-09', 'note-10', 'note-11', 'note-12', 'note-13'].includes(pageId)) {
    const rentaCP = agg.capitauxPropres !== 0 ? (agg.resultat / Math.abs(agg.capitauxPropres)) * 100 : 0
    const card: PredictionCard = {
      type: 'prediction',
      title: 'Analyse des Capitaux Propres',
      indicators: [
        { label: 'Capitaux propres', value: `${fmt(agg.capitauxPropres)} FCFA`, status: agg.capitauxPropres > 0 ? 'bon' : 'critique' },
        { label: 'Capital social', value: `${fmt(agg.capitalSocial)} FCFA`, status: 'bon' },
        { label: 'Reserves', value: `${fmt(agg.reserves)} FCFA`, status: agg.reserves >= 0 ? 'bon' : 'acceptable' },
        { label: 'Resultat exercice', value: `${fmt(agg.resultat)} FCFA`, status: agg.resultat > 0 ? 'bon' : 'critique' },
        { label: 'Rentabilite CP', value: `${rentaCP.toFixed(1)}%`, status: rentaCP >= 15 ? 'excellent' : rentaCP >= 8 ? 'bon' : rentaCP >= 3 ? 'acceptable' : 'critique' },
      ],
      narrative: agg.capitauxPropres > 0
        ? `Capitaux propres positifs (**${fmt(agg.capitauxPropres)} FCFA**). Rentabilite de **${rentaCP.toFixed(1)}%**.`
        : `**Capitaux propres negatifs** — l'entreprise est en situation de desequilibre. Obligation legale de reconstituer les capitaux sous 2 ans.`,
      recommendations: [
        ...(agg.capitauxPropres < 0 ? ['Reconstituer les capitaux propres (augmentation de capital ou absorption des pertes)'] : []),
        ...(agg.capitauxPropres > 0 && agg.capitauxPropres < Math.abs(agg.capitalSocial) / 2 ? ['Capitaux propres < 50% du capital — seuil d\'alerte OHADA'] : []),
      ],
    }
    return { title: 'Capitaux Propres', cards: [card] }
  }

  // Notes 14-16: Dettes
  if (/^note-1[456]/.test(pageId)) {
    const endettement = agg.capitauxPropres !== 0 ? agg.dettesTotal / Math.abs(agg.capitauxPropres) : 0
    const card: PredictionCard = {
      type: 'prediction',
      title: 'Analyse de l\'Endettement',
      indicators: [
        { label: 'Dettes financieres', value: `${fmt(agg.dettesTotal)} FCFA`, status: 'bon' },
        { label: 'Fournisseurs', value: `${fmt(agg.fournisseurs)} FCFA`, status: 'bon' },
        { label: 'Passif circulant', value: `${fmt(agg.passifCirculant)} FCFA`, status: 'bon' },
        { label: 'Ratio endettement', value: endettement.toFixed(2), status: endettement <= 0.5 ? 'excellent' : endettement <= 1 ? 'bon' : endettement <= 2 ? 'acceptable' : 'critique' },
        { label: 'Capitaux propres', value: `${fmt(agg.capitauxPropres)} FCFA`, status: agg.capitauxPropres > 0 ? 'bon' : 'critique' },
      ],
      narrative: endettement <= 1
        ? `Endettement **maitrise** (ratio de ${endettement.toFixed(2)}). Capacite d'emprunt preservee.`
        : `Endettement **eleve** (ratio de ${endettement.toFixed(2)}). Capacite d'emprunt reduite.`,
      recommendations: [
        ...(endettement > 2 ? ['Reduire l\'endettement ou renforcer les capitaux propres'] : []),
        ...(endettement > 1 ? ['Surveiller la capacite de remboursement'] : []),
      ],
    }
    return { title: 'Endettement', cards: [card] }
  }

  // Note 17: CA
  if (pageId === 'note-17') {
    const isResult = calculerIS(agg.resultat, agg.ca)
    const card: PredictionCard = {
      type: 'prediction',
      title: 'Analyse du Chiffre d\'Affaires',
      indicators: [
        { label: 'Chiffre d\'affaires', value: `${fmt(agg.ca)} FCFA`, status: agg.ca > 0 ? 'bon' : 'critique' },
        { label: 'Resultat net', value: `${fmt(agg.resultat)} FCFA`, status: agg.resultat > 0 ? 'bon' : 'critique' },
        { label: 'Marge nette', value: agg.ca > 0 ? `${((agg.resultat / agg.ca) * 100).toFixed(1)}%` : 'N/A', status: agg.resultat > 0 ? 'bon' : 'critique' },
        { label: 'IS estime', value: `${fmt(isResult.is_du)} FCFA`, status: isResult.base === 'IMF' ? 'acceptable' : 'bon' },
      ],
      narrative: `CA de **${fmt(agg.ca)} FCFA**, marge nette de **${agg.ca > 0 ? ((agg.resultat / agg.ca) * 100).toFixed(1) : 0}%**. IS estime : **${fmt(isResult.is_du)} FCFA** (base: ${isResult.base}).`,
    }
    return { title: 'Revenus', cards: [card] }
  }

  // Notes 18-22: Charges d'exploitation
  if (['note-18', 'note-19', 'note-20', 'note-21', 'note-22'].includes(pageId)) {
    const card: PredictionCard = {
      type: 'prediction',
      title: 'Structure des Charges',
      indicators: [
        { label: 'Charges de personnel', value: `${fmt(agg.chargesPersonnel)} FCFA`, status: 'bon' },
        { label: 'Personnel / CA', value: agg.ca > 0 ? `${((agg.chargesPersonnel / agg.ca) * 100).toFixed(1)}%` : 'N/A', status: agg.ca > 0 && (agg.chargesPersonnel / agg.ca) * 100 > 50 ? 'critique' : 'bon' },
        { label: 'Charges financieres', value: `${fmt(agg.chargesFinancieres)} FCFA`, status: agg.ca > 0 && (agg.chargesFinancieres / agg.ca) * 100 > 5 ? 'critique' : 'bon' },
        { label: 'Charges fin. / CA', value: agg.ca > 0 ? `${((agg.chargesFinancieres / agg.ca) * 100).toFixed(1)}%` : 'N/A', status: 'bon' },
      ],
      narrative: `Charges de personnel : **${agg.ca > 0 ? ((agg.chargesPersonnel / agg.ca) * 100).toFixed(1) : 0}%** du CA. Charges financieres : **${agg.ca > 0 ? ((agg.chargesFinancieres / agg.ca) * 100).toFixed(1) : 0}%** du CA.`,
    }
    return { title: 'Charges', cards: [card] }
  }

  // Note 23: Personnel
  if (pageId === 'note-23') {
    const card: PredictionCard = {
      type: 'prediction',
      title: 'Analyse des Charges de Personnel',
      indicators: [
        { label: 'Charges de personnel', value: `${fmt(agg.chargesPersonnel)} FCFA`, status: 'bon' },
        { label: 'Poids / CA', value: agg.ca > 0 ? `${((agg.chargesPersonnel / agg.ca) * 100).toFixed(1)}%` : 'N/A', status: agg.ca > 0 && (agg.chargesPersonnel / agg.ca) * 100 > 50 ? 'critique' : (agg.chargesPersonnel / agg.ca) * 100 > 35 ? 'acceptable' : 'bon' },
        { label: 'CA', value: `${fmt(agg.ca)} FCFA`, status: agg.ca > 0 ? 'bon' : 'critique' },
        { label: 'Resultat net', value: `${fmt(agg.resultat)} FCFA`, status: agg.resultat > 0 ? 'bon' : 'critique' },
      ],
      narrative: `Les charges de personnel representent **${agg.ca > 0 ? ((agg.chargesPersonnel / agg.ca) * 100).toFixed(1) : 0}%** du chiffre d'affaires.`,
    }
    return { title: 'Personnel', cards: [card] }
  }

  // Notes 26, 34: Fiscalite / Resultat fiscal
  if (pageId === 'note-26' || pageId === 'note-34') {
    const isResp = handlePredictionIS(balN)
    const isCard = isResp.content?.find(c => c.type === 'prediction') as PredictionCard | undefined
    return { title: 'Fiscalite', cards: isCard ? [isCard] : [] }
  }

  // Notes 27: Effectifs
  if (pageId === 'note-27a' || pageId === 'note-27b') {
    const card: PredictionCard = {
      type: 'prediction',
      title: 'Productivite',
      indicators: [
        { label: 'Charges de personnel', value: `${fmt(agg.chargesPersonnel)} FCFA`, status: 'bon' },
        { label: 'CA', value: `${fmt(agg.ca)} FCFA`, status: agg.ca > 0 ? 'bon' : 'critique' },
        { label: 'CA / Charges pers.', value: agg.chargesPersonnel > 0 ? `${(agg.ca / agg.chargesPersonnel).toFixed(2)}x` : 'N/A', status: agg.chargesPersonnel > 0 && (agg.ca / agg.chargesPersonnel) >= 3 ? 'bon' : 'acceptable' },
      ],
      narrative: `Pour 1 FCFA de charges de personnel, l'entreprise genere **${agg.chargesPersonnel > 0 ? (agg.ca / agg.chargesPersonnel).toFixed(2) : 'N/A'}** FCFA de CA.`,
    }
    return { title: 'Effectifs & Productivite', cards: [card] }
  }

  // Notes 37, 38: SIG / Detail compte de resultat
  if (pageId === 'note-37' || pageId === 'note-38') {
    const card: PredictionCard = {
      type: 'prediction',
      title: 'Soldes Intermediaires de Gestion',
      indicators: [
        { label: 'Chiffre d\'affaires', value: `${fmt(agg.ca)} FCFA`, status: agg.ca > 0 ? 'bon' : 'critique' },
        { label: 'Resultat net', value: `${fmt(agg.resultat)} FCFA`, status: agg.resultat > 0 ? 'bon' : 'critique' },
        {
          label: 'Marge nette',
          value: agg.ca > 0 ? `${((agg.resultat / agg.ca) * 100).toFixed(1)}%` : 'N/A',
          status: agg.ca > 0 ? ((agg.resultat / agg.ca) * 100 > 10 ? 'excellent' : (agg.resultat / agg.ca) * 100 > 3 ? 'bon' : (agg.resultat / agg.ca) * 100 > 0 ? 'acceptable' : 'critique') : 'acceptable',
        },
        { label: 'Charges de personnel', value: `${fmt(agg.chargesPersonnel)} FCFA`, status: 'bon' },
        {
          label: 'Personnel / CA',
          value: agg.ca > 0 ? `${((agg.chargesPersonnel / agg.ca) * 100).toFixed(1)}%` : 'N/A',
          status: agg.ca > 0 && (agg.chargesPersonnel / agg.ca) * 100 > 50 ? 'critique' : 'bon',
        },
        { label: 'Charges financieres', value: `${fmt(agg.chargesFinancieres)} FCFA`, status: agg.ca > 0 && (agg.chargesFinancieres / agg.ca) * 100 > 5 ? 'critique' : 'bon' },
      ],
      narrative: agg.resultat > 0
        ? `Resultat positif de **${fmt(agg.resultat)} FCFA** sur un CA de **${fmt(agg.ca)} FCFA**.`
        : `**Resultat deficitaire** de ${fmt(agg.resultat)} FCFA. Analyser la structure des charges.`,
    }
    return { title: 'Compte de Resultat', cards: [card] }
  }

  // Notes without relevant analysis: return empty (no fake KPIs)
  // note-01 (dettes garanties), note-02 (BPA), note-04 (HAO), note-07,
  // note-24/25 (HAO), note-28 to note-33, note-35, note-39
  return { title: '', cards: [] }
}


// ── Card rendering (same style as Proph3t chat) ──

function renderMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

const PredictionCardView: React.FC<{ data: PredictionCard; compact?: boolean }> = ({ data, compact }) => (
  <Box sx={{ p: 1.25, borderRadius: 1.5, border: '1px solid #e5e5e5', bgcolor: '#fff', mb: 1 }}>
    <Typography sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#171717', mb: 0.75, letterSpacing: 0.3 }}>
      {data.title}
    </Typography>

    {/* Indicators */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {data.indicators.map((ind, i) => (
        <Box key={i} sx={{
          display: 'flex', alignItems: 'center', gap: 0.75,
          p: 0.5, borderRadius: 1,
          bgcolor: STATUS_BG[ind.status] || '#fafafa',
          border: `1px solid ${STATUS_COLORS[ind.status] || '#e5e5e5'}20`,
        }}>
          <FiberManualRecord sx={{ fontSize: 7, color: STATUS_COLORS[ind.status] || '#a3a3a3', flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.62rem', color: '#525252', flex: 1, lineHeight: 1.2 }}>
            {ind.label}
          </Typography>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#171717', fontFamily: "'JetBrains Mono', monospace", whiteSpace: 'nowrap' }}>
            {ind.value}
            {ind.trend && (
              <span style={{ color: ind.trend === 'up' ? '#16a34a' : ind.trend === 'down' ? '#dc2626' : '#737373', marginLeft: 3, fontSize: '0.72rem' }}>
                {TREND_ARROWS[ind.trend]}
              </span>
            )}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* Narrative */}
    {data.narrative && !compact && (
      <Box sx={{ mt: 0.75, pt: 0.75, borderTop: '1px solid #f0f0f0' }}>
        <Typography sx={{ fontSize: '0.62rem', color: '#525252', lineHeight: 1.5 }}>
          {renderMarkdown(data.narrative)}
        </Typography>
      </Box>
    )}

    {/* Recommendations */}
    {data.recommendations && data.recommendations.length > 0 && !compact && (
      <Box sx={{ mt: 0.5, pt: 0.5, borderTop: '1px solid #f0f0f0' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '0.58rem', color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.25 }}>
          Recommandations Proph3t
        </Typography>
        {data.recommendations.slice(0, 3).map((rec, i) => (
          <Typography key={i} sx={{ fontSize: '0.6rem', color: '#525252', lineHeight: 1.5, pl: 0.75 }}>
            • {rec}
          </Typography>
        ))}
      </Box>
    )}
  </Box>
)

// ── Health score bar ──
const HealthBar: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#3b82f6' : score >= 30 ? '#d97706' : '#dc2626'
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Bon' : score >= 30 ? 'Attention' : 'Critique'
  return (
    <Box sx={{ px: 1.5, py: 1, bgcolor: '#fff', borderBottom: '1px solid #e5e5e5' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.62rem', fontWeight: 600, color: '#737373', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Score sante
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color, fontFamily: "'JetBrains Mono', monospace" }}>
          {score}/100
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 5, borderRadius: 3,
          bgcolor: '#f0f0f0',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 },
        }}
      />
      <Typography sx={{ fontSize: '0.58rem', color, mt: 0.25, fontWeight: 600, textAlign: 'right' }}>
        {label}
      </Typography>
    </Box>
  )
}

// ── Main component ──
const LiasseStats: React.FC<LiasseStatsProps> = ({ currentPage, entreprise, balance, balanceN1, onCollapse }) => {
  const balN = useMemo(() => toProph3tBalance(balance), [balance])
  const balN1Conv = useMemo(() => toProph3tBalance(balanceN1), [balanceN1])
  const agg = useMemo(() => balN.length > 0 ? calculerAgregats(balN) : null, [balN])

  const analysis = useMemo((): AnalysisSection | null => {
    if (!agg || balN.length === 0) return null
    return buildPageAnalysis(currentPage.id, currentPage.section, balN, balN1Conv, agg, entreprise)
  }, [currentPage.id, currentPage.section, balN, balN1Conv, agg, entreprise])

  // Extract health score from general analysis
  const healthScore = useMemo(() => {
    if (!agg || balN.length === 0) return null
    const resp = handlePredictionGeneral(balN)
    const card = resp.content?.find(c => c.type === 'prediction') as PredictionCard | undefined
    if (!card) return null
    const scoreInd = card.indicators.find(i => i.label === 'Score sante')
    if (!scoreInd) return null
    const match = scoreInd.value.match(/(\d+)/)
    return match ? parseInt(match[1]) : null
  }, [agg, balN])

  return (
    <Box sx={{
      width: 300,
      minWidth: 300,
      height: '100%',
      borderLeft: '1px solid #e5e5e5',
      borderRadius: 2,
      bgcolor: '#fafafa',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      '@media print': { display: 'none' },
    }}>
      {/* Header */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid #e5e5e5', bgcolor: '#171717', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <LocalHospital sx={{ fontSize: 16, color: '#a3a3a3' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#fff', letterSpacing: 0.3 }}>
              Proph3t
            </Typography>
            <Typography sx={{ fontSize: '0.58rem', color: '#737373' }}>
              Expert-Comptable IA
            </Typography>
          </Box>
          {onCollapse && (
            <IconButton size="small" onClick={onCollapse} sx={{ color: '#a3a3a3', '&:hover': { color: '#fff' }, p: 0.25 }}>
              <ChevronRight sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>
        <Typography noWrap sx={{ fontSize: '0.65rem', color: '#a3a3a3', bgcolor: '#262626', px: 1, py: 0.25, borderRadius: 1, display: 'block', maxWidth: '100%' }}>
          {currentPage.titre}
        </Typography>
      </Box>

      {/* Health score bar */}
      {healthScore !== null && <HealthBar score={healthScore} />}

      {/* Analysis content */}
      <Box sx={{
        flexGrow: 1,
        overflow: 'auto',
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        '&::-webkit-scrollbar': { width: 5 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#d4d4d4', borderRadius: 3 },
      }}>
        {balance.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4, gap: 1.5 }}>
            <InfoOutlined sx={{ fontSize: 28, color: '#d4d4d4' }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#737373', textAlign: 'center', lineHeight: 1.4, fontWeight: 500 }}>
              Importez une balance
            </Typography>
            <Typography sx={{ fontSize: '0.62rem', color: '#a3a3a3', textAlign: 'center', lineHeight: 1.4 }}>
              Proph3t analysera automatiquement vos donnees et fournira des diagnostics contextuels pour chaque page.
            </Typography>
          </Box>
        ) : analysis && analysis.cards.length > 0 ? (
          <>
            {/* Section title */}
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#a3a3a3', textTransform: 'uppercase', letterSpacing: 1, px: 0.5, pt: 0.5 }}>
              {analysis.title}
            </Typography>
            {analysis.cards.map((card, i) => (
              <PredictionCardView key={`${currentPage.id}-${i}`} data={card} compact={analysis.cards.length > 2 && i > 0} />
            ))}
          </>
        ) : (
          <Typography sx={{ fontSize: '0.72rem', color: '#a3a3a3', textAlign: 'center', py: 4 }}>
            Aucune analyse disponible
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default LiasseStats
