/**
 * Composant Grand Livre - Détail des mouvements par compte
 * Affiche tous les mouvements d'un ou plusieurs comptes sur une période
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
  Autocomplete,
  Divider,
  Stack,
} from '@mui/material'
import {
  Search,
  GetApp,
  Visibility,
  TrendingUp,
  TrendingDown,
  Refresh,
  Print,
} from '@mui/icons-material'
import { accountingService, GrandLivre as GrandLivreType, CompteComptable } from '@/services/accountingService'

const GrandLivre: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [grandLivre, setGrandLivre] = useState<GrandLivreType | null>(null)

  // Filtres
  const [selectedCompte, setSelectedCompte] = useState<CompteComptable | null>(null)
  const [comptes, setComptes] = useState<CompteComptable[]>([])
  const [loadingComptes, setLoadingComptes] = useState(false)
  const [periodeDebut, setPeriodeDebut] = useState<string>('')
  const [periodeFin, setPeriodeFin] = useState<string>('')

  // Charger les comptes pour l'autocomplete
  useEffect(() => {
    loadComptes()
  }, [])

  const loadComptes = async () => {
    try {
      setLoadingComptes(true)
      const response = await accountingService.getComptes({
        is_actif: true,
        page_size: 100,
      })
      setComptes(response.results || [])
    } catch (err: any) {
      console.error('Failed to load comptes:', err)
    } finally {
      setLoadingComptes(false)
    }
  }

  const handleSearch = async () => {
    if (!selectedCompte) {
      setError('Veuillez sélectionner un compte')
      return
    }

    if (!periodeDebut || !periodeFin) {
      setError('Veuillez sélectionner une période')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await accountingService.getGrandLivre({
        compte: selectedCompte.id,
        periode_debut: periodeDebut,
        periode_fin: periodeFin,
      })

      setGrandLivre(data)
    } catch (err: any) {
      console.error('Failed to load grand livre:', err)
      setError(err.message || 'Erreur lors du chargement du grand livre')
      setGrandLivre(null)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!selectedCompte || !periodeDebut || !periodeFin) return

    try {
      const blob = await accountingService.exportGrandLivre({
        compte: selectedCompte.id,
        periode_debut: periodeDebut,
        periode_fin: periodeFin,
        format: 'EXCEL',
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `grand_livre_${selectedCompte.numero}_${periodeDebut}_${periodeFin}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Export failed:', err)
      setError('Erreur lors de l\'export')
    }
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(montant))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Grand Livre
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Détail des mouvements comptables par compte
        </Typography>
      </Box>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title="Critères de recherche"
          avatar={<Search color="primary" />}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={comptes}
                loading={loadingComptes}
                value={selectedCompte}
                onChange={(_, newValue) => setSelectedCompte(newValue)}
                getOptionLabel={(option) => `${option.numero} - ${option.libelle}`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Compte *"
                    placeholder="Rechercher un compte..."
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {option.numero}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.libelle}
                      </Typography>
                    </Box>
                  </li>
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Date début *"
                type="date"
                value={periodeDebut}
                onChange={(e) => setPeriodeDebut(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Date fin *"
                type="date"
                value={periodeFin}
                onChange={(e) => setPeriodeFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                sx={{ height: '56px' }}
              >
                {loading ? 'Chargement...' : 'Afficher'}
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

      {/* Résultats */}
      {grandLivre && (
        <>
          {/* Informations compte */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Compte
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {grandLivre.compte_detail?.numero} - {grandLivre.compte_detail?.libelle}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Typography variant="body2" color="text.secondary">
                    Période
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(grandLivre.periode_debut)} - {formatDate(grandLivre.periode_fin)}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Typography variant="body2" color="text.secondary">
                    Solde initial
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {formatMontant(grandLivre.solde_initial)} FCFA
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Typography variant="body2" color="text.secondary">
                    Solde final
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      color: grandLivre.solde_final >= 0 ? 'success.main' : 'error.main',
                    }}
                  >
                    {formatMontant(grandLivre.solde_final)} FCFA
                  </Typography>
                </Grid>

                <Grid item xs={12} md={2}>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Exporter">
                      <IconButton onClick={handleExport} color="primary">
                        <GetApp />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Imprimer">
                      <IconButton onClick={() => window.print()} color="primary">
                        <Print />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Actualiser">
                      <IconButton onClick={handleSearch} color="primary">
                        <Refresh />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Table des mouvements */}
          <Card>
            <CardHeader
              title={`Mouvements (${grandLivre.mouvements.length})`}
              subheader={`Total Débit: ${formatMontant(grandLivre.total_debit)} FCFA | Total Crédit: ${formatMontant(grandLivre.total_credit)} FCFA`}
            />
            <CardContent sx={{ p: 0 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Pièce</TableCell>
                      <TableCell>Libellé</TableCell>
                      <TableCell align="right">Débit</TableCell>
                      <TableCell align="right">Crédit</TableCell>
                      <TableCell align="right">Solde</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {grandLivre.mouvements.map((mouvement, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {formatDate(mouvement.date)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {mouvement.numero_piece}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {mouvement.libelle}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              color: mouvement.debit > 0 ? 'info.main' : 'text.disabled',
                            }}
                          >
                            {mouvement.debit > 0 ? formatMontant(mouvement.debit) : '-'}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              color: mouvement.credit > 0 ? 'warning.main' : 'text.disabled',
                            }}
                          >
                            {mouvement.credit > 0 ? formatMontant(mouvement.credit) : '-'}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            {mouvement.solde_progressif >= 0 ? (
                              <TrendingUp color="success" fontSize="small" />
                            ) : (
                              <TrendingDown color="error" fontSize="small" />
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 600,
                                color: mouvement.solde_progressif >= 0 ? 'success.main' : 'error.main',
                              }}
                            >
                              {formatMontant(mouvement.solde_progressif)}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Ligne de total */}
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell colSpan={3}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          TOTAUX
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'info.main' }}>
                          {formatMontant(grandLivre.total_debit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'warning.main' }}>
                          {formatMontant(grandLivre.total_credit)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            color: grandLivre.solde_final >= 0 ? 'success.main' : 'error.main',
                          }}
                        >
                          {formatMontant(grandLivre.solde_final)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* État vide */}
      {!grandLivre && !loading && !error && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucun résultat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sélectionnez un compte et une période pour afficher le grand livre
          </Typography>
        </Paper>
      )}
    </Box>
  )
}

export default GrandLivre
