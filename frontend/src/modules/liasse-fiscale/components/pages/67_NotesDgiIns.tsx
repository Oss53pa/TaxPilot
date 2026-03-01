import React from 'react'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'

const NotesDgiIns: React.FC<PageProps> = ({ entreprise, onNoteClick, ...props }) => {
  const columns: Column[] = [
    { key: 'code', label: 'NOTES', width: 100, align: 'center' },
    { key: 'designation', label: 'INTITULES', width: '50%', align: 'left' },
    { key: 'applicable', label: 'A', width: 40, align: 'center' },
    { key: 'non_applicable', label: 'N/A', width: 40, align: 'center' },
  ]

  const rows: Row[] = [
    { id: 'r1', cells: { code: 'COMP-CHARGES', designation: 'ETAT COMPLEMENTAIRE : DETAIL DES CHARGES', applicable: null, non_applicable: null } },
    { id: 'r2', cells: { code: 'COMP-TVA (1)', designation: 'ETAT COMPLEMENTAIRE : TVA', applicable: null, non_applicable: null } },
    { id: 'r3', cells: { code: 'COMP-TVA (2)', designation: 'ETAT COMPLEMENTAIRE : TVA SUPPORTEE NON DEDUCTIBLE', applicable: null, non_applicable: null } },
    { id: 'r4', cells: { code: 'SUPPL 1', designation: 'ELEMENTS STATISTIQUES UEMOA', applicable: null, non_applicable: null } },
    { id: 'r5', cells: { code: 'SUPPL 2', designation: 'REPARTITION DU RESULTAT FISCAL DES SOCIETES DE PERSONNES', applicable: null, non_applicable: null } },
    { id: 'r6', cells: { code: 'SUPPL 3', designation: 'COMPLEMENT INFORMATIONS ENTITES INDIVIDUELLES', applicable: null, non_applicable: null } },
    { id: 'r7', cells: { code: 'SUPPL 4', designation: 'TABLEAU DES AMORTISSEMENTS ET INVENTAIRE DES IMMOBILISATIONS', applicable: null, non_applicable: null } },
    { id: 'r8', cells: { code: 'SUPPL 5', designation: 'DETAIL DES FRAIS ACCESSOIRES SUR ACHATS', applicable: null, non_applicable: null } },
    { id: 'r9', cells: { code: 'SUPPL 6', designation: 'DETAIL DES AVANTAGES EN NATURE ET EN ESPECES', applicable: null, non_applicable: null } },
    { id: 'r10', cells: { code: 'SUPPL 7', designation: 'CREANCES ET DETTES ECHUES DE L\'EXERCICE', applicable: null, non_applicable: null } },
    { id: 'r11', cells: { code: 'BIC', designation: 'DETERMINATION DU BENEFICE INDUSTRIEL OU COMMERCIAL', applicable: null, non_applicable: null } },
    { id: 'r12', cells: { code: 'BNC', designation: 'DETERMINATION DU BENEFICE NON COMMERCIAL', applicable: null, non_applicable: null } },
    { id: 'r13', cells: { code: 'BA', designation: 'DETERMINATION DU BENEFICE AGRICOLE', applicable: null, non_applicable: null } },
    { id: 'r14', cells: { code: '301', designation: 'DECLARATION DES REMUNERATIONS VERSEES AUX SALARIES', applicable: null, non_applicable: null } },
    { id: 'r15', cells: { code: '302', designation: 'DECLARATION DES REMUNERATIONS VERSEES (NON SALARIES)', applicable: null, non_applicable: null } },
  ]

  return (
    <NoteTemplate
      {...props}
      entreprise={entreprise}
      onNoteClick={onNoteClick}
      noteLabel="NOTES DGI-INS"
      noteTitle="FICHE RECAPITULATIVE DES ETATS SUPPLEMENTAIRES DGI & INS PRESENTES"
      pageNumber="1"
      columns={columns}
      rows={rows}
    />
  )
}

export default NotesDgiIns
