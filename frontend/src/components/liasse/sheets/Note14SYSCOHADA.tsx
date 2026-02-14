/**
 * Note 14 - Emprunts et dettes financières
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material'
import {
  AccountBalance as DebtIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CalendarToday as MaturityIcon,
  Info as InfoIcon,
  Assessment as AnalysisIcon,
  Schedule as ScheduleIcon,
  CreditCard as CreditIcon,
  LocalAtm as BankIcon,
  Business as InstitutionIcon,
} from '@mui/icons-material'

interface Emprunt {
  id: string
  designation: string
  preteur: string
  typePreteur: 'banque' | 'institution' | 'obligataire' | 'autre'
  montantInitial: number
  dateContraction: string
  dateEcheance: string
  tauxInteret: number
  typeRemboursement: 'constant' | 'in_fine' | 'progressif' | 'autre'
  capitalRestant: number
  partCourtTerme: number
  partLongTerme: number
  interetsCourus: number
  garanties: string
  covenant: string
  observations: string
}

interface EcheancierEmprunt {
  annee: number
  capitalDebut: number
  remboursementCapital: number
  interets: number
  annuite: number
  capitalFin: number
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

const TYPES_PRETEURS = [
  { id: 'banque', label: 'Banque', icon: BankIcon },
  { id: 'institution', label: 'Institution financière', icon: InstitutionIcon },
  { id: 'obligataire', label: 'Emprunt obligataire', icon: CreditIcon },
  { id: 'autre', label: 'Autre', icon: DebtIcon }
]

const TYPES_REMBOURSEMENT = [
  { id: 'constant', label: 'Annuités constantes' },
  { id: 'in_fine', label: 'In fine' },
  { id: 'progressif', label: 'Progressif' },
  { id: 'autre', label: 'Autre' }
]

const Note14SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [emprunts, setEmprunts] = useState<Emprunt[]>([])
  const [selectedEmprunt, setSelectedEmprunt] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    const initialEmprunts: Emprunt[] = [
      {
        id: '1',
        designation: 'Emprunt bancaire - Investissement',
        preteur: 'Banque Atlantique',
        typePreteur: 'banque',
        montantInitial: 200000000,
        dateContraction: '2021-01-15',
        dateEcheance: '2026-01-15',
        tauxInteret: 7.5,
        typeRemboursement: 'constant',
        capitalRestant: 120000000,
        partCourtTerme: 40000000,
        partLongTerme: 80000000,
        interetsCourus: 1500000,
        garanties: 'Hypothèque sur bâtiment administratif',
        covenant: 'Ratio d\'endettement < 0.5',
        observations: 'Remboursement mensuel'
      },
      {
        id: '2',
        designation: 'Crédit-bail immobilier',
        preteur: 'Alios Finance',
        typePreteur: 'institution',
        montantInitial: 50000000,
        dateContraction: '2022-06-01',
        dateEcheance: '2025-06-01',
        tauxInteret: 8.0,
        typeRemboursement: 'constant',
        capitalRestant: 30000000,
        partCourtTerme: 16666667,
        partLongTerme: 13333333,
        interetsCourus: 200000,
        garanties: 'Nantissement du bien',
        covenant: '',
        observations: 'Option d\'achat : 5% de la valeur initiale'
      },
      {
        id: '3',
        designation: 'Découvert bancaire',
        preteur: 'Ecobank',
        typePreteur: 'banque',
        montantInitial: 25000000,
        dateContraction: '2024-01-01',
        dateEcheance: '2024-12-31',
        tauxInteret: 9.5,
        typeRemboursement: 'in_fine',
        capitalRestant: 15000000,
        partCourtTerme: 15000000,
        partLongTerme: 0,
        interetsCourus: 375000,
        garanties: 'Caution solidaire des dirigeants',
        covenant: '',
        observations: 'Renouvelable annuellement'
      }
    ]
    
    setEmprunts(initialEmprunts)
  }

  const handleEmpruntChange = (id: string, field: keyof Emprunt, value: any) => {
    setEmprunts(prev => prev.map(emprunt => {
      if (emprunt.id === id) {
        const updated = { ...emprunt, [field]: value }
        
        // Recalculer les parts court/long terme si nécessaire
        if (field === 'capitalRestant' || field === 'dateEcheance') {
          const today = new Date()
          const echeance = new Date(updated.dateEcheance)
          const monthsRemaining = Math.max(0, 
            (echeance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
          )
          
          if (monthsRemaining <= 12) {
            updated.partCourtTerme = updated.capitalRestant
            updated.partLongTerme = 0
          } else {
            // Estimation simplifiée
            const annualPayment = updated.capitalRestant / (monthsRemaining / 12)
            updated.partCourtTerme = Math.min(annualPayment, updated.capitalRestant)
            updated.partLongTerme = updated.capitalRestant - updated.partCourtTerme
          }
        }
        
        return updated
      }
      return emprunt
    }))
    setHasChanges(true)
  }

  const addEmprunt = () => {
    const newEmprunt: Emprunt = {
      id: Date.now().toString(),
      designation: '',
      preteur: '',
      typePreteur: 'banque',
      montantInitial: 0,
      dateContraction: new Date().toISOString().split('T')[0],
      dateEcheance: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tauxInteret: 0,
      typeRemboursement: 'constant',
      capitalRestant: 0,
      partCourtTerme: 0,
      partLongTerme: 0,
      interetsCourus: 0,
      garanties: '',
      covenant: '',
      observations: ''
    }
    
    setEmprunts(prev => [...prev, newEmprunt])
    setHasChanges(true)
  }

  const removeEmprunt = (id: string) => {
    setEmprunts(prev => prev.filter(e => e.id !== id))
    setHasChanges(true)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatCurrency = (value: number) => {
    return formatNumber(value)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const handleSave = () => {
    console.log('Sauvegarde Note 14:', { emprunts, comment })
    setHasChanges(false)
  }

  // Générer l'échéancier pour un emprunt
  const generateEcheancier = (emprunt: Emprunt): EcheancierEmprunt[] => {
    const echeancier: EcheancierEmprunt[] = []
    const today = new Date()
    const dateEcheance = new Date(emprunt.dateEcheance)
    const yearsRemaining = Math.ceil((dateEcheance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365))
    
    let capitalRestant = emprunt.capitalRestant
    const annuiteConstante = emprunt.typeRemboursement === 'constant' 
      ? (capitalRestant * emprunt.tauxInteret / 100) / (1 - Math.pow(1 + emprunt.tauxInteret / 100, -yearsRemaining))
      : 0
    
    for (let i = 0; i < yearsRemaining; i++) {
      const annee = today.getFullYear() + i
      const interets = capitalRestant * (emprunt.tauxInteret / 100)
      
      let remboursementCapital = 0
      if (emprunt.typeRemboursement === 'constant') {
        remboursementCapital = annuiteConstante - interets
      } else if (emprunt.typeRemboursement === 'in_fine') {
        remboursementCapital = i === yearsRemaining - 1 ? capitalRestant : 0
      } else {
        remboursementCapital = capitalRestant / yearsRemaining
      }
      
      const capitalFin = Math.max(0, capitalRestant - remboursementCapital)
      
      echeancier.push({
        annee,
        capitalDebut: capitalRestant,
        remboursementCapital,
        interets,
        annuite: remboursementCapital + interets,
        capitalFin
      })
      
      capitalRestant = capitalFin
    }
    
    return echeancier
  }

  // Calculs de synthèse
  const totaux = {
    montantInitial: emprunts.reduce((sum, e) => sum + e.montantInitial, 0),
    capitalRestant: emprunts.reduce((sum, e) => sum + e.capitalRestant, 0),
    partCourtTerme: emprunts.reduce((sum, e) => sum + e.partCourtTerme, 0),
    partLongTerme: emprunts.reduce((sum, e) => sum + e.partLongTerme, 0),
    interetsCourus: emprunts.reduce((sum, e) => sum + e.interetsCourus, 0),
  }

  const tauxMoyenPondere = emprunts.length > 0 
    ? emprunts.reduce((sum, e) => sum + (e.tauxInteret * e.capitalRestant), 0) / totaux.capitalRestant
    : 0

  // Répartition par type de prêteur
  const repartitionPreteur = TYPES_PRETEURS.map(type => {
    const empruntsPreteur = emprunts.filter(e => e.typePreteur === type.id)
    const montant = empruntsPreteur.reduce((sum, e) => sum + e.capitalRestant, 0)
    const pourcentage = totaux.capitalRestant > 0 ? (montant / totaux.capitalRestant) * 100 : 0
    
    return {
      ...type,
      count: empruntsPreteur.length,
      montant,
      pourcentage
    }
  }).filter(type => type.count > 0)

  const renderTableauEmprunts = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <DebtIcon sx={{ mr: 1 }} color="primary" />
            Détail des emprunts et dettes financières
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addEmprunt}
          >
            Ajouter emprunt
          </Button>
        </Stack>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Désignation</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Prêteur</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Montant initial</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Capital restant</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Taux</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Échéance</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Part CT</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Part LT</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emprunts.map(emprunt => {
                const typeIcon = TYPES_PRETEURS.find(t => t.id === emprunt.typePreteur)?.icon || BankIcon
                const IconComponent = typeIcon
                const daysToMaturity = Math.floor(
                  (new Date(emprunt.dateEcheance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )
                const isShortTerm = daysToMaturity < 365
                
                return (
                  <TableRow 
                    key={emprunt.id}
                    sx={{
                      backgroundColor: isShortTerm ? alpha(theme.palette.warning.main, 0.05) : 'transparent',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.1)
                      }
                    }}
                    onClick={() => setSelectedEmprunt(emprunt.id)}
                  >
                    <TableCell>
                      <TextField
                        size="small"
                        value={emprunt.designation}
                        onChange={(e) => handleEmpruntChange(emprunt.id, 'designation', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        fullWidth
                        sx={{ minWidth: 200 }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconComponent fontSize="small" color="action" />
                        <TextField
                          size="small"
                          value={emprunt.preteur}
                          onChange={(e) => handleEmpruntChange(emprunt.id, 'preteur', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ minWidth: 150 }}
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={emprunt.montantInitial}
                        onChange={(e) => handleEmpruntChange(emprunt.id, 'montantInitial', parseFloat(e.target.value) || 0)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={emprunt.capitalRestant}
                        onChange={(e) => handleEmpruntChange(emprunt.id, 'capitalRestant', parseFloat(e.target.value) || 0)}
                        onClick={(e) => e.stopPropagation()}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="center">
                      <Stack spacing={0} alignItems="center">
                        <TextField
                          size="small"
                          type="number"
                          value={emprunt.tauxInteret}
                          onChange={(e) => handleEmpruntChange(emprunt.id, 'tauxInteret', parseFloat(e.target.value) || 0)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ width: 80 }}
                          InputProps={{ endAdornment: '%' }}
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          type="date"
                          value={emprunt.dateEcheance}
                          onChange={(e) => handleEmpruntChange(emprunt.id, 'dateEcheance', e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ width: 140 }}
                        />
                        {isShortTerm && (
                          <Chip
                            label={`${daysToMaturity}j`}
                            size="small"
                            color="warning"
                            icon={<MaturityIcon />}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                        {formatCurrency(emprunt.partCourtTerme)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                        {formatCurrency(emprunt.partLongTerme)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeEmprunt(emprunt.id)
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
              
              {/* Ligne de total */}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), fontWeight: 600 }}>
                <TableCell sx={{ fontWeight: 600 }} colSpan={2}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.montantInitial)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.capitalRestant)}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  {formatPercent(tauxMoyenPondere)}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>-</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                  {formatCurrency(totaux.partCourtTerme)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                  {formatCurrency(totaux.partLongTerme)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const renderEcheancier = () => {
    const emprunt = emprunts.find(e => e.id === selectedEmprunt)
    if (!emprunt) {
      return (
        <Alert severity="info">
          Sélectionnez un emprunt dans le tableau pour voir son échéancier de remboursement.
        </Alert>
      )
    }
    
    const echeancier = generateEcheancier(emprunt)
    const totalInterets = echeancier.reduce((sum, e) => sum + e.interets, 0)
    const totalRemboursement = echeancier.reduce((sum, e) => sum + e.remboursementCapital, 0)
    
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1 }} color="primary" />
            Échéancier de remboursement - {emprunt.designation}
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Type de remboursement :</strong> {TYPES_REMBOURSEMENT.find(t => t.id === emprunt.typeRemboursement)?.label}
              <br />
              <strong>Taux d'intérêt :</strong> {formatPercent(emprunt.tauxInteret)}
              <br />
              <strong>Garanties :</strong> {emprunt.garanties || 'Aucune'}
            </Typography>
          </Alert>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Année</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Capital début</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Remb. capital</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Intérêts</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Annuité</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Capital fin</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {echeancier.map((ligne, index) => (
                  <TableRow key={index}>
                    <TableCell>{ligne.annee}</TableCell>
                    <TableCell align="right">{formatCurrency(ligne.capitalDebut)}</TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.primary.main }}>
                      {formatCurrency(ligne.remboursementCapital)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: theme.palette.error.main }}>
                      {formatCurrency(ligne.interets)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {formatCurrency(ligne.annuite)}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(ligne.capitalFin)}</TableCell>
                  </TableRow>
                ))}
                
                {/* Ligne de total */}
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), fontWeight: 600 }}>
                  <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                  <TableCell />
                  <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    {formatCurrency(totalRemboursement)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                    {formatCurrency(totalInterets)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totalRemboursement + totalInterets)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    )
  }

  const renderAnalyse = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <AnalysisIcon sx={{ mr: 1 }} color="primary" />
              Répartition par type de prêteur
            </Typography>
            
            {repartitionPreteur.map(type => {
              const IconComponent = type.icon
              return (
                <Box key={type.id} sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconComponent fontSize="small" color="action" />
                      <Typography variant="body2">{type.label}</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPercent(type.pourcentage)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={type.pourcentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: theme.palette.primary.main,
                      },
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {type.count} emprunt(s) - {formatCurrency(type.montant)}
                  </Typography>
                </Box>
              )
            })}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Indicateurs clés
            </Typography>
            
            <Stack spacing={2}>
              <Alert severity="info">
                <Typography variant="subtitle2">Taux d'intérêt moyen pondéré</Typography>
                <Typography variant="h6">
                  {formatPercent(tauxMoyenPondere)}
                </Typography>
              </Alert>
              
              <Alert severity={totaux.partCourtTerme > totaux.partLongTerme ? "warning" : "success"}>
                <Typography variant="subtitle2">Structure de la dette</Typography>
                <Typography variant="body2">
                  Court terme : {formatPercent((totaux.partCourtTerme / totaux.capitalRestant) * 100)}
                  <br />
                  Long terme : {formatPercent((totaux.partLongTerme / totaux.capitalRestant) * 100)}
                </Typography>
              </Alert>
              
              <Alert severity="info">
                <Typography variant="subtitle2">Coût des intérêts courus</Typography>
                <Typography variant="body2">
                  {formatCurrency(totaux.interetsCourus)}
                </Typography>
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <DebtIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              NOTE 14 - EMPRUNTS ET DETTES FINANCIÈRES (en FCFA)
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Imprimer">
              <IconButton size="small">
                <PrintIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Exporter">
              <IconButton size="small">
                <ExportIcon />
              </IconButton>
            </Tooltip>
            
            {hasChanges && (
              <Button
                variant="contained"
                size="small"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                color="success"
              >
                Enregistrer
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Indicateurs clés */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.capitalRestant)}
                </Typography>
                <Typography variant="body2">Total emprunts</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.error.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.partCourtTerme)}
                </Typography>
                <Typography variant="body2">Part court terme</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.partLongTerme)}
                </Typography>
                <Typography variant="body2">Part long terme</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {formatPercent(tauxMoyenPondere)}
                </Typography>
                <Typography variant="body2">Taux moyen</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Onglets */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="Détail des emprunts" />
          <Tab label="Échéancier" />
          <Tab label="Analyse" />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      <TabPanel value={tabValue} index={0}>
        {renderTableauEmprunts()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderEcheancier()}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderAnalyse()}
      </TabPanel>

      {/* Zone de commentaires */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: alpha(theme.palette.action.hover, 0.3),
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        mt: 3
      }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <InfoIcon color="action" />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Commentaires et informations complémentaires
          </Typography>
        </Stack>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Précisez les covenants bancaires, les clauses particulières, les renégociations en cours, les lignes de crédit non utilisées..."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
            },
          }}
        />
      </Box>
    </Paper>
  )
}

export default Note14SYSCOHADA