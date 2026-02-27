/**
 * Note 13 - Rémunération des dirigeants SYSCOHADA
 */
import React from 'react'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Grid, Card, CardContent, Alert, useTheme } from '@mui/material'
import { People } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'

const Note13SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const remunerations = [
    { fonction: 'Directeur Général', fixe: 24000000, variable: 6000000, avantages: 3600000, charges: 8400000, total: 42000000 },
    { fonction: 'Directeur Financier', fixe: 18000000, variable: 3600000, avantages: 2400000, charges: 6000000, total: 30000000 },
    { fonction: 'Directeur Commercial', fixe: 16000000, variable: 4800000, avantages: 2400000, charges: 5800000, total: 29000000 },
    { fonction: 'Directeur Technique', fixe: 15000000, variable: 3000000, avantages: 1800000, charges: 4950000, total: 24750000 },
    { fonction: 'Président du Conseil', fixe: 6000000, variable: 0, avantages: 1200000, charges: 0, total: 7200000 },
  ]
  const jetons = [
    { organe: 'Conseil d\'Administration', nombre: 7, unitaire: 500000, total: 3500000 },
    { organe: 'Comité d\'audit', nombre: 3, unitaire: 300000, total: 900000 },
    { organe: 'Comité de rémunération', nombre: 3, unitaire: 250000, total: 750000 },
  ]
  const totR = { fixe: remunerations.reduce((s, i) => s + i.fixe, 0), variable: remunerations.reduce((s, i) => s + i.variable, 0), avantages: remunerations.reduce((s, i) => s + i.avantages, 0), charges: remunerations.reduce((s, i) => s + i.charges, 0), total: remunerations.reduce((s, i) => s + i.total, 0) }
  const totJ = jetons.reduce((s, i) => s + i.total, 0)
  const formatMontant = (m: number) => m.toLocaleString('fr-FR') + ' FCFA'

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>Note 13 - Rémunération des dirigeants</Typography>
      <TableActions tableName="Rémunération des dirigeants" onSave={() => alert('Sauvegardé')} onImport={() => alert('Import')} />
      <Alert severity="info" sx={{ mb: 3 }} icon={<People />}>
        <Typography variant="body2">Conformément à l'article 56 de l'Acte Uniforme OHADA, les rémunérations allouées aux membres des organes de direction et d'administration sont détaillées par catégorie.</Typography>
      </Alert>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Rémunérations des dirigeants</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead><TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 180 }}>Fonction</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Fixe</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Variable</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Avantages nature</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Charges sociales</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Total</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {remunerations.map((l, i) => (
              <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell sx={{ fontWeight: 500 }}>{l.fonction}</TableCell>
                <TableCell align="right">{formatMontant(l.fixe)}</TableCell>
                <TableCell align="right" sx={{ color: l.variable > 0 ? 'success.main' : 'inherit' }}>{formatMontant(l.variable)}</TableCell>
                <TableCell align="right">{formatMontant(l.avantages)}</TableCell>
                <TableCell align="right">{formatMontant(l.charges)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatMontant(l.total)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(totR.fixe)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatMontant(totR.variable)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(totR.avantages)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(totR.charges)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>{formatMontant(totR.total)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>Jetons de présence</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead><TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell sx={{ color: 'white', fontWeight: 600 }}>Organe</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Membres</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Montant unitaire</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Total</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {jetons.map((l, i) => (
              <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell sx={{ fontWeight: 500 }}>{l.organe}</TableCell>
                <TableCell align="right">{l.nombre}</TableCell>
                <TableCell align="right">{formatMontant(l.unitaire)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(l.total)}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell colSpan={3} sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL JETONS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>{formatMontant(totJ)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Coût total dirigeants</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatMontant(totR.total + totJ)}</Typography>
          <Typography variant="caption" color="text.secondary">Rémunérations + Jetons</Typography>
        </CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Part variable</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>{((totR.variable / (totR.fixe + totR.variable)) * 100).toFixed(1)}%</Typography>
          <Typography variant="caption" color="text.secondary">Variable / (Fixe + Variable)</Typography>
        </CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Avantages en nature</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>{formatMontant(totR.avantages)}</Typography>
          <Typography variant="caption" color="text.secondary">Véhicules, logement, téléphone</Typography>
        </CardContent></Card></Grid>
      </Grid>
      <CommentairesSection titre="Commentaires et Observations - Note 13" noteId="note13"
        commentairesInitiaux={[{ id: '1', auteur: 'Expert-comptable', date: new Date().toLocaleDateString('fr-FR'),
          contenu: 'Les rémunérations des dirigeants sont conformes aux décisions de l\'AG.\n\n- Part variable liée aux objectifs annuels\n- Avantages en nature : véhicules et logement\n- Jetons conformes aux plafonds statutaires', type: 'observation' }]}
      />
    </Box>
  )
}
export default Note13SYSCOHADA