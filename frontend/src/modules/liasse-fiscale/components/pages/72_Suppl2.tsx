import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const Suppl2: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'numero', label: 'N°', width: 40, align: 'center' },
    { key: 'nom', label: 'Nom et prenoms des associes', width: '35%', align: 'left' },
    { key: 'adresse', label: 'Adresse', width: '20%', align: 'left' },
    { key: 'parts', label: 'Nombre de parts', width: '15%', align: 'right' },
    { key: 'quote_part', label: 'Quote-part du resultat fiscal', width: '15%', align: 'right' },
  ]

  const rows: Row[] = Array.from({ length: 20 }, (_, i) => ({
    id: `r-${i}`,
    cells: { numero: i + 1, nom: null, adresse: null, parts: null, quote_part: null },
  }))

  rows.push({
    id: 'total',
    cells: { numero: '', nom: 'TOTAL', adresse: '', parts: null, quote_part: null },
    isTotal: true,
    bold: true,
  })

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 2"
      noteTitle="REPARTITION DU RESULTAT FISCAL DES SOCIETES DE PERSONNES"
      pageNumber="70"
      columns={columns}
      rows={rows}
    />
  )
}

export default Suppl2
