import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import LiasseTable from '../LiasseTable'
import type { PageProps } from '../../types'
import type { Column, Row } from '../LiasseTable'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const FicheR3: React.FC<PageProps> = ({ entreprise }) => {
  // ── Dirigeants table ──
  const dirColumns: Column[] = [
    { key: 'nom_prenoms', label: 'Nom et Prenoms', width: '20%', align: 'left' },
    { key: 'nationalite', label: 'Nationalite', width: '10%', align: 'left', editable: true, type: 'text' },
    { key: 'autres_nat', label: 'Autres nationalites (2)', width: '10%', align: 'left', editable: true, type: 'text' },
    { key: 'qualite', label: 'Qualite', width: '10%', align: 'left' },
    { key: 'nif', label: 'N° identification fiscale', width: '12%', align: 'left', editable: true, type: 'text' },
    { key: 'adresse', label: 'Adresse (BP, ville, pays, email)', width: '38%', align: 'left' },
  ]

  const dirigeants = entreprise.dirigeants?.length > 0
    ? entreprise.dirigeants
    : [{ qualite: '', nom: '', prenoms: '', adresse: '', date_nomination: '', duree_mandat: '' }]

  const dirBaseRows: Row[] = Array.from({ length: 10 }, (_, i) => {
    const d = dirigeants[i]
    return {
      id: `d-${i}`,
      cells: {
        nom_prenoms: d ? `${d.nom} ${d.prenoms}`.trim() : null,
        nationalite: null,
        autres_nat: null,
        qualite: d?.qualite || null,
        nif: null,
        adresse: d?.adresse || null,
      },
    }
  })

  // ── Conseil d'administration table ──
  const caColumns: Column[] = [
    { key: 'nom_prenoms', label: 'Nom et Prenoms', width: '22%', align: 'left', editable: true, type: 'text' },
    { key: 'structure', label: 'Structure representee', width: '20%', align: 'left', editable: true, type: 'text' },
    { key: 'qualite', label: 'Qualite', width: '12%', align: 'left', editable: true, type: 'text' },
    { key: 'adresse', label: 'Adresse (BP, ville, pays, email)', width: '46%', align: 'left', editable: true, type: 'text' },
  ]

  const caBaseRows: Row[] = Array.from({ length: 9 }, (_, i) => ({
    id: `ca-${i}`,
    cells: { nom_prenoms: null, structure: null, qualite: null, adresse: null },
  }))

  const { mergedRows: dirRows, setCell: setDirCell } = useLiasseManualData('fiche-r3-dir', dirBaseRows)
  const { mergedRows: caRows, setCell: setCaCell } = useLiasseManualData('fiche-r3-ca', caBaseRows)

  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} noteLabel="FICHE R3" pageNumber="6" />

      <Typography sx={{ fontSize: '9pt', fontWeight: 700, mb: 1.5, fontFamily: 'inherit' }}>
        FICHE R3 : FICHE D'IDENTIFICATION ET RENSEIGNEMENTS DIVERS 3
      </Typography>

      <LiasseTable
        columns={dirColumns}
        rows={dirRows}
        title="DIRIGEANTS (1)"
        compact
        onCellChange={setDirCell}
      />

      <Box sx={{ fontSize: '6.5pt', color: '#737373', mb: 2, mt: 0.5, fontFamily: 'inherit' }}>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (1) Dirigeants = President Directeur General, Directeur General, Administrateur General, Gerant, Autres.
        </Typography>
        <Typography sx={{ fontSize: '6.5pt', fontFamily: 'inherit' }}>
          (2) En cas de double nationalite
        </Typography>
      </Box>

      <LiasseTable
        columns={caColumns}
        rows={caRows}
        title="MEMBRES DU CONSEIL D'ADMINISTRATION"
        compact
        onCellChange={setCaCell}
      />
    </Box>
  )
}

export default FicheR3
