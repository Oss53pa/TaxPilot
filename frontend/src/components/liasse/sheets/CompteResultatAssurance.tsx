/**
 * Compte de Resultat Assurance - Plan CIMA
 * Compte technique (primes/sinistres) + Compte non-technique
 */

import React, { memo } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, TextField, Chip,
} from '@mui/material'

interface CompteResultatAssuranceProps {
  modeEdition?: boolean
}

const formatMontant = (val: number | null): string => {
  if (val === null || val === undefined) return ''
  return new Intl.NumberFormat('fr-FR').format(val)
}

const CompteResultatAssurance: React.FC<CompteResultatAssuranceProps> = ({ modeEdition = false }) => {
  const lignesTechnique = [
    { ref: '', libelle: 'PRODUITS TECHNIQUES', montantN: null, montantN1: null, isHeader: true },
    { ref: 'PT_1', libelle: 'Primes emises', montantN: 0, montantN1: 0 },
    { ref: 'PT_2', libelle: 'Variation provisions primes non acquises', montantN: 0, montantN1: 0 },
    { ref: 'PT_3', libelle: 'Primes acquises', montantN: 0, montantN1: 0 },
    { ref: 'PT_4', libelle: 'Produits des placements', montantN: 0, montantN1: 0 },
    { ref: 'PT_5', libelle: 'Ajustement ACAV (vie)', montantN: 0, montantN1: 0 },
    { ref: 'PT_6', libelle: 'Produits de reassurance cedee', montantN: 0, montantN1: 0 },
    { ref: 'PT_7', libelle: 'Autres produits techniques', montantN: 0, montantN1: 0 },
    { ref: '', libelle: 'TOTAL PRODUITS TECHNIQUES', montantN: 0, montantN1: 0, isTotal: true },

    { ref: '', libelle: 'CHARGES TECHNIQUES', montantN: null, montantN1: null, isHeader: true },
    { ref: 'CT_1', libelle: 'Sinistres payes', montantN: 0, montantN1: 0 },
    { ref: 'CT_2', libelle: 'Charges des placements', montantN: 0, montantN1: 0 },
    { ref: 'CT_3', libelle: 'Charges de reassurance cedee', montantN: 0, montantN1: 0 },
    { ref: 'CT_4', libelle: 'Dotations provisions techniques', montantN: 0, montantN1: 0 },
    { ref: 'CT_5', libelle: 'Frais d\'acquisition', montantN: 0, montantN1: 0 },
    { ref: 'CT_6', libelle: 'Frais d\'administration', montantN: 0, montantN1: 0 },
    { ref: 'CT_7', libelle: 'Autres charges techniques', montantN: 0, montantN1: 0 },
    { ref: '', libelle: 'TOTAL CHARGES TECHNIQUES', montantN: 0, montantN1: 0, isTotal: true },

    { ref: 'RT', libelle: 'RESULTAT TECHNIQUE', montantN: 0, montantN1: 0, isTotalGeneral: true },
  ]

  const lignesNonTechnique = [
    { ref: '', libelle: 'COMPTE NON-TECHNIQUE', montantN: null, montantN1: null, isHeader: true },
    { ref: 'PNT_1', libelle: 'Produits non techniques courants', montantN: 0, montantN1: 0 },
    { ref: 'PNT_2', libelle: 'Reprises et produits exceptionnels', montantN: 0, montantN1: 0 },
    { ref: 'CNT_1', libelle: 'Charges non techniques courantes', montantN: 0, montantN1: 0 },
    { ref: 'CNT_2', libelle: 'Dotations amortissements et provisions', montantN: 0, montantN1: 0 },
    { ref: 'CNT_3', libelle: 'Charges exceptionnelles et impot', montantN: 0, montantN1: 0 },
    { ref: 'RNT', libelle: 'RESULTAT NON-TECHNIQUE', montantN: 0, montantN1: 0, isTotal: true },
    { ref: 'RN', libelle: 'RESULTAT NET', montantN: 0, montantN1: 0, isTotalGeneral: true },
  ]

  const renderSection = (title: string, lignes: typeof lignesTechnique) => (
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
                  {ligne.montantN !== null ? (modeEdition && !isHeader && !isTotal && !isTotalGeneral ? (
                    <TextField size="small" type="number" defaultValue={ligne.montantN} sx={{ width: 130 }} InputProps={{ sx: { fontSize: '0.85rem' } }} />
                  ) : formatMontant(ligne.montantN)) : ''}
                </TableCell>
                <TableCell align="right">
                  {ligne.montantN1 !== null ? (modeEdition && !isHeader && !isTotal && !isTotalGeneral ? (
                    <TextField size="small" type="number" defaultValue={ligne.montantN1} sx={{ width: 130 }} InputProps={{ sx: { fontSize: '0.85rem' } }} />
                  ) : formatMontant(ligne.montantN1)) : ''}
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
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Compte de Resultat Assurance - CIMA</Typography>
      {renderSection('COMPTE TECHNIQUE', lignesTechnique)}
      {renderSection('COMPTE NON-TECHNIQUE ET RESULTAT', lignesNonTechnique)}
    </Box>
  )
}

export default memo(CompteResultatAssurance)
