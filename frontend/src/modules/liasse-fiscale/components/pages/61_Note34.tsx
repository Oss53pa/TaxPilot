import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getCharges, getProduits } from '../../services/liasse-calculs'

const v = (n: number) => n || null

const Note34: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const bal = balance
  const balN1 = balanceN1 || []

  // ── Helper shortcuts ──
  const c = (b: typeof bal, p: string[]) => getCharges(b, p)
  const p = (b: typeof bal, pf: string[]) => getProduits(b, pf)

  // ── Compute for N ──
  const totalProduits = p(bal, ['70','71','72','73','75','77','78','79','82','84','86','88'])
  const totalCharges = c(bal, ['60','61','62','63','64','65','66','67','68','69','81','83','85','87'])
  const resultatComptable = totalProduits - totalCharges

  // Reintegrations fiscales
  const amendes = c(bal, ['6712'])
  const provisionsND = c(bal, ['691','697'])
  const chargesHAO = c(bal, ['85'])
  const impotResultat = c(bal, ['89'])
  const totalReintegrations = amendes + provisionsND + chargesHAO + impotResultat

  // Deductions fiscales
  const reprisesProvisions = p(bal, ['791','797'])
  const produitsHAO = p(bal, ['86','88'])
  const plusValues = 0
  const totalDeductions = reprisesProvisions + produitsHAO + plusValues

  const resultatFiscal = resultatComptable + totalReintegrations - totalDeductions

  // ── Compute for N-1 ──
  const totalProduitsN1 = p(balN1, ['70','71','72','73','75','77','78','79','82','84','86','88'])
  const totalChargesN1 = c(balN1, ['60','61','62','63','64','65','66','67','68','69','81','83','85','87'])
  const resultatComptableN1 = totalProduitsN1 - totalChargesN1

  const amendesN1 = c(balN1, ['6712'])
  const provisionsNDN1 = c(balN1, ['691','697'])
  const chargesHAON1 = c(balN1, ['85'])
  const impotResultatN1 = c(balN1, ['89'])
  const totalReintegrationsN1 = amendesN1 + provisionsNDN1 + chargesHAON1 + impotResultatN1

  const reprisesProvisionsN1 = p(balN1, ['791','797'])
  const produitsHAON1 = p(balN1, ['86','88'])
  const plusValuesN1 = 0
  const totalDeductionsN1 = reprisesProvisionsN1 + produitsHAON1 + plusValuesN1

  const resultatFiscalN1 = resultatComptableN1 + totalReintegrationsN1 - totalDeductionsN1

  // ── Table definition ──
  const columns: Column[] = [
    { key: 'designation', label: 'Elements', width: '40%', align: 'left' },
    { key: 'reintegrations', label: 'Reintegrations N', width: '15%', align: 'right' },
    { key: 'deductions', label: 'Deductions N', width: '15%', align: 'right' },
    { key: 'reintegrations_n1', label: 'Reintegrations N-1', width: '15%', align: 'right' },
    { key: 'deductions_n1', label: 'Deductions N-1', width: '15%', align: 'right' },
  ]

  const lines: {
    label: string
    reintegrations: number | null
    deductions: number | null
    reintegrations_n1: number | null
    deductions_n1: number | null
    isTotal?: boolean
    isSectionHeader?: boolean
  }[] = [
    { label: 'RESULTAT COMPTABLE', reintegrations: null, deductions: null, reintegrations_n1: null, deductions_n1: null, isSectionHeader: true },
    { label: 'Total produits', reintegrations: null, deductions: v(totalProduits), reintegrations_n1: null, deductions_n1: v(totalProduitsN1) },
    { label: 'Total charges', reintegrations: v(totalCharges), deductions: null, reintegrations_n1: v(totalChargesN1), deductions_n1: null },
    {
      label: 'Resultat comptable avant impot (benefice ou perte)',
      reintegrations: resultatComptable >= 0 ? v(resultatComptable) : null,
      deductions: resultatComptable < 0 ? v(Math.abs(resultatComptable)) : null,
      reintegrations_n1: resultatComptableN1 >= 0 ? v(resultatComptableN1) : null,
      deductions_n1: resultatComptableN1 < 0 ? v(Math.abs(resultatComptableN1)) : null,
      isTotal: true,
    },
    { label: 'REINTEGRATIONS FISCALES', reintegrations: null, deductions: null, reintegrations_n1: null, deductions_n1: null, isSectionHeader: true },
    { label: 'Amendes et penalites fiscales', reintegrations: v(amendes), deductions: null, reintegrations_n1: v(amendesN1), deductions_n1: null },
    { label: 'Provisions non deductibles', reintegrations: v(provisionsND), deductions: null, reintegrations_n1: v(provisionsNDN1), deductions_n1: null },
    { label: 'Charges HAO non deductibles', reintegrations: v(chargesHAO), deductions: null, reintegrations_n1: v(chargesHAON1), deductions_n1: null },
    { label: 'Impot sur le resultat', reintegrations: v(impotResultat), deductions: null, reintegrations_n1: v(impotResultatN1), deductions_n1: null },
    { label: 'Total reintegrations', reintegrations: v(totalReintegrations), deductions: null, reintegrations_n1: v(totalReintegrationsN1), deductions_n1: null, isTotal: true },
    { label: 'DEDUCTIONS FISCALES', reintegrations: null, deductions: null, reintegrations_n1: null, deductions_n1: null, isSectionHeader: true },
    { label: 'Reprises de provisions anterieurement imposees', reintegrations: null, deductions: v(reprisesProvisions), reintegrations_n1: null, deductions_n1: v(reprisesProvisionsN1) },
    { label: 'Produits HAO non imposables', reintegrations: null, deductions: v(produitsHAO), reintegrations_n1: null, deductions_n1: v(produitsHAON1) },
    { label: 'Plus-values nettes a long terme', reintegrations: null, deductions: v(plusValues), reintegrations_n1: null, deductions_n1: v(plusValuesN1) },
    { label: 'Total deductions', reintegrations: null, deductions: v(totalDeductions), reintegrations_n1: null, deductions_n1: v(totalDeductionsN1), isTotal: true },
    { label: 'RESULTAT FISCAL', reintegrations: null, deductions: null, reintegrations_n1: null, deductions_n1: null, isSectionHeader: true },
    {
      label: 'Resultat fiscal (benefice ou deficit)',
      reintegrations: resultatFiscal >= 0 ? v(resultatFiscal) : null,
      deductions: resultatFiscal < 0 ? v(Math.abs(resultatFiscal)) : null,
      reintegrations_n1: resultatFiscalN1 >= 0 ? v(resultatFiscalN1) : null,
      deductions_n1: resultatFiscalN1 < 0 ? v(Math.abs(resultatFiscalN1)) : null,
      isTotal: true,
    },
  ]

  const rows: Row[] = lines.map((r, i) => ({
    id: `${i}`,
    cells: {
      designation: r.label,
      reintegrations: r.reintegrations,
      deductions: r.deductions,
      reintegrations_n1: r.reintegrations_n1,
      deductions_n1: r.deductions_n1,
    },
    isTotal: r.isTotal,
    isSectionHeader: r.isSectionHeader,
    bold: r.isSectionHeader || r.isTotal,
  }))

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      noteLabel="NOTE 34"
      noteTitle="NOTE 34 : TABLEAU DE DETERMINATION DU RESULTAT FISCAL"
      pageNumber="59"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note34
