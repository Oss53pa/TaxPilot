/**
 * Dashboard moderne inspiré du design Homies Lab
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  TrendingUp,
  Assessment,
  Group,
  Receipt,
  MoreVert,
  Visibility,
  CheckCircle,
  Schedule,
  Business,
  Assignment,
} from '@mui/icons-material'
import { useAuthStore } from '@/store/authStore'
import { entrepriseService } from '@/services/entrepriseService'
import { reportingService } from '@/services/reportingService'
import { auditService } from '@/services/auditService'
import { generationService } from '@/services/generationService'

const ModernDashboard: React.FC = () => {
  const { user } = useAuthStore()
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [auditSessions, setAuditSessions] = useState<any[]>([])
  const [recentGenerations, setRecentGenerations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Charger les stats du dashboard
      const [statsResponse, auditsResponse, generationsResponse] = await Promise.all([
        entrepriseService.getDashboardStats(),
        auditService.getAuditSessions({ page_size: 5 }),
        generationService.getLiasseGenerations({ page_size: 5 })
      ])

      setDashboardStats(statsResponse)
      setAuditSessions(auditsResponse.results || [])
      setRecentGenerations(generationsResponse.results || [])
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      number: dashboardStats?.total_entreprises || '0',
      label: 'Entreprises',
      icon: <Business />,
      color: '#6366f1',
    },
    {
      number: dashboardStats?.entreprises_actives || '0',
      label: 'Entreprises Actives',
      icon: <Group />,
      color: '#10b981',
    },
    {
      number: dashboardStats?.groupes || '0',
      label: 'Groupes',
      icon: <TrendingUp />,
      color: '#f59e0b',
    },
    {
      number: dashboardStats?.nouveaux_ce_mois || '0',
      label: 'Nouveaux ce mois',
      icon: <Assessment />,
      color: '#8b5cf6',
    },
  ]

  const enterpriseStatus = {
    percentComplete: dashboardStats ? Math.round((dashboardStats.entreprises_actives / dashboardStats.total_entreprises) * 100) : 0,
    data: [
      { type: 'Actives', count: dashboardStats?.entreprises_actives || 0, color: '#10b981' },
      { type: 'Inactives', count: (dashboardStats?.total_entreprises || 0) - (dashboardStats?.entreprises_actives || 0), color: '#6b7280' },
    ]
  }

  const recentActivities = [
    ...auditSessions.map(audit => ({
      id: `audit-${audit.id}`,
      title: `Audit ${audit.type_audit}`,
      description: audit.entreprise_detail?.raison_sociale || 'Audit en cours',
      status: audit.statut.toLowerCase(),
      type: 'audit',
      progression: audit.progression
    })),
    ...recentGenerations.map(generation => ({
      id: `generation-${generation.id}`,
      title: `Génération ${generation.type_liasse}`,
      description: generation.entreprise_detail?.raison_sociale || 'Génération en cours',
      status: generation.statut.toLowerCase(),
      type: 'generation',
      progression: generation.progression
    }))
  ].slice(0, 6)

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'termine':
      case 'terminee':
      case 'completed':
        return 'success'
      case 'en_cours':
      case 'en_preparation':
      case 'in-progress':
        return 'warning'
      case 'erreur':
      case 'error':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'termine':
      case 'terminee':
        return 'Terminé'
      case 'en_cours':
        return 'En cours'
      case 'en_preparation':
        return 'En préparation'
      case 'erreur':
        return 'Erreur'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', p: 3 }}>
      {/* Header moderne */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: '#191919', mb: 0.5 }}>
          Good Morning, {user?.first_name || user?.username}
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', fontWeight: 400 }}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Cards statistiques */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <Card 
                  sx={{ 
                    height: '120px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '1px solid #e5e7eb',
                    '&:hover': { 
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#191919', mb: 0.5 }}>
                          {stat.number}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                          {stat.label}
                        </Typography>
                      </Box>
                      <Avatar 
                        sx={{ 
                          backgroundColor: `${stat.color}15`,
                          color: stat.color,
                          width: 48,
                          height: 48
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Status emploi avec graphique rond */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '300px' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#191919' }}>
                  Statut Entreprises
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>

              <Box sx={{ position: 'relative', display: 'inline-flex', mx: 'auto', mb: 3 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `conic-gradient(#10b981 ${enterpriseStatus.percentComplete * 3.6}deg, #e5e7eb 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#191919' }}>
                      {enterpriseStatus.percentComplete}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      Actives
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {enterpriseStatus.data.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {item.count} {item.type}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tâches à venir */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '300px' }}>
            <CardContent sx={{ p: 3, pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#191919' }}>
                  Activités Récentes
                </Typography>
                <IconButton size="small">
                  <MoreVert />
                </IconButton>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Button variant="contained" size="small" sx={{ mr: 1 }}>
                  Audits
                </Button>
                <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                  Générations
                </Button>
                <Button variant="text" size="small">
                  Tous
                </Button>
              </Box>

              <Box sx={{ maxHeight: '180px', overflow: 'auto' }}>
                {recentActivities.length > 0 ? recentActivities.map((activity) => (
                  <Box key={activity.id} sx={{ mb: 2, p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: activity.type === 'audit' ? 'warning.light' : 'primary.light' }}>
                        {activity.type === 'audit' ? <Assessment /> : <Assignment />}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#191919' }}>
                          {activity.title}
                        </Typography>
                        {activity.description && (
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {activity.description}
                          </Typography>
                        )}
                        {activity.progression !== undefined && (
                          <LinearProgress
                            variant="determinate"
                            value={activity.progression}
                            sx={{ mt: 1, height: 4, borderRadius: 2 }}
                          />
                        )}
                      </Box>
                      <Chip
                        size="small"
                        label={getStatusLabel(activity.status)}
                        color={getStatusColor(activity.status)}
                      />
                    </Box>
                  </Box>
                )) : (
                  <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center', py: 4 }}>
                    Aucune activité récente
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Liste des employés récents */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#191919' }}>
                  Statistiques par Secteur
                </Typography>
                <Button variant="outlined" size="small">
                  Voir Tout
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        SECTEUR
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        NOMBRE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        POURCENTAGE
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>
                        ÉVOLUTION
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboardStats?.par_secteur?.map((secteur: any, index: number) => (
                      <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f9fafb' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: `hsl(${index * 60}, 70%, 50%)` }}>
                              {secteur.secteur_activite.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 500, color: '#191919' }}>
                              {secteur.secteur_activite}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {secteur.count}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {dashboardStats.total_entreprises > 0 ?
                              Math.round((secteur.count / dashboardStats.total_entreprises) * 100) : 0}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label="Stable"
                            color="success"
                            size="small"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center', py: 4 }}>
                            Aucune donnée disponible
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ModernDashboard