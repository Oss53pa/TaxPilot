import React from 'react'
import NoteTemplate from '../NoteTemplate'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const Suppl1: React.FC<PageProps> = (props) => {
  // Section 1 : Complement Note Annexe — Montants UEMOA / Hors UEMOA
  const cols1: Column[] = [
    { key: 'designation', label: 'Elements', width: '50%', align: 'left' },
    { key: 'uemoa', label: 'UEMOA', width: '25%', align: 'right', editable: true, type: 'number' },
    { key: 'hors_uemoa', label: 'Hors UEMOA', width: '25%', align: 'right', editable: true, type: 'number' },
  ]

  const section1Labels = [
    'Achats de marchandises',
    'Achats de matieres premieres et fournitures liees',
    'Autres achats',
    'TOTAL ACHATS',
    'Transports',
    'Services exterieurs',
    'Impots et taxes',
    'Autres charges',
    'Charges de personnel',
    'TOTAL CHARGES',
    'Ventes de marchandises',
    'Ventes de produits fabriques',
    'Travaux et services vendus',
    'Produits accessoires',
    'TOTAL PRODUITS',
    'Production immobilisee',
    'Subventions d\'exploitation',
    'Autres produits',
    'Reprises de provisions',
    'Transferts de charges',
    'TOTAL GENERAL PRODUITS',
  ]

  const baseRows1: Row[] = section1Labels.map((label, i) => ({
    id: `s1-${i}`,
    cells: { designation: label, uemoa: null, hors_uemoa: null },
    isTotal: label.startsWith('TOTAL'),
    bold: label.startsWith('TOTAL'),
  }))

  // Section 2 : Complement Note 32 — Production vendue
  const cols2: Column[] = [
    { key: 'designation', label: 'Produits', width: '40%', align: 'left', editable: true, type: 'text' },
    { key: 'quantite', label: 'Quantite', width: '20%', align: 'right', editable: true, type: 'number' },
    { key: 'montant_n', label: 'Exercice N', width: '20%', align: 'right', editable: true, type: 'number' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '20%', align: 'right', editable: true, type: 'number' },
  ]

  const baseRows2: Row[] = Array.from({ length: 15 }, (_, i) => ({
    id: `s2-${i}`,
    cells: { designation: null, quantite: null, montant_n: null, montant_n1: null },
  }))

  const { mergedRows, setCell } = useLiasseManualData('suppl1', [...baseRows1, ...baseRows2])

  const merged1 = mergedRows.filter(r => r.id.startsWith('s1-'))
  const merged2 = mergedRows.filter(r => r.id.startsWith('s2-'))

  // Total for section 2
  let totN = 0, totN1 = 0
  for (const r of merged2) {
    if (typeof r.cells.montant_n === 'number') totN += r.cells.montant_n
    if (typeof r.cells.montant_n1 === 'number') totN1 += r.cells.montant_n1
  }
  const rows2WithTotal: Row[] = [
    ...merged2,
    { id: 's2-total', cells: { designation: 'TOTAL', quantite: null, montant_n: totN || null, montant_n1: totN1 || null }, isTotal: true, bold: true },
  ]

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 1"
      noteTitle="ELEMENTS STATISTIQUES UEMOA"
      pageNumber="69"
      commentSection={false}
    >
      <LiasseTable columns={cols1} rows={merged1} title="Complement Note Annexe — Repartition UEMOA / Hors UEMOA" compact onCellChange={setCell} />
      <LiasseTable columns={cols2} rows={rows2WithTotal} title="Complement Note 32 — Production vendue par produit" compact onCellChange={setCell} />
    </NoteTemplate>
  )
}

export default Suppl1
