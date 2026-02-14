/**
 * Historique des validations de balance
 * Connecté au backend via balanceService.getValidationHistory()
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Grid,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Visibility,
  CheckCircle,
  Error,
  Warning,
  History,
  Search,
  Refresh,
} from '@mui/icons-material'
import { balanceService } from '@/services/balanceService'

interface ValidationRecord {
  id: string
  balance: string
  balance_detail?: {
    nom: string
    date_balance: string
  }
  date_validation: string
  valideur: string
  valideur_detail?: {
    username: string
    email: string
  }
  statut: 'REUSSIE' | 'ECHOUEE' | 'EN_COURS'
  nb_erreurs: number
  nb_avertissements: number
  commentaire?: string
}

const ValidationHistory: React.FC = () => {
  const [validations, setValidations] = useState<ValidationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalCount, setTotalCount] = useState(0)

  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [statutFilter, setStatutFilter] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Charger l'historique
  const loadValidationHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page: page + 1, // Backend uses 1-based pagination
        page_size: rowsPerPage,
      }

      if (searchTerm) params.balance = searchTerm
      if (statutFilter) params.statut = statutFilter
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const response = await balanceService.getValidationHistory(params)

      setValidations((response as Record<string, any>).results || [])
      setTotalCount((response as Record<string, any>).count || 0)
    } catch (err: any) {
      console.error('Failed to load validation history:', err)
      setError(err.message || 'Erreur lors du chargement de l\'historique')
      setValidations([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Charger au montage et quand les filtres changent
  useEffect(() => {
    loadValidationHistory()
  }, [page, rowsPerPage, searchTerm, statutFilter, startDate, endDate])

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'REUSSIE':
        return 'success'
      case 'ECHOUEE':
        return 'error'
      case 'EN_COURS':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'REUSSIE':
        return <CheckCircle />
      case 'ECHOUEE':
        return <Error />
      case 'EN_COURS':
        return <Warning />
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Historique des Validations"
          avatar={<History color="primary" />}
          subheader={`${totalCount} validation(s) au total`}
          action={
            <Tooltip title="Actualiser">
              <IconButton onClick={loadValidationHistory} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          }
        />

        <CardContent>
          {/* Filtres */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Rechercher par Balance ID"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(0) // Reset to first page
                }}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statutFilter}
                  onChange={(e) => {
                    setStatutFilter(e.target.value)
                    setPage(0)
                  }}
                  label="Statut"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="REUSSIE">Réussie</MenuItem>
                  <MenuItem value="ECHOUEE">Échouée</MenuItem>
                  <MenuItem value="EN_COURS">En cours</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Date début"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(0)
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Date fin"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(0)
                }}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
          </Grid>

          {/* Error display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Loading state */}
          {loading && validations.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Table */}
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date Validation</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell>Valideur</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Erreurs</TableCell>
                      <TableCell align="center">Avertissements</TableCell>
                      <TableCell>Commentaire</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {validations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography color="text.secondary" sx={{ py: 3 }}>
                            Aucune validation trouvée
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      validations.map((validation) => (
                        <TableRow key={validation.id} hover>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {formatDate(validation.date_validation)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {validation.balance_detail?.nom || validation.balance}
                              </Typography>
                              {validation.balance_detail?.date_balance && (
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(validation.balance_detail.date_balance).toLocaleDateString('fr-FR')}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="body2">
                                {validation.valideur_detail?.username || validation.valideur}
                              </Typography>
                              {validation.valideur_detail?.email && (
                                <Typography variant="caption" color="text.secondary">
                                  {validation.valideur_detail.email}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={validation.statut}
                              color={getStatutColor(validation.statut) as any}
                              icon={getStatutIcon(validation.statut) || undefined}
                              size="small"
                            />
                          </TableCell>

                          <TableCell align="center">
                            {validation.nb_erreurs > 0 ? (
                              <Chip
                                label={validation.nb_erreurs}
                                color="error"
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell align="center">
                            {validation.nb_avertissements > 0 ? (
                              <Chip
                                label={validation.nb_avertissements}
                                color="warning"
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            {validation.commentaire ? (
                              <Tooltip title={validation.commentaire}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 200,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {validation.commentaire}
                                </Typography>
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Tooltip title="Voir détails">
                              <IconButton size="small">
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <TablePagination
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10))
                  setPage(0)
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                }
                labelRowsPerPage="Lignes par page"
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default ValidationHistory
