import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getProduits } from '../../services/liasse-calculs'

// Account prefix mapping for amortissements (class 28)
const AMORT_LINES = [
  // IMMOBILISATIONS INCORPORELLES
  { id: 'r1', label: 'Frais de recherche et developpement', prefixes: ['2811', '2812'] as const },
  { id: 'r2', label: 'Brevets, licences, logiciels', prefixes: ['2813', '2814', '2815'] as const },
  { id: 'r3', label: 'Fonds commercial', prefixes: ['2816'] as const },
  { id: 'r4', label: 'Autres immobilisations incorporelles', prefixes: ['2817', '2818', '2819'] as const },
  // IMMOBILISATIONS CORPORELLES
  { id: 'r5', label: 'Terrains', prefixes: ['282'] as const },
  { id: 'r6', label: 'Batiments', prefixes: ['2831', '2832'] as const },
  { id: 'r7', label: 'Installations et agencements', prefixes: ['2833', '2834'] as const },
  { id: 'r8', label: 'Materiel', prefixes: ['2841', '2842', '2843', '2844'] as const },
  { id: 'r9', label: 'Materiel de transport', prefixes: ['2845'] as const },
] as const

const INCORP_IDS = ['r1', 'r2', 'r3', 'r4']
const CORP_IDS = ['r5', 'r6', 'r7', 'r8', 'r9']
const ALL_IDS = [...INCORP_IDS, ...CORP_IDS]

const Note3C: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'rubriques', label: 'Rubriques', width: '32%', align: 'left' },
    { key: 'amort_debut', label: 'Amort. debut', width: '17%', align: 'right' },
    { key: 'dotations', label: 'Dotations', width: '17%', align: 'right' },
    { key: 'reprises', label: 'Reprises', width: '17%', align: 'right' },
    { key: 'amort_fin', label: 'Amort. fin', width: '17%', align: 'right' },
  ]

  // Compute values for each line
  const computed = AMORT_LINES.map(line => {
    const amort_fin = getProduits(balance, line.prefixes)
    const amort_debut = balanceN1 ? getProduits(balanceN1, line.prefixes) : 0
    const delta = amort_fin - amort_debut
    const dotations = delta > 0 ? delta : 0
    const reprises = delta < 0 ? Math.abs(delta) : 0
    return { ...line, amort_debut, amort_fin, dotations, reprises }
  })

  const sumGroup = (ids: string[], field: 'amort_debut' | 'amort_fin' | 'dotations' | 'reprises') =>
    computed.filter(c => ids.includes(c.id)).reduce((acc, c) => acc + c[field], 0)

  const v = (n: number) => n || null

  const rows: Row[] = [
    // ── IMMOBILISATIONS INCORPORELLES ──
    { id: 'immob_incorp', cells: { rubriques: 'IMMOBILISATIONS INCORPORELLES' }, isSectionHeader: true, bold: true },
    ...computed.filter(c => INCORP_IDS.includes(c.id)).map(c => ({
      id: c.id,
      cells: {
        rubriques: c.label,
        amort_debut: v(c.amort_debut),
        dotations: v(c.dotations),
        reprises: v(c.reprises),
        amort_fin: v(c.amort_fin),
      },
      indent: 1,
    })),
    {
      id: 'sub_incorp',
      cells: {
        rubriques: 'Sous-total incorporelles',
        amort_debut: v(sumGroup(INCORP_IDS, 'amort_debut')),
        dotations: v(sumGroup(INCORP_IDS, 'dotations')),
        reprises: v(sumGroup(INCORP_IDS, 'reprises')),
        amort_fin: v(sumGroup(INCORP_IDS, 'amort_fin')),
      },
      isSubtotal: true,
      bold: true,
    },

    // ── IMMOBILISATIONS CORPORELLES ──
    { id: 'immob_corp', cells: { rubriques: 'IMMOBILISATIONS CORPORELLES' }, isSectionHeader: true, bold: true },
    ...computed.filter(c => CORP_IDS.includes(c.id)).map(c => ({
      id: c.id,
      cells: {
        rubriques: c.label,
        amort_debut: v(c.amort_debut),
        dotations: v(c.dotations),
        reprises: v(c.reprises),
        amort_fin: v(c.amort_fin),
      },
      indent: 1,
    })),
    {
      id: 'sub_corp',
      cells: {
        rubriques: 'Sous-total corporelles',
        amort_debut: v(sumGroup(CORP_IDS, 'amort_debut')),
        dotations: v(sumGroup(CORP_IDS, 'dotations')),
        reprises: v(sumGroup(CORP_IDS, 'reprises')),
        amort_fin: v(sumGroup(CORP_IDS, 'amort_fin')),
      },
      isSubtotal: true,
      bold: true,
    },

    // ── TOTAL ──
    {
      id: 'total',
      cells: {
        rubriques: 'TOTAL',
        amort_debut: v(sumGroup(ALL_IDS, 'amort_debut')),
        dotations: v(sumGroup(ALL_IDS, 'dotations')),
        reprises: v(sumGroup(ALL_IDS, 'reprises')),
        amort_fin: v(sumGroup(ALL_IDS, 'amort_fin')),
      },
      isTotal: true,
    },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      noteLabel="NOTE 3C"
      noteTitle="NOTE 3C : AMORTISSEMENTS"
      pageNumber="17"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note3C
