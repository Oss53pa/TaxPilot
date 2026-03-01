import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps, BalanceEntry } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getProduits, getCharges } from '../../services/liasse-calculs'

function computeResultat(bal: BalanceEntry[]): number {
  const produits = getProduits(bal, ['7'])
  const charges = getCharges(bal, ['6'])
  const produitsHao = getProduits(bal, ['84', '86', '88'])
  const chargesHao = getCharges(bal, ['83', '85', '87', '89'])
  return (produits + produitsHao) - (charges + chargesHao)
}

const Note02: React.FC<PageProps> = ({ entreprise, balance, balanceN1, ...props }) => {
  const balN1 = balanceN1 && balanceN1.length > 0 ? balanceN1 : null

  const resultatN = computeResultat(balance)
  const resultatN1 = balN1 ? computeResultat(balN1) : 0

  // Capital social is available from entreprise data
  // Number of shares cannot be derived from accounting data alone
  const capitalN = entreprise.capital_social || null
  const capitalN1 = capitalN // same capital assumed for N-1 unless changed

  // Benefice par action can only be computed if nb_actions is known
  // Since we only have capital_social, we display it and leave BPA as informational
  const bpaN = null as number | null
  const bpaN1 = null as number | null

  const columns: Column[] = [
    { key: 'elements', label: 'Elements', width: '50%', align: 'left' },
    { key: 'exercice_n', label: 'Exercice N', width: '25%', align: 'right' },
    { key: 'exercice_n1', label: 'Exercice N-1', width: '25%', align: 'right' },
  ]

  const rows: Row[] = [
    { id: 'resultat', cells: {
      elements: 'Resultat net',
      exercice_n: resultatN || null,
      exercice_n1: resultatN1 || null,
    }},
    { id: 'capital', cells: {
      elements: 'Capital social',
      exercice_n: capitalN,
      exercice_n1: capitalN1,
    }},
    { id: 'nb_actions', cells: {
      elements: 'Nombre d\'actions',
      exercice_n: null,
      exercice_n1: null,
    }},
    { id: 'benefice', cells: {
      elements: 'Benefice par action',
      exercice_n: bpaN,
      exercice_n1: bpaN1,
    }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      entreprise={entreprise}
      balance={balance}
      balanceN1={balanceN1}
      noteLabel="NOTE 2"
      noteTitle="NOTE 2 : BENEFICE PAR ACTION"
      pageNumber="14"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note02
