import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Pagination,
  LinearProgress,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  CompareArrows as CompareIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material'
import { apiClient } from '../../services/apiClient'

// Types
interface AuditSession {
  id: string
  entreprise: string
  entreprise_detail?: {
    id: string
    nom: string
    siret: string
  }
  exercice: string
  exercice_detail?: {
    id: string
    annee: number
    date_debut: string
    date_fin: string
  }
  type_audit: 'COMPLET' | 'PARTIEL' | 'CIBLÉ' | 'FLASH'
  statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINÉ' | 'ERREUR' | 'ANNULÉ'
  score_global?: number
  nb_anomalies_total: number
  nb_anomalies_critiques: number
  nb_anomalies_majeures: number
  nb_anomalies_mineures: number
  nb_anomalies_resolues: number
  date_debut: string
  date_fin?: string
  duree_execution?: number
  utilisateur: string
  utilisateur_detail?: {
    username: string
    full_name: string
  }
  parametres?: any
  resultats?: any
  created_at: string
  updated_at: string
}

interface AuditStatistics {
  total_audits: number
  audits_en_cours: number
  audits_termines: number
  audits_erreur: number
  score_moyen?: number
  anomalies_non_resolues: number
  taux_resolution?: number
  duree_moyenne?: number
}

interface AuditAnomalie {
  id: string
  session_audit: string
  regle: string
  regle_detail?: {
    code: string
    libelle: string
    severite: 'CRITIQUE' | 'MAJEURE' | 'MINEURE' | 'INFO'
  }
  severite: 'CRITIQUE' | 'MAJEURE' | 'MINEURE' | 'INFO'
  description: string
  compte_concerne?: string
  montant_ecart?: number
  statut: 'NOUVELLE' | 'EN_COURS' | 'RESOLUE' | 'IGNOREE'
  resolution?: string
  date_resolution?: string
  created_at: string
}

interface ComparisonResult {
  audit1: AuditSession
  audit2: AuditSession
  score_evolution: number
  anomalies_evolution: {
    total: number
    critiques: number
    majeures: number
    mineures: number
  }
  nouvelles_anomalies: number
  anomalies_resolues: number
  anomalies_persistantes: number
  recommendations?: string[]
}

const AuditHistory: React.FC = () => {
  // State for sessions list
  const [sessions, setSessions] = useState<AuditSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // Statistics
  const [statistics, setStatistics] = useState<AuditStatistics | null>(null)

  // Filters
  const [entrepriseFilter, setEntrepriseFilter] = useState('')
  const [exerciceFilter, setExerciceFilter] = useState('')
  const [typeAuditFilter, setTypeAuditFilter] = useState<string>('ALL')
  const [statutFilter, setStatutFilter] = useState<string>('ALL')
  const [dateDebutFilter, setDateDebutFilter] = useState('')
  const [dateFinFilter, setDateFinFilter] = useState('')

  // Details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<AuditSession | null>(null)
  const [sessionAnomalies, setSessionAnomalies] = useState<AuditAnomalie[]>([])
  const [anomaliesLoading, setAnomaliesLoading] = useState(false)

  // Comparison
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
  const [comparisonLoading, setComparisonLoading] = useState(false)

  // Load sessions on mount and when filters change
  useEffect(() => {
    loadSessions()
    loadStatistics()
  }, [page, entrepriseFilter, exerciceFilter, typeAuditFilter, statutFilter, dateDebutFilter, dateFinFilter])

  const loadSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const params: any = {
        page,
        page_size: pageSize
      }

      if (entrepriseFilter) params.entreprise = entrepriseFilter
      if (exerciceFilter) params.exercice = exerciceFilter
      if (typeAuditFilter !== 'ALL') params.type_audit = typeAuditFilter
      if (statutFilter !== 'ALL') params.statut = statutFilter
      if (dateDebutFilter) params.date_debut_after = dateDebutFilter
      if (dateFinFilter) params.date_debut_before = dateFinFilter

      const response = await apiClient.get('/api/v1/audit/sessions/', { params }) as Record<string, any>

      setSessions(response.data.results || response.data)
      setTotalCount(response.data.count || response.data.length)
      setTotalPages(Math.ceil((response.data.count || response.data.length) / pageSize))
    } catch (err: any) {
      console.error('Error loading audit sessions:', err)
      setError(err.response?.data?.detail || 'Erreur lors du chargement des sessions d\'audit')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const params: any = {}
      if (entrepriseFilter) params.entreprise = entrepriseFilter
      if (exerciceFilter) params.exercice = exerciceFilter

      const response = await apiClient.get('/api/v1/audit/statistics/', { params }) as Record<string, any>
      setStatistics(response.data)
    } catch (err) {
      console.error('Error loading statistics:', err)
    }
  }

  const handleViewDetails = async (session: AuditSession) => {
    setSelectedSession(session)
    setDetailsDialogOpen(true)
    setAnomaliesLoading(true)
    setSessionAnomalies([])

    try {
      const response = await apiClient.get(`/api/v1/audit/sessions/${session.id}/anomalies/`) as Record<string, any>
      setSessionAnomalies(response.data.results || response.data)
    } catch (err) {
      console.error('Error loading anomalies:', err)
    } finally {
      setAnomaliesLoading(false)
    }
  }

  const handleDownloadReport = async (session: AuditSession, format: 'PDF' | 'EXCEL') => {
    try {
      const response = await apiClient.get(
        `/api/v1/audit/sessions/${session.id}/download/`,
        {
          params: { format },
          responseType: 'blob'
        }
      ) as Record<string, any>

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `audit_${session.id}_${format.toLowerCase()}.${format === 'PDF' ? 'pdf' : 'xlsx'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Error downloading report:', err)
      setError('Erreur lors du téléchargement du rapport')
    }
  }

  const handleToggleComparisonSelection = (sessionId: string) => {
    if (selectedForComparison.includes(sessionId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== sessionId))
    } else {
      if (selectedForComparison.length < 2) {
        setSelectedForComparison([...selectedForComparison, sessionId])
      }
    }
  }

  const handleCompareAudits = async () => {
    if (selectedForComparison.length !== 2) {
      setError('Veuillez sélectionner exactement 2 audits à comparer')
      return
    }

    setComparisonLoading(true)
    setComparisonDialogOpen(true)
    setComparisonResult(null)

    try {
      const response = await apiClient.get('/api/v1/audit/compare/', {
        params: {
          audit1: selectedForComparison[0],
          audit2: selectedForComparison[1]
        }
      }) as Record<string, any>
      setComparisonResult(response.data)
    } catch (err: any) {
      console.error('Error comparing audits:', err)
      setError(err.response?.data?.detail || 'Erreur lors de la comparaison des audits')
    } finally {
      setComparisonLoading(false)
    }
  }

  const resetFilters = () => {
    setEntrepriseFilter('')
    setExerciceFilter('')
    setTypeAuditFilter('ALL')
    setStatutFilter('ALL')
    setDateDebutFilter('')
    setDateFinFilter('')
    setPage(1)
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'TERMINÉ':
        return <CheckCircleIcon />
      case 'EN_COURS':
        return <HourglassIcon />
      case 'ERREUR':
        return <ErrorIcon />
      case 'ANNULÉ':
        return <CancelIcon />
      default:
        return <HourglassIcon />
    }
  }

  const getStatutColor = (statut: string): 'success' | 'warning' | 'error' | 'default' | 'info' => {
    switch (statut) {
      case 'TERMINÉ':
        return 'success'
      case 'EN_COURS':
        return 'info'
      case 'ERREUR':
        return 'error'
      case 'ANNULÉ':
        return 'default'
      default:
        return 'warning'
    }
  }

  const getSeveriteColor = (severite: string): 'error' | 'warning' | 'info' | 'default' => {
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

  const getScoreColor = (score?: number): string => {
    if (!score) return 'text.secondary'
    if (score >= 80) return 'success.main'
    if (score >= 60) return 'warning.main'
    return 'error.main'
  }

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Historique des Audits
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={compareMode ? 'contained' : 'outlined'}
            startIcon={<CompareIcon />}
            onClick={() => {
              setCompareMode(!compareMode)
              setSelectedForComparison([])
            }}
          >
            Mode Comparaison
          </Button>
          {compareMode && selectedForComparison.length === 2 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<CompareIcon />}
              onClick={handleCompareAudits}
            >
              Comparer ({selectedForComparison.length})
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              loadSessions()
              loadStatistics()
            }}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Audits
                </Typography>
                <Typography variant="h4">
                  {statistics.total_audits}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistics.audits_termines} terminés
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  En Cours
                </Typography>
                <Typography variant="h4" color="info.main">
                  {statistics.audits_en_cours}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistics.audits_erreur} en erreur
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Score Moyen
                </Typography>
                <Typography variant="h4" sx={{ color: getScoreColor(statistics.score_moyen) }}>
                  {statistics.score_moyen ? `${statistics.score_moyen.toFixed(1)}%` : 'N/A'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistics.taux_resolution ? `${statistics.taux_resolution.toFixed(1)}% résolution` : ''}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Anomalies Non Résolues
                </Typography>
                <Typography variant="h4" color="error.main">
                  {statistics.anomalies_non_resolues}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Durée moy: {formatDuration(statistics.duree_moyenne)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filtres</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Entreprise ID"
                value={entrepriseFilter}
                onChange={(e) => {
                  setEntrepriseFilter(e.target.value)
                  setPage(1)
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Exercice ID"
                value={exerciceFilter}
                onChange={(e) => {
                  setExerciceFilter(e.target.value)
                  setPage(1)
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type Audit</InputLabel>
                <Select
                  value={typeAuditFilter}
                  label="Type Audit"
                  onChange={(e) => {
                    setTypeAuditFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <MenuItem value="ALL">Tous</MenuItem>
                  <MenuItem value="COMPLET">Complet</MenuItem>
                  <MenuItem value="PARTIEL">Partiel</MenuItem>
                  <MenuItem value="CIBLÉ">Ciblé</MenuItem>
                  <MenuItem value="FLASH">Flash</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statutFilter}
                  label="Statut"
                  onChange={(e) => {
                    setStatutFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <MenuItem value="ALL">Tous</MenuItem>
                  <MenuItem value="EN_ATTENTE">En attente</MenuItem>
                  <MenuItem value="EN_COURS">En cours</MenuItem>
                  <MenuItem value="TERMINÉ">Terminé</MenuItem>
                  <MenuItem value="ERREUR">Erreur</MenuItem>
                  <MenuItem value="ANNULÉ">Annulé</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date début (après)"
                value={dateDebutFilter}
                onChange={(e) => {
                  setDateDebutFilter(e.target.value)
                  setPage(1)
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date début (avant)"
                value={dateFinFilter}
                onChange={(e) => {
                  setDateFinFilter(e.target.value)
                  setPage(1)
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Sessions d'Audit ({totalCount})
            </Typography>
          </Box>

          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  {compareMode && <TableCell padding="checkbox">Sélection</TableCell>}
                  <TableCell>ID</TableCell>
                  <TableCell>Entreprise</TableCell>
                  <TableCell>Exercice</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Anomalies</TableCell>
                  <TableCell>Date Début</TableCell>
                  <TableCell>Durée</TableCell>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={compareMode ? 12 : 11} align="center">
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        Aucune session d'audit trouvée
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow
                      key={session.id}
                      sx={{
                        bgcolor: selectedForComparison.includes(session.id) ? 'action.selected' : undefined
                      }}
                    >
                      {compareMode && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedForComparison.includes(session.id)}
                            onChange={() => handleToggleComparisonSelection(session.id)}
                            disabled={
                              !selectedForComparison.includes(session.id) &&
                              selectedForComparison.length >= 2
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {session.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {session.entreprise_detail?.nom || session.entreprise}
                      </TableCell>
                      <TableCell>
                        {session.exercice_detail?.annee || session.exercice}
                      </TableCell>
                      <TableCell>
                        <Chip label={session.type_audit} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatutIcon(session.statut)}
                          label={session.statut}
                          color={getStatutColor(session.statut)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {session.score_global !== null && session.score_global !== undefined ? (
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ color: getScoreColor(session.score_global) }}
                          >
                            {session.score_global.toFixed(1)}%
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Chip
                            label={`${session.nb_anomalies_total}`}
                            size="small"
                            sx={{ mr: 0.5 }}
                          />
                          {session.nb_anomalies_critiques > 0 && (
                            <Chip
                              label={`${session.nb_anomalies_critiques} C`}
                              size="small"
                              color="error"
                              sx={{ mr: 0.5 }}
                            />
                          )}
                          {session.nb_anomalies_resolues > 0 && (
                            <Chip
                              label={`${session.nb_anomalies_resolues} ✓`}
                              size="small"
                              color="success"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(session.date_debut).toLocaleString('fr-FR')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDuration(session.duree_execution)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {session.utilisateur_detail?.full_name || session.utilisateur}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir détails">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(session)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        {session.statut === 'TERMINÉ' && (
                          <>
                            <Tooltip title="Télécharger PDF">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadReport(session, 'PDF')}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Télécharger Excel">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadReport(session, 'EXCEL')}
                              >
                                <AssessmentIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Détails de la Session d'Audit
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Session Info */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Informations Générales
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="ID"
                            secondary={selectedSession.id}
                            secondaryTypographyProps={{ sx: { fontFamily: 'monospace' } }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Entreprise"
                            secondary={selectedSession.entreprise_detail?.nom || selectedSession.entreprise}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Exercice"
                            secondary={
                              selectedSession.exercice_detail
                                ? `${selectedSession.exercice_detail.annee} (${new Date(selectedSession.exercice_detail.date_debut).toLocaleDateString('fr-FR')} - ${new Date(selectedSession.exercice_detail.date_fin).toLocaleDateString('fr-FR')})`
                                : selectedSession.exercice
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Type d'Audit"
                            secondary={selectedSession.type_audit}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Statut"
                            secondary={
                              <Chip
                                icon={getStatutIcon(selectedSession.statut)}
                                label={selectedSession.statut}
                                color={getStatutColor(selectedSession.statut)}
                                size="small"
                              />
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Utilisateur"
                            secondary={selectedSession.utilisateur_detail?.full_name || selectedSession.utilisateur}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Performance Metrics */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Métriques de Performance
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Score Global"
                            secondary={
                              selectedSession.score_global !== null && selectedSession.score_global !== undefined ? (
                                <Typography
                                  variant="h4"
                                  sx={{ color: getScoreColor(selectedSession.score_global) }}
                                >
                                  {selectedSession.score_global.toFixed(1)}%
                                </Typography>
                              ) : (
                                'N/A'
                              )
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Date Début"
                            secondary={new Date(selectedSession.date_debut).toLocaleString('fr-FR')}
                          />
                        </ListItem>
                        {selectedSession.date_fin && (
                          <ListItem>
                            <ListItemText
                              primary="Date Fin"
                              secondary={new Date(selectedSession.date_fin).toLocaleString('fr-FR')}
                            />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemText
                            primary="Durée d'Exécution"
                            secondary={formatDuration(selectedSession.duree_execution)}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Anomalies Summary */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Résumé des Anomalies
                      </Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6} md={3}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4">{selectedSession.nb_anomalies_total}</Typography>
                            <Typography variant="caption" color="text.secondary">Total</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'error.lighter' }}>
                            <Typography variant="h4" color="error">
                              {selectedSession.nb_anomalies_critiques}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Critiques</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.lighter' }}>
                            <Typography variant="h4" color="warning.main">
                              {selectedSession.nb_anomalies_majeures}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Majeures</Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'success.lighter' }}>
                            <Typography variant="h4" color="success.main">
                              {selectedSession.nb_anomalies_resolues}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Résolues</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Anomalies List */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Liste des Anomalies
                      </Typography>
                      {anomaliesLoading ? (
                        <LinearProgress />
                      ) : sessionAnomalies && sessionAnomalies.length > 0 ? (
                        <Box sx={{ mt: 2 }}>
                          {sessionAnomalies.map((anomalie) => (
                            <Accordion key={anomalie.id}>
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                  <Chip
                                    label={anomalie.severite}
                                    color={getSeveriteColor(anomalie.severite)}
                                    size="small"
                                  />
                                  <Typography sx={{ flexGrow: 1 }}>
                                    {anomalie.regle_detail?.libelle || anomalie.regle}
                                  </Typography>
                                  <Chip
                                    label={anomalie.statut}
                                    size="small"
                                    color={anomalie.statut === 'RESOLUE' ? 'success' : 'default'}
                                  />
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Stack spacing={2}>
                                  <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                      Description:
                                    </Typography>
                                    <Typography variant="body2">
                                      {anomalie.description}
                                    </Typography>
                                  </Box>
                                  {anomalie.compte_concerne && (
                                    <Box>
                                      <Typography variant="subtitle2" color="text.secondary">
                                        Compte Concerné:
                                      </Typography>
                                      <Typography variant="body2">
                                        {anomalie.compte_concerne}
                                      </Typography>
                                    </Box>
                                  )}
                                  {anomalie.montant_ecart && (
                                    <Box>
                                      <Typography variant="subtitle2" color="text.secondary">
                                        Montant Écart:
                                      </Typography>
                                      <Typography variant="body2">
                                        {anomalie.montant_ecart.toLocaleString('fr-FR', {
                                          style: 'currency',
                                          currency: 'EUR'
                                        })}
                                      </Typography>
                                    </Box>
                                  )}
                                  {anomalie.resolution && (
                                    <Box>
                                      <Typography variant="subtitle2" color="text.secondary">
                                        Résolution:
                                      </Typography>
                                      <Typography variant="body2">
                                        {anomalie.resolution}
                                      </Typography>
                                      {anomalie.date_resolution && (
                                        <Typography variant="caption" color="text.secondary">
                                          Résolu le: {new Date(anomalie.date_resolution).toLocaleString('fr-FR')}
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                </Stack>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </Box>
                      ) : (
                        <Alert severity="success">
                          Aucune anomalie détectée pour cette session
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog
        open={comparisonDialogOpen}
        onClose={() => setComparisonDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Comparaison des Audits
        </DialogTitle>
        <DialogContent>
          {comparisonLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <LinearProgress sx={{ width: '100%' }} />
            </Box>
          ) : comparisonResult ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Audit Info Comparison */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary">
                        Audit 1
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="ID"
                            secondary={comparisonResult.audit1.id.substring(0, 16)}
                            secondaryTypographyProps={{ sx: { fontFamily: 'monospace' } }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Date"
                            secondary={new Date(comparisonResult.audit1.date_debut).toLocaleString('fr-FR')}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Score"
                            secondary={
                              <Typography variant="h5" sx={{ color: getScoreColor(comparisonResult.audit1.score_global) }}>
                                {comparisonResult.audit1.score_global?.toFixed(1)}%
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Anomalies"
                            secondary={`${comparisonResult.audit1.nb_anomalies_total} (${comparisonResult.audit1.nb_anomalies_critiques} critiques)`}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="secondary">
                        Audit 2
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="ID"
                            secondary={comparisonResult.audit2.id.substring(0, 16)}
                            secondaryTypographyProps={{ sx: { fontFamily: 'monospace' } }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Date"
                            secondary={new Date(comparisonResult.audit2.date_debut).toLocaleString('fr-FR')}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Score"
                            secondary={
                              <Typography variant="h5" sx={{ color: getScoreColor(comparisonResult.audit2.score_global) }}>
                                {comparisonResult.audit2.score_global?.toFixed(1)}%
                              </Typography>
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Anomalies"
                            secondary={`${comparisonResult.audit2.nb_anomalies_total} (${comparisonResult.audit2.nb_anomalies_critiques} critiques)`}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Evolution Metrics */}
                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Évolution
                      </Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={4}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              {comparisonResult.score_evolution > 0 ? (
                                <TrendingUpIcon color="success" />
                              ) : comparisonResult.score_evolution < 0 ? (
                                <TrendingDownIcon color="error" />
                              ) : null}
                              <Typography
                                variant="h4"
                                color={
                                  comparisonResult.score_evolution > 0
                                    ? 'success.main'
                                    : comparisonResult.score_evolution < 0
                                    ? 'error.main'
                                    : 'text.secondary'
                                }
                              >
                                {comparisonResult.score_evolution > 0 ? '+' : ''}
                                {comparisonResult.score_evolution.toFixed(1)}%
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Évolution Score
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main">
                              {comparisonResult.nouvelles_anomalies}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Nouvelles Anomalies
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: 'success.lighter' }}>
                            <Typography variant="h4" color="success.main">
                              {comparisonResult.anomalies_resolues}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Anomalies Résolues
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4">
                              {comparisonResult.anomalies_persistantes}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Anomalies Persistantes
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4" color={comparisonResult.anomalies_evolution.critiques > 0 ? 'error' : 'success'}>
                              {comparisonResult.anomalies_evolution.critiques > 0 ? '+' : ''}
                              {comparisonResult.anomalies_evolution.critiques}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Évolution Critiques
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h4">
                              {comparisonResult.anomalies_evolution.total > 0 ? '+' : ''}
                              {comparisonResult.anomalies_evolution.total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Évolution Total Anomalies
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Recommendations */}
                {comparisonResult.recommendations && comparisonResult.recommendations.length > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="info" icon={<AnalyticsIcon />}>
                      <AlertTitle>Recommandations</AlertTitle>
                      <List dense>
                        {comparisonResult.recommendations.map((rec, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={rec} />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : (
            <Alert severity="info">
              Sélectionnez deux audits à comparer
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComparisonDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AuditHistory
