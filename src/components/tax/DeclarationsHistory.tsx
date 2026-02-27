/**
 * Composant Historique des Déclarations Fiscales
 * Affichage, filtrage, et gestion des déclarations
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
} from '@mui/material'
import {
  Refresh,
  GetApp,
  Visibility,
  Send,
  Add,
  FilterList,
  TrendingUp,
  TrendingDown,
  Receipt,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material'
import { taxService, DeclarationFiscale } from '@/services/taxService'
import DeclarationSubmission from './DeclarationSubmission'

interface DeclarationsHistoryProps {
  entrepriseId?: string
  entrepriseName?: string
}

const DeclarationsHistory: React.FC<DeclarationsHistoryProps> = ({
  entrepriseId,
  entrepriseName,
}) => {
  const [loading, setLoading] = useState(false)
  const [declarations, setDeclarations] = useState<DeclarationFiscale[]>([])
  const [error, setError] = useState<string | null>(null)

  // Filtres
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statutFilter, setStatutFilter] = useState<string>('')
  const [dateDebut, setDateDebut] = useState<string>('')
  const [dateFin, setDateFin] = useState<string>('')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    brouillons: 0,
    validees: 0,
    deposees: 0,
    acceptees: 0,
    montant_total: 0,
  })

  // Dialogs
  const [submissionDialogOpen, setSubmissionDialogOpen] = useState(false)
  const [selectedDeclaration, setSelectedDeclaration] = useState<DeclarationFiscale | null>(null)

  useEffect(() => {
    loadDeclarations()
  }, [entrepriseId, typeFilter, statutFilter, dateDebut, dateFin, page])

  const loadDeclarations = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        page,
        page_size: pageSize,
      }

      if (entrepriseId) {
        params.entreprise = entrepriseId
      }

      if (typeFilter) {
        params.type_declaration = typeFilter
      }

      if (statutFilter) {
        params.statut = statutFilter
      }

      if (dateDebut) {
        params.periode_debut = dateDebut
      }

      if (dateFin) {
        params.periode_fin = dateFin
      }

      const response = await taxService.getDeclarations(params)

      setDeclarations(response.results || [])
      setTotalPages(Math.ceil((response.count || 0) / pageSize))

      // Calculer stats
      calculateStats(response.results || [])
    } catch (err: any) {
      console.error('Failed to load declarations:', err)
      setError(err.message || 'Erreur lors du chargement des déclarations')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: DeclarationFiscale[]) => {
    const stats = {
      total: data.length,
      brouillons: data.filter((d) => d.statut === 'BROUILLON').length,
      validees: data.filter((d) => d.statut === 'VALIDEE').length,
      deposees: data.filter((d) => d.statut === 'DEPOSEE').length,
      acceptees: data.filter((d) => d.statut === 'ACCEPTEE').length,
      montant_total: data.reduce((sum, d) => sum + d.montant_impot, 0),
    }
    setStats(stats)
  }

  const handleResetFilters = () => {
    setTypeFilter('')
    setStatutFilter('')
    setDateDebut('')
    setDateFin('')
    setPage(1)
  }

  const handleDownloadPDF = async (declaration: DeclarationFiscale) => {
    try {
      const blob = await taxService.generateDeclarationPDF(declaration.id)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `declaration_${declaration.type_declaration}_${declaration.numero_declaration || declaration.id}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('PDF download failed:', err)
      setError('Erreur lors du téléchargement du PDF')
    }
  }

  const handleSubmit = (declaration: DeclarationFiscale) => {
    setSelectedDeclaration(declaration)
    setSubmissionDialogOpen(true)
  }

  const handleSubmissionComplete = () => {
    setSubmissionDialogOpen(false)
    setSelectedDeclaration(null)
    loadDeclarations() // Refresh list
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, any> = {
      BROUILLON: 'default',
      VALIDEE: 'info',
      DEPOSEE: 'primary',
      ACCEPTEE: 'success',
      REJETEE: 'error',
    }
    return colors[statut] || 'default'
  }

  const getStatutIcon = (statut: string) => {
    const icons: Record<string, any> = {
      BROUILLON: <Schedule fontSize="small" />,
      VALIDEE: <CheckCircle fontSize="small" />,
      DEPOSEE: <Send fontSize="small" />,
      ACCEPTEE: <CheckCircle fontSize="small" />,
      REJETEE: <Warning fontSize="small" />,
    }
    return icons[statut]
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      IS: 'Impôt sur les Sociétés',
      TVA: 'TVA',
      PATENTE: 'Patente',
      BILAN_FISCAL: 'Bilan Fiscal',
    }
    return labels[type] || type
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Historique des Déclarations Fiscales
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestion et suivi de vos déclarations
          </Typography>
          {entrepriseName && (
            <Typography variant="caption" color="text.secondary">
              Entreprise: {entrepriseName}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={loadDeclarations}
          startIcon={<Refresh />}
        >
          Actualiser
        </Button>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Brouillons
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'text.secondary' }}>
                {stats.brouillons}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="info.main">
                Validées
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'info.main' }}>
                {stats.validees}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="primary.main">
                Déposées
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'primary.main' }}>
                {stats.deposees}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="success.main">
                Acceptées
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'success.main' }}>
                {stats.acceptees}
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type de Déclaration</InputLabel>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  label="Type de Déclaration"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="IS">Impôt sur les Sociétés</MenuItem>
                  <MenuItem value="TVA">TVA</MenuItem>
                  <MenuItem value="PATENTE">Patente</MenuItem>
                  <MenuItem value="BILAN_FISCAL">Bilan Fiscal</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={statutFilter}
                  onChange={(e) => setStatutFilter(e.target.value)}
                  label="Statut"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="BROUILLON">Brouillon</MenuItem>
                  <MenuItem value="VALIDEE">Validée</MenuItem>
                  <MenuItem value="DEPOSEE">Déposée</MenuItem>
                  <MenuItem value="ACCEPTEE">Acceptée</MenuItem>
                  <MenuItem value="REJETEE">Rejetée</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Date début"
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Date fin"
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ height: '56px' }}
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
            Chargement des déclarations...
          </Typography>
        </Box>
      )}

      {/* Table */}
      {!loading && declarations.length > 0 && (
        <Card>
          <CardHeader
            title={`Déclarations (${stats.total})`}
            subheader={`Montant total: ${formatMontant(stats.montant_total)} FCFA`}
          />
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Période</TableCell>
                    <TableCell>Numéro</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Montant Impôt</TableCell>
                    <TableCell align="right">À Payer</TableCell>
                    <TableCell>Date Dépôt</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {declarations.map((declaration) => (
                    <TableRow key={declaration.id} hover>
                      <TableCell>
                        <Chip
                          label={getTypeLabel(declaration.type_declaration)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {formatDate(declaration.periode_debut)} - {formatDate(declaration.periode_fin)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {declaration.numero_declaration || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={getStatutIcon(declaration.statut)}
                          label={declaration.statut}
                          size="small"
                          color={getStatutColor(declaration.statut)}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {formatMontant(declaration.montant_impot)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: declaration.montant_a_payer > 0 ? 'warning.main' : 'success.main',
                          }}
                        >
                          {formatMontant(declaration.montant_a_payer)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {declaration.date_depot ? formatDate(declaration.date_depot) : '-'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Voir détails">
                            <IconButton size="small" color="primary">
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Télécharger PDF">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleDownloadPDF(declaration)}
                            >
                              <GetApp fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {(declaration.statut === 'BROUILLON' || declaration.statut === 'VALIDEE') && (
                            <Tooltip title="Soumettre">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleSubmit(declaration)}
                              >
                                <Send fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
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
      {!loading && declarations.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune déclaration trouvée
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(typeFilter || statutFilter || dateDebut || dateFin)
              ? 'Essayez de modifier vos filtres'
              : 'Commencez par créer votre première déclaration'}
          </Typography>
        </Paper>
      )}

      {/* Dialog Soumission */}
      <DeclarationSubmission
        open={submissionDialogOpen}
        onClose={() => setSubmissionDialogOpen(false)}
        declaration={selectedDeclaration}
        onSubmissionComplete={handleSubmissionComplete}
      />
    </Box>
  )
}

export default DeclarationsHistory
