/**
 * Page du module de reporting et tableaux de bord
 */

import React, { useState } from 'react'
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material'
import {
  Analytics,
  BarChart,
  PieChart,
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

const Reporting: React.FC = () => {
  const [tabValue, setTabValue] = useState(0)

  // Données KPI de démo
  const kpisDashboard = [
    {
      nom: 'Chiffre d\'Affaires',
      valeur: '125.5M',
      evolution: 12.5,
      tendance: 'up',
      couleur: 'success.main',
    },
    {
      nom: 'Résultat Net',
      valeur: '8.7M',
      evolution: -3.2,
      tendance: 'down',
      couleur: 'warning.main',
    },
    {
      nom: 'Trésorerie',
      valeur: '15.2M',
      evolution: 25.8,
      tendance: 'up',
      couleur: 'info.main',
    },
    {
      nom: 'Ratio Liquidité',
      valeur: '1.45',
      evolution: 5.1,
      tendance: 'up',
      couleur: 'primary.main',
    },
  ]

  const tableauxBord = [
    {
      id: '1',
      nom: 'Dashboard Financier',
      type: 'FINANCIER',
      description: 'Vue d\'ensemble de la situation financière',
      nbWidgets: 8,
      derniereMAJ: '2024-03-20',
      estFavori: true,
    },
    {
      id: '2',
      nom: 'Suivi Fiscal',
      type: 'FISCAL',
      description: 'Suivi des obligations et échéances fiscales',
      nbWidgets: 6,
      derniereMAJ: '2024-03-18',
      estFavori: false,
    },
    {
      id: '3',
      nom: 'Analytique Avancé',
      type: 'ANALYTIQUE',
      description: 'Analyses approfondies et ratios',
      nbWidgets: 12,
      derniereMAJ: '2024-03-19',
      estFavori: true,
    },
  ]

  const rapportsPersonnalises = [
    {
      id: '1',
      nom: 'Situation Financière T1',
      type: 'PDF',
      statut: 'Généré',
      dateMaj: '2024-03-15',
      taille: '2.3 MB',
    },
    {
      id: '2',
      nom: 'Analyse CA Mensuelle',
      type: 'EXCEL',
      statut: 'En cours',
      dateMaj: '2024-03-20',
      taille: '-',
    },
    {
      id: '3',
      nom: 'Ratios Financiers',
      type: 'PDF',
      statut: 'Généré',
      dateMaj: '2024-03-10',
      taille: '1.8 MB',
    },
  ]

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
          <Button variant="contained" startIcon={<Add />}>
            Nouveau Tableau
          </Button>
          <Button variant="outlined" startIcon={<GetApp />}>
            Exporter
          </Button>
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
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