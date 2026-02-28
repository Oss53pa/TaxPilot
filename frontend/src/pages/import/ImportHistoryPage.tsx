/**
 * Page Journal des Imports de Balance
 * Affiche l'historique complet des imports et les balances enregistrees
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Stack,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import {
  getImportHistory,
  getAllBalances,
  deleteBalance,
} from '@/services/balanceStorageService'
import type { ImportRecord, StoredBalance } from '@/services/balanceStorageService'

const ImportHistoryPage: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([])
  const [balances, setBalances] = useState<StoredBalance[]>([])

  const reload = () => {
    setImportHistory(getImportHistory())
    setBalances(getAllBalances())
  }

  useEffect(() => { reload() }, [])

  // Stats
  const totalImports = importHistory.length
  const totalErrors = importHistory.reduce((s, r) => s + r.errors, 0)
  const totalWarnings = importHistory.reduce((s, r) => s + r.warnings, 0)
  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Journal des Imports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Historique complet des imports de balance et versions enregistrees
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => navigate('/import-balance')}
            >
              Retour a l'import
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => navigate('/import-balance')}
            >
              Nouvel import
            </Button>
          </Stack>
        </Box>

        {/* Metriques */}
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {totalImports}
              </Typography>
              <Typography variant="body2" color="text.secondary">Imports effectues</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.04) }}>
              <Typography variant="h4" fontWeight={700} color="info.main">
                {balances.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Balances enregistrees</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: totalErrors > 0 ? alpha(theme.palette.error.main, 0.04) : alpha(theme.palette.success.main, 0.04) }}>
              <Typography variant="h4" fontWeight={700} color={totalErrors > 0 ? 'error.main' : 'success.main'}>
                {totalErrors}
              </Typography>
              <Typography variant="body2" color="text.secondary">Erreurs totales</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: totalWarnings > 0 ? alpha(theme.palette.warning.main, 0.04) : alpha(theme.palette.success.main, 0.04) }}>
              <Typography variant="h4" fontWeight={700} color={totalWarnings > 0 ? 'warning.main' : 'success.main'}>
                {totalWarnings}
              </Typography>
              <Typography variant="body2" color="text.secondary">Alertes totales</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Section 1 : Balances enregistrees */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Balances enregistrees ({balances.length})
          </Typography>

          {balances.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Fichier</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Exercice</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Version</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Comptes</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total Debit</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total Credit</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Ecart</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date d'import</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: 90 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {balances.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {b.fileName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{b.exercice}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={`V${b.version || 1}`}
                          size="small"
                          color="info"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={b.statut || 'brute'}
                          size="small"
                          variant="outlined"
                          color={
                            b.statut === 'deployee' ? 'success'
                              : b.statut === 'validee' ? 'success'
                              : b.statut === 'corrigee' ? 'warning'
                              : b.statut === 'auditee' ? 'info'
                              : 'default'
                          }
                          sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {b.accountCount}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {b.totalDebit.toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                        {b.totalCredit.toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        {b.ecart < 0.01 ? (
                          <Chip label="Equilibree" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
                        ) : (
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'error.main', fontWeight: 600 }}>
                            {b.ecart.toLocaleString('fr-FR')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(b.importDate).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Voir dans la balance">
                            <IconButton size="small" onClick={() => navigate('/balance')}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                deleteBalance(b.id)
                                reload()
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              Aucune balance enregistree. Importez une balance pour commencer.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Section 2 : Historique des imports */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Historique des imports ({importHistory.length})
          </Typography>

          {importHistory.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Fichier</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Comptes</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total Debit</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total Credit</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Ecart</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Erreurs</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Alertes</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {importHistory.map((r) => {
                    const ecart = Math.abs(r.totalDebit - r.totalCredit)
                    return (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                            {r.fileName}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {r.accountCount}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {r.totalDebit.toLocaleString('fr-FR')}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                          {r.totalCredit.toLocaleString('fr-FR')}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>
                          {ecart < 0.01 ? (
                            <Chip label="OK" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem' }} />
                          ) : (
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'error.main' }}>
                              {ecart.toLocaleString('fr-FR')}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {r.errors > 0 ? (
                            <Chip
                              icon={<ErrorIcon sx={{ fontSize: 14 }} />}
                              label={r.errors}
                              size="small"
                              color="error"
                              sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                          ) : (
                            <CheckIcon color="success" sx={{ fontSize: 18 }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {r.warnings > 0 ? (
                            <Chip
                              icon={<WarningIcon sx={{ fontSize: 14 }} />}
                              label={r.warnings}
                              size="small"
                              color="warning"
                              sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(r.importDate).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">
              Aucun import enregistre. L'historique se remplit automatiquement lors de chaque import valide.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default ImportHistoryPage
