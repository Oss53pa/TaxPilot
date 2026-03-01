import React from 'react'
import NoteTemplate from '../NoteTemplate'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const Suppl1: React.FC<PageProps> = (props) => {
  // Section 1 : Complement Note Annexe — Montants UEMOA / Hors UEMOA
  const cols1: Column[] = [
    { key: 'designation', label: 'Elements', width: '50%', align: 'left' },
    { key: 'uemoa', label: 'UEMOA', width: '25%', align: 'right' },
    { key: 'hors_uemoa', label: 'Hors UEMOA', width: '25%', align: 'right' },
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

  const rows1: Row[] = section1Labels.map((label, i) => ({
    id: `s1-${i}`,
    cells: { designation: label, uemoa: null, hors_uemoa: null },
    isTotal: label.startsWith('TOTAL'),
    bold: label.startsWith('TOTAL'),
  }))

  // Section 2 : Complement Note 32 — Production vendue
  const cols2: Column[] = [
    { key: 'designation', label: 'Produits', width: '40%', align: 'left' },
    { key: 'quantite', label: 'Quantite', width: '20%', align: 'right' },
    { key: 'montant_n', label: 'Exercice N', width: '20%', align: 'right' },
    { key: 'montant_n1', label: 'Exercice N-1', width: '20%', align: 'right' },
  ]

  const rows2: Row[] = Array.from({ length: 15 }, (_, i) => ({
    id: `s2-${i}`,
    cells: { designation: null, quantite: null, montant_n: null, montant_n1: null },
  }))
  rows2.push({
    id: 's2-total',
    cells: { designation: 'TOTAL', quantite: null, montant_n: null, montant_n1: null },
    isTotal: true,
    bold: true,
  })

  return (
    <NoteTemplate
      {...props}
      noteLabel="SUPPL 1"
      noteTitle="ELEMENTS STATISTIQUES UEMOA"
      pageNumber="69"
      commentSection={false}
    >
      <LiasseTable columns={cols1} rows={rows1} title="Complement Note Annexe — Repartition UEMOA / Hors UEMOA" compact />
      <LiasseTable columns={cols2} rows={rows2} title="Complement Note 32 — Production vendue par produit" compact />
    </NoteTemplate>
  )
}

export default Suppl1
