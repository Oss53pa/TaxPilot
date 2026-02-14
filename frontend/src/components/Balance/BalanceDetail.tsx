/**
 * Composant de détail d'une Balance (entité complète)
 * Affiche les informations de la balance et permet la validation
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Chip,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  AccountBalance,
  Edit,
  GetApp,
  History,
  TrendingUp,
  TrendingDown,
  Refresh,
} from '@mui/icons-material'
import { balanceService, Balance } from '@/services/balanceService'
import BalanceValidationButton from './BalanceValidationButton'
import BalanceExportDialog from './BalanceExportDialog'

interface BalanceDetailProps {
  balanceId: string
  onBalanceUpdate?: () => void
}

const BalanceDetail: React.FC<BalanceDetailProps> = ({
  balanceId,
  onBalanceUpdate,
}) => {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const loadBalance = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await balanceService.getBalance(balanceId)
      setBalance(data)
    } catch (err: any) {
      console.error('Failed to load balance:', err)
      setError(err.message || 'Erreur lors du chargement de la balance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBalance()
  }, [balanceId])

  const handleValidationSuccess = () => {
    loadBalance() // Reload to get updated status
    if (onBalanceUpdate) {
      onBalanceUpdate()
    }
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(montant)
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'VALIDEE':
        return 'success'
      case 'CLOTUREE':
        return 'info'
      case 'BROUILLON':
      default:
        return 'warning'
    }
  }

  if (loading && !balance) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error && !balance) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  if (!balance) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Balance non trouvée
      </Alert>
    )
  }

  const isEquilibree = Math.abs(balance.total_debit - balance.total_credit) < 0.01
  const ecart = Math.abs(balance.total_debit - balance.total_credit)

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccountBalance color="primary" sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {balance.nom}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {balance.entreprise_detail?.raison_sociale} - {balance.exercice_detail?.nom}
            </Typography>
          </Box>
        </Box>

        <Tooltip title="Actualiser">
          <IconButton onClick={loadBalance} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Informations principales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Chip
              label={balance.statut}
              color={getStatutColor(balance.statut) as any}
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Statut
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Chip
              label={balance.type_balance}
              color="primary"
              variant="outlined"
              sx={{ mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary" display="block">
              Type de Balance
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="primary.main">
              {balance.nb_lignes}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lignes
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color={isEquilibree ? 'success.main' : 'error.main'}>
              {isEquilibree ? '✓' : formatMontant(ecart)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEquilibree ? 'Équilibrée' : 'Écart'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Alerte équilibre */}
      {!isEquilibree && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Balance déséquilibrée ! Écart de {formatMontant(ecart)}
        </Alert>
      )}

      {/* Montants */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Montants (en FCFA)" />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <TrendingUp color="info" />
                  <Typography variant="body2" color="text.secondary">
                    Total Débit
                  </Typography>
                </Box>
                <Typography variant="h5" color="info.main" sx={{ fontFamily: 'monospace' }}>
                  {formatMontant(balance.total_debit)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                  <TrendingDown color="warning" />
                  <Typography variant="body2" color="text.secondary">
                    Total Crédit
                  </Typography>
                </Box>
                <Typography variant="h5" color="warning.main" sx={{ fontFamily: 'monospace' }}>
                  {formatMontant(balance.total_credit)}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Écart
                </Typography>
                <Typography
                  variant="h5"
                  color={isEquilibree ? 'success.main' : 'error.main'}
                  sx={{ fontFamily: 'monospace' }}
                >
                  {formatMontant(ecart)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Statistiques */}
      {balance.statistiques && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Statistiques" />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Comptes actifs
                </Typography>
                <Typography variant="h6">
                  {balance.statistiques.nb_comptes_actifs}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Comptes mouvementés
                </Typography>
                <Typography variant="h6">
                  {balance.statistiques.nb_comptes_mouvementes}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Équilibre
                </Typography>
                <Chip
                  label={balance.statistiques.equilibre ? 'OUI' : 'NON'}
                  color={balance.statistiques.equilibre ? 'success' : 'error'}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="text.secondary">
                  Écart d'équilibrage
                </Typography>
                <Typography variant="h6">
                  {formatMontant(balance.statistiques.ecart_equilibrage)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Informations import */}
      {balance.fichier_source && (
        <Card sx={{ mb: 3 }}>
          <CardHeader title="Informations d'Import" />
          <CardContent>
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fichier source
                </Typography>
                <Typography variant="body2">{balance.fichier_source}</Typography>
              </Box>

              {balance.format_import && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Format
                  </Typography>
                  <Chip label={balance.format_import} size="small" />
                </Box>
              )}

              {balance.date_import && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date d'import
                  </Typography>
                  <Typography variant="body2">
                    {new Date(balance.date_import).toLocaleString('fr-FR')}
                  </Typography>
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Commentaires */}
      {balance.commentaires && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Commentaires :</strong> {balance.commentaires}
          </Typography>
        </Alert>
      )}

      {/* Actions */}
      <Card>
        <CardHeader title="Actions" />
        <CardContent>
          <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
            {balance.statut === 'BROUILLON' && (
              <BalanceValidationButton
                balance={balance}
                onValidationSuccess={handleValidationSuccess}
                variant="contained"
              />
            )}

            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => setExportDialogOpen(true)}
            >
              Exporter
            </Button>

            <Button variant="outlined" startIcon={<Edit />}>
              Modifier
            </Button>

            <Button variant="outlined" startIcon={<History />}>
              Historique
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <BalanceExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        balanceId={balance.id}
        balanceName={balance.nom}
      />
    </Box>
  )
}

export default BalanceDetail
