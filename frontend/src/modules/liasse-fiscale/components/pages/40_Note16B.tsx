import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildDetailRows } from '../../services/noteBalanceMapping'

const Note16B: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'nature', label: 'Nature', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right' },
  ]
  const rows = buildDetailRows(balance, ['421', '422', '423', '424', '425', '426', '427', '428', '499'], 'montant_n', balanceN1)
  return (
    <NoteTemplate {...props} balance={balance} balanceN1={balanceN1} noteLabel="NOTE 16B" noteTitle="NOTE 16B : AUTRES DETTES ET PROVISIONS POUR RISQUES" pageNumber="38" columns={columns} rows={rows} />
  )
}

export default Note16B
