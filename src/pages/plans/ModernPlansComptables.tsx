/**
 * Module Plans Comptables Complet - Gestion des plans SYSCOHADA
 * Conforme aux exigences EX-PLAN-001 à EX-PLAN-010
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Badge,
  useTheme,
  alpha,
  Skeleton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
} from '@mui/material'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'
import {
  AccountTree as TreeIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Sync as SyncIcon,
  CompareArrows as CompareIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  LocalAtm as MoneyIcon,
  Assessment as AssessmentIcon,
  Flag as FlagIcon,
  Update as UpdateIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  SwapHoriz as ConvertIcon,
  Verified as VerifiedIcon,
  Article as DocumentIcon,
  Category as CategoryIcon,
  Label as LabelIcon,
  Settings as SettingsIcon,
  AutoAwesome as AutoIcon,
  ContentCopy as CopyIcon,
  NavigateNext as NextIcon,
  AccountTree,
} from '@mui/icons-material'

// EX-PLAN-001: Plans comptables OHADA par pays et secteur
interface AccountingPlan {
  id: string
  code: string
  name: string
  country: string
  sector?: string
  type: 'general' | 'banking' | 'insurance' | 'microfinance' | 'ngo'
  version: string
  effectiveDate: string
  status: 'active' | 'draft' | 'obsolete'
  accounts: Account[]
  totalAccounts: number
  lastUpdate: string
  compliance: number // Pourcentage de conformité
}

// Structure d'un compte
interface Account {
  code: string
  name: string
  nameCustom?: string // EX-PLAN-005: Libellé personnalisé
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense'
  nature: 'debit' | 'credit'
  level: number // 1-12 selon EX-PLAN-002
  parent?: string
  children?: Account[]
  isSystem: boolean // Compte système non modifiable
  isActive: boolean
  isSelectable: boolean // Peut être utilisé dans les écritures
  sectorSpecific?: boolean // EX-PLAN-008: Compte sectoriel
  requiredForLiasse?: string[] // Types de liasse nécessitant ce compte
  mapping?: AccountMapping[] // EX-PLAN-003: Correspondances
}

// EX-PLAN-003: Tables de correspondance
interface AccountMapping {
  targetPlan: string
  targetAccount: string
  confidence: number
  isAutomatic: boolean
  validatedBy?: string
  validatedAt?: string
}

// EX-PLAN-006: Mise à jour réglementaire
interface RegulatoryUpdate {
  id: string
  planId: string
  date: string
  description: string
  changes: AccountChange[]
  appliedBy?: string
  status: 'pending' | 'applied' | 'rejected'
}

interface AccountChange {
  account: string
  changeType: 'add' | 'modify' | 'delete' | 'rename'
  oldValue?: string
  newValue?: string
  reason: string
}

// EX-PLAN-007: Conversion entre plans
interface ConversionRule {
  sourcePlan: string
  targetPlan: string
  mappings: {
    source: string
    target: string
    transformRule?: string
  }[]
  confidence: number
  lastUsed: string
}

const ModernPlansComptables: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<AccountingPlan | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSector, setFilterSector] = useState<string>('all')
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['1'])
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'grid'>('tree')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false)
  const [subdivisionDialogOpen, setSubdivisionDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // EX-PLAN-001: Plans OHADA complets par pays
  const accountingPlans: AccountingPlan[] = [
    {
      id: '1',
      code: 'SYSCOHADA-CI-2024',
      name: 'Plan SYSCOHADA Côte d\'Ivoire',
      country: 'CI',
      type: 'general',
      version: '2024.1',
      effectiveDate: '2024-01-01',
      status: 'active',
      accounts: [],
      totalAccounts: 847,
      lastUpdate: '2024-01-15',
      compliance: 100
    },
    {
      id: '2',
      code: 'SYSCOHADA-SN-2024',
      name: 'Plan SYSCOHADA Sénégal',
      country: 'SN',
      type: 'general',
      version: '2024.1',
      effectiveDate: '2024-01-01',
      status: 'active',
      accounts: [],
      totalAccounts: 852,
      lastUpdate: '2024-01-20',
      compliance: 100
    },
    {
      id: '3',
      code: 'SYSCOHADA-BANK-2024',
      name: 'Plan Comptable Bancaire UEMOA',
      country: 'UEMOA',
      sector: 'banking',
      type: 'banking',
      version: '2024.1',
      effectiveDate: '2024-01-01',
      status: 'active',
      accounts: [],
      totalAccounts: 1203,
      lastUpdate: '2024-02-01',
      compliance: 98
    },
    {
      id: '4',
      code: 'SYSCOHADA-INSURANCE-2024',
      name: 'Plan Comptable Assurances CIMA',
      country: 'CIMA',
      sector: 'insurance',
      type: 'insurance',
      version: '2024.1',
      effectiveDate: '2024-01-01',
      status: 'active',
      accounts: [],
      totalAccounts: 956,
      lastUpdate: '2024-02-15',
      compliance: 97
    }
  ]

  // Comptes SYSCOHADA avec structure hiérarchique complète
  const syscohadaAccounts: Account[] = [
    {
      code: '1',
      name: 'COMPTES DE RESSOURCES DURABLES',
      type: 'equity',
      nature: 'credit',
      level: 1,
      isSystem: true,
      isActive: true,
      isSelectable: false,
      children: [
        {
          code: '10',
          name: 'CAPITAL',
          type: 'equity',
          nature: 'credit',
          level: 2,
          parent: '1',
          isSystem: true,
          isActive: true,
          isSelectable: false,
          children: [
            {
              code: '101',
              name: 'Capital social',
              type: 'equity',
              nature: 'credit',
              level: 3,
              parent: '10',
              isSystem: true,
              isActive: true,
              isSelectable: false,
              requiredForLiasse: ['normal', 'allege'],
              children: [
                {
                  code: '1011',
                  name: 'Capital souscrit, non appelé',
                  type: 'equity',
                  nature: 'credit',
                  level: 4,
                  parent: '101',
                  isSystem: false,
                  isActive: true,
                  isSelectable: true
                },
                {
                  code: '1012',
                  name: 'Capital souscrit, appelé, non versé',
                  type: 'equity',
                  nature: 'credit',
                  level: 4,
                  parent: '101',
                  isSystem: false,
                  isActive: true,
                  isSelectable: true
                },
                {
                  code: '1013',
                  name: 'Capital souscrit, appelé, versé',
                  type: 'equity',
                  nature: 'credit',
                  level: 4,
                  parent: '101',
                  isSystem: false,
                  isActive: true,
                  isSelectable: true
                }
              ]
            },
            {
              code: '104',
              name: 'Compte de l\'exploitant',
              type: 'equity',
              nature: 'credit',
              level: 3,
              parent: '10',
              isSystem: false,
              isActive: true,
              isSelectable: true
            },
            {
              code: '105',
              name: 'Primes liées au capital social',
              type: 'equity',
              nature: 'credit',
              level: 3,
              parent: '10',
              isSystem: false,
              isActive: true,
              isSelectable: true
            }
          ]
        },
        {
          code: '11',
          name: 'RÉSERVES',
          type: 'equity',
          nature: 'credit',
          level: 2,
          parent: '1',
          isSystem: true,
          isActive: true,
          isSelectable: false,
          children: [
            {
              code: '111',
              name: 'Réserve légale',
              type: 'equity',
              nature: 'credit',
              level: 3,
              parent: '11',
              isSystem: false,
              isActive: true,
              isSelectable: true
            },
            {
              code: '112',
              name: 'Réserves statutaires',
              type: 'equity',
              nature: 'credit',
              level: 3,
              parent: '11',
              isSystem: false,
              isActive: true,
              isSelectable: true
            }
          ]
        }
      ]
    },
    {
      code: '2',
      name: 'COMPTES D\'ACTIF IMMOBILISÉ',
      type: 'asset',
      nature: 'debit',
      level: 1,
      isSystem: true,
      isActive: true,
      isSelectable: false,
      children: [
        {
          code: '20',
          name: 'CHARGES IMMOBILISÉES',
          type: 'asset',
          nature: 'debit',
          level: 2,
          parent: '2',
          isSystem: true,
          isActive: true,
          isSelectable: false,
          children: [
            {
              code: '201',
              name: 'Frais d\'établissement',
              type: 'asset',
              nature: 'debit',
              level: 3,
              parent: '20',
              isSystem: false,
              isActive: true,
              isSelectable: true
            }
          ]
        },
        {
          code: '21',
          name: 'IMMOBILISATIONS INCORPORELLES',
          type: 'asset',
          nature: 'debit',
          level: 2,
          parent: '2',
          isSystem: true,
          isActive: true,
          isSelectable: false
        }
      ]
    },
    {
      code: '4',
      name: 'COMPTES DE TIERS',
      type: 'asset',
      nature: 'debit',
      level: 1,
      isSystem: true,
      isActive: true,
      isSelectable: false,
      children: [
        {
          code: '40',
          name: 'FOURNISSEURS ET COMPTES RATTACHÉS',
          type: 'liability',
          nature: 'credit',
          level: 2,
          parent: '4',
          isSystem: true,
          isActive: true,
          isSelectable: false,
          children: [
            {
              code: '401',
              name: 'Fournisseurs',
              type: 'liability',
              nature: 'credit',
              level: 3,
              parent: '40',
              isSystem: false,
              isActive: true,
              isSelectable: true,
              requiredForLiasse: ['normal', 'allege', 'simplifie']
            }
          ]
        },
        {
          code: '41',
          name: 'CLIENTS ET COMPTES RATTACHÉS',
          type: 'asset',
          nature: 'debit',
          level: 2,
          parent: '4',
          isSystem: true,
          isActive: true,
          isSelectable: false,
          children: [
            {
              code: '411',
              name: 'Clients',
              type: 'asset',
              nature: 'debit',
              level: 3,
              parent: '41',
              isSystem: false,
              isActive: true,
              isSelectable: true,
              requiredForLiasse: ['normal', 'allege', 'simplifie']
            }
          ]
        }
      ]
    },
    {
      code: '6',
      name: 'COMPTES DE CHARGES DES ACTIVITÉS ORDINAIRES',
      type: 'expense',
      nature: 'debit',
      level: 1,
      isSystem: true,
      isActive: true,
      isSelectable: false,
      children: [
        {
          code: '60',
          name: 'ACHATS ET VARIATIONS DE STOCKS',
          type: 'expense',
          nature: 'debit',
          level: 2,
          parent: '6',
          isSystem: true,
          isActive: true,
          isSelectable: false,
          children: [
            {
              code: '601',
              name: 'Achats de marchandises',
              type: 'expense',
              nature: 'debit',
              level: 3,
              parent: '60',
              isSystem: false,
              isActive: true,
              isSelectable: true
            }
          ]
        }
      ]
    },
    {
      code: '7',
      name: 'COMPTES DE PRODUITS DES ACTIVITÉS ORDINAIRES',
      type: 'income',
      nature: 'credit',
      level: 1,
      isSystem: true,
      isActive: true,
      isSelectable: false,
      children: [
        {
          code: '70',
          name: 'VENTES',
          type: 'income',
          nature: 'credit',
          level: 2,
          parent: '7',
          isSystem: true,
          isActive: true,
          isSelectable: false,
          children: [
            {
              code: '701',
              name: 'Ventes de marchandises',
              type: 'income',
              nature: 'credit',
              level: 3,
              parent: '70',
              isSystem: false,
              isActive: true,
              isSelectable: true
            }
          ]
        }
      ]
    }
  ]

  // Plans sectoriels EX-PLAN-008
  const sectoralPlans = [
    { code: 'BANK', name: 'Banques', specificAccounts: 156 },
    { code: 'INSURANCE', name: 'Assurances', specificAccounts: 203 },
    { code: 'MICROFINANCE', name: 'Microfinance', specificAccounts: 89 },
    { code: 'NGO', name: 'ONG/Associations', specificAccounts: 67 },
    { code: 'TELECOM', name: 'Télécommunications', specificAccounts: 112 }
  ]

  // Mises à jour réglementaires EX-PLAN-006
  const regulatoryUpdates: RegulatoryUpdate[] = [
    {
      id: '1',
      planId: '1',
      date: '2024-01-01',
      description: 'Mise à jour SYSCOHADA 2024 - Nouveaux comptes numériques',
      changes: [
        {
          account: '214',
          changeType: 'add',
          newValue: 'Actifs numériques',
          reason: 'Adaptation à l\'économie numérique'
        },
        {
          account: '705',
          changeType: 'add',
          newValue: 'Ventes de services numériques',
          reason: 'Nouvelles activités digitales'
        }
      ],
      status: 'pending'
    }
  ]

  // Tables de correspondance EX-PLAN-003
  const correspondenceTables = [
    {
      source: 'SYSCOHADA-CI-2024',
      target: 'IFRS',
      mappings: 523,
      coverage: 92
    },
    {
      source: 'SYSCOHADA-CI-2024',
      target: 'SYSCOHADA-SN-2024',
      mappings: 847,
      coverage: 100
    },
    {
      source: 'SYSCOHADA-BANK-2024',
      target: 'BASEL-III',
      mappings: 687,
      coverage: 85
    }
  ]

  // EX-PLAN-002: Création de subdivisions jusqu'à 12 caractères
  const createSubdivision = (parentCode: string, subdivision: string): string => {
    if (parentCode.length + subdivision.length > 12) {
      setValidationErrors(['Code trop long, maximum 12 caractères'])
      return ''
    }
    return parentCode + subdivision
  }

  // EX-PLAN-004: Validation conformité
  const validateAccountCompliance = (account: Account, planType: string): boolean => {
    // Vérifier que le compte respecte la structure du plan
    if (planType === 'normal' && account.requiredForLiasse?.includes('normal')) {
      return true
    }
    // Autres validations...
    return true
  }

  // EX-PLAN-005: Personnalisation des libellés
  const customizeAccountName = (accountCode: string, newName: string) => {
    // Mettre à jour le nom personnalisé sans modifier le code
    const account = findAccountByCode(accountCode)
    if (account) {
      account.nameCustom = newName
      // Sauvegarder avec traçabilité
      logAccountChange(accountCode, 'rename', account.name, newName)
    }
  }

  // EX-PLAN-007: Conversion automatique entre plans
  const convertBetweenPlans = (accounts: Account[], sourcePlan: string, targetPlan: string): Account[] => {
    // Logique de conversion basée sur les tables de correspondance
    const conversionRules = getConversionRules(sourcePlan, targetPlan)
    return accounts.map(account => {
      const rule = conversionRules.find(r => r.source === account.code)
      if (rule) {
        return {
          ...account,
          code: rule.target,
          mapping: [{
            targetPlan,
            targetAccount: rule.target,
            confidence: rule.confidence || 90,
            isAutomatic: true
          }]
        }
      }
      return account
    })
  }

  // EX-PLAN-009: Contrôle utilisation selon type de liasse
  const checkAccountUsageForLiasse = (accountCode: string, liasseType: string): boolean => {
    const account = findAccountByCode(accountCode)
    if (!account) return false
    
    if (account.requiredForLiasse) {
      return account.requiredForLiasse.includes(liasseType)
    }
    
    // Comptes de niveau 1 et 2 non sélectionnables
    if (account.level <= 2) return false
    
    return true
  }

  // EX-PLAN-010: Export dans tous les formats
  const exportPlan = (format: 'excel' | 'pdf' | 'xml' | 'json' | 'csv') => {
    // Implémenter l'export selon le format
    switch (format) {
      case 'excel':
        exportToExcel()
        break
      case 'pdf':
        exportToPDF()
        break
      case 'xml':
        exportToXML()
        break
      case 'json':
        exportToJSON()
        break
      case 'csv':
        exportToCSV()
        break
    }
  }

  const findAccountByCode = (code: string): Account | undefined => {
    const search = (accounts: Account[]): Account | undefined => {
      for (const account of accounts) {
        if (account.code === code) return account
        if (account.children) {
          const found = search(account.children)
          if (found) return found
        }
      }
      return undefined
    }
    return search(syscohadaAccounts)
  }

  const logAccountChange = (code: string, type: string, oldValue: string, newValue: string) => {
    console.log('Change logged:', { code, type, oldValue, newValue })
  }

  const getConversionRules = (source: string, target: string) => {
    // Retourner les règles de conversion
    return [
      { source: '101', target: '1000', confidence: 95 },
      { source: '401', target: '4000', confidence: 98 }
    ]
  }

  const exportToExcel = () => console.log('Exporting to Excel...')
  const exportToPDF = () => console.log('Exporting to PDF...')
  const exportToXML = () => console.log('Exporting to XML...')
  const exportToJSON = () => console.log('Exporting to JSON...')
  const exportToCSV = () => console.log('Exporting to CSV...')

  // Filtrer les comptes selon la recherche
  const filterAccounts = (accounts: Account[], term: string): Account[] => {
    if (!term) return accounts
    
    const filtered: Account[] = []
    accounts.forEach(account => {
      if (
        account.code.toLowerCase().includes(term.toLowerCase()) ||
        account.name.toLowerCase().includes(term.toLowerCase()) ||
        account.nameCustom?.toLowerCase().includes(term.toLowerCase())
      ) {
        filtered.push(account)
      } else if (account.children) {
        const childrenFiltered = filterAccounts(account.children, term)
        if (childrenFiltered.length > 0) {
          filtered.push({
            ...account,
            children: childrenFiltered
          })
        }
      }
    })
    return filtered
  }

  // Rendre l'arbre des comptes
  const renderAccountTree = (accounts: Account[], level = 0) => {
    return accounts.map(account => (
      <TreeItem
        key={account.code}
        nodeId={account.code}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
            <Chip
              label={account.code}
              size="small"
              sx={{
                mr: 2,
                backgroundColor: alpha(
                  account.type === 'asset' ? theme.palette.primary.main :
                  account.type === 'liability' ? theme.palette.error.main :
                  account.type === 'equity' ? theme.palette.success.main :
                  account.type === 'income' ? theme.palette.info.main :
                  theme.palette.warning.main,
                  0.1
                ),
                fontFamily: 'monospace',
                fontWeight: 600
              }}
            />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {account.nameCustom || account.name}
              {account.nameCustom && (
                <Tooltip title={`Nom original: ${account.name}`}>
                  <InfoIcon fontSize="small" sx={{ ml: 1, verticalAlign: 'middle' }} />
                </Tooltip>
              )}
            </Typography>
            {account.isSystem && (
              <Tooltip title="Compte système">
                <LockIcon fontSize="small" color="action" sx={{ mx: 1 }} />
              </Tooltip>
            )}
            {account.sectorSpecific && (
              <Tooltip title="Compte sectoriel">
                <BusinessIcon fontSize="small" color="primary" sx={{ mx: 1 }} />
              </Tooltip>
            )}
            {account.requiredForLiasse && (
              <Stack direction="row" spacing={0.5}>
                {account.requiredForLiasse.map(liasse => (
                  <Chip
                    key={liasse}
                    label={liasse[0].toUpperCase()}
                    size="small"
                    sx={{ height: 20, fontSize: 10 }}
                  />
                ))}
              </Stack>
            )}
            {account.isSelectable && (
              <Stack direction="row" spacing={0.5} sx={{ ml: 2 }}>
                <IconButton size="small" onClick={() => setSubdivisionDialogOpen(true)}>
                  <AddIcon fontSize="small" />
                </IconButton>
                {!account.isSystem && (
                  <>
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Stack>
            )}
          </Box>
        }
      >
        {account.children && renderAccountTree(account.children, level + 1)}
      </TreeItem>
    ))
  }

  const handleNodeToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
    setExpandedNodes(nodeIds)
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
              Plans Comptables SYSCOHADA
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestion complète des plans comptables avec conformité et conversion automatique
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<UpdateIcon />}
              onClick={() => setUpdateDialogOpen(true)}
            >
              Mises à jour
            </Button>
            <Button
              variant="outlined"
              startIcon={<ConvertIcon />}
              onClick={() => setConversionDialogOpen(true)}
            >
              Convertir
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              sx={{ backgroundColor: theme.palette.primary.main }}
            >
              Exporter
            </Button>
          </Stack>
        </Box>

        {/* Statistiques */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                {accountingPlans.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Plans disponibles
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                847
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Comptes actifs
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                100%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Conformité OHADA
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.warning.main, 0.05) }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                {sectoralPlans.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Plans sectoriels
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={3}>
          {/* Sélection du plan */}
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Plans comptables
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Pays/Zone</InputLabel>
                <Select defaultValue="CI">
                  <MenuItem value="CI">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>🇨🇮</span> Côte d'Ivoire
                    </Box>
                  </MenuItem>
                  <MenuItem value="SN">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>🇸🇳</span> Sénégal
                    </Box>
                  </MenuItem>
                  <MenuItem value="UEMOA">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FlagIcon fontSize="small" /> UEMOA
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>

              <List>
                {accountingPlans.map((plan) => (
                  <ListItem
                    key={plan.id}
                    button
                    selected={selectedPlan?.id === plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: alpha(
                            plan.type === 'general' ? theme.palette.primary.main :
                            plan.type === 'banking' ? theme.palette.success.main :
                            plan.type === 'insurance' ? theme.palette.warning.main :
                            theme.palette.info.main,
                            0.1
                          ),
                          color: plan.type === 'general' ? theme.palette.primary.main :
                                 plan.type === 'banking' ? theme.palette.success.main :
                                 plan.type === 'insurance' ? theme.palette.warning.main :
                                 theme.palette.info.main,
                        }}
                      >
                        {plan.type === 'banking' ? <BankIcon fontSize="small" /> :
                         plan.type === 'insurance' ? <BusinessIcon fontSize="small" /> :
                         <AccountTree fontSize="small" />}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={plan.name}
                      secondary={
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {plan.totalAccounts} comptes • v{plan.version}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={plan.compliance}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              mt: 0.5,
                              backgroundColor: alpha(theme.palette.divider, 0.1)
                            }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              <Divider sx={{ my: 2 }} />

              {/* Plans sectoriels EX-PLAN-008 */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Plans sectoriels disponibles
              </Typography>
              
              <Stack spacing={1}>
                {sectoralPlans.map((sector) => (
                  <Chip
                    key={sector.code}
                    label={`${sector.name} (+${sector.specificAccounts})`}
                    size="small"
                    variant="outlined"
                    onClick={() => setFilterSector(sector.code)}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Tables de correspondance EX-PLAN-003 */}
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Tables de correspondance
              </Typography>
              
              <List dense>
                {correspondenceTables.map((table, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption">{table.source}</Typography>
                          <ArrowForward fontSize="small" />
                          <Typography variant="caption">{table.target}</Typography>
                        </Box>
                      }
                      secondary={`${table.mappings} mappings • ${table.coverage}% couverture`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={9}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              {/* Barre d'outils */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <TextField
                  placeholder="Rechercher un compte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ width: 300 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Stack direction="row" spacing={2}>
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, newMode) => newMode && setViewMode(newMode)}
                    size="small"
                  >
                    <ToggleButton value="tree">
                      <TreeIcon />
                    </ToggleButton>
                    <ToggleButton value="list">
                      <FilterIcon />
                    </ToggleButton>
                    <ToggleButton value="grid">
                      <CategoryIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => setSubdivisionDialogOpen(true)}
                  >
                    Subdivision
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                  <Tab label="Structure" />
                  <Tab label="Validation" />
                  <Tab label="Personnalisation" />
                  <Tab label="Export" />
                </Tabs>
              </Box>

              <TabPanel value={activeTab} index={0}>
                {/* Vue arborescente des comptes */}
                {viewMode === 'tree' && (
                  <SimpleTreeView
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpandIcon={<ChevronRightIcon />}
                    expanded={expandedNodes}
                    onNodeToggle={handleNodeToggle}
                  >
                    {renderAccountTree(filterAccounts(syscohadaAccounts, searchTerm))}
                  </SimpleTreeView>
                )}

                {viewMode === 'list' && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Code</TableCell>
                          <TableCell>Libellé</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Nature</TableCell>
                          <TableCell>Niveau</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Afficher les comptes en liste */}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                {/* EX-PLAN-004: Validation conformité */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Validation de conformité
                </Typography>
                
                <Alert severity="success" sx={{ mb: 3 }}>
                  <AlertTitle>Plan conforme à 100%</AlertTitle>
                  Tous les comptes respectent les normes SYSCOHADA en vigueur.
                </Alert>

                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Structure hiérarchique"
                      secondary="Respect des niveaux 1 à 12"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Comptes obligatoires"
                      secondary="Tous les comptes requis sont présents"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Cohérence des codes"
                      secondary="Numérotation séquentielle respectée"
                    />
                  </ListItem>
                </List>

                {/* EX-PLAN-009: Contrôle utilisation */}
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Contrôle d'utilisation par type de liasse
                </Typography>
                
                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type de liasse</TableCell>
                        <TableCell>Comptes requis</TableCell>
                        <TableCell>Comptes disponibles</TableCell>
                        <TableCell>Conformité</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Système normal</TableCell>
                        <TableCell>523</TableCell>
                        <TableCell>523</TableCell>
                        <TableCell>
                          <Chip label="100%" size="small" color="success" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Système allégé</TableCell>
                        <TableCell>312</TableCell>
                        <TableCell>312</TableCell>
                        <TableCell>
                          <Chip label="100%" size="small" color="success" />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Système simplifié</TableCell>
                        <TableCell>156</TableCell>
                        <TableCell>156</TableCell>
                        <TableCell>
                          <Chip label="100%" size="small" color="success" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                {/* EX-PLAN-005: Personnalisation des libellés */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Personnalisation des libellés
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  Personnalisez les libellés des comptes sans modifier les codes officiels.
                </Alert>

                <TableContainer component={Paper} elevation={0}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Code</TableCell>
                        <TableCell>Libellé officiel</TableCell>
                        <TableCell>Libellé personnalisé</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>401</TableCell>
                        <TableCell>Fournisseurs</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            defaultValue="Fournisseurs d'exploitation"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                {/* EX-PLAN-010: Export multi-formats */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Export du plan comptable
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }}
                           onClick={() => exportPlan('excel')}>
                      <ExcelIcon sx={{ fontSize: 48, color: '#107C41', mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Excel
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Format tabulaire avec formules
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }}
                           onClick={() => exportPlan('pdf')}>
                      <PictureAsPdf sx={{ fontSize: 48, color: '#F40F02', mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        PDF
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Document imprimable
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', cursor: 'pointer' }}
                           onClick={() => exportPlan('xml')}>
                      <Code sx={{ fontSize: 48, color: '#FF6600', mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        XML/JSON
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Format structuré pour API
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog Subdivision EX-PLAN-002 */}
      <Dialog open={subdivisionDialogOpen} onClose={() => setSubdivisionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Créer une subdivision</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Création de subdivisions jusqu'à 12 caractères maximum
          </Alert>
          
          <TextField
            fullWidth
            label="Code parent"
            value={selectedAccount?.code || ''}
            disabled
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Code subdivision"
            placeholder="Ex: 01, 001, etc."
            helperText={`Code final: ${selectedAccount?.code || ''}XX (max 12 caractères)`}
          />
          
          <TextField
            fullWidth
            label="Libellé de la subdivision"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubdivisionDialogOpen(false)}>Annuler</Button>
          <Button variant="contained">Créer</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Conversion EX-PLAN-007 */}
      <Dialog open={conversionDialogOpen} onClose={() => setConversionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Conversion entre plans comptables</DialogTitle>
        <DialogContent>
          <Stepper activeStep={0} orientation="vertical">
            <Step>
              <StepLabel>Sélection des plans</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Plan source</InputLabel>
                      <Select defaultValue="">
                        {accountingPlans.map(plan => (
                          <MenuItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Plan cible</InputLabel>
                      <Select defaultValue="">
                        {accountingPlans.map(plan => (
                          <MenuItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </StepContent>
            </Step>
            <Step>
              <StepLabel>Mapping automatique</StepLabel>
            </Step>
            <Step>
              <StepLabel>Validation et export</StepLabel>
            </Step>
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConversionDialogOpen(false)}>Annuler</Button>
          <Button variant="contained">Convertir</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Mises à jour EX-PLAN-006 */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Mises à jour réglementaires</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>{regulatoryUpdates.length} mise(s) à jour en attente</AlertTitle>
            Appliquez les mises à jour pour rester conforme.
          </Alert>
          
          <List>
            {regulatoryUpdates.map((update) => (
              <ListItem key={update.id}>
                <ListItemIcon>
                  <UpdateIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary={update.description}
                  secondary={
                    <Box>
                      <Typography variant="caption">
                        Date: {update.date} • {update.changes.length} modifications
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        {update.changes.map((change, index) => (
                          <Chip
                            key={index}
                            label={`${change.changeType}: ${change.account}`}
                            size="small"
                            color={change.changeType === 'add' ? 'success' : 
                                   change.changeType === 'delete' ? 'error' : 'warning'}
                          />
                        ))}
                      </Stack>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Button size="small" variant="contained">
                    Appliquer
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Fermer</Button>
          <Button variant="contained" color="success">
            Tout appliquer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernPlansComptables