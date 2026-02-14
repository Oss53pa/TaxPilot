/**
 * Bilan Simplifie SMT (Systeme Minimal de Tresorerie)
 * SYSCOHADA Revise 2017 - Entites < 60M FCFA
 * Actif (10 lignes) + Passif (10 lignes) sur une page
 */

import React, { memo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TextField,
  Chip,
} from '@mui/material'

interface BilanSMTProps {
  modeEdition?: boolean
}

const formatMontant = (val: number | null): string => {
  if (val === null || val === undefined) return ''
  return new Intl.NumberFormat('fr-FR').format(val)
}

const BilanSMT: React.FC<BilanSMTProps> = ({ modeEdition = false }) => {
  // Structure du Bilan Actif SMT
  const lignesActif = [
    { ref: '', libelle: 'ACTIF IMMOBILISE', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'AI_1', libelle: 'Immobilisations incorporelles', exerciceN: 0, exerciceN1: 0, comptes: ['21'] },
    { ref: 'AI_2', libelle: 'Immobilisations corporelles', exerciceN: 0, exerciceN1: 0, comptes: ['22', '23', '24'] },
    { ref: 'AI_3', libelle: 'Immobilisations financieres', exerciceN: 0, exerciceN1: 0, comptes: ['26', '27'] },
    { ref: '', libelle: 'TOTAL ACTIF IMMOBILISE', exerciceN: 0, exerciceN1: 0, isTotal: true },
    { ref: '', libelle: 'ACTIF CIRCULANT', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'AC_1', libelle: 'Stocks', exerciceN: 0, exerciceN1: 0, comptes: ['31-38'] },
    { ref: 'AC_2', libelle: 'Creances clients', exerciceN: 0, exerciceN1: 0, comptes: ['41'] },
    { ref: 'AC_3', libelle: 'Autres creances', exerciceN: 0, exerciceN1: 0, comptes: ['40', '42-49'] },
    { ref: 'AC_4', libelle: 'Charges constatees d\'avance', exerciceN: 0, exerciceN1: 0, comptes: ['476'] },
    { ref: '', libelle: 'TOTAL ACTIF CIRCULANT', exerciceN: 0, exerciceN1: 0, isTotal: true },
    { ref: '', libelle: 'TRESORERIE ACTIF', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'TA_1', libelle: 'Banques', exerciceN: 0, exerciceN1: 0, comptes: ['52', '53'] },
    { ref: 'TA_2', libelle: 'Caisse', exerciceN: 0, exerciceN1: 0, comptes: ['57'] },
    { ref: 'TA_3', libelle: 'Autres tresorerie', exerciceN: 0, exerciceN1: 0, comptes: ['50-58'] },
    { ref: '', libelle: 'TOTAL TRESORERIE ACTIF', exerciceN: 0, exerciceN1: 0, isTotal: true },
    { ref: '', libelle: 'TOTAL GENERAL ACTIF', exerciceN: 0, exerciceN1: 0, isTotalGeneral: true },
  ]

  // Structure du Bilan Passif SMT
  const lignesPassif = [
    { ref: '', libelle: 'CAPITAUX PROPRES', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'CP_1', libelle: 'Capital', exerciceN: 0, exerciceN1: 0, comptes: ['101-105'] },
    { ref: 'CP_2', libelle: 'Reserves', exerciceN: 0, exerciceN1: 0, comptes: ['11'] },
    { ref: 'CP_3', libelle: 'Report a nouveau', exerciceN: 0, exerciceN1: 0, comptes: ['12'] },
    { ref: 'CP_4', libelle: 'Resultat de l\'exercice', exerciceN: 0, exerciceN1: 0, comptes: ['13'] },
    { ref: 'CP_5', libelle: 'Autres capitaux propres', exerciceN: 0, exerciceN1: 0, comptes: ['14', '106'] },
    { ref: '', libelle: 'TOTAL CAPITAUX PROPRES', exerciceN: 0, exerciceN1: 0, isTotal: true },
    { ref: '', libelle: 'DETTES FINANCIERES', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'DF_1', libelle: 'Emprunts et dettes financieres', exerciceN: 0, exerciceN1: 0, comptes: ['16', '17'] },
    { ref: '', libelle: 'TOTAL DETTES FINANCIERES', exerciceN: 0, exerciceN1: 0, isTotal: true },
    { ref: '', libelle: 'PASSIF CIRCULANT', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'PC_1', libelle: 'Fournisseurs', exerciceN: 0, exerciceN1: 0, comptes: ['401-408'] },
    { ref: 'PC_2', libelle: 'Dettes fiscales et sociales', exerciceN: 0, exerciceN1: 0, comptes: ['42-44'] },
    { ref: 'PC_3', libelle: 'Autres dettes', exerciceN: 0, exerciceN1: 0, comptes: ['45-48'] },
    { ref: '', libelle: 'TOTAL PASSIF CIRCULANT', exerciceN: 0, exerciceN1: 0, isTotal: true },
    { ref: '', libelle: 'TRESORERIE PASSIF', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'TP_1', libelle: 'Tresorerie passif', exerciceN: 0, exerciceN1: 0, comptes: ['52'] },
    { ref: '', libelle: 'TOTAL TRESORERIE PASSIF', exerciceN: 0, exerciceN1: 0, isTotal: true },
    { ref: '', libelle: 'TOTAL GENERAL PASSIF', exerciceN: 0, exerciceN1: 0, isTotalGeneral: true },
  ]

  const renderTable = (title: string, lignes: typeof lignesActif) => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">{title}</Typography>
        <Chip label="SMT - Systeme Minimal de Tresorerie" size="small" sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
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
              <TableRow
                key={idx}
                sx={{
                  bgcolor: isHeader ? 'primary.50' : isTotalGeneral ? 'warning.50' : isTotal ? 'grey.50' : 'white',
                  '& td': {
                    fontWeight: (isHeader || isTotal || isTotalGeneral) ? 'bold' : 'normal',
                    fontSize: isTotalGeneral ? '0.95rem' : isHeader ? '0.9rem' : '0.85rem',
                    borderBottom: isTotalGeneral ? '3px double' : isTotal ? '2px solid #ccc' : undefined,
                    color: isHeader ? 'primary.main' : isTotalGeneral ? 'warning.dark' : undefined,
                  },
                }}
              >
                <TableCell>{ligne.ref}</TableCell>
                <TableCell>{ligne.libelle}</TableCell>
                <TableCell align="right">
                  {ligne.exerciceN !== null ? (
                    modeEdition && !isHeader && !isTotal && !isTotalGeneral ? (
                      <TextField
                        size="small"
                        type="number"
                        defaultValue={ligne.exerciceN}
                        sx={{ width: 130 }}
                        InputProps={{ sx: { fontSize: '0.85rem' } }}
                      />
                    ) : (
                      formatMontant(ligne.exerciceN)
                    )
                  ) : ''}
                </TableCell>
                <TableCell align="right">
                  {ligne.exerciceN1 !== null ? (
                    modeEdition && !isHeader && !isTotal && !isTotalGeneral ? (
                      <TextField
                        size="small"
                        type="number"
                        defaultValue={ligne.exerciceN1}
                        sx={{ width: 130 }}
                        InputProps={{ sx: { fontSize: '0.85rem' } }}
                      />
                    ) : (
                      formatMontant(ligne.exerciceN1)
                    )
                  ) : ''}
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
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Bilan Simplifie - SMT
      </Typography>
      {renderTable('ACTIF', lignesActif)}
      {renderTable('PASSIF', lignesPassif)}
    </Box>
  )
}

export default memo(BilanSMT)
