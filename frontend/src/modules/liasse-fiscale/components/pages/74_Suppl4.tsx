import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const Suppl4: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'numero', label: 'N°', width: 35, align: 'center' },
    { key: 'nature', label: 'Nature de l\'immobilisation', width: '22%', align: 'left', editable: true, type: 'text' },
    { key: 'date_acq', label: 'Date acq.', width: 80, align: 'center', editable: true, type: 'text' },
    { key: 'valeur_origine', label: 'Valeur d\'origine', width: '12%', align: 'right', editable: true, type: 'number' },
    { key: 'taux', label: 'Taux %', width: 55, align: 'right', editable: true, type: 'number' },
    { key: 'duree', label: 'Duree', width: 50, align: 'center', editable: true, type: 'text' },
    { key: 'amort_ant', label: 'Amort. anterieurs', width: '12%', align: 'right', editable: true, type: 'number' },
    { key: 'dotation', label: 'Dotation exercice', width: '12%', align: 'right', editable: true, type: 'number' },
    { key: 'amort_cum', label: 'Amort. cumule', width: '12%', align: 'right', editable: true, type: 'number' },
    { key: 'vnc', label: 'VNC', width: '10%', align: 'right', editable: true, type: 'number' },
  ]

  const baseRows: Row[] = Array.from({ length: 30 }, (_, i) => ({
    id: `r-${i}`,
    cells: {
      numero: i + 1,
      nature: null,
      date_acq: null,
      valeur_origine: null,
      taux: null,
      duree: null,
      amort_ant: null,
      dotation: null,
      amort_cum: null,
      vnc: null,
    },
  }))

  const { mergedRows, setCell } = useLiasseManualData('suppl4', baseRows)

  // Calculate totals
  let totVO = 0, totAA = 0, totDot = 0, totAC = 0, totVNC = 0
  for (const r of mergedRows) {
    if (typeof r.cells.valeur_origine === 'number') totVO += r.cells.valeur_origine
    if (typeof r.cells.amort_ant === 'number') totAA += r.cells.amort_ant
    if (typeof r.cells.dotation === 'number') totDot += r.cells.dotation
    if (typeof r.cells.amort_cum === 'number') totAC += r.cells.amort_cum
    if (typeof r.cells.vnc === 'number') totVNC += r.cells.vnc
  }

  const allRows: Row[] = [
    ...mergedRows,
    {
      id: 'total',
      cells: {
        numero: '',
        nature: 'TOTAL',
        date_acq: '',
        valeur_origine: totVO || null,
        taux: '',
        duree: '',
        amort_ant: totAA || null,
        dotation: totDot || null,
        amort_cum: totAC || null,
        vnc: totVNC || null,
      },
      isTotal: true,
      bold: true,
    },
  ]

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 4"
      noteTitle="TABLEAU DES AMORTISSEMENTS ET INVENTAIRE DES IMMOBILISATIONS"
      pageNumber="72"
      columns={columns}
      rows={allRows}
      onCellChange={setCell}
    />
  )
}

export default Suppl4
