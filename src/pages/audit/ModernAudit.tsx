/**
 * Module Audit & Contrôle - Sessions d'audit et rapports de corrections
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
  GetApp as ExportIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Balance as BalanceIcon,
  AccountBalance as AccountIcon,
} from '@mui/icons-material'

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
  correctionSuggestions?: CorrectionSuggestion[]
}

interface CorrectionSuggestion {
  id: string
  type: 'journal_entry' | 'account_reclassification' | 'balance_adjustment'
  description: string
  journalEntry?: {
    date: string
    reference: string
    description: string
    lines: {
      account: string
      accountName: string
      debit?: number
      credit?: number
    }[]
  }
  impact: {
    beforeValue: number
    afterValue: number
    difference: number
  }
  confidence: number
  priority: 'high' | 'medium' | 'low'
}

interface CorrectionReport {
  id: string
  generatedDate: string
  auditSession: string
  totalIssues: number
  totalCorrections: number
  totalAmount: number
  issues: AuditResult[]
  summary: {
    critical: number
    major: number
    minor: number
  }
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
      date: '2024-12-15 14:35',
      correctionSuggestions: [
        {
          id: 'corr-001',
          type: 'journal_entry',
          description: 'Écriture de régularisation pour équilibrer le bilan',
          journalEntry: {
            date: '2024-12-15',
            reference: 'OD-2024-001',
            description: 'Régularisation écart actif/passif',
            lines: [
              {
                account: '658000',
                accountName: 'Charges diverses de gestion courante',
                debit: 15000,
                credit: 0
              },
              {
                account: '471000',
                accountName: "Compte d'attente",
                debit: 0,
                credit: 15000
              }
            ]
          },
          impact: {
            beforeValue: -15000,
            afterValue: 0,
            difference: 15000
          },
          confidence: 95,
          priority: 'high'
        }
      ]
    },
    {
      id: '3',
      ruleId: '3',
      ruleName: 'Cohérence TVA',
      status: 'warning',
      message: 'TVA déductible élevée ce mois',
      details: 'Ratio TVA déductible/CA supérieur à la normale',
      date: '2024-12-15 14:38',
      correctionSuggestions: [
        {
          id: 'corr-002',
          type: 'account_reclassification',
          description: 'Vérifier et reclasser certaines opérations TVA',
          impact: {
            beforeValue: 45000,
            afterValue: 42000,
            difference: -3000
          },
          confidence: 78,
          priority: 'medium'
        }
      ]
    }
  ]

  const correctionReport: CorrectionReport = {
    id: 'CORR-2024-001',
    generatedDate: '2024-12-15 15:00',
    auditSession: 'Audit Décembre 2024',
    totalIssues: 2,
    totalCorrections: 3,
    totalAmount: 15000,
    issues: auditResults.filter(r => r.status !== 'passed'),
    summary: {
      critical: 1,
      major: 0,
      minor: 1
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

      {/* Onglets principaux - SEULEMENT 3 onglets */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Sessions d'audit" />
            <Tab label="Rapport de Corrections" />
            <Tab label="Résultats détaillés" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {/* Sessions d'audit */}
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
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
          {/* Rapport de Corrections */}
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  📋 Rapport de Corrections à Effectuer
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Référence: {correctionReport.id} | Généré le {correctionReport.generatedDate}
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button 
                  startIcon={<DownloadIcon />} 
                  variant="contained" 
                  size="small"
                  sx={{ 
                    bgcolor: '#171717',
                    '&:hover': { bgcolor: '#262626' }
                  }}
                >
                  Imprimer Rapport
                </Button>
              </Stack>
            </Box>

            {/* Résumé du rapport */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFEBEE' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#D32F2F' }}>
                    {correctionReport.totalIssues}
                  </Typography>
                  <Typography variant="caption">Problèmes détectés</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#171717' }}>
                    {correctionReport.totalCorrections}
                  </Typography>
                  <Typography variant="caption">Corrections proposées</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#FFF3E0' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#F57C00' }}>
                    {correctionReport.totalAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="caption">Montant total FCFA</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#E8F5E8' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#388E3C' }}>
                    {Math.round(correctionReport.totalCorrections / correctionReport.totalIssues * 100)}%
                  </Typography>
                  <Typography variant="caption">Taux de résolution</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Détail des corrections */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              🔧 Détail des Corrections Proposées
            </Typography>

            {correctionReport.issues.map((issue, index) => (
              <Paper key={issue.id} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  {getStatusIcon(issue.status)}
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {issue.ruleName}
                  </Typography>
                  <Chip
                    label={issue.status === 'failed' ? 'Critique' : 'Avertissement'}
                    size="small"
                    color={issue.status === 'failed' ? 'error' : 'warning'}
                  />
                </Box>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  {issue.message}
                </Typography>
                
                {issue.details && (
                  <Alert severity={issue.status === 'failed' ? 'error' : 'warning'} sx={{ mb: 2 }}>
                    {issue.details}
                    {issue.amount && (
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                        Montant impacté: {issue.amount.toLocaleString()} FCFA
                      </Typography>
                    )}
                  </Alert>
                )}

                {/* Suggestions de correction */}
                {issue.correctionSuggestions && issue.correctionSuggestions.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      💡 Suggestions de Correction:
                    </Typography>
                    
                    {issue.correctionSuggestions.map((suggestion, suggIndex) => (
                      <Paper key={suggestion.id} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {suggestion.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={`Confiance: ${suggestion.confidence}%`} 
                              size="small" 
                              color={suggestion.confidence > 90 ? 'success' : suggestion.confidence > 70 ? 'warning' : 'error'}
                            />
                            <Chip 
                              label={suggestion.priority} 
                              size="small" 
                              color={suggestion.priority === 'high' ? 'error' : suggestion.priority === 'medium' ? 'warning' : 'info'}
                            />
                          </Box>
                        </Box>

                        {suggestion.journalEntry && (
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                              Écriture proposée:
                            </Typography>
                            <TableContainer component={Paper} elevation={0} sx={{ maxHeight: 200 }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Compte</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Débit</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Crédit</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {suggestion.journalEntry.lines.map((line, lineIndex) => (
                                    <TableRow key={lineIndex}>
                                      <TableCell sx={{ fontFamily: 'monospace' }}>{line.account}</TableCell>
                                      <TableCell>{line.accountName}</TableCell>
                                      <TableCell align="right">
                                        {line.debit ? line.debit.toLocaleString() : '-'}
                                      </TableCell>
                                      <TableCell align="right">
                                        {line.credit ? line.credit.toLocaleString() : '-'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Impact: {suggestion.impact.beforeValue.toLocaleString()} → {suggestion.impact.afterValue.toLocaleString()} FCFA
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Button size="small" variant="outlined">
                              Appliquer
                            </Button>
                            <Button size="small" variant="text">
                              Ignorer
                            </Button>
                          </Stack>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            ))}
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
                            <Typography variant="body2" component="div" sx={{ mb: 1 }}>
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
                            <Typography variant="caption" color="text.secondary" component="div" sx={{ display: 'block', mt: 1 }}>
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