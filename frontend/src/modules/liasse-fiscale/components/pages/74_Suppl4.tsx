import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const Suppl4: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'numero', label: 'N°', width: 35, align: 'center' },
    { key: 'nature', label: 'Nature de l\'immobilisation', width: '22%', align: 'left' },
    { key: 'date_acq', label: 'Date acq.', width: 80, align: 'center' },
    { key: 'valeur_origine', label: 'Valeur d\'origine', width: '12%', align: 'right' },
    { key: 'taux', label: 'Taux %', width: 55, align: 'right' },
    { key: 'duree', label: 'Duree', width: 50, align: 'center' },
    { key: 'amort_ant', label: 'Amort. anterieurs', width: '12%', align: 'right' },
    { key: 'dotation', label: 'Dotation exercice', width: '12%', align: 'right' },
    { key: 'amort_cum', label: 'Amort. cumule', width: '12%', align: 'right' },
    { key: 'vnc', label: 'VNC', width: '10%', align: 'right' },
  ]

  const rows: Row[] = Array.from({ length: 30 }, (_, i) => ({
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

  rows.push({
    id: 'total',
    cells: {
      numero: '',
      nature: 'TOTAL',
      date_acq: '',
      valeur_origine: null,
      taux: '',
      duree: '',
      amort_ant: null,
      dotation: null,
      amort_cum: null,
      vnc: null,
    },
    isTotal: true,
    bold: true,
  })

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 4"
      noteTitle="TABLEAU DES AMORTISSEMENTS ET INVENTAIRE DES IMMOBILISATIONS"
      pageNumber="72"
      columns={columns}
      rows={rows}
    />
  )
}

export default Suppl4
