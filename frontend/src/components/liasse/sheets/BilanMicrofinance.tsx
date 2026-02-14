/**
 * Bilan SFD (Systemes Financiers Decentralises)
 * Referentiel BCEAO/COBAC pour les institutions de microfinance
 */

import React, { memo } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, TextField, Chip,
} from '@mui/material'

interface BilanMicrofinanceProps {
  modeEdition?: boolean
}

const formatMontant = (val: number | null): string => {
  if (val === null || val === undefined) return ''
  return new Intl.NumberFormat('fr-FR').format(val)
}

const BilanMicrofinance: React.FC<BilanMicrofinanceProps> = ({ modeEdition = false }) => {
  const lignesActif = [
    { ref: '', libelle: 'TRESORERIE', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'MA_1', libelle: 'Caisse', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_2', libelle: 'Banques et correspondants', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_3', libelle: 'Placements de tresorerie', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_4', libelle: 'Prets interbancaires', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL TRESORERIE', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'OPERATIONS AVEC MEMBRES/CLIENTS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'MA_5', libelle: 'Credits aux membres/clients', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_6', libelle: 'Credits a court terme', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_7', libelle: 'Credits a moyen et long terme', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_8', libelle: 'Creances en souffrance', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL OPERATIONS MEMBRES', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'AUTRES ACTIFS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'MA_9', libelle: 'Titres de placement', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_10', libelle: 'Debiteurs divers', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_11', libelle: 'Comptes de regularisation', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL AUTRES ACTIFS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'IMMOBILISATIONS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'MA_12', libelle: 'Immobilisations incorporelles', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_13', libelle: 'Immobilisations corporelles', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_14', libelle: 'Immobilisations financieres', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MA_15', libelle: 'Immobilisations en cours', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL IMMOBILISATIONS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TOTAL GENERAL ACTIF', exerciceN: 0, exerciceN1: 0, isTotalGeneral: true },
  ]

  const lignesPassif = [
    { ref: '', libelle: 'TRESORERIE PASSIF', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'MP_1', libelle: 'Emprunts bancaires', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MP_2', libelle: 'Refinancements', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL TRESORERIE PASSIF', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'DEPOTS MEMBRES/CLIENTS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'MP_3', libelle: 'Depots a vue', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MP_4', libelle: 'Depots a terme', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MP_5', libelle: 'Epargne obligatoire', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MP_6', libelle: 'Autres depots', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL DEPOTS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'AUTRES PASSIFS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'MP_7', libelle: 'Crediteurs divers', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MP_8', libelle: 'Comptes de regularisation', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL AUTRES PASSIFS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'CAPITAUX PERMANENTS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'MP_9', libelle: 'Capital / Dotations / Parts sociales', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MP_10', libelle: 'Reserves', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MP_11', libelle: 'Report a nouveau', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MP_12', libelle: 'Resultat de l\'exercice', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MP_13', libelle: 'Provisions pour risques et charges', exerciceN: 0, exerciceN1: 0 },
    { ref: 'MP_14', libelle: 'Subventions et fonds affectes', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL CAPITAUX PERMANENTS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TOTAL GENERAL PASSIF', exerciceN: 0, exerciceN1: 0, isTotalGeneral: true },
  ]

  const renderTable = (title: string, lignes: typeof lignesActif) => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Box sx={{ p: 2, bgcolor: '#2e7d32', color: 'white' }}>
        <Typography variant="h6">{title}</Typography>
        <Chip label="MICROFINANCE - SFD" size="small" sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
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
                bgcolor: isHeader ? '#e8f5e9' : isTotalGeneral ? '#fff3e0' : isTotal ? 'grey.50' : 'white',
                '& td': {
                  fontWeight: (isHeader || isTotal || isTotalGeneral) ? 'bold' : 'normal',
                  fontSize: isTotalGeneral ? '0.95rem' : '0.85rem',
                  borderBottom: isTotalGeneral ? '3px double' : isTotal ? '2px solid #ccc' : undefined,
                  color: isHeader ? '#2e7d32' : isTotalGeneral ? '#e65100' : undefined,
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
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Bilan SFD - Microfinance</Typography>
      {renderTable('ACTIF SFD', lignesActif)}
      {renderTable('PASSIF SFD', lignesPassif)}
    </Box>
  )
}

export default memo(BilanMicrofinance)
