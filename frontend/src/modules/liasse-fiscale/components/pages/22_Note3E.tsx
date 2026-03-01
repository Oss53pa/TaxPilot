import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps, BalanceEntry } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getCharges, getProduits, getActifBrut } from '../../services/liasse-calculs'

interface LineSpec {
  id: string
  label: string
  comptes: string[]
  compute: (bal: BalanceEntry[]) => number
}

const LINES: LineSpec[] = [
  { id: 'redevances', label: 'Redevances de credit-bail', comptes: ['622'], compute: (bal) => getCharges(bal, ['622']) },
  { id: 'immo_credit_bail', label: 'Immobilisations acquises en credit-bail', comptes: ['17'], compute: (bal) => getProduits(bal, ['17']) },
  { id: 'immo_concession', label: 'Immobilisations mises en concession', comptes: [], compute: () => 0 },
  { id: 'immo_reevaluees', label: 'Immobilisations reevaluees', comptes: [], compute: () => 0 },
  { id: 'immo_en_cours', label: 'Immobilisations en cours', comptes: ['23'], compute: (bal) => getActifBrut(bal, ['23']) },
  { id: 'avances_acomptes', label: 'Avances et acomptes verses sur immobilisations', comptes: ['251', '252'], compute: (bal) => getActifBrut(bal, ['251', '252']) },
  { id: 'immo_amorties', label: 'Immobilisations totalement amorties', comptes: [], compute: () => 0 },
  { id: 'charges_hao', label: 'Charges immobilisees (HAO)', comptes: ['201', '202'], compute: (bal) => getActifBrut(bal, ['201', '202']) },
]

const Note3E: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const balN1 = balanceN1 && balanceN1.length > 0 ? balanceN1 : null

  const columns: Column[] = [
    { key: 'rubriques', label: 'Rubriques', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Montant N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Montant N-1', width: '25%', align: 'right' },
  ]

  const rows: Row[] = LINES.map(spec => {
    const valN = spec.comptes.length > 0 ? spec.compute(balance) : 0
    const valN1 = spec.comptes.length > 0 && balN1 ? spec.compute(balN1) : 0
    return {
      id: spec.id,
      cells: {
        rubriques: spec.label,
        montant_n: valN || null,
        montant_n1: valN1 || null,
      },
    }
  })

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      noteLabel="NOTE 3E"
      noteTitle="NOTE 3E : INFORMATIONS COMPLEMENTAIRES IMMOBILISATIONS"
      pageNumber="20"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note3E
