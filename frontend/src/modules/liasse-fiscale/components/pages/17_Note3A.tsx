import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { getActifBrut } from '../../services/liasse-calculs'
import { NOTE_3A } from '@/constants/syscohada-mappings'

// Account prefix mapping for gross immobilisation values (class 2)
const IMMOB_LINES = [
  // IMMOBILISATIONS INCORPORELLES
  { id: 'r1', label: 'Frais de recherche et developpement', prefixes: [...NOTE_3A.fraisRD.comptes] },
  { id: 'r2', label: 'Brevets, licences, logiciels', prefixes: [...NOTE_3A.brevetsLogiciels.comptes] },
  { id: 'r3', label: 'Fonds commercial', prefixes: [...NOTE_3A.fondsCommercial.comptes] },
  { id: 'r4', label: 'Autres immobilisations incorporelles', prefixes: [...NOTE_3A.autresIncorporelles.comptes] },
  // IMMOBILISATIONS CORPORELLES
  { id: 'r5', label: 'Terrains', prefixes: [...NOTE_3A.terrains.comptes] },
  { id: 'r6', label: 'Batiments', prefixes: [...NOTE_3A.batiments.comptes] },
  { id: 'r7', label: 'Installations et agencements', prefixes: [...NOTE_3A.installationsAgencements.comptes] },
  { id: 'r8', label: 'Materiel', prefixes: [...NOTE_3A.materiel.comptes] },
  { id: 'r9', label: 'Materiel de transport', prefixes: [...NOTE_3A.materielTransport.comptes] },
  // AVANCES ET ACOMPTES
  { id: 'r10', label: 'Avances et acomptes sur immobilisations', prefixes: [...NOTE_3A.avancesAcomptes.comptes] },
]

// Section boundaries: incorporelles = r1..r4, corporelles = r5..r9, avances = r10
const INCORP_IDS = ['r1', 'r2', 'r3', 'r4']
const CORP_IDS = ['r5', 'r6', 'r7', 'r8', 'r9']
const AVANCES_IDS = ['r10']

const Note3A: React.FC<PageProps> = ({ balance, balanceN1, ...props }) => {
  const columns: Column[] = [
    { key: 'rubriques', label: 'Rubriques', width: '28%', align: 'left' },
    { key: 'debut', label: 'A', subLabel: 'Debut exercice', width: '15%', align: 'right' },
    { key: 'acquisitions', label: 'B', subLabel: 'Acquisitions', width: '15%', align: 'right' },
    { key: 'cessions', label: 'C', subLabel: 'Cessions / Retraits', width: '14%', align: 'right' },
    { key: 'virements', label: 'D', subLabel: 'Virement poste a poste', width: '14%', align: 'right' },
    { key: 'fin', label: 'E', subLabel: 'Fin exercice', width: '14%', align: 'right' },
  ]

  // Compute values for each line
  const computed = IMMOB_LINES.map(line => {
    const fin = getActifBrut(balance, line.prefixes)
    const debut = balanceN1 ? getActifBrut(balanceN1, line.prefixes) : 0
    const delta = fin - debut
    const acquisitions = delta > 0 ? delta : 0
    const cessions = delta < 0 ? Math.abs(delta) : 0
    return { ...line, debut, fin, acquisitions, cessions }
  })

  // Helper to sum a group of line IDs for a given field
  const sumGroup = (ids: string[], field: 'debut' | 'fin' | 'acquisitions' | 'cessions') =>
    computed.filter(c => ids.includes(c.id)).reduce((acc, c) => acc + c[field], 0)

  const v = (n: number) => n || null // convert 0 to null so table shows empty

  // Build rows
  const rows: Row[] = [
    // ── IMMOBILISATIONS INCORPORELLES ──
    { id: 'immob_incorp', cells: { rubriques: 'IMMOBILISATIONS INCORPORELLES' }, isSectionHeader: true, bold: true },
    ...computed.filter(c => INCORP_IDS.includes(c.id)).map(c => ({
      id: c.id,
      cells: {
        rubriques: c.label,
        debut: v(c.debut),
        acquisitions: v(c.acquisitions),
        cessions: v(c.cessions),
        virements: null,
        fin: v(c.fin),
      },
      indent: 1,
    })),
    {
      id: 'sub_incorp',
      cells: {
        rubriques: 'Sous-total incorporelles',
        debut: v(sumGroup(INCORP_IDS, 'debut')),
        acquisitions: v(sumGroup(INCORP_IDS, 'acquisitions')),
        cessions: v(sumGroup(INCORP_IDS, 'cessions')),
        virements: null,
        fin: v(sumGroup(INCORP_IDS, 'fin')),
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
        debut: v(c.debut),
        acquisitions: v(c.acquisitions),
        cessions: v(c.cessions),
        virements: null,
        fin: v(c.fin),
      },
      indent: 1,
    })),
    {
      id: 'sub_corp',
      cells: {
        rubriques: 'Sous-total corporelles',
        debut: v(sumGroup(CORP_IDS, 'debut')),
        acquisitions: v(sumGroup(CORP_IDS, 'acquisitions')),
        cessions: v(sumGroup(CORP_IDS, 'cessions')),
        virements: null,
        fin: v(sumGroup(CORP_IDS, 'fin')),
      },
      isSubtotal: true,
      bold: true,
    },

    // ── AVANCES ET ACOMPTES ──
    { id: 'avances_header', cells: { rubriques: 'AVANCES ET ACOMPTES' }, isSectionHeader: true, bold: true },
    ...computed.filter(c => AVANCES_IDS.includes(c.id)).map(c => ({
      id: c.id,
      cells: {
        rubriques: c.label,
        debut: v(c.debut),
        acquisitions: v(c.acquisitions),
        cessions: v(c.cessions),
        virements: null,
        fin: v(c.fin),
      },
      indent: 1,
    })),

    // ── TOTAL GENERAL ──
    {
      id: 'total',
      cells: {
        rubriques: 'TOTAL',
        debut: v(sumGroup([...INCORP_IDS, ...CORP_IDS, ...AVANCES_IDS], 'debut')),
        acquisitions: v(sumGroup([...INCORP_IDS, ...CORP_IDS, ...AVANCES_IDS], 'acquisitions')),
        cessions: v(sumGroup([...INCORP_IDS, ...CORP_IDS, ...AVANCES_IDS], 'cessions')),
        virements: null,
        fin: v(sumGroup([...INCORP_IDS, ...CORP_IDS, ...AVANCES_IDS], 'fin')),
      },
      isTotal: true,
    },
  ]

  return (
    <NoteTemplate
      {...props}
      balance={balance}
      balanceN1={balanceN1}
      noteLabel="NOTE 3A"
      noteTitle="NOTE 3A : IMMOBILISATIONS - MOUVEMENTS"
      pageNumber="15"
      columns={columns}
      rows={rows}
    />
  )
}

export default Note3A
