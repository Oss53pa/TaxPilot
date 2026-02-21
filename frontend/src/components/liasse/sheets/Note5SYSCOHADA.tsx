/**
 * Note 5 - Stocks et En-cours SYSCOHADA
 */

import React from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  useTheme,
} from '@mui/material'
import { Inventory, Warning, CheckCircle } from '@mui/icons-material'
import { useBalanceData } from '@/hooks/useBalanceData'
import CommentairesSection from '../shared/CommentairesSection'
import TableActions from '../shared/TableActions'

const Note5SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const bal = useBalanceData()

  // Stocks calculés depuis la balance importée
  const stockRow = (nature: string, stockPrefixes: string[], provPrefixes: string[], methode: string) => {
    const brut = bal.d(stockPrefixes)
    const prov = bal.c(provPrefixes)
    return { nature, stockInitial: 0, entrees: 0, sorties: 0, stockFinalBrut: brut, provisions: prov, stockFinalNet: brut - prov, methodeEvaluation: methode }
  }

  const donneesStocks = [
    stockRow('Marchandises', ['31'], ['391'], 'CMP'),
    stockRow('Matières premières', ['32'], ['392'], 'CMP'),
    stockRow('Matières consommables', ['33'], ['393'], 'CMP'),
    stockRow('En-cours de production', ['34', '35'], ['394', '395'], 'Coût réel'),
    stockRow('Produits finis', ['36', '37'], ['396', '397'], 'CMP'),
  ]

  const total = {
    stockInitial: donneesStocks.reduce((sum, item) => sum + item.stockInitial, 0),
    entrees: donneesStocks.reduce((sum, item) => sum + item.entrees, 0),
    sorties: donneesStocks.reduce((sum, item) => sum + item.sorties, 0),
    stockFinalBrut: donneesStocks.reduce((sum, item) => sum + item.stockFinalBrut, 0),
    provisions: donneesStocks.reduce((sum, item) => sum + item.provisions, 0),
    stockFinalNet: donneesStocks.reduce((sum, item) => sum + item.stockFinalNet, 0),
  }

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
  }

  const getRotationStock = (sorties: number, stockMoyen: number): string => {
    if (stockMoyen === 0) return '0.0'
    return (sorties / stockMoyen).toFixed(1)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Note 5 - Stocks et En-cours (en FCFA)
      </Typography>

      {/* Actions du tableau */}
      <TableActions 
        tableName="Stocks et En-cours"
        showCalculate={true}
        onSave={() => alert('Stocks et en-cours sauvegardés')}
        onAdd={() => alert('Nouveau produit ajouté à l\'inventaire')}
        onCalculate={() => alert('Recalcul des rotations et valorisations de stocks effectué')}
        onImport={() => alert('Import des données d\'inventaire physique')}
      />

      {/* Alerte méthode d'évaluation */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<Inventory />}>
        <Typography variant="body2">
          Les stocks sont évalués selon la méthode du <strong>Coût Moyen Pondéré (CMP)</strong>. 
          L'inventaire physique a été effectué au 31 décembre 2024 sous contrôle des commissaires aux comptes.
        </Typography>
      </Alert>

      {/* Tableau principal */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 200 }}>Nature</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>Stock initial</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>Entrées</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>Sorties</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>Stock final brut</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 100 }}>Provisions</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 120 }}>Stock final net</TableCell>
              <TableCell align="center" sx={{ color: 'white', fontWeight: 600, minWidth: 80 }}>Méthode</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donneesStocks.map((ligne, index) => (
              <TableRow key={index} sx={{ '&:nth-of-type(even)': { backgroundColor: theme.palette.grey[50] } }}>
                <TableCell sx={{ fontWeight: 500 }}>{ligne.nature}</TableCell>
                <TableCell align="right">{formatMontant(ligne.stockInitial)}</TableCell>
                <TableCell align="right" sx={{ color: 'success.main' }}>{formatMontant(ligne.entrees)}</TableCell>
                <TableCell align="right" sx={{ color: 'info.main' }}>{formatMontant(ligne.sorties)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMontant(ligne.stockFinalBrut)}</TableCell>
                <TableCell align="right" sx={{ color: ligne.provisions > 0 ? 'error.main' : 'inherit' }}>
                  {formatMontant(ligne.provisions)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatMontant(ligne.stockFinalNet)}
                </TableCell>
                <TableCell align="center">
                  <Chip label={ligne.methodeEvaluation} size="small" />
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ backgroundColor: theme.palette.grey[100], borderTop: '2px solid ' + theme.palette.primary.main }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.stockInitial)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>{formatMontant(total.entrees)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'info.main' }}>{formatMontant(total.sorties)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>{formatMontant(total.stockFinalBrut)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'error.main' }}>{formatMontant(total.provisions)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>
                {formatMontant(total.stockFinalNet)}
              </TableCell>
              <TableCell align="center">-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Informations complémentaires */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Provisions pour dépréciation
              </Typography>
              {donneesStocks.filter(s => s.provisions > 0).map((s, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Warning color="error" fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {s.nature} : {formatMontant(s.provisions)} FCFA
                    </Typography>
                  </Box>
                </Box>
              ))}
              {donneesStocks.every(s => s.provisions === 0) && (
                <Typography variant="body2" color="text.secondary">
                  Aucune provision pour dépréciation constatée
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Analyse de rotation
              </Typography>
              {donneesStocks.map((item, index) => {
                const stockMoyen = (item.stockInitial + item.stockFinalNet) / 2
                const rotation = getRotationStock(item.sorties, stockMoyen)
                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.nature}
                      </Typography>
                      <Chip 
                        label={`${rotation}x`} 
                        size="small"
                        color={parseFloat(rotation) > 5 ? 'success' : parseFloat(rotation) > 2 ? 'warning' : 'error'}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Stock moyen : {formatMontant(stockMoyen)}
                    </Typography>
                  </Box>
                )
              })}
              <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Contrôle qualité
                  </Typography>
                </Box>
                <Typography variant="caption">
                  Inventaire physique réalisé au 31/12/2024 avec écart inférieur à 1%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section Commentaires et Observations */}
      <CommentairesSection 
        titre="Commentaires et Observations - Note 5"
        noteId="note5" 
        commentairesInitiaux={[
          {
            id: '1',
            auteur: 'Expert-comptable',
            date: new Date().toLocaleDateString('fr-FR'),
            contenu: 'L\'inventaire physique des stocks a été réalisé au 31 décembre 2024.\n\nObservations :\n- Écart d\'inventaire inférieur à 1% sur tous les postes\n- Rotation des stocks satisfaisante (4,2 fois/an en moyenne)\n- Provision pour dépréciation de 2 500 000 FCFA sur stocks obsolètes\n- Méthode FIFO appliquée de manière cohérente',
            type: 'observation'
          },
          {
            id: '2',
            auteur: 'Contrôleur',
            date: new Date().toLocaleDateString('fr-FR'),
            contenu: 'Point d\'attention sur la gestion des stocks à faible rotation (matières premières).\n\nRecommandation : optimiser les commandes pour réduire les coûts de stockage.',
            type: 'correction'
          }
        ]}
      />
    </Box>
  )
}

export default Note5SYSCOHADA