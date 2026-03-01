import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildNoteRows, NOTE18_LINES } from '../../services/noteBalanceMapping'

const Note18: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'nature', label: 'Nature', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Montant N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Montant N-1', width: '25%', align: 'right' },
  ]
  const rows = buildNoteRows(balance, NOTE18_LINES, 'montant_n', balanceN1)
  return (
    <NoteTemplate {...props} balance={balance} noteLabel="NOTE 18" noteTitle="NOTE 18 : AUTRES ACHATS" pageNumber="42" columns={columns} rows={rows} />
  )
}

export default Note18
