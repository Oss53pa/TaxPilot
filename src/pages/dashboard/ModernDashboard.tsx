/**
 * Dashboard Fiscal Refondé - Interface Professionnelle
 * Avec en-tête personnalisé, KPIs adaptés et suivi obligations fiscales
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  useTheme,
  alpha,
  Skeleton,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Business as BusinessIcon,
  AccountBalance as BalanceIcon,
  Receipt as ReceiptIcon,
  Assignment as DeclarationIcon,
  Security as SecurityIcon,
  Sync as SyncIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material'
import QuotaWidget from '@/components/Dashboard/QuotaWidget'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from 'recharts'

// Interfaces
interface EntrepriseInfo {
  nom: string
  siret: string
  exerciceFiscal: string
  regimeFiscal: string
  dateClotureExercice: string
}

interface KPIFiscal {
  id: string
  label: string
  valeur: number
  evolution: number
  unite: string
  icon: React.ReactElement
  couleur: string
  description: string
}

interface ObligationFiscale {
  id: string
  nom: string
  dateEcheance: string
  montant: number
  statut: 'PAYE' | 'A_PAYER' | 'A_VENIR' | 'RETARD'
  type: 'IS' | 'TVA' | 'CVAE' | 'CFE' | 'SOCIAL'
  description: string
}

interface SynchronisationBalance {
  derniereSynchro: string
  nomFichier: string
  periodeCouverte: string
  nombreComptes: number
  ecartsDetectes: number
  statut: 'SYNC' | 'ECART' | 'OBSOLETE'
}

const ModernDashboard: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [entreprise, setEntreprise] = useState<EntrepriseInfo | null>(null)
  const [kpis, setKPIs] = useState<KPIFiscal[]>([])
  const [obligations, setObligations] = useState<ObligationFiscale[]>([])
  const [synchronisation, setSynchronisation] = useState<SynchronisationBalance | null>(null)
  const [historiqueSync, setHistoriqueSync] = useState<any[]>([])

  // Données pour graphiques
  const evolutionFinanciere = [
    { annee: '2020', ca: 1950000, resultat: 185000 },
    { annee: '2021', ca: 2150000, resultat: 225000 },
    { annee: '2022', ca: 2380000, resultat: 195000 },
    { annee: '2023', ca: 2530000, resultat: 275000 },
    { annee: '2024', ca: 2850000, resultat: 320000 }
  ]

  const repartitionImpots = [
    { name: 'IS', value: 285000, color: '#2196F3' },
    { name: 'TVA', value: 95000, color: '#4CAF50' },
    { name: 'CVAE', value: 15000, color: '#FF9800' },
    { name: 'CFE', value: 8500, color: '#9C27B0' },
    { name: 'Autres', value: 21500, color: '#607D8B' }
  ]

  // Fonctions utilitaires
  const getStatutObligationColor = (statut: string) => {
    switch (statut) {
      case 'PAYE': return theme.palette.success.main
      case 'A_PAYER': return theme.palette.warning.main
      case 'A_VENIR': return theme.palette.info.main
      case 'RETARD': return theme.palette.error.main
      default: return theme.palette.grey[500]
    }
  }

  const getSyncStatusColor = (statut: string) => {
    switch (statut) {
      case 'SYNC': return { color: '#2e7d32', bg: '#e8f5e8' }
      case 'ECART': return { color: '#ed6c02', bg: '#fff3e0' }
      case 'OBSOLETE': return { color: '#d32f2f', bg: '#ffebee' }
      default: return { color: '#757575', bg: '#f5f5f5' }
    }
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(montant)
  }

  useEffect(() => {
    // Simulation des données - remplacer par appels API réels
    setTimeout(() => {
      // 1. Informations entreprise
      setEntreprise({
        nom: "FISCASYNC DEMO SARL",
        siret: "85412369700015", 
        exerciceFiscal: "2024",
        regimeFiscal: "IS - Régime réel normal",
        dateClotureExercice: "31/12/2024"
      })

      // 2. KPIs fiscaux
      setKPIs([
        {
          id: 'ca',
          label: 'Chiffre d\'affaires',
          valeur: 2850000,
          evolution: 12.5,
          unite: 'XOF',
          icon: <MoneyIcon />,
          couleur: theme.palette.primary.main,
          description: 'CA cumulé 2024 vs 2023'
        },
        {
          id: 'impots',
          label: 'Impôts payés',
          valeur: 425000,
          evolution: -5.2,
          unite: 'XOF',
          icon: <ReceiptIcon />,
          couleur: theme.palette.secondary.main,
          description: 'Total impôts acquittés'
        },
        {
          id: 'declarations',
          label: 'Déclarations',
          valeur: 18,
          evolution: 0,
          unite: '',
          icon: <DeclarationIcon />,
          couleur: theme.palette.info.main,
          description: 'Déposées cette année'
        },
        {
          id: 'conformite',
          label: 'Conformité fiscale',
          valeur: 92,
          evolution: 3.1,
          unite: '%',
          icon: <SecurityIcon />,
          couleur: theme.palette.success.main,
          description: 'Score de conformité'
        }
      ])

      // 3. Obligations fiscales
      setObligations([
        {
          id: '1',
          nom: 'TVA Décembre 2024',
          dateEcheance: '2025-01-20',
          montant: 85000,
          statut: 'A_PAYER',
          type: 'TVA',
          description: 'Déclaration TVA mensuelle'
        },
        {
          id: '2', 
          nom: 'IS Accompte 4/4',
          dateEcheance: '2025-02-15',
          montant: 125000,
          statut: 'A_VENIR',
          type: 'IS',
          description: 'Dernier accompte IS 2024'
        },
        {
          id: '3',
          nom: 'CVAE 2024',
          dateEcheance: '2025-05-02',
          montant: 15000,
          statut: 'A_VENIR', 
          type: 'CVAE',
          description: 'Déclaration CVAE annuelle'
        }
      ])

      // 4. Synchronisation balance
      setSynchronisation({
        derniereSynchro: '2024-12-20 15:30:00',
        nomFichier: 'Balance_Generale_202412.xlsx',
        periodeCouverte: 'Janvier 2024 - Décembre 2024',
        nombreComptes: 247,
        ecartsDetectes: 3,
        statut: 'ECART'
      })

      // 5. Historique synchronisation
      setHistoriqueSync([
        { date: '2024-12-20', fichier: 'Balance_202412.xlsx', statut: 'ECART', ecarts: 3 },
        { date: '2024-12-15', fichier: 'Balance_202411.xlsx', statut: 'SYNC', ecarts: 0 },
        { date: '2024-12-01', fichier: 'Balance_202410.xlsx', statut: 'SYNC', ecarts: 0 }
      ])

      setLoading(false)
    }, 1000)
  }, [theme])

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          {[1,2,3,4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      {/* 1. EN-TÊTE PERSONNALISÉ ENTREPRISE */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: theme.palette.primary.main,
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {entreprise?.nom.charAt(0) || 'F'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {entreprise?.nom}
            </Typography>
            <Stack direction="row" spacing={3} divider={<Divider orientation="vertical" flexItem />}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  SIRET
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {entreprise?.siret}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Exercice fiscal
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {entreprise?.exerciceFiscal}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Régime fiscal
                </Typography>
                <Chip 
                  label={entreprise?.regimeFiscal}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Clôture exercice
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {entreprise?.dateClotureExercice}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                size="small"
              >
                Actualiser
              </Button>
              <Button
                variant="contained"
                startIcon={<ExportIcon />}
                size="small"
              >
                Exporter
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. KPIs ADAPTÉS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpis.map((kpi) => (
          <Grid item xs={12} sm={6} lg={3} key={kpi.id}>
            <Card elevation={0} sx={{ 
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              '&:hover': { 
                boxShadow: theme.shadows[4],
                transform: 'translateY(-2px)',
                transition: 'all 0.2s'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {kpi.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                      {kpi.id === 'ca' || kpi.id === 'impots' 
                        ? formatMontant(kpi.valeur) 
                        : `${kpi.valeur}${kpi.unite}`
                      }
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {kpi.evolution > 0 ? (
                        <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                      ) : kpi.evolution < 0 ? (
                        <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
                      ) : null}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: kpi.evolution > 0 ? 'success.main' : kpi.evolution < 0 ? 'error.main' : 'text.secondary',
                          fontWeight: 500
                        }}
                      >
                        {kpi.evolution > 0 ? '+' : ''}{kpi.evolution}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        vs N-1
                      </Typography>
                    </Stack>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: alpha(kpi.couleur, 0.1),
                      color: kpi.couleur,
                      width: 48,
                      height: 48
                    }}
                  >
                    {kpi.icon}
                  </Avatar>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {kpi.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* 4. GRAPHIQUE ÉVOLUTION FINANCIÈRE */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardHeader
              title="Évolution Financière"
              subheader="Chiffre d'affaires et résultat net sur 5 ans"
              avatar={<AssessmentIcon color="primary" />}
              action={
                <Button size="small" variant="outlined">Détail</Button>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionFinanciere}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="annee" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                  <RechartsTooltip
                    formatter={(value) => [formatMontant(Number(value)), '']}
                    labelFormatter={(label) => `Année ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ca"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    name="Chiffre d'affaires"
                  />
                  <Line
                    type="monotone"
                    dataKey="resultat"
                    stroke={theme.palette.success.main}
                    strokeWidth={3}
                    name="Résultat net"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 5. RÉPARTITION DES IMPÔTS */}
        <Grid item xs={12} lg={4}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
            <CardHeader
              title="Répartition des Impôts 2024"
              subheader="Ventilation par type d'impôt"
              avatar={<ReceiptIcon color="secondary" />}
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={repartitionImpots}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${((entry.value / 425000) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {repartitionImpots.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatMontant(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* 3. QUOTA WIDGET - SaaS Multi-Tenant */}
        <Grid item xs={12} lg={4}>
          <QuotaWidget />
        </Grid>
      </Grid>

      {/* Nouvelle section pour Obligations et Balance */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* 6. OBLIGATIONS FISCALES */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%', maxHeight: 450 }}>
            <CardHeader
              title="Obligations Fiscales"
              subheader="Échéances à venir"
              avatar={<ScheduleIcon color="warning" />}
              action={
                <Button size="small" variant="text">Voir tout</Button>
              }
            />
            <CardContent sx={{ pt: 0, maxHeight: 360, overflow: 'auto' }}>
              <List dense>
                {obligations.slice(0, 3).map((obligation, index) => (
                  <React.Fragment key={obligation.id}>
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            bgcolor: alpha(getStatutObligationColor(obligation.statut), 0.1),
                            color: getStatutObligationColor(obligation.statut),
                            width: 36,
                            height: 36
                          }}
                        >
                          <ReceiptIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {obligation.nom}
                            </Typography>
                            <Chip
                              label={obligation.type}
                              size="small"
                              variant="outlined"
                              color="primary"
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Échéance: {new Date(obligation.dateEcheance).toLocaleDateString('fr-FR')}
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 500, color: 'primary.main', display: 'block' }}>
                              {formatMontant(obligation.montant)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={obligation.statut.replace('_', ' ')}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatutObligationColor(obligation.statut), 0.1),
                            color: getStatutObligationColor(obligation.statut),
                            fontSize: '0.7rem'
                          }}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < obligations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 7. BALANCE SYNCHRONISÉE */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%', maxHeight: 450 }}>
            <CardHeader
              title="Balance Synchronisée"
              subheader="État de synchronisation en temps réel"
              avatar={<SyncIcon color="info" />}
              action={
                <Tooltip title="Resynchroniser">
                  <IconButton color="primary" size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent sx={{ maxHeight: 360, overflow: 'auto' }}>
              {synchronisation && (
                <Box>
                  {/* Statut principal */}
                  <Box sx={{
                    p: 1.5,
                    bgcolor: getSyncStatusColor(synchronisation.statut).bg,
                    borderRadius: 1,
                    mb: 2
                  }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {synchronisation.statut === 'SYNC' ? (
                        <CheckIcon sx={{ color: getSyncStatusColor(synchronisation.statut).color, fontSize: 20 }} />
                      ) : (
                        <WarningIcon sx={{ color: getSyncStatusColor(synchronisation.statut).color, fontSize: 20 }} />
                      )}
                      <Box>
                        <Typography variant="body2" sx={{
                          fontWeight: 600,
                          color: getSyncStatusColor(synchronisation.statut).color
                        }}>
                          {synchronisation.statut === 'SYNC' ? 'Synchronisée' :
                           synchronisation.statut === 'ECART' ? 'Écarts détectés' :
                           'Obsolète'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {synchronisation.ecartsDetectes > 0 &&
                            `${synchronisation.ecartsDetectes} écart(s) détecté(s)`
                          }
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Détails synchronisation */}
                  <Grid container spacing={1.5}>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Dernière synchronisation
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {new Date(synchronisation.derniereSynchro).toLocaleString('fr-FR')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary">
                        Fichier source
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {synchronisation.nomFichier}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Période
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                        {synchronisation.periodeCouverte}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Comptes actifs
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {synchronisation.nombreComptes}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Section Historique */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* 8. HISTORIQUE SYNCHRONISATIONS */}
        <Grid item xs={12}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardHeader
              title="Historique des Synchronisations"
              subheader="Dernières importations de balance"
              avatar={<BalanceIcon color="info" />}
            />
            <CardContent sx={{ pt: 0 }}>
              <List>
                {historiqueSync.map((sync, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: sync.statut === 'SYNC' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.warning.main, 0.1),
                          color: sync.statut === 'SYNC' ? theme.palette.success.main : theme.palette.warning.main
                        }}>
                          {sync.statut === 'SYNC' ? <CheckIcon /> : <WarningIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={sync.fichier}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(sync.date).toLocaleDateString('fr-FR')}
                            </Typography>
                            {sync.ecarts > 0 && (
                              <Typography variant="body2" color="warning.main">
                                {sync.ecarts} écart(s) détecté(s)
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={sync.statut === 'SYNC' ? 'Synchronisé' : 'Écarts'}
                          size="small"
                          color={sync.statut === 'SYNC' ? 'success' : 'warning'}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < historiqueSync.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ALERTES DE SYNCHRONISATION */}
      {synchronisation && synchronisation.ecartsDetectes > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small">
              Corriger
            </Button>
          }
        >
          <strong>{synchronisation.ecartsDetectes} écart(s) détecté(s)</strong> lors de la dernière synchronisation. 
          Une correction est recommandée avant génération des états.
        </Alert>
      )}

      {/* ALERTE BALANCE OBSOLÈTE */}
      {synchronisation && (
        (new Date().getTime() - new Date(synchronisation.derniereSynchro).getTime()) > 7 * 24 * 60 * 60 * 1000
      ) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <strong>Balance obsolète</strong> - Dernière synchronisation il y a plus de 7 jours.
          Une mise à jour est nécessaire.
        </Alert>
      )}
    </Box>
  )
}

export default ModernDashboard