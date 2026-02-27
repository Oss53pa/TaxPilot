/**
 * Note 9 - Engagements hors bilan SYSCOHADA
 */

import React from 'react'
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Grid, Card, CardContent, Chip, Alert, useTheme,
} from '@mui/material'
import { Security } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'

const Note9SYSCOHADA: React.FC = () => {
  const theme = useTheme()

  const engagementsDonnes = [
    { nature: 'Avals et cautions donnés', beneficiaire: 'Banque Atlantique', montant: 25000000, echeance: '31/12/2026', objet: 'Garantie emprunt filiale' },
    { nature: 'Hypothèques consenties', beneficiaire: 'BCEAO', montant: 45000000, echeance: '31/12/2028', objet: 'Garantie crédit immobilier' },
    { nature: 'Effets escomptés non échus', beneficiaire: 'Divers clients', montant: 8500000, echeance: '30/06/2025', objet: 'Escompte commercial' },
    { nature: 'Engagements de crédit-bail', beneficiaire: 'ALIOS Finance', montant: 12000000, echeance: '31/12/2027', objet: 'Location véhicules' },
    { nature: 'Nantissements donnés', beneficiaire: 'SIB', montant: 15000000, echeance: '31/12/2026', objet: 'Garantie découvert' },
  ]

  const engagementsRecus = [
    { nature: 'Cautions reçues de tiers', debiteur: 'Fournisseur A', montant: 10000000, echeance: '31/12/2025', objet: 'Garantie marché' },
    { nature: 'Avals reçus', debiteur: 'Associé principal', montant: 20000000, echeance: '31/12/2026', objet: 'Garantie emprunt' },
    { nature: 'Hypothèques reçues', debiteur: 'Client B', montant: 18000000, echeance: '31/12/2027', objet: 'Garantie paiement' },
  ]

  const totalDonnes = engagementsDonnes.reduce((s, i) => s + i.montant, 0)
  const totalRecus = engagementsRecus.reduce((s, i) => s + i.montant, 0)
  const formatMontant = (montant: number) => montant.toLocaleString('fr-FR') + ' FCFA'

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Note 9 - Engagements hors bilan
      </Typography>
      <TableActions tableName="Engagements hors bilan" onSave={() => alert('Sauvegardé')} onImport={() => alert('Import')} />
      <Alert severity="info" sx={{ mb: 3 }} icon={<Security />}>
        <Typography variant="body2">
          Les engagements hors bilan sont présentés conformément aux articles 39 et 40 de l'Acte Uniforme OHADA.
          Ils comprennent les engagements donnés et reçus susceptibles d'affecter la situation financière.
        </Typography>
      </Alert>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Engagements donnés</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 180 }}>Nature</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Bénéficiaire</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Montant</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Échéance</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Objet</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {engagementsDonnes.map((l, i) => (
              <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell sx={{ fontWeight: 500 }}>{l.nature}</TableCell>
                <TableCell>{l.beneficiaire}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMontant(l.montant)}</TableCell>
                <TableCell>{l.echeance}</TableCell>
                <TableCell>{l.objet}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL ENGAGEMENTS DONNÉS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}>{formatMontant(totalDonnes)}</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3 }}>Engagements reçus</Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 180 }}>Nature</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Débiteur</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Montant</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Échéance</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Objet</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {engagementsRecus.map((l, i) => (
              <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell sx={{ fontWeight: 500 }}>{l.nature}</TableCell>
                <TableCell>{l.debiteur}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMontant(l.montant)}</TableCell>
                <TableCell>{l.echeance}</TableCell>
                <TableCell>{l.objet}</TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL ENGAGEMENTS REÇUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}>{formatMontant(totalRecus)}</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Solde net des engagements</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>{formatMontant(totalDonnes - totalRecus)}</Typography>
            <Typography variant="caption" color="text.secondary">Engagements donnés nets des reçus</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Répartition</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Garanties bancaires</Typography>
              <Chip label={formatMontant(85000000)} size="small" color="warning" />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Crédit-bail</Typography>
              <Chip label={formatMontant(12000000)} size="small" color="info" />
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      <CommentairesSection titre="Commentaires et Observations - Note 9" noteId="note9"
        commentairesInitiaux={[{ id: '1', auteur: 'Expert-comptable', date: new Date().toLocaleDateString('fr-FR'),
          contenu: 'Les engagements hors bilan sont conformes aux dispositions SYSCOHADA.\n\nPoints d\'attention :\n- Crédit-bail comptabilisé hors bilan (traitement SYSCOHADA, différent d\'IFRS 16)\n- Aucun engagement susceptible de dégrader significativement la situation financière', type: 'observation' }]}
      />
    </Box>
  )
}

export default Note9SYSCOHADA