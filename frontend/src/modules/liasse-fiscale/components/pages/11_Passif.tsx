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
  { ref: 'CA', label: 'Capital', comptes: ['101', '102', '103'], note: '10' },
  { ref: 'CB', label: 'Actionnaires capital souscrit non appele (-)', comptes: ['109'], note: '10', special: 'debit' },
  { ref: 'CC', label: 'Primes liees au capital social', comptes: ['104', '105'], note: '11' },
  { ref: 'CD', label: 'Ecarts de reevaluation', comptes: ['106'], note: '3E' },
  { ref: 'CE', label: 'Reserves indisponibles', comptes: ['111', '112'], note: '11' },
  { ref: 'CF', label: 'Reserves libres', comptes: ['113', '118'], note: '11' },
  { ref: 'CG', label: 'Report a nouveau (+ ou -)', comptes: ['12'], note: '11', special: 'signed' },
  { ref: 'CH', label: 'Resultat net de l\'exercice (benefice + ou perte -)', comptes: ['13'], special: 'signed' },
  { ref: 'CI', label: 'Subventions d\'investissement', comptes: ['14'], note: '12' },
  { ref: 'CJ', label: 'Provisions reglementees', comptes: ['15'], note: '13' },
  { ref: 'CP', label: 'TOTAL CAPITAUX PROPRES (I)', comptes: [], isTotal: true },
  { ref: '', label: 'DETTES FINANCIERES ET RESSOURCES ASSIMILEES', comptes: [], isSub: true },
  { ref: 'DA', label: 'Emprunts obligataires', comptes: ['161'], note: '14' },
  { ref: 'DB', label: 'Emprunts et dettes de credit-bail', comptes: ['162', '163', '164'], note: '14' },
  { ref: 'DC', label: 'Dettes financieres diverses', comptes: ['165', '166', '168'], note: '14' },
  { ref: 'DD', label: 'Dettes de credit-bail immobilier', comptes: ['17'], note: '14' },
  { ref: 'DE', label: 'Dettes financieres diverses', comptes: ['181', '182', '183', '184', '185', '186'], note: '14' },
  { ref: 'DF', label: 'Provisions financieres pour risques et charges', comptes: ['19'], note: '14' },
  { ref: 'DG', label: 'TOTAL DETTES FINANCIERES (II)', comptes: [], isTotal: true },
  { ref: '', label: 'PASSIF CIRCULANT', comptes: [], isSub: true },
  { ref: 'DH', label: 'Dettes circulantes HAO et ressources assimilees', comptes: ['481', '482', '483', '484'], note: '15A' },
  { ref: 'DI', label: 'Clients, avances recues', comptes: ['419'], note: '15A' },
  { ref: 'DJ', label: 'Fournisseurs d\'exploitation', comptes: ['401', '402', '403', '404', '405', '408'], note: '15B' },
  { ref: 'DK', label: 'Dettes fiscales et sociales', comptes: ['43', '44'], note: '16A' },
  { ref: 'DL', label: 'Autres dettes', comptes: ['421', '422', '423', '424', '425', '426', '427', '428'], note: '16B' },
  { ref: 'DM', label: 'Risques provisionnees', comptes: ['499'], note: '16B' },
  { ref: 'DN', label: 'TOTAL PASSIF CIRCULANT (III)', comptes: [], isTotal: true },
  { ref: '', label: 'TRESORERIE - PASSIF', comptes: [], isSub: true },
  { ref: 'DQ', label: 'Banques, credits de tresorerie', comptes: ['52', '561', '564'], note: '14' },
  { ref: 'DR', label: 'Banques, credits d\'escompte', comptes: ['565'], note: '14' },
  { ref: 'DS', label: 'TOTAL TRESORERIE - PASSIF (IV)', comptes: [], isTotal: true },
  { ref: 'DT', label: 'Ecart de conversion - Passif (V)', comptes: ['479'], note: '8B' },
  { ref: 'DZ', label: 'TOTAL GENERAL (I + II + III + IV + V)', comptes: [], isTotal: true },
]

function computePassif(bal: BalanceEntry[]) {
  let totalCP = 0, totalDF = 0, totalPC = 0, totalTP = 0, ecartConv = 0
  let section = 'cp'

  return PASSIF_DETAIL.map(r => {
    if (r.isSub) {
      if (r.label.includes('CAPITAUX')) section = 'cp'
      else if (r.label.includes('DETTES FIN')) section = 'df'
      else if (r.label.includes('PASSIF CIRC')) section = 'pc'
      else if (r.label.includes('TRESORERIE')) section = 'tp'
      return { ref: r.ref, montant: 0, isSub: true, isTotal: false, label: r.label, note: '' }
    }
    if (r.isTotal) {
      if (r.ref === 'CP') return { ref: r.ref, montant: totalCP, isSub: false, isTotal: true, label: r.label, note: '' }
      if (r.ref === 'DG') return { ref: r.ref, montant: totalDF, isSub: false, isTotal: true, label: r.label, note: '' }
      if (r.ref === 'DN') return { ref: r.ref, montant: totalPC, isSub: false, isTotal: true, label: r.label, note: '' }
      if (r.ref === 'DS') return { ref: r.ref, montant: totalTP, isSub: false, isTotal: true, label: r.label, note: '' }
      if (r.ref === 'DZ') return { ref: r.ref, montant: totalCP + totalDF + totalPC + totalTP + ecartConv, isSub: false, isTotal: true, label: r.label, note: '' }
      return { ref: r.ref, montant: 0, isSub: false, isTotal: true, label: r.label, note: '' }
    }
    let montant: number
    if (r.special === 'debit') montant = Math.abs(getBalanceSolde(bal, r.comptes))
    else if (r.special === 'signed') montant = -getBalanceSolde(bal, r.comptes)
    else montant = getPassif(bal, r.comptes)

    if (r.ref === 'DT') { ecartConv = montant }
    else if (section === 'cp') totalCP += (r.ref === 'CB' ? -montant : montant)
    else if (section === 'df') totalDF += montant
    else if (section === 'pc') totalPC += montant
    else if (section === 'tp') totalTP += montant
    return { ref: r.ref, montant, isSub: false, isTotal: false, label: r.label, note: r.note || '' }
  })
}

const Passif: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick }) => {
  const data = computePassif(balance)
  const dataN1 = balanceN1 && balanceN1.length > 0 ? computePassif(balanceN1) : null

  const columns: Column[] = [
    { key: 'ref', label: 'REF', width: 28, align: 'center' },
    { key: 'label', label: 'PASSIF', width: '50%' },
    { key: 'note', label: 'Note', width: 30, align: 'center' },
    { key: 'montant', label: 'MONTANT', align: 'right', subLabel: 'Exercice N' },
    { key: 'montant_n1', label: 'MONTANT', align: 'right', subLabel: 'Exercice N-1' },
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
