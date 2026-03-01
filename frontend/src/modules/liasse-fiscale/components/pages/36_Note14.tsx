import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildNoteRows, type NoteLineDef } from '../../services/noteBalanceMapping'

const LINES: NoteLineDef[] = [
  { label: 'Emprunts obligataires', prefixes: ['161'], side: 'credit_abs' },
  { label: 'Emprunts aupres des etablissements de credit', prefixes: ['162', '163', '164'], side: 'credit_abs' },
  { label: 'Dettes de credit-bail', prefixes: ['17'], side: 'credit_abs' },
  { label: 'Dettes financieres diverses', prefixes: ['165', '166', '168'], side: 'credit_abs' },
  { label: 'Avances recues de l\'Etat', prefixes: ['181'], side: 'credit_abs' },
  { label: 'Autres dettes financieres', prefixes: ['182', '183', '184', '185', '186'], side: 'credit_abs' },
  { label: 'Provisions pour risques et charges', prefixes: ['19'], side: 'credit_abs' },
  { label: 'TOTAL', prefixes: [], isTotal: true, totalOf: [0, 1, 2, 3, 4, 5, 6] },
]

const Note14: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'nature', label: 'Nature', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Montant', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '25%', align: 'right' },
  ]
  const rows = buildNoteRows(balance, LINES, 'montant_n', balanceN1)
  return (
    <NoteTemplate {...props} balance={balance} balanceN1={balanceN1} noteLabel="NOTE 14" noteTitle="NOTE 14 : DETTES FINANCIERES ET RESSOURCES ASSIMILEES" pageNumber="34" columns={columns} rows={rows} />
  )
}

export default Note14
