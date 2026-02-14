/**
 * Knowledge — Fiscalité Côte d'Ivoire
 */

import { getTauxFiscaux, calculerIS, calculerTVA, calculerPatente, arrondiFCFA } from '@/config/taux-fiscaux-ci'
import type { Proph3tResponse, FiscalInfoCard } from '../types'

function fmt(n: number): string {
  return n.toLocaleString('fr-FR')
}

function pct(n: number): string {
  const val = n * 100
  return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}%`
}

// ── Tax Rates ────────────────────────────────────────────────────────

export function handleFiscalTaxRate(keywords: string[], category?: string): Proph3tResponse {
  const taux = getTauxFiscaux()
  const cat = category?.toUpperCase()

  if (cat === 'IS' || keywords.some(k => /\b(is|impot|benefice|bic)\b/.test(k))) {
    const card: FiscalInfoCard = {
      type: 'fiscal_info',
      category: 'Impot sur les Societes (IS)',
      items: [
        { label: 'Taux normal', value: pct(taux.IS.taux_normal) },
        { label: 'Taux PME', value: pct(taux.IS.taux_pme) },
        { label: 'Zone franche', value: 'Exonere' },
        { label: 'IMF (minimum)', value: `${pct(taux.IMF.taux)} du CA` },
        { label: 'IMF plancher', value: `${fmt(taux.IMF.minimum)} FCFA` },
        { label: 'IMF plafond', value: `${fmt(taux.IMF.maximum)} FCFA` },
      ],
    }
    return {
      text: `**Taux de l'Impot sur les Societes (IS) - Cote d'Ivoire**\n\nLe taux normal de l'IS est de **${pct(taux.IS.taux_normal)}** (CGI Art. 33). Les PME eligibles beneficient d'un taux reduit de **${pct(taux.IS.taux_pme)}**.\n\nL'Impot Minimum Forfaitaire (IMF) est de **${pct(taux.IMF.taux)}** du CA, avec un minimum de **${fmt(taux.IMF.minimum)} FCFA** et un plafond de **${fmt(taux.IMF.maximum)} FCFA**.`,
      content: [card],
      suggestions: ['Calculer IS', 'Taux TVA', 'Calendrier fiscal'],
    }
  }

  if (cat === 'TVA' || keywords.some(k => /\b(tva|valeur ajoutee)\b/.test(k))) {
    const card: FiscalInfoCard = {
      type: 'fiscal_info',
      category: 'TVA',
      items: [
        { label: 'Taux normal', value: pct(taux.TVA.taux_normal) },
        { label: 'Taux reduit', value: pct(taux.TVA.taux_reduit) },
        { label: 'Taux zero (export)', value: '0%' },
        { label: 'THA', value: pct(taux.TVA.taux_tha) },
      ],
    }
    return {
      text: `**Taux de TVA - Cote d'Ivoire**\n\nLe taux normal de TVA est de **${pct(taux.TVA.taux_normal)}** (CGI Art. 356). Un taux reduit de **${pct(taux.TVA.taux_reduit)}** s'applique aux produits de premiere necessite.`,
      content: [card],
      suggestions: ['Calculer TVA', 'Taux IS', 'Calendrier fiscal'],
    }
  }

  if (cat === 'CNPS' || keywords.some(k => /\b(cnps|cotisation|retraite)\b/.test(k))) {
    const card: FiscalInfoCard = {
      type: 'fiscal_info',
      category: 'CNPS - Cotisations Sociales',
      items: [
        { label: 'Retraite employeur', value: pct(taux.CNPS.retraite_employeur) },
        { label: 'Retraite salarie', value: pct(taux.CNPS.retraite_salarie) },
        { label: 'Prestations familiales', value: pct(taux.CNPS.prestations_familiales) },
        { label: 'Accident du travail', value: pct(taux.CNPS.accident_travail) },
        { label: 'Plafond retraite', value: `${fmt(taux.CNPS.plafond_retraite)} FCFA/mois` },
      ],
    }
    return {
      text: `**Cotisations CNPS - Cote d'Ivoire**\n\nLes cotisations retraite sont de **${pct(taux.CNPS.retraite_employeur)}** (employeur) et **${pct(taux.CNPS.retraite_salarie)}** (salarie), plafonnees a **${fmt(taux.CNPS.plafond_retraite)} FCFA/mois**.`,
      content: [card],
      suggestions: ['Taux salaires', 'Taux IS', 'Calendrier fiscal'],
    }
  }

  if (cat === 'RETENUES' || keywords.some(k => /\b(retenue|airsi|ircm|prelevement)\b/.test(k))) {
    const card: FiscalInfoCard = {
      type: 'fiscal_info',
      category: 'Retenues a la Source',
      items: [
        { label: 'AIRSI (prestataires)', value: pct(taux.RETENUES.airsi) },
        { label: 'IRC resident (loyers)', value: pct(taux.RETENUES.irc_resident) },
        { label: 'IRC non-resident', value: pct(taux.RETENUES.irc_non_resident) },
        { label: 'IRCM (dividendes)', value: pct(taux.RETENUES.ircm) },
        { label: 'Honoraires', value: pct(taux.RETENUES.honoraires) },
        { label: 'BIC non-resident', value: pct(taux.RETENUES.bic_non_resident) },
      ],
    }
    return {
      text: `**Retenues a la Source - Cote d'Ivoire**\n\nL'AIRSI sur les prestataires est de **${pct(taux.RETENUES.airsi)}**. La retenue sur les dividendes/interets (IRCM) est de **${pct(taux.RETENUES.ircm)}**.`,
      content: [card],
      suggestions: ['Taux IS', 'Taux TVA', 'Deductibilite'],
    }
  }

  if (cat === 'SALAIRES' || keywords.some(k => /\b(salaire|paie|igr|remuneration)\b/.test(k))) {
    const card: FiscalInfoCard = {
      type: 'fiscal_info',
      category: 'Impots sur Salaires',
      items: [
        { label: 'IS/Salaires (employeur)', value: pct(taux.SALAIRES.is_salaire) },
        { label: 'FPC', value: pct(taux.SALAIRES.fpc) },
        { label: 'Taxe apprentissage', value: pct(taux.SALAIRES.taxe_apprentissage) },
        { label: 'CN tranche 2', value: pct(taux.SALAIRES.cn.tranche2.taux) },
        { label: 'CN tranche 3', value: pct(taux.SALAIRES.cn.tranche3.taux) },
        { label: 'CN tranche 4', value: pct(taux.SALAIRES.cn.tranche4.taux) },
      ],
    }
    return {
      text: `**Impots sur Salaires - Cote d'Ivoire**\n\nL'impot sur salaires a la charge de l'employeur est de **${pct(taux.SALAIRES.is_salaire)}**. La Contribution Nationale (CN) est progressive avec un bareme allant de 0% a 10%.`,
      content: [card],
      suggestions: ['Taux CNPS', 'Taux IS', 'Calendrier fiscal'],
    }
  }

  if (cat === 'LOCAUX' || keywords.some(k => /\b(patente|foncier|local|locaux|habitation)\b/.test(k))) {
    const card: FiscalInfoCard = {
      type: 'fiscal_info',
      category: 'Impots Locaux',
      items: [
        { label: 'Foncier bati', value: pct(taux.LOCAUX.contribution_fonciere.taux_bati) },
        { label: 'Foncier non bati', value: pct(taux.LOCAUX.contribution_fonciere.taux_non_bati) },
        { label: 'Taxe habitation', value: pct(taux.LOCAUX.taxe_habitation) },
        { label: 'Patente (proportionnel)', value: pct(taux.LOCAUX.patente.taux_proportionnel) },
      ],
    }
    return {
      text: `**Impots Locaux - Cote d'Ivoire**\n\nLa contribution fonciere est de **${pct(taux.LOCAUX.contribution_fonciere.taux_bati)}** (bati) sur la valeur locative. La patente comprend un droit fixe + **${pct(taux.LOCAUX.patente.taux_proportionnel)}** de la valeur locative.`,
      content: [card],
      suggestions: ['Calculer patente', 'Taux IS', 'Calendrier fiscal'],
    }
  }

  if (cat === 'ENREGISTREMENT' || keywords.some(k => /\b(enregistrement|cession\s*immeuble|baux)\b/.test(k))) {
    const card: FiscalInfoCard = {
      type: 'fiscal_info',
      category: 'Droits d\'Enregistrement',
      items: [
        { label: 'Cession immeubles', value: pct(taux.ENREGISTREMENT.cession_immeubles) },
        { label: 'Cession fonds commerce', value: pct(taux.ENREGISTREMENT.cession_fonds_commerce) },
        { label: 'Baux', value: pct(taux.ENREGISTREMENT.baux) },
      ],
    }
    return {
      text: `**Droits d'Enregistrement - Cote d'Ivoire**\n\nLe taux de droit d'enregistrement sur les cessions d'immeubles est de **${pct(taux.ENREGISTREMENT.cession_immeubles)}**.`,
      content: [card],
      suggestions: ['Taux IS', 'Taux TVA', 'Deductibilite'],
    }
  }

  // Default: general overview
  const card: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Taux Fiscaux CI - Vue d\'ensemble',
    items: [
      { label: 'IS (taux normal)', value: pct(taux.IS.taux_normal) },
      { label: 'TVA (taux normal)', value: pct(taux.TVA.taux_normal) },
      { label: 'IMF', value: `${pct(taux.IMF.taux)} du CA` },
      { label: 'AIRSI', value: pct(taux.RETENUES.airsi) },
      { label: 'IRCM', value: pct(taux.RETENUES.ircm) },
      { label: 'CNPS retraite (empl.)', value: pct(taux.CNPS.retraite_employeur) },
    ],
  }
  return {
    text: `**Principaux taux fiscaux - Cote d'Ivoire**\n\nVoici un apercu des taux les plus courants. Precisez votre question pour plus de details (IS, TVA, CNPS, retenues, salaires, patente, enregistrement).`,
    content: [card],
    suggestions: ['Taux IS', 'Taux TVA', 'Taux CNPS', 'Retenues a la source'],
  }
}

// ── Calculations ─────────────────────────────────────────────────────

export function handleFiscalCalculation(keywords: string[], numericValue?: number): Proph3tResponse {
  if (!numericValue) {
    return {
      text: "Pour effectuer un calcul fiscal, precisez un montant. Par exemple :\n\n- \"Calculer IS sur 50 millions de resultat\"\n- \"Calculer TVA sur 10M\"\n- \"Calculer patente CA 100 millions\"",
      suggestions: ['Calculer IS sur 50M', 'Calculer TVA sur 10M', 'Taux fiscaux'],
    }
  }

  // Determine calculation type
  const text = keywords.join(' ')

  if (/\b(tva|valeur ajoutee)\b/.test(text)) {
    const result = calculerTVA(numericValue)
    const card: FiscalInfoCard = {
      type: 'fiscal_info',
      category: 'Calcul TVA',
      items: [
        { label: 'Montant HT', value: `${fmt(result.ht)} FCFA` },
        { label: 'TVA (18%)', value: `${fmt(result.tva)} FCFA` },
        { label: 'Montant TTC', value: `${fmt(result.ttc)} FCFA` },
      ],
      calculation: {
        steps: [
          `Base HT : ${fmt(result.ht)} FCFA`,
          `TVA = ${fmt(result.ht)} x 18% = ${fmt(result.tva)} FCFA`,
          `TTC = ${fmt(result.ht)} + ${fmt(result.tva)} = ${fmt(result.ttc)} FCFA`,
        ],
        result: `${fmt(result.ttc)} FCFA TTC`,
      },
    }
    return {
      text: `**Calcul TVA sur ${fmt(numericValue)} FCFA**`,
      content: [card],
      suggestions: ['Calculer IS', 'Taux TVA', 'Calendrier fiscal'],
    }
  }

  if (/\b(patente)\b/.test(text)) {
    const valeurLocative = numericValue * 0.05 // estimation 5% du CA
    const result = calculerPatente(numericValue, valeurLocative)
    const card: FiscalInfoCard = {
      type: 'fiscal_info',
      category: 'Calcul Patente',
      items: [
        { label: 'CA', value: `${fmt(numericValue)} FCFA` },
        { label: 'Droit fixe', value: `${fmt(result.droit_fixe)} FCFA` },
        { label: 'Droit proportionnel', value: `${fmt(result.droit_proportionnel)} FCFA` },
        { label: 'Total patente', value: `${fmt(result.total)} FCFA` },
      ],
      calculation: {
        steps: [
          `CA : ${fmt(numericValue)} FCFA`,
          `Droit fixe (bareme CA) : ${fmt(result.droit_fixe)} FCFA`,
          `Valeur locative estimee (5% CA) : ${fmt(arrondiFCFA(valeurLocative))} FCFA`,
          `Droit proportionnel = VL x 18.5% = ${fmt(result.droit_proportionnel)} FCFA`,
          `Total = ${fmt(result.droit_fixe)} + ${fmt(result.droit_proportionnel)} = ${fmt(result.total)} FCFA`,
        ],
        result: `${fmt(result.total)} FCFA`,
      },
    }
    return {
      text: `**Calcul Patente pour un CA de ${fmt(numericValue)} FCFA**`,
      content: [card],
      suggestions: ['Taux patente', 'Calculer IS', 'Calendrier fiscal'],
    }
  }

  // Default: IS calculation
  // Use the value as both result AND CA for IMF (user can specify "calculer IS resultat X CA Y" later)
  const ca = numericValue
  const result = calculerIS(numericValue, ca)
  const card: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Calcul IS',
    items: [
      { label: 'Resultat fiscal', value: `${fmt(numericValue)} FCFA` },
      { label: 'IS brut (25%)', value: `${fmt(result.is_brut)} FCFA` },
      { label: 'IMF (CA = resultat)', value: `${fmt(result.imf)} FCFA` },
      { label: 'IS du', value: `${fmt(result.is_du)} FCFA` },
      { label: 'Base retenue', value: result.base },
    ],
    calculation: {
      steps: [
        `Resultat fiscal : ${fmt(numericValue)} FCFA`,
        `IS brut = ${fmt(numericValue)} x 25% = ${fmt(result.is_brut)} FCFA`,
        `IMF = max(${fmt(3_000_000)}, min(CA x 0.5%, ${fmt(35_000_000)})) = ${fmt(result.imf)} FCFA`,
        `IS du = max(IS brut, IMF) = ${fmt(result.is_du)} FCFA`,
        `Note : le CA est suppose egal au resultat pour le calcul IMF. Pour un calcul precis, utilisez l'analyse predictive avec votre balance.`,
      ],
      result: `${fmt(result.is_du)} FCFA (base ${result.base})`,
    },
  }
  return {
    text: `**Calcul IS sur un resultat fiscal de ${fmt(numericValue)} FCFA**`,
    content: [card],
    suggestions: ['Calculer TVA', 'Calendrier IS', 'Deductibilite'],
  }
}

// ── Deductibility ────────────────────────────────────────────────────

export function handleFiscalDeductibility(_keywords: string[]): Proph3tResponse {
  const taux = getTauxFiscaux()
  const card: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Charges Non Deductibles / Plafonds',
    items: [
      { label: 'Cadeaux clients', value: `${pct(taux.DEDUCTIBILITE.plafond_cadeaux)} du CA` },
      { label: 'Dons et liberalites', value: `${pct(taux.DEDUCTIBILITE.plafond_dons)} du CA` },
      { label: 'Interets compte courant', value: `Taux max ${pct(taux.DEDUCTIBILITE.plafond_interets_cc)}` },
      { label: 'Amortissement vehicule', value: `Plafond ${fmt(taux.DEDUCTIBILITE.amort_vehicule_plafond)} FCFA` },
      { label: 'Missions internes', value: `${fmt(taux.DEDUCTIBILITE.plafond_missions)} FCFA/jour` },
    ],
  }
  return {
    text: `**Plafonds de deductibilite fiscale - Cote d'Ivoire**\n\nCertaines charges sont deductibles dans la limite de plafonds fixes par le CGI :\n\n- **Cadeaux** : ${pct(taux.DEDUCTIBILITE.plafond_cadeaux)} du CA\n- **Dons** : ${pct(taux.DEDUCTIBILITE.plafond_dons)} du CA\n- **Amortissement vehicules** : plafond de ${fmt(taux.DEDUCTIBILITE.amort_vehicule_plafond)} FCFA\n- **Interets compte courant** : taux max de ${pct(taux.DEDUCTIBILITE.plafond_interets_cc)}\n- **Missions** : ${fmt(taux.DEDUCTIBILITE.plafond_missions)} FCFA/jour`,
    content: [card],
    suggestions: ['Taux IS', 'Calculer IS', 'Calendrier fiscal'],
  }
}

// ── Fiscal Calendar ──────────────────────────────────────────────────

export function handleFiscalCalendar(): Proph3tResponse {
  const taux = getTauxFiscaux()
  const card: FiscalInfoCard = {
    type: 'fiscal_info',
    category: 'Calendrier Fiscal',
    items: [
      { label: 'Acompte IS 1', value: '15 mars' },
      { label: 'Acompte IS 2', value: '15 juin' },
      { label: 'Acompte IS 3', value: '15 septembre' },
      { label: 'Acompte IS 4', value: '15 decembre' },
      { label: 'TVA mensuelle', value: '15 du mois suivant' },
      { label: 'Declaration IS', value: '30 avril N+1' },
      { label: 'Patente', value: '15 janvier' },
    ],
  }
  return {
    text: `**Calendrier fiscal - Cote d'Ivoire**\n\n**Acomptes IS** (${pct(taux.ACOMPTES.taux_acompte)} de l'IS N-1 chacun) :\n- ${taux.ACOMPTES.echeances.join('\n- ')}\n\n**TVA** : declaration mensuelle au plus tard le 15 du mois suivant\n\n**Declaration annuelle IS** : au plus tard le 30 avril N+1\n\n**Patente** : 15 janvier`,
    content: [card],
    suggestions: ['Taux IS', 'Calculer IS', 'Deductibilite'],
  }
}

// ── General fiscal search ────────────────────────────────────────────

export function handleFiscalGeneral(keywords: string[]): Proph3tResponse {
  // Try to route to a specific handler based on keywords
  const text = keywords.join(' ')

  if (/\b(taux|pourcentage|combien)\b/.test(text)) {
    return handleFiscalTaxRate(keywords)
  }
  if (/\b(calendrier|echeance|date|quand|delai)\b/.test(text)) {
    return handleFiscalCalendar()
  }
  if (/\b(deductib|plafond|deduction)\b/.test(text)) {
    return handleFiscalDeductibility(keywords)
  }

  return {
    text: "**Fiscalite Cote d'Ivoire** — Je peux vous renseigner sur :\n\n- **Taux fiscaux** : IS, TVA, CNPS, retenues, salaires, patente\n- **Calculs** : IS, TVA, patente\n- **Deductibilite** : plafonds des charges non deductibles\n- **Calendrier** : echeances de declaration et paiement\n\nPrecisez votre question !",
    suggestions: ['Taux IS', 'Taux TVA', 'Deductibilite', 'Calendrier fiscal'],
  }
}
