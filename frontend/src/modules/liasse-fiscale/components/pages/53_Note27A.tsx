import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getCharges, variation } from '../../services/liasse-calculs'

const v = (n: number) => n || null

const Note27A: React.FC<PageProps> = ({ balance, balanceN1, onNoteClick, ...props }) => {
  const bN1 = balanceN1 || []
  const columns: Column[] = [
    { key: 'label', label: 'Libelles', width: '40%', align: 'left' },
    { key: 'n', label: 'Annee N', align: 'right' },
    { key: 'n1', label: 'Annee N-1', align: 'right' },
    { key: 'var', label: 'Variation en %', align: 'right' },
  ]

  // ── Balance computations ──
  const remNational = getCharges(balance, ['661'])
  const remNonNational = getCharges(balance, ['662'])
  const indemnites = getCharges(balance, ['663'])
  const chargesSocNat = getCharges(balance, ['664'])
  const chargesSocNonNat = getCharges(balance, ['665'])
  const remExploitant = getCharges(balance, ['666'])
  const remTransferee = getCharges(balance, ['667'])
  const autresCharges = getCharges(balance, ['668'])
  const total = remNational + remNonNational + indemnites + chargesSocNat + chargesSocNonNat + remExploitant + remTransferee + autresCharges

  const remNationalN1 = getCharges(bN1, ['661'])
  const remNonNationalN1 = getCharges(bN1, ['662'])
  const indemnitesN1 = getCharges(bN1, ['663'])
  const chargesSocNatN1 = getCharges(bN1, ['664'])
  const chargesSocNonNatN1 = getCharges(bN1, ['665'])
  const remExploitantN1 = getCharges(bN1, ['666'])
  const remTransfereeN1 = getCharges(bN1, ['667'])
  const autresChargesN1 = getCharges(bN1, ['668'])
  const totalN1 = remNationalN1 + remNonNationalN1 + indemnitesN1 + chargesSocNatN1 + chargesSocNonNatN1 + remExploitantN1 + remTransfereeN1 + autresChargesN1

  const pct = (a: number, b: number) => {
    const r = variation(a, b)
    return r ? `${r > 0 ? '+' : ''}${r.toFixed(1)} %` : null
  }

  const rows: Row[] = [
    { id: 'r1', cells: { label: 'Remunerations directes versees au personnel national', n: v(remNational), n1: v(remNationalN1), var: pct(remNational, remNationalN1) } },
    { id: 'r2', cells: { label: 'Remunerations directes versees au personnel non national', n: v(remNonNational), n1: v(remNonNationalN1), var: pct(remNonNational, remNonNationalN1) } },
    { id: 'r3', cells: { label: 'Indemnites forfaitaires versees au personnel', n: v(indemnites), n1: v(indemnitesN1), var: pct(indemnites, indemnitesN1) } },
    { id: 'r4', cells: { label: 'Charges sociales (personnel national)', n: v(chargesSocNat), n1: v(chargesSocNatN1), var: pct(chargesSocNat, chargesSocNatN1) } },
    { id: 'r5', cells: { label: 'Charges sociales (personnel non national)', n: v(chargesSocNonNat), n1: v(chargesSocNonNatN1), var: pct(chargesSocNonNat, chargesSocNonNatN1) } },
    { id: 'r6', cells: { label: 'Remunerations et charges sociales de l\'exploitant individuel', n: v(remExploitant), n1: v(remExploitantN1), var: pct(remExploitant, remExploitantN1) } },
    { id: 'r7', cells: { label: 'Remuneration transferee de personnel exterieur', n: v(remTransferee), n1: v(remTransfereeN1), var: pct(remTransferee, remTransfereeN1) } },
    { id: 'r8', cells: { label: 'Autres charges sociales', n: v(autresCharges), n1: v(autresChargesN1), var: pct(autresCharges, autresChargesN1) } },
    { id: 'total', cells: { label: 'TOTAL', n: v(total), n1: v(totalN1), var: pct(total, totalN1) }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 27A"
      noteTitle="NOTE 27A : CHARGES DE PERSONNEL"
      pageNumber="49"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note27A
