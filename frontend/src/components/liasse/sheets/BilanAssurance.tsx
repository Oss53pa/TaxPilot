/**
 * Bilan Assurance - Plan CIMA
 * Placements, provisions techniques, part reassureurs
 */

import React, { memo } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, TextField, Chip,
} from '@mui/material'

interface BilanAssuranceProps {
  modeEdition?: boolean
}

const formatMontant = (val: number | null): string => {
  if (val === null || val === undefined) return ''
  return new Intl.NumberFormat('fr-FR').format(val)
}

const BilanAssurance: React.FC<BilanAssuranceProps> = ({ modeEdition = false }) => {
  const lignesActif = [
    { ref: '', libelle: 'PLACEMENTS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'AA_1', libelle: 'Immeubles', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_2', libelle: 'Actions et parts sociales', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_3', libelle: 'Obligations et bons', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_4', libelle: 'Prets et effets assimiles', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_5', libelle: 'Depots en banque et CCP', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_6', libelle: 'Autres placements', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL PLACEMENTS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'PART DES REASSUREURS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'AA_7', libelle: 'Part reassureurs - Primes non acquises', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_8', libelle: 'Part reassureurs - Sinistres', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_9', libelle: 'Part reassureurs - Provisions mathematiques', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_10', libelle: 'Part reassureurs - Autres provisions', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL PART REASSUREURS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'CREANCES', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'AA_11', libelle: 'Creances d\'operations d\'assurance', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_12', libelle: 'Creances d\'operations de reassurance', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_13', libelle: 'Autres creances', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_14', libelle: 'Personnel et comptes rattaches', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL CREANCES', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'AUTRES ACTIFS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'AA_15', libelle: 'Comptes de regularisation actif', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AA_16', libelle: 'Tresorerie', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL AUTRES ACTIFS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TOTAL GENERAL ACTIF', exerciceN: 0, exerciceN1: 0, isTotalGeneral: true },
  ]

  const lignesPassif = [
    { ref: '', libelle: 'CAPITAUX PROPRES', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'AP_1', libelle: 'Capital ou fonds d\'etablissement', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AP_2', libelle: 'Reserves', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AP_3', libelle: 'Report a nouveau', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AP_4', libelle: 'Resultat de l\'exercice', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL CAPITAUX PROPRES', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'PROVISIONS TECHNIQUES', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'AP_5', libelle: 'Provision pour primes non acquises', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AP_6', libelle: 'Provision pour sinistres a payer', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AP_7', libelle: 'Provision mathematique (vie)', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AP_8', libelle: 'Provision participation benefices', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AP_9', libelle: 'Provision d\'egalisation et autres', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL PROVISIONS TECHNIQUES', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'DETTES', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'AP_10', libelle: 'Dettes d\'operations d\'assurance', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AP_11', libelle: 'Dettes d\'operations de reassurance', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AP_12', libelle: 'Autres dettes', exerciceN: 0, exerciceN1: 0 },
    { ref: 'AP_13', libelle: 'Comptes de regularisation passif', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL DETTES', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TOTAL GENERAL PASSIF', exerciceN: 0, exerciceN1: 0, isTotalGeneral: true },
  ]

  const renderTable = (title: string, lignes: typeof lignesActif) => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Box sx={{ p: 2, bgcolor: '#6a1b9a', color: 'white' }}>
        <Typography variant="h6">{title}</Typography>
        <Chip label="ASSURANCE - CIMA" size="small" sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.100' }}>
            <TableCell sx={{ width: 80, fontWeight: 'bold' }}>Ref</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Libelle</TableCell>
            <TableCell align="right" sx={{ width: 150, fontWeight: 'bold' }}>Exercice N</TableCell>
            <TableCell align="right" sx={{ width: 150, fontWeight: 'bold' }}>Exercice N-1</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {lignes.map((ligne, idx) => {
            const isHeader = 'isHeader' in ligne && ligne.isHeader
            const isTotal = 'isTotal' in ligne && ligne.isTotal
            const isTotalGeneral = 'isTotalGeneral' in ligne && ligne.isTotalGeneral
            return (
              <TableRow key={idx} sx={{
                bgcolor: isHeader ? '#f3e5f5' : isTotalGeneral ? '#fff3e0' : isTotal ? 'grey.50' : 'white',
                '& td': {
                  fontWeight: (isHeader || isTotal || isTotalGeneral) ? 'bold' : 'normal',
                  fontSize: isTotalGeneral ? '0.95rem' : '0.85rem',
                  borderBottom: isTotalGeneral ? '3px double' : isTotal ? '2px solid #ccc' : undefined,
                  color: isHeader ? '#6a1b9a' : isTotalGeneral ? '#e65100' : undefined,
                },
              }}>
                <TableCell>{ligne.ref}</TableCell>
                <TableCell>{ligne.libelle}</TableCell>
                <TableCell align="right">
                  {ligne.exerciceN !== null ? (modeEdition && !isHeader && !isTotal && !isTotalGeneral ? (
                    <TextField size="small" type="number" defaultValue={ligne.exerciceN} sx={{ width: 130 }} InputProps={{ sx: { fontSize: '0.85rem' } }} />
                  ) : formatMontant(ligne.exerciceN)) : ''}
                </TableCell>
                <TableCell align="right">
                  {ligne.exerciceN1 !== null ? (modeEdition && !isHeader && !isTotal && !isTotalGeneral ? (
                    <TextField size="small" type="number" defaultValue={ligne.exerciceN1} sx={{ width: 130 }} InputProps={{ sx: { fontSize: '0.85rem' } }} />
                  ) : formatMontant(ligne.exerciceN1)) : ''}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Bilan Assurance - CIMA</Typography>
      {renderTable('ACTIF ASSURANCE', lignesActif)}
      {renderTable('PASSIF ASSURANCE', lignesPassif)}
    </Box>
  )
}

export default memo(BilanAssurance)
