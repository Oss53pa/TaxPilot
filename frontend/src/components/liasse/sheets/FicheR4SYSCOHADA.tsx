/**
 * Fiche R4 - Tableau des Provisions SYSCOHADA
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
  FormControl,
  Select,
  MenuItem,
  Chip,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material'
import {
  AccountBalance as ProvisionIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Warning as RiskIcon,
  TrendingUp as IncreaseIcon,
  TrendingDown as DecreaseIcon,
  Assessment as AnalysisIcon,
  Info as InfoIcon,
  LocalShipping as ExploitationIcon,
} from '@mui/icons-material'

interface Provision {
  id: string
  categorie: 'risques' | 'charges' | 'depreciation'
  nature: string
  designation: string
  montantDebut: number
  dotations: number
  reprises: number
  montantFin: number
  dateConstitution: string
  echeance: string
  justification: string
  probabiliteRealisation: number
  observations: string
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

const CATEGORIES_PROVISIONS = [
  { 
    id: 'risques', 
    label: 'Provisions pour risques', 
    icon: RiskIcon,
    color: '#FF6B6B',
    description: 'Risques identifiés probables'
  },
  { 
    id: 'charges', 
    label: 'Provisions pour charges', 
    icon: ExploitationIcon,
    color: '#4ECDC4',
    description: 'Charges futures certaines ou probables'
  },
  { 
    id: 'depreciation', 
    label: 'Provisions pour dépréciation', 
    icon: DecreaseIcon,
    color: '#95A5A6',
    description: 'Pertes de valeur d\'actifs'
  }
]

const NATURES_PROVISIONS = {
  risques: [
    'Litiges en cours',
    'Garanties données aux clients',
    'Pertes de change',
    'Amendes et pénalités',
    'Risques techniques',
    'Risques environnementaux',
    'Autres risques'
  ],
  charges: [
    'Grosses réparations',
    'Congés payés',
    'Charges sociales',
    'Charges fiscales',
    'Restructuration',
    'Retraites',
    'Autres charges'
  ],
  depreciation: [
    'Dépréciation stocks',
    'Dépréciation créances',
    'Dépréciation titres',
    'Dépréciation immobilisations',
    'Autres dépréciations'
  ]
}

const FicheR4SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [provisions, setProvisions] = useState<Provision[]>([])
  const [comment, setComment] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    const initialProvisions: Provision[] = [
      {
        id: '1',
        categorie: 'risques',
        nature: 'Litiges en cours',
        designation: 'Litige commercial avec fournisseur ABC',
        montantDebut: 15000000,
        dotations: 5000000,
        reprises: 2000000,
        montantFin: 18000000,
        dateConstitution: '2023-06-15',
        echeance: '2025-12-31',
        justification: 'Procédure judiciaire en cours, risque probable de condamnation',
        probabiliteRealisation: 75,
        observations: 'Audience prévue Q2 2025'
      },
      {
        id: '2',
        categorie: 'charges',
        nature: 'Grosses réparations',
        designation: 'Réfection toiture bâtiment principal',
        montantDebut: 25000000,
        dotations: 10000000,
        reprises: 0,
        montantFin: 35000000,
        dateConstitution: '2022-01-01',
        echeance: '2025-06-30',
        justification: 'Travaux planifiés selon plan de maintenance',
        probabiliteRealisation: 100,
        observations: 'Devis reçus, travaux confirmés'
      },
      {
        id: '3',
        categorie: 'depreciation',
        nature: 'Dépréciation créances',
        designation: 'Créances clients douteux',
        montantDebut: 8000000,
        dotations: 3500000,
        reprises: 1500000,
        montantFin: 10000000,
        dateConstitution: '2024-01-01',
        echeance: '',
        justification: 'Clients en difficulté financière, retards de paiement > 180 jours',
        probabiliteRealisation: 90,
        observations: 'Procédures de recouvrement en cours'
      }
    ]
    
    setProvisions(initialProvisions)
  }

  const handleProvisionChange = (id: string, field: keyof Provision, value: any) => {
    setProvisions(prev => prev.map(provision => {
      if (provision.id === id) {
        const updated = { ...provision, [field]: value }
        
        // Recalculer le montant fin si nécessaire
        if (field === 'montantDebut' || field === 'dotations' || field === 'reprises') {
          updated.montantFin = updated.montantDebut + updated.dotations - updated.reprises
        }
        
        return updated
      }
      return provision
    }))
    setHasChanges(true)
  }

  const addProvision = (categorie?: string) => {
    const newProvision: Provision = {
      id: Date.now().toString(),
      categorie: (categorie as 'risques' | 'charges' | 'depreciation') || 'risques',
      nature: '',
      designation: '',
      montantDebut: 0,
      dotations: 0,
      reprises: 0,
      montantFin: 0,
      dateConstitution: new Date().toISOString().split('T')[0],
      echeance: '',
      justification: '',
      probabiliteRealisation: 50,
      observations: ''
    }
    
    setProvisions(prev => [...prev, newProvision])
    setHasChanges(true)
  }

  const removeProvision = (id: string) => {
    setProvisions(prev => prev.filter(p => p.id !== id))
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

  const handleSave = () => {
    console.log('Sauvegarde Fiche R4:', { provisions, comment })
    setHasChanges(false)
  }

  // Calculs de synthèse
  const syntheseByCategory = CATEGORIES_PROVISIONS.map(cat => {
    const provisionsCategorie = provisions.filter(p => p.categorie === cat.id)
    const montantDebut = provisionsCategorie.reduce((sum, p) => sum + p.montantDebut, 0)
    const dotations = provisionsCategorie.reduce((sum, p) => sum + p.dotations, 0)
    const reprises = provisionsCategorie.reduce((sum, p) => sum + p.reprises, 0)
    const montantFin = provisionsCategorie.reduce((sum, p) => sum + p.montantFin, 0)
    const variation = montantFin - montantDebut
    
    return {
      ...cat,
      count: provisionsCategorie.length,
      montantDebut,
      dotations,
      reprises,
      montantFin,
      variation
    }
  })

  const montantDebut = provisions.reduce((sum, p) => sum + p.montantDebut, 0)
  const dotations = provisions.reduce((sum, p) => sum + p.dotations, 0)
  const reprises = provisions.reduce((sum, p) => sum + p.reprises, 0)
  const montantFin = provisions.reduce((sum, p) => sum + p.montantFin, 0)
  
  const totaux = {
    montantDebut,
    dotations,
    reprises,
    montantFin,
    variation: montantFin - montantDebut,
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'error'
    if (probability >= 50) return 'warning'
    return 'info'
  }

  const getProbabilityLabel = (probability: number) => {
    if (probability >= 80) return 'Très probable'
    if (probability >= 50) return 'Probable'
    return 'Possible'
  }

  const renderTableauSynthese = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <AnalysisIcon sx={{ mr: 1 }} color="primary" />
          Tableau de synthèse des provisions
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Nombre</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Montant début</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Dotations</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Reprises</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Montant fin</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Variation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syntheseByCategory.map(cat => {
                const IconComponent = cat.icon
                return (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconComponent fontSize="small" sx={{ color: cat.color }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {cat.label}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {cat.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={cat.count} size="small" />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(cat.montantDebut)}</TableCell>
                    <TableCell align="right">
                      <Typography color="error.main">
                        +{formatCurrency(cat.dotations)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography color="success.main">
                        -{formatCurrency(cat.reprises)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(cat.montantFin)}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                        {cat.variation > 0 ? <IncreaseIcon fontSize="small" color="error" /> : cat.variation < 0 ? <DecreaseIcon fontSize="small" color="success" /> : null}
                        <Typography 
                          variant="body2" 
                          color={cat.variation > 0 ? 'error.main' : cat.variation < 0 ? 'success.main' : 'inherit'}
                          sx={{ fontWeight: 500 }}
                        >
                          {cat.variation > 0 ? '+' : ''}{formatCurrency(Math.abs(cat.variation))}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
              
              {/* Ligne de total */}
              <TableRow sx={{ backgroundColor: '#f5f5f5', fontWeight: 600 }}>
                <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  <Chip label={provisions.length} size="small" color="primary" />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.montantDebut)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                  +{formatCurrency(totaux.dotations)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                  -{formatCurrency(totaux.reprises)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  {formatCurrency(totaux.montantFin)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                    {totaux.variation > 0 ? <IncreaseIcon fontSize="small" color="error" /> : totaux.variation < 0 ? <DecreaseIcon fontSize="small" color="success" /> : null}
                    <Typography 
                      variant="body2" 
                      color={totaux.variation > 0 ? 'error.main' : totaux.variation < 0 ? 'success.main' : 'inherit'}
                      sx={{ fontWeight: 600 }}
                    >
                      {totaux.variation > 0 ? '+' : ''}{formatCurrency(Math.abs(totaux.variation))}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const renderTableauDetail = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <ProvisionIcon sx={{ mr: 1 }} color="primary" />
            Détail des provisions
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => addProvision()}
          >
            Ajouter provision
          </Button>
        </Stack>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 600 }}>Désignation</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Catégorie/Nature</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Montant début</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Dotations</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Reprises</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Montant fin</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Probabilité</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {provisions.map(provision => {
                const _category = CATEGORIES_PROVISIONS.find(cat => cat.id === provision.categorie)
                return (
                  <TableRow key={provision.id}>
                    <TableCell>
                      <Stack spacing={1}>
                        <TextField
                          size="small"
                          value={provision.designation}
                          onChange={(e) => handleProvisionChange(provision.id, 'designation', e.target.value)}
                          placeholder="Description de la provision..."
                          fullWidth
                        />
                        <TextField
                          size="small"
                          value={provision.justification}
                          onChange={(e) => handleProvisionChange(provision.id, 'justification', e.target.value)}
                          placeholder="Justification..."
                          fullWidth
                          multiline
                          rows={2}
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Stack spacing={1}>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={provision.categorie}
                            onChange={(e) => handleProvisionChange(provision.id, 'categorie', e.target.value)}
                          >
                            {CATEGORIES_PROVISIONS.map(cat => (
                              <MenuItem key={cat.id} value={cat.id}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <cat.icon fontSize="small" sx={{ color: cat.color }} />
                                  <Typography variant="body2">{cat.label}</Typography>
                                </Stack>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl size="small" fullWidth>
                          <Select
                            value={provision.nature}
                            onChange={(e) => handleProvisionChange(provision.id, 'nature', e.target.value)}
                            displayEmpty
                          >
                            <MenuItem value="">
                              <em>Sélectionner nature</em>
                            </MenuItem>
                            {NATURES_PROVISIONS[provision.categorie]?.map(nature => (
                              <MenuItem key={nature} value={nature}>
                                {nature}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={provision.montantDebut}
                        onChange={(e) => handleProvisionChange(provision.id, 'montantDebut', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={provision.dotations}
                        onChange={(e) => handleProvisionChange(provision.id, 'dotations', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                        InputProps={{
                          sx: { color: theme.palette.error.main }
                        }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={provision.reprises}
                        onChange={(e) => handleProvisionChange(provision.id, 'reprises', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                        InputProps={{
                          sx: { color: theme.palette.success.main }
                        }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(provision.montantFin)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Stack spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          type="number"
                          value={provision.probabiliteRealisation}
                          onChange={(e) => handleProvisionChange(provision.id, 'probabiliteRealisation', parseInt(e.target.value) || 0)}
                          InputProps={{ 
                            endAdornment: '%',
                            inputProps: { min: 0, max: 100 }
                          }}
                          sx={{ width: 80 }}
                        />
                        <Chip
                          label={getProbabilityLabel(provision.probabiliteRealisation)}
                          size="small"
                          color={getProbabilityColor(provision.probabiliteRealisation) as any}
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeProvision(provision.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const renderAnalyseRisques = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <RiskIcon sx={{ mr: 1 }} color="warning" />
          Analyse des risques et échéances
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Répartition par probabilité de réalisation
            </Typography>
            <Stack spacing={2}>
              {[
                { min: 80, max: 100, label: 'Très probable', color: 'error' },
                { min: 50, max: 79, label: 'Probable', color: 'warning' },
                { min: 0, max: 49, label: 'Possible', color: 'info' }
              ].map(range => {
                const count = provisions.filter(p => 
                  p.probabiliteRealisation >= range.min && 
                  p.probabiliteRealisation <= range.max
                ).length
                const montant = provisions
                  .filter(p => p.probabiliteRealisation >= range.min && p.probabiliteRealisation <= range.max)
                  .reduce((sum, p) => sum + p.montantFin, 0)
                
                return (
                  <Card key={range.label} variant="outlined">
                    <CardContent sx={{ py: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip 
                            label={`${range.min}-${range.max}%`} 
                            size="small" 
                            color={range.color as any}
                          />
                          <Typography variant="body2">{range.label}</Typography>
                        </Stack>
                        <Box textAlign="right">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatCurrency(montant)}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {count} provision(s)
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                )
              })}
            </Stack>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Échéances des provisions
            </Typography>
            <Stack spacing={1}>
              {provisions
                .filter(p => p.echeance)
                .sort((a, b) => new Date(a.echeance).getTime() - new Date(b.echeance).getTime())
                .slice(0, 5)
                .map(provision => {
                  const daysUntil = Math.floor((new Date(provision.echeance).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  const isUrgent = daysUntil < 90
                  
                  return (
                    <Alert 
                      key={provision.id} 
                      severity={isUrgent ? "warning" : "info"}
                      sx={{ py: 0.5 }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                          {provision.designation.substring(0, 30)}...
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {formatCurrency(provision.montantFin)}
                          </Typography>
                          <Chip 
                            label={`${daysUntil}j`} 
                            size="small" 
                            color={isUrgent ? "error" : "default"}
                          />
                        </Stack>
                      </Stack>
                    </Alert>
                  )
                })}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <ProvisionIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              FICHE R4 - TABLEAU DES PROVISIONS (en FCFA)
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

        {/* Indicateurs de synthèse */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.montantFin)}
                </Typography>
                <Typography variant="body2">Total provisions</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.error.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                  +{formatCurrency(totaux.dotations)}
                </Typography>
                <Typography variant="body2">Dotations</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                  -{formatCurrency(totaux.reprises)}
                </Typography>
                <Typography variant="body2">Reprises</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                  {totaux.variation > 0 ? <IncreaseIcon color="error" /> : <DecreaseIcon color="success" />}
                  <Typography variant="h6" color={totaux.variation > 0 ? "error.main" : "success.main"} sx={{ fontWeight: 600 }}>
                    {totaux.variation > 0 ? '+' : ''}{formatCurrency(Math.abs(totaux.variation))}
                  </Typography>
                </Stack>
                <Typography variant="body2">Variation nette</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Les provisions constituent des passifs dont l'échéance ou le montant sont incertains. 
            Elles doivent être justifiées et documentées selon les principes SYSCOHADA.
          </Typography>
        </Alert>
      </Box>

      {/* Onglets */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="Synthèse" />
          <Tab label="Détail" />
          <Tab label="Analyse des risques" />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      <TabPanel value={tabValue} index={0}>
        {renderTableauSynthese()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderTableauDetail()}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderAnalyseRisques()}
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
            Commentaires et observations
          </Typography>
        </Stack>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Précisez les méthodes d'évaluation des provisions, les changements significatifs, les litiges en cours, les risques couverts par des assurances..."
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

export default FicheR4SYSCOHADA