import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { BalanceEntry } from '../../types'
import { getActifBrut, getAmortProv } from '../../services/liasse-calculs'
import type { Column, Row } from '../LiasseTable'
import { BILAN_ACTIF } from '@/constants/syscohada-mappings'

// ── Detail lines: each has comptes/amort for brut/amort computation ──

interface DetailLine {
  ref: string
  label: string
  comptes: string[]
  amort: string[]
  note: string
}

const DETAIL_LINES: DetailLine[] = [
  { ref: 'AE', label: 'Frais de développement et de prospection', comptes: [...BILAN_ACTIF.AE.comptes], amort: [...BILAN_ACTIF.AE.amort], note: '3' },
  { ref: 'AF', label: 'Brevets, licences, logiciels, et droits similaires', comptes: [...BILAN_ACTIF.AF.comptes], amort: [...BILAN_ACTIF.AF.amort], note: '3' },
  { ref: 'AG', label: 'Fonds commercial et droit au bail', comptes: [...BILAN_ACTIF.AG.comptes], amort: [...BILAN_ACTIF.AG.amort], note: '3' },
  { ref: 'AH', label: 'Autres immobilisations incorporelles', comptes: [...BILAN_ACTIF.AH.comptes], amort: [...BILAN_ACTIF.AH.amort], note: '3' },
  { ref: 'AJ', label: 'Terrains', comptes: [...BILAN_ACTIF.AJ.comptes], amort: [...BILAN_ACTIF.AJ.amort], note: '3' },
  { ref: 'AK', label: 'Bâtiments', comptes: [...BILAN_ACTIF.AK.comptes], amort: [...BILAN_ACTIF.AK.amort], note: '3' },
  { ref: 'AL', label: 'Aménagements, agencements et installations', comptes: [...BILAN_ACTIF.AL.comptes], amort: [...BILAN_ACTIF.AL.amort], note: '3' },
  { ref: 'AM', label: 'Matériel, mobilier et actifs biologiques', comptes: [...BILAN_ACTIF.AM.comptes], amort: [...BILAN_ACTIF.AM.amort], note: '3' },
  { ref: 'AN', label: 'Matériel de transport', comptes: [...BILAN_ACTIF.AN.comptes], amort: [...BILAN_ACTIF.AN.amort], note: '3' },
  { ref: 'AP', label: 'AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS', comptes: [...BILAN_ACTIF.AP.comptes], amort: [...BILAN_ACTIF.AP.amort], note: '3' },
  { ref: 'AR', label: 'Titres de participation', comptes: [...BILAN_ACTIF.AR.comptes], amort: [...BILAN_ACTIF.AR.amort], note: '4' },
  { ref: 'AS', label: 'Autres immobilisations financières', comptes: [...BILAN_ACTIF.AS.comptes], amort: [...BILAN_ACTIF.AS.amort], note: '4' },
  { ref: 'BA', label: 'ACTIF CIRCULANT HAO', comptes: [...BILAN_ACTIF.BA.comptes], amort: [...BILAN_ACTIF.BA.amort], note: '5' },
  { ref: 'BB', label: 'STOCKS ET ENCOURS', comptes: [...BILAN_ACTIF.BB.comptes], amort: [...BILAN_ACTIF.BB.amort], note: '6' },
  { ref: 'BH', label: 'Fournisseurs avances versées', comptes: [...BILAN_ACTIF.BH.comptes], amort: [...BILAN_ACTIF.BH.amort], note: '17' },
  { ref: 'BI', label: 'Clients', comptes: [...BILAN_ACTIF.BI.comptes], amort: [...BILAN_ACTIF.BI.amort], note: '7' },
  { ref: 'BJ', label: 'Autres créances', comptes: [...BILAN_ACTIF.BJ.comptes], amort: [...BILAN_ACTIF.BJ.amort], note: '8' },
  { ref: 'BQ', label: 'Titres de placement', comptes: [...BILAN_ACTIF.BQ.comptes], amort: [...BILAN_ACTIF.BQ.amort], note: '9' },
  { ref: 'BR', label: 'Valeurs à encaisser', comptes: [...BILAN_ACTIF.BR.comptes], amort: [...BILAN_ACTIF.BR.amort], note: '10' },
  { ref: 'BS', label: 'Banques, chèques postaux, caisse et assimilés', comptes: [...BILAN_ACTIF.BS.comptes], amort: [...BILAN_ACTIF.BS.amort], note: '11' },
  { ref: 'BU', label: 'Ecart de conversion-Actif', comptes: [...BILAN_ACTIF.BU.comptes], amort: [...BILAN_ACTIF.BU.amort], note: '12' },
]

// ── Computed row returned by computeActif ──

interface ComputedRow {
  ref: string
  label: string
  note: string
  brut: number
  amortV: number
  net: number
  isTotal: boolean
  isSubtotal: boolean
  isSectionHeader: boolean
  indent: number
  bold: boolean
}

function computeActif(bal: BalanceEntry[]): ComputedRow[] {
  // Pass 1: compute detail values
  const vals: Record<string, { brut: number; amortV: number; net: number }> = {}
  for (const d of DETAIL_LINES) {
    const brut = getActifBrut(bal, d.comptes)
    const amortV = d.amort.length > 0 ? getAmortProv(bal, d.amort) : 0
    vals[d.ref] = { brut, amortV, net: brut - amortV }
  }

  // Helper to sum refs
  const sum = (...refs: string[]) => {
    let b = 0, a = 0
    for (const r of refs) {
      if (vals[r]) { b += vals[r].brut; a += vals[r].amortV }
    }
    return { brut: b, amortV: a, net: b - a }
  }

  // Pass 2: compute subtotals and totals
  const AD = sum('AE', 'AF', 'AG', 'AH')
  const AI = sum('AJ', 'AK', 'AL', 'AM', 'AN')
  const AP = vals['AP']
  const AQ = sum('AR', 'AS')
  const AZ = { brut: AD.brut + AI.brut + AP.brut + AQ.brut, amortV: AD.amortV + AI.amortV + AP.amortV + AQ.amortV, net: 0 }
  AZ.net = AZ.brut - AZ.amortV

  const BA = vals['BA']
  const BB = vals['BB']
  const BG = sum('BH', 'BI', 'BJ')
  const BK = { brut: BA.brut + BB.brut + BG.brut, amortV: BA.amortV + BB.amortV + BG.amortV, net: 0 }
  BK.net = BK.brut - BK.amortV

  const BQ = vals['BQ']
  const BR = vals['BR']
  const BS = vals['BS']
  const BT = { brut: BQ.brut + BR.brut + BS.brut, amortV: BQ.amortV + BR.amortV + BS.amortV, net: 0 }
  BT.net = BT.brut - BT.amortV

  const BU = vals['BU']
  const BZ = { brut: AZ.brut + BK.brut + BT.brut + BU.brut, amortV: AZ.amortV + BK.amortV + BT.amortV + BU.amortV, net: 0 }
  BZ.net = BZ.brut - BZ.amortV

  // Build the ordered rows
  const rows: ComputedRow[] = []
  const v = (ref: string) => vals[ref]
  const sectionHeader = (label: string) => {
    rows.push({ ref: '', label, note: '', brut: 0, amortV: 0, net: 0, isTotal: false, isSubtotal: false, isSectionHeader: true, indent: 0, bold: true })
  }
  const detail = (ref: string, label: string, note: string, indent: number) => {
    const d = v(ref)
    rows.push({ ref, label, note, brut: d.brut, amortV: d.amortV, net: d.net, isTotal: false, isSubtotal: false, isSectionHeader: false, indent, bold: false })
  }
  const boldRow = (ref: string, label: string, note: string, data: { brut: number; amortV: number; net: number }) => {
    rows.push({ ref, label, note, brut: data.brut, amortV: data.amortV, net: data.net, isTotal: false, isSubtotal: false, isSectionHeader: false, indent: 0, bold: true })
  }
  const total = (ref: string, label: string, data: { brut: number; amortV: number; net: number }) => {
    rows.push({ ref, label, note: '', brut: data.brut, amortV: data.amortV, net: data.net, isTotal: true, isSubtotal: false, isSectionHeader: false, indent: 0, bold: true })
  }

  // ACTIF IMMOBILISE
  sectionHeader('ACTIF IMMOBILISE')

  // IMMOBILISATIONS INCORPORELLES
  boldRow('AD', 'Immobilisations incorporelles', '3', AD)
  detail('AE', 'Frais de développement et de prospection', '3', 1)
  detail('AF', 'Brevets, licences, logiciels, et droits similaires', '3', 1)
  detail('AG', 'Fonds commercial et droit au bail', '3', 1)
  detail('AH', 'Autres immobilisations incorporelles', '3', 1)

  // IMMOBILISATIONS CORPORELLES
  boldRow('AI', 'Immobilisations corporelles', '3', AI)
  detail('AJ', 'Terrains', '3', 1)
  detail('AK', 'Bâtiments', '3', 1)
  detail('AL', 'Aménagements, agencements et installations', '3', 1)
  detail('AM', 'Matériel, mobilier et actifs biologiques', '3', 1)
  detail('AN', 'Matériel de transport', '3', 1)

  // AVANCES ET ACOMPTES
  boldRow('AP', 'Avances et acomptes versés sur immobilisations', '3', AP)

  // IMMOBILISATIONS FINANCIERES
  boldRow('AQ', 'Immobilisations financières', '4', AQ)
  detail('AR', 'Titres de participation', '4', 1)
  detail('AS', 'Autres immobilisations financières', '4', 1)

  // TOTAL ACTIF IMMOBILISE
  total('AZ', 'TOTAL ACTIF IMMOBILISE', AZ)

  // ACTIF CIRCULANT
  sectionHeader('ACTIF CIRCULANT')

  // ACTIF CIRCULANT HAO
  boldRow('BA', 'Actif circulant HAO', '5', BA)

  // STOCKS ET ENCOURS
  boldRow('BB', 'Stocks et encours', '6', BB)

  // CREANCES ET EMPLOIS ASSIMILES
  boldRow('BG', 'Créances et emplois assimilés', '', BG)
  detail('BH', 'Fournisseurs avances versées', '17', 1)
  detail('BI', 'Clients', '7', 1)
  detail('BJ', 'Autres créances', '8', 1)

  // TOTAL ACTIF CIRCULANT
  total('BK', 'TOTAL ACTIF CIRCULANT', BK)

  // TRESORERIE-ACTIF
  sectionHeader('TRESORERIE - ACTIF')
  detail('BQ', 'Titres de placement', '9', 0)
  detail('BR', 'Valeurs à encaisser', '10', 0)
  detail('BS', 'Banques, chèques postaux, caisse et assimilés', '11', 0)

  // TOTAL TRESORERIE-ACTIF
  total('BT', 'TOTAL TRESORERIE-ACTIF', BT)

  // Ecart de conversion
  detail('BU', 'Ecart de conversion-Actif', '12', 0)

  // TOTAL GENERAL
  total('BZ', 'TOTAL GENERAL', BZ)

  return rows
}

const Actif: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const data = computeActif(balance)
  const dataN1 = balanceN1 && balanceN1.length > 0 ? computeActif(balanceN1) : null

  // Build a ref->net map for N-1 lookup
  const n1Map: Record<string, number> = {}
  if (dataN1) {
    for (const r of dataN1) {
      if (r.ref) n1Map[r.ref] = r.net
    }
  }

  const columns: Column[] = [
    { key: 'ref', label: 'REF', width: 52, align: 'center' },
    { key: 'label', label: 'ACTIF', width: '35%' },
    { key: 'note', label: 'Note', width: 44, align: 'center' },
    { key: 'brut', label: 'BRUT', width: 130, align: 'right', subLabel: 'Exercice N' },
    { key: 'amort', label: 'AMORT/DEPREC.', width: 130, align: 'right' },
    { key: 'net', label: 'NET', width: 130, align: 'right' },
    { key: 'net_n1', label: 'NET', width: 130, align: 'right', subLabel: 'Exercice N-1' },
  ]

  const rows: Row[] = data.map((r, i) => ({
    id: `${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.isSectionHeader || r.isTotal ? '' : r.note,
      brut: r.isSectionHeader ? '' : (r.brut || null),
      amort: r.isSectionHeader ? '' : (r.amortV || null),
      net: r.isSectionHeader ? '' : (r.net || null),
      net_n1: r.isSectionHeader ? '' : (r.ref && n1Map[r.ref] ? n1Map[r.ref] : null),
    },
    isSectionHeader: r.isSectionHeader,
    isTotal: r.isTotal,
    indent: r.indent,
    bold: r.bold,
  }))

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} pageNumber="8" />
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, textAlign: 'center', mb: 1, fontFamily: 'inherit' }}>
        ACTIF
      </Typography>
      <LiasseTable columns={columns} rows={rows} compact onNoteClick={onNoteClick} />
    </Box>
  )
}

export default Actif
