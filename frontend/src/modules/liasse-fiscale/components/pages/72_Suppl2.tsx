import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const Suppl2: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'numero', label: 'N°', width: 40, align: 'center' },
    { key: 'nom', label: 'Nom et prenoms des associes', width: '35%', align: 'left', editable: true, type: 'text' },
    { key: 'adresse', label: 'Adresse', width: '20%', align: 'left', editable: true, type: 'text' },
    { key: 'parts', label: 'Nombre de parts', width: '15%', align: 'right', editable: true, type: 'number' },
    { key: 'quote_part', label: 'Quote-part du resultat fiscal', width: '15%', align: 'right', editable: true, type: 'number' },
  ]

  const baseRows: Row[] = Array.from({ length: 20 }, (_, i) => ({
    id: `r-${i}`,
    cells: { numero: i + 1, nom: null, adresse: null, parts: null, quote_part: null },
  }))

  const { mergedRows, setCell } = useLiasseManualData('suppl2', baseRows)

  let totalParts = 0, totalQP = 0
  for (const r of mergedRows) {
    if (typeof r.cells.parts === 'number') totalParts += r.cells.parts
    if (typeof r.cells.quote_part === 'number') totalQP += r.cells.quote_part
  }

  const allRows: Row[] = [
    ...mergedRows,
    {
      id: 'total',
      cells: { numero: '', nom: 'TOTAL', adresse: '', parts: totalParts || null, quote_part: totalQP || null },
      isTotal: true,
      bold: true,
    },
  ]

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 2"
      noteTitle="REPARTITION DU RESULTAT FISCAL DES SOCIETES DE PERSONNES"
      pageNumber="70"
      columns={columns}
      rows={allRows}
      onCellChange={setCell}
    />
  )
}

export default Suppl2
