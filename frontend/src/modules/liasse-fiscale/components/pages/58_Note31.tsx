import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const Note31: React.FC<PageProps> = ({ entreprise, onNoteClick, ...props }) => {
  const columns: Column[] = [
    { key: 'designation', label: 'NATURE DES INDICATIONS', width: '40%', align: 'left' },
    { key: 'n', label: 'N', align: 'right' },
    { key: 'n1', label: 'N-1', align: 'right' },
    { key: 'n2', label: 'N-2', align: 'right' },
    { key: 'n3', label: 'N-3', align: 'right' },
    { key: 'n4', label: 'N-4', align: 'right' },
  ]

  const rows: Row[] = [
    // ── Section 1: Structure du capital a la cloture de l'exercice (2) ──
    { id: 'sec1', cells: { designation: 'STRUCTURE DU CAPITAL A LA CLOTURE DE L\'EXERCICE (2)' }, isSectionHeader: true },
    { id: 'r1', cells: { designation: 'Capital social', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'r2', cells: { designation: 'Actions ordinaires', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'r3', cells: { designation: 'Actions a dividendes prioritaires (A.D.P) sans droit de vote', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'r4', cells: { designation: 'Actions nouvelles a emettre :', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'r5', cells: { designation: '- par conversion d\'obligations', n: null, n1: null, n2: null, n3: null, n4: null }, indent: 1 },
    { id: 'r6', cells: { designation: '- par exercice de droits de souscription', n: null, n1: null, n2: null, n3: null, n4: null }, indent: 1 },
    { id: 'st1', cells: { designation: 'SOUS TOTAL (1)', n: null, n1: null, n2: null, n3: null, n4: null }, isSubtotal: true, bold: true },

    // ── Section 2: Operations et resultats de l'exercice (3) ──
    { id: 'sec2', cells: { designation: 'OPERATIONS ET RESULTATS DE L\'EXERCICE (3)' }, isSectionHeader: true },
    { id: 'r7', cells: { designation: 'Chiffre d\'affaires hors taxes', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'r8', cells: { designation: 'Resultat des activites ordinaires (R.A.O) hors dotations et reprises', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'r9', cells: { designation: 'Participation des travailleurs aux benefices', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'r10', cells: { designation: 'Impot sur le resultat', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'r11', cells: { designation: 'Resultat net', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'st2', cells: { designation: 'SOUS TOTAL (2)', n: null, n1: null, n2: null, n3: null, n4: null }, isSubtotal: true, bold: true },

    // ── Section 3: Resultat par action (en FCFA) ──
    { id: 'sec3', cells: { designation: 'RESULTAT PAR ACTION (EN FCFA)' }, isSectionHeader: true },
    { id: 'r12', cells: { designation: 'Resultat net par action', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'r13', cells: { designation: 'Dividende par action', n: null, n1: null, n2: null, n3: null, n4: null } },

    // ── Section 4: Personnel ──
    { id: 'sec4', cells: { designation: 'PERSONNEL' }, isSectionHeader: true },
    { id: 'r14', cells: { designation: 'Effectif moyen', n: null, n1: null, n2: null, n3: null, n4: null } },
    { id: 'r15', cells: { designation: 'Masse salariale', n: null, n1: null, n2: null, n3: null, n4: null } },
  ]

  return (
    <NoteTemplate
      {...props}
      entreprise={entreprise}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 31"
      noteTitle="NOTE 31 : REPARTITION DU RESULTAT ET AUTRES ELEMENTS CARACTERISTIQUES DES CINQ DERNIERS EXERCICES"
      pageNumber="54"
      columns={columns}
      rows={rows}
    >
      {/* Footnotes */}
      <div style={{ marginTop: 12, fontSize: 9, color: '#666' }}>
        <p style={{ margin: '2px 0' }}>(1) Completer ces colonnes au fur et a mesure</p>
        <p style={{ margin: '2px 0' }}>(2) En nombre de titres ou parts</p>
        <p style={{ margin: '2px 0' }}>(3) En valeur</p>
      </div>
    </NoteTemplate>
  )
}

export default Note31
