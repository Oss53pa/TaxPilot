import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getActifBrut } from '../../services/liasse-calculs'

const Note8C: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const balN1 = balanceN1 && balanceN1.length > 0 ? balanceN1 : null

  const totalN = getActifBrut(balance, ['476'])
  const totalN1 = balN1 ? getActifBrut(balN1, ['476']) : 0

  const columns: Column[] = [
    { key: 'nature', label: 'Nature', width: '50%', align: 'left' },
    { key: 'montant_n', label: 'Montant N', width: '25%', align: 'right' },
    { key: 'montant_n1', label: 'Montant N-1', width: '25%', align: 'right' },
  ]

  const rows: Row[] = [
    { id: 'cca', cells: { nature: 'Charges constatees d\'avance', montant_n: totalN || null, montant_n1: totalN1 || null } },
    { id: 'r2', cells: { nature: '', montant_n: null, montant_n1: null } },
    { id: 'r3', cells: { nature: '', montant_n: null, montant_n1: null } },
    { id: 'r4', cells: { nature: '', montant_n: null, montant_n1: null } },
    { id: 'r5', cells: { nature: '', montant_n: null, montant_n1: null } },
    { id: 'r6', cells: { nature: '', montant_n: null, montant_n1: null } },
    { id: 'r7', cells: { nature: '', montant_n: null, montant_n1: null } },
    { id: 'total', cells: { nature: 'TOTAL', montant_n: totalN || null, montant_n1: totalN1 || null }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      noteLabel="NOTE 8C"
      noteTitle="NOTE 8C : CHARGES CONSTATEES D'AVANCE"
      pageNumber="28"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note8C
