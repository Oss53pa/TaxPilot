/**
 * Module Télédéclaration Professionnel - Transmission électronique SYSCOHADA
 * Interface moderne pour dépôt et suivi des déclarations fiscales
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  useTheme,
  alpha,
  Divider,
  Stack,
  Avatar,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Security as SecurityIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  AccountBalance as TaxIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as MoneyIcon,
  Assignment as AssignmentIcon,
  CloudDone as CloudDoneIcon,
  Sync as SyncIcon,
  VerifiedUser as CertificateIcon,
} from '@mui/icons-material'

interface Declaration {
  id: string
  type: string
  period: string
  company: string
  status: 'draft' | 'ready' | 'submitted' | 'accepted' | 'rejected'
  dueDate: string
  submittedDate?: string
  amount?: number
  reference?: string
  attachments: string[]
}

interface TransmissionStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  description: string
  timestamp?: string
  details?: string
}

interface GovernmentService {
  id: string
  name: string
  code: string
  status: 'online' | 'offline' | 'maintenance'
  lastCheck: string
  responseTime: number
}

const ModernTeledeclaration: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedDeclaration, setSelectedDeclaration] = useState<string>('')
  const [transmissionDialog, setTransmissionDialog] = useState(false)
  const [certificateDialog, setCertificateDialog] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const declarations: Declaration[] = [
    {
      id: '1',
      type: 'TVA Mensuelle',
      period: 'Décembre 2024',
      company: 'SARL TECH SOLUTIONS',
      status: 'submitted',
      dueDate: '2025-01-15',
      submittedDate: '2025-01-10',
      amount: 250000,
      reference: 'TVA202412001',
      attachments: ['balance_dec_2024.pdf', 'journal_ventes.xlsx']
    },
    {
      id: '2',
      type: 'Impôt sur les Sociétés',
      period: 'Exercice 2024',
      company: 'SA COMMERCE PLUS',
      status: 'ready',
      dueDate: '2025-04-30',
      amount: 1200000,
      attachments: ['liasse_fiscale_2024.pdf', 'bilan_2024.xlsx']
    },
    {
      id: '3',
      type: 'Déclaration Sociale',
      period: 'Q4 2024',
      company: 'SARL TECH SOLUTIONS',
      status: 'draft',
      dueDate: '2025-01-31',
      attachments: []
    },
    {
      id: '4',
      type: 'TVA Trimestrielle',
      period: 'Q4 2024',
      company: 'SA COMMERCE PLUS',
      status: 'accepted',
      dueDate: '2025-01-20',
      submittedDate: '2025-01-15',
      amount: 450000,
      reference: 'TVA202404Q4',
      attachments: ['synthese_q4.pdf']
    }
  ]

  const governmentServices: GovernmentService[] = [
    {
      id: '1',
      name: 'Direction Générale des Impôts',
      code: 'DGI',
      status: 'online',
      lastCheck: '2024-12-16 14:30',
      responseTime: 1.2
    },
    {
      id: '2',
      name: 'Caisse Nationale de Sécurité Sociale',
      code: 'CNSS',
      status: 'online',
      lastCheck: '2024-12-16 14:25',
      responseTime: 2.1
    },
    {
      id: '3',
      name: 'Direction des Douanes',
      code: 'DOUANES',
      status: 'maintenance',
      lastCheck: '2024-12-16 12:00',
      responseTime: 0
    }
  ]

  const transmissionSteps: TransmissionStep[] = [
    {
      id: '1',
      name: 'Validation des données',
      status: 'completed',
      description: 'Vérification de la cohérence des données',
      timestamp: '2024-12-16 14:20'
    },
    {
      id: '2',
      name: 'Chiffrement des fichiers',
      status: 'completed',
      description: 'Sécurisation des données sensibles',
      timestamp: '2024-12-16 14:21'
    },
    {
      id: '3',
      name: 'Transmission au service',
      status: 'running',
      description: 'Envoi vers la DGI',
      details: 'Progression: 67%'
    },
    {
      id: '4',
      name: 'Accusé de réception',
      status: 'pending',
      description: 'Attente de confirmation'
    },
    {
      id: '5',
      name: 'Archivage sécurisé',
      status: 'pending',
      description: 'Sauvegarde des preuves de dépôt'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return theme.palette.success.main
      case 'submitted': return theme.palette.info.main
      case 'ready': return theme.palette.warning.main
      case 'rejected': return theme.palette.error.main
      case 'draft': return theme.palette.grey[500]
      default: return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckIcon />
      case 'submitted': return <CloudDoneIcon />
      case 'ready': return <UploadIcon />
      case 'rejected': return <ErrorIcon />
      case 'draft': return <AssignmentIcon />
      default: return <AssignmentIcon />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'accepted': return 'Acceptée'
      case 'submitted': return 'Transmise'
      case 'ready': return 'Prête'
      case 'rejected': return 'Rejetée'
      case 'draft': return 'Brouillon'
      default: return status
    }
  }

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'online': return theme.palette.success.main
      case 'offline': return theme.palette.error.main
      case 'maintenance': return theme.palette.warning.main
      default: return theme.palette.grey[500]
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return theme.palette.success.main
      case 'running': return theme.palette.warning.main
      case 'error': return theme.palette.error.main
      case 'pending': return theme.palette.grey[400]
      default: return theme.palette.grey[400]
    }
  }

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckIcon />
      case 'running': return <SyncIcon />
      case 'error': return <ErrorIcon />
      case 'pending': return <ScheduleIcon />
      default: return <ScheduleIcon />
    }
  }

  const handleTransmit = () => {
    setTransmissionDialog(true)
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
              Télédéclarations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Transmission électronique et suivi des déclarations fiscales
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CertificateIcon />}
              onClick={() => setCertificateDialog(true)}
            >
              Certificats
            </Button>
            <Button
              variant="contained"
              startIcon={<SendIcon />}
              onClick={handleTransmit}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Transmettre
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.success.main }}>
                      12
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Déclarations transmises
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                    }}
                  >
                    <CloudDoneIcon />
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
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.warning.main }}>
                      3
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      En attente de transmission
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                    }}
                  >
                    <ScheduleIcon />
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
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                      98%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taux d'acceptation
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <CheckIcon />
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
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.info.main }}>
                      2.3M
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total transmis (FCFA)
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  >
                    <MoneyIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Liste des déclarations */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Toutes les déclarations" />
                <Tab label="En attente" />
                <Tab label="Transmises" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Période</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Entreprise</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Échéance</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <TableRow key={index}>
                          {Array.from({ length: 7 }).map((_, cellIndex) => (
                            <TableCell key={cellIndex}>
                              <Skeleton variant="text" height={20} />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      declarations.map((declaration) => (
                        <TableRow key={declaration.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 24,
                                  height: 24,
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  '& .MuiSvgIcon-root': { fontSize: '0.875rem' }
                                }}
                              >
                                <TaxIcon />
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {declaration.type}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {declaration.period}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {declaration.company}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(declaration.status)}
                              size="small"
                              sx={{
                                backgroundColor: alpha(getStatusColor(declaration.status), 0.1),
                                color: getStatusColor(declaration.status),
                                fontWeight: 600,
                              }}
                              icon={getStatusIcon(declaration.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Typography variant="body2">
                                {declaration.dueDate}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {declaration.amount ? 
                                `${declaration.amount.toLocaleString()}` : 
                                '-'
                              }
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Voir détails">
                                <IconButton size="small">
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {declaration.status === 'ready' && (
                                <Tooltip title="Transmettre">
                                  <IconButton size="small" color="primary">
                                    <SendIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {declaration.reference && (
                                <Tooltip title="Télécharger accusé">
                                  <IconButton size="small">
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {declarations.filter(d => d.status === 'ready' || d.status === 'draft').length === 0 
                    ? 'Aucune déclaration en attente'
                    : `${declarations.filter(d => d.status === 'ready' || d.status === 'draft').length} déclaration(s) en attente`
                  }
                </Typography>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <CardContent>
                <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {declarations.filter(d => d.status === 'submitted' || d.status === 'accepted').length} déclaration(s) transmise(s)
                </Typography>
              </CardContent>
            </TabPanel>
          </Card>
        </Grid>

        {/* État des services et suivi */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* État des services gouvernementaux */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Services gouvernementaux
                  </Typography>
                  <IconButton size="small">
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>

                <List disablePadding>
                  {governmentServices.map((service, index) => (
                    <React.Fragment key={service.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: alpha(getServiceStatusColor(service.status), 0.1),
                              color: getServiceStatusColor(service.status),
                            }}
                          >
                            <SecurityIcon fontSize="small" />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {service.name}
                              </Typography>
                              <Chip
                                label={
                                  service.status === 'online' ? 'En ligne' :
                                  service.status === 'offline' ? 'Hors ligne' : 'Maintenance'
                                }
                                size="small"
                                sx={{
                                  backgroundColor: alpha(getServiceStatusColor(service.status), 0.1),
                                  color: getServiceStatusColor(service.status),
                                  height: 20,
                                  fontSize: '0.75rem'
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {service.code} • Dernière vérif: {service.lastCheck}
                              </Typography>
                              {service.status === 'online' && (
                                <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                                  Temps de réponse: {service.responseTime}s
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < governmentServices.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Suivi de transmission */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Transmission en cours
                </Typography>

                <List disablePadding>
                  {transmissionSteps.map((step, index) => (
                    <ListItem key={step.id} sx={{ px: 0, py: 1, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            backgroundColor: alpha(getStepStatusColor(step.status), 0.1),
                            color: getStepStatusColor(step.status),
                          }}
                        >
                          {getStepStatusIcon(step.status)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {step.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              {step.description}
                            </Typography>
                            {step.details && (
                              <Typography variant="caption" color="primary.main" sx={{ display: 'block' }}>
                                {step.details}
                              </Typography>
                            )}
                            {step.timestamp && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {step.timestamp}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                {transmissionSteps.some(step => step.status === 'running') && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.divider, 0.1),
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Transmission en cours...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialog transmission */}
      <Dialog open={transmissionDialog} onClose={() => setTransmissionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transmettre une déclaration</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Déclaration à transmettre</InputLabel>
                <Select
                  value={selectedDeclaration}
                  label="Déclaration à transmettre"
                  onChange={(e) => setSelectedDeclaration(e.target.value)}
                >
                  {declarations.filter(d => d.status === 'ready').map((declaration) => (
                    <MenuItem key={declaration.id} value={declaration.id}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {declaration.type} - {declaration.period}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {declaration.company}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                <AlertTitle>Information importante</AlertTitle>
                La transmission sera effectuée de manière sécurisée avec chiffrement des données.
                Vous recevrez un accusé de réception automatiquement.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <FormGroup>
                <FormControlLabel
                  control={<Checkbox defaultChecked />}
                  label="J'accepte les conditions de transmission électronique"
                />
                <FormControlLabel
                  control={<Checkbox />}
                  label="Archiver automatiquement après transmission"
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransmissionDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SendIcon />}
            disabled={!selectedDeclaration}
          >
            Transmettre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog certificats */}
      <Dialog open={certificateDialog} onClose={() => setCertificateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Gestion des certificats</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>Certificat valide</AlertTitle>
            Votre certificat de signature électronique est valide jusqu'au 15/12/2025.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Le certificat permet de signer électroniquement vos déclarations et garantit leur authenticité.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCertificateDialog(false)}>
            Fermer
          </Button>
          <Button variant="outlined">
            Renouveler
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernTeledeclaration