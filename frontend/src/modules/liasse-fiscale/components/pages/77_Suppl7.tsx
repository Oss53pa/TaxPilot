import React from 'react'
import NoteTemplate from '../NoteTemplate'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const Suppl7: React.FC<PageProps> = (props) => {
  // Section 1 : Creances echues
  const colsCreances: Column[] = [
    { key: 'designation', label: 'Nature des creances echues', width: '50%', align: 'left' },
    { key: 'principal', label: 'Principal', width: '25%', align: 'right', editable: true, type: 'number' },
    { key: 'interets', label: 'Interets', width: '25%', align: 'right', editable: true, type: 'number' },
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

  const baseCreances: Row[] = creancesLabels.map((label, i) => ({
    id: `cr-${i}`,
    cells: { designation: label, principal: null, interets: null },
  }))
  for (let i = creancesLabels.length; i < 10; i++) {
    baseCreances.push({
      id: `cr-${i}`,
      cells: { designation: null, principal: null, interets: null },
    })
  }

  // Section 2 : Dettes echues
  const colsDettes: Column[] = [
    { key: 'designation', label: 'Nature des dettes echues', width: '50%', align: 'left' },
    { key: 'principal', label: 'Principal', width: '25%', align: 'right', editable: true, type: 'number' },
    { key: 'interets', label: 'Interets', width: '25%', align: 'right', editable: true, type: 'number' },
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

  const baseDettes: Row[] = dettesLabels.map((label, i) => ({
    id: `dt-${i}`,
    cells: { designation: label, principal: null, interets: null },
  }))
  for (let i = dettesLabels.length; i < 10; i++) {
    baseDettes.push({
      id: `dt-${i}`,
      cells: { designation: null, principal: null, interets: null },
    })
  }

  const { mergedRows: mergedCreances, setCell } = useLiasseManualData('suppl7', [...baseCreances, ...baseDettes])

  // Split merged rows back
  const crRows = mergedCreances.filter(r => r.id.startsWith('cr-'))
  const dtRows = mergedCreances.filter(r => r.id.startsWith('dt-'))

  // Calculate totals
  let crTotalP = 0, crTotalI = 0
  for (const r of crRows) {
    if (typeof r.cells.principal === 'number') crTotalP += r.cells.principal
    if (typeof r.cells.interets === 'number') crTotalI += r.cells.interets
  }
  let dtTotalP = 0, dtTotalI = 0
  for (const r of dtRows) {
    if (typeof r.cells.principal === 'number') dtTotalP += r.cells.principal
    if (typeof r.cells.interets === 'number') dtTotalI += r.cells.interets
  }

  const creancesRows: Row[] = [
    ...crRows,
    { id: 'cr-total', cells: { designation: 'TOTAL CREANCES ECHUES', principal: crTotalP || null, interets: crTotalI || null }, isTotal: true, bold: true },
  ]

  const dettesRows: Row[] = [
    ...dtRows,
    { id: 'dt-total', cells: { designation: 'TOTAL DETTES ECHUES', principal: dtTotalP || null, interets: dtTotalI || null }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 7"
      noteTitle="CREANCES ET DETTES ECHUES DE L'EXERCICE"
      pageNumber="75"
      commentSection={false}
    >
      <LiasseTable columns={colsCreances} rows={creancesRows} title="I. Creances echues non recouvrees" compact onCellChange={setCell} />
      <LiasseTable columns={colsDettes} rows={dettesRows} title="II. Dettes echues non payees" compact onCellChange={setCell} />
    </NoteTemplate>
  )
}

export default Suppl7
