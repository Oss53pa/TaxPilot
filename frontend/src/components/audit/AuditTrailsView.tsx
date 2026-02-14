/**
 * Composant Pistes d'Audit Immuables (Audit Trails)
 * Affichage et vérification de l'intégrité des logs d'audit
 * Phase 1.3: Immutable audit logs avec vérification blockchain-like
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Pagination,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import {
  Refresh,
  Verified,
  Warning,
  Info,
  CheckCircle,
  Error,
  FilterList,
  Security,
  VerifiedUser,
  Link as LinkIcon,
  Search,
  Close,
} from '@mui/icons-material'
import { apiClient } from '@/services/apiClient'

interface AuditLogEntry {
  id: string
  sequence_number: number
  timestamp: string
  action_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXECUTE' | 'EXPORT'
  action_description: string
  user: string
  user_detail?: {
    username: string
    full_name: string
  }
  object_model: string
  object_id: string
  object_repr: string
  content_type: string
  changes_summary?: any
  ip_address?: string
  user_agent?: string
  success: boolean
  error_message?: string
  correlation_id?: string
  current_hash: string
  previous_hash: string
  created_at: string
}

interface VerificationResult {
  is_valid: boolean
  message: string
  total_entries?: number
  invalid_count?: number
  invalid_entries?: Array<{
    sequence_number: number
    timestamp: string
    action_type: string
    error: string
  }>
}

const AuditTrailsView: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [error, setError] = useState<string | null>(null)

  // Filtres
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('')
  const [objectModelFilter, setObjectModelFilter] = useState<string>('')
  const [userFilter, setUserFilter] = useState<string>('')
  const [successFilter, setSuccessFilter] = useState<string>('')
  const [correlationId, setCorrelationId] = useState<string>('')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(50)

  // Statistiques
  const [stats, setStats] = useState({
    total_entries: 0,
    total_users: 0,
    success_rate: 0,
    latest_sequence: 0,
  })

  // Vérification intégrité
  const [verifying, setVerifying] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)

  // Dialog détails
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  useEffect(() => {
    loadAuditLogs()
    loadStatistics()
  }, [page, actionTypeFilter, objectModelFilter, userFilter, successFilter])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page,
        page_size: pageSize,
      }

      if (actionTypeFilter) {
        params.action_type = actionTypeFilter
      }

      if (objectModelFilter) {
        params.object_model = objectModelFilter
      }

      if (userFilter) {
        params.user = userFilter
      }

      if (successFilter) {
        params.success = successFilter
      }

      if (correlationId) {
        params.correlation_id = correlationId
      }

      const response = await apiClient.get('/api/v1/audit/audit-logs/', params) as Record<string, any>

      setLogs(response.results || [])
      setTotalPages(Math.ceil((response.count || 0) / pageSize))
    } catch (err: any) {
      console.error('Failed to load audit logs:', err)
      setError(err.message || 'Erreur lors du chargement des pistes d\'audit')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await apiClient.get('/api/v1/audit/audit-logs/statistics/') as Record<string, any>
      setStats({
        total_entries: response.total_entries || 0,
        total_users: response.total_users || 0,
        success_rate: response.success_rate?.rate || 0,
        latest_sequence: response.latest_sequence || 0,
      })
    } catch (err: any) {
      console.error('Failed to load statistics:', err)
    }
  }

  const handleVerifyChain = async () => {
    try {
      setVerifying(true)
      setError(null)

      const response = await apiClient.get('/api/v1/audit/audit-logs/verify_chain/') as Record<string, any>
      setVerificationResult(response as any)
      setVerificationDialogOpen(true)
    } catch (err: any) {
      console.error('Chain verification failed:', err)
      setError(err.message || 'Erreur lors de la vérification de l\'intégrité')
    } finally {
      setVerifying(false)
    }
  }

  const handleVerifyEntry = async (entry: AuditLogEntry) => {
    try {
      const response = await apiClient.get(`/api/v1/audit/audit-logs/${entry.id}/verify_entry/`) as Record<string, any>

      setVerificationResult({
        is_valid: response.is_valid,
        message: response.message,
      })
      setVerificationDialogOpen(true)
    } catch (err: any) {
      console.error('Entry verification failed:', err)
      setError(err.message || 'Erreur lors de la vérification')
    }
  }

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log)
    setDetailsDialogOpen(true)
  }

  const handleSearchByCorrelation = async () => {
    if (!correlationId) return

    try {
      setLoading(true)
      const response = await apiClient.get('/api/v1/audit/audit-logs/by_correlation/', {
        correlation_id: correlationId
      }) as Record<string, any>
      setLogs(response.entries || [])
      setTotalPages(1)
    } catch (err: any) {
      console.error('Correlation search failed:', err)
      setError(err.message || 'Erreur lors de la recherche par corrélation')
    } finally {
      setLoading(false)
    }
  }

  const handleResetFilters = () => {
    setActionTypeFilter('')
    setObjectModelFilter('')
    setUserFilter('')
    setSuccessFilter('')
    setCorrelationId('')
    setPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR')
  }

  const getActionTypeColor = (actionType: string) => {
    const colors: Record<string, any> = {
      CREATE: 'success',
      UPDATE: 'info',
      DELETE: 'error',
      VIEW: 'default',
      EXECUTE: 'warning',
      EXPORT: 'primary',
    }
    return colors[actionType] || 'default'
  }

  const getActionTypeIcon = (actionType: string) => {
    const icons: Record<string, any> = {
      CREATE: <CheckCircle fontSize="small" />,
      UPDATE: <Info fontSize="small" />,
      DELETE: <Error fontSize="small" />,
      VIEW: <Search fontSize="small" />,
      EXECUTE: <Warning fontSize="small" />,
      EXPORT: <LinkIcon fontSize="small" />,
    }
    return icons[actionType]
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Pistes d'Audit Immuables
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Journalisation sécurisée avec vérification d'intégrité blockchain
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            onClick={loadAuditLogs}
            startIcon={<Refresh />}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            onClick={handleVerifyChain}
            disabled={verifying}
            startIcon={verifying ? <CircularProgress size={20} /> : <Verified />}
            color="secondary"
          >
            {verifying ? 'Vérification...' : 'Vérifier Intégrité'}
          </Button>
        </Stack>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total Entrées
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {stats.total_entries.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Utilisateurs
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {stats.total_users}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="success.main">
                Taux de Succès
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'success.main' }}>
                {stats.success_rate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Dernière Séquence
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, fontFamily: 'monospace' }}>
                #{stats.latest_sequence}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterList color="primary" />
              <Typography variant="h6">Filtres</Typography>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type d'Action</InputLabel>
                <Select
                  value={actionTypeFilter}
                  onChange={(e) => setActionTypeFilter(e.target.value)}
                  label="Type d'Action"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="CREATE">Création</MenuItem>
                  <MenuItem value="UPDATE">Modification</MenuItem>
                  <MenuItem value="DELETE">Suppression</MenuItem>
                  <MenuItem value="VIEW">Consultation</MenuItem>
                  <MenuItem value="EXECUTE">Exécution</MenuItem>
                  <MenuItem value="EXPORT">Export</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Modèle</InputLabel>
                <Select
                  value={objectModelFilter}
                  onChange={(e) => setObjectModelFilter(e.target.value)}
                  label="Modèle"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="Balance">Balance</MenuItem>
                  <MenuItem value="EcritureComptable">Écriture</MenuItem>
                  <MenuItem value="LiasseFiscale">Liasse Fiscale</MenuItem>
                  <MenuItem value="DeclarationFiscale">Déclaration</MenuItem>
                  <MenuItem value="SessionAudit">Session Audit</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={successFilter}
                  onChange={(e) => setSuccessFilter(e.target.value)}
                  label="Statut"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="true">Succès</MenuItem>
                  <MenuItem value="false">Échec</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                label="Correlation ID"
                value={correlationId}
                onChange={(e) => setCorrelationId(e.target.value)}
                InputProps={{
                  endAdornment: correlationId && (
                    <IconButton size="small" onClick={handleSearchByCorrelation}>
                      <Search fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ height: '40px' }}
              >
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Chargement des pistes d'audit...
          </Typography>
        </Box>
      )}

      {/* Table */}
      {!loading && logs.length > 0 && (
        <Card>
          <CardHeader
            title={`Pistes d'Audit (${logs.length})`}
            subheader="Logs immuables avec vérification d'intégrité"
          />
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={80}>#</TableCell>
                    <TableCell>Date/Heure</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Objet</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      hover
                      sx={{
                        bgcolor: !log.success ? 'error.lighter' : undefined,
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          #{log.sequence_number}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {formatDate(log.timestamp)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={getActionTypeIcon(log.action_type)}
                          label={log.action_type}
                          size="small"
                          color={getActionTypeColor(log.action_type)}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {log.user_detail?.full_name || log.user_detail?.username || log.user}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {log.object_model}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {log.object_repr}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption">{log.action_description}</Typography>
                        {log.correlation_id && (
                          <Chip
                            label={`Corr: ${log.correlation_id.substring(0, 8)}`}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1, fontSize: '0.65rem' }}
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={log.success ? <CheckCircle fontSize="small" /> : <Error fontSize="small" />}
                          label={log.success ? 'Succès' : 'Échec'}
                          size="small"
                          color={log.success ? 'success' : 'error'}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Voir détails">
                            <IconButton size="small" color="primary" onClick={() => handleViewDetails(log)}>
                              <Info fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Vérifier intégrité">
                            <IconButton size="small" color="secondary" onClick={() => handleVerifyEntry(log)}>
                              <VerifiedUser fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* État vide */}
      {!loading && logs.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Security sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune piste d'audit trouvée
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(actionTypeFilter || objectModelFilter || correlationId)
              ? 'Essayez de modifier vos filtres'
              : 'Les pistes d\'audit apparaîtront ici'}
          </Typography>
        </Paper>
      )}

      {/* Dialog Vérification */}
      <Dialog
        open={verificationDialogOpen}
        onClose={() => setVerificationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Verified color={verificationResult?.is_valid ? 'success' : 'error'} />
            <Typography variant="h6">Résultat de Vérification</Typography>
          </Box>
          <IconButton onClick={() => setVerificationDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {verificationResult && (
            <>
              <Alert severity={verificationResult.is_valid ? 'success' : 'error'} sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {verificationResult.is_valid ? '✅ Intégrité Vérifiée' : '⚠️ Intégrité Compromise'}
                </Typography>
                <Typography variant="caption">{verificationResult.message}</Typography>
              </Alert>

              {verificationResult.total_entries !== undefined && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Entrées vérifiées: <strong>{verificationResult.total_entries}</strong>
                  </Typography>
                  {verificationResult.invalid_count !== undefined && verificationResult.invalid_count > 0 && (
                    <Typography variant="body2" color="error" gutterBottom>
                      Entrées invalides: <strong>{verificationResult.invalid_count}</strong>
                    </Typography>
                  )}
                </Box>
              )}

              {verificationResult.invalid_entries && verificationResult.invalid_entries.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Entrées Invalides:
                  </Typography>
                  <List dense>
                    {verificationResult.invalid_entries.map((entry, idx) => (
                      <ListItem key={idx}>
                        <ListItemText
                          primary={`Séquence #${entry.sequence_number} - ${entry.action_type}`}
                          secondary={`Erreur: ${entry.error}`}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption', color: 'error' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setVerificationDialogOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info color="primary" />
            <Typography variant="h6">Détails de l'Entrée Audit</Typography>
          </Box>
          <IconButton onClick={() => setDetailsDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedLog && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Séquence #
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {selectedLog.sequence_number}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date/Heure
                </Typography>
                <Typography variant="body2">{formatDate(selectedLog.timestamp)}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Utilisateur
                </Typography>
                <Typography variant="body2">
                  {selectedLog.user_detail?.full_name || selectedLog.user_detail?.username || selectedLog.user}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  IP Address
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {selectedLog.ip_address || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2">{selectedLog.action_description}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Objet Concerné
                </Typography>
                <Typography variant="body2">
                  <strong>{selectedLog.object_model}</strong> - {selectedLog.object_repr}
                </Typography>
              </Grid>

              {selectedLog.correlation_id && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Correlation ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedLog.correlation_id}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Hash Actuel
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedLog.current_hash}
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Hash Précédent
                </Typography>
                <Paper variant="outlined" sx={{ p: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {selectedLog.previous_hash}
                  </Typography>
                </Paper>
              </Grid>

              {!selectedLog.success && selectedLog.error_message && (
                <Grid item xs={12}>
                  <Alert severity="error">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Message d'Erreur
                    </Typography>
                    <Typography variant="caption">{selectedLog.error_message}</Typography>
                  </Alert>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Fermer</Button>
          {selectedLog && (
            <Button
              variant="contained"
              onClick={() => handleVerifyEntry(selectedLog)}
              startIcon={<VerifiedUser />}
              color="secondary"
            >
              Vérifier Intégrité
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AuditTrailsView
