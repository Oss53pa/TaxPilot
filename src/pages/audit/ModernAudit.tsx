/**
 * Module Audit Professionnel - Contrôle et validation SYSCOHADA
 * Interface moderne pour audit comptable et fiscal
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  AlertTitle,
  Skeleton,
  useTheme,
  alpha,
  Divider,
  Stack,
} from '@mui/material'
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Balance as BalanceIcon,
  AccountBalance as AccountIcon,
} from '@mui/icons-material'

interface AuditRule {
  id: string
  code: string
  title: string
  description: string
  category: 'balance' | 'legal' | 'fiscal' | 'coherence'
  severity: 'critical' | 'major' | 'minor' | 'info'
  status: 'active' | 'inactive'
}

interface AuditResult {
  id: string
  ruleId: string
  ruleName: string
  status: 'passed' | 'failed' | 'warning' | 'info'
  message: string
  details?: string
  affectedAccounts?: string[]
  amount?: number
  date: string
}

interface AuditSession {
  id: string
  name: string
  date: string
  status: 'running' | 'completed' | 'failed'
  progress: number
  totalRules: number
  passedRules: number
  failedRules: number
  warningRules: number
}

const ModernAudit: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedSession, setSelectedSession] = useState<string>('')
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)
  const [newAuditName, setNewAuditName] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const auditRules: AuditRule[] = [
    {
      id: '1',
      code: 'BAL001',
      title: 'Équilibre débit/crédit',
      description: 'Vérifier que le total des débits égale le total des crédits',
      category: 'balance',
      severity: 'critical',
      status: 'active'
    },
    {
      id: '2',
      code: 'LEG001',
      title: 'Plan comptable SYSCOHADA',
      description: 'Conformité des comptes avec le plan SYSCOHADA',
      category: 'legal',
      severity: 'major',
      status: 'active'
    },
    {
      id: '3',
      code: 'FIS001',
      title: 'Cohérence TVA',
      description: 'Vérifier la cohérence entre TVA collectée et déductible',
      category: 'fiscal',
      severity: 'major',
      status: 'active'
    },
    {
      id: '4',
      code: 'COH001',
      title: 'Cohérence actif/passif',
      description: 'Vérifier la cohérence entre actif et passif du bilan',
      category: 'coherence',
      severity: 'critical',
      status: 'active'
    },
    {
      id: '5',
      code: 'BAL002',
      title: 'Soldes débiteurs/créditeurs',
      description: 'Vérifier que les comptes ont le bon signe selon leur nature',
      category: 'balance',
      severity: 'major',
      status: 'active'
    }
  ]

  const auditSessions: AuditSession[] = [
    {
      id: '1',
      name: 'Audit Décembre 2024',
      date: '2024-12-15 14:30',
      status: 'completed',
      progress: 100,
      totalRules: 5,
      passedRules: 4,
      failedRules: 1,
      warningRules: 0
    },
    {
      id: '2',
      name: 'Contrôle TVA Q4',
      date: '2024-12-10 09:15',
      status: 'completed',
      progress: 100,
      totalRules: 3,
      passedRules: 2,
      failedRules: 0,
      warningRules: 1
    },
    {
      id: '3',
      name: 'Audit en cours',
      date: '2024-12-16 16:45',
      status: 'running',
      progress: 65,
      totalRules: 5,
      passedRules: 2,
      failedRules: 1,
      warningRules: 0
    }
  ]

  const auditResults: AuditResult[] = [
    {
      id: '1',
      ruleId: '1',
      ruleName: 'Équilibre débit/crédit',
      status: 'passed',
      message: 'Balance équilibrée',
      date: '2024-12-15 14:32'
    },
    {
      id: '2',
      ruleId: '4',
      ruleName: 'Cohérence actif/passif',
      status: 'failed',
      message: 'Écart détecté entre actif et passif',
      details: 'Différence de 15 000 FCFA détectée',
      amount: 15000,
      affectedAccounts: ['101000', '401000'],
      date: '2024-12-15 14:35'
    },
    {
      id: '3',
      ruleId: '3',
      ruleName: 'Cohérence TVA',
      status: 'warning',
      message: 'TVA déductible élevée ce mois',
      details: 'Ratio TVA déductible/CA supérieur à la normale',
      date: '2024-12-15 14:38'
    }
  ]

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'balance': return <BalanceIcon />
      case 'legal': return <SecurityIcon />
      case 'fiscal': return <AccountIcon />
      case 'coherence': return <AssessmentIcon />
      default: return <CheckIcon />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'balance': return theme.palette.primary.main
      case 'legal': return theme.palette.success.main
      case 'fiscal': return theme.palette.warning.main
      case 'coherence': return theme.palette.info.main
      default: return theme.palette.grey[500]
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return theme.palette.error.main
      case 'major': return theme.palette.warning.main
      case 'minor': return theme.palette.info.main
      case 'info': return theme.palette.grey[500]
      default: return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckIcon color="success" />
      case 'failed': return <ErrorIcon color="error" />
      case 'warning': return <WarningIcon color="warning" />
      case 'info': return <SecurityIcon color="info" />
      default: return <SecurityIcon />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return theme.palette.success.main
      case 'failed': return theme.palette.error.main
      case 'warning': return theme.palette.warning.main
      case 'info': return theme.palette.info.main
      default: return theme.palette.grey[500]
    }
  }

  const handleNewAudit = () => {
    if (newAuditName.trim()) {
      // Simuler le démarrage d'un nouvel audit
      console.log('Démarrage audit:', newAuditName)
      setAuditDialogOpen(false)
      setNewAuditName('')
    }
  }

  const TabPanel: React.FC<{ children: React.ReactNode; value: number; index: number }> = ({
    children,
    value,
    index,
  }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  )

  return (
    <Box sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Audit & Contrôles
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Validation comptable et fiscale SYSCOHADA
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
            >
              Rapport
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAuditDialogOpen(true)}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Nouvel Audit
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Métriques de synthèse */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        mr: 2,
                      }}
                    >
                      <CheckIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                        87%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Contrôles réussis
                      </Typography>
                    </Box>
                  </Box>
                </>
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
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        mr: 2,
                      }}
                    >
                      <ErrorIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                        3
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Erreurs critiques
                      </Typography>
                    </Box>
                  </Box>
                </>
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
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main,
                        mr: 2,
                      }}
                    >
                      <WarningIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                        12
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avertissements
                      </Typography>
                    </Box>
                  </Box>
                </>
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
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mr: 2,
                      }}
                    >
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                        96%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Score de qualité
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Onglets principaux */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Sessions d'audit" />
            <Tab label="Règles de contrôle" />
            <Tab label="Résultats détaillés" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {/* Sessions d'audit */}
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Historique des audits
              </Typography>
            </Box>

            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={8} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={16} width="60%" />
                </Box>
              ))
            ) : (
              <List>
                {auditSessions.map((session, index) => (
                  <React.Fragment key={session.id}>
                    <ListItem sx={{ py: 3, px: 0 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            backgroundColor: alpha(
                              session.status === 'completed' ? theme.palette.success.main :
                              session.status === 'running' ? theme.palette.warning.main :
                              theme.palette.error.main,
                              0.1
                            ),
                            color: session.status === 'completed' ? theme.palette.success.main :
                                   session.status === 'running' ? theme.palette.warning.main :
                                   theme.palette.error.main,
                          }}
                        >
                          {session.status === 'completed' ? <CheckIcon /> :
                           session.status === 'running' ? <SecurityIcon /> :
                           <ErrorIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {session.name}
                            </Typography>
                            <Chip
                              label={
                                session.status === 'completed' ? 'Terminé' :
                                session.status === 'running' ? 'En cours' : 'Échoué'
                              }
                              size="small"
                              sx={{
                                backgroundColor: alpha(
                                  session.status === 'completed' ? theme.palette.success.main :
                                  session.status === 'running' ? theme.palette.warning.main :
                                  theme.palette.error.main,
                                  0.1
                                ),
                                color: session.status === 'completed' ? theme.palette.success.main :
                                       session.status === 'running' ? theme.palette.warning.main :
                                       theme.palette.error.main,
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                              {session.date}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Progression: {session.progress}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={session.progress}
                                sx={{ 
                                  flexGrow: 1, 
                                  height: 6, 
                                  borderRadius: 3,
                                  backgroundColor: alpha(theme.palette.divider, 0.1),
                                }}
                              />
                            </Box>
                            <Stack direction="row" spacing={2}>
                              <Typography variant="caption" color="success.main">
                                ✓ {session.passedRules} réussis
                              </Typography>
                              <Typography variant="caption" color="error.main">
                                ✗ {session.failedRules} échoués
                              </Typography>
                              <Typography variant="caption" color="warning.main">
                                ⚠ {session.warningRules} avertissements
                              </Typography>
                            </Stack>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton>
                          <ViewIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < auditSessions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {/* Règles de contrôle */}
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Règles de contrôle SYSCOHADA
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button startIcon={<FilterIcon />} variant="outlined" size="small">
                  Filtrer
                </Button>
                <Button startIcon={<AddIcon />} variant="contained" size="small">
                  Nouvelle règle
                </Button>
              </Stack>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Règle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Criticité</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        {Array.from({ length: 6 }).map((_, cellIndex) => (
                          <TableCell key={cellIndex}>
                            <Skeleton variant="text" height={20} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    auditRules.map((rule) => (
                      <TableRow key={rule.id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                            {rule.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {rule.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {rule.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                backgroundColor: alpha(getCategoryColor(rule.category), 0.1),
                                color: getCategoryColor(rule.category),
                                '& .MuiSvgIcon-root': { fontSize: '0.875rem' }
                              }}
                            >
                              {getCategoryIcon(rule.category)}
                            </Avatar>
                            <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                              {rule.category === 'balance' ? 'Balance' :
                               rule.category === 'legal' ? 'Légal' :
                               rule.category === 'fiscal' ? 'Fiscal' : 'Cohérence'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              rule.severity === 'critical' ? 'Critique' :
                              rule.severity === 'major' ? 'Majeure' :
                              rule.severity === 'minor' ? 'Mineure' : 'Info'
                            }
                            size="small"
                            sx={{
                              backgroundColor: alpha(getSeverityColor(rule.severity), 0.1),
                              color: getSeverityColor(rule.severity),
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={rule.status === 'active' ? 'Actif' : 'Inactif'}
                            size="small"
                            color={rule.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small">
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {/* Résultats détaillés */}
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Résultats du dernier audit
            </Typography>

            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} />
                </Box>
              ))
            ) : (
              <List>
                {auditResults.map((result, index) => (
                  <React.Fragment key={result.id}>
                    <ListItem sx={{ py: 2, px: 0, alignItems: 'flex-start' }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            backgroundColor: alpha(getStatusColor(result.status), 0.1),
                            color: getStatusColor(result.status),
                          }}
                        >
                          {getStatusIcon(result.status)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {result.ruleName}
                            </Typography>
                            <Chip
                              label={
                                result.status === 'passed' ? 'Réussi' :
                                result.status === 'failed' ? 'Échoué' :
                                result.status === 'warning' ? 'Avertissement' : 'Info'
                              }
                              size="small"
                              sx={{
                                backgroundColor: alpha(getStatusColor(result.status), 0.1),
                                color: getStatusColor(result.status),
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {result.message}
                            </Typography>
                            {result.details && (
                              <Alert 
                                severity={result.status === 'failed' ? 'error' : 'warning'} 
                                sx={{ mb: 1 }}
                              >
                                {result.details}
                                {result.amount && (
                                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                                    Montant: {result.amount.toLocaleString()} FCFA
                                  </Typography>
                                )}
                              </Alert>
                            )}
                            {result.affectedAccounts && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                  Comptes concernés:
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                  {result.affectedAccounts.map((account) => (
                                    <Chip
                                      key={account}
                                      label={account}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                              {result.date}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < auditResults.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </CardContent>
        </TabPanel>
      </Card>

      {/* Dialog nouveau audit */}
      <Dialog open={auditDialogOpen} onClose={() => setAuditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer un nouvel audit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de l'audit"
            fullWidth
            variant="outlined"
            value={newAuditName}
            onChange={(e) => setNewAuditName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type d'audit</InputLabel>
            <Select
              value=""
              label="Type d'audit"
            >
              <MenuItem value="complete">Audit complet</MenuItem>
              <MenuItem value="balance">Contrôle balance</MenuItem>
              <MenuItem value="fiscal">Audit fiscal</MenuItem>
              <MenuItem value="legal">Conformité légale</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleNewAudit} variant="contained">
            Lancer l'audit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernAudit