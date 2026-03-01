import React from 'react'
import NoteTemplate from '../NoteTemplate'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const Suppl7: React.FC<PageProps> = (props) => {
  // Section 1 : Creances echues
  const colsCreances: Column[] = [
    { key: 'designation', label: 'Nature des creances echues', width: '50%', align: 'left' },
    { key: 'principal', label: 'Principal', width: '25%', align: 'right' },
    { key: 'interets', label: 'Interets', width: '25%', align: 'right' },
  ]

  const creancesLabels = [
    'Clients',
    'Personnel',
    'Etat et collectivites publiques',
    'Organismes sociaux',
    'Associes et groupe',
    'Debiteurs divers',
    'Prets et creances non commerciales',
  ]

  const rowsCreances: Row[] = creancesLabels.map((label, i) => ({
    id: `cr-${i}`,
    cells: { designation: label, principal: null, interets: null },
  }))
  // Lignes vides
  for (let i = creancesLabels.length; i < 10; i++) {
    rowsCreances.push({
      id: `cr-${i}`,
      cells: { designation: null, principal: null, interets: null },
    })
  }
  rowsCreances.push({
    id: 'cr-total',
    cells: { designation: 'TOTAL CREANCES ECHUES', principal: null, interets: null },
    isTotal: true,
    bold: true,
  })

  // Section 2 : Dettes echues
  const colsDettes: Column[] = [
    { key: 'designation', label: 'Nature des dettes echues', width: '50%', align: 'left' },
    { key: 'principal', label: 'Principal', width: '25%', align: 'right' },
    { key: 'interets', label: 'Interets', width: '25%', align: 'right' },
  ]

  const dettesLabels = [
    'Fournisseurs',
    'Personnel',
    'Etat et collectivites publiques',
    'Organismes sociaux',
    'Associes et groupe',
    'Crediteurs divers',
    'Emprunts et dettes financieres',
  ]

  const rowsDettes: Row[] = dettesLabels.map((label, i) => ({
    id: `dt-${i}`,
    cells: { designation: label, principal: null, interets: null },
  }))
  // Lignes vides
  for (let i = dettesLabels.length; i < 10; i++) {
    rowsDettes.push({
      id: `dt-${i}`,
      cells: { designation: null, principal: null, interets: null },
    })
  }
  rowsDettes.push({
    id: 'dt-total',
    cells: { designation: 'TOTAL DETTES ECHUES', principal: null, interets: null },
    isTotal: true,
    bold: true,
  })

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 7"
      noteTitle="CREANCES ET DETTES ECHUES DE L'EXERCICE"
      pageNumber="75"
      commentSection={false}
    >
      <LiasseTable columns={colsCreances} rows={rowsCreances} title="I. Creances echues non recouvrees" compact />
      <LiasseTable columns={colsDettes} rows={rowsDettes} title="II. Dettes echues non payees" compact />
    </NoteTemplate>
  )
}

export default Suppl7
