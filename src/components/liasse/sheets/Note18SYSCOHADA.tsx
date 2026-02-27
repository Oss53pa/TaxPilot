/**
 * Note 18 - Capacité d'autofinancement SYSCOHADA
 */
import React from 'react'
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Grid, Card, CardContent, Alert, useTheme } from '@mui/material'
import { TrendingUp, ArrowUpward } from '@mui/icons-material'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'

const Note18SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const calcul = [
    { poste: 'Résultat net de l\'exercice', N: 18500000, N1: 15000000, type: 'base' },
    { poste: '(+) Dotations aux amortissements et provisions', N: 12500000, N1: 11000000, type: 'ajout' },
    { poste: '(+) Valeur comptable des cessions', N: 3200000, N1: 1500000, type: 'ajout' },
    { poste: '(-) Reprises sur provisions et dépréciations', N: -4500000, N1: -3800000, type: 'retrait' },
    { poste: '(-) Produits des cessions d\'immobilisations', N: -5800000, N1: -2000000, type: 'retrait' },
    { poste: '(-) Quote-part subventions virées au résultat', N: -800000, N1: -800000, type: 'retrait' },
    { poste: 'CAPACITÉ D\'AUTOFINANCEMENT (CAF)', N: 23100000, N1: 20900000, type: 'total' },
    { poste: '(-) Dividendes distribués', N: -8500000, N1: -7000000, type: 'retrait' },
    { poste: 'AUTOFINANCEMENT', N: 14600000, N1: 13900000, type: 'grandtotal' },
  ]
  const formatMontant = (m: number) => { const a = Math.abs(m); return (m < 0 ? '-' : '') + a.toLocaleString('fr-FR') + ' FCFA' }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>Note 18 - Capacité d'autofinancement</Typography>
      <TableActions tableName="Capacité d'autofinancement" onSave={() => alert('Sauvegardé')} onImport={() => alert('Import')} />
      <Alert severity="info" sx={{ mb: 3 }} icon={<TrendingUp />}>
        <Typography variant="body2">La CAF mesure les ressources internes générées par l'activité. Calculée selon la méthode additive à partir du résultat net, conformément au SYSCOHADA révisé.</Typography>
      </Alert>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead><TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 350 }}>Éléments</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Exercice N</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Exercice N-1</TableCell>
            <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Variation</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {calcul.map((l, i) => (
              <TableRow key={i} sx={{
                backgroundColor: l.type === 'total' ? theme.palette.info.light + '30' : l.type === 'grandtotal' ? theme.palette.grey[100] : i % 2 === 0 ? 'inherit' : theme.palette.grey[50],
                borderTop: l.type === 'total' || l.type === 'grandtotal' ? '2px solid ' + theme.palette.primary.main : 'none',
              }}>
                <TableCell sx={{ fontWeight: l.type === 'total' || l.type === 'grandtotal' ? 700 : 500, fontSize: l.type === 'grandtotal' ? '1.1rem' : 'inherit' }}>{l.poste}</TableCell>
                <TableCell align="right" sx={{ fontWeight: l.type === 'total' || l.type === 'grandtotal' ? 700 : 500, color: l.N < 0 ? 'error.main' : l.type === 'total' || l.type === 'grandtotal' ? 'primary.main' : 'inherit' }}>{formatMontant(l.N)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: l.type === 'total' || l.type === 'grandtotal' ? 700 : 500, color: l.N1 < 0 ? 'error.main' : 'inherit' }}>{formatMontant(l.N1)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: l.N - l.N1 > 0 ? 'success.main' : l.N - l.N1 < 0 ? 'error.main' : 'inherit' }}>
                  {l.N1 !== 0 ? ((l.N - l.N1) > 0 ? '+' : '') + ((l.N - l.N1) / Math.abs(l.N1) * 100).toFixed(1) + '%' : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>CAF / CA</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>8,4%</Typography>
          <Typography variant="caption" color="text.secondary">Taux de marge d'autofinancement</Typography>
        </CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Taux distribution</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>36,8%</Typography>
          <Typography variant="caption" color="text.secondary">Dividendes / CAF</Typography>
        </CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>Évolution CAF</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}><ArrowUpward sx={{ verticalAlign: 'middle' }} /> +10,5%</Typography>
          <Typography variant="caption" color="text.secondary">Progression vs N-1</Typography>
        </CardContent></Card></Grid>
      </Grid>
      <CommentairesSection titre="Commentaires et Observations - Note 18" noteId="note18"
        commentairesInitiaux={[{ id: '1', auteur: 'Expert-comptable', date: new Date().toLocaleDateString('fr-FR'),
          contenu: 'La CAF progresse de 10,5%.\n\n- L\'autofinancement couvre les investissements de renouvellement\n- Taux de distribution maîtrisé à 36,8%\n- Capacité de remboursement confortable', type: 'observation' }]}
      />
    </Box>
  )
}
export default Note18SYSCOHADA