/**
 * Compte de Resultat Simplifie SMT (Systeme Minimal de Tresorerie)
 * SYSCOHADA Revise 2017 - Entites < 60M FCFA
 * Produits (6 lignes) + Charges (10 lignes) + Soldes intermediaires
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

interface LigneSMT {
  ref: string
  libelle: string
  montantN: number | null
  montantN1: number | null
  isHeader?: boolean
  isTotal?: boolean
  isTotalGeneral?: boolean
  comptes?: string[]
}

interface CompteResultatSMTProps {
  modeEdition?: boolean
}

const formatMontant = (val: number | null): string => {
  if (val === null || val === undefined) return ''
  return new Intl.NumberFormat('fr-FR').format(val)
}

const CompteResultatSMT: React.FC<CompteResultatSMTProps> = ({ modeEdition = false }) => {
  const lignesProduits: LigneSMT[] = [
    { ref: '', libelle: 'PRODUITS D\'EXPLOITATION', montantN: null, montantN1: null, isHeader: true },
    { ref: 'PR_1', libelle: 'Ventes de marchandises', montantN: 0, montantN1: 0, comptes: ['701'] },
    { ref: 'PR_2', libelle: 'Ventes de produits fabriques', montantN: 0, montantN1: 0, comptes: ['702-706'] },
    { ref: 'PR_3', libelle: 'Production stockee et immobilisee', montantN: 0, montantN1: 0, comptes: ['72', '73'] },
    { ref: 'PR_4', libelle: 'Subventions d\'exploitation', montantN: 0, montantN1: 0, comptes: ['71'] },
    { ref: 'PR_5', libelle: 'Autres produits et transferts de charges', montantN: 0, montantN1: 0, comptes: ['75', '78'] },
    { ref: 'PR_6', libelle: 'Produits financiers et HAO', montantN: 0, montantN1: 0, comptes: ['77', '8x'] },
    { ref: '', libelle: 'TOTAL PRODUITS', montantN: 0, montantN1: 0, isTotal: true },
  ]

  const lignesCharges: LigneSMT[] = [
    { ref: '', libelle: 'CHARGES D\'EXPLOITATION', montantN: null, montantN1: null, isHeader: true },
    { ref: 'CH_1', libelle: 'Achats de marchandises', montantN: 0, montantN1: 0, comptes: ['601'] },
    { ref: 'CH_2', libelle: 'Achats de matieres et fournitures', montantN: 0, montantN1: 0, comptes: ['602-608'] },
    { ref: 'CH_3', libelle: 'Variation de stocks', montantN: 0, montantN1: 0, comptes: ['603'] },
    { ref: 'CH_4', libelle: 'Transports', montantN: 0, montantN1: 0, comptes: ['61'] },
    { ref: 'CH_5', libelle: 'Services exterieurs', montantN: 0, montantN1: 0, comptes: ['62', '63'] },
    { ref: 'CH_6', libelle: 'Impots et taxes', montantN: 0, montantN1: 0, comptes: ['64'] },
    { ref: 'CH_7', libelle: 'Autres charges', montantN: 0, montantN1: 0, comptes: ['65'] },
    { ref: 'CH_8', libelle: 'Charges de personnel', montantN: 0, montantN1: 0, comptes: ['66'] },
    { ref: 'CH_9', libelle: 'Dotations amortissements et provisions', montantN: 0, montantN1: 0, comptes: ['68', '69'] },
    { ref: 'CH_10', libelle: 'Charges financieres, HAO et Impot', montantN: 0, montantN1: 0, comptes: ['67', '8x', '89'] },
    { ref: '', libelle: 'TOTAL CHARGES', montantN: 0, montantN1: 0, isTotal: true },
  ]

  const lignesSoldes: LigneSMT[] = [
    { ref: '', libelle: 'SOLDES INTERMEDIAIRES', montantN: null, montantN1: null, isHeader: true },
    { ref: 'MB', libelle: 'Marge brute (PR_1 - CH_1)', montantN: 0, montantN1: 0, isTotal: true },
    { ref: 'RE', libelle: 'Resultat d\'exploitation', montantN: 0, montantN1: 0, isTotal: true },
    { ref: 'RN', libelle: 'RESULTAT NET', montantN: 0, montantN1: 0, isTotalGeneral: true },
  ]

  const renderSection = (title: string, lignes: LigneSMT[]) => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Box sx={{ p: 2, bgcolor: title.includes('PRODUITS') ? 'success.main' : title.includes('CHARGES') ? 'error.main' : 'info.main', color: 'white' }}>
        <Typography variant="h6">{title}</Typography>
        <Chip label="SMT" size="small" sx={{ mt: 0.5, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
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
                  bgcolor: isHeader ? 'grey.50' : isTotalGeneral ? 'warning.50' : isTotal ? 'grey.100' : 'white',
                  '& td': {
                    fontWeight: (isHeader || isTotal || isTotalGeneral) ? 'bold' : 'normal',
                    fontSize: isTotalGeneral ? '0.95rem' : '0.85rem',
                    borderBottom: isTotalGeneral ? '3px double' : isTotal ? '2px solid #ccc' : undefined,
                    color: isHeader ? 'text.secondary' : isTotalGeneral ? 'warning.dark' : undefined,
                  },
                }}
              >
                <TableCell>{ligne.ref}</TableCell>
                <TableCell>{ligne.libelle}</TableCell>
                <TableCell align="right">
                  {ligne.montantN !== null ? (
                    modeEdition && !isHeader && !isTotal && !isTotalGeneral ? (
                      <TextField
                        size="small"
                        type="number"
                        defaultValue={ligne.montantN}
                        sx={{ width: 130 }}
                        InputProps={{ sx: { fontSize: '0.85rem' } }}
                      />
                    ) : (
                      formatMontant(ligne.montantN)
                    )
                  ) : ''}
                </TableCell>
                <TableCell align="right">
                  {ligne.montantN1 !== null ? (
                    modeEdition && !isHeader && !isTotal && !isTotalGeneral ? (
                      <TextField
                        size="small"
                        type="number"
                        defaultValue={ligne.montantN1}
                        sx={{ width: 130 }}
                        InputProps={{ sx: { fontSize: '0.85rem' } }}
                      />
                    ) : (
                      formatMontant(ligne.montantN1)
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
        Compte de Resultat Simplifie - SMT
      </Typography>
      {renderSection('PRODUITS', lignesProduits)}
      {renderSection('CHARGES', lignesCharges)}
      {renderSection('SOLDES INTERMEDIAIRES DE GESTION', lignesSoldes)}
    </Box>
  )
}

export default memo(CompteResultatSMT)
