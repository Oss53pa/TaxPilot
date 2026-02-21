/**
 * Complément Produits - Détail des produits par nature
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
  useTheme,
  Chip,
  LinearProgress,
} from '@mui/material'
import { useBalanceData } from '@/hooks/useBalanceData'

const ComplementProduits: React.FC = () => {
  const theme = useTheme()
  const bal = useBalanceData()

  const chiffreAffaires = bal.c(['70'])
  const pct = (n: number) => chiffreAffaires > 0 ? Math.round(n / chiffreAffaires * 1000) / 10 : 0

  // Produits depuis la balance
  const ventesMarch = bal.c(['701'])
  const venteProdFinis = bal.c(['702', '703'])
  const venteProdSemiFinis = bal.c(['704'])
  const venteDechets = bal.c(['705', '706', '707'])
  const totalVentes = ventesMarch + venteProdFinis + venteProdSemiFinis + venteDechets

  const varStockPF = bal.c(['73'])
  const prodImmo = bal.c(['72'])
  const totalProdStockee = varStockPF + prodImmo

  const subventions = bal.c(['71'])
  const autresProduits = bal.c(['75'])
  const reprisesProvisions = bal.c(['791', '797', '799'])
  const totalSubventions = subventions + autresProduits + reprisesProvisions

  const donneesProduits = [
    {
      categorie: 'VENTES',
      sousCategories: [
        { nature: 'Ventes de marchandises (701)', montantN: ventesMarch, montantN1: 0, pourcentageCA: pct(ventesMarch) },
        { nature: 'Ventes de produits finis (702-703)', montantN: venteProdFinis, montantN1: 0, pourcentageCA: pct(venteProdFinis) },
        { nature: 'Ventes de produits semi-finis (704)', montantN: venteProdSemiFinis, montantN1: 0, pourcentageCA: pct(venteProdSemiFinis) },
        { nature: 'Autres ventes (705-707)', montantN: venteDechets, montantN1: 0, pourcentageCA: pct(venteDechets) },
      ],
      totalN: totalVentes,
      totalN1: 0
    },
    {
      categorie: 'PRODUCTION STOCKEE ET IMMOBILISEE',
      sousCategories: [
        { nature: 'Variation stock produits (73)', montantN: varStockPF, montantN1: 0, pourcentageCA: pct(varStockPF) },
        { nature: 'Production immobilisee (72)', montantN: prodImmo, montantN1: 0, pourcentageCA: pct(prodImmo) },
      ],
      totalN: totalProdStockee,
      totalN1: 0
    },
    {
      categorie: 'SUBVENTIONS ET AUTRES PRODUITS',
      sousCategories: [
        { nature: 'Subventions d\'exploitation (71)', montantN: subventions, montantN1: 0, pourcentageCA: pct(subventions) },
        { nature: 'Autres produits d\'exploitation (75)', montantN: autresProduits, montantN1: 0, pourcentageCA: pct(autresProduits) },
        { nature: 'Reprises de provisions (791-799)', montantN: reprisesProvisions, montantN1: 0, pourcentageCA: pct(reprisesProvisions) },
      ],
      totalN: totalSubventions,
      totalN1: 0
    }
  ]

  const totalGeneral = donneesProduits.reduce((sum, cat) => sum + cat.totalN, 0)
  const totalGeneralN1 = donneesProduits.reduce((sum, cat) => sum + cat.totalN1, 0)

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
  }

  const calculerVariation = (montantN: number, montantN1: number) => {
    if (montantN1 === 0) return montantN > 0 ? 100 : 0
    return ((montantN - montantN1) / montantN1) * 100
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Complément - Détail des Produits par Nature (en FCFA)
      </Typography>

      {/* Tableau principal */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.success.main }}>
              <TableCell sx={{ color: 'white', fontWeight: 600, minWidth: 300 }}>Nature des produits</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 130 }}>Exercice N</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 130 }}>Exercice N-1</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 80 }}>% CA</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600, minWidth: 80 }}>Var. %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donneesProduits.map((categorie, catIndex) => (
              <React.Fragment key={catIndex}>
                {/* En-tête de catégorie */}
                <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    {categorie.categorie}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatMontant(categorie.totalN)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {formatMontant(categorie.totalN1)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {((categorie.totalN / totalGeneral) * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {calculerVariation(categorie.totalN, categorie.totalN1).toFixed(1)}%
                  </TableCell>
                </TableRow>
                
                {/* Détail des sous-catégories */}
                {categorie.sousCategories.map((sousCategorie, sousIndex) => (
                  <TableRow key={`${catIndex}-${sousIndex}`}>
                    <TableCell sx={{ pl: 4 }}>{sousCategorie.nature}</TableCell>
                    <TableCell align="right">
                      {formatMontant(sousCategorie.montantN)}
                    </TableCell>
                    <TableCell align="right">
                      {formatMontant(sousCategorie.montantN1)}
                    </TableCell>
                    <TableCell align="right">
                      {sousCategorie.pourcentageCA.toFixed(1)}%
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${calculerVariation(sousCategorie.montantN, sousCategorie.montantN1).toFixed(1)}%`}
                        color={sousCategorie.montantN > sousCategorie.montantN1 ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            
            {/* Total général */}
            <TableRow sx={{ backgroundColor: theme.palette.success.light, borderTop: '2px solid ' + theme.palette.success.main }}>
              <TableCell sx={{ fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>
                TOTAL PRODUITS D'EXPLOITATION
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>
                {formatMontant(totalGeneral)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>
                {formatMontant(totalGeneralN1)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>
                100.0%
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: 'white' }}>
                {calculerVariation(totalGeneral, totalGeneralN1).toFixed(1)}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Analyses */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Répartition des produits
              </Typography>
              {donneesProduits.map((categorie, index) => {
                const pourcentage = (categorie.totalN / totalGeneral) * 100
                return (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {categorie.categorie}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {pourcentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={pourcentage}
                      color="success"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )
              })}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Analyse des performances
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Croissance du chiffre d'affaires :
                </Typography>
                <Typography variant="body2">
                  • Progression globale : +{calculerVariation(totalGeneral, totalGeneralN1).toFixed(1)}%
                </Typography>
                <Typography variant="body2">
                  • Ventes marchandises : +{calculerVariation(125000000, 117000000).toFixed(1)}%
                </Typography>
                <Typography variant="body2">
                  • Ventes produits finis : +{calculerVariation(68000000, 63500000).toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  Points d'attention :
                </Typography>
                <Typography variant="body2">• Production stockée en forte hausse</Typography>
                <Typography variant="body2">• Absence de subventions d'exploitation</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
                  Indicateurs clés :
                </Typography>
                <Typography variant="body2">
                  CA moyen : {formatMontant(Math.round((totalGeneral + totalGeneralN1) / 2))}
                </Typography>
                <Typography variant="body2">
                  Croissance mensuelle : +{(calculerVariation(totalGeneral, totalGeneralN1) / 12).toFixed(2)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ComplementProduits