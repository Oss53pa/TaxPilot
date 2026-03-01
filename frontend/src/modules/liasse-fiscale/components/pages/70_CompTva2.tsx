import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const CompTva2: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'designation', label: 'Elements', width: '40%', align: 'left' },
    { key: 'base_ht', label: 'Base HT', width: '20%', align: 'right' },
    { key: 'tva', label: 'TVA', width: '20%', align: 'right' },
    { key: 'ttc', label: 'TTC', width: '20%', align: 'right' },
  ]

  const rows: Row[] = Array.from({ length: 8 }, (_, i) => ({
    id: String(i + 1),
    cells: { designation: null, base_ht: null, tva: null, ttc: null },
  }))

  return (
    <NoteTemplate
      {...props}
      noteLabel="COMPLEMENTS TVA (2)"
      noteTitle="COMPLEMENTS TVA (2)"
      pageNumber="68"
      columns={columns}
      rows={rows}
    />
  )
}

export default CompTva2
