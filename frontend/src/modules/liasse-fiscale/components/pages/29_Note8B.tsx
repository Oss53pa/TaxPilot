import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const Note8B: React.FC<PageProps> = ({ balance, balanceN1, onNoteClick, ...props }) => {
  const columns: Column[] = [
    { key: 'label', label: 'Libelles', width: '60%', align: 'left' },
    { key: 'montant', label: 'Montants', align: 'right' },
  ]

  const rows: Row[] = [
    { id: 'sec1', cells: { label: 'Compte transitoire a solder: 4751 compte transitoire, ajustement special lie a la revision du SYSCOHADA, compte-passif' }, isSectionHeader: true },
    { id: 'r1', cells: { label: 'Montant global a etaler au 1er janvier 2018', montant: null } },
    { id: 'r2', cells: { label: 'Duree d\'etalement retenue', montant: null } },
    { id: 'r3', cells: { label: '791 Reprises de provisions et depreciations d\'exploitation', montant: null } },
    { id: 'r4', cells: { label: 'Total exercice 2018', montant: null } },
    { id: 'r5', cells: { label: 'Total exercice 2019', montant: null } },
    { id: 'r6', cells: { label: 'Total exercice 2020', montant: null } },
    { id: 'r7', cells: { label: 'Total exercice 2021', montant: null } },
    { id: 'r8', cells: { label: 'Total exercice 2022', montant: null } },
    { id: 'total', cells: { label: 'TOTAL GENERAL', montant: null }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 8B"
      noteTitle="NOTE 8B : TABLEAU D'ETALEMENT DE PROVISIONS POUR CHARGES A REPARTIR"
      pageNumber="25"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note8B
