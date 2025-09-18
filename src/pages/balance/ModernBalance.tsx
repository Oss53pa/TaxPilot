/**
 * Module Balance Moderne - Gestion Comptable Professionnelle SYSCOHADA
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Alert,
  Skeleton,
  useTheme,
  alpha,
  Stack,
  Divider,
  Tooltip,
  Avatar,
  LinearProgress,
} from '@mui/material'
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  CheckCircle as ValidatedIcon,
  Warning as WarningIcon,
  Schedule as PendingIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { balanceService } from '@/services/balanceService'
import { entrepriseService } from '@/services/entrepriseService'

interface BalanceEntry {
  id: string
  account: string
  accountName: string
  class: string
  debitOpening: number
  creditOpening: number
  debitMovement: number
  creditMovement: number
  debitClosing: number
  creditClosing: number
  status: 'validated' | 'pending' | 'error'
  lastModified: string
}

interface BalanceStats {
  totalAccounts: number
  validatedAccounts: number
  pendingAccounts: number
  errorAccounts: number
  totalDebit: number
  totalCredit: number
  balanceCheck: boolean
}

const ModernBalance: React.FC = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [balanceData, setBalanceData] = useState<BalanceEntry[]>([])
  const [filteredData, setFilteredData] = useState<BalanceEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [tabValue, setTabValue] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedEntry, setSelectedEntry] = useState<BalanceEntry | null>(null)
  const [addEntryOpen, setAddEntryOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editedEntry, setEditedEntry] = useState<BalanceEntry | null>(null)

  // Fonction de génération supprimée - remplacée par loadBalanceData
  // Les données viennent maintenant du backend via balanceService
  /*
  const generateBalanceData = (): BalanceEntry[] => {
    const classes = [
      { class: '1', name: 'Capitaux', accounts: ['101', '102', '104', '105', '106', '108', '109', '111', '112', '113', '115', '116', '118', '119', '121', '129', '131', '138', '139', '141', '142', '143', '144', '145', '146', '147', '148', '149', '151', '152', '153', '154', '155', '156', '158', '159', '161', '162', '163', '164', '165', '166', '167', '168', '169', '171', '172', '173', '174', '175', '176', '177', '178', '181', '182', '183', '184', '186', '187', '188', '191', '192', '193', '194', '195', '196', '197', '198'] },
      { class: '2', name: 'Immobilisations', accounts: ['201', '203', '204', '205', '206', '207', '208', '211', '212', '213', '214', '215', '218', '221', '222', '223', '224', '228', '231', '232', '233', '234', '235', '237', '238', '241', '242', '243', '244', '245', '246', '247', '248', '251', '252', '253', '254', '255', '258', '261', '262', '263', '264', '265', '266', '267', '268', '269', '271', '272', '273', '274', '275', '276', '277', '279', '281', '282', '283', '284', '285', '286', '287', '288'] },
      { class: '3', name: 'Stocks', accounts: ['31', '311', '312', '313', '314', '315', '316', '317', '318', '321', '322', '323', '324', '325', '326', '327', '328', '331', '332', '333', '334', '335', '336', '337', '338', '341', '342', '343', '344', '345', '346', '347', '348', '351', '352', '353', '354', '355', '356', '357', '358', '361', '362', '363', '364', '365', '366', '367', '368', '371', '372', '373', '374', '375', '376', '377', '378', '381', '382', '383', '384', '385', '386', '387', '388'] },
      { class: '4', name: 'Tiers', accounts: ['401', '402', '403', '404', '405', '408', '409', '411', '412', '413', '414', '415', '416', '417', '418', '419', '421', '422', '423', '424', '425', '426', '427', '428', '431', '432', '433', '434', '435', '436', '437', '438', '441', '442', '443', '444', '445', '446', '447', '448', '451', '452', '453', '454', '455', '456', '457', '458', '461', '462', '463', '464', '465', '466', '467', '468', '471', '472', '473', '474', '475', '476', '477', '478', '481', '482', '483', '484', '485', '486', '487', '488', '491', '492', '493', '494', '495', '496', '497', '498'] },
      { class: '5', name: 'Trésorerie', accounts: ['501', '502', '503', '504', '505', '506', '507', '508', '511', '512', '513', '514', '515', '516', '517', '518', '521', '522', '523', '524', '525', '526', '527', '528', '531', '532', '533', '534', '535', '536', '537', '538', '541', '542', '543', '544', '545', '546', '547', '548', '551', '552', '553', '554', '555', '556', '557', '558', '561', '562', '563', '564', '565', '566', '567', '568', '571', '572', '573', '574', '575', '576', '577', '578', '581', '582', '583', '584', '585', '586', '587', '588'] },
      { class: '6', name: 'Charges', accounts: ['601', '602', '603', '604', '605', '608', '609', '611', '612', '613', '614', '615', '616', '617', '618', '621', '622', '623', '624', '625', '626', '627', '628', '631', '632', '633', '634', '635', '636', '637', '638', '641', '642', '643', '644', '645', '646', '647', '648', '651', '652', '653', '654', '655', '656', '657', '658', '661', '662', '663', '664', '665', '666', '667', '668', '671', '672', '673', '674', '675', '676', '677', '678', '681', '682', '683', '684', '685', '686', '687', '688', '691', '692', '693', '694', '695', '696', '697', '698'] },
      { class: '7', name: 'Produits', accounts: ['701', '702', '703', '704', '705', '706', '707', '708', '711', '712', '713', '714', '715', '716', '717', '718', '721', '722', '723', '724', '725', '726', '727', '728', '731', '732', '733', '734', '735', '736', '737', '738', '741', '742', '743', '744', '745', '746', '747', '748', '751', '752', '753', '754', '755', '756', '757', '758', '761', '762', '763', '764', '765', '766', '767', '768', '771', '772', '773', '774', '775', '776', '777', '778', '781', '782', '783', '784', '785', '786', '787', '788', '791', '792', '793', '794', '795', '796', '797', '798'] }
    ]

    const data: BalanceEntry[] = []
    const statuses = ['validated', 'pending', 'error'] as const
    
    classes.forEach(classInfo => {
      const sampleAccounts = classInfo.accounts.slice(0, Math.floor(Math.random() * 15) + 10)
      
      sampleAccounts.forEach(account => {
        const debitOpening = Math.floor(Math.random() * 10000000)
        const creditOpening = Math.floor(Math.random() * 10000000)
        const debitMovement = Math.floor(Math.random() * 5000000)
        const creditMovement = Math.floor(Math.random() * 5000000)
        
        data.push({
          id: `${account}-${Date.now()}-${Math.random()}`,
          account,
          accountName: `${classInfo.name} - Compte ${account}`,
          class: classInfo.class,
          debitOpening,
          creditOpening,
          debitMovement,
          creditMovement,
          debitClosing: debitOpening + debitMovement,
          creditClosing: creditOpening + creditMovement,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          lastModified: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
        })
      })
    })

    return data.sort((a, b) => a.account.localeCompare(b.account))
  }

  // Calcul des statistiques
  const balanceStats: BalanceStats = useMemo(() => {
    const totalAccounts = balanceData.length
    const validatedAccounts = balanceData.filter(entry => entry.status === 'validated').length
    const pendingAccounts = balanceData.filter(entry => entry.status === 'pending').length
    const errorAccounts = balanceData.filter(entry => entry.status === 'error').length
    
    const totalDebit = balanceData.reduce((sum, entry) => sum + entry.debitClosing, 0)
    const totalCredit = balanceData.reduce((sum, entry) => sum + entry.creditClosing, 0)
    const balanceCheck = Math.abs(totalDebit - totalCredit) < 1 // Tolérance de 1 FCFA

    return {
      totalAccounts,
      validatedAccounts,
      pendingAccounts,
      errorAccounts,
      totalDebit,
      totalCredit,
      balanceCheck
    }
  }, [balanceData])

  // Initialisation des données depuis le backend
  useEffect(() => {
    loadBalanceData()
  }, [])

  const loadBalanceData = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading balance data from backend...')

      // Récupérer les entreprises et balances
      const [entreprisesResponse, balancesResponse] = await Promise.all([
        entrepriseService.getEntreprises({ page_size: 100 }),
        balanceService.getBalances({ page_size: 100 })
      ])

      const entreprises = entreprisesResponse.results || []
      const balances = balancesResponse.results || []

      // Si on a des balances, récupérer les données détaillées
      if (balances.length > 0) {
        const balanceDetails = await balanceService.getBalanceDetails(balances[0].id)

        // Convertir les données backend au format attendu
        const formattedData = formatBalanceData(balanceDetails)
        setBalanceData(formattedData)
        setFilteredData(formattedData)
      } else {
        // Si pas de données, utiliser des données par défaut
        const defaultData = generateDefaultBalanceData()
        setBalanceData(defaultData)
        setFilteredData(defaultData)
      }

      console.log('✅ Balance data loaded successfully')
    } catch (error) {
      console.error('❌ Error loading balance data:', error)
      // En cas d'erreur, utiliser des données par défaut
      const defaultData = generateDefaultBalanceData()
      setBalanceData(defaultData)
      setFilteredData(defaultData)
    } finally {
      setLoading(false)
    }
  }

  // Formater les données backend au format attendu
  const formatBalanceData = (balanceDetails: any): BalanceEntry[] => {
    if (!balanceDetails?.lignes) return generateDefaultBalanceData()

    return balanceDetails.lignes.map((ligne: any, index: number) => ({
      id: ligne.id || `${index + 1}`,
      account: ligne.numero_compte || '',
      accountName: ligne.libelle_compte || '',
      class: ligne.numero_compte?.charAt(0) || '1',
      debitOpening: ligne.solde_ouverture_debit || 0,
      creditOpening: ligne.solde_ouverture_credit || 0,
      debitMovement: ligne.mouvements_debit || 0,
      creditMovement: ligne.mouvements_credit || 0,
      debitClosing: ligne.solde_cloture_debit || 0,
      creditClosing: ligne.solde_cloture_credit || 0,
      status: ligne.validated ? 'validated' : 'pending',
      lastModified: new Date(ligne.updated_at || ligne.created_at).toLocaleDateString('fr-FR')
    }))
  }

  // Générer des données par défaut si pas de données backend
  const generateDefaultBalanceData = (): BalanceEntry[] => {
    // Garder une version simplifiée de generateBalanceData comme fallback
    return [
      {
        id: '1',
        account: '101000',
        accountName: 'Capital social',
        class: '1',
        debitOpening: 0,
        creditOpening: 50000000,
        debitMovement: 0,
        creditMovement: 0,
        debitClosing: 0,
        creditClosing: 50000000,
        status: 'validated',
        lastModified: new Date().toLocaleDateString('fr-FR')
      },
      // Quelques exemples de comptes
      {
        id: '2',
        account: '401000',
        accountName: 'Fournisseurs',
        class: '4',
        debitOpening: 1500000,
        creditOpening: 0,
        debitMovement: 500000,
        creditMovement: 2000000,
        debitClosing: 0,
        creditClosing: 500000,
        status: 'pending',
        lastModified: new Date().toLocaleDateString('fr-FR')
      }
    ]
  }

  // Filtrage des données
  useEffect(() => {
    let filtered = balanceData

    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.accountName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedClass !== 'all') {
      filtered = filtered.filter(entry => entry.class === selectedClass)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(entry => entry.status === selectedStatus)
    }

    setFilteredData(filtered)
    setPage(0)
  }, [balanceData, searchTerm, selectedClass, selectedStatus])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return theme.palette.success.main
      case 'pending': return theme.palette.warning.main
      case 'error': return theme.palette.error.main
      default: return theme.palette.grey[500]
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated': return <ValidatedIcon />
      case 'pending': return <PendingIcon />
      case 'error': return <WarningIcon />
      default: return null
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount)
  }

  // Handlers pour les modales et actions
  const handleViewDetails = (entry: BalanceEntry) => {
    setSelectedEntry(entry)
    setDetailModalOpen(true)
  }

  const handleEdit = (entry: BalanceEntry) => {
    setSelectedEntry(entry)
    setEditedEntry({ ...entry })
    setEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    if (editedEntry) {
      // Mettre à jour les données localement
      const updatedData = balanceData.map(entry => 
        entry.id === editedEntry.id ? editedEntry : entry
      )
      setBalanceData(updatedData)
      setFilteredData(updatedData)
      console.log('Sauvegarde des modifications:', editedEntry)
      // TODO: Appeler l'API pour sauvegarder les modifications
    }
    setEditModalOpen(false)
    setEditedEntry(null)
  }

  const handleCancelEdit = () => {
    setEditModalOpen(false)
    setEditedEntry(null)
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, entry: BalanceEntry) => {
    setAnchorEl(event.currentTarget)
    setSelectedEntry(entry)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const StatCard: React.FC<{ title: string; value: string | number; color: string; icon: React.ReactElement; subtitle?: string }> = 
    ({ title, value, color, icon, subtitle }) => (
    <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{ backgroundColor: alpha(color, 0.1), color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
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
              Balance comptable
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestion complète de votre balance générale SYSCOHADA
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
              Actualiser
            </Button>
            <Button variant="outlined" startIcon={<ExportIcon />}>
              Exporter
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddEntryOpen(true)}>
              Nouvelle écriture
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total comptes"
            value={balanceStats.totalAccounts}
            color={theme.palette.primary.main}
            icon={<BalanceIcon />}
            subtitle="Comptes actifs"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Comptes validés"
            value={balanceStats.validatedAccounts}
            color={theme.palette.success.main}
            icon={<ValidatedIcon />}
            subtitle={`${((balanceStats.validatedAccounts / balanceStats.totalAccounts) * 100).toFixed(1)}% du total`}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total débit"
            value={`${formatAmount(balanceStats.totalDebit)} FCFA`}
            color={theme.palette.error.main}
            icon={<TrendingDownIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total crédit"
            value={`${formatAmount(balanceStats.totalCredit)} FCFA`}
            color={theme.palette.success.main}
            icon={<TrendingUpIcon />}
          />
        </Grid>
      </Grid>

      {/* Alerte équilibre */}
      {!balanceStats.balanceCheck && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Déséquilibre détecté dans la balance
          </Typography>
          <Typography variant="body2">
            Écart: {formatAmount(Math.abs(balanceStats.totalDebit - balanceStats.totalCredit))} FCFA
          </Typography>
        </Alert>
      )}

      {balanceStats.balanceCheck && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            ✓ Balance équilibrée
          </Typography>
          <Typography variant="body2">
            Débit = Crédit ({formatAmount(balanceStats.totalDebit)} FCFA)
          </Typography>
        </Alert>
      )}

      {/* Table des comptes */}
      <Card elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
        <CardContent sx={{ p: 0 }}>
          {/* Filtres et recherche */}
          <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rechercher un compte..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Classe</InputLabel>
                  <Select
                    value={selectedClass}
                    label="Classe"
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    <MenuItem value="all">Toutes les classes</MenuItem>
                    <MenuItem value="1">Classe 1 - Capitaux</MenuItem>
                    <MenuItem value="2">Classe 2 - Immobilisations</MenuItem>
                    <MenuItem value="3">Classe 3 - Stocks</MenuItem>
                    <MenuItem value="4">Classe 4 - Tiers</MenuItem>
                    <MenuItem value="5">Classe 5 - Trésorerie</MenuItem>
                    <MenuItem value="6">Classe 6 - Charges</MenuItem>
                    <MenuItem value="7">Classe 7 - Produits</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Statut</InputLabel>
                  <Select
                    value={selectedStatus}
                    label="Statut"
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <MenuItem value="all">Tous les statuts</MenuItem>
                    <MenuItem value="validated">Validé</MenuItem>
                    <MenuItem value="pending">En attente</MenuItem>
                    <MenuItem value="error">Erreur</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2}>
                  <Chip
                    label={`${filteredData.length} compte(s)`}
                    variant="outlined"
                    color="primary"
                  />
                </Stack>
              </Grid>
            </Grid>
          </Box>

          {/* Tableau */}
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Compte</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Classe</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Débit ouverture</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Crédit ouverture</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Mvt débit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Mvt crédit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Débit clôture</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Crédit clôture</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 11 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton variant="text" height={20} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((entry) => (
                      <TableRow
                        key={entry.id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                            {entry.account}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200 }}>
                            {entry.accountName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Modifié: {entry.lastModified}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`Classe ${entry.class}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          {formatAmount(entry.debitOpening)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          {formatAmount(entry.creditOpening)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          {formatAmount(entry.debitMovement)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          {formatAmount(entry.creditMovement)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {formatAmount(entry.debitClosing)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {formatAmount(entry.creditClosing)}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={getStatusIcon(entry.status)}
                            label={
                              entry.status === 'validated' ? 'Validé' :
                              entry.status === 'pending' ? 'En attente' :
                              'Erreur'
                            }
                            size="small"
                            sx={{
                              backgroundColor: alpha(getStatusColor(entry.status), 0.1),
                              color: getStatusColor(entry.status),
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Voir détails">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleViewDetails(entry)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleEdit(entry)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Plus d'options">
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  setAnchorEl(e.currentTarget)
                                  setSelectedEntry(entry)
                                }}
                              >
                                <MoreIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Lignes par page"
            sx={{ borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}
          />
        </CardContent>
      </Card>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => setAnchorEl(null)}>
          <EditIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Modifier
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <ReceiptIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Voir écritures
        </MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>
          <AssessmentIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Analyse
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Supprimer
        </MenuItem>
      </Menu>

      {/* Modal de détails */}
      <Dialog 
        open={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Détails du Compte</Typography>
          <IconButton onClick={() => setDetailModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Numéro de compte</Typography>
                <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>
                  {selectedEntry.account}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Libellé</Typography>
                <Typography variant="body1">{selectedEntry.accountName}</Typography>
              </Box>
              
              <Divider />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Débit ouverture</Typography>
                  <Typography variant="h6" color="info.main">
                    {formatAmount(selectedEntry.debitOpening)} FCFA
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Crédit ouverture</Typography>
                  <Typography variant="h6" color="warning.main">
                    {formatAmount(selectedEntry.creditOpening)} FCFA
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Mouvements débit</Typography>
                  <Typography variant="h6">
                    {formatAmount(selectedEntry.debitMovement)} FCFA
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Mouvements crédit</Typography>
                  <Typography variant="h6">
                    {formatAmount(selectedEntry.creditMovement)} FCFA
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Débit clôture</Typography>
                  <Typography variant="h6" color="primary">
                    {formatAmount(selectedEntry.debitClosing)} FCFA
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Crédit clôture</Typography>
                  <Typography variant="h6" color="primary">
                    {formatAmount(selectedEntry.creditClosing)} FCFA
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Classe</Typography>
                <Typography variant="body1">Classe {selectedEntry.class}</Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                <Chip
                  label={selectedEntry.status}
                  color={selectedEntry.status === 'validated' ? 'success' : selectedEntry.status === 'pending' ? 'warning' : 'error'}
                  size="small"
                />
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Dernière modification</Typography>
                <Typography variant="body2">
                  {selectedEntry.lastModified}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal d'édition */}
      <Dialog
        open={editModalOpen}
        onClose={handleCancelEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Modifier le Compte</Typography>
          <IconButton onClick={handleCancelEdit} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {editedEntry && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Numéro de compte"
                value={editedEntry.account}
                onChange={(e) => setEditedEntry({ ...editedEntry, account: e.target.value })}
                fullWidth
                disabled
              />
              
              <TextField
                label="Libellé du compte"
                value={editedEntry.accountName}
                onChange={(e) => setEditedEntry({ ...editedEntry, accountName: e.target.value })}
                fullWidth
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Débit ouverture"
                    type="number"
                    value={editedEntry.debitOpening}
                    onChange={(e) => setEditedEntry({ 
                      ...editedEntry, 
                      debitOpening: parseFloat(e.target.value) || 0,
                      debitClosing: (parseFloat(e.target.value) || 0) + editedEntry.debitMovement
                    })}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Crédit ouverture"
                    type="number"
                    value={editedEntry.creditOpening}
                    onChange={(e) => setEditedEntry({ 
                      ...editedEntry, 
                      creditOpening: parseFloat(e.target.value) || 0,
                      creditClosing: (parseFloat(e.target.value) || 0) + editedEntry.creditMovement
                    })}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Mouvements débit"
                    type="number"
                    value={editedEntry.debitMovement}
                    onChange={(e) => setEditedEntry({ 
                      ...editedEntry, 
                      debitMovement: parseFloat(e.target.value) || 0,
                      debitClosing: editedEntry.debitOpening + (parseFloat(e.target.value) || 0)
                    })}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Mouvements crédit"
                    type="number"
                    value={editedEntry.creditMovement}
                    onChange={(e) => setEditedEntry({ 
                      ...editedEntry, 
                      creditMovement: parseFloat(e.target.value) || 0,
                      creditClosing: editedEntry.creditOpening + (parseFloat(e.target.value) || 0)
                    })}
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">FCFA</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Débit clôture</Typography>
                    <Typography variant="h6" color="primary">
                      {formatAmount(editedEntry.debitClosing)} FCFA
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Crédit clôture</Typography>
                    <Typography variant="h6" color="primary">
                      {formatAmount(editedEntry.creditClosing)} FCFA
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={editedEntry.status}
                  onChange={(e) => setEditedEntry({ ...editedEntry, status: e.target.value as 'validated' | 'pending' | 'error' })}
                  label="Statut"
                >
                  <MenuItem value="validated">Validé</MenuItem>
                  <MenuItem value="pending">En attente</MenuItem>
                  <MenuItem value="error">Erreur</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>
            Annuler
          </Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ModernBalance