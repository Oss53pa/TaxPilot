import React, { useMemo } from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildNoteRows, COMP_TVA2_LINES } from '../../services/noteBalanceMapping'

const CompTva2: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'designation', label: 'Elements', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right' },
  ]

  const rows = useMemo(
    () => buildNoteRows(props.balance, COMP_TVA2_LINES, 'montant_n', props.balanceN1),
    [props.balance, props.balanceN1],
  )

  return (
    <NoteTemplate
      {...props}
      noteLabel="COMP-TVA (2)"
      noteTitle="ETAT COMPLEMENTAIRE — TVA SUPPORTEE NON DEDUCTIBLE"
      pageNumber="68"
      columns={columns}
      rows={rows}
    />
  )
}

export default CompTva2
