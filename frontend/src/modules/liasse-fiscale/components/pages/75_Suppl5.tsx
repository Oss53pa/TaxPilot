import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const Suppl5: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'designation', label: 'Nature des frais accessoires', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right' },
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

  const rows: Row[] = labels.map((label, i) => ({
    id: `r-${i}`,
    cells: { designation: label, montant_n: null, montant_n1: null },
  }))

  // Lignes vides supplementaires
  for (let i = labels.length; i < 20; i++) {
    rows.push({
      id: `r-${i}`,
      cells: { designation: null, montant_n: null, montant_n1: null },
    })
  }

  rows.push({
    id: 'total',
    cells: { designation: 'TOTAL', montant_n: null, montant_n1: null },
    isTotal: true,
    bold: true,
  })

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 5"
      noteTitle="DETAIL DES FRAIS ACCESSOIRES SUR ACHATS"
      pageNumber="73"
      columns={columns}
      rows={rows}
    />
  )
}

export default Suppl5
