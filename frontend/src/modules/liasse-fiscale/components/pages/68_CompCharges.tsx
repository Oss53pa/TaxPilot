import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const CompCharges: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'designation', label: 'Nature des charges', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Montant N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Montant N-1', width: '25%', align: 'right' },
  ]

  const rows: Row[] = Array.from({ length: 8 }, (_, i) => ({
    id: String(i + 1),
    cells: { designation: null, montant_n: null, montant_n1: null },
  }))

  return (
    <NoteTemplate
      {...props}
      noteLabel="COMPLEMENTS CHARGES"
      noteTitle="COMPLEMENTS CHARGES"
      pageNumber="66"
      columns={columns}
      rows={rows}
    />
  )
}

export default CompCharges
