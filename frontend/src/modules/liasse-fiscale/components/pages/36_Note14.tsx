import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildNoteRows, type NoteLineDef } from '../../services/noteBalanceMapping'
import { NOTE_14 } from '@/constants/syscohada-mappings'

const LINES: NoteLineDef[] = [
  { label: 'Emprunts obligataires', prefixes: [...NOTE_14.empruntsObligataires.comptes], side: 'credit_abs' },
  { label: 'Emprunts aupres des etablissements de credit', prefixes: [...NOTE_14.empruntsEtabCredit.comptes], side: 'credit_abs' },
  { label: 'Dettes de credit-bail', prefixes: [...NOTE_14.dettesCreditBail.comptes], side: 'credit_abs' },
  { label: 'Dettes financieres diverses', prefixes: [...NOTE_14.dettesFinDiverses.comptes], side: 'credit_abs' },
  { label: 'Avances recues de l\'Etat', prefixes: [...NOTE_14.avancesEtat.comptes], side: 'credit_abs' },
  { label: 'Autres dettes financieres', prefixes: [...NOTE_14.autresDettesFinancieres.comptes], side: 'credit_abs' },
  { label: 'Provisions pour risques et charges', prefixes: [...NOTE_14.provisionsRisquesCharges.comptes], side: 'credit_abs' },
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
