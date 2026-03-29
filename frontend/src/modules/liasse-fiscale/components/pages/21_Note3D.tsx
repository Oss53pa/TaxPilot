import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps, BalanceEntry } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getActifBrut, getAmortProv } from '../../services/liasse-calculs'
import { NOTE_3D } from '@/constants/syscohada-mappings'

interface LineSpec {
  id: string
  label: string
  comptes: string[]
  amort: string[]
}

const TITRES_LINES: LineSpec[] = [
  { id: 'titres_part', label: 'Titres de participation', comptes: [...NOTE_3D.titresParticipation.comptes], amort: [...NOTE_3D.titresParticipation.amort] },
]

const AUTRES_LINES: LineSpec[] = [
  { id: 'prets', label: 'Prets et creances non commerciales', comptes: [...NOTE_3D.pretsCreances.comptes], amort: [...NOTE_3D.pretsCreances.amort] },
  { id: 'depots', label: 'Depots et cautionnements', comptes: [...NOTE_3D.depotsCautionnements.comptes], amort: [...NOTE_3D.depotsCautionnements.amort] },
  { id: 'autres_titres', label: 'Autres titres immobilises', comptes: [...NOTE_3D.autresTitres.comptes], amort: [...NOTE_3D.autresTitres.amort] },
]

function computeLine(bal: BalanceEntry[], spec: LineSpec) {
  const brut = getActifBrut(bal, spec.comptes)
  const depreciation = spec.amort.length > 0 ? getAmortProv(bal, spec.amort) : 0
  const net = brut - depreciation
  return { brut, depreciation, net }
}

const Note3D: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  // Compute N values
  const titresN = TITRES_LINES.map(l => computeLine(balance, l))
  const autresN = AUTRES_LINES.map(l => computeLine(balance, l))

  const titresTotal = {
    brut: titresN.reduce((s, v) => s + v.brut, 0),
    depreciation: titresN.reduce((s, v) => s + v.depreciation, 0),
    net: titresN.reduce((s, v) => s + v.net, 0),
  }
  const autresTotal = {
    brut: autresN.reduce((s, v) => s + v.brut, 0),
    depreciation: autresN.reduce((s, v) => s + v.depreciation, 0),
    net: autresN.reduce((s, v) => s + v.net, 0),
  }
  const grandTotal = {
    brut: titresTotal.brut + autresTotal.brut,
    depreciation: titresTotal.depreciation + autresTotal.depreciation,
    net: titresTotal.net + autresTotal.net,
  }

  // Compute N-1 values
  const balN1 = balanceN1 && balanceN1.length > 0 ? balanceN1 : null
  const titresN1 = balN1 ? TITRES_LINES.map(l => computeLine(balN1, l)) : null
  const autresN1 = balN1 ? AUTRES_LINES.map(l => computeLine(balN1, l)) : null

  const titresTotalN1 = titresN1
    ? { net: titresN1.reduce((s, v) => s + v.net, 0) }
    : null
  const autresTotalN1 = autresN1
    ? { net: autresN1.reduce((s, v) => s + v.net, 0) }
    : null
  const grandTotalN1 = titresTotalN1 && autresTotalN1
    ? { net: titresTotalN1.net + autresTotalN1.net }
    : null

  const columns: Column[] = [
    { key: 'designation', label: 'Designation', width: '26%', align: 'left' },
    { key: 'valeur_brute', label: 'Valeur brute', width: '15%', align: 'right' },
    { key: 'depreciation', label: 'Depreciation', width: '15%', align: 'right' },
    { key: 'valeur_nette', label: 'Valeur nette N', width: '15%', align: 'right' },
    { key: 'valeur_nette_n1', label: 'Valeur nette N-1', width: '15%', align: 'right' },
    { key: 'pct_participation', label: '% Participation', width: '14%', align: 'right' },
  ]

  const rows: Row[] = [
    // Section: TITRES DE PARTICIPATION
    { id: 'titres_header', cells: { designation: 'TITRES DE PARTICIPATION' }, isSectionHeader: true, bold: true },
    ...TITRES_LINES.map((spec, i) => ({
      id: spec.id,
      cells: {
        designation: spec.label,
        valeur_brute: titresN[i].brut || null,
        depreciation: titresN[i].depreciation || null,
        valeur_nette: titresN[i].net || null,
        valeur_nette_n1: titresN1 ? (titresN1[i].net || null) : null,
        pct_participation: null,
      },
      indent: 1,
    })),
    { id: 'titres_total', cells: {
      designation: 'Sous-total titres de participation',
      valeur_brute: titresTotal.brut || null,
      depreciation: titresTotal.depreciation || null,
      valeur_nette: titresTotal.net || null,
      valeur_nette_n1: titresTotalN1 ? (titresTotalN1.net || null) : null,
      pct_participation: null,
    }, isSubtotal: true, bold: true },

    // Section: AUTRES IMMOBILISATIONS FINANCIERES
    { id: 'autres_header', cells: { designation: 'AUTRES IMMOBILISATIONS FINANCIERES' }, isSectionHeader: true, bold: true },
    ...AUTRES_LINES.map((spec, i) => ({
      id: spec.id,
      cells: {
        designation: spec.label,
        valeur_brute: autresN[i].brut || null,
        depreciation: autresN[i].depreciation || null,
        valeur_nette: autresN[i].net || null,
        valeur_nette_n1: autresN1 ? (autresN1[i].net || null) : null,
        pct_participation: null,
      },
      indent: 1,
    })),
    { id: 'autres_total', cells: {
      designation: 'Sous-total autres immobilisations financieres',
      valeur_brute: autresTotal.brut || null,
      depreciation: autresTotal.depreciation || null,
      valeur_nette: autresTotal.net || null,
      valeur_nette_n1: autresTotalN1 ? (autresTotalN1.net || null) : null,
      pct_participation: null,
    }, isSubtotal: true, bold: true },

    // TOTAL
    { id: 'total', cells: {
      designation: 'TOTAL',
      valeur_brute: grandTotal.brut || null,
      depreciation: grandTotal.depreciation || null,
      valeur_nette: grandTotal.net || null,
      valeur_nette_n1: grandTotalN1 ? (grandTotalN1.net || null) : null,
      pct_participation: null,
    }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      noteLabel="NOTE 3D"
      noteTitle="NOTE 3D : IMMOBILISATIONS FINANCIERES"
      pageNumber="19"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note3D
