import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { BalanceEntry } from '../../types'
import { getActifBrut, getAmortProv } from '../../services/liasse-calculs'
import type { Column, Row } from '../LiasseTable'

// ── Detail lines: each has comptes/amort for brut/amort computation ──

interface DetailLine {
  ref: string
  label: string
  comptes: string[]
  amort: string[]
  note: string
}

const DETAIL_LINES: DetailLine[] = [
  { ref: 'AE', label: 'Frais de développement et de prospection', comptes: ['211', '212'], amort: ['2811', '2812', '2911', '2912'], note: '3' },
  { ref: 'AF', label: 'Brevets, licences, logiciels, et droits similaires', comptes: ['213', '214', '215'], amort: ['2813', '2814', '2815', '2913', '2914', '2915'], note: '3' },
  { ref: 'AG', label: 'Fonds commercial et droit au bail', comptes: ['216'], amort: ['2816', '2916'], note: '3' },
  { ref: 'AH', label: 'Autres immobilisations incorporelles', comptes: ['217', '218', '219'], amort: ['2817', '2818', '2819', '2917', '2918', '2919'], note: '3' },
  { ref: 'AJ', label: 'Terrains', comptes: ['22'], amort: ['282', '292'], note: '3' },
  { ref: 'AK', label: 'Bâtiments', comptes: ['231', '232', '233', '234'], amort: ['2831', '2832', '2833', '2834', '2931', '2932', '2933', '2934'], note: '3' },
  { ref: 'AL', label: 'Aménagements, agencements et installations', comptes: ['235', '237', '238'], amort: ['2835', '2837', '2838', '2935', '2937', '2938'], note: '3' },
  { ref: 'AM', label: 'Matériel, mobilier et actifs biologiques', comptes: ['241', '242', '243', '244'], amort: ['2841', '2842', '2843', '2844', '2941', '2942', '2943', '2944'], note: '3' },
  { ref: 'AN', label: 'Matériel de transport', comptes: ['245'], amort: ['2845', '2945'], note: '3' },
  { ref: 'AP', label: 'AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS', comptes: ['251', '252'], amort: [], note: '3' },
  { ref: 'AR', label: 'Titres de participation', comptes: ['26'], amort: ['296'], note: '4' },
  { ref: 'AS', label: 'Autres immobilisations financières', comptes: ['271', '272', '273', '274', '275', '276', '277'], amort: ['297'], note: '4' },
  { ref: 'BA', label: 'ACTIF CIRCULANT HAO', comptes: ['485', '486', '487', '488'], amort: ['498'], note: '5' },
  { ref: 'BB', label: 'STOCKS ET ENCOURS', comptes: ['31', '32', '33', '34', '35', '36', '37', '38'], amort: ['391', '392', '393', '394', '395', '396', '397', '398'], note: '6' },
  { ref: 'BH', label: 'Fournisseurs avances versées', comptes: ['409'], amort: ['490'], note: '17' },
  { ref: 'BI', label: 'Clients', comptes: ['411', '412', '413', '414', '415', '416', '418'], amort: ['491'], note: '7' },
  { ref: 'BJ', label: 'Autres créances', comptes: ['43', '44', '45', '46', '47'], amort: ['492', '493', '494', '495', '496', '497'], note: '8' },
  { ref: 'BQ', label: 'Titres de placement', comptes: ['50'], amort: ['590'], note: '9' },
  { ref: 'BR', label: 'Valeurs à encaisser', comptes: ['51'], amort: ['591'], note: '10' },
  { ref: 'BS', label: 'Banques, chèques postaux, caisse et assimilés', comptes: ['52', '53', '54', '55', '56', '57', '58'], amort: ['592', '593', '594'], note: '11' },
  { ref: 'BU', label: 'Ecart de conversion-Actif', comptes: ['478'], amort: [], note: '12' },
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
  const detail = (ref: string, label: string, note: string, indent: number) => {
    const d = v(ref)
    rows.push({ ref, label, note, brut: d.brut, amortV: d.amortV, net: d.net, isTotal: false, isSubtotal: false, indent, bold: false })
  }
  const subtotal = (ref: string, label: string, note: string, data: { brut: number; amortV: number; net: number }) => {
    rows.push({ ref, label, note, brut: data.brut, amortV: data.amortV, net: data.net, isTotal: false, isSubtotal: true, indent: 0, bold: true })
  }
  const total = (ref: string, label: string, data: { brut: number; amortV: number; net: number }) => {
    rows.push({ ref, label, note: '', brut: data.brut, amortV: data.amortV, net: data.net, isTotal: true, isSubtotal: false, indent: 0, bold: true })
  }

  // IMMOBILISATIONS INCORPORELLES
  subtotal('AD', 'IMMOBILISATIONS INCORPORELLES', '3', AD)
  detail('AE', 'Frais de développement et de prospection', '3', 1)
  detail('AF', 'Brevets, licences, logiciels, et droits similaires', '3', 1)
  detail('AG', 'Fonds commercial et droit au bail', '3', 1)
  detail('AH', 'Autres immobilisations incorporelles', '3', 1)

  // IMMOBILISATIONS CORPORELLES
  subtotal('AI', 'IMMOBILISATIONS CORPORELLES', '3', AI)
  detail('AJ', 'Terrains', '3', 1)
  detail('AK', 'Bâtiments', '3', 1)
  detail('AL', 'Aménagements, agencements et installations', '3', 1)
  detail('AM', 'Matériel, mobilier et actifs biologiques', '3', 1)
  detail('AN', 'Matériel de transport', '3', 1)

  // AVANCES ET ACOMPTES
  rows.push({ ref: 'AP', label: 'AVANCES ET ACOMPTES VERSES SUR IMMOBILISATIONS', note: '3', brut: AP.brut, amortV: AP.amortV, net: AP.net, isTotal: false, isSubtotal: false, indent: 0, bold: true })

  // IMMOBILISATIONS FINANCIERES
  subtotal('AQ', 'IMMOBILISATIONS FINANCIERES', '4', AQ)
  detail('AR', 'Titres de participation', '4', 1)
  detail('AS', 'Autres immobilisations financières', '4', 1)

  // TOTAL ACTIF IMMOBILISE
  total('AZ', 'TOTAL ACTIF IMMOBILISE', AZ)

  // ACTIF CIRCULANT HAO
  rows.push({ ref: 'BA', label: 'ACTIF CIRCULANT HAO', note: '5', brut: BA.brut, amortV: BA.amortV, net: BA.net, isTotal: false, isSubtotal: false, indent: 0, bold: true })

  // STOCKS ET ENCOURS
  rows.push({ ref: 'BB', label: 'STOCKS ET ENCOURS', note: '6', brut: BB.brut, amortV: BB.amortV, net: BB.net, isTotal: false, isSubtotal: false, indent: 0, bold: true })

  // CREANCES ET EMPLOIS ASSIMILES
  subtotal('BG', 'CREANCES ET EMPLOIS ASSIMILES', '', BG)
  detail('BH', 'Fournisseurs avances versées', '17', 1)
  detail('BI', 'Clients', '7', 1)
  detail('BJ', 'Autres créances', '8', 1)

  // TOTAL ACTIF CIRCULANT
  total('BK', 'TOTAL ACTIF CIRCULANT', BK)

  // TRESORERIE-ACTIF detail lines
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
    { key: 'brut', label: 'BRUT', width: 120, align: 'right', subLabel: 'Exercice au 31/12/N' },
    { key: 'amort', label: 'AMORT et DEPREC.', width: 120, align: 'right' },
    { key: 'net', label: 'NET', width: 120, align: 'right' },
    { key: 'net_n1', label: 'NET', width: 120, align: 'right', subLabel: 'Exercice au 31/12/N-1' },
  ]

  const rows: Row[] = data.map((r, i) => ({
    id: `${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.note,
      brut: r.brut || null,
      amort: r.amortV || null,
      net: r.net || null,
      net_n1: r.ref && n1Map[r.ref] ? n1Map[r.ref] : null,
    },
    isSubtotal: r.isSubtotal,
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
