/**
 * Note 10 - Événements postérieurs à la clôture SYSCOHADA
 */
import React from 'react'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Grid, Card, CardContent, Chip, Alert, useTheme } from '@mui/material'
import { Event } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'

const Note10SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const evenements = [
    { date: '15/01/2025', nature: 'Obtention d\'un nouveau financement', impact: 25000000, traitement: 'Information en annexe', type: 'Non ajustant' },
    { date: '20/01/2025', nature: 'Résolution d\'un litige commercial', impact: 8500000, traitement: 'Ajustement des comptes', type: 'Ajustant' },
    { date: '05/02/2025', nature: 'Cession d\'une branche d\'activité', impact: 45000000, traitement: 'Information en annexe', type: 'Non ajustant' },
    { date: '12/02/2025', nature: 'Sinistre incendie entrepôt', impact: 12000000, traitement: 'Information en annexe', type: 'Non ajustant' },
    { date: '28/02/2025', nature: 'Recouvrement créance provisionnée', impact: 3500000, traitement: 'Ajustement des comptes', type: 'Ajustant' },
  ]
  const totalImpact = evenements.reduce((s, i) => s + i.impact, 0)
  const formatMontant = (m: number) => m.toLocaleString('fr-FR') + ' FCFA'

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>Note 10 - Événements postérieurs à la clôture</Typography>
      <TableActions tableName="Événements postérieurs" onSave={() => alert('Sauvegardé')} onImport={() => alert('Import')} />
      <Alert severity="info" sx={{ mb: 3 }} icon={<Event />}>
        <Typography variant="body2">Conformément à l'article 34 de l'Acte Uniforme OHADA, les événements survenus entre la date de clôture et la date d'arrêté des comptes sont mentionnés s'ils sont significatifs.</Typography>
      </Alert>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 250 }}>Nature</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Impact estimé</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Traitement</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600 }}>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evenements.map((l, i) => (
              <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell sx={{ fontWeight: 500 }}>{l.date}</TableCell>
                <TableCell>{l.nature}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMontant(l.impact)}</TableCell>
                <TableCell>{l.traitement}</TableCell>
                <TableCell align="center"><Chip label={l.type} size="small" color={l.type === 'Ajustant' ? 'warning' : 'info'} /></TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: '1.1rem' }}>IMPACT TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main', fontSize: '1.1rem' }}>{formatMontant(totalImpact)}</TableCell>
              <TableCell colSpan={2} />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Événements ajustants</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>{evenements.filter(e => e.type === 'Ajustant').length}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Impact : {formatMontant(evenements.filter(e => e.type === 'Ajustant').reduce((s, e) => s + e.impact, 0))}</Typography>
        </CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Non ajustants</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>{evenements.filter(e => e.type === 'Non ajustant').length}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Impact : {formatMontant(evenements.filter(e => e.type === 'Non ajustant').reduce((s, e) => s + e.impact, 0))}</Typography>
        </CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Impact total</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatMontant(totalImpact)}</Typography>
          <Typography variant="caption" color="text.secondary">Période 01/01 au 28/02/2025</Typography>
        </CardContent></Card></Grid>
      </Grid>
      <CommentairesSection titre="Commentaires et Observations - Note 10" noteId="note10"
        commentairesInitiaux={[{ id: '1', auteur: 'Expert-comptable', date: new Date().toLocaleDateString('fr-FR'),
          contenu: 'Les événements postérieurs ont été revus jusqu\'à la date d\'arrêté.\n\n- 2 événements ajustants modifient les comptes 2024\n- 3 événements non ajustants en information annexe\n- Aucun ne remet en cause la continuité d\'exploitation', type: 'observation' }]}
      />
    </Box>
  )
}
export default Note10SYSCOHADA