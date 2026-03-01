import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildNoteRows, NOTE15B_LINES } from '../../services/noteBalanceMapping'

const Note15B: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'nature', label: 'Nature', width: '40%', align: 'left' },
    { key: 'montant_n', label: 'Montant N', width: '30%', align: 'right' },
    { key: 'montant_n1', label: 'Montant N-1', width: '30%', align: 'right' },
  ]
  const rows = buildNoteRows(balance, NOTE15B_LINES, 'montant_n', balanceN1)
  return (
    <NoteTemplate {...props} balance={balance} balanceN1={balanceN1} noteLabel="NOTE 15B" noteTitle="NOTE 15B : FOURNISSEURS D'EXPLOITATION" pageNumber="36" columns={columns} rows={rows} />
  )
}

export default Note15B
