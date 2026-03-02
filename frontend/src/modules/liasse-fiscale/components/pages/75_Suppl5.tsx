import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const Suppl5: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'designation', label: 'Nature des frais accessoires', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right', editable: true, type: 'number' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right', editable: true, type: 'number' },
  ]

  const labels = [
    'Transport sur achats de marchandises',
    'Transport sur achats de matieres premieres',
    'Transport sur autres achats',
    'Assurances transport',
    'Commissions et courtages sur achats',
    'Droits de douane a l\'importation',
    'Frais de transit',
    'Frais de manutention et de magasinage',
    'Frais d\'assurance des stocks',
    'Frais de surveillance et gardiennage stocks',
    'Autres frais accessoires sur achats',
  ]

  const baseRows: Row[] = labels.map((label, i) => ({
    id: `r-${i}`,
    cells: { designation: label, montant_n: null, montant_n1: null },
  }))

  // Lignes vides supplementaires
  for (let i = labels.length; i < 20; i++) {
    baseRows.push({
      id: `r-${i}`,
      cells: { designation: null, montant_n: null, montant_n1: null },
    })
  }

  const { mergedRows, setCell } = useLiasseManualData('suppl5', baseRows)

  // Calculate totals from merged data
  let totalN = 0, totalN1 = 0
  for (const row of mergedRows) {
    if (typeof row.cells.montant_n === 'number') totalN += row.cells.montant_n
    if (typeof row.cells.montant_n1 === 'number') totalN1 += row.cells.montant_n1
  }

  const allRows: Row[] = [
    ...mergedRows,
    {
      id: 'total',
      cells: { designation: 'TOTAL', montant_n: totalN || null, montant_n1: totalN1 || null },
      isTotal: true,
      bold: true,
    },
  ]

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 5"
      noteTitle="DETAIL DES FRAIS ACCESSOIRES SUR ACHATS"
      pageNumber="73"
      columns={columns}
      rows={allRows}
      onCellChange={setCell}
    />
  )
}

export default Suppl5
