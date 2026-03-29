import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildNoteRows, type NoteLineDef } from '../../services/noteBalanceMapping'
import { NOTE_10 } from '@/constants/syscohada-mappings'

const LINES: NoteLineDef[] = [
  { label: 'Capital social souscrit', prefixes: [...NOTE_10.capitalSouscrit.comptes], side: 'credit_abs' },
  { label: 'Capital non appele', prefixes: [...NOTE_10.capitalNonAppele.comptes] },
  { label: 'Actions propres', prefixes: [...NOTE_10.actionsPropres.comptes], side: 'credit_abs' },
  { label: 'Apport en nature', prefixes: [...NOTE_10.apportNature.comptes], side: 'credit_abs' },
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
