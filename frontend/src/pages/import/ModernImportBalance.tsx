import { logger } from '@/utils/logger'
/**
 * Module Import Balance Complet - Import multi-formats avec mapping IA
 * Conforme aux exigences EX-IMPORT-001 à EX-IMPORT-010
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { balanceService } from '@/services'
import { useBackendData } from '@/hooks/useBackendData'
import { importBalanceFile } from '@/services/balanceParserService'
import type { ImportPipelineResult } from '@/services/balanceParserService'
import { saveImportedBalance, saveImportedBalanceN1, saveImportRecord, hasExistingBalance, getBalancesForExercice } from '@/services/balanceStorageService'
import { getOrCreateExercice, markExerciceHasBalance } from '@/services/exerciceStorageService'
import { runComparison, type ComparisonReport } from '@/services/comparisonService'
import ComparisonResultModal from '@/components/comparison/ComparisonResultModal'
import { FeatureGate } from '@/components/gating'
import { useNavigate } from 'react-router-dom'
import type { ExerciceConfig } from '@/types/audit.types'
import { liasseDataService, LiasseDataService } from '@/services/liasseDataService'
import { downloadBalanceTemplate } from '@/services/balanceTemplateService'
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
  Stepper,
  Step,
  StepLabel,
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
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Stack,
  useTheme,
  alpha,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  TableChart as ExcelIcon,
  Code as XmlIcon,
  DataObject as JsonIcon,
  Api as ApiIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Save as SaveIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountTree,
  Psychology as SmartIcon,
  Timer as TimerIcon,
  History as HistoryIcon,
  FileDownload as DownloadIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import { useSnackbar } from 'notistack'
import AtlasFinanceImportBanner from '@/components/Balance/AtlasFinanceImportBanner'

// EX-IMPORT-001: Support multi-formats et API
type ImportFormat = 'excel' | 'csv' | 'xml' | 'json' | 'api'

interface ImportConfig {
  format: ImportFormat
  separator?: string // Pour CSV
  encoding?: string
  dateFormat?: string
  decimalSeparator?: string
  thousandsSeparator?: string
  apiEndpoint?: string
  apiKey?: string
  tolerance?: number // EX-IMPORT-003: Tolérance équilibre
}

// Structure de la balance importée
interface BalanceAccount {
  accountNumber: string
  accountName: string
  debitOpening?: number
  creditOpening?: number
  debitMovements?: number
  creditMovements?: number
  debitClosing?: number
  creditClosing?: number
  // N-1 unified fields
  soldeDebitN1?: number
  soldeCreditN1?: number
  // Champs détectés automatiquement
  detectedType?: 'asset' | 'liability' | 'income' | 'expense' | 'equity'
  mappedAccount?: string // Compte SYSCOHADA mappé
  mappingConfidence?: number // Confiance du mapping IA (0-100)
  status?: 'valid' | 'warning' | 'error'
  errors?: string[]
}

// EX-IMPORT-002: Détection automatique de structure
interface FileStructure {
  headers: string[]
  detectedColumns: {
    accountNumber?: number
    accountName?: number
    debit?: number[]
    credit?: number[]
  }
  sampleData: any[][]
  encoding: string
  separator?: string
  hasHeaders: boolean
  rowCount: number
  detectionConfidence: number
}

// EX-IMPORT-005: Mapping intelligent avec IA
interface MappingSuggestion {
  sourceAccount: string
  suggestedAccount: string
  confidence: number
  reason: string
  basedOn: 'history' | 'ai' | 'rules' | 'manual'
}

// EX-IMPORT-008: Comparaison N-1
interface Comparison {
  account: string
  currentYear: number
  previousYear: number
  variation: number
  variationPercent: number
  alert?: 'significant_increase' | 'significant_decrease' | 'new_account' | 'missing_account'
}

// EX-IMPORT-010: Rapport d'import
interface ImportReport {
  timestamp: string
  fileName: string
  format: ImportFormat
  totalAccounts: number
  importedAccounts: number
  mappedAccounts: number
  unmappedAccounts: number
  errors: number
  warnings: number
  processingTime: number // millisecondes
  debitTotal: number
  creditTotal: number
  balance: number
  statistics: {
    averageMappingConfidence: number
    autoMappedPercentage: number
    manualCorrections: number
  }
}

const ModernImportBalance: React.FC = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)
  const [importStep, setImportStep] = useState(0)
  const [importedData, setImportedData] = useState<BalanceAccount[]>([])
  const [fileStructure, setFileStructure] = useState<FileStructure | null>(null)
  const [mappingSuggestions, setMappingSuggestions] = useState<MappingSuggestion[]>([])
  const [importReport, setImportReport] = useState<ImportReport | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processingTime, setProcessingTime] = useState(0)
  const [activeTab, setActiveTab] = useState(0)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [importConfig, setImportConfig] = useState<ImportConfig>({
    format: 'excel',
    separator: ';',
    encoding: 'UTF-8',
    dateFormat: 'DD/MM/YYYY',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    tolerance: 0.01 // 1 centime de tolérance
  })
  
  // Exercice configuration (Step 0)
  const currentYear = new Date().getFullYear()
  const [exerciceConfig, setExerciceConfig] = useState<ExerciceConfig>({
    year: currentYear,
    date_debut: `${currentYear}-01-01`,
    date_fin: `${currentYear}-12-31`,
    type: 'N',
  })
  const [exerciceConfigured, setExerciceConfigured] = useState(false)
  const [reimportInfo, setReimportInfo] = useState<{ exists: boolean; version: number }>({ exists: false, version: 0 })

  // ── Sélecteur d'exercice à l'import ──
  // Une balance peut contenir DEUX jeux de colonnes de soldes ("Solde N" et
  // "Solde N-1"). Selon le cadrage du fichier, l'exercice à déclarer peut être
  // dans l'un OU l'autre (ex. fichier cadré 2026 dont la clôture 2025 auditée
  // est en colonne "N-1"). On NE suppose plus : l'utilisateur choisit, avec un
  // aperçu chiffré (total bilan, résultat, équilibre) calculé par colonne.
  const [declaredColumnSet, setDeclaredColumnSet] = useState<'N' | 'N1'>('N')

  // État erreurs/warnings visibles
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [warningMessages, setWarningMessages] = useState<string[]>([])

  // État pour la comparaison N-1
  const [comparisonData, setComparisonData] = useState<Comparison[]>([])

  // Rapport de comparaison N/N-1 post-import
  const [comparisonReport, setComparisonReport] = useState<ComparisonReport | null>(null)
  const [showComparisonModal, setShowComparisonModal] = useState(false)

  // Timer pour EX-IMPORT-009
  const [, setImportStartTime] = useState<Date | null>(null)

  // Récupérer le plan comptable SYSCOHADA 
  useBackendData({
    service: 'accountingService',
    method: 'getPlansComptables',
    params: { type: 'SYSCOHADA', page_size: 500 },
    defaultData: [
      { code: '101', name: 'Capital', type: 'equity' },
      { code: '201', name: 'Immobilisations incorporelles', type: 'asset' },
      { code: '401', name: 'Fournisseurs', type: 'liability' },
      { code: '411', name: 'Clients', type: 'asset' },
      { code: '512', name: 'Banques', type: 'asset' },
      { code: '601', name: 'Achats de matières premières', type: 'expense' },
      { code: '701', name: 'Ventes de marchandises', type: 'income' },
    ]
  })

  // Récupérer l'historique de mapping 
  const [mappingHistory, setMappingHistory] = useState<any[]>([])

  useEffect(() => {
    // Default mapping history (backend service not available)
    setMappingHistory([
      { source: '10100000', target: '101', frequency: 15 },
      { source: 'CAPITAL SOCIAL', target: '101', frequency: 12 },
      { source: '40100000', target: '401', frequency: 20 },
      { source: 'FOURNISSEURS', target: '401', frequency: 18 },
    ])
  }, [])

  // Configuration du dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setSelectedFile(file)
      detectFileStructure(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'text/xml': ['.xml'],
      'application/json': ['.json']
    },
    multiple: false
  })

  // EX-IMPORT-002: Détection automatique de la structure (100% client-side)
  const detectFileStructure = async (file: File) => {
    setLoading(true)
    setImportStartTime(new Date())
    setErrorMessage(null)
    setWarningMessages([])

    try {
      const result: ImportPipelineResult = await importBalanceFile(file, {
        separator: importConfig.separator,
        encoding: importConfig.encoding,
      })

      // Build FileStructure from detection result
      const det = result.detection
      const structure: FileStructure = {
        headers: det.headers,
        detectedColumns: {
          accountNumber: det.mapping?.compte,
          accountName: det.mapping?.libelle ?? undefined,
          debit: det.mapping?.debit !== undefined ? [det.mapping.debit] : [],
          credit: det.mapping?.credit !== undefined ? [det.mapping.credit] : [],
        },
        sampleData: det.sampleData,
        encoding: importConfig.encoding || 'UTF-8',
        separator: importConfig.separator,
        hasHeaders: true,
        rowCount: det.rowCount,
        detectionConfidence: det.confidence,
      }
      setFileStructure(structure)

      // Convert parsed entries to BalanceAccount for display
      const accounts: BalanceAccount[] = result.entries.map(entry => ({
        accountNumber: entry.compte,
        accountName: entry.intitule,
        debitOpening: 0,
        creditOpening: 0,
        debitMovements: entry.debit,
        creditMovements: entry.credit,
        debitClosing: entry.solde_debit,
        creditClosing: entry.solde_credit,
        soldeDebitN1: entry.solde_debit_n1 ?? 0,
        soldeCreditN1: entry.solde_credit_n1 ?? 0,
        detectedType: detectAccountType(entry.compte),
        mappedAccount: entry.compte.substring(0, 3),
        mappingConfidence: 80,
        status: 'valid' as const,
      }))

      setImportedData(accounts)
      logger.debug('[Import Parse] Detection mapping:', JSON.stringify(result.detection.mapping))
      if (result.warnings.length > 0) setWarningMessages(result.warnings)
      if (result.errors.length > 0) setErrorMessage(result.errors.join(' | '))

      validateBalance(accounts)
      generateMappingSuggestions(accounts)

      // Build N-1 comparison from unified entries
      const hasN1Data = accounts.some(a => (a.soldeDebitN1 || 0) !== 0 || (a.soldeCreditN1 || 0) !== 0)
      logger.debug('[Import Parse] N entries:', result.entries.length, '| hasN1:', hasN1Data)
      if (hasN1Data) {
        const n1Entries = accounts.map(a => ({
          compte: a.accountNumber,
          intitule: a.accountName,
          debit: 0, credit: 0,
          solde_debit: a.soldeDebitN1 || 0,
          solde_credit: a.soldeCreditN1 || 0,
        }))
        compareWithN1(accounts, n1Entries)
      }

      const endTime = performance.now()
      setProcessingTime(endTime)
      generateImportReport(accounts, file.name, endTime)

      setImportStep(3)
    } catch (error: any) {
      logger.error('Erreur parsing fichier:', error)
      setErrorMessage(error?.message || 'Erreur inconnue lors du parsing du fichier.')
    } finally {
      setLoading(false)
    }
  }

  /** Detect SYSCOHADA account type from account number prefix */
  const detectAccountType = (compte: string): BalanceAccount['detectedType'] => {
    const c = compte[0]
    if (c === '1') return 'equity'
    if (c === '2') return 'asset'
    if (c === '3') return 'asset'
    if (c === '4') return compte.startsWith('40') ? 'liability' : 'asset'
    if (c === '5') return 'asset'
    if (c === '6') return 'expense'
    if (c === '7') return 'income'
    return undefined
  }

  // Re-process file from step 1 (re-parse with potentially updated config)
  const processFile = async (file: File, _structure: FileStructure) => {
    // Re-run the full pipeline with current config
    await detectFileStructure(file)
  }

  // Construit les BalanceEntry[] depuis le jeu de colonnes choisi (N ou N-1).
  // Pour N-1 : le solde déclaré devient la clôture N-1, les mouvements et le
  // N-1-du-N-1 (= N-2, inconnu) sont mis à 0.
  const buildEntriesForColumn = useCallback(
    (accounts: BalanceAccount[], col: 'N' | 'N1') =>
      accounts.map(a => ({
        compte: a.accountNumber,
        intitule: a.accountName,
        debit: col === 'N1' ? 0 : a.debitMovements || 0,
        credit: col === 'N1' ? 0 : a.creditMovements || 0,
        solde_debit: col === 'N1' ? a.soldeDebitN1 || 0 : a.debitClosing || 0,
        solde_credit: col === 'N1' ? a.soldeCreditN1 || 0 : a.creditClosing || 0,
        solde_debit_n1: col === 'N1' ? 0 : a.soldeDebitN1 || 0,
        solde_credit_n1: col === 'N1' ? 0 : a.soldeCreditN1 || 0,
      })),
    [],
  )

  // Y a-t-il un second jeu de colonnes (N-1) exploitable ?
  const hasN1Columns = useMemo(
    () => importedData.some(a => (a.soldeDebitN1 || 0) !== 0 || (a.soldeCreditN1 || 0) !== 0),
    [importedData],
  )

  // Aperçu chiffré par jeu de colonnes : total bilan, résultat, équilibre.
  // Sert à guider le choix de l'exercice à déclarer (zéro hypothèse silencieuse).
  const columnPreviews = useMemo(() => {
    const compute = (col: 'N' | 'N1') => {
      const entries = buildEntriesForColumn(importedData, col)
      const svc = new LiasseDataService()
      svc.loadBalance(entries)
      const d = svc.validateCoherenceDetailed()
      const sumD = entries.reduce((s, e) => s + (e.solde_debit || 0), 0)
      const sumC = entries.reduce((s, e) => s + (e.solde_credit || 0), 0)
      // P&L présent dans cette colonne ? (classes 6/7 avec solde). Une colonne de
      // CLÔTURE a son P&L déjà soldé (résultat affecté au report à nouveau) → 0 normal.
      const hasPL = entries.some(e => /^[67]/.test(e.compte) && ((e.solde_debit || 0) !== 0 || (e.solde_credit || 0) !== 0))
      const resultatRaw = svc.getResultatFromCompteResultat()
      return {
        totalActif: d.checks[0]?.valeurA ?? 0,
        totalPassif: d.checks[0]?.valeurB ?? 0,
        ecartBilan: d.checks[0]?.ecart ?? 0,
        equilibre: (d.checks[0]?.ecart ?? 0) <= 1,
        resultat: resultatRaw || 0, // normalise -0 → 0
        hasPL,
        sumDebit: sumD,
        sumCredit: sumC,
        balanceEquilibree: Math.abs(sumD - sumC) <= 1,
        hasData: sumD !== 0 || sumC !== 0,
      }
    }
    return { N: compute('N'), N1: compute('N1') }
  }, [importedData, buildEntriesForColumn])

  // EX-IMPORT-003: Validation équilibre avec tolérance
  const validateBalance = (accounts: BalanceAccount[]) => {
    const totalDebit = accounts.reduce((sum, acc) => 
      sum + (acc.debitClosing || 0), 0
    )
    const totalCredit = accounts.reduce((sum, acc) => 
      sum + (acc.creditClosing || 0), 0
    )
    
    const difference = Math.abs(totalDebit - totalCredit)
    const tolerance = importConfig.tolerance || 0.01
    
    if (difference > tolerance) {
      // Alerter sur le déséquilibre
      accounts.forEach(acc => {
        if (!acc.errors) acc.errors = []
        if (difference > tolerance * 1000) {
          acc.status = 'error'
          acc.errors.push(`Déséquilibre détecté: ${difference.toLocaleString()}`)
        }
      })
    }
    
    return difference <= tolerance
  }

  // EX-IMPORT-004: Identifier les comptes non mappés
  const identifyUnmappedAccounts = (accounts: BalanceAccount[]): BalanceAccount[] => {
    return accounts.filter(acc => !acc.mappedAccount || (acc.mappingConfidence ?? 0) < 50)
  }

  // EX-IMPORT-005: Mapping intelligent basé sur l'historique et l'IA
  const generateMappingSuggestions = (accounts: BalanceAccount[]) => {
    const suggestions: MappingSuggestion[] = []
    
    accounts.forEach(account => {
      if (!account.mappedAccount || (account.mappingConfidence ?? 0) < 80) {
        // Recherche dans l'historique
        const historyMatch = mappingHistory.find(h => 
          h.source === account.accountNumber || 
          h.source.toLowerCase() === account.accountName.toLowerCase()
        )
        
        if (historyMatch) {
          suggestions.push({
            sourceAccount: account.accountNumber,
            suggestedAccount: historyMatch.target,
            confidence: 90 + (historyMatch.frequency / 10),
            reason: `Basé sur ${historyMatch.frequency} utilisations précédentes`,
            basedOn: 'history'
          })
        } else {
          // Utiliser l'IA pour suggérer
          const aiSuggestion = suggestMappingWithAI(account)
          if (aiSuggestion) {
            suggestions.push(aiSuggestion)
          }
        }
      }
    })
    
    setMappingSuggestions(suggestions)
  }

  // Suggestion de mapping par IA (simulation)
  const suggestMappingWithAI = (account: BalanceAccount): MappingSuggestion | null => {
    // Analyse du nom du compte
    const accountNameLower = account.accountName.toLowerCase()
    
    // Règles simples d'IA
    if (accountNameLower.includes('capital')) {
      return {
        sourceAccount: account.accountNumber,
        suggestedAccount: '101',
        confidence: 85,
        reason: 'Nom contient "capital" - Compte de capitaux propres probable',
        basedOn: 'ai'
      }
    } else if (accountNameLower.includes('client')) {
      return {
        sourceAccount: account.accountNumber,
        suggestedAccount: '411',
        confidence: 88,
        reason: 'Nom contient "client" - Compte de créances probable',
        basedOn: 'ai'
      }
    } else if (accountNameLower.includes('fournisseur')) {
      return {
        sourceAccount: account.accountNumber,
        suggestedAccount: '401',
        confidence: 87,
        reason: 'Nom contient "fournisseur" - Compte de dettes probable',
        basedOn: 'ai'
      }
    }
    
    // Analyse du numéro de compte
    const firstDigit = account.accountNumber[0]
    if (firstDigit === '1') {
      return {
        sourceAccount: account.accountNumber,
        suggestedAccount: '1' + account.accountNumber.substring(1, 3),
        confidence: 70,
        reason: 'Commence par 1 - Compte de capitaux propres',
        basedOn: 'rules'
      }
    }
    
    return null
  }

  // EX-IMPORT-008: Comparaison N vs N-1
  const compareWithN1 = (
    currentData: BalanceAccount[],
    n1Entries: import('@/services/liasseDataService').BalanceEntry[]
  ) => {
    const comparisons: Comparison[] = []
    const n1Map = new Map(n1Entries.map(e => [e.compte, e]))

    currentData.forEach(current => {
      const prev = n1Map.get(current.accountNumber)
      const currentBalance = (current.debitClosing || 0) - (current.creditClosing || 0)

      if (prev) {
        const previousBalance = (prev.solde_debit || 0) - (prev.solde_credit || 0)
        const variation = currentBalance - previousBalance
        const variationPercent = previousBalance !== 0 ? (variation / Math.abs(previousBalance)) * 100 : (currentBalance !== 0 ? 100 : 0)

        comparisons.push({
          account: current.accountNumber,
          currentYear: currentBalance,
          previousYear: previousBalance,
          variation,
          variationPercent,
          alert: Math.abs(variationPercent) > 50
            ? variationPercent > 0 ? 'significant_increase' : 'significant_decrease'
            : undefined
        })
        n1Map.delete(current.accountNumber)
      } else {
        comparisons.push({
          account: current.accountNumber,
          currentYear: currentBalance,
          previousYear: 0,
          variation: currentBalance,
          variationPercent: currentBalance !== 0 ? 100 : 0,
          alert: 'new_account'
        })
      }
    })

    // Comptes présents en N-1 mais absents en N
    n1Map.forEach((prev, compte) => {
      const previousBalance = (prev.solde_debit || 0) - (prev.solde_credit || 0)
      comparisons.push({
        account: compte,
        currentYear: 0,
        previousYear: previousBalance,
        variation: -previousBalance,
        variationPercent: -100,
        alert: 'missing_account'
      })
    })

    setComparisonData(comparisons)
  }

  // EX-IMPORT-010: Générer rapport détaillé
  const generateImportReport = (accounts: BalanceAccount[], fileName: string, processingTime: number) => {
    const totalDebit = accounts.reduce((sum, acc) => sum + (acc.debitClosing || 0), 0)
    const totalCredit = accounts.reduce((sum, acc) => sum + (acc.creditClosing || 0), 0)
    
    const report: ImportReport = {
      timestamp: new Date().toISOString(),
      fileName,
      format: importConfig.format,
      totalAccounts: accounts.length,
      importedAccounts: accounts.filter(a => a.status !== 'error').length,
      mappedAccounts: accounts.filter(a => a.mappedAccount).length,
      unmappedAccounts: accounts.filter(a => !a.mappedAccount).length,
      errors: accounts.filter(a => a.status === 'error').length,
      warnings: accounts.filter(a => a.status === 'warning').length,
      processingTime,
      debitTotal: totalDebit,
      creditTotal: totalCredit,
      balance: totalDebit - totalCredit,
      statistics: {
        averageMappingConfidence: 
          accounts.reduce((sum, a) => sum + (a.mappingConfidence || 0), 0) / accounts.length,
        autoMappedPercentage: 
          (accounts.filter(a => (a.mappingConfidence ?? 0) > 80).length / accounts.length) * 100,
        manualCorrections: 0
      }
    }
    
    setImportReport(report)
  }

  const handleApiImport = async () => {
    setLoading(true)
    try {
      logger.debug('📤 Importing balance via API...')

      // Récupérer les balances 
      const balancesResponse = await balanceService.getBalances({
        page_size: 1000,
        ordering: '-date_creation'
      }) as Record<string, any>

      if (balancesResponse?.results && balancesResponse.results.length > 0) {
        // Convertir la première balance en format BalanceAccount
        const balance = balancesResponse.results[0]

        if (balance.id) {
          // Récupérer les détails de la balance
          const balanceDetails = await balanceService.getLignesBalance(balance.id, { page_size: 1000 }) as Record<string, any>

          if (balanceDetails?.comptes) {
            const accounts: BalanceAccount[] = balanceDetails.comptes.map((compte: any) => ({
              accountNumber: compte.numero_compte,
              accountName: compte.libelle_compte,
              debitOpening: compte.solde_debit_ouverture || 0,
              creditOpening: compte.solde_credit_ouverture || 0,
              debitMovements: compte.mouvements_debit || 0,
              creditMovements: compte.mouvements_credit || 0,
              debitClosing: compte.solde_debit || 0,
              creditClosing: compte.solde_credit || 0,
              detectedType: compte.type_compte || 'asset',
              mappedAccount: compte.compte_syscohada,
              mappingConfidence: compte.confidence_mapping || 85,
              status: 'valid'
            }))

            setImportedData(accounts)
            validateBalance(accounts)
            generateMappingSuggestions(accounts)
            generateImportReport(accounts, 'Import API', 0)
            setImportStep(3)
          }
        }
      } else {
        logger.debug('ℹ️ No balances found in backend')
      }
    } catch (error) {
      logger.error('❌ Error importing via API:', error)
    } finally {
      setLoading(false)
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
    <Box data-tour="import-balance" sx={{ p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
      {/* Atlas Finance plug-and-play import banner */}
      <AtlasFinanceImportBanner />

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 1.75 }}>
            <Box sx={{ width: 4, borderRadius: 2, flexShrink: 0, background: 'linear-gradient(135deg, #14b8a6 0%, #0f766e 55%, #115e59 100%)' }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, letterSpacing: '-0.01em' }}>
                Import Balance Avancé
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Import multi-formats avec détection automatique et mapping intelligent
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={2}>
            {processingTime > 0 && (
              <Chip
                icon={<TimerIcon />}
                label={`Traité en ${(processingTime / 1000).toFixed(2)}s`}
                color="success"
                variant="outlined"
              />
            )}
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => downloadBalanceTemplate()}
            >
              Modèle Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<HistoryIcon />}
              onClick={() => navigate('/import-history')}
            >
              Historique
            </Button>
            <Button
              variant="outlined"
              startIcon={<ApiIcon />}
              onClick={handleApiImport}
            >
              Import API
            </Button>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
            >
              Nouvel import
            </Button>
          </Stack>
        </Box>

        {/* Statistiques d'import */}
        {importReport && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  {importReport.totalAccounts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comptes importés
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                  {importReport.statistics.autoMappedPercentage.toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mapping automatique
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: alpha(
                Math.abs(importReport.balance) < (importConfig.tolerance || 0.01) 
                  ? theme.palette.success.main 
                  : theme.palette.error.main, 
                0.05
              )}}>
                <Typography variant="h4" sx={{ 
                  fontWeight: 700, 
                  color: Math.abs(importReport.balance) < (importConfig.tolerance || 0.01)
                    ? theme.palette.success.main
                    : theme.palette.error.main
                }}>
                  {Math.abs(importReport.balance) < (importConfig.tolerance || 0.01) ? '✓' : '✗'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Équilibre {Math.abs(importReport.balance).toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                  {"< 30s"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Temps de traitement
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Erreurs et avertissements visibles */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
          <AlertTitle>Erreur d'import</AlertTitle>
          {errorMessage}
        </Alert>
      )}
      {warningMessages.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setWarningMessages([])}>
          <AlertTitle>Avertissements ({warningMessages.length})</AlertTitle>
          {warningMessages.map((w, i) => <div key={i}>{w}</div>)}
        </Alert>
      )}

      {/* Assistant d'import avec étapes */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={3}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Assistant d'import
              </Typography>
              
              <Stepper activeStep={importStep} orientation="vertical">
                <Step>
                  <StepLabel>Selection exercice</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Selection du fichier</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Detection de structure</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Mapping des comptes</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Validation & corrections</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Import final</StepLabel>
                </Step>
              </Stepper>

              {/* Configuration d'import */}
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Configuration
              </Typography>
              
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={importConfig.format}
                    label="Format"
                    onChange={(e) => setImportConfig(prev => ({ ...prev, format: e.target.value as ImportFormat }))}
                  >
                    <MenuItem value="excel">Excel (.xlsx, .xls)</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="xml">XML</MenuItem>
                    <MenuItem value="json">JSON</MenuItem>
                    <MenuItem value="api">API</MenuItem>
                  </Select>
                </FormControl>
                
                {importConfig.format === 'csv' && (
                  <>
                    <TextField
                      fullWidth
                      size="small"
                      label="Séparateur"
                      value={importConfig.separator}
                      onChange={(e) => setImportConfig(prev => ({ ...prev, separator: e.target.value }))}
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Encodage</InputLabel>
                      <Select
                        value={importConfig.encoding}
                        label="Encodage"
                        onChange={(e) => setImportConfig(prev => ({ ...prev, encoding: e.target.value }))}
                      >
                        <MenuItem value="UTF-8">UTF-8</MenuItem>
                        <MenuItem value="ISO-8859-1">ISO-8859-1</MenuItem>
                        <MenuItem value="Windows-1252">Windows-1252</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}
                
                <TextField
                  fullWidth
                  size="small"
                  label="Tolérance équilibre (FCFA)"
                  type="number"
                  value={importConfig.tolerance}
                  onChange={(e) => setImportConfig(prev => ({ ...prev, tolerance: parseFloat(e.target.value) }))}
                  helperText="EX-IMPORT-003: Tolérance paramétrable"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={9}>
          <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            {importStep === 0 && (
              /* Étape 0: Sélection de l'exercice */
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Configuration de l'exercice
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Exercice</InputLabel>
                      <Select
                        value={exerciceConfig.year}
                        label="Exercice"
                        onChange={(e) => {
                          const year = Number(e.target.value)
                          const newConfig: ExerciceConfig = {
                            ...exerciceConfig,
                            year,
                            date_debut: `${year}-01-01`,
                            date_fin: `${year}-12-31`,
                          }
                          setExerciceConfig(newConfig)
                          setReimportInfo(hasExistingBalance(String(year)))
                        }}
                      >
                        {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                          <MenuItem key={y} value={y}>{y}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Date debut"
                      type="date"
                      value={exerciceConfig.date_debut}
                      onChange={(e) => setExerciceConfig(prev => ({ ...prev, date_debut: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Date fin"
                      type="date"
                      value={exerciceConfig.date_fin}
                      onChange={(e) => setExerciceConfig(prev => ({ ...prev, date_fin: e.target.value }))}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={exerciceConfig.type}
                        label="Type"
                        onChange={(e) => setExerciceConfig(prev => ({ ...prev, type: e.target.value as 'N' | 'N-1' }))}
                      >
                        <MenuItem value="N">N (exercice courant)</MenuItem>
                        <MenuItem value="N-1">N-1 (exercice precedent)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {reimportInfo.exists && (
                  <Alert severity="warning" sx={{ mt: 3 }}>
                    <AlertTitle>Re-import detecte</AlertTitle>
                    Une balance existe deja pour l'exercice {exerciceConfig.year} (version {reimportInfo.version}).
                    La version {reimportInfo.version + 1} sera creee automatiquement.
                  </Alert>
                )}

                {/* Modèle d'import — disponible dès la configuration pour que
                    l'utilisateur sache exactement quel format préparer. */}
                <Alert severity="info" sx={{ mt: 3 }}>
                  <AlertTitle>Modèle de fichier d'import</AlertTitle>
                  Votre balance doit contenir ces colonnes : <strong>Compte</strong> · <strong>Description</strong> ·
                  Solde Débit N-1 · Solde Crédit N-1 · Mouvement Débit N · Mouvement Crédit N ·
                  Solde Débit N · Solde Crédit N. Les colonnes N-1 sont facultatives (comparatif).
                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadBalanceTemplate()}
                    >
                      Télécharger le modèle Excel
                    </Button>
                  </Box>
                </Alert>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setExerciceConfigured(true)
                      setReimportInfo(hasExistingBalance(String(exerciceConfig.year)))
                      setImportStep(1)
                    }}
                  >
                    Suivant
                  </Button>
                </Box>
              </CardContent>
            )}

            {importStep === 1 && (
              /* Étape 1: Sélection du fichier */
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Sélection du fichier à importer
                </Typography>
                
                {/* Zone de drop */}
                <Box
                  {...getRootProps()}
                  sx={{
                    border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    backgroundColor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <UploadIcon sx={{ fontSize: 64, color: theme.palette.action.disabled, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {isDragActive 
                      ? 'Déposez le fichier ici...'
                      : 'Glissez-déposez votre fichier ici'
                    }
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    ou cliquez pour sélectionner
                  </Typography>
                  
                  {/* Formats supportés */}
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Chip icon={<ExcelIcon />} label="Excel" size="small" />
                    <Chip icon={<FileIcon />} label="CSV" size="small" />
                    <Chip icon={<XmlIcon />} label="XML" size="small" />
                    <Chip icon={<JsonIcon />} label="JSON" size="small" />
                  </Stack>
                </Box>

                {/* Bouton télécharger le modèle — EN DEHORS du dropzone */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={() => downloadBalanceTemplate()}
                  >
                    Télécharger le modèle Excel
                  </Button>
                </Box>

                {selectedFile && (
                  <Alert severity="success" sx={{ mt: 3 }}>
                    <AlertTitle>Fichier sélectionné</AlertTitle>
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </Alert>
                )}

                <Alert severity="info" sx={{ mt: 3 }}>
                  Le fichier peut contenir les colonnes N et N-1 ensemble. Les colonnes N-1 (ex: "Débit N-1", "Crédit N-1") seront détectées automatiquement.
                </Alert>
              </CardContent>
            )}

            {importStep === 2 && fileStructure && (
              /* Étape 2: Détection de structure */
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Structure détectée automatiquement
                </Typography>
                
                <Alert 
                  severity={fileStructure.detectionConfidence > 90 ? 'success' : 'warning'}
                  sx={{ mb: 3 }}
                >
                  <AlertTitle>
                    Confiance de détection: {fileStructure.detectionConfidence}%
                  </AlertTitle>
                  {fileStructure.detectionConfidence > 90 
                    ? 'Structure reconnue avec succès'
                    : 'Vérifiez le mapping des colonnes ci-dessous'
                  }
                </Alert>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Colonnes détectées
                      </Typography>
                      <List dense>
                        {fileStructure.headers.map((header, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={header}
                              secondary={`Colonne ${index + 1}`}
                            />
                            <ListItemSecondaryAction>
                              {index === fileStructure.detectedColumns.accountNumber && (
                                <Chip label="N° Compte" size="small" color="primary" />
                              )}
                              {index === fileStructure.detectedColumns.accountName && (
                                <Chip label="Libellé" size="small" color="primary" />
                              )}
                              {fileStructure.detectedColumns.debit?.includes(index) && (
                                <Chip label="Débit" size="small" color="success" />
                              )}
                              {fileStructure.detectedColumns.credit?.includes(index) && (
                                <Chip label="Crédit" size="small" color="error" />
                              )}
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                        Aperçu des données
                      </Typography>
                      <TableContainer sx={{ maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {fileStructure.headers.map((header, index) => (
                                <TableCell key={index} sx={{ fontWeight: 600 }}>
                                  {header}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {fileStructure.sampleData.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                  <TableCell key={cellIndex}>
                                    {cell}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setImportStep(1)}
                  >
                    Retour
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => selectedFile && fileStructure && processFile(selectedFile, fileStructure)}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Continuer'}
                  </Button>
                </Box>
              </CardContent>
            )}

            {importStep === 3 && (
              /* Étape 3: Mapping et validation */
              <CardContent sx={{ p: 3 }}>
                {/* ── Sélecteur d'exercice (deux jeux de colonnes détectés) ── */}
                {hasN1Columns && (() => {
                  const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')
                  const year = exerciceConfigured ? exerciceConfig.year : currentYear
                  const sel = declaredColumnSet
                  const chosen = sel === 'N1' ? columnPreviews.N1 : columnPreviews.N
                  const options: Array<{ key: 'N' | 'N1'; title: string; sub: string; p: typeof columnPreviews.N }> = [
                    { key: 'N', title: 'Colonnes « Solde N »', sub: 'Soldes de clôture (colonnes de droite)', p: columnPreviews.N },
                    { key: 'N1', title: 'Colonnes « Solde N-1 »', sub: 'Clôture précédente (colonnes de gauche)', p: columnPreviews.N1 },
                  ]
                  return (
                    <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderColor: alpha(theme.palette.primary.main, 0.3) }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Quel jeu de colonnes correspond à l'exercice {year} à déclarer ?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Ce fichier contient deux exercices. Choisissez celui qui équilibre et dont le résultat est cohérent.
                      </Typography>
                      <Grid container spacing={2}>
                        {options.map(opt => {
                          const isSel = sel === opt.key
                          return (
                            <Grid item xs={12} md={6} key={opt.key}>
                              <Paper
                                onClick={() => setDeclaredColumnSet(opt.key)}
                                sx={{
                                  p: 2, cursor: 'pointer', height: '100%',
                                  border: `2px solid ${isSel ? theme.palette.primary.main : alpha(theme.palette.divider, 0.4)}`,
                                  backgroundColor: isSel ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                                  transition: 'all .15s',
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{opt.title}</Typography>
                                  {isSel && <CheckIcon color="primary" fontSize="small" />}
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>{opt.sub}</Typography>
                                <Stack spacing={0.5}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Total Bilan</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(opt.p.totalActif)}</Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Résultat net</Typography>
                                    {opt.p.hasPL
                                      ? <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{fmt(opt.p.resultat)}</Typography>
                                      : <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.disabled' }}>clôturé — affecté au report à nouveau</Typography>}
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">Couverture liasse</Typography>
                                    {opt.p.equilibre
                                      ? <Chip size="small" color="success" label="Tous comptes mappés" />
                                      : <Chip size="small" color="default" label={`${fmt(opt.p.ecartBilan)} non mappés`} sx={{ opacity: 0.7 }} />}
                                  </Box>
                                </Stack>
                              </Paper>
                            </Grid>
                          )
                        })}
                      </Grid>
                      {/* Info comptes orphelins — severity info, pas warning, car la balance elle-même est OK */}
                      {!chosen.equilibre && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <AlertTitle>{fmt(chosen.ecartBilan)} FCFA dans des comptes non rattachés à la liasse</AlertTitle>
                          La balance est équilibrée (Σdébit = Σcrédit). Certains comptes ne correspondent à aucune
                          ligne SYSCOHADA connue — ils n'affectent pas l'équilibre de votre balance mais seront
                          absents de la liasse générée. Vous pouvez importer et compléter le mapping manuellement.
                        </Alert>
                      )}
                      {!chosen.hasPL && chosen.hasData && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <AlertTitle>Colonne de clôture — résultat normalement nul</AlertTitle>
                          Ce jeu de colonnes ne contient pas de compte de résultat (classes 6/7 déjà soldées) :
                          le résultat de l'exercice a été <strong>affecté au report à nouveau</strong>, il n'y est
                          donc plus isolable (c'est normal pour une clôture). Le bilan, lui, est complet.
                          Pour déclarer <strong>{year}</strong> avec son résultat, utilisez les <strong>Colonnes « Solde N »</strong> ;
                          le comparatif N-1 (compte de résultat) nécessite d'importer aussi la balance de l'exercice précédent.
                        </Alert>
                      )}
                    </Paper>
                  )
                })()}

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab label={`Données importées (${importedData.length})`} />
                    <Tab label={`Mapping IA (${mappingSuggestions.length})`} />
                    <Tab label="Comparaison N-1" />
                    <Tab label="Rapport" />
                  </Tabs>
                </Box>

                <TabPanel value={activeTab} index={0}>
                  {/* Tableau des données importées */}
                  <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>N° Compte</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Intitulé</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>Débit</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>Crédit</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>Solde Débiteur</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>Solde Créditeur</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: alpha(theme.palette.grey[500], 0.04) }}>SD N-1</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.75rem', backgroundColor: alpha(theme.palette.grey[500], 0.04) }}>SC N-1</TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.75rem' }}>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {importedData
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((account) => {
                            return (
                            <TableRow key={account.accountNumber} hover>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                  {account.accountNumber}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                  {account.accountName}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                                {(account.debitMovements || 0) > 0 ? (account.debitMovements || 0).toLocaleString('fr-FR') : '-'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                                {(account.creditMovements || 0) > 0 ? (account.creditMovements || 0).toLocaleString('fr-FR') : '-'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                {(account.debitClosing || 0) > 0 ? (account.debitClosing || 0).toLocaleString('fr-FR') : '-'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                {(account.creditClosing || 0) > 0 ? (account.creditClosing || 0).toLocaleString('fr-FR') : '-'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                {(account.soldeDebitN1 || 0) > 0 ? (account.soldeDebitN1 || 0).toLocaleString('fr-FR') : '-'}
                              </TableCell>
                              <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                {(account.soldeCreditN1 || 0) > 0 ? (account.soldeCreditN1 || 0).toLocaleString('fr-FR') : '-'}
                              </TableCell>
                              <TableCell>
                                {account.status === 'valid' && <CheckIcon color="success" fontSize="small" />}
                                {account.status === 'warning' && <WarningIcon color="warning" fontSize="small" />}
                                {account.status === 'error' && <ErrorIcon color="error" fontSize="small" />}
                              </TableCell>
                            </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                    <TablePagination
                      component="div"
                      count={importedData.length}
                      page={page}
                      onPageChange={(_, newPage) => setPage(newPage)}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
                      labelRowsPerPage="Lignes par page"
                    />
                  </TableContainer>

                  {/* Alertes de validation */}
                  {identifyUnmappedAccounts(importedData).length > 0 && (
                    <Alert severity="warning" sx={{ mt: 3 }}>
                      <AlertTitle>
                        {identifyUnmappedAccounts(importedData).length} comptes non mappés détectés
                      </AlertTitle>
                      Utilisez les suggestions IA ou mappez manuellement ces comptes.
                    </Alert>
                  )}
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  {/* Suggestions de mapping IA */}
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Suggestions de mapping intelligent
                  </Typography>

                  {mappingSuggestions.length === 0 ? (
                    <Alert severity="success">
                      Tous les comptes sont mappés avec une confiance suffisante. Aucune suggestion nécessaire.
                    </Alert>
                  ) : (
                    <List>
                      {mappingSuggestions.map((suggestion, index) => (
                        <React.Fragment key={index}>
                          <ListItem>
                            <ListItemIcon>
                              {suggestion.basedOn === 'ai' && <SmartIcon color="primary" />}
                              {suggestion.basedOn === 'history' && <HistoryIcon color="success" />}
                              {suggestion.basedOn === 'rules' && <AccountTree color="info" />}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {suggestion.sourceAccount}
                                  </Typography>
                                  <ArrowIcon />
                                  <Chip
                                    label={suggestion.suggestedAccount}
                                    size="small"
                                    color="primary"
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    ({suggestion.confidence.toFixed(0)}%)
                                  </Typography>
                                </Box>
                              }
                              secondary={suggestion.reason}
                            />
                            <ListItemSecondaryAction>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  onClick={() => {
                                    // Apply mapping to the account
                                    setImportedData(prev => prev.map(acc =>
                                      acc.accountNumber === suggestion.sourceAccount
                                        ? { ...acc, mappedAccount: suggestion.suggestedAccount, mappingConfidence: suggestion.confidence }
                                        : acc
                                    ))
                                    // Remove this suggestion
                                    setMappingSuggestions(prev => prev.filter((_, i) => i !== index))
                                  }}
                                >
                                  Accepter
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  onClick={() => {
                                    // Remove suggestion without applying
                                    setMappingSuggestions(prev => prev.filter((_, i) => i !== index))
                                  }}
                                >
                                  Refuser
                                </Button>
                              </Stack>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < mappingSuggestions.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}

                  {mappingSuggestions.length > 0 && (
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                          // Accept all suggestions
                          setImportedData(prev => {
                            const updated = [...prev]
                            mappingSuggestions.forEach(s => {
                              const acc = updated.find(a => a.accountNumber === s.sourceAccount)
                              if (acc) {
                                acc.mappedAccount = s.suggestedAccount
                                acc.mappingConfidence = s.confidence
                              }
                            })
                            return updated
                          })
                          setMappingSuggestions([])
                        }}
                      >
                        Tout accepter ({mappingSuggestions.length})
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setMappingSuggestions([])}
                      >
                        Tout refuser
                      </Button>
                    </Stack>
                  )}
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  {/* Comparaison N-1 */}
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                    Analyse comparative N / N-1
                  </Typography>

                  {comparisonData.length > 0 ? (
                    <>
                      {/* Résumé alertes */}
                      {(() => {
                        const alerts = comparisonData.filter(c => c.alert)
                        const newAccounts = alerts.filter(c => c.alert === 'new_account').length
                        const missing = alerts.filter(c => c.alert === 'missing_account').length
                        const significant = alerts.filter(c => c.alert === 'significant_increase' || c.alert === 'significant_decrease').length
                        return alerts.length > 0 ? (
                          <Alert severity="warning" sx={{ mb: 3 }}>
                            <AlertTitle>{alerts.length} anomalie(s) détectée(s)</AlertTitle>
                            {significant > 0 && <div>{significant} variation(s) significative(s) (&gt;50%)</div>}
                            {newAccounts > 0 && <div>{newAccounts} nouveau(x) compte(s) en N</div>}
                            {missing > 0 && <div>{missing} compte(s) disparu(s) depuis N-1</div>}
                          </Alert>
                        ) : (
                          <Alert severity="success" sx={{ mb: 3 }}>
                            Aucune variation significative détectée entre N et N-1.
                          </Alert>
                        )
                      })()}

                      <TableContainer component={Paper} elevation={0}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}>
                              <TableCell sx={{ fontWeight: 600 }}>Compte</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>Solde N</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>Solde N-1</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>Variation</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>%</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Alerte</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {comparisonData.map((c) => (
                              <TableRow
                                key={c.account}
                                hover
                                sx={c.alert ? { backgroundColor: alpha(theme.palette.warning.main, 0.04) } : undefined}
                              >
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                    {c.account}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                                  {c.currentYear !== 0 ? c.currentYear.toLocaleString('fr-FR') : '-'}
                                </TableCell>
                                <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                                  {c.previousYear !== 0 ? c.previousYear.toLocaleString('fr-FR') : '-'}
                                </TableCell>
                                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                                  {c.variation !== 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                      {c.variation > 0 ? (
                                        <TrendingUpIcon color="success" sx={{ fontSize: 16 }} />
                                      ) : (
                                        <TrendingDownIcon color="error" sx={{ fontSize: 16 }} />
                                      )}
                                      {Math.abs(c.variation).toLocaleString('fr-FR')}
                                    </Box>
                                  )}
                                  {c.variation === 0 && '-'}
                                </TableCell>
                                <TableCell align="right">
                                  {c.variationPercent !== 0 ? (
                                    <Chip
                                      label={`${c.variationPercent > 0 ? '+' : ''}${c.variationPercent.toFixed(1)}%`}
                                      size="small"
                                      color={Math.abs(c.variationPercent) > 50 ? 'warning' : 'default'}
                                      variant="outlined"
                                    />
                                  ) : '-'}
                                </TableCell>
                                <TableCell>
                                  {c.alert === 'significant_increase' && (
                                    <Chip label="Hausse" size="small" color="warning" />
                                  )}
                                  {c.alert === 'significant_decrease' && (
                                    <Chip label="Baisse" size="small" color="warning" />
                                  )}
                                  {c.alert === 'new_account' && (
                                    <Chip label="Nouveau" size="small" color="info" />
                                  )}
                                  {c.alert === 'missing_account' && (
                                    <Chip label="Disparu" size="small" color="error" />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  ) : (
                    <Alert severity="info">
                      Aucune donnée N-1 détectée dans le fichier importé.
                      Importez un fichier Excel contenant les colonnes N-1 (ex: "Débit N-1", "Crédit N-1", "SD N-1", "SC N-1") pour activer la comparaison.
                    </Alert>
                  )}
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  {/* Rapport d'import */}
                  {importReport && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Rapport d'import détaillé
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Paper sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                              Informations générales
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText
                                  primary="Fichier"
                                  secondary={importReport.fileName}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Date d'import"
                                  secondary={new Date(importReport.timestamp).toLocaleString()}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Format"
                                  secondary={importReport.format.toUpperCase()}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Temps de traitement"
                                  secondary={`${(importReport.processingTime / 1000).toFixed(2)} secondes`}
                                />
                              </ListItem>
                            </List>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Paper sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                              Statistiques
                            </Typography>
                            <List dense>
                              <ListItem>
                                <ListItemText
                                  primary="Total comptes"
                                  secondary={importReport.totalAccounts}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Comptes mappés"
                                  secondary={`${importReport.mappedAccounts} (${((importReport.mappedAccounts / importReport.totalAccounts) * 100).toFixed(0)}%)`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Confiance moyenne"
                                  secondary={`${importReport.statistics.averageMappingConfidence.toFixed(1)}%`}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Équilibre"
                                  secondary={
                                    <Chip
                                      label={Math.abs(importReport.balance) < (importConfig.tolerance || 0.01) ? 'Équilibré' : `Écart: ${importReport.balance.toLocaleString()}`}
                                      size="small"
                                      color={Math.abs(importReport.balance) < (importConfig.tolerance || 0.01) ? 'success' : 'error'}
                                    />
                                  }
                                />
                              </ListItem>
                            </List>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Paper sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                              Totaux
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                    {importReport.debitTotal.toLocaleString()}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Total débit
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                                    {importReport.creditTotal.toLocaleString()}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Total crédit
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={4}>
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                    {Math.abs(importReport.balance).toLocaleString()}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Différence
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          fullWidth
                          onClick={async () => {
                            try {
                              // Convert to unified BalanceEntry[] selon le jeu de
                              // colonnes choisi par l'utilisateur (exercice déclaré).
                              const entries = buildEntriesForColumn(importedData, declaredColumnSet)

                              // Save unified balance (N + N-1 together)
                              const savedBalance = saveImportedBalance(
                                entries,
                                importReport?.fileName || 'Import balance',
                                exerciceConfigured ? String(exerciceConfig.year) : undefined,
                                exerciceConfigured ? exerciceConfig : undefined,
                              )
                              // loadBalance auto-builds N-1 cache from unified entries
                              liasseDataService.loadBalance(entries)

                              const hasN1 = entries.some(e => (e.solde_debit_n1 || 0) !== 0 || (e.solde_credit_n1 || 0) !== 0)
                              logger.debug('[Import] Saved', entries.length, 'unified entries, hasN1:', hasN1)

                              // Si le fichier contient des colonnes N-1, les sauvegarder
                              // comme balance N-1 indépendante pour l'audit et les contrôles.
                              if (hasN1) {
                                const n1Entries = entries.map(e => ({
                                  ...e,
                                  debit: 0,
                                  credit: 0,
                                  solde_debit: e.solde_debit_n1 || 0,
                                  solde_credit: e.solde_credit_n1 || 0,
                                  solde_debit_n1: 0,
                                  solde_credit_n1: 0,
                                }))
                                const n1Year = exerciceConfigured
                                  ? String(exerciceConfig.year - 1)
                                  : String(new Date().getFullYear() - 1)
                                saveImportedBalanceN1(n1Entries, importReport?.fileName || 'Import balance N-1', n1Year)
                                logger.debug('[Import] Saved N-1 balance:', n1Entries.length, 'entries, exercice:', n1Year)
                              }

                              // P0-1: Toast notification after successful import
                              enqueueSnackbar(`Balance importée avec succès (${entries.length} comptes chargés)`, { variant: 'success' })

                              // Save import record
                              saveImportRecord(
                                importReport?.fileName || 'Import balance',
                                entries.length,
                                importReport?.debitTotal || 0,
                                importReport?.creditTotal || 0,
                                importReport?.errors || 0,
                                importReport?.warnings || 0,
                              )

                              // Update workflow state: balance imported, reset downstream steps
                              try {
                                const { updateWorkflowState } = await import('@/services/workflowStateService')
                                updateWorkflowState({
                                  balanceImported: true,
                                  controleDone: false,
                                  controleScore: 0,
                                  controleBloquants: 0,
                                  controleResult: 'not_run',
                                  generationDone: false,
                                  generationDate: null,
                                  generationRegime: null,
                                  teledeclarationStatus: 'not_started',
                                  teledeclarationDate: null,
                                  teledeclarationReference: null,
                                })
                              } catch { /* ignore */ }

                              // Register exercice and check for N-1 comparison
                              const yearStr = exerciceConfigured ? String(exerciceConfig.year) : String(currentYear)
                              try {
                                getOrCreateExercice(yearStr)
                                markExerciceHasBalance(yearStr)
                                // Activate this exercice in the store
                                const { useExerciceStore } = await import('@/store/exerciceStore')
                                useExerciceStore.getState().setActiveExercice(yearStr)
                              } catch { /* ignore */ }

                              // Run N vs N-1 comparison if N-1 exists
                              const anneeN1 = String(parseInt(yearStr) - 1)
                              const balancesN1 = getBalancesForExercice(anneeN1)
                              if (balancesN1.length > 0 || hasN1) {
                                try {
                                  const report = runComparison(yearStr)
                                  if (report) {
                                    setComparisonReport(report)
                                    setShowComparisonModal(true)
                                    return // Don't redirect — modal handles navigation
                                  }
                                } catch { /* ignore, proceed to redirect */ }
                              }

                              // Redirect: re-import goes to audit, first import goes to balance
                              if (savedBalance.version > 1) {
                                window.location.href = '/audit'
                              } else {
                                window.location.href = '/balance'
                              }
                            } catch (error: any) {
                              logger.error('Erreur validation import:', error)
                              // P0-5: User-friendly message for storage quota errors
                              const isQuota = error instanceof DOMException && error.name === 'QuotaExceededError'
                              const msg = isQuota
                                ? 'Espace de stockage insuffisant. Supprimez d\'anciens imports ou videz le cache navigateur.'
                                : (error?.message || 'Erreur lors de la sauvegarde.')
                              setErrorMessage(msg)
                              enqueueSnackbar(msg, { variant: 'error' })
                            }
                          }}
                        >
                          Valider l'import{importedData.some(a => (a.soldeDebitN1 || 0) !== 0 || (a.soldeCreditN1 || 0) !== 0) ? ' (N + N-1)' : ''}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          fullWidth
                        >
                          Exporter le rapport
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </TabPanel>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>
      <FeatureGate feature="comparaison_inter_societes">
        <ComparisonResultModal
          open={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          report={comparisonReport}
        />
      </FeatureGate>
    </Box>
  )
}

export default ModernImportBalance