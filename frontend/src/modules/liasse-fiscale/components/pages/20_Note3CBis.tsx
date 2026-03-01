import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getProduits } from '../../services/liasse-calculs'

// Account prefix mapping for depreciations and provisions
const DEPREC_LINES: { id: string; label: string; prefixes: readonly string[] }[] = [
  { id: 'r1', label: 'Immobilisations incorporelles', prefixes: ['290', '291'] },
  { id: 'r2', label: 'Immobilisations corporelles', prefixes: ['292', '293', '294'] },
  { id: 'r3', label: 'Immobilisations financieres', prefixes: ['296', '297'] },
  { id: 'r4', label: 'Stocks', prefixes: ['39'] },
  { id: 'r5', label: 'Creances et emplois assimiles', prefixes: ['49'] },
]

const PROV_LINES: { id: string; label: string; prefixes: readonly string[] }[] = [
  { id: 'r6', label: 'Provisions pour risques', prefixes: ['191', '192'] },
  { id: 'r7', label: 'Provisions pour charges', prefixes: ['193', '194', '195', '196', '197', '198'] },
]

const ALL_LINES = [...DEPREC_LINES, ...PROV_LINES]
const DEPREC_IDS = DEPREC_LINES.map(l => l.id)
const PROV_IDS = PROV_LINES.map(l => l.id)
const ALL_IDS = ALL_LINES.map(l => l.id)

const Note3CBis: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'rubriques', label: 'Rubriques', width: '32%', align: 'left' },
    { key: 'debut', label: 'Debut exercice', width: '17%', align: 'right' },
    { key: 'dotations', label: 'Dotations', width: '17%', align: 'right' },
    { key: 'reprises', label: 'Reprises', width: '17%', align: 'right' },
    { key: 'fin', label: 'Fin exercice', width: '17%', align: 'right' },
  ]

  // Compute values for each line
  const computed = ALL_LINES.map(line => {
    const fin = getProduits(balance, line.prefixes)
    const debut = balanceN1 ? getProduits(balanceN1, line.prefixes) : 0
    const delta = fin - debut
    const dotations = delta > 0 ? delta : 0
    const reprises = delta < 0 ? Math.abs(delta) : 0
    return { ...line, debut, fin, dotations, reprises }
  })

  const sumGroup = (ids: string[], field: 'debut' | 'fin' | 'dotations' | 'reprises') =>
    computed.filter(c => ids.includes(c.id)).reduce((acc, c) => acc + c[field], 0)

  const v = (n: number) => n || null

  const rows: Row[] = [
    // ── DEPRECIATIONS ──
    { id: 'deprec_header', cells: { rubriques: 'DEPRECIATIONS' }, isSectionHeader: true, bold: true },
    ...computed.filter(c => DEPREC_IDS.includes(c.id)).map(c => ({
      id: c.id,
      cells: {
        rubriques: c.label,
        debut: v(c.debut),
        dotations: v(c.dotations),
        reprises: v(c.reprises),
        fin: v(c.fin),
      },
      indent: 1,
    })),
    {
      id: 'sub_deprec',
      cells: {
        rubriques: 'Sous-total depreciations',
        debut: v(sumGroup(DEPREC_IDS, 'debut')),
        dotations: v(sumGroup(DEPREC_IDS, 'dotations')),
        reprises: v(sumGroup(DEPREC_IDS, 'reprises')),
        fin: v(sumGroup(DEPREC_IDS, 'fin')),
      },
      isSubtotal: true,
      bold: true,
    },

    // ── PROVISIONS POUR RISQUES ET CHARGES ──
    { id: 'prov_header', cells: { rubriques: 'PROVISIONS POUR RISQUES ET CHARGES' }, isSectionHeader: true, bold: true },
    ...computed.filter(c => PROV_IDS.includes(c.id)).map(c => ({
      id: c.id,
      cells: {
        rubriques: c.label,
        debut: v(c.debut),
        dotations: v(c.dotations),
        reprises: v(c.reprises),
        fin: v(c.fin),
      },
      indent: 1,
    })),
    {
      id: 'sub_prov',
      cells: {
        rubriques: 'Sous-total provisions',
        debut: v(sumGroup(PROV_IDS, 'debut')),
        dotations: v(sumGroup(PROV_IDS, 'dotations')),
        reprises: v(sumGroup(PROV_IDS, 'reprises')),
        fin: v(sumGroup(PROV_IDS, 'fin')),
      },
      isSubtotal: true,
      bold: true,
    },

    // ── TOTAL GENERAL ──
    {
      id: 'total',
      cells: {
        rubriques: 'TOTAL GENERAL',
        debut: v(sumGroup(ALL_IDS, 'debut')),
        dotations: v(sumGroup(ALL_IDS, 'dotations')),
        reprises: v(sumGroup(ALL_IDS, 'reprises')),
        fin: v(sumGroup(ALL_IDS, 'fin')),
      },
      isTotal: true,
    },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      noteLabel="NOTE 3C BIS"
      noteTitle="NOTE 3C BIS : DEPRECIATIONS ET PROVISIONS POUR RISQUES"
      pageNumber="18"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note3CBis
