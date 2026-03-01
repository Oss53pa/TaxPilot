import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getCharges, getProduits, variation } from '../../services/liasse-calculs'

const v = (n: number) => n || null

const Note29: React.FC<PageProps> = ({ balance, balanceN1, onNoteClick, ...props }) => {
  const bN1 = balanceN1 || []
  const columns: Column[] = [
    { key: 'label', label: 'Libelles', width: '40%', align: 'left' },
    { key: 'n', label: 'Annee N', align: 'right' },
    { key: 'n1', label: 'Annee N-1', align: 'right' },
    { key: 'var', label: 'Variation en %', align: 'right' },
  ]

  // ── Section 1: Frais financiers (charges) ──
  const interetsEmprunts = getCharges(balance, ['671'])
  const interetsLoyers = getCharges(balance, ['672'])
  const escomptesAccordes = getCharges(balance, ['673'])
  const autresInterets = getCharges(balance, ['674'])
  const escomptesEffets = getCharges(balance, ['675'])
  const pertesChange = getCharges(balance, ['676'])
  const pertesCessions = getCharges(balance, ['677'])
  const malisAttrib = getCharges(balance, ['678'])
  const pertesRisques = getCharges(balance, ['679'])
  const chargesDeprec = getCharges(balance, ['6971', '6972'])
  const sousTotalA = interetsEmprunts + interetsLoyers + escomptesAccordes + autresInterets + escomptesEffets + pertesChange + pertesCessions + malisAttrib + pertesRisques + chargesDeprec

  const interetsEmpruntsN1 = getCharges(bN1, ['671'])
  const interetsLoyersN1 = getCharges(bN1, ['672'])
  const escomptesAccordesN1 = getCharges(bN1, ['673'])
  const autresInteretsN1 = getCharges(bN1, ['674'])
  const escomptesEffetsN1 = getCharges(bN1, ['675'])
  const pertesChangeN1 = getCharges(bN1, ['676'])
  const pertesCessionsN1 = getCharges(bN1, ['677'])
  const malisAttribN1 = getCharges(bN1, ['678'])
  const pertesRisquesN1 = getCharges(bN1, ['679'])
  const chargesDeprecN1 = getCharges(bN1, ['6971', '6972'])
  const sousTotalAN1 = interetsEmpruntsN1 + interetsLoyersN1 + escomptesAccordesN1 + autresInteretsN1 + escomptesEffetsN1 + pertesChangeN1 + pertesCessionsN1 + malisAttribN1 + pertesRisquesN1 + chargesDeprecN1

  // ── Section 2: Revenus financiers (produits) ──
  const interetsPrets = getProduits(balance, ['771'])
  const revenusParticip = getProduits(balance, ['772'])
  const escomptesObtenus = getProduits(balance, ['773'])
  const revenusPlacem = getProduits(balance, ['774'])
  const interetsLocFin = getProduits(balance, ['775'])
  const gainsChange = getProduits(balance, ['776'])
  const gainsCessions = getProduits(balance, ['777'])
  const gainsRisques = getProduits(balance, ['779'])
  const reprisesDeprec = getProduits(balance, ['7971', '7972'])
  const sousTotalB = interetsPrets + revenusParticip + escomptesObtenus + revenusPlacem + interetsLocFin + gainsChange + gainsCessions + gainsRisques + reprisesDeprec

  const interetsPretsN1 = getProduits(bN1, ['771'])
  const revenusParticipN1 = getProduits(bN1, ['772'])
  const escomptesObtenusN1 = getProduits(bN1, ['773'])
  const revenusPlacemN1 = getProduits(bN1, ['774'])
  const interetsLocFinN1 = getProduits(bN1, ['775'])
  const gainsChangeN1 = getProduits(bN1, ['776'])
  const gainsCessionsN1 = getProduits(bN1, ['777'])
  const gainsRisquesN1 = getProduits(bN1, ['779'])
  const reprisesDeprecN1 = getProduits(bN1, ['7971', '7972'])
  const sousTotalBN1 = interetsPretsN1 + revenusParticipN1 + escomptesObtenusN1 + revenusPlacemN1 + interetsLocFinN1 + gainsChangeN1 + gainsCessionsN1 + gainsRisquesN1 + reprisesDeprecN1

  // ── Resultat financier ──
  const resultat = sousTotalB - sousTotalA
  const resultatN1 = sousTotalBN1 - sousTotalAN1

  const pct = (a: number, b: number) => {
    const r = variation(a, b)
    return r ? `${r > 0 ? '+' : ''}${r.toFixed(1)} %` : null
  }

  const rows: Row[] = [
    // Section 1: Frais financiers
    { id: 'sh1', cells: { label: 'FRAIS FINANCIERS' }, isSectionHeader: true },
    { id: 'c1', cells: { label: 'Interets des emprunts', n: v(interetsEmprunts), n1: v(interetsEmpruntsN1), var: pct(interetsEmprunts, interetsEmpruntsN1) } },
    { id: 'c2', cells: { label: 'Interets dans loyers de locations acquisition', n: v(interetsLoyers), n1: v(interetsLoyersN1), var: pct(interetsLoyers, interetsLoyersN1) } },
    { id: 'c3', cells: { label: 'Escomptes accordes', n: v(escomptesAccordes), n1: v(escomptesAccordesN1), var: pct(escomptesAccordes, escomptesAccordesN1) } },
    { id: 'c4', cells: { label: 'Autres interets', n: v(autresInterets), n1: v(autresInteretsN1), var: pct(autresInterets, autresInteretsN1) } },
    { id: 'c5', cells: { label: 'Escomptes des effets de commerce', n: v(escomptesEffets), n1: v(escomptesEffetsN1), var: pct(escomptesEffets, escomptesEffetsN1) } },
    { id: 'c6', cells: { label: 'Pertes de change financieres', n: v(pertesChange), n1: v(pertesChangeN1), var: pct(pertesChange, pertesChangeN1) } },
    { id: 'c7', cells: { label: 'Pertes sur cessions de titres de placement', n: v(pertesCessions), n1: v(pertesCessionsN1), var: pct(pertesCessions, pertesCessionsN1) } },
    { id: 'c8', cells: { label: 'Malis provenant d\'attribution gratuite d\'actions', n: v(malisAttrib), n1: v(malisAttribN1), var: pct(malisAttrib, malisAttribN1) } },
    { id: 'c9', cells: { label: 'Pertes et charges sur risques financiers', n: v(pertesRisques), n1: v(pertesRisquesN1), var: pct(pertesRisques, pertesRisquesN1) } },
    { id: 'c10', cells: { label: 'Charges pour depreciation et provisions (voir note 28)', n: v(chargesDeprec), n1: v(chargesDeprecN1), var: pct(chargesDeprec, chargesDeprecN1) } },
    { id: 'st1', cells: { label: 'SOUS TOTAL : FRAIS FINANCIERS (A)', n: v(sousTotalA), n1: v(sousTotalAN1), var: pct(sousTotalA, sousTotalAN1) }, isSubtotal: true, bold: true },

    // Section 2: Revenus financiers
    { id: 'sh2', cells: { label: 'REVENUS FINANCIERS' }, isSectionHeader: true },
    { id: 'r1', cells: { label: 'Interets de prets et creances diverses', n: v(interetsPrets), n1: v(interetsPretsN1), var: pct(interetsPrets, interetsPretsN1) } },
    { id: 'r2', cells: { label: 'Revenus de participations et autres titres immobilises', n: v(revenusParticip), n1: v(revenusParticipN1), var: pct(revenusParticip, revenusParticipN1) } },
    { id: 'r3', cells: { label: 'Escomptes obtenus', n: v(escomptesObtenus), n1: v(escomptesObtenusN1), var: pct(escomptesObtenus, escomptesObtenusN1) } },
    { id: 'r4', cells: { label: 'Revenus de placement', n: v(revenusPlacem), n1: v(revenusPlacemN1), var: pct(revenusPlacem, revenusPlacemN1) } },
    { id: 'r5', cells: { label: 'Interets dans loyers de location-financement', n: v(interetsLocFin), n1: v(interetsLocFinN1), var: pct(interetsLocFin, interetsLocFinN1) } },
    { id: 'r6', cells: { label: 'Gains de change financiers', n: v(gainsChange), n1: v(gainsChangeN1), var: pct(gainsChange, gainsChangeN1) } },
    { id: 'r7', cells: { label: 'Gains sur cessions de titres de placement', n: v(gainsCessions), n1: v(gainsCessionsN1), var: pct(gainsCessions, gainsCessionsN1) } },
    { id: 'r8', cells: { label: 'Gains sur risques financiers', n: v(gainsRisques), n1: v(gainsRisquesN1), var: pct(gainsRisques, gainsRisquesN1) } },
    { id: 'r9', cells: { label: 'Reprises de charges pour depreciation et provisions (voir note 28)', n: v(reprisesDeprec), n1: v(reprisesDeprecN1), var: pct(reprisesDeprec, reprisesDeprecN1) } },
    { id: 'st2', cells: { label: 'SOUS TOTAL : REVENUS FINANCIERS (B)', n: v(sousTotalB), n1: v(sousTotalBN1), var: pct(sousTotalB, sousTotalBN1) }, isSubtotal: true, bold: true },

    // Resultat
    { id: 'total', cells: { label: 'RESULTAT FINANCIER (B) - (A)', n: v(resultat), n1: v(resultatN1), var: pct(resultat, resultatN1) }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 29"
      noteTitle="NOTE 29 : CHARGES ET REVENUS FINANCIERS"
      pageNumber="52"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note29
