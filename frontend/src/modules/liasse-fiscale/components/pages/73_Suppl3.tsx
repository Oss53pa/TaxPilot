import React from 'react'
import NoteTemplate from '../NoteTemplate'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const Suppl3: React.FC<PageProps> = (props) => {
  // Section 1 : Patrimoine prive affecte a l'exploitation
  const cols1: Column[] = [
    { key: 'designation', label: 'Nature des biens', width: '50%', align: 'left' },
    { key: 'valeur', label: 'Valeur d\'origine', width: '25%', align: 'right' },
    { key: 'observations', label: 'Observations', width: '25%', align: 'left' },
  ]

  const patrimLabels = [
    'Terrains',
    'Batiments',
    'Materiel et outillage',
    'Materiel de transport',
    'Materiel de bureau et informatique',
    'Autres immobilisations',
  ]

  const rows1: Row[] = patrimLabels.map((label, i) => ({
    id: `p-${i}`,
    cells: { designation: label, valeur: null, observations: null },
  }))
  rows1.push({
    id: 'p-total',
    cells: { designation: 'TOTAL PATRIMOINE PRIVE AFFECTE', valeur: null, observations: '' },
    isTotal: true,
    bold: true,
  })

  // Section 2 : Recettes encaissees
  const cols2: Column[] = [
    { key: 'designation', label: 'Nature des recettes', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right' },
  ]

  const recettesLabels = [
    'Recettes provenant de l\'activite professionnelle',
    'Recettes accessoires',
    'Subventions recues',
    'Gains divers',
  ]

  const rows2: Row[] = recettesLabels.map((label, i) => ({
    id: `r-${i}`,
    cells: { designation: label, montant_n: null, montant_n1: null },
  }))
  rows2.push({
    id: 'r-total',
    cells: { designation: 'TOTAL RECETTES', montant_n: null, montant_n1: null },
    isTotal: true,
    bold: true,
  })

  // Section 3 : CA declare
  const cols3: Column[] = [
    { key: 'designation', label: 'Elements', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right' },
  ]

  const caLabels = [
    'Chiffre d\'affaires declare a la TVA',
    'Chiffre d\'affaires declare au BIC/BNC',
    'Chiffre d\'affaires declare a la patente',
  ]

  const rows3: Row[] = caLabels.map((label, i) => ({
    id: `c-${i}`,
    cells: { designation: label, montant_n: null, montant_n1: null },
  }))

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 3"
      noteTitle="COMPLEMENT D'INFORMATIONS — ENTITES INDIVIDUELLES"
      pageNumber="71"
      commentSection={false}
    >
      <LiasseTable columns={cols1} rows={rows1} title="I. Patrimoine prive affecte a l'exploitation" compact />
      <LiasseTable columns={cols2} rows={rows2} title="II. Recettes encaissees" compact />
      <LiasseTable columns={cols3} rows={rows3} title="III. Chiffre d'affaires declare" compact />
    </NoteTemplate>
  )
}

export default Suppl3
