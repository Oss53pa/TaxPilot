import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const NOTES = [
  { id: 'r1', code: 'COMP-CHARGES', label: 'ETAT COMPLEMENTAIRE : DETAIL DES CHARGES' },
  { id: 'r2', code: 'COMP-TVA (1)', label: 'ETAT COMPLEMENTAIRE : TVA' },
  { id: 'r3', code: 'COMP-TVA (2)', label: 'ETAT COMPLEMENTAIRE : TVA SUPPORTEE NON DEDUCTIBLE' },
  { id: 'r4', code: 'SUPPL 1', label: 'ELEMENTS STATISTIQUES UEMOA' },
  { id: 'r5', code: 'SUPPL 2', label: 'REPARTITION DU RESULTAT FISCAL DES SOCIETES DE PERSONNES' },
  { id: 'r6', code: 'SUPPL 3', label: 'COMPLEMENT INFORMATIONS ENTITES INDIVIDUELLES' },
  { id: 'r7', code: 'SUPPL 4', label: 'TABLEAU DES AMORTISSEMENTS ET INVENTAIRE DES IMMOBILISATIONS' },
  { id: 'r8', code: 'SUPPL 5', label: 'DETAIL DES FRAIS ACCESSOIRES SUR ACHATS' },
  { id: 'r9', code: 'SUPPL 6', label: 'DETAIL DES AVANTAGES EN NATURE ET EN ESPECES' },
  { id: 'r10', code: 'SUPPL 7', label: 'CREANCES ET DETTES ECHUES DE L\'EXERCICE' },
  { id: 'r11', code: 'BIC', label: 'DETERMINATION DU BENEFICE INDUSTRIEL OU COMMERCIAL' },
  { id: 'r12', code: 'BNC', label: 'DETERMINATION DU BENEFICE NON COMMERCIAL' },
  { id: 'r13', code: 'BA', label: 'DETERMINATION DU BENEFICE AGRICOLE' },
  { id: 'r14', code: '301', label: 'DECLARATION DES REMUNERATIONS VERSEES AUX SALARIES' },
  { id: 'r15', code: '302', label: 'DECLARATION DES REMUNERATIONS VERSEES (NON SALARIES)' },
]

const NotesDgiIns: React.FC<PageProps> = ({ entreprise, onNoteClick, ...props }) => {
  const columns: Column[] = [
    { key: 'code', label: 'NOTES', width: 100, align: 'center' },
    { key: 'designation', label: 'INTITULES', width: '50%', align: 'left' },
    { key: 'applicable', label: 'A', width: 40, align: 'center', editable: true, type: 'text' },
    { key: 'non_applicable', label: 'N/A', width: 40, align: 'center', editable: true, type: 'text' },
  ]

  const baseRows: Row[] = NOTES.map(n => ({
    id: n.id,
    cells: { code: n.code, designation: n.label, applicable: null, non_applicable: null },
  }))

  const { mergedRows, setCell } = useLiasseManualData('notes-dgi-ins', baseRows)

  return (
    <NoteTemplate
      {...props}
      entreprise={entreprise}
      onNoteClick={onNoteClick}
      noteLabel="NOTES DGI-INS"
      noteTitle="FICHE RECAPITULATIVE DES ETATS SUPPLEMENTAIRES DGI & INS PRESENTES"
      pageNumber="1"
      columns={columns}
      rows={mergedRows}
      onCellChange={setCell}
    />
  )
}

export default NotesDgiIns
