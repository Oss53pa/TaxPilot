/**
 * Note 16 - Affectation du résultat SYSCOHADA
 */
import React from 'react'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Grid, Card, CardContent, Chip, Alert, useTheme } from '@mui/material'
import { AccountBalance, ArrowForward } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'

const Note16SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const affectation = [
    { poste: 'Résultat net de l\'exercice N-1', montant: 15000000, type: 'source' },
    { poste: 'Report à nouveau antérieur', montant: 3500000, type: 'source' },
    { poste: 'Bénéfice distribuable', montant: 18500000, type: 'subtotal' },
    { poste: 'Réserve légale (10%)', montant: -1500000, type: 'affectation' },
    { poste: 'Réserves statutaires', montant: -3000000, type: 'affectation' },
    { poste: 'Réserves facultatives', montant: -2000000, type: 'affectation' },
    { poste: 'Dividendes', montant: -8500000, type: 'affectation' },
    { poste: 'Report à nouveau', montant: -3500000, type: 'affectation' },
    { poste: 'Solde après affectation', montant: 0, type: 'total' },
  ]
  const formatMontant = (m: number) => { const a = Math.abs(m); return (m < 0 ? '-' : '') + a.toLocaleString('fr-FR') + ' FCFA' }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>Note 16 - Affectation du résultat</Typography>
      <TableActions tableName="Affectation du résultat" onSave={() => alert('Sauvegardé')} onImport={() => alert('Import')} />
      <Alert severity="info" sx={{ mb: 3 }} icon={<AccountBalance />}>
        <Typography variant="body2">L'affectation du résultat est proposée conformément aux statuts et à l'article 546 AUSCGIE. La réserve légale est dotée à hauteur de 10% jusqu'à atteindre 20% du capital social.</Typography>
      </Alert>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead><TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 300 }}>Poste</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 150 }}>Montant (FCFA)</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {affectation.map((l, i) => (
              <TableRow key={i} sx={{
                backgroundColor: l.type === 'subtotal' ? theme.palette.info.light + '30' : l.type === 'total' ? theme.palette.grey[100] : i % 2 === 0 ? 'inherit' : theme.palette.grey[50],
                borderTop: l.type === 'subtotal' || l.type === 'total' ? '2px solid ' + theme.palette.primary.main : 'none',
              }}>
                <TableCell sx={{ fontWeight: l.type === 'subtotal' || l.type === 'total' ? 700 : 500, pl: l.type === 'affectation' ? 4 : 2 }}>
                  {l.type === 'affectation' && <ArrowForward sx={{ fontSize: 14, mr: 1, verticalAlign: 'middle' }} />}{l.poste}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: l.type === 'subtotal' || l.type === 'total' ? 700 : 500, color: l.montant < 0 ? 'error.main' : l.type === 'subtotal' ? 'primary.main' : 'inherit' }}>
                  {formatMontant(l.montant)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Dividendes proposés</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>{(8500000).toLocaleString('fr-FR')} FCFA</Typography>
          <Typography variant="caption" color="text.secondary">45,9% du bénéfice distribuable</Typography>
        </CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Mise en réserves</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>{(6500000).toLocaleString('fr-FR')} FCFA</Typography>
          <Typography variant="caption" color="text.secondary">Légale + statutaires + facultatives</Typography>
        </CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Réserve légale cumulée</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>15,8%</Typography>
          <Typography variant="caption" color="text.secondary">Du capital social (objectif : 20%)</Typography>
          <Chip label="En cours de constitution" size="small" color="warning" sx={{ mt: 1 }} />
        </CardContent></Card></Grid>
      </Grid>
      <CommentairesSection titre="Commentaires et Observations - Note 16" noteId="note16"
        commentairesInitiaux={[{ id: '1', auteur: 'Expert-comptable', date: new Date().toLocaleDateString('fr-FR'),
          contenu: 'L\'affectation du résultat est conforme aux statuts et à la réglementation OHADA.\n\n- Dotation réserve légale de 10% soit 1 500 000 FCFA\n- Réserve légale cumulée à 15,8% du capital\n- Dividendes de 8 500 000 FCFA proposés à l\'AGO', type: 'observation' }]}
      />
    </Box>
  )
}
export default Note16SYSCOHADA