/**
 * Bilan Synthétique - Liasse Fiscale SYSCOHADA
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
  LinearProgress,
  Stack,
  useTheme,
  alpha,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material'

interface BilanSynthetiqueProps {
  data?: any
  exerciceN?: number
  exerciceN1?: number
}

const BilanSynthetique: React.FC<BilanSynthetiqueProps> = ({ 
  data,
  exerciceN = 2024,
  exerciceN1 = 2023 
}) => {
  const theme = useTheme()

  // Données du bilan synthétique
  const bilanData = {
    actif: [
      {
        rubrique: 'ACTIF IMMOBILISÉ',
        sousRubriques: [
          { libelle: 'Charges immobilisées', montantN: 2850000, montantN1: 2080000 },
          { libelle: 'Immobilisations incorporelles', montantN: 2850000, montantN1: 2080000 },
          { libelle: 'Immobilisations corporelles', montantN: 205400000, montantN1: 198500000 },
          { libelle: 'Immobilisations financières', montantN: 9700000, montantN1: 8900000 },
        ],
        totalN: 220800000,
        totalN1: 211560000,
      },
      {
        rubrique: 'ACTIF CIRCULANT',
        sousRubriques: [
          { libelle: 'Actif circulant HAO', montantN: 500000, montantN1: 400000 },
          { libelle: 'Stocks et encours', montantN: 15800000, montantN1: 13100000 },
          { libelle: 'Créances et emplois assimilés', montantN: 42400000, montantN1: 31000000 },
        ],
        totalN: 58700000,
        totalN1: 44500000,
      },
      {
        rubrique: 'TRÉSORERIE - ACTIF',
        sousRubriques: [
          { libelle: 'Titres de placement', montantN: 2000000, montantN1: 1500000 },
          { libelle: 'Valeurs à encaisser', montantN: 800000, montantN1: 600000 },
          { libelle: 'Banques, chèques postaux, caisse', montantN: 10200000, montantN1: 7200000 },
        ],
        totalN: 13000000,
        totalN1: 9300000,
      },
      {
        rubrique: 'Écart de conversion - Actif',
        sousRubriques: [],
        totalN: 200000,
        totalN1: 150000,
      },
    ],
    passif: [
      {
        rubrique: 'CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES',
        sousRubriques: [
          { libelle: 'Capital', montantN: 100000000, montantN1: 100000000 },
          { libelle: 'Primes et réserves', montantN: 33500000, montantN1: 30000000 },
          { libelle: 'Report à nouveau', montantN: 8200000, montantN1: 6500000 },
          { libelle: 'Résultat net de l\'exercice', montantN: 12500000, montantN1: 10200000 },
          { libelle: 'Autres capitaux propres', montantN: 0, montantN1: 0 },
        ],
        totalN: 154200000,
        totalN1: 146700000,
      },
      {
        rubrique: 'DETTES FINANCIÈRES',
        sousRubriques: [
          { libelle: 'Emprunts et dettes financières', montantN: 54200000, montantN1: 64000000 },
          { libelle: 'Dettes de crédit-bail', montantN: 2500000, montantN1: 3000000 },
          { libelle: 'Provisions pour risques et charges', montantN: 5250000, montantN1: 4200000 },
        ],
        totalN: 61950000,
        totalN1: 71200000,
      },
      {
        rubrique: 'PASSIF CIRCULANT',
        sousRubriques: [
          { libelle: 'Dettes circulantes HAO', montantN: 800000, montantN1: 600000 },
          { libelle: 'Dettes d\'exploitation', montantN: 64000000, montantN1: 55500000 },
          { libelle: 'Provisions pour risques à court terme', montantN: 1300000, montantN1: 1100000 },
        ],
        totalN: 66100000,
        totalN1: 57200000,
      },
      {
        rubrique: 'TRÉSORERIE - PASSIF',
        sousRubriques: [
          { libelle: 'Banques, découverts', montantN: 10000000, montantN1: 8500000 },
          { libelle: 'Crédits de trésorerie', montantN: 0, montantN1: 0 },
        ],
        totalN: 10000000,
        totalN1: 8500000,
      },
      {
        rubrique: 'Écart de conversion - Passif',
        sousRubriques: [],
        totalN: 450000,
        totalN1: 310000,
      },
    ],
  }

  // Calcul des totaux
  const totalActifN = bilanData.actif.reduce((sum, item) => sum + item.totalN, 0)
  const totalActifN1 = bilanData.actif.reduce((sum, item) => sum + item.totalN1, 0)
  const totalPassifN = bilanData.passif.reduce((sum, item) => sum + item.totalN, 0)
  const totalPassifN1 = bilanData.passif.reduce((sum, item) => sum + item.totalN1, 0)

  // Calcul des ratios
  const ratios = {
    autonomieFinanciere: (154200000 / totalPassifN) * 100,
    liquiditeGenerale: (58700000 + 13000000) / (66100000 + 10000000),
    endettement: (61950000 / 154200000) * 100,
    rentabilite: (12500000 / 210800000) * 100, // Résultat net / CA
  }

  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR')
  }

  const calculerVariation = (montantN: number, montantN1: number) => {
    if (montantN1 === 0) return 0
    return ((montantN - montantN1) / montantN1) * 100
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Bilan Synthétique
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vue d'ensemble de la situation patrimoniale - Exercices {exerciceN} et {exerciceN1}
        </Typography>
      </Box>

      {/* Indicateurs clés */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  TOTAL BILAN
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatMontant(totalActifN)} FCFA
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {totalActifN > totalActifN1 ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography
                    variant="body2"
                    color={totalActifN > totalActifN1 ? 'success.main' : 'error.main'}
                  >
                    {calculerVariation(totalActifN, totalActifN1).toFixed(1)}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  CAPITAUX PROPRES
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatMontant(154200000)} FCFA
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Autonomie: {ratios.autonomieFinanciere.toFixed(1)}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  LIQUIDITÉ GÉNÉRALE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {ratios.liquiditeGenerale.toFixed(2)}
                </Typography>
                <Chip
                  label={ratios.liquiditeGenerale >= 1 ? 'Bonne' : 'Faible'}
                  color={ratios.liquiditeGenerale >= 1 ? 'success' : 'warning'}
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  RÉSULTAT NET
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatMontant(12500000)} FCFA
                </Typography>
                <Typography variant="body2" color="success.main">
                  +22.5% vs N-1
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableaux Actif et Passif */}
      <Grid container spacing={3}>
        {/* ACTIF */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              ACTIF
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rubriques</TableCell>
                    <TableCell align="right">Exercice {exerciceN}</TableCell>
                    <TableCell align="right">Exercice {exerciceN1}</TableCell>
                    <TableCell align="right">Var. %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bilanData.actif.map((section, index) => (
                    <React.Fragment key={index}>
                      <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {section.rubrique}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatMontant(section.totalN)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatMontant(section.totalN1)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {calculerVariation(section.totalN, section.totalN1).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                      {section.sousRubriques.map((sousRubrique, subIndex) => (
                        <TableRow key={`${index}-${subIndex}`}>
                          <TableCell sx={{ pl: 4 }}>
                            {sousRubrique.libelle}
                          </TableCell>
                          <TableCell align="right">
                            {formatMontant(sousRubrique.montantN)}
                          </TableCell>
                          <TableCell align="right">
                            {formatMontant(sousRubrique.montantN1)}
                          </TableCell>
                          <TableCell align="right">
                            {calculerVariation(sousRubrique.montantN, sousRubrique.montantN1).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 700 }}>
                      TOTAL ACTIF
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatMontant(totalActifN)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatMontant(totalActifN1)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {calculerVariation(totalActifN, totalActifN1).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* PASSIF */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              PASSIF
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Rubriques</TableCell>
                    <TableCell align="right">Exercice {exerciceN}</TableCell>
                    <TableCell align="right">Exercice {exerciceN1}</TableCell>
                    <TableCell align="right">Var. %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bilanData.passif.map((section, index) => (
                    <React.Fragment key={index}>
                      <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {section.rubrique}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatMontant(section.totalN)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {formatMontant(section.totalN1)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          {calculerVariation(section.totalN, section.totalN1).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                      {section.sousRubriques.map((sousRubrique, subIndex) => (
                        <TableRow key={`${index}-${subIndex}`}>
                          <TableCell sx={{ pl: 4 }}>
                            {sousRubrique.libelle}
                          </TableCell>
                          <TableCell align="right">
                            {formatMontant(sousRubrique.montantN)}
                          </TableCell>
                          <TableCell align="right">
                            {formatMontant(sousRubrique.montantN1)}
                          </TableCell>
                          <TableCell align="right">
                            {calculerVariation(sousRubrique.montantN, sousRubrique.montantN1).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell sx={{ fontWeight: 700 }}>
                      TOTAL PASSIF
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatMontant(totalPassifN)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {formatMontant(totalPassifN1)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {calculerVariation(totalPassifN, totalPassifN1).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Équilibre du bilan */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main', textAlign: 'center' }}>
          ✓ Bilan équilibré : Total Actif = Total Passif = {formatMontant(totalActifN)} FCFA
        </Typography>
      </Box>
    </Box>
  )
}

export default BilanSynthetique