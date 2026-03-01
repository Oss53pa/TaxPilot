import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getActifBrut, getAmortProv, variation } from '../../services/liasse-calculs'

const v = (n: number) => n || null

const Note09: React.FC<PageProps> = ({ balance, balanceN1, onNoteClick, ...props }) => {
  const bN1 = balanceN1 || []
  const columns: Column[] = [
    { key: 'label', label: 'Libelles', width: '40%', align: 'left' },
    { key: 'n', label: 'Annee N', align: 'right' },
    { key: 'n1', label: 'Annee N-1', align: 'right' },
    { key: 'var', label: 'Variation en %', align: 'right' },
  ]

  // ── Balance computations ──
  const titresTresor = getActifBrut(balance, ['501'])
  const actions = getActifBrut(balance, ['502'])
  const obligations = getActifBrut(balance, ['503'])
  const bons = getActifBrut(balance, ['504'])
  const titresNeg = getActifBrut(balance, ['505'])
  const interetsCourus = getActifBrut(balance, ['506', '507'])
  const autresValeurs = getActifBrut(balance, ['508'])
  const totalBrut = titresTresor + actions + obligations + bons + titresNeg + interetsCourus + autresValeurs
  const deprec = getAmortProv(balance, ['59'])
  const totalNet = totalBrut - deprec

  const titresTresorN1 = getActifBrut(bN1, ['501'])
  const actionsN1 = getActifBrut(bN1, ['502'])
  const obligationsN1 = getActifBrut(bN1, ['503'])
  const bonsN1 = getActifBrut(bN1, ['504'])
  const titresNegN1 = getActifBrut(bN1, ['505'])
  const interetsCourusN1 = getActifBrut(bN1, ['506', '507'])
  const autresValeursN1 = getActifBrut(bN1, ['508'])
  const totalBrutN1 = titresTresorN1 + actionsN1 + obligationsN1 + bonsN1 + titresNegN1 + interetsCourusN1 + autresValeursN1
  const deprecN1 = getAmortProv(bN1, ['59'])
  const totalNetN1 = totalBrutN1 - deprecN1

  const pct = (a: number, b: number) => {
    const r = variation(a, b)
    return r ? `${r > 0 ? '+' : ''}${r.toFixed(1)} %` : null
  }

  const rows: Row[] = [
    { id: 'r1', cells: { label: 'Titres de tresor et bons de caisse a court terme', n: v(titresTresor), n1: v(titresTresorN1), var: pct(titresTresor, titresTresorN1) } },
    { id: 'r2', cells: { label: 'Actions', n: v(actions), n1: v(actionsN1), var: pct(actions, actionsN1) } },
    { id: 'r3', cells: { label: 'Obligations', n: v(obligations), n1: v(obligationsN1), var: pct(obligations, obligationsN1) } },
    { id: 'r4', cells: { label: 'Bons de souscription', n: v(bons), n1: v(bonsN1), var: pct(bons, bonsN1) } },
    { id: 'r5', cells: { label: 'Titres negociables hors regions', n: v(titresNeg), n1: v(titresNegN1), var: pct(titresNeg, titresNegN1) } },
    { id: 'r6', cells: { label: 'Interets courus', n: v(interetsCourus), n1: v(interetsCourusN1), var: pct(interetsCourus, interetsCourusN1) } },
    { id: 'r7', cells: { label: 'Autres valeurs assimilees', n: v(autresValeurs), n1: v(autresValeursN1), var: pct(autresValeurs, autresValeursN1) } },
    { id: 'totBrut', cells: { label: 'TOTAL BRUT TITRES', n: v(totalBrut), n1: v(totalBrutN1), var: pct(totalBrut, totalBrutN1) }, isSubtotal: true, bold: true },
    { id: 'deprec', cells: { label: 'Depreciations des titres', n: v(deprec), n1: v(deprecN1), var: pct(deprec, deprecN1) } },
    { id: 'totNet', cells: { label: 'TOTAL NET DE DEPRECIATIONS', n: v(totalNet), n1: v(totalNetN1), var: pct(totalNet, totalNetN1) }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 9"
      noteTitle="NOTE 9 : TITRES DE PLACEMENT"
      pageNumber="27"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note09
