import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildActifDetailRows, NOTE_MAPPINGS } from '../../services/noteBalanceMapping'

const Note05: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'nature', label: 'Nature des stocks', width: '22%', align: 'left' },
    { key: 'montant_brut', label: 'Montant brut', width: '26%', align: 'right' },
    { key: 'depreciation', label: 'Depreciation', width: '26%', align: 'right' },
    { key: 'montant_net', label: 'Valeur nette', width: '26%', align: 'right' },
  ]
  const rows = buildActifDetailRows(balance, NOTE_MAPPINGS.note05, balanceN1)
  return (
    <NoteTemplate {...props} balance={balance} balanceN1={balanceN1} noteLabel="NOTE 5" noteTitle="NOTE 5 : STOCKS ET ENCOURS" pageNumber="22" columns={columns} rows={rows} />
  )
}

export default Note05
