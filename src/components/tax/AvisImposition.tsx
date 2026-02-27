/**
 * Composant Avis d'Imposition
 * Affichage des avis d'imposition et suivi des paiements
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Stack,
} from '@mui/material'
import {
  Refresh,
  GetApp,
  Visibility,
  Receipt,
  CheckCircle,
  Warning,
  Schedule,
  AccountBalance,
  CalendarMonth,
  TrendingUp,
  Info,
  Print,
  Close,
  Payment,
} from '@mui/icons-material'
import { taxService, DeclarationFiscale } from '@/services/taxService'

interface AvisImpositionProps {
  entrepriseId?: string
  entrepriseName?: string
}

interface AvisDetails {
  declaration: DeclarationFiscale
  montant_total: number
  montant_paye: number
  montant_restant: number
  echeance_paiement: string
  statut_paiement: 'EN_ATTENTE' | 'PARTIEL' | 'COMPLET' | 'RETARD'
  jours_restants: number
  penalites_potentielles: number
}

const AvisImposition: React.FC<AvisImpositionProps> = ({
  entrepriseId,
  entrepriseName,
}) => {
  const [loading, setLoading] = useState(false)
  const [avis, setAvis] = useState<AvisDetails[]>([])
  const [error, setError] = useState<string | null>(null)

  // Dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedAvis, setSelectedAvis] = useState<AvisDetails | null>(null)

  // Stats
  const [stats, setStats] = useState({
    total_avis: 0,
    total_a_payer: 0,
    total_paye: 0,
    avis_en_retard: 0,
  })

  useEffect(() => {
    loadAvis()
  }, [entrepriseId])

  const loadAvis = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: any = {
        statut: 'DEPOSEE,ACCEPTEE',
        page_size: 50,
      }

      if (entrepriseId) {
        params.entreprise = entrepriseId
      }

      const response = await taxService.getDeclarations(params)

      // Transform declarations en avis d'imposition
      const avisData: AvisDetails[] = (response.results || []).map((declaration: DeclarationFiscale) => {
        const montantTotal = declaration.montant_a_payer
        const montantPaye = declaration.montant_acomptes || 0
        const montantRestant = montantTotal - montantPaye

        // Calculer échéance (30 jours après dépôt par défaut)
        const dateDepot = declaration.date_depot ? new Date(declaration.date_depot) : new Date()
        const echeance = new Date(dateDepot)
        echeance.setDate(echeance.getDate() + 30)

        const joursRestants = Math.ceil((echeance.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

        let statutPaiement: AvisDetails['statut_paiement'] = 'EN_ATTENTE'
        if (montantPaye >= montantTotal) {
          statutPaiement = 'COMPLET'
        } else if (montantPaye > 0) {
          statutPaiement = 'PARTIEL'
        } else if (joursRestants < 0) {
          statutPaiement = 'RETARD'
        }

        const penalitesPotentielles = joursRestants < 0 ? Math.abs(joursRestants) * montantRestant * 0.001 : 0

        return {
          declaration,
          montant_total: montantTotal,
          montant_paye: montantPaye,
          montant_restant: montantRestant,
          echeance_paiement: echeance.toISOString().split('T')[0],
          statut_paiement: statutPaiement,
          jours_restants: joursRestants,
          penalites_potentielles: penalitesPotentielles,
        }
      })

      setAvis(avisData)
      calculateStats(avisData)
    } catch (err: any) {
      console.error('Failed to load avis:', err)
      setError(err.message || 'Erreur lors du chargement des avis d\'imposition')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: AvisDetails[]) => {
    const stats = {
      total_avis: data.length,
      total_a_payer: data.reduce((sum, a) => sum + a.montant_total, 0),
      total_paye: data.reduce((sum, a) => sum + a.montant_paye, 0),
      avis_en_retard: data.filter((a) => a.statut_paiement === 'RETARD').length,
    }
    setStats(stats)
  }

  const handleDownloadPDF = async (avis: AvisDetails) => {
    try {
      const blob = await taxService.generateDeclarationPDF(avis.declaration.id)

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `avis_imposition_${avis.declaration.type_declaration}_${avis.declaration.numero_declaration || avis.declaration.id}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('PDF download failed:', err)
      setError('Erreur lors du téléchargement du PDF')
    }
  }

  const handleViewDetails = (avis: AvisDetails) => {
    setSelectedAvis(avis)
    setDetailsDialogOpen(true)
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

  const getStatutPaiementColor = (statut: AvisDetails['statut_paiement']) => {
    const colors: Record<string, any> = {
      EN_ATTENTE: 'warning',
      PARTIEL: 'info',
      COMPLET: 'success',
      RETARD: 'error',
    }
    return colors[statut] || 'default'
  }

  const getStatutPaiementLabel = (statut: AvisDetails['statut_paiement']) => {
    const labels: Record<string, string> = {
      EN_ATTENTE: 'En Attente',
      PARTIEL: 'Partiel',
      COMPLET: 'Payé',
      RETARD: 'En Retard',
    }
    return labels[statut] || statut
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      IS: 'IS',
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
            Avis d'Imposition
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Suivi des paiements et échéances fiscales
          </Typography>
          {entrepriseName && (
            <Typography variant="caption" color="text.secondary">
              Entreprise: {entrepriseName}
            </Typography>
          )}
        </Box>
        <Button variant="contained" onClick={loadAvis} startIcon={<Refresh />}>
          Actualiser
        </Button>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total Avis
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                {stats.total_avis}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="warning.main">
                Total À Payer
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: 'warning.main', fontSize: '1.5rem' }}>
                {formatMontant(stats.total_a_payer)} FCFA
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="success.main">
                Total Payé
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mt: 1, color: 'success.main', fontSize: '1.5rem' }}>
                {formatMontant(stats.total_paye)} FCFA
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="error.main">
                En Retard
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: 'error.main' }}>
                {stats.avis_en_retard}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Error */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Avis en retard - Alerte */}
      {stats.avis_en_retard > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ⚠️ Vous avez {stats.avis_en_retard} avis en retard de paiement
          </Typography>
          <Typography variant="caption">
            Des pénalités de retard peuvent s'appliquer. Veuillez régulariser au plus vite.
          </Typography>
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Chargement des avis d'imposition...
          </Typography>
        </Box>
      )}

      {/* Table des avis */}
      {!loading && avis.length > 0 && (
        <Card>
          <CardHeader
            title={`Avis d'Imposition (${stats.total_avis})`}
            subheader={`Restant à payer: ${formatMontant(stats.total_a_payer - stats.total_paye)} FCFA`}
          />
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>N° Déclaration</TableCell>
                    <TableCell align="right">Montant Total</TableCell>
                    <TableCell align="right">Payé</TableCell>
                    <TableCell align="right">Restant</TableCell>
                    <TableCell>Échéance</TableCell>
                    <TableCell>Statut Paiement</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {avis.map((item) => (
                    <TableRow
                      key={item.declaration.id}
                      hover
                      sx={{
                        bgcolor: item.statut_paiement === 'RETARD' ? 'error.lighter' : undefined,
                      }}
                    >
                      <TableCell>
                        <Chip label={getTypeLabel(item.declaration.type_declaration)} size="small" variant="outlined" />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {item.declaration.numero_declaration || '-'}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {formatMontant(item.montant_total)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                          {formatMontant(item.montant_paye)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: item.montant_restant > 0 ? 'warning.main' : 'success.main',
                          }}
                        >
                          {formatMontant(item.montant_restant)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {formatDate(item.echeance_paiement)}
                          </Typography>
                          <Typography
                            variant="caption"
                            display="block"
                            sx={{
                              color: item.jours_restants < 0 ? 'error.main' : item.jours_restants < 7 ? 'warning.main' : 'text.secondary',
                            }}
                          >
                            {item.jours_restants < 0
                              ? `Retard: ${Math.abs(item.jours_restants)} jours`
                              : `${item.jours_restants} jours restants`}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={getStatutPaiementLabel(item.statut_paiement)}
                          size="small"
                          color={getStatutPaiementColor(item.statut_paiement)}
                        />
                        {item.statut_paiement === 'PARTIEL' && (
                          <LinearProgress
                            variant="determinate"
                            value={(item.montant_paye / item.montant_total) * 100}
                            sx={{ mt: 1, height: 4, borderRadius: 1 }}
                          />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Voir détails">
                            <IconButton size="small" color="primary" onClick={() => handleViewDetails(item)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Télécharger PDF">
                            <IconButton size="small" color="primary" onClick={() => handleDownloadPDF(item)}>
                              <GetApp fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Imprimer">
                            <IconButton size="small" color="primary" onClick={() => window.print()}>
                              <Print fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* État vide */}
      {!loading && avis.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucun avis d'imposition
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vous n'avez pas d'avis d'imposition en cours
          </Typography>
        </Paper>
      )}

      {/* Dialog Détails */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt color="primary" />
            <Typography variant="h6">Détails de l'Avis</Typography>
          </Box>
          <IconButton onClick={() => setDetailsDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedAvis && (
            <>
              {/* Informations fiscales */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type de Déclaration
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {getTypeLabel(selectedAvis.declaration.type_declaration)}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Numéro
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {selectedAvis.declaration.numero_declaration || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date Dépôt
                    </Typography>
                    <Typography variant="body2">
                      {selectedAvis.declaration.date_depot ? formatDate(selectedAvis.declaration.date_depot) : '-'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Détails paiement */}
              <Card sx={{ mb: 2 }}>
                <CardHeader title="Détails du Paiement" />
                <CardContent>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <AccountBalance color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Montant Total"
                        secondary={`${formatMontant(selectedAvis.montant_total)} FCFA`}
                        secondaryTypographyProps={{ sx: { fontWeight: 600, fontSize: '1.1rem' } }}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Montant Payé"
                        secondary={`${formatMontant(selectedAvis.montant_paye)} FCFA`}
                        secondaryTypographyProps={{ sx: { color: 'success.main', fontWeight: 600 } }}
                      />
                    </ListItem>

                    <Divider />

                    <ListItem>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Montant Restant"
                        secondary={`${formatMontant(selectedAvis.montant_restant)} FCFA`}
                        secondaryTypographyProps={{
                          sx: {
                            color: 'warning.main',
                            fontWeight: 700,
                            fontSize: '1.2rem',
                          },
                        }}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemIcon>
                        <CalendarMonth color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Échéance de Paiement"
                        secondary={formatDate(selectedAvis.echeance_paiement)}
                        secondaryTypographyProps={{ sx: { fontWeight: 600 } }}
                      />
                    </ListItem>

                    {selectedAvis.penalites_potentielles > 0 && (
                      <ListItem>
                        <ListItemIcon>
                          <Warning color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Pénalités de Retard"
                          secondary={`${formatMontant(selectedAvis.penalites_potentielles)} FCFA`}
                          secondaryTypographyProps={{ sx: { color: 'error.main', fontWeight: 600 } }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>

              {/* Alertes */}
              {selectedAvis.statut_paiement === 'RETARD' && (
                <Alert severity="error">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ⚠️ Paiement en retard de {Math.abs(selectedAvis.jours_restants)} jours
                  </Typography>
                  <Typography variant="caption">
                    Des pénalités de {formatMontant(selectedAvis.penalites_potentielles)} FCFA s'appliquent
                  </Typography>
                </Alert>
              )}

              {selectedAvis.jours_restants > 0 && selectedAvis.jours_restants < 7 && (
                <Alert severity="warning">
                  <Typography variant="body2">
                    ⏰ Échéance dans {selectedAvis.jours_restants} jour(s)
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Fermer</Button>
          {selectedAvis && (
            <Button
              variant="contained"
              onClick={() => handleDownloadPDF(selectedAvis)}
              startIcon={<GetApp />}
            >
              Télécharger PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AvisImposition
