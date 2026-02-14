/**
 * Bilan EBNL (Entites a But Non Lucratif) - SYCEBNL 2024
 * Fonds associatifs, subventions, contributions
 */

import React, { memo } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, TextField, Chip,
} from '@mui/material'

interface BilanEBNLProps {
  modeEdition?: boolean
}

const formatMontant = (val: number | null): string => {
  if (val === null || val === undefined) return ''
  return new Intl.NumberFormat('fr-FR').format(val)
}

const BilanEBNL: React.FC<BilanEBNLProps> = ({ modeEdition = false }) => {
  const lignesActif = [
    { ref: '', libelle: 'ACTIF IMMOBILISE', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'EA_1', libelle: 'Immobilisations incorporelles', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EA_2', libelle: 'Terrains', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EA_3', libelle: 'Batiments et constructions', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EA_4', libelle: 'Materiel et equipements', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EA_5', libelle: 'Avances et acomptes', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EA_6', libelle: 'Immobilisations financieres', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL ACTIF IMMOBILISE', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'ACTIF CIRCULANT', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'EA_7', libelle: 'Stocks', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EA_8', libelle: 'Creances (donateurs, bailleurs, adherents)', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EA_9', libelle: 'Autres creances', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL ACTIF CIRCULANT', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TRESORERIE', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'EA_10', libelle: 'Tresorerie actif', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL TRESORERIE', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TOTAL GENERAL ACTIF', exerciceN: 0, exerciceN1: 0, isTotalGeneral: true },
  ]

  const lignesPassif = [
    { ref: '', libelle: 'FONDS ASSOCIATIFS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'EP_1', libelle: 'Fonds associatifs sans droit de reprise', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EP_2', libelle: 'Fonds associatifs avec droit de reprise', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EP_3', libelle: 'Ecarts de reevaluation', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EP_4', libelle: 'Reserves', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EP_5', libelle: 'Report a nouveau', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EP_6', libelle: 'Resultat de l\'exercice (excedent/deficit)', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EP_7', libelle: 'Subventions d\'investissement', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EP_8', libelle: 'Provisions reglementees et fonds dedies', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL FONDS ASSOCIATIFS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'DETTES', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'EP_9', libelle: 'Emprunts et dettes financieres', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EP_10', libelle: 'Fournisseurs', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EP_11', libelle: 'Dettes fiscales et sociales', exerciceN: 0, exerciceN1: 0 },
    { ref: 'EP_12', libelle: 'Autres dettes', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL DETTES', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TRESORERIE PASSIF', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'EP_13', libelle: 'Tresorerie passif', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL TRESORERIE PASSIF', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TOTAL GENERAL PASSIF', exerciceN: 0, exerciceN1: 0, isTotalGeneral: true },
  ]

  const renderTable = (title: string, lignes: typeof lignesActif) => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Box sx={{ p: 2, bgcolor: '#ef6c00', color: 'white' }}>
        <Typography variant="h6">{title}</Typography>
        <Chip label="EBNL - SYCEBNL 2024" size="small" sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
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
                bgcolor: isHeader ? '#fff3e0' : isTotalGeneral ? '#fce4ec' : isTotal ? 'grey.50' : 'white',
                '& td': {
                  fontWeight: (isHeader || isTotal || isTotalGeneral) ? 'bold' : 'normal',
                  fontSize: isTotalGeneral ? '0.95rem' : '0.85rem',
                  borderBottom: isTotalGeneral ? '3px double' : isTotal ? '2px solid #ccc' : undefined,
                  color: isHeader ? '#ef6c00' : isTotalGeneral ? '#c62828' : undefined,
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
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Bilan EBNL - SYCEBNL 2024</Typography>
      {renderTable('ACTIF EBNL', lignesActif)}
      {renderTable('PASSIF EBNL', lignesPassif)}
    </Box>
  )
}

export default memo(BilanEBNL)
