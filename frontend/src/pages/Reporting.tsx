/**
 * Page du module de reporting et tableaux de bord
 */

import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Tab,
  Tabs,
  // Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  // LinearProgress,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material'
import {
  Analytics,
  TrendingUp,
  TrendingDown,
  GetApp,
  Refresh,
  Edit,
  Visibility,
  Add,
  Dashboard as DashboardIcon,
  Star,
} from '@mui/icons-material'
import { reportingService } from '@/services/reportingService'

const Reporting = () => {
  const [tabValue, setTabValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [reports, setReports] = useState<any[]>([])
  const [reportTemplates, setReportTemplates] = useState<any[]>([])

  useEffect(() => {
    loadReportingData()
  }, [])

  const loadReportingData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading reporting data from backend...')

      const [statsResponse, reportsResponse, templatesResponse] = await Promise.all([
        reportingService.getDashboardStats(),
        reportingService.getReports({ page_size: 10 }),
        reportingService.getReportTemplates({ page: 1 })
      ])

      setDashboardStats(statsResponse)
      setReports((reportsResponse as any).results || [])
      setReportTemplates((templatesResponse as any).results || [])

      console.log('✅ Reporting data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading reporting data:', error)
    } finally {
      setLoading(false)
    }
  }

  // KPIs basés sur les données backend
  const kpisDashboard = [
    {
      nom: 'Total Entreprises',
      valeur: dashboardStats?.entreprises_total || '0',
      evolution: dashboardStats?.croissance_mensuelle || 0,
      tendance: (dashboardStats?.croissance_mensuelle || 0) >= 0 ? 'up' : 'down',
      couleur: 'success.main',
    },
    {
      nom: 'Liasses ce mois',
      valeur: dashboardStats?.liasses_ce_mois || '0',
      evolution: 8.5,
      tendance: 'up',
      couleur: 'primary.main',
    },
    {
      nom: 'Audits en cours',
      valeur: dashboardStats?.audits_en_cours || '0',
      evolution: -2.1,
      tendance: 'down',
      couleur: 'warning.main',
    },
    {
      nom: 'Revenus mensuels',
      valeur: dashboardStats?.revenue_mensuel ? `${(dashboardStats.revenue_mensuel / 1000000).toFixed(1)}M` : '0M',
      evolution: dashboardStats?.croissance_mensuelle || 0,
      tendance: (dashboardStats?.croissance_mensuelle || 0) >= 0 ? 'up' : 'down',
      couleur: 'info.main',
    },
  ]

  // Tableaux de bord basés sur les templates backend
  const tableauxBord = reportTemplates.slice(0, 6).map(template => ({
    id: template.id,
    nom: template.nom,
    type: template.type_rapport?.toUpperCase() || 'GENERAL',
    description: template.description,
    nbWidgets: template.sections?.length || 0,
    derniereMAJ: new Date(template.updated_at || template.created_at).toLocaleDateString('fr-FR'),
    estFavori: template.is_public,
  }))

  // Rapports personnalisés basés sur les données backend
  const rapportsPersonnalises = reports.slice(0, 10).map(report => ({
    id: report.id,
    nom: report.nom,
    type: report.format?.toUpperCase() || 'PDF',
    statut: getStatutLabel(report.statut),
    dateMaj: new Date(report.updated_at).toLocaleDateString('fr-FR'),
    taille: report.taille_fichier ? `${(report.taille_fichier / (1024*1024)).toFixed(1)} MB` : '-',
  }))

  function getStatutLabel(statut: string) {
    switch (statut?.toLowerCase()) {
      case 'termine': return 'Généré'
      case 'en_cours': return 'En cours'
      case 'en_preparation': return 'En préparation'
      case 'erreur': return 'Erreur'
      default: return statut || 'En attente'
    }
  }

  const getTendanceIcon = (tendance: string) => {
    return tendance === 'up' ? <TrendingUp color="success" /> : <TrendingDown color="error" />
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Généré': return 'success'
      case 'En cours': return 'warning'
      case 'Erreur': return 'error'
      default: return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
          <Analytics sx={{ mr: 2, verticalAlign: 'middle' }} />
          Reporting & Analytics
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => console.log('🔄 Creating new report template...')}
          >
            Nouveau Rapport
          </Button>
          <Button
            variant="outlined"
            startIcon={<GetApp />}
            onClick={() => console.log('📥 Exporting reports...')}
          >
            Exporter
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadReportingData}
            disabled={loading}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Tableaux de Bord" />
        <Tab label="Rapports Personnalisés" />
        <Tab label="KPI & Métriques" />
      </Tabs>

      {/* Onglet Tableaux de Bord */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {tableauxBord.map((tableau) => (
            <Grid item xs={12} sm={6} md={4} key={tableau.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <DashboardIcon />
                    </Avatar>
                  }
                  title={tableau.nom}
                  subheader={tableau.type}
                  action={
                    <IconButton>
                      {tableau.estFavori ? <Star color="warning" /> : <Star />}
                    </IconButton>
                  }
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tableau.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption">
                      {tableau.nbWidgets} widgets
                    </Typography>
                    <Typography variant="caption">
                      MAJ: {tableau.derniereMAJ}
                    </Typography>
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Visibility />}
                    size="small"
                  >
                    Ouvrir
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Onglet Rapports */}
      {tabValue === 1 && (
        <Card>
          <CardHeader title="Rapports Personnalisés" />
          <Divider />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom du Rapport</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Dernière MAJ</TableCell>
                    <TableCell>Taille</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rapportsPersonnalises.map((rapport) => (
                    <TableRow key={rapport.id}>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {rapport.nom}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={rapport.type} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={rapport.statut}
                          color={getStatutColor(rapport.statut) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{rapport.dateMaj}</TableCell>
                      <TableCell>{rapport.taille}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Voir">
                            <IconButton size="small">
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Éditer">
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Télécharger">
                            <IconButton size="small">
                              <GetApp />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Onglet KPI */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          {kpisDashboard.map((kpi, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getTendanceIcon(kpi.tendance)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {kpi.nom}
                    </Typography>
                  </Box>
                  <Typography variant="h4" sx={{ color: kpi.couleur, mb: 1 }}>
                    {kpi.valeur}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: kpi.evolution > 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {kpi.evolution > 0 ? '+' : ''}{kpi.evolution}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      vs mois dernier
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default Reporting