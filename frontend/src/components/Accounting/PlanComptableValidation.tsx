/**
 * Composant de Validation du Plan Comptable
 * Vérifie la conformité du plan comptable avec SYSCOHADA/référentiels
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Paper,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material'
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  ExpandMore,
  Refresh,
  Security,
  TrendingUp,
  Assignment,
} from '@mui/icons-material'
import { accountingService } from '@/services/accountingService'

interface ValidationResult {
  conforme: boolean
  taux_conformite: number
  statistiques: {
    total_comptes: number
    comptes_conformes: number
    comptes_non_conformes: number
    classes_presentes: number[]
    classes_manquantes: number[]
  }
  erreurs: Array<{
    type: string
    compte?: string
    message: string
    severite: 'CRITIQUE' | 'MAJEURE' | 'MINEURE'
  }>
  avertissements: Array<{
    type: string
    compte?: string
    message: string
    details?: string
  }>
  classes_manquantes: Array<{
    classe: number
    libelle: string
    importance: 'OBLIGATOIRE' | 'RECOMMANDE'
  }>
  recommandations: string[]
}

interface PlanComptableValidationProps {
  entrepriseId: string
  entrepriseName?: string
  onValidationComplete?: (result: ValidationResult) => void
}

const PlanComptableValidation: React.FC<PlanComptableValidationProps> = ({
  entrepriseId,
  entrepriseName,
  onValidationComplete,
}) => {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Auto-load validation on mount
  useEffect(() => {
    if (entrepriseId) {
      handleValidate()
    }
  }, [entrepriseId])

  const handleValidate = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await accountingService.validatePlanComptable(entrepriseId) as ValidationResult
      setResult(data)

      if (onValidationComplete) {
        onValidationComplete(data as ValidationResult)
      }
    } catch (err: any) {
      console.error('Validation failed:', err)
      setError(err.message || 'Erreur lors de la validation du plan comptable')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const getConformiteColor = (taux: number) => {
    if (taux >= 90) return 'success'
    if (taux >= 70) return 'warning'
    return 'error'
  }

  const getConformiteLabel = (taux: number) => {
    if (taux >= 90) return 'Excellente conformité'
    if (taux >= 70) return 'Conformité acceptable'
    if (taux >= 50) return 'Conformité insuffisante'
    return 'Non conforme'
  }

  const getSeveriteColor = (severite: string) => {
    switch (severite) {
      case 'CRITIQUE':
        return 'error'
      case 'MAJEURE':
        return 'warning'
      case 'MINEURE':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Validation du Plan Comptable
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vérification de conformité avec les référentiels comptables (SYSCOHADA, OHADA)
          </Typography>
          {entrepriseName && (
            <Typography variant="caption" color="text.secondary">
              Entreprise: {entrepriseName}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={handleValidate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
        >
          {loading ? 'Validation...' : 'Valider'}
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && !result && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Validation en cours...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {result && (
        <>
          {/* Status global */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Taux de Conformité
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: `${getConformiteColor(result.taux_conformite)}.main`,
                      }}
                    >
                      {result.taux_conformite.toFixed(1)}%
                    </Typography>
                    <Chip
                      label={getConformiteLabel(result.taux_conformite)}
                      color={getConformiteColor(result.taux_conformite)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Progression
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={result.taux_conformite}
                    color={getConformiteColor(result.taux_conformite)}
                    sx={{ height: 12, borderRadius: 1 }}
                  />

                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Total comptes
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {result.statistiques.total_comptes}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="success.main">
                        Conformes
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {result.statistiques.comptes_conformes}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="error.main">
                        Non conformes
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {result.statistiques.comptes_non_conformes}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Erreurs critiques */}
          {result.erreurs && result.erreurs.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Error color="error" />
                    <Typography variant="h6">
                      Erreurs ({result.erreurs.length})
                    </Typography>
                  </Box>
                }
                sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}
              />
              <CardContent sx={{ p: 0 }}>
                <List dense>
                  {result.erreurs.map((erreur, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Chip
                            label={erreur.severite}
                            size="small"
                            color={getSeveriteColor(erreur.severite)}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {erreur.compte && (
                                <Typography
                                  component="span"
                                  sx={{ fontFamily: 'monospace', fontWeight: 600, mr: 1 }}
                                >
                                  [{erreur.compte}]
                                </Typography>
                              )}
                              {erreur.message}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              Type: {erreur.type}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < result.erreurs.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Avertissements */}
          {result.avertissements && result.avertissements.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" />
                    <Typography variant="h6">
                      Avertissements ({result.avertissements.length})
                    </Typography>
                  </Box>
                }
                sx={{ bgcolor: 'warning.light' }}
              />
              <CardContent sx={{ p: 0 }}>
                <List dense>
                  {result.avertissements.map((avertissement, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="warning" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {avertissement.compte && (
                                <Typography
                                  component="span"
                                  sx={{ fontFamily: 'monospace', fontWeight: 600, mr: 1 }}
                                >
                                  [{avertissement.compte}]
                                </Typography>
                              )}
                              {avertissement.message}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography variant="caption" color="text.secondary">
                                Type: {avertissement.type}
                              </Typography>
                              {avertissement.details && (
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                  {avertissement.details}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < result.avertissements.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Classes manquantes */}
          {result.classes_manquantes && result.classes_manquantes.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info color="info" />
                    <Typography variant="h6">
                      Classes Manquantes ({result.classes_manquantes.length})
                    </Typography>
                  </Box>
                }
                sx={{ bgcolor: 'info.light' }}
              />
              <CardContent sx={{ p: 0 }}>
                <List dense>
                  {result.classes_manquantes.map((classe, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon>
                          <Typography
                            variant="h6"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: 'info.main',
                            }}
                          >
                            {classe.classe}
                          </Typography>
                        </ListItemIcon>
                        <ListItemText
                          primary={classe.libelle}
                          secondary={
                            <Chip
                              label={classe.importance}
                              size="small"
                              color={classe.importance === 'OBLIGATOIRE' ? 'error' : 'warning'}
                              sx={{ mt: 0.5 }}
                            />
                          }
                        />
                      </ListItem>
                      {index < result.classes_manquantes.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Recommandations */}
          {result.recommandations && result.recommandations.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp color="success" />
                    <Typography variant="h6">
                      Recommandations ({result.recommandations.length})
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <List dense>
                  {result.recommandations.map((recommandation, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2">{recommandation}</Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Classes présentes */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment color="primary" />
                <Typography variant="h6">
                  Classes Présentes ({result.statistiques.classes_presentes.length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {result.statistiques.classes_presentes.map((classe) => (
                  <Chip
                    key={classe}
                    label={`Classe ${classe}`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* État conforme sans erreurs */}
          {result.conforme && result.erreurs.length === 0 && result.avertissements.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'success.light', mt: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.dark', mb: 1 }}>
                Plan Comptable Conforme
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Votre plan comptable respecte toutes les exigences SYSCOHADA/OHADA.
                Aucune correction n'est nécessaire.
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* État initial */}
      {!result && !loading && !error && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Security sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Validation du Plan Comptable
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cliquez sur "Valider" pour vérifier la conformité de votre plan comptable
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default PlanComptableValidation
