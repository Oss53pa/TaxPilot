/**
 * Dashboard Moderne - Interface SaaS Professionnelle
 * Métriques métier avancées pour comptabilité SYSCOHADA
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
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
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assignment as AssignmentIcon,
  AccountBalance as BalanceIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material'

interface DashboardMetric {
  title: string
  value: string | number
  change: number
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ReactElement
  color: string
  subtitle?: string
}

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'credit' | 'debit'
  status: 'validated' | 'pending' | 'error'
}

interface LiasseStatus {
  id: string
  name: string
  completion: number
  status: 'draft' | 'review' | 'validated'
  dueDate: string
}

const ModernDashboard: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const dashboardMetrics: DashboardMetric[] = [
    {
      title: 'Chiffre d\'affaires',
      value: '2 450 780',
      change: 12.5,
      changeType: 'positive',
      icon: <MoneyIcon />,
      color: theme.palette.success.main,
      subtitle: 'FCFA ce mois'
    },
    {
      title: 'Balance équilibrée',
      value: '98.7%',
      change: 2.1,
      changeType: 'positive',
      icon: <BalanceIcon />,
      color: theme.palette.info.main,
      subtitle: 'Écritures validées'
    },
    {
      title: 'Liasses en cours',
      value: 4,
      change: -1,
      changeType: 'negative',
      icon: <AssignmentIcon />,
      color: theme.palette.warning.main,
      subtitle: 'À finaliser'
    },
    {
      title: 'Conformité SYSCOHADA',
      value: '94.2%',
      change: 1.8,
      changeType: 'positive',
      icon: <SecurityIcon />,
      color: theme.palette.primary.main,
      subtitle: 'Score global'
    }
  ]

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      date: '2024-12-15',
      description: 'Vente marchandises - FACTURE F001234',
      amount: 850000,
      type: 'credit',
      status: 'validated'
    },
    {
      id: '2',
      date: '2024-12-15',
      description: 'Achat matériel informatique',
      amount: 320000,
      type: 'debit',
      status: 'pending'
    },
    {
      id: '3',
      date: '2024-12-14',
      description: 'Salaires personnel - Décembre',
      amount: 1200000,
      type: 'debit',
      status: 'validated'
    }
  ]

  const currentLiasses: LiasseStatus[] = [
    {
      id: '1',
      name: 'Liasse fiscale 2024',
      completion: 85,
      status: 'review',
      dueDate: '2025-04-30'
    },
    {
      id: '2',
      name: 'DSF 2024',
      completion: 65,
      status: 'draft',
      dueDate: '2025-04-15'
    },
    {
      id: '3',
      name: 'Déclaration TVA Q4',
      completion: 100,
      status: 'validated',
      dueDate: '2025-01-15'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return theme.palette.success.main
      case 'review': return theme.palette.warning.main
      case 'draft': return theme.palette.info.main
      case 'error': return theme.palette.error.main
      case 'pending': return theme.palette.warning.main
      default: return theme.palette.grey[500]
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'validated': return 'Validée'
      case 'review': return 'En révision'
      case 'draft': return 'Brouillon'
      case 'error': return 'Erreur'
      case 'pending': return 'En attente'
      default: return status
    }
  }

  const MetricCard: React.FC<{ metric: DashboardMetric; loading: boolean }> = ({ metric, loading }) => (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {loading ? (
          <Box>
            <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Avatar
                sx={{
                  backgroundColor: alpha(metric.color, 0.1),
                  color: metric.color,
                  width: 56,
                  height: 56,
                }}
              >
                {metric.icon}
              </Avatar>
              <Chip
                label={`${metric.change > 0 ? '+' : ''}${metric.change}%`}
                size="small"
                color={metric.changeType === 'positive' ? 'success' : 
                       metric.changeType === 'negative' ? 'error' : 'default'}
                icon={metric.changeType === 'positive' ? <TrendingUpIcon /> : 
                      metric.changeType === 'negative' ? <TrendingDownIcon /> : undefined}
              />
            </Box>
            
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {metric.subtitle}
            </Typography>
            
            <Typography variant="h6" sx={{ fontWeight: 600, mt: 1 }}>
              {metric.title}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Tableau de bord
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Vue d'ensemble de votre comptabilité SYSCOHADA
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
            >
              Actualiser
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
            >
              Exporter
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Nouvelle écriture
            </Button>
          </Stack>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Métriques principales */}
        {dashboardMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <MetricCard metric={metric} loading={loading} />
          </Grid>
        ))}

        {/* Transactions récentes */}
        <Grid item xs={12} lg={7}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Transactions récentes
                </Typography>
                <Button size="small">
                  Voir tout
                </Button>
              </Box>

              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                      <Skeleton variant="text" height={16} width="60%" />
                    </Box>
                    <Skeleton variant="text" width={80} height={20} />
                  </Box>
                ))
              ) : (
                <List disablePadding>
                  {recentTransactions.map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              backgroundColor: alpha(
                                transaction.type === 'credit' ? theme.palette.success.main : theme.palette.error.main,
                                0.1
                              ),
                              color: transaction.type === 'credit' ? theme.palette.success.main : theme.palette.error.main,
                            }}
                          >
                            {transaction.type === 'credit' ? '+' : '-'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={transaction.description}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {transaction.date}
                              </Typography>
                              <Chip
                                label={getStatusLabel(transaction.status)}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.75rem',
                                  backgroundColor: alpha(getStatusColor(transaction.status), 0.1),
                                  color: getStatusColor(transaction.status),
                                }}
                              />
                            </Box>
                          }
                          secondaryTypographyProps={{ component: 'div' }}
                        />
                        <ListItemSecondaryAction>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: transaction.type === 'credit' ? theme.palette.success.main : theme.palette.error.main,
                            }}
                          >
                            {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toLocaleString()} FCFA
                          </Typography>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < recentTransactions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Liasses fiscales */}
        <Grid item xs={12} lg={5}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Liasses fiscales
                </Typography>
                <Button size="small" startIcon={<AddIcon />}>
                  Nouvelle
                </Button>
              </Box>

              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" height={8} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={16} width="40%" />
                  </Box>
                ))
              ) : (
                <List disablePadding>
                  {currentLiasses.map((liasse, index) => (
                    <React.Fragment key={liasse.id}>
                      <ListItem sx={{ px: 0, py: 2, flexDirection: 'column', alignItems: 'stretch' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, width: '100%' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {liasse.name}
                          </Typography>
                          <Chip
                            label={getStatusLabel(liasse.status)}
                            size="small"
                            sx={{
                              backgroundColor: alpha(getStatusColor(liasse.status), 0.1),
                              color: getStatusColor(liasse.status),
                              fontSize: '0.75rem',
                              height: 24,
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Complétude
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {liasse.completion}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={liasse.completion}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: alpha(theme.palette.divider, 0.1),
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                                backgroundColor: 
                                  liasse.completion >= 80 ? theme.palette.success.main :
                                  liasse.completion >= 50 ? theme.palette.warning.main :
                                  theme.palette.error.main,
                              },
                            }}
                          />
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          Échéance: {liasse.dueDate}
                        </Typography>
                      </ListItem>
                      {index < currentLiasses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ModernDashboard