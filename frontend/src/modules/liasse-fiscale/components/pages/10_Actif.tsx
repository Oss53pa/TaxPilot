import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { BalanceEntry } from '../../types'
import { getActifBrut, getAmortProv } from '../../services/liasse-calculs'
import type { Column, Row } from '../LiasseTable'

const ACTIF_DETAIL: { ref: string; label: string; comptes: string[]; amort: string[]; note?: string; isTotal?: boolean; isSub?: boolean }[] = [
  { ref: '', label: 'CHARGES IMMOBILISEES', comptes: [], amort: [], isSub: true },
  { ref: 'AQ', label: 'Frais d\'etablissement', comptes: ['201'], amort: ['2801', '2901'], note: '3A' },
  { ref: 'AR', label: 'Charges a repartir', comptes: ['202'], amort: ['2802', '2902'], note: '3A' },
  { ref: 'AS', label: 'Primes de remboursement des obligations', comptes: ['206'], amort: ['2806', '2906'], note: '3A' },
  { ref: '', label: 'IMMOBILISATIONS INCORPORELLES', comptes: [], amort: [], isSub: true },
  { ref: 'AD', label: 'Brevets, licences, logiciels et droits similaires', comptes: ['211', '212'], amort: ['2811', '2812', '2911', '2912'], note: '3A' },
  { ref: 'AE', label: 'Fonds commercial et droit au bail', comptes: ['213', '214', '215'], amort: ['2813', '2814', '2815', '2913', '2914', '2915'], note: '3A' },
  { ref: 'AF', label: 'Autres immobilisations incorporelles', comptes: ['216', '217'], amort: ['2816', '2817', '2916', '2917'], note: '3A' },
  { ref: 'AG', label: 'Immobilisations incorporelles en cours', comptes: ['218', '219'], amort: ['2818', '2819', '2918', '2919'], note: '3A' },
  { ref: '', label: 'IMMOBILISATIONS CORPORELLES', comptes: [], amort: [], isSub: true },
  { ref: 'AJ', label: 'Terrains', comptes: ['22'], amort: ['282', '292'], note: '3C' },
  { ref: 'AK', label: 'Batiments', comptes: ['231', '232', '233', '234'], amort: ['2831', '2832', '2833', '2834', '2931', '2932', '2933', '2934'], note: '3C' },
  { ref: 'AL', label: 'Installations et agencements', comptes: ['235', '237', '238'], amort: ['2835', '2837', '2838', '2935', '2937', '2938'], note: '3C' },
  { ref: 'AM', label: 'Materiel, mobilier et actifs biologiques', comptes: ['241', '242', '243', '244'], amort: ['2841', '2842', '2843', '2844', '2941', '2942', '2943', '2944'], note: '3C' },
  { ref: 'AN', label: 'Materiel de transport', comptes: ['245'], amort: ['2845', '2945'], note: '3C' },
  { ref: '', label: 'AVANCES ET ACOMPTES', comptes: [], amort: [], isSub: true },
  { ref: 'AP', label: 'Avances et acomptes verses sur immobilisations', comptes: ['251', '252'], amort: [], note: '3C' },
  { ref: '', label: 'IMMOBILISATIONS FINANCIERES', comptes: [], amort: [], isSub: true },
  { ref: 'AT', label: 'Titres de participation', comptes: ['26'], amort: ['296'], note: '4' },
  { ref: 'AU', label: 'Autres immobilisations financieres', comptes: ['271', '272', '273', '274', '275', '276', '277'], amort: ['297'], note: '4' },
  { ref: 'AZ', label: 'TOTAL ACTIF IMMOBILISE (I)', comptes: [], amort: [], isTotal: true },
  { ref: '', label: 'ACTIF CIRCULANT', comptes: [], amort: [], isSub: true },
  { ref: 'BA', label: 'Actif circulant HAO', comptes: ['485', '486', '487', '488'], amort: ['498'], note: '5' },
  { ref: 'BC', label: 'Matieres premieres et fournitures liees', comptes: ['31'], amort: ['391'], note: '6' },
  { ref: 'BD', label: 'Autres approvisionnements', comptes: ['32'], amort: ['392'], note: '6' },
  { ref: 'BE', label: 'En-cours', comptes: ['33'], amort: ['393'], note: '6' },
  { ref: 'BF', label: 'Produits fabriques', comptes: ['34', '35'], amort: ['394', '395'], note: '6' },
  { ref: 'BG', label: 'Marchandises', comptes: ['36', '37', '38'], amort: ['396', '397', '398'], note: '6' },
  { ref: 'BI', label: 'Fournisseurs, avances versees', comptes: ['409'], amort: ['490'], note: '17' },
  { ref: 'BJ', label: 'Clients', comptes: ['411', '412', '413', '414', '415', '416', '418'], amort: ['491'], note: '7' },
  { ref: 'BK', label: 'Autres creances', comptes: ['43', '44', '45', '46', '47'], amort: ['492', '493', '494', '495', '496', '497'], note: '8' },
  { ref: 'BT', label: 'TOTAL ACTIF CIRCULANT (II)', comptes: [], amort: [], isTotal: true },
  { ref: '', label: 'TRESORERIE - ACTIF', comptes: [], amort: [], isSub: true },
  { ref: 'BQ', label: 'Titres de placement', comptes: ['50'], amort: ['590'], note: '9' },
  { ref: 'BR', label: 'Valeurs a encaisser', comptes: ['51'], amort: ['591'], note: '10' },
  { ref: 'BS', label: 'Banques, cheques postaux, caisse et assimiles', comptes: ['52', '53', '54', '55', '56', '57', '58'], amort: ['592', '593', '594'], note: '11' },
  { ref: 'BU', label: 'Ecart de conversion - Actif (III)', comptes: ['478'], amort: [], note: '12' },
  { ref: 'BZ', label: 'TOTAL GENERAL (I + II + III)', comptes: [], amort: [], isTotal: true },
]

function computeActif(bal: BalanceEntry[]) {
  let totalImmoB = 0, totalImmoA = 0
  let totalCircB = 0, totalCircA = 0
  let totalTresoB = 0, totalTresoA = 0
  let section = 'immo'

  return ACTIF_DETAIL.map(r => {
    if (r.isSub) {
      if (r.label.includes('CIRCULANT')) section = 'circ'
      else if (r.label.includes('TRESORERIE')) section = 'treso'
      else if (r.label.includes('CHARGES') || r.label.includes('INCORPOR') || r.label.includes('CORPOR') || r.label.includes('AVANCES') || r.label.includes('FINANC')) section = 'immo'
      return { ref: r.ref, brut: 0, amortV: 0, net: 0, isSub: true, isTotal: false, label: r.label, note: '' }
    }
    if (r.isTotal) {
      if (r.ref === 'AZ') return { ref: r.ref, brut: totalImmoB, amortV: totalImmoA, net: totalImmoB - totalImmoA, isSub: false, isTotal: true, label: r.label, note: '' }
      if (r.ref === 'BT') return { ref: r.ref, brut: totalCircB, amortV: totalCircA, net: totalCircB - totalCircA, isSub: false, isTotal: true, label: r.label, note: '' }
      if (r.ref === 'BZ') {
        const tb = totalImmoB + totalCircB + totalTresoB; const ta = totalImmoA + totalCircA + totalTresoA
        return { ref: r.ref, brut: tb, amortV: ta, net: tb - ta, isSub: false, isTotal: true, label: r.label, note: '' }
      }
      return { ref: r.ref, brut: 0, amortV: 0, net: 0, isSub: false, isTotal: true, label: r.label, note: '' }
    }
    const brut = getActifBrut(bal, r.comptes)
    const amortV = r.amort.length > 0 ? getAmortProv(bal, r.amort) : 0
    const net = brut - amortV
    if (section === 'immo' || r.ref <= 'AU') { totalImmoB += brut; totalImmoA += amortV }
    else if (section === 'circ') { totalCircB += brut; totalCircA += amortV }
    else { totalTresoB += brut; totalTresoA += amortV }
    return { ref: r.ref, brut, amortV, net, isSub: false, isTotal: false, label: r.label, note: r.note || '' }
  })
}

const Actif: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const data = computeActif(balance)
  const dataN1 = balanceN1 && balanceN1.length > 0 ? computeActif(balanceN1) : null

  const columns: Column[] = [
    { key: 'ref', label: 'REF', width: 28, align: 'center' },
    { key: 'label', label: 'ACTIF', width: '40%' },
    { key: 'note', label: 'Note', width: 30, align: 'center' },
    { key: 'brut', label: 'BRUT', align: 'right', subLabel: 'Exercice au 31/12/N' },
    { key: 'amort', label: 'AMORT et DEPREC.', align: 'right' },
    { key: 'net', label: 'NET', align: 'right' },
    { key: 'net_n1', label: 'NET', align: 'right', subLabel: 'Exercice au 31/12/N-1' },
  ]

  const rows: Row[] = data.map((r, i) => ({
    id: `${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.isSub || r.isTotal ? '' : r.note,
      brut: r.isSub ? '' : (r.brut || null),
      amort: r.isSub ? '' : (r.amortV || null),
      net: r.isSub ? '' : (r.net || null),
      net_n1: r.isSub ? '' : (dataN1 ? (dataN1[i].net || null) : null),
    },
    isTotal: r.isTotal,
    isSectionHeader: r.isSub,
    bold: r.isSub,
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
