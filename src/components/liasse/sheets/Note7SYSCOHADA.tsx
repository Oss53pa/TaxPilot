/**
 * Note 7 - Tableau de variation des capitaux propres SYSCOHADA
 */

import React from 'react'
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Grid, Card, CardContent, Chip, Alert, useTheme,
} from '@mui/material'
import { AccountBalance } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'

const Note7SYSCOHADA: React.FC = () => {
  const theme = useTheme()

  const donneesVariation = [
    { poste: 'Capital social', soldeN1: 50000000, augmentation: 10000000, diminution: 0, affectation: 0, soldeN: 60000000 },
    { poste: 'Primes d\'émission', soldeN1: 5000000, augmentation: 2000000, diminution: 0, affectation: 0, soldeN: 7000000 },
    { poste: 'Réserve légale', soldeN1: 8000000, augmentation: 0, diminution: 0, affectation: 1500000, soldeN: 9500000 },
    { poste: 'Réserves statutaires', soldeN1: 12000000, augmentation: 0, diminution: 0, affectation: 3000000, soldeN: 15000000 },
    { poste: 'Réserves facultatives', soldeN1: 6000000, augmentation: 0, diminution: 0, affectation: 2000000, soldeN: 8000000 },
    { poste: 'Report à nouveau', soldeN1: 3500000, augmentation: 0, diminution: 0, affectation: -6500000, soldeN: -3000000 },
    { poste: 'Résultat net de l\'exercice', soldeN1: 15000000, augmentation: 0, diminution: 15000000, affectation: 0, soldeN: 18500000 },
    { poste: 'Subventions d\'investissement', soldeN1: 4000000, augmentation: 0, diminution: 800000, affectation: 0, soldeN: 3200000 },
  ]

  const total = {
    soldeN1: donneesVariation.reduce((s, i) => s + i.soldeN1, 0),
    augmentation: donneesVariation.reduce((s, i) => s + i.augmentation, 0),
    diminution: donneesVariation.reduce((s, i) => s + i.diminution, 0),
    affectation: donneesVariation.reduce((s, i) => s + i.affectation, 0),
    soldeN: donneesVariation.reduce((s, i) => s + i.soldeN, 0),
  }

  const formatMontant = (montant: number) => montant.toLocaleString('fr-FR') + ' FCFA'

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Note 7 - Tableau de variation des capitaux propres
      </Typography>
      <TableActions tableName="Variation des capitaux propres" onSave={() => alert('Sauvegardé')} onImport={() => alert('Import')} />
      <Alert severity="info" sx={{ mb: 3 }} icon={<AccountBalance />}>
        <Typography variant="body2">
          Le tableau de variation des capitaux propres présente les mouvements ayant affecté chaque composante
          des capitaux propres au cours de l'exercice, conformément à l'article 32 de l'Acte Uniforme OHADA.
        </Typography>
      </Alert>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 200 }}>Postes</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Solde N-1</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Augmentations</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Diminutions</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Affectation résultat</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Solde N</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donneesVariation.map((l, i) => (
              <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell sx={{ fontWeight: 500 }}>{l.poste}</TableCell>
                <TableCell align="right">{formatMontant(l.soldeN1)}</TableCell>
                <TableCell align="right" sx={{ color: l.augmentation > 0 ? 'success.main' : 'inherit' }}>{formatMontant(l.augmentation)}</TableCell>
                <TableCell align="right" sx={{ color: l.diminution > 0 ? 'error.main' : 'inherit' }}>{formatMontant(l.diminution)}</TableCell>
                <TableCell align="right" sx={{ color: l.affectation < 0 ? 'error.main' : l.affectation > 0 ? 'success.main' : 'inherit' }}>{formatMontant(l.affectation)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatMontant(l.soldeN)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL CAPITAUX PROPRES</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.soldeN1)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatMontant(total.augmentation)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{formatMontant(total.diminution)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.affectation)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>{formatMontant(total.soldeN)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Variation nette</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: total.soldeN > total.soldeN1 ? 'success.main' : 'error.main' }}>
              {total.soldeN > total.soldeN1 ? '+' : ''}{formatMontant(total.soldeN - total.soldeN1)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Variation sur l'exercice ({((total.soldeN - total.soldeN1) / total.soldeN1 * 100).toFixed(1)}%)
            </Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Structure du capital</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Capital social</Typography>
              <Chip label={formatMontant(60000000)} size="small" color="primary" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Réserves totales</Typography>
              <Chip label={formatMontant(32500000)} size="small" color="success" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Résultat net</Typography>
              <Chip label={formatMontant(18500000)} size="small" color="info" />
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      <CommentairesSection titre="Commentaires et Observations - Note 7" noteId="note7"
        commentairesInitiaux={[{ id: '1', auteur: 'Expert-comptable', date: new Date().toLocaleDateString('fr-FR'),
          contenu: 'Les capitaux propres ont augmenté de 14,9% sur l\'exercice.\n\nFaits marquants :\n- Augmentation de capital de 10 000 000 FCFA\n- Réserve légale portée à 9 500 000 FCFA (15,8% du capital)', type: 'observation' }]}
      />
    </Box>
  )
}

export default Note7SYSCOHADA