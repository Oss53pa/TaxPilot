/**
 * Composant Mapping Automatique des Comptes
 * Mapping intelligent vers référentiel SYSCOHADA/OHADA
 */

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
} from '@mui/material'
import {
  AutoFixHigh,
  Refresh,
  ArrowForward,
  Save,
  Warning,
  TrendingUp,
} from '@mui/icons-material'
import { accountingService } from '@/services/accountingService'

interface MappingResult {
  compte_source: {
    id: string
    numero: string
    libelle: string
  }
  compte_destination: {
    numero: string
    libelle: string
    classe: number
  }
  score_confiance: number
  methode: 'EXACT' | 'FUZZY' | 'SEMANTIC' | 'ML'
  raison?: string
  validé?: boolean
}

interface MappingResponse {
  resultats: MappingResult[]
  statistiques: {
    total_comptes: number
    comptes_mappes: number
    comptes_non_mappes: number
    score_moyen: number
    methodes_utilisees: Record<string, number>
  }
  suggestions: Array<{
    compte: string
    suggestion: string
    raison: string
  }>
  comptes_non_mappes: Array<{
    id: string
    numero: string
    libelle: string
    raison: string
  }>
}

interface MappingAutomatiqueProps {
  entrepriseId: string
  entrepriseName?: string
  onMappingComplete?: () => void
}

const MappingAutomatique: React.FC<MappingAutomatiqueProps> = ({
  entrepriseId,
  entrepriseName,
  onMappingComplete,
}) => {
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [result, setResult] = useState<MappingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedMappings, setSelectedMappings] = useState<Set<number>>(new Set())
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const handleGenerateMapping = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await accountingService.mappingAutomatique(entrepriseId) as MappingResponse
      setResult(data)

      // Sélectionner automatiquement les mappings avec score > 80%
      const highConfidenceMappings = new Set<number>()
      data.resultats.forEach((mapping: any, index: any) => {
        if (mapping.score_confiance >= 80) {
          highConfidenceMappings.add(index)
        }
      })
      setSelectedMappings(highConfidenceMappings)
    } catch (err: any) {
      console.error('Mapping generation failed:', err)
      setError(err.message || 'Erreur lors de la génération du mapping')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMapping = (index: number) => {
    const newSelection = new Set(selectedMappings)
    if (newSelection.has(index)) {
      newSelection.delete(index)
    } else {
      newSelection.add(index)
    }
    setSelectedMappings(newSelection)
  }

  const handleToggleAll = () => {
    if (selectedMappings.size === result?.resultats.length) {
      setSelectedMappings(new Set())
    } else {
      const allIndices = new Set(result?.resultats.map((_, idx) => idx))
      setSelectedMappings(allIndices)
    }
  }

  const handleApplyMappings = async () => {
    if (selectedMappings.size === 0) {
      setError('Veuillez sélectionner au moins un mapping à appliquer')
      return
    }

    setConfirmDialogOpen(true)
  }

  const confirmApplyMappings = async () => {
    try {
      setApplying(true)
      setConfirmDialogOpen(false)

      // TODO: Appeler l'endpoint d'application des mappings
      // await accountingService.applyMappings(entrepriseId, selectedMappingsData)

      // Simulation pour l'instant
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (onMappingComplete) {
        onMappingComplete()
      }

      setError(null)
      // Recharger après succès
      await handleGenerateMapping()
    } catch (err: any) {
      console.error('Applying mappings failed:', err)
      setError(err.message || 'Erreur lors de l\'application des mappings')
    } finally {
      setApplying(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'success'
    if (score >= 70) return 'info'
    if (score >= 50) return 'warning'
    return 'error'
  }

  const getMethodeLabel = (methode: string) => {
    const labels: Record<string, string> = {
      EXACT: 'Correspondance exacte',
      FUZZY: 'Correspondance floue',
      SEMANTIC: 'Analyse sémantique',
      ML: 'Intelligence artificielle',
    }
    return labels[methode] || methode
  }

  const getMethodeColor = (methode: string) => {
    const colors: Record<string, any> = {
      EXACT: 'success',
      FUZZY: 'info',
      SEMANTIC: 'warning',
      ML: 'secondary',
    }
    return colors[methode] || 'default'
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Mapping Automatique des Comptes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Correspondance intelligente avec le référentiel SYSCOHADA/OHADA
          </Typography>
          {entrepriseName && (
            <Typography variant="caption" color="text.secondary">
              Entreprise: {entrepriseName}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={handleGenerateMapping}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Refresh />}
          >
            {loading ? 'Génération...' : 'Générer Mapping'}
          </Button>
          {result && selectedMappings.size > 0 && (
            <Button
              variant="contained"
              onClick={handleApplyMappings}
              disabled={applying}
              startIcon={applying ? <CircularProgress size={20} /> : <Save />}
            >
              {applying ? 'Application...' : `Appliquer (${selectedMappings.size})`}
            </Button>
          )}
        </Stack>
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
              Analyse en cours...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Génération intelligente du mapping avec l'IA
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Statistiques */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Comptes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                    {result.statistiques.total_comptes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="success.main">
                    Mappés
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'success.main' }}>
                    {result.statistiques.comptes_mappes}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {((result.statistiques.comptes_mappes / result.statistiques.total_comptes) * 100).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="error.main">
                    Non Mappés
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'error.main' }}>
                    {result.statistiques.comptes_non_mappes}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Score Moyen
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      mt: 1,
                      color: `${getScoreColor(result.statistiques.score_moyen)}.main`,
                    }}
                  >
                    {result.statistiques.score_moyen.toFixed(0)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Table des mappings */}
          {result.resultats.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Mappings Proposés ({result.resultats.length})
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedMappings.size === result.resultats.length}
                          indeterminate={
                            selectedMappings.size > 0 && selectedMappings.size < result.resultats.length
                          }
                          onChange={handleToggleAll}
                        />
                      }
                      label="Tout sélectionner"
                    />
                  </Box>
                }
              />
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width={60}></TableCell>
                        <TableCell>Compte Source</TableCell>
                        <TableCell width={80} align="center">
                          <ArrowForward color="action" />
                        </TableCell>
                        <TableCell>Compte SYSCOHADA</TableCell>
                        <TableCell>Score</TableCell>
                        <TableCell>Méthode</TableCell>
                        <TableCell>Raison</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result.resultats.map((mapping, index) => (
                        <TableRow
                          key={index}
                          hover
                          selected={selectedMappings.has(index)}
                          sx={{
                            bgcolor: selectedMappings.has(index) ? 'action.selected' : undefined,
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedMappings.has(index)}
                              onChange={() => handleToggleMapping(index)}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {mapping.compte_source.numero}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {mapping.compte_source.libelle}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <ArrowForward color="primary" />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                              {mapping.compte_destination.numero}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {mapping.compte_destination.libelle}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={mapping.score_confiance}
                                color={getScoreColor(mapping.score_confiance)}
                                sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 600,
                                  color: `${getScoreColor(mapping.score_confiance)}.main`,
                                  minWidth: 40,
                                }}
                              >
                                {mapping.score_confiance.toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={getMethodeLabel(mapping.methode)}
                              size="small"
                              color={getMethodeColor(mapping.methode)}
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {mapping.raison || '-'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Comptes non mappés */}
          {result.comptes_non_mappes.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning color="warning" />
                    <Typography variant="h6">
                      Comptes Non Mappés ({result.comptes_non_mappes.length})
                    </Typography>
                  </Box>
                }
                sx={{ bgcolor: 'warning.light' }}
              />
              <CardContent sx={{ p: 0 }}>
                <List dense>
                  {result.comptes_non_mappes.map((compte, index) => (
                    <React.Fragment key={compte.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              <Typography
                                component="span"
                                sx={{ fontFamily: 'monospace', fontWeight: 600, mr: 1 }}
                              >
                                {compte.numero}
                              </Typography>
                              {compte.libelle}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              Raison: {compte.raison}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < result.comptes_non_mappes.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp color="info" />
                    <Typography variant="h6">
                      Suggestions d'Amélioration ({result.suggestions.length})
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <List dense>
                  {result.suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={suggestion.suggestion}
                        secondary={
                          <>
                            <Typography variant="caption" display="block">
                              Compte: {suggestion.compte}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {suggestion.raison}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* État initial */}
      {!result && !loading && !error && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <AutoFixHigh sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Mapping Automatique Intelligent
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Utilisez l'IA pour mapper automatiquement vos comptes vers le référentiel SYSCOHADA
          </Typography>
          <Button variant="contained" onClick={handleGenerateMapping} startIcon={<AutoFixHigh />}>
            Générer le Mapping
          </Button>
        </Paper>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmer l'Application des Mappings</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action va modifier {selectedMappings.size} compte(s). Cette opération est irréversible.
          </Alert>
          <Typography variant="body2">
            Êtes-vous sûr de vouloir appliquer les mappings sélectionnés ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Annuler</Button>
          <Button onClick={confirmApplyMappings} variant="contained" color="primary">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MappingAutomatique
