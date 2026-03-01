import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildNoteRows, NOTE17_LINES } from '../../services/noteBalanceMapping'

const Note17: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'nature', label: 'Nature', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Montant N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Montant N-1', width: '25%', align: 'right' },
  ]
  const rows = buildNoteRows(balance, NOTE17_LINES, 'montant_n', balanceN1)
  return (
    <NoteTemplate {...props} balance={balance} noteLabel="NOTE 17" noteTitle="NOTE 17 : CHIFFRE D'AFFAIRES ET AUTRES PRODUITS" pageNumber="41" columns={columns} rows={rows} />
  )
}

export default Note17
