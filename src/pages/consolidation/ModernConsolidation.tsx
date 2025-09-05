/**
 * Module de Consolidation - Gestion des comptes consolidés SYSCOHADA
 * Conforme aux exigences EX-CONSO-001 à EX-CONSO-010
 */

import React, { useState, useEffect } from 'react'
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
  Tabs,
  Tab,
  Paper,
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
  Alert,
  AlertTitle,
  LinearProgress,
  Divider,
  Stack,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  useTheme,
  alpha,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import {
  Business as BusinessIcon,
  AccountTree as TreeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sync as SyncIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Euro as EuroIcon,
  AttachMoney as DollarIcon,
  CurrencyExchange as ExchangeIcon,
  Balance as BalanceIcon,
  Calculate as CalculateIcon,
  AutoGraph as GraphIcon,
  TableChart as TableIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  RemoveCircle as EliminationIcon,
  Percent as PercentIcon,
} from '@mui/icons-material'

interface Entity {
  id: string
  name: string
  country: string
  currency: string
  type: 'parent' | 'subsidiary' | 'associate'
  controlPercentage: number
  interestPercentage: number
  consolidationMethod: 'full' | 'proportional' | 'equity'
  status: 'active' | 'inactive'
  revenue?: number
  assets?: number
  lastUpdate: string
}

interface ConsolidationPerimeter {
  id: string
  name: string
  exercice: string
  entities: string[]
  status: 'draft' | 'validated' | 'locked'
  createdAt: string
  validatedAt?: string
}

interface IntraGroupOperation {
  id: string
  type: 'sale' | 'purchase' | 'loan' | 'dividend' | 'service'
  fromEntity: string
  toEntity: string
  amount: number
  currency: string
  description: string
  eliminated: boolean
  eliminationAmount?: number
  date: string
}

interface CurrencyConversion {
  currency: string
  rateType: 'closing' | 'average' | 'historical'
  rate: number
  date: string
}

interface ConsolidationAdjustment {
  id: string
  type: 'goodwill' | 'fair_value' | 'deferred_tax' | 'minority_interest' | 'other'
  description: string
  amount: number
  account: string
  entity: string
  validated: boolean
}

const ModernConsolidation: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedPerimeter, setSelectedPerimeter] = useState<string>('')
  const [consolidationStep, setConsolidationStep] = useState(0)
  const [perimeterDialogOpen, setPerimeterDialogOpen] = useState(false)
  const [eliminationDialogOpen, setEliminationDialogOpen] = useState(false)
  const [expanded, setExpanded] = useState<string[]>(['root'])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // Données conformes EX-CONSO-001 : Périmètres dynamiques
  const entities: Entity[] = [
    {
      id: '1',
      name: 'Holding SA',
      country: 'Côte d\'Ivoire',
      currency: 'XOF',
      type: 'parent',
      controlPercentage: 100,
      interestPercentage: 100,
      consolidationMethod: 'full',
      status: 'active',
      revenue: 5000000000,
      assets: 12000000000,
      lastUpdate: '2024-12-15'
    },
    {
      id: '2',
      name: 'Filiale Commerce SARL',
      country: 'Sénégal',
      currency: 'XOF',
      type: 'subsidiary',
      controlPercentage: 80,
      interestPercentage: 80,
      consolidationMethod: 'full',
      status: 'active',
      revenue: 2000000000,
      assets: 4500000000,
      lastUpdate: '2024-12-14'
    },
    {
      id: '3',
      name: 'Filiale Services SA',
      country: 'Burkina Faso',
      currency: 'XOF',
      type: 'subsidiary',
      controlPercentage: 60,
      interestPercentage: 60,
      consolidationMethod: 'full',
      status: 'active',
      revenue: 1500000000,
      assets: 3000000000,
      lastUpdate: '2024-12-13'
    },
    {
      id: '4',
      name: 'Société Associée Tech',
      country: 'Mali',
      currency: 'XOF',
      type: 'associate',
      controlPercentage: 35,
      interestPercentage: 35,
      consolidationMethod: 'equity',
      status: 'active',
      revenue: 800000000,
      assets: 1800000000,
      lastUpdate: '2024-12-12'
    },
    {
      id: '5',
      name: 'Filiale Europe',
      country: 'France',
      currency: 'EUR',
      type: 'subsidiary',
      controlPercentage: 100,
      interestPercentage: 100,
      consolidationMethod: 'full',
      status: 'active',
      revenue: 3000000,
      assets: 7000000,
      lastUpdate: '2024-12-10'
    }
  ]

  const perimeters: ConsolidationPerimeter[] = [
    {
      id: '1',
      name: 'Périmètre Groupe Complet 2024',
      exercice: '2024',
      entities: ['1', '2', '3', '4', '5'],
      status: 'validated',
      createdAt: '2024-01-01',
      validatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Périmètre Zone UEMOA',
      exercice: '2024',
      entities: ['1', '2', '3', '4'],
      status: 'draft',
      createdAt: '2024-12-01'
    }
  ]

  // EX-CONSO-002 : Opérations intra-groupe à éliminer
  const intraGroupOperations: IntraGroupOperation[] = [
    {
      id: '1',
      type: 'sale',
      fromEntity: '1',
      toEntity: '2',
      amount: 150000000,
      currency: 'XOF',
      description: 'Vente de marchandises',
      eliminated: false,
      date: '2024-11-15'
    },
    {
      id: '2',
      type: 'dividend',
      fromEntity: '2',
      toEntity: '1',
      amount: 50000000,
      currency: 'XOF',
      description: 'Dividendes versés',
      eliminated: true,
      eliminationAmount: 40000000,
      date: '2024-06-30'
    },
    {
      id: '3',
      type: 'loan',
      fromEntity: '1',
      toEntity: '3',
      amount: 200000000,
      currency: 'XOF',
      description: 'Prêt inter-sociétés',
      eliminated: false,
      date: '2024-03-01'
    },
    {
      id: '4',
      type: 'service',
      fromEntity: '3',
      toEntity: '2',
      amount: 25000000,
      currency: 'XOF',
      description: 'Prestations de services',
      eliminated: false,
      date: '2024-09-15'
    }
  ]

  // EX-CONSO-003 : Taux de conversion multi-devises
  const currencyConversions: CurrencyConversion[] = [
    { currency: 'EUR', rateType: 'closing', rate: 655.957, date: '2024-12-31' },
    { currency: 'EUR', rateType: 'average', rate: 655.500, date: '2024-12-31' },
    { currency: 'USD', rateType: 'closing', rate: 605.123, date: '2024-12-31' },
    { currency: 'USD', rateType: 'average', rate: 601.450, date: '2024-12-31' }
  ]

  // EX-CONSO-004 : Ajustements de consolidation
  const consolidationAdjustments: ConsolidationAdjustment[] = [
    {
      id: '1',
      type: 'goodwill',
      description: 'Écart d\'acquisition Filiale Commerce',
      amount: 120000000,
      account: '207',
      entity: '2',
      validated: true
    },
    {
      id: '2',
      type: 'fair_value',
      description: 'Ajustement juste valeur immobilier',
      amount: 80000000,
      account: '231',
      entity: '3',
      validated: false
    },
    {
      id: '3',
      type: 'minority_interest',
      description: 'Intérêts minoritaires Filiale Services',
      amount: 1200000000,
      account: '104',
      entity: '3',
      validated: true
    }
  ]

  const consolidationSteps = [
    'Définition du périmètre',
    'Conversion des devises',
    'Éliminations intra-groupe',
    'Ajustements de consolidation',
    'Génération des états consolidés'
  ]

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'full': return 'Intégration globale'
      case 'proportional': return 'Intégration proportionnelle'
      case 'equity': return 'Mise en équivalence'
      default: return method
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'full': return theme.palette.success.main
      case 'proportional': return theme.palette.warning.main
      case 'equity': return theme.palette.info.main
      default: return theme.palette.grey[500]
    }
  }

  const handleNodeToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpanded(nodeIds)
  }

  const renderEntityTree = (entity: Entity, level: number = 0, visitedIds: Set<string> = new Set()) => {
    // Prevent infinite recursion by checking if we've already visited this entity
    if (visitedIds.has(entity.id) || level > 3) {
      return null;
    }
    
    const newVisitedIds = new Set(visitedIds);
    newVisitedIds.add(entity.id);
    
    return (
      <TreeItem
        key={entity.id}
        nodeId={entity.id}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                backgroundColor: alpha(
                  entity.type === 'parent' ? theme.palette.primary.main :
                  entity.type === 'subsidiary' ? theme.palette.success.main :
                  theme.palette.info.main,
                  0.1
                ),
                color: entity.type === 'parent' ? theme.palette.primary.main :
                       entity.type === 'subsidiary' ? theme.palette.success.main :
                       theme.palette.info.main,
              }}
            >
              <BusinessIcon fontSize="small" />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {entity.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {entity.country} • {entity.currency}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip
                label={`${entity.controlPercentage}%`}
                size="small"
                icon={<PercentIcon />}
                sx={{ height: 24 }}
              />
              <Chip
                label={getMethodLabel(entity.consolidationMethod)}
                size="small"
                sx={{
                  backgroundColor: alpha(getMethodColor(entity.consolidationMethod), 0.1),
                  color: getMethodColor(entity.consolidationMethod),
                  height: 24,
                }}
              />
            </Stack>
          </Box>
        }
      >
        {entity.type === 'parent' && level < 2 &&
          entities
            .filter(e => e.type === 'subsidiary' && e.controlPercentage > 50 && !newVisitedIds.has(e.id))
            .map(e => renderEntityTree(e, level + 1, newVisitedIds))
        }
      </TreeItem>
    );
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
              Consolidation
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestion des comptes consolidés et éliminations intra-groupe SYSCOHADA
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
            >
              Importer données
            </Button>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
            >
              Paramètres
            </Button>
            <Button
              variant="contained"
              startIcon={<SyncIcon />}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Lancer consolidation
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.primary.main }}>
                      {entities.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Entités du groupe
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                    }}
                  >
                    <GroupIcon />
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
                      425M
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Éliminations (FCFA)
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.warning.main, 0.1),
                      color: theme.palette.warning.main,
                    }}
                  >
                    <EliminationIcon />
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
                      120M
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Goodwill total
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                    }}
                  >
                    <TrendingUpIcon />
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
                      27.3Mds
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total actifs consolidés
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  >
                    <AssessmentIcon />
                  </Avatar>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Périmètre de consolidation" />
                <Tab label="Éliminations" />
                <Tab label="Ajustements" />
                <Tab label="États consolidés" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              {/* EX-CONSO-001 : Gestion des périmètres dynamiques */}
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Structure du groupe
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setPerimeterDialogOpen(true)}
                  >
                    Nouveau périmètre
                  </Button>
                </Box>

                <SimpleTreeView
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpandIcon={<ChevronRightIcon />}
                  expanded={expanded}
                  onNodeToggle={handleNodeToggle}
                  sx={{ mb: 3 }}
                >
                  {entities
                    .filter(e => e.type === 'parent')
                    .map(e => renderEntityTree(e))
                  }
                </SimpleTreeView>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Périmètres définis
                </Typography>

                <List>
                  {perimeters.map((perimeter) => (
                    <ListItem key={perimeter.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            backgroundColor: alpha(
                              perimeter.status === 'validated' ? theme.palette.success.main :
                              perimeter.status === 'locked' ? theme.palette.error.main :
                              theme.palette.warning.main,
                              0.1
                            ),
                            color: perimeter.status === 'validated' ? theme.palette.success.main :
                                   perimeter.status === 'locked' ? theme.palette.error.main :
                                   theme.palette.warning.main,
                          }}
                        >
                          <TreeIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={perimeter.name}
                        secondary={`${perimeter.entities.length} entités • Exercice ${perimeter.exercice}`}
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={
                              perimeter.status === 'validated' ? 'Validé' :
                              perimeter.status === 'locked' ? 'Verrouillé' : 'Brouillon'
                            }
                            size="small"
                            color={perimeter.status === 'validated' ? 'success' : 'default'}
                          />
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {/* EX-CONSO-002 : Éliminations intra-groupe */}
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Opérations intra-groupe
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EliminationIcon />}
                    onClick={() => setEliminationDialogOpen(true)}
                  >
                    Éliminer automatiquement
                  </Button>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Éliminations automatiques détectées</AlertTitle>
                  {intraGroupOperations.filter(op => !op.eliminated).length} opérations à éliminer pour un montant total de{' '}
                  {intraGroupOperations
                    .filter(op => !op.eliminated)
                    .reduce((sum, op) => sum + op.amount, 0)
                    .toLocaleString()} FCFA
                </Alert>

                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>De</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Vers</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Montant</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {intraGroupOperations.map((operation) => (
                        <TableRow key={operation.id}>
                          <TableCell>
                            <Chip
                              label={
                                operation.type === 'sale' ? 'Vente' :
                                operation.type === 'purchase' ? 'Achat' :
                                operation.type === 'loan' ? 'Prêt' :
                                operation.type === 'dividend' ? 'Dividende' : 'Service'
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {entities.find(e => e.id === operation.fromEntity)?.name}
                          </TableCell>
                          <TableCell>
                            {entities.find(e => e.id === operation.toEntity)?.name}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {operation.amount.toLocaleString()} {operation.currency}
                            </Typography>
                            {operation.eliminationAmount && (
                              <Typography variant="caption" color="error.main">
                                Éliminé: {operation.eliminationAmount.toLocaleString()}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {operation.eliminated ? (
                              <Chip
                                label="Éliminé"
                                size="small"
                                color="success"
                                icon={<CheckIcon />}
                              />
                            ) : (
                              <Chip
                                label="En attente"
                                size="small"
                                color="warning"
                                icon={<WarningIcon />}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* EX-CONSO-007 : Traçabilité des éliminations */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.02), borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Journal des éliminations
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Toutes les éliminations sont tracées et réversibles jusqu'à la validation finale
                  </Typography>
                </Box>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              {/* EX-CONSO-004 : Ajustements de consolidation */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Ajustements de consolidation
                </Typography>

                <Grid container spacing={3}>
                  {consolidationAdjustments.map((adjustment) => (
                    <Grid item xs={12} key={adjustment.id}>
                      <Paper sx={{ p: 2, border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Avatar
                              sx={{
                                backgroundColor: alpha(
                                  adjustment.type === 'goodwill' ? theme.palette.success.main :
                                  adjustment.type === 'fair_value' ? theme.palette.info.main :
                                  adjustment.type === 'minority_interest' ? theme.palette.warning.main :
                                  theme.palette.grey[500],
                                  0.1
                                ),
                                color: adjustment.type === 'goodwill' ? theme.palette.success.main :
                                       adjustment.type === 'fair_value' ? theme.palette.info.main :
                                       adjustment.type === 'minority_interest' ? theme.palette.warning.main :
                                       theme.palette.grey[500],
                              }}
                            >
                              <CalculateIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {adjustment.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Compte {adjustment.account} • {entities.find(e => e.id === adjustment.entity)?.name}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                              {adjustment.amount.toLocaleString()} FCFA
                            </Typography>
                            {adjustment.validated ? (
                              <Chip label="Validé" size="small" color="success" />
                            ) : (
                              <Chip label="À valider" size="small" color="warning" />
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  sx={{ mt: 3 }}
                  fullWidth
                >
                  Ajouter un ajustement
                </Button>
              </CardContent>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              {/* EX-CONSO-006 : États consolidés OHADA */}
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  États financiers consolidés SYSCOHADA
                </Typography>

                <Stepper activeStep={consolidationStep} orientation="vertical">
                  {consolidationSteps.map((label, index) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                      <StepContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {index === 0 && 'Sélection des entités à consolider selon les pourcentages de contrôle'}
                          {index === 1 && 'Conversion des comptes en devise étrangère selon méthode réglementaire'}
                          {index === 2 && 'Élimination automatique des transactions entre sociétés du groupe'}
                          {index === 3 && 'Calcul du goodwill, ajustements de juste valeur et intérêts minoritaires'}
                          {index === 4 && 'Production du bilan, compte de résultat et TAFIRE consolidés'}
                        </Typography>
                        {index === consolidationSteps.length - 1 ? (
                          <Stack spacing={2}>
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              fullWidth
                            >
                              Télécharger états consolidés
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<TableIcon />}
                              fullWidth
                            >
                              Voir tableau de variation des capitaux propres
                            </Button>
                          </Stack>
                        ) : (
                          <Button
                            variant="contained"
                            onClick={() => setConsolidationStep(index + 1)}
                            sx={{ mt: 1, mr: 1 }}
                          >
                            Continuer
                          </Button>
                        )}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </TabPanel>
          </Card>
        </Grid>

        {/* Panneau latéral */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* EX-CONSO-003 : Conversion des devises */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Taux de conversion
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  Méthodes réglementaires SYSCOHADA appliquées
                </Alert>

                <List disablePadding>
                  {currencyConversions.map((conversion, index) => (
                    <React.Fragment key={`${conversion.currency}-${conversion.rateType}`}>
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                            }}
                          >
                            {conversion.currency === 'EUR' ? <EuroIcon /> : <DollarIcon />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              1 {conversion.currency} = {conversion.rate} XOF
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              Taux {conversion.rateType === 'closing' ? 'de clôture' :
                                    conversion.rateType === 'average' ? 'moyen' : 'historique'}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < currencyConversions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>

                <Button
                  variant="outlined"
                  startIcon={<ExchangeIcon />}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Mettre à jour les taux
                </Button>
              </CardContent>
            </Card>

            {/* EX-CONSO-008 : Méthodes de consolidation */}
            <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Méthodes appliquées
                </Typography>

                <Stack spacing={2}>
                  <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                      Intégration globale
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Contrôle {'>'} 50% - Intégration à 100% avec intérêts minoritaires
                    </Typography>
                  </Paper>

                  <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.05) }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                      Intégration proportionnelle
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Contrôle conjoint - Intégration au % de détention
                    </Typography>
                  </Paper>

                  <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                      Mise en équivalence
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Influence notable 20-50% - Valeur de la participation
                    </Typography>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialog Périmètre */}
      <Dialog open={perimeterDialogOpen} onClose={() => setPerimeterDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Créer un nouveau périmètre de consolidation</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nom du périmètre"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Exercice</InputLabel>
                <Select defaultValue="2024">
                  <MenuItem value="2024">2024</MenuItem>
                  <MenuItem value="2023">2023</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select defaultValue="full">
                  <MenuItem value="full">Groupe complet</MenuItem>
                  <MenuItem value="partial">Partiel</MenuItem>
                  <MenuItem value="geographic">Géographique</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Sélectionner les entités
              </Typography>
              {entities.map((entity) => (
                <FormControlLabel
                  key={entity.id}
                  control={<Checkbox defaultChecked />}
                  label={`${entity.name} (${entity.controlPercentage}%)`}
                />
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPerimeterDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant="contained">
            Créer périmètre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Éliminations */}
      <Dialog open={eliminationDialogOpen} onClose={() => setEliminationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Éliminations automatiques</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Cette action va éliminer toutes les opérations intra-groupe détectées.
            Les éliminations sont réversibles jusqu'à la validation finale.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Opérations à éliminer :
          </Typography>
          <List dense>
            {intraGroupOperations
              .filter(op => !op.eliminated)
              .map(op => (
                <ListItem key={op.id}>
                  <ListItemText
                    primary={op.description}
                    secondary={`${op.amount.toLocaleString()} ${op.currency}`}
                  />
                </ListItem>
              ))
            }
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEliminationDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant="contained" color="warning">
            Éliminer tout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernConsolidation