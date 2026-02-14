/**
 * Complément Charges - Détail des charges par nature
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

const ComplementCharges: React.FC = () => {
  const theme = useTheme()

  const donneesCharges = [
    {
      categorie: 'ACHATS',
      sousCategories: [
        { nature: 'Achats de marchandises', montantN: 65200000, montantN1: 61500000, pourcentageCA: 30.9 },
        { nature: 'Variation de stock de marchandises', montantN: -1700000, montantN1: 800000, pourcentageCA: -0.8 },
        { nature: 'Achats de matières premières', montantN: 28000000, montantN1: 26500000, pourcentageCA: 13.3 },
        { nature: 'Variation de stock matières premières', montantN: -700000, montantN1: -500000, pourcentageCA: -0.3 },
        { nature: 'Autres achats et charges externes', montantN: 15200000, montantN1: 14800000, pourcentageCA: 7.2 },
      ],
      totalN: 105000000,
      totalN1: 102100000
    },
    {
      categorie: 'SERVICES EXTERIEURS',
      sousCategories: [
        { nature: 'Sous-traitance générale', montantN: 3500000, montantN1: 3200000, pourcentageCA: 1.7 },
        { nature: 'Locations et charges locatives', montantN: 2400000, montantN1: 2400000, pourcentageCA: 1.1 },
        { nature: 'Entretien et réparations', montantN: 1800000, montantN1: 1600000, pourcentageCA: 0.9 },
        { nature: 'Assurances', montantN: 1200000, montantN1: 1100000, pourcentageCA: 0.6 },
        { nature: 'Documentation et formation', montantN: 800000, montantN1: 750000, pourcentageCA: 0.4 },
      ],
      totalN: 9700000,
      totalN1: 9050000
    },
    {
      categorie: 'AUTRES SERVICES EXTERIEURS',
      sousCategories: [
        { nature: 'Rémunérations d\'intermédiaires', montantN: 2100000, montantN1: 1900000, pourcentageCA: 1.0 },
        { nature: 'Publicité et relations publiques', montantN: 1800000, montantN1: 1600000, pourcentageCA: 0.9 },
        { nature: 'Transports', montantN: 3200000, montantN1: 2800000, pourcentageCA: 1.5 },
        { nature: 'Déplacements et missions', montantN: 900000, montantN1: 600000, pourcentageCA: 0.4 },
        { nature: 'Services bancaires', montantN: 1500000, montantN1: 1400000, pourcentageCA: 0.7 },
      ],
      totalN: 9500000,
      totalN1: 8300000
    },
    {
      categorie: 'IMPOTS ET TAXES',
      sousCategories: [
        { nature: 'Impôts et taxes sur rémunérations', montantN: 1400000, montantN1: 1300000, pourcentageCA: 0.7 },
        { nature: 'Autres impôts et taxes', montantN: 2200000, montantN1: 2100000, pourcentageCA: 1.0 },
        { nature: 'Droits d\'enregistrement', montantN: 300000, montantN1: 250000, pourcentageCA: 0.1 },
      ],
      totalN: 3900000,
      totalN1: 3650000
    },
    {
      categorie: 'CHARGES DE PERSONNEL',
      sousCategories: [
        { nature: 'Salaires et appointements', montantN: 35000000, montantN1: 32500000, pourcentageCA: 16.6 },
        { nature: 'Charges sociales CNPS', montantN: 6300000, montantN1: 5850000, pourcentageCA: 3.0 },
        { nature: 'Autres charges sociales', montantN: 2200000, montantN1: 2150000, pourcentageCA: 1.0 },
        { nature: 'Formation du personnel', montantN: 500000, montantN1: 400000, pourcentageCA: 0.2 },
        { nature: 'Autres charges de personnel', montantN: 4500000, montantN1: 4300000, pourcentageCA: 2.1 },
      ],
      totalN: 48500000,
      totalN1: 45200000
    }
  ]

  const totalGeneral = donneesCharges.reduce((sum, cat) => sum + cat.totalN, 0)
  const totalGeneralN1 = donneesCharges.reduce((sum, cat) => sum + cat.totalN1, 0)
  const chiffreAffaires = 210800000

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
  }

  const calculerVariation = (montantN: number, montantN1: number) => {
    if (montantN1 === 0) return 0
    return ((montantN - montantN1) / montantN1) * 100
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: theme.palette.primary.main }}>
        Complément - Détail des Charges par Nature (en FCFA)
      </Typography>

      {/* Tableau principal */}
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, minWidth: 300 }}>Nature des charges</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, minWidth: 130 }}>Exercice N</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, minWidth: 130 }}>Exercice N-1</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, minWidth: 80 }}>% CA</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, minWidth: 80 }}>Var. %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donneesCharges.map((categorie, catIndex) => (
              <React.Fragment key={catIndex}>
                {/* En-tête de catégorie */}
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
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
                    {((categorie.totalN / chiffreAffaires) * 100).toFixed(1)}%
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
                        color={sousCategorie.montantN > sousCategorie.montantN1 ? 'error' : 'success'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            
            {/* Total général */}
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 700 }}>
                TOTAL CHARGES D'EXPLOITATION
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {formatMontant(totalGeneral)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {formatMontant(totalGeneralN1)}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                {((totalGeneral / chiffreAffaires) * 100).toFixed(1)}%
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
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
                Structure des charges (% CA)
              </Typography>
              {donneesCharges.map((categorie, index) => {
                const pourcentage = (categorie.totalN / chiffreAffaires) * 100
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
                Évolutions significatives
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  Augmentations notables :
                </Typography>
                <Typography variant="body2">• Transports : +14,3% (optimisation logistique)</Typography>
                <Typography variant="body2">• Déplacements : +50,0% (expansion commerciale)</Typography>
                <Typography variant="body2">• Charges de personnel : +7,3% (recrutements)</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                  Maîtrise des coûts :
                </Typography>
                <Typography variant="body2">• Achats marchandises : +6,0% (vs CA +6,8%)</Typography>
                <Typography variant="body2">• Services extérieurs : +7,2% contrôlé</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'info.main' }}>
                  Ratio clé :
                </Typography>
                <Typography variant="body2">
                  Charges d'exploitation / CA : {((totalGeneral / chiffreAffaires) * 100).toFixed(1)}%
                  (vs {((totalGeneralN1 / 197400000) * 100).toFixed(1)}% en N-1)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ComplementCharges