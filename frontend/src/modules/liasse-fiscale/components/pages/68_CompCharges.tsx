import React, { useMemo } from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column } from '../LiasseTable'
import { buildCompChargesRows } from '../../services/noteBalanceMapping'

const CompCharges: React.FC<PageProps> = (props) => {
  const columns: Column[] = [
    { key: 'compte', label: 'Compte', width: 80, align: 'center' },
    { key: 'designation', label: 'Nature des charges', width: '40%', align: 'left' },
    { key: 'montant_n', label: 'Exercice N', width: '15%', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '15%', align: 'right' },
    { key: 'variation_val', label: 'Variation', width: '15%', align: 'right' },
    { key: 'variation_pct', label: 'Var. %', width: 80, align: 'right' },
  ]

  const rows = useMemo(
    () => buildCompChargesRows(props.balance, props.balanceN1),
    [props.balance, props.balanceN1],
  )

  return (
    <NoteTemplate
      {...props}
      noteLabel="COMP-CHARGES"
      noteTitle="ETAT COMPLEMENTAIRE — DETAIL DES CHARGES PAR NATURE"
      pageNumber="66"
      columns={columns}
      rows={rows}
    />
  )
}

export default CompCharges
