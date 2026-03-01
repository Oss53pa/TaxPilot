import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildNoteRows, type NoteLineDef } from '../../services/noteBalanceMapping'

const LINES: NoteLineDef[] = [
  { label: 'Capital social souscrit', prefixes: ['101'], side: 'credit_abs' },
  { label: 'Capital non appele', prefixes: ['109'] },
  { label: 'Actions propres', prefixes: ['102'], side: 'credit_abs' },
  { label: 'Apport en nature', prefixes: ['103'], side: 'credit_abs' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3] },
]

const Note10: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'nature', label: 'Categories', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right' },
  ]
  const rows = buildNoteRows(balance, LINES, 'montant_n', balanceN1)
  return (
    <NoteTemplate {...props} balance={balance} balanceN1={balanceN1} noteLabel="NOTE 10" noteTitle="NOTE 10 : CAPITAL SOCIAL" pageNumber="30" columns={columns} rows={rows} />
  )
}

export default Note10
