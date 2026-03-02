import React from 'react'
import NoteTemplate from '../NoteTemplate'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const Suppl3: React.FC<PageProps> = (props) => {
  // Section 1 : Patrimoine prive affecte a l'exploitation
  const cols1: Column[] = [
    { key: 'designation', label: 'Nature des biens', width: '50%', align: 'left' },
    { key: 'valeur', label: 'Valeur d\'origine', width: '25%', align: 'right', editable: true, type: 'number' },
    { key: 'observations', label: 'Observations', width: '25%', align: 'left', editable: true, type: 'text' },
  ]

  const patrimLabels = [
    'Terrains',
    'Batiments',
    'Materiel et outillage',
    'Materiel de transport',
    'Materiel de bureau et informatique',
    'Autres immobilisations',
  ]

  const baseRows1: Row[] = patrimLabels.map((label, i) => ({
    id: `p-${i}`,
    cells: { designation: label, valeur: null, observations: null },
  }))

  // Section 2 : Recettes encaissees
  const cols2: Column[] = [
    { key: 'designation', label: 'Nature des recettes', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right', editable: true, type: 'number' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right', editable: true, type: 'number' },
  ]

  const recettesLabels = [
    'Recettes provenant de l\'activite professionnelle',
    'Recettes accessoires',
    'Subventions recues',
    'Gains divers',
  ]

  const baseRows2: Row[] = recettesLabels.map((label, i) => ({
    id: `r-${i}`,
    cells: { designation: label, montant_n: null, montant_n1: null },
  }))

  // Section 3 : CA declare
  const cols3: Column[] = [
    { key: 'designation', label: 'Elements', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right', editable: true, type: 'number' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right', editable: true, type: 'number' },
  ]

  const caLabels = [
    'Chiffre d\'affaires declare a la TVA',
    'Chiffre d\'affaires declare au BIC/BNC',
    'Chiffre d\'affaires declare a la patente',
  ]

  const baseRows3: Row[] = caLabels.map((label, i) => ({
    id: `c-${i}`,
    cells: { designation: label, montant_n: null, montant_n1: null },
  }))

  const { mergedRows, setCell } = useLiasseManualData('suppl3', [...baseRows1, ...baseRows2, ...baseRows3])

  const merged1 = mergedRows.filter(r => r.id.startsWith('p-'))
  const merged2 = mergedRows.filter(r => r.id.startsWith('r-'))
  const merged3 = mergedRows.filter(r => r.id.startsWith('c-'))

  // Totals for section 1
  let totalVal = 0
  for (const r of merged1) {
    if (typeof r.cells.valeur === 'number') totalVal += r.cells.valeur
  }
  const rows1: Row[] = [
    ...merged1,
    { id: 'p-total', cells: { designation: 'TOTAL PATRIMOINE PRIVE AFFECTE', valeur: totalVal || null, observations: '' }, isTotal: true, bold: true },
  ]

  // Totals for section 2
  let totRecN = 0, totRecN1 = 0
  for (const r of merged2) {
    if (typeof r.cells.montant_n === 'number') totRecN += r.cells.montant_n
    if (typeof r.cells.montant_n1 === 'number') totRecN1 += r.cells.montant_n1
  }
  const rows2: Row[] = [
    ...merged2,
    { id: 'r-total', cells: { designation: 'TOTAL RECETTES', montant_n: totRecN || null, montant_n1: totRecN1 || null }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 3"
      noteTitle="COMPLEMENT D'INFORMATIONS — ENTITES INDIVIDUELLES"
      pageNumber="71"
      commentSection={false}
    >
      <LiasseTable columns={cols1} rows={rows1} title="I. Patrimoine prive affecte a l'exploitation" compact onCellChange={setCell} />
      <LiasseTable columns={cols2} rows={rows2} title="II. Recettes encaissees" compact onCellChange={setCell} />
      <LiasseTable columns={cols3} rows={merged3} title="III. Chiffre d'affaires declare" compact onCellChange={setCell} />
    </NoteTemplate>
  )
}

export default Suppl3
