import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const Suppl6: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'designation', label: 'Nature des avantages', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right', editable: true, type: 'number' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right', editable: true, type: 'number' },
  ]

  const labels = [
    'Logement',
    'Domesticite',
    'Vehicule de fonction',
    'Nourriture',
    'Habillement',
    'Eau, electricite, telephone',
    'Primes d\'assurances',
    'Frais medicaux',
    'Frais de scolarite',
    'Allocations et indemnites diverses',
    'Conges payes',
    'Voyages de conges',
    'Primes de bilan',
    'Gratifications',
    'Avantages en especes divers',
    'Autres avantages en nature',
  ]

  const baseRows: Row[] = labels.map((label, i) => ({
    id: `r-${i}`,
    cells: { designation: label, montant_n: null, montant_n1: null },
  }))

  for (let i = labels.length; i < 24; i++) {
    baseRows.push({
      id: `r-${i}`,
      cells: { designation: null, montant_n: null, montant_n1: null },
    })
  }

  const { mergedRows, setCell } = useLiasseManualData('suppl6', baseRows)

  let totalN = 0, totalN1 = 0
  for (const row of mergedRows) {
    if (typeof row.cells.montant_n === 'number') totalN += row.cells.montant_n
    if (typeof row.cells.montant_n1 === 'number') totalN1 += row.cells.montant_n1
  }

  const allRows: Row[] = [
    ...mergedRows,
    {
      id: 'total',
      cells: { designation: 'TOTAL AVANTAGES EN NATURE ET EN ESPECES', montant_n: totalN || null, montant_n1: totalN1 || null },
      isTotal: true,
      bold: true,
    },
  ]

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 6"
      noteTitle="DETAIL DES AVANTAGES EN NATURE ET EN ESPECES ACCORDES AU PERSONNEL"
      pageNumber="74"
      columns={columns}
      rows={allRows}
      onCellChange={setCell}
    />
  )
}

export default Suppl6
