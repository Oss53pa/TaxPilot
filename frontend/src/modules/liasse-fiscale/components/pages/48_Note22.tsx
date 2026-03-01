import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildNoteRows, NOTE22_LINES } from '../../services/noteBalanceMapping'

const Note22: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'nature', label: 'Nature', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Montant N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Montant N-1', width: '25%', align: 'right' },
  ]
  const rows = buildNoteRows(balance, NOTE22_LINES, 'montant_n', balanceN1)
  return (
    <NoteTemplate {...props} balance={balance} noteLabel="NOTE 22" noteTitle="NOTE 22 : AUTRES CHARGES" pageNumber="46" columns={columns} rows={rows} />
  )
}

export default Note22
