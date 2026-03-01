import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const Note16C: React.FC<PageProps> = ({ balance, balanceN1, onNoteClick, ...props }) => {
  const columns: Column[] = [
    { key: 'label', label: 'Libelles', width: '50%', align: 'left' },
    { key: 'n', label: 'Annee N', align: 'right' },
    { key: 'n1', label: 'Annee N-1', align: 'right' },
  ]

  const rows: Row[] = [
    // ── Section 1: Actif eventuel ──
    { id: 'sec_actif', cells: { label: 'Actif eventuel' }, isSectionHeader: true },
    { id: 'litiges_a', cells: { label: 'Litiges', n: null, n1: null } },
    { id: 'a1', cells: { label: ' ', n: null, n1: null } },
    { id: 'a2', cells: { label: ' ', n: null, n1: null } },
    { id: 'a3', cells: { label: ' ', n: null, n1: null } },
    { id: 'a4', cells: { label: ' ', n: null, n1: null } },
    { id: 'a5', cells: { label: ' ', n: null, n1: null } },
    { id: 'st_actif', cells: { label: 'Sous-total actif eventuel', n: null, n1: null }, isSubtotal: true, bold: true },

    // ── Section 2: Passif eventuel ──
    { id: 'sec_passif', cells: { label: 'Passif eventuel' }, isSectionHeader: true },
    { id: 'litiges_p', cells: { label: 'Litiges', n: null, n1: null } },
    { id: 'p1', cells: { label: ' ', n: null, n1: null } },
    { id: 'p2', cells: { label: ' ', n: null, n1: null } },
    { id: 'p3', cells: { label: ' ', n: null, n1: null } },
    { id: 'p4', cells: { label: ' ', n: null, n1: null } },
    { id: 'p5', cells: { label: ' ', n: null, n1: null } },
    { id: 'st_passif', cells: { label: 'Sous-total passif eventuel', n: null, n1: null }, isSubtotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 16C"
      noteTitle="NOTE 16C : ACTIFS ET PASSIFS EVENTUELS"
      pageNumber="38"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note16C
