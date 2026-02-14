/**
 * Calendrier Fiscal Intelligent - Gestion des échéances fiscales multi-pays
 * Conforme aux exigences section 2.2.5 du cahier des charges
 */

import React, { useState, useEffect } from 'react'
import { arrondiFCFA } from '@/config/taux-fiscaux-ci'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
} from '@mui/material'
import {
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  NotificationsActive as NotificationIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Assessment as AssessmentIcon,
  Public as GlobalIcon,
  AccountBalance as TaxIcon,
  Receipt as ReceiptIcon,
  Calculate as CalculateIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  GetApp as ExportIcon,
  Sync as SyncIcon,
  Settings as SettingsIcon,
  Gavel as PenaltyIcon,
  Dashboard as DashboardIcon,
  Send as SendIcon,
} from '@mui/icons-material'

interface FiscalDeadline {
  id: string
  title: string
  type: 'tax' | 'declaration' | 'payment' | 'report' | 'other'
  country: string
  jurisdiction: string
  dueDate: string
  recurrence: 'none' | 'monthly' | 'quarterly' | 'annual'
  amount?: number
  penalty?: number
  penaltyRate?: number
  status: 'upcoming' | 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  documents?: string[]
  responsiblePerson?: string
  linkedModule?: string
}

interface FiscalAlert {
  id: string
  deadlineId: string
  type: 'reminder' | 'warning' | 'overdue'
  message: string
  daysBeforeDue: number
  sent: boolean
  sentDate?: string
}

interface Country {
  code: string
  name: string
  flag: string
  timezone: string
  fiscalYearStart: string
  fiscalYearEnd: string
  taxAuthority: string
  complianceRate?: number
}

interface PenaltyCalculation {
  deadlineId: string
  daysOverdue: number
  baseAmount: number
  penaltyRate: number
  dailyPenalty: number
  totalPenalty: number
  currency: string
}

const ModernFiscalCalendar: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false)
  const [penaltyDialogOpen, setPenaltyDialogOpen] = useState(false)
  const [selectedDeadline, setSelectedDeadline] = useState<FiscalDeadline | null>(null)
  const [notifications, setNotifications] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Données conformes aux exigences du cahier des charges
  const countries: Country[] = [
    {
      code: 'CI',
      name: 'Côte d\'Ivoire',
      flag: '🇨🇮',
      timezone: 'GMT',
      fiscalYearStart: '01-01',
      fiscalYearEnd: '12-31',
      taxAuthority: 'Direction Générale des Impôts',
      complianceRate: 95
    },
    {
      code: 'SN',
      name: 'Sénégal',
      flag: '🇸🇳',
      timezone: 'GMT',
      fiscalYearStart: '01-01',
      fiscalYearEnd: '12-31',
      taxAuthority: 'DGID',
      complianceRate: 92
    },
    {
      code: 'BF',
      name: 'Burkina Faso',
      flag: '🇧🇫',
      timezone: 'GMT',
      fiscalYearStart: '01-01',
      fiscalYearEnd: '12-31',
      taxAuthority: 'DGI',
      complianceRate: 88
    },
    {
      code: 'ML',
      name: 'Mali',
      flag: '🇲🇱',
      timezone: 'GMT',
      fiscalYearStart: '01-01',
      fiscalYearEnd: '12-31',
      taxAuthority: 'DGI Mali',
      complianceRate: 90
    }
  ]

  const fiscalDeadlines: FiscalDeadline[] = [
    {
      id: '1',
      title: 'Déclaration TVA Mensuelle',
      type: 'declaration',
      country: 'CI',
      jurisdiction: 'Côte d\'Ivoire',
      dueDate: '2025-01-15',
      recurrence: 'monthly',
      amount: 2500000,
      penalty: 0,
      penaltyRate: 10,
      status: 'upcoming',
      priority: 'high',
      description: 'Déclaration et paiement TVA du mois de décembre 2024',
      documents: ['balance_dec_2024.xlsx'],
      responsiblePerson: 'Chef Comptable',
      linkedModule: 'teledeclaration'
    },
    {
      id: '2',
      title: 'Acompte IS - 1er trimestre',
      type: 'payment',
      country: 'CI',
      jurisdiction: 'Côte d\'Ivoire',
      dueDate: '2025-01-10',
      recurrence: 'quarterly',
      amount: 5000000,
      penaltyRate: 5,
      status: 'pending',
      priority: 'critical',
      description: 'Premier acompte IS 2025',
      responsiblePerson: 'DAF'
    },
    {
      id: '3',
      title: 'Déclaration Sociale Trimestrielle',
      type: 'declaration',
      country: 'SN',
      jurisdiction: 'Sénégal',
      dueDate: '2025-01-31',
      recurrence: 'quarterly',
      status: 'upcoming',
      priority: 'medium',
      description: 'Déclaration CNSS Q4 2024',
      responsiblePerson: 'RH'
    },
    {
      id: '4',
      title: 'Liasse Fiscale Annuelle',
      type: 'report',
      country: 'CI',
      jurisdiction: 'Côte d\'Ivoire',
      dueDate: '2025-04-30',
      recurrence: 'annual',
      status: 'upcoming',
      priority: 'high',
      description: 'Dépôt liasse fiscale exercice 2024',
      linkedModule: 'liasse'
    },
    {
      id: '5',
      title: 'TVA Décembre 2024',
      type: 'payment',
      country: 'BF',
      jurisdiction: 'Burkina Faso',
      dueDate: '2024-12-20',
      recurrence: 'monthly',
      amount: 1800000,
      penalty: 90000,
      penaltyRate: 5,
      status: 'overdue',
      priority: 'critical',
      description: 'URGENT: Paiement en retard - pénalités en cours',
      responsiblePerson: 'Comptabilité'
    }
  ]

  const fiscalAlerts: FiscalAlert[] = [
    {
      id: '1',
      deadlineId: '1',
      type: 'reminder',
      message: 'TVA mensuelle à déclarer dans 5 jours',
      daysBeforeDue: 5,
      sent: true,
      sentDate: '2025-01-10'
    },
    {
      id: '2',
      deadlineId: '2',
      type: 'warning',
      message: 'Acompte IS dû dans 2 jours - Préparer le paiement',
      daysBeforeDue: 2,
      sent: false
    },
    {
      id: '3',
      deadlineId: '5',
      type: 'overdue',
      message: 'TVA Burkina Faso en retard - Pénalités applicables',
      daysBeforeDue: -5,
      sent: true,
      sentDate: '2024-12-21'
    }
  ]

  const penaltyCalculations: PenaltyCalculation[] = [
    {
      deadlineId: '5',
      daysOverdue: 27,
      baseAmount: 1800000,
      penaltyRate: 5,
      dailyPenalty: 3000,
      totalPenalty: 90000,
      currency: 'XOF'
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tax': return <TaxIcon />
      case 'declaration': return <ReceiptIcon />
      case 'payment': return <MoneyIcon />
      case 'report': return <AssessmentIcon />
      default: return <EventIcon />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tax': return theme.palette.primary.main
      case 'declaration': return theme.palette.info.main
      case 'payment': return theme.palette.warning.main
      case 'report': return theme.palette.success.main
      default: return theme.palette.grey[500]
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main
      case 'pending': return theme.palette.warning.main
      case 'overdue': return theme.palette.error.main
      case 'upcoming': return theme.palette.info.main
      default: return theme.palette.grey[500]
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return theme.palette.error.main
      case 'high': return theme.palette.warning.main
      case 'medium': return theme.palette.info.main
      case 'low': return theme.palette.grey[500]
      default: return theme.palette.grey[500]
    }
  }

  const calculatePenalty = (deadline: FiscalDeadline): number => {
    if (!deadline.amount || !deadline.penaltyRate) return 0
    const dueDate = new Date(deadline.dueDate)
    const today = new Date()
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysOverdue <= 0) return 0
    
    // Calcul selon les règles fiscales
    const basePenalty = arrondiFCFA((deadline.amount * deadline.penaltyRate) / 100)
    const dailyPenalty = arrondiFCFA(basePenalty / 30) // Pénalité journalière
    return arrondiFCFA(Math.min(basePenalty + (dailyPenalty * daysOverdue), deadline.amount * 0.5)) // Plafond à 50%
  }

  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate)
    const today = new Date()
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getCalendarDays = () => {
    const year = selectedMonth.getFullYear()
    const month = selectedMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    // Jours du mois précédent
    const startDay = firstDay.getDay() || 7
    for (let i = startDay - 1; i > 0; i--) {
      const date = new Date(year, month, -i + 1)
      days.push({ date, currentMonth: false, deadlines: [] })
    }
    
    // Jours du mois actuel
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      const dateStr = date.toISOString().split('T')[0]
      const dayDeadlines = fiscalDeadlines.filter(d => 
        d.dueDate === dateStr && 
        (selectedCountry === 'all' || d.country === selectedCountry)
      )
      days.push({ date, currentMonth: true, deadlines: dayDeadlines })
    }
    
    // Jours du mois suivant
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, currentMonth: false, deadlines: [] })
    }
    
    return days
  }

  const handlePreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))
  }

  const handleToday = () => {
    setSelectedMonth(new Date())
  }

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Calendrier Fiscal Intelligent
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Échéancier fiscal multi-pays avec alertes automatiques et calcul des pénalités
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                />
              }
              label="Notifications"
            />
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
            >
              Synchroniser
            </Button>
            <Button
              variant="contained"
              startIcon={<EventIcon />}
              onClick={() => setDeadlineDialogOpen(true)}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Nouvelle échéance
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Métriques de conformité */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main }}>
                      8
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Échéances ce mois
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                    }}
                  >
                    <CalendarIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.main }}>
                      1
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En retard
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                    }}
                  >
                    <WarningIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.error.main }}>
                      90K
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pénalités (FCFA)
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                    }}
                  >
                    <PenaltyIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                      94%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Conformité fiscale
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                    }}
                  >
                    <DashboardIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={9}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {/* Contrôles du calendrier */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton onClick={handlePreviousMonth}>
                    <ChevronLeftIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 150, textAlign: 'center' }}>
                    {selectedMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                  </Typography>
                  <IconButton onClick={handleNextMonth}>
                    <ChevronRightIcon />
                  </IconButton>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<TodayIcon />}
                    onClick={handleToday}
                  >
                    Aujourd'hui
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Pays</InputLabel>
                    <Select
                      value={selectedCountry}
                      label="Pays"
                      onChange={(e) => setSelectedCountry(e.target.value)}
                    >
                      <MenuItem value="all">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <GlobalIcon fontSize="small" />
                          Tous les pays
                        </Box>
                      </MenuItem>
                      {countries.map((country) => (
                        <MenuItem key={country.code} value={country.code}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{country.flag}</span>
                            {country.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                  >
                    <ToggleButton value="calendar">
                      <ViewModuleIcon />
                    </ToggleButton>
                    <ToggleButton value="list">
                      <ViewListIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>

              {viewMode === 'calendar' ? (
                <>
                  {/* En-têtes des jours */}
                  <Grid container sx={{ mb: 2 }}>
                    {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                      <Grid item xs={12 / 7} key={day}>
                        <Typography variant="subtitle2" align="center" sx={{ fontWeight: 600 }}>
                          {day}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Grille du calendrier */}
                  <Grid container spacing={1}>
                    {getCalendarDays().map((day, index) => (
                      <Grid item xs={12 / 7} key={index}>
                        <Paper
                          sx={{
                            p: 1,
                            minHeight: 100,
                            backgroundColor: day.currentMonth ? 'background.paper' : alpha(theme.palette.action.disabled, 0.02),
                            opacity: day.currentMonth ? 1 : 0.5,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            cursor: day.deadlines.length > 0 ? 'pointer' : 'default',
                            '&:hover': day.deadlines.length > 0 ? {
                              backgroundColor: alpha(theme.palette.primary.main, 0.02),
                            } : {},
                          }}
                          onClick={() => day.deadlines.length > 0 && setSelectedDeadline(day.deadlines[0])}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: new Date().toDateString() === day.date.toDateString() ? 700 : 400,
                              color: new Date().toDateString() === day.date.toDateString() ? theme.palette.primary.main : 'text.primary',
                            }}
                          >
                            {day.date.getDate()}
                          </Typography>
                          
                          {day.deadlines.map((deadline) => (
                            <Box
                              key={deadline.id}
                              sx={{
                                mt: 0.5,
                                p: 0.5,
                                backgroundColor: alpha(getStatusColor(deadline.status), 0.1),
                                borderRadius: 0.5,
                                borderLeft: `3px solid ${getStatusColor(deadline.status)}`,
                              }}
                            >
                              <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                                {deadline.title.substring(0, 15)}...
                              </Typography>
                              {deadline.amount && (
                                <Typography variant="caption" color="text.secondary">
                                  {(deadline.amount / 1000000).toFixed(1)}M
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                /* Vue liste */
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Échéance</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Pays</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date limite</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fiscalDeadlines
                        .filter(d => selectedCountry === 'all' || d.country === selectedCountry)
                        .map((deadline) => (
                          <TableRow key={deadline.id} hover>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor: alpha(getTypeColor(deadline.type), 0.1),
                                    color: getTypeColor(deadline.type),
                                  }}
                                >
                                  {getTypeIcon(deadline.type)}
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {deadline.title}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {deadline.description.substring(0, 50)}...
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  deadline.type === 'tax' ? 'Impôt' :
                                  deadline.type === 'declaration' ? 'Déclaration' :
                                  deadline.type === 'payment' ? 'Paiement' :
                                  deadline.type === 'report' ? 'Rapport' : 'Autre'
                                }
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <span>{countries.find(c => c.code === deadline.country)?.flag}</span>
                                {deadline.jurisdiction}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box>
                                <Typography variant="body2">
                                  {new Date(deadline.dueDate).toLocaleDateString('fr-FR')}
                                </Typography>
                                <Typography variant="caption" color={
                                  getDaysUntilDue(deadline.dueDate) < 0 ? 'error.main' :
                                  getDaysUntilDue(deadline.dueDate) <= 7 ? 'warning.main' : 'text.secondary'
                                }>
                                  {getDaysUntilDue(deadline.dueDate) < 0 
                                    ? `${Math.abs(getDaysUntilDue(deadline.dueDate))} jours de retard`
                                    : `Dans ${getDaysUntilDue(deadline.dueDate)} jours`
                                  }
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              {deadline.amount ? (
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {deadline.amount.toLocaleString()}
                                  </Typography>
                                  {deadline.status === 'overdue' && deadline.penaltyRate && (
                                    <Typography variant="caption" color="error.main">
                                      Pénalité: {calculatePenalty(deadline).toLocaleString()}
                                    </Typography>
                                  )}
                                </Box>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={
                                  deadline.status === 'completed' ? 'Complété' :
                                  deadline.status === 'pending' ? 'En cours' :
                                  deadline.status === 'overdue' ? 'En retard' : 'À venir'
                                }
                                size="small"
                                sx={{
                                  backgroundColor: alpha(getStatusColor(deadline.status), 0.1),
                                  color: getStatusColor(deadline.status),
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={1}>
                                {deadline.linkedModule && (
                                  <Tooltip title="Ouvrir dans le module">
                                    <IconButton size="small" color="primary">
                                      <SendIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="Détails">
                                  <IconButton size="small" onClick={() => setSelectedDeadline(deadline)}>
                                    <EventIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Panneau latéral */}
        <Grid item xs={12} lg={3}>
          <Stack spacing={3}>
            {/* Alertes et notifications */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Alertes actives
                  </Typography>
                  <Badge badgeContent={fiscalAlerts.filter(a => !a.sent).length} color="error">
                    <NotificationIcon />
                  </Badge>
                </Box>

                <List disablePadding>
                  {fiscalAlerts.map((alert, index) => (
                    <React.Fragment key={alert.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: alpha(
                                alert.type === 'overdue' ? theme.palette.error.main :
                                alert.type === 'warning' ? theme.palette.warning.main :
                                theme.palette.info.main,
                                0.1
                              ),
                              color: alert.type === 'overdue' ? theme.palette.error.main :
                                     alert.type === 'warning' ? theme.palette.warning.main :
                                     theme.palette.info.main,
                            }}
                          >
                            {alert.type === 'overdue' ? <ErrorIcon fontSize="small" /> :
                             alert.type === 'warning' ? <WarningIcon fontSize="small" /> :
                             <NotificationIcon fontSize="small" />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {alert.message}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {alert.sent ? `Envoyé le ${alert.sentDate}` : 'Non envoyé'}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < fiscalAlerts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 2 }}
                  startIcon={<SettingsIcon />}
                >
                  Configurer les alertes
                </Button>
              </CardContent>
            </Card>

            {/* Dashboard de conformité par pays */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Conformité par pays
                </Typography>

                <Stack spacing={2}>
                  {countries.map((country) => (
                    <Paper key={country.code} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <span style={{ fontSize: '1.5rem' }}>{country.flag}</span>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {country.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {country.taxAuthority}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                          {country.complianceRate}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={country.complianceRate || 0}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.divider, 0.1),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 
                              (country.complianceRate || 0) >= 90 ? theme.palette.success.main :
                              (country.complianceRate || 0) >= 70 ? theme.palette.warning.main :
                              theme.palette.error.main,
                          },
                        }}
                      />
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Calcul des pénalités */}
            {penaltyCalculations.length > 0 && (
              <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Pénalités calculées
                    </Typography>
                    <IconButton size="small" onClick={() => setPenaltyDialogOpen(true)}>
                      <CalculateIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {penaltyCalculations.map((calc) => (
                    <Alert key={calc.deadlineId} severity="error" sx={{ mb: 2 }}>
                      <AlertTitle>
                        {fiscalDeadlines.find(d => d.id === calc.deadlineId)?.title}
                      </AlertTitle>
                      <Typography variant="body2">
                        {calc.daysOverdue} jours de retard
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Pénalité totale: {calc.totalPenalty.toLocaleString()} {calc.currency}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Base: {calc.baseAmount.toLocaleString()} × {calc.penaltyRate}%
                      </Typography>
                    </Alert>
                  ))}

                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<ExportIcon />}
                  >
                    Exporter rapport pénalités
                  </Button>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Dialog nouvelle échéance */}
      <Dialog open={deadlineDialogOpen} onClose={() => setDeadlineDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter une échéance fiscale</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre de l'échéance"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select defaultValue="declaration">
                  <MenuItem value="tax">Impôt</MenuItem>
                  <MenuItem value="declaration">Déclaration</MenuItem>
                  <MenuItem value="payment">Paiement</MenuItem>
                  <MenuItem value="report">Rapport</MenuItem>
                  <MenuItem value="other">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Pays</InputLabel>
                <Select defaultValue="">
                  {countries.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{country.flag}</span>
                        {country.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date limite"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Récurrence</InputLabel>
                <Select defaultValue="none">
                  <MenuItem value="none">Aucune</MenuItem>
                  <MenuItem value="monthly">Mensuelle</MenuItem>
                  <MenuItem value="quarterly">Trimestrielle</MenuItem>
                  <MenuItem value="annual">Annuelle</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Montant (FCFA)"
                type="number"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Taux de pénalité (%)"
                type="number"
                defaultValue="10"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Des alertes automatiques seront configurées 30, 15 et 7 jours avant l'échéance.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeadlineDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant="contained">
            Ajouter l'échéance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog calcul pénalités */}
      <Dialog open={penaltyDialogOpen} onClose={() => setPenaltyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Calculateur de pénalités fiscales</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Les pénalités sont calculées selon les règles fiscales en vigueur dans chaque juridiction.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Montant principal (FCFA)"
                type="number"
                defaultValue="1000000"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Jours de retard"
                type="number"
                defaultValue="30"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Taux de pénalité (%)"
                type="number"
                defaultValue="10"
              />
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Calcul détaillé
                </Typography>
                <Typography variant="body2">
                  Pénalité de base: 100 000 (10% du principal)
                </Typography>
                <Typography variant="body2">
                  Pénalité journalière: 3 333
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                  Total pénalités: 200 000
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPenaltyDialogOpen(false)}>
            Fermer
          </Button>
          <Button variant="contained" startIcon={<ExportIcon />}>
            Exporter calcul
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernFiscalCalendar