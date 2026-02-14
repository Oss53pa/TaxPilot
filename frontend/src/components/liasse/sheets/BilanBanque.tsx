/**
 * Bilan Bancaire - Plan PCEC (COBAC) / PCB (BCEAO)
 * Structure specifique pour les etablissements de credit
 */

import React, { memo } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, TextField, Chip,
} from '@mui/material'

interface BilanBanqueProps {
  modeEdition?: boolean
}

const formatMontant = (val: number | null): string => {
  if (val === null || val === undefined) return ''
  return new Intl.NumberFormat('fr-FR').format(val)
}

const BilanBanque: React.FC<BilanBanqueProps> = ({ modeEdition = false }) => {
  const lignesActif = [
    { ref: '', libelle: 'TRESORERIE ET INTERBANCAIRE', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'BA_1', libelle: 'Caisse et banques centrales', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_2', libelle: 'Effets publics et assimiles', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_3', libelle: 'Creances sur etablissements de credit', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_4', libelle: 'Prets et avances interbancaires', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL TRESORERIE ET INTERBANCAIRE', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'OPERATIONS AVEC LA CLIENTELE', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'BA_5', libelle: 'Credits a la clientele', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_6', libelle: 'Comptes ordinaires debiteurs', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_7', libelle: 'Affacturage et credit-bail', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_8', libelle: 'Creances impayees et douteuses', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL OPERATIONS CLIENTELE', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'OPERATIONS SUR TITRES', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'BA_9', libelle: 'Titres de transaction', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_10', libelle: 'Titres de placement', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_11', libelle: 'Titres d\'investissement', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_12', libelle: 'Operations diverses sur titres', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL OPERATIONS SUR TITRES', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'VALEURS IMMOBILISEES', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'BA_13', libelle: 'Immobilisations incorporelles', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_14', libelle: 'Immobilisations corporelles', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_15', libelle: 'Immobilisations financieres', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BA_16', libelle: 'Actionnaires ou associes', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL VALEURS IMMOBILISEES', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TOTAL GENERAL ACTIF', exerciceN: 0, exerciceN1: 0, isTotalGeneral: true },
  ]

  const lignesPassif = [
    { ref: '', libelle: 'TRESORERIE ET INTERBANCAIRE PASSIF', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'BP_1', libelle: 'Banques centrales (crediteur)', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_2', libelle: 'Dettes envers etablissements de credit', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_3', libelle: 'Emprunts interbancaires', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL TRESORERIE PASSIF', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'DEPOTS CLIENTELE', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'BP_4', libelle: 'Comptes d\'epargne', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_5', libelle: 'Depots a vue', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_6', libelle: 'Depots a terme', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_7', libelle: 'Autres depots et comptes crediteurs', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL DEPOTS CLIENTELE', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TITRES EMIS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'BP_8', libelle: 'Titres de creances negociables emis', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_9', libelle: 'Obligations emises', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_10', libelle: 'Autres dettes sur titres', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL TITRES EMIS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'CAPITAUX PERMANENTS', exerciceN: null, exerciceN1: null, isHeader: true },
    { ref: 'BP_11', libelle: 'Capital', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_12', libelle: 'Reserves et primes', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_13', libelle: 'Report a nouveau', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_14', libelle: 'Resultat de l\'exercice', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_15', libelle: 'Provisions pour risques', exerciceN: 0, exerciceN1: 0 },
    { ref: 'BP_16', libelle: 'Fonds pour risques bancaires generaux', exerciceN: 0, exerciceN1: 0 },
    { ref: '', libelle: 'TOTAL CAPITAUX PERMANENTS', exerciceN: 0, exerciceN1: 0, isTotal: true },

    { ref: '', libelle: 'TOTAL GENERAL PASSIF', exerciceN: 0, exerciceN1: 0, isTotalGeneral: true },
  ]

  const renderTable = (title: string, lignes: typeof lignesActif) => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Box sx={{ p: 2, bgcolor: '#1565c0', color: 'white' }}>
        <Typography variant="h6">{title}</Typography>
        <Chip label="BANQUE - PCEC/PCB" size="small" sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
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
                bgcolor: isHeader ? '#e3f2fd' : isTotalGeneral ? '#fff3e0' : isTotal ? 'grey.50' : 'white',
                '& td': {
                  fontWeight: (isHeader || isTotal || isTotalGeneral) ? 'bold' : 'normal',
                  fontSize: isTotalGeneral ? '0.95rem' : '0.85rem',
                  borderBottom: isTotalGeneral ? '3px double' : isTotal ? '2px solid #ccc' : undefined,
                  color: isHeader ? '#1565c0' : isTotalGeneral ? '#e65100' : undefined,
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
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>Bilan Bancaire - PCEC/PCB</Typography>
      {renderTable('ACTIF BANCAIRE', lignesActif)}
      {renderTable('PASSIF BANCAIRE', lignesPassif)}
    </Box>
  )
}

export default memo(BilanBanque)
