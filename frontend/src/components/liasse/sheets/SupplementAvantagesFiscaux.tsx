/**
 * Supplément Avantages Fiscaux - Détail des avantages et exonérations
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
  Alert,
  Stack,
  Divider,
} from '@mui/material'
import {
  Stars,
  AccountBalance,
  Business,
  TrendingUp,
  Security,
  Assignment,
} from '@mui/icons-material'

const SupplementAvantagesFiscaux: React.FC = () => {
  const theme = useTheme()

  const avantagesFiscaux = {
    creditImpot: [
      {
        nature: 'Crédit d\'impôt recherche et développement',
        baseCalcul: 1800000,
        tauxApplication: 30,
        montantCredit: 540000,
        utilisePrecedent: 0,
        utiliseExercice: 540000,
        reporterSuivant: 0,
        validiteJusqu: '2026-12-31'
      },
      {
        nature: 'Crédit d\'impôt investissement zones franches',
        baseCalcul: 600000,
        tauxApplication: 30,
        montantCredit: 180000,
        utilisePrecedent: 0,
        utiliseExercice: 180000,
        reporterSuivant: 0,
        validiteJusqu: '2025-12-31'
      }
    ],
    exonerations: [
      {
        nature: 'Exonération IS - Première tranche (0-50M)',
        baseExoneree: 50000000,
        tauxNormal: 25,
        economieRealisee: 12500000,
        dureeRestante: '3 ans',
        conditionsRespectees: true
      },
      {
        nature: 'Exonération TVA équipements industriels',
        baseExoneree: 2500000,
        tauxNormal: 18,
        economieRealisee: 450000,
        dureeRestante: 'Permanent',
        conditionsRespectees: true
      }
    ],
    reductions: [
      {
        nature: 'Réduction pour investissements productifs',
        baseCalcul: 5600000,
        tauxReduction: 40,
        montantReduction: 2240000,
        imputeIS: 2240000,
        reportable: false
      },
      {
        nature: 'Réduction emplois nouveaux',
        baseCalcul: 8500000,
        tauxReduction: 25,
        montantReduction: 2125000,
        imputeIS: 2125000,
        reportable: true
      }
    ]
  }

  const totalCredits = avantagesFiscaux.creditImpot.reduce((sum, credit) => sum + credit.montantCredit, 0)
  const totalExonerations = avantagesFiscaux.exonerations.reduce((sum, exo) => sum + exo.economieRealisee, 0)
  const totalReductions = avantagesFiscaux.reductions.reduce((sum, red) => sum + red.montantReduction, 0)
  const totalAvantages = totalCredits + totalExonerations + totalReductions

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Paper 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.success.main} 100%)`,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Stars sx={{ mr: 2, fontSize: 40 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Supplément - Avantages Fiscaux (en FCFA)
            </Typography>
            <Typography variant="h6">
              Détail des crédits, exonérations et réductions d'impôts
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Avantages fiscaux totaux de l'exercice : {formatMontant(totalAvantages)}
        </Typography>
      </Paper>

      {/* Vue d'ensemble */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Crédits d'Impôt
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatMontant(totalCredits)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {avantagesFiscaux.creditImpot.length} crédits appliqués
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Security sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Exonérations
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {formatMontant(totalExonerations)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {avantagesFiscaux.exonerations.length} exonérations actives
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Réductions
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {formatMontant(totalReductions)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {avantagesFiscaux.reductions.length} réductions accordées
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Détail des crédits d'impôt */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
            Crédits d'Impôt Détaillés
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nature du crédit</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Base de calcul</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Taux</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Crédit généré</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Utilisé N</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>À reporter</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Validité</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {avantagesFiscaux.creditImpot.map((credit, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500 }}>{credit.nature}</TableCell>
                    <TableCell align="right">{formatMontant(credit.baseCalcul)}</TableCell>
                    <TableCell align="center">
                      <Chip label={`${credit.tauxApplication}%`} size="small" color="primary" />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      {formatMontant(credit.montantCredit)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {formatMontant(credit.utiliseExercice)}
                    </TableCell>
                    <TableCell align="right">
                      {credit.reporterSuivant > 0 ? formatMontant(credit.reporterSuivant) : '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={new Date(credit.validiteJusqu).getFullYear()}
                        size="small" 
                        color="success" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Exonérations */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'success.main' }}>
            Exonérations Fiscales
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nature de l'exonération</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Base exonérée</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Taux normal</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Économie réalisée</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Durée restante</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {avantagesFiscaux.exonerations.map((exo, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500 }}>{exo.nature}</TableCell>
                    <TableCell align="right">{formatMontant(exo.baseExoneree)}</TableCell>
                    <TableCell align="center">
                      <Chip label={`${exo.tauxNormal}%`} size="small" color="default" />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {formatMontant(exo.economieRealisee)}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {exo.dureeRestante}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={exo.conditionsRespectees ? 'Active' : 'Suspendue'} 
                        size="small" 
                        color={exo.conditionsRespectees ? 'success' : 'error'} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Réductions d'impôt */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'warning.main' }}>
            Réductions d'Impôt
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nature de la réduction</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Base de calcul</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Taux</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Réduction</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Imputé IS</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Reportable</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {avantagesFiscaux.reductions.map((red, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 500 }}>{red.nature}</TableCell>
                    <TableCell align="right">{formatMontant(red.baseCalcul)}</TableCell>
                    <TableCell align="center">
                      <Chip label={`${red.tauxReduction}%`} size="small" color="warning" />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'warning.main' }}>
                      {formatMontant(red.montantReduction)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {formatMontant(red.imputeIS)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={red.reportable ? 'Oui' : 'Non'} 
                        size="small" 
                        color={red.reportable ? 'success' : 'default'} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Récapitulatif et informations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'info.main' }}>
                Récapitulatif de l'Impact Fiscal
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Économies d'impôt directes</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {formatMontant(totalExonerations)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="body2" color="text.secondary">Crédits et réductions utilisés</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatMontant(totalCredits + totalReductions)}
                  </Typography>
                </Box>
                
                <Divider />
                
                <Box>
                  <Typography variant="body2" color="text.secondary">TOTAL AVANTAGES FISCAUX</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {formatMontant(totalAvantages)}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Soit une économie de {((totalAvantages / 28500000) * 100).toFixed(1)}% du résultat avant impôt
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Alert severity="success" icon={<Stars />}>
              <Typography variant="body2">
                <strong>Optimisation réussie :</strong> L'entreprise bénéficie pleinement des dispositifs fiscaux incitatifs
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Assignment />}>
              <Typography variant="body2">
                <strong>Suivi requis :</strong> Certaines conditions d'éligibilité doivent être maintenues
              </Typography>
            </Alert>
            
            <Alert severity="warning" icon={<Business />}>
              <Typography variant="body2">
                <strong>Échéances :</strong> Certains avantages expirent en 2025-2026, prévoir le renouvellement
              </Typography>
            </Alert>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SupplementAvantagesFiscaux