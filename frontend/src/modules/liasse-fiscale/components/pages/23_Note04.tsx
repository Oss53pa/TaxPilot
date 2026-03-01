import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildActifDetailRows, NOTE_MAPPINGS } from '../../services/noteBalanceMapping'

const Note04: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'nature', label: 'Nature', width: '34%', align: 'left' },
    { key: 'montant_brut', label: 'Montant brut', width: '22%', align: 'right' },
    { key: 'depreciation', label: 'Depreciation', width: '22%', align: 'right' },
    { key: 'montant_net', label: 'Montant net', width: '22%', align: 'right' },
  ]
  const rows = buildActifDetailRows(balance, NOTE_MAPPINGS.note04, balanceN1)
  return (
    <NoteTemplate {...props} balance={balance} balanceN1={balanceN1} noteLabel="NOTE 4" noteTitle="NOTE 4 : ACTIF CIRCULANT HAO" pageNumber="21" columns={columns} rows={rows} />
  )
}

export default Note04
