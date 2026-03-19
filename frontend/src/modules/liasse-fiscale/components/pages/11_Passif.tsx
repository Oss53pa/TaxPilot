import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { BalanceEntry } from '../../types'
import { getPassif, getBalanceSolde } from '../../services/liasse-calculs'
import type { Column, Row } from '../LiasseTable'

const PASSIF_DETAIL: { ref: string; label: string; comptes: string[]; note?: string; isTotal?: boolean; isSub?: boolean; special?: string }[] = [
  { ref: '', label: 'CAPITAUX PROPRES ET RESSOURCES ASSIMILEES', comptes: [], isSub: true },
  { ref: 'CA', label: 'Capital', comptes: ['101', '102', '103'], note: '13' },
  { ref: 'CB', label: 'Apporteurs capital non appel\u00e9 (-)', comptes: ['109'], note: '13', special: 'debit' },
  { ref: 'CD', label: 'Primes li\u00e9es au capital social', comptes: ['104', '105'], note: '14' },
  { ref: 'CE', label: 'Ecarts de r\u00e9\u00e9valuation', comptes: ['106'], note: '3e' },
  { ref: 'CF', label: 'R\u00e9serves indisponibles', comptes: ['111', '112'], note: '14' },
  { ref: 'CG', label: 'R\u00e9serves libres', comptes: ['113', '118'], note: '14' },
  { ref: 'CH', label: 'Report \u00e0 nouveau (+ ou -)', comptes: ['12'], note: '14', special: 'signed' },
  { ref: 'CJ', label: 'R\u00e9sultat net de l\'exercice (b\u00e9n\u00e9fice + ou perte -)', comptes: ['13'], special: 'signed' },
  { ref: 'CL', label: 'Subventions d\'investissement', comptes: ['14'], note: '15' },
  { ref: 'CM', label: 'Provisions r\u00e9glement\u00e9es', comptes: ['15'], note: '15' },
  { ref: 'CP', label: 'TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILEES', comptes: [], isTotal: true },
  { ref: '', label: 'DETTES FINANCIERES ET RESSOURCES ASSIMILEES', comptes: [], isSub: true },
  { ref: 'DA', label: 'Emprunts et dettes financi\u00e8res diverses', comptes: ['161', '162', '163', '164', '165', '166', '168'], note: '16' },
  { ref: 'DB', label: 'Dettes de location-acquisition', comptes: ['17'], note: '16' },
  { ref: 'DC', label: 'Provisions pour risques et charges', comptes: ['19'], note: '16' },
  { ref: 'DD', label: 'TOTAL DETTES FINANCIERES ET RESSOURCES ASSIMILEES', comptes: [], isTotal: true },
  { ref: 'DF', label: 'TOTAL RESSOURCES STABLES', comptes: [], isTotal: true },
  { ref: '', label: 'PASSIF CIRCULANT', comptes: [], isSub: true },
  { ref: 'DH', label: 'Dettes circulantes HAO', comptes: ['481', '482', '483', '484'], note: '5' },
  { ref: 'DI', label: 'Clients, avances re\u00e7ues', comptes: ['419'], note: '7' },
  { ref: 'DJ', label: 'Fournisseurs d\'exploitation', comptes: ['401', '402', '403', '404', '405', '408'], note: '17' },
  { ref: 'DK', label: 'Dettes fiscales et sociales', comptes: ['43', '44'], note: '18' },
  { ref: 'DM', label: 'Autres dettes', comptes: ['421', '422', '423', '424', '425', '426', '427', '428'], note: '19' },
  { ref: 'DN', label: 'Provisions pour risques et charges \u00e0 court terme', comptes: ['499'], note: '19' },
  { ref: 'DP', label: 'TOTAL PASSIF CIRCULANT', comptes: [], isTotal: true },
  { ref: '', label: 'TRESORERIE - PASSIF', comptes: [], isSub: true },
  { ref: 'DQ', label: 'Banques, cr\u00e9dits d\'escompte', comptes: ['565'], note: '20' },
  { ref: 'DR', label: 'Banques, \u00e9tablissements financiers et cr\u00e9dits de tr\u00e9sorerie', comptes: ['52', '561', '564'], note: '20' },
  { ref: 'DT', label: 'TOTAL TRESORERIE-PASSIF', comptes: [], isTotal: true },
  { ref: 'DV', label: 'Ecart de conversion-Passif', comptes: ['479'], note: '12' },
  { ref: 'DZ', label: 'TOTAL GENERAL', comptes: [], isTotal: true },
]

function computePassif(bal: BalanceEntry[]) {
  const values: Record<string, number> = {}

  // Compute individual line values
  for (const r of PASSIF_DETAIL) {
    if (r.isSub || r.isTotal) continue
    let montant: number
    if (r.special === 'debit') montant = Math.abs(getBalanceSolde(bal, r.comptes))
    else if (r.special === 'signed') montant = -getBalanceSolde(bal, r.comptes)
    else montant = getPassif(bal, r.comptes)
    values[r.ref] = montant
  }

  // Compute totals
  values['CP'] = (values['CA'] || 0) - (values['CB'] || 0) + (values['CD'] || 0) + (values['CE'] || 0)
    + (values['CF'] || 0) + (values['CG'] || 0) + (values['CH'] || 0) + (values['CJ'] || 0)
    + (values['CL'] || 0) + (values['CM'] || 0)
  values['DD'] = (values['DA'] || 0) + (values['DB'] || 0) + (values['DC'] || 0)
  values['DF'] = (values['CP'] || 0) + (values['DD'] || 0)
  values['DP'] = (values['DH'] || 0) + (values['DI'] || 0) + (values['DJ'] || 0)
    + (values['DK'] || 0) + (values['DM'] || 0) + (values['DN'] || 0)
  values['DT'] = (values['DQ'] || 0) + (values['DR'] || 0)
  values['DZ'] = (values['DF'] || 0) + (values['DP'] || 0) + (values['DT'] || 0) + (values['DV'] || 0)

  return PASSIF_DETAIL.map(r => {
    if (r.isSub) {
      return { ref: r.ref, montant: 0, isSub: true, isTotal: false, label: r.label, note: '' }
    }
    if (r.isTotal) {
      return { ref: r.ref, montant: values[r.ref] || 0, isSub: false, isTotal: true, label: r.label, note: '' }
    }
    return { ref: r.ref, montant: values[r.ref] || 0, isSub: false, isTotal: false, label: r.label, note: r.note || '' }
  })
}

const Passif: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const data = computePassif(balance)
  const dataN1 = balanceN1 && balanceN1.length > 0 ? computePassif(balanceN1) : null

  const columns: Column[] = [
    { key: 'ref', label: 'REF', width: 52, align: 'center' },
    { key: 'label', label: 'PASSIF', width: '45%' },
    { key: 'note', label: 'Note', width: 44, align: 'center' },
    { key: 'montant', label: 'NET', width: 130, align: 'right', subLabel: 'Exercice N' },
    { key: 'montant_n1', label: 'NET', width: 130, align: 'right', subLabel: 'Exercice N-1' },
  ]

  const rows: Row[] = data.map((r, i) => ({
    id: `${i}`,
    cells: {
      ref: r.ref,
      label: r.label,
      note: r.isSub || r.isTotal ? '' : r.note,
      montant: r.isSub ? '' : (r.montant || null),
      montant_n1: r.isSub ? '' : (dataN1 ? (dataN1[i].montant || null) : null),
    },
    isTotal: r.isTotal,
    isSectionHeader: r.isSub,
    bold: r.isSub,
  }))

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} pageNumber="9" />
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, textAlign: 'center', mb: 1, fontFamily: 'inherit' }}>
        PASSIF
      </Typography>
      <LiasseTable columns={columns} rows={rows} compact onNoteClick={onNoteClick} />
    </Box>
  )
}

export default Passif
