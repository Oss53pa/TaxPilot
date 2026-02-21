/**
 * Note 19 - Charges de personnel
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
  LinearProgress,
  Avatar,
} from '@mui/material'
import {
  Groups as PersonnelIcon,
  Group as GroupIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as GrowthIcon,
  TrendingDown as DeclineIcon,
  Person as EmployeeIcon,
  AttachMoney as SalaryIcon,
  Security as SocialIcon,
  School as TrainingIcon,
  MedicalServices as HealthIcon,
  Info as InfoIcon,
  WorkOutline as WorkIcon,
  PieChart as ChartIcon,
} from '@mui/icons-material'
import { formatCurrency } from '@/utils/formatting'
import { TabPanel } from '@/components/shared/TabPanel'
import { SheetHeader } from '@/components/liasse/common/SheetHeader'

interface ChargePersonnel {
  id: string
  categorie: string
  designation: string
  montantN: number
  montantN1: number
  evolution: number
  pourcentageCA: number
  observations: string
}

interface EffectifCategorie {
  id: string
  categorie: string
  nombreN: number
  nombreN1: number
  salaireMoyen: number
  chargeSociale: number
  autresAvantages: number
}

interface MontantsComparatifs {
  montantN: number
  montantN1: number
  evolution?: number
  pourcentageCA?: number
}

const CATEGORIES_CHARGES = [
  { id: 'salaires', label: 'Salaires et traitements', icon: SalaryIcon, color: '#3498db' },
  { id: 'charges_sociales', label: 'Charges sociales', icon: SocialIcon, color: '#ef4444' },
  { id: 'conges_payes', label: 'Congés payés', icon: WorkIcon, color: '#f39c12' },
  { id: 'indemnites', label: 'Indemnités et primes', icon: SalaryIcon, color: '#27ae60' },
  { id: 'formation', label: 'Formation professionnelle', icon: TrainingIcon, color: '#9b59b6' },
  { id: 'œuvres_sociales', label: 'Œuvres sociales', icon: HealthIcon, color: '#1abc9c' },
  { id: 'autres', label: 'Autres charges', icon: PersonnelIcon, color: '#95a5a6' }
]

const Note19SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [charges, setCharges] = useState<ChargePersonnel[]>([])
  const [effectifs, setEffectifs] = useState<EffectifCategorie[]>([])
  const [chiffreAffaires, _setChiffreAffaires] = useState({
    montantN: 4120000000,
    montantN1: 3840000000
  })
  const [comment, setComment] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    // Charges de personnel
    const initialCharges: ChargePersonnel[] = [
      {
        id: '1',
        categorie: 'salaires',
        designation: 'Salaires et traitements de base',
        montantN: 480000000,
        montantN1: 420000000,
        evolution: 14.3,
        pourcentageCA: 11.7,
        observations: 'Augmentation due aux recrutements et révisions salariales'
      },
      {
        id: '2',
        categorie: 'charges_sociales',
        designation: 'Cotisations patronales',
        montantN: 120000000,
        montantN1: 105000000,
        evolution: 14.3,
        pourcentageCA: 2.9,
        observations: 'CNSS, retraite complémentaire'
      },
      {
        id: '3',
        categorie: 'indemnites',
        designation: 'Primes de performance',
        montantN: 85000000,
        montantN1: 75000000,
        evolution: 13.3,
        pourcentageCA: 2.1,
        observations: 'Primes annuelles et mensuelles'
      },
      {
        id: '4',
        categorie: 'conges_payes',
        designation: 'Provision congés payés',
        montantN: 45000000,
        montantN1: 42000000,
        evolution: 7.1,
        pourcentageCA: 1.1,
        observations: ''
      },
      {
        id: '5',
        categorie: 'formation',
        designation: 'Formation du personnel',
        montantN: 15000000,
        montantN1: 10000000,
        evolution: 50.0,
        pourcentageCA: 0.4,
        observations: 'Plan de formation renforcé'
      },
      {
        id: '6',
        categorie: 'œuvres_sociales',
        designation: 'Médecine du travail et assurance santé',
        montantN: 25000000,
        montantN1: 22000000,
        evolution: 13.6,
        pourcentageCA: 0.6,
        observations: ''
      }
    ]

    // Effectifs par catégorie
    const initialEffectifs: EffectifCategorie[] = [
      {
        id: '1',
        categorie: 'Cadres dirigeants',
        nombreN: 5,
        nombreN1: 4,
        salaireMoyen: 5000000,
        chargeSociale: 1250000,
        autresAvantages: 800000
      },
      {
        id: '2',
        categorie: 'Cadres',
        nombreN: 25,
        nombreN1: 22,
        salaireMoyen: 2500000,
        chargeSociale: 625000,
        autresAvantages: 300000
      },
      {
        id: '3',
        categorie: 'Agents de maîtrise',
        nombreN: 40,
        nombreN1: 38,
        salaireMoyen: 1200000,
        chargeSociale: 300000,
        autresAvantages: 150000
      },
      {
        id: '4',
        categorie: 'Employés',
        nombreN: 80,
        nombreN1: 75,
        salaireMoyen: 600000,
        chargeSociale: 150000,
        autresAvantages: 75000
      },
      {
        id: '5',
        categorie: 'Ouvriers',
        nombreN: 45,
        nombreN1: 48,
        salaireMoyen: 400000,
        chargeSociale: 100000,
        autresAvantages: 50000
      }
    ]

    setCharges(initialCharges)
    setEffectifs(initialEffectifs)
  }

  const handleChargeChange = (id: string, field: keyof ChargePersonnel, value: any) => {
    setCharges(prev => prev.map(charge => {
      if (charge.id === id) {
        const updated = { ...charge, [field]: value }
        
        // Recalculer l'évolution et le % du CA
        if (field === 'montantN' || field === 'montantN1') {
          if (updated.montantN1 > 0) {
            updated.evolution = ((updated.montantN - updated.montantN1) / updated.montantN1) * 100
          }
          updated.pourcentageCA = (updated.montantN / chiffreAffaires.montantN) * 100
        }
        
        return updated
      }
      return charge
    }))
    setHasChanges(true)
  }

  const handleEffectifChange = (id: string, field: keyof EffectifCategorie, value: any) => {
    setEffectifs(prev => prev.map(effectif => {
      if (effectif.id === id) {
        return { ...effectif, [field]: value }
      }
      return effectif
    }))
    setHasChanges(true)
  }

  const addCharge = () => {
    const newCharge: ChargePersonnel = {
      id: Date.now().toString(),
      categorie: 'autres',
      designation: '',
      montantN: 0,
      montantN1: 0,
      evolution: 0,
      pourcentageCA: 0,
      observations: ''
    }
    
    setCharges(prev => [...prev, newCharge])
    setHasChanges(true)
  }

  const removeCharge = (id: string) => {
    setCharges(prev => prev.filter(c => c.id !== id))
    setHasChanges(true)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const handleSave = () => {
    setHasChanges(false)
  }

  // Calculs de synthèse
  const totaux: MontantsComparatifs = {
    montantN: charges.reduce((sum, c) => sum + c.montantN, 0),
    montantN1: charges.reduce((sum, c) => sum + c.montantN1, 0),
  }
  totaux.evolution = totaux.montantN1 > 0 ? ((totaux.montantN - totaux.montantN1) / totaux.montantN1) * 100 : 0
  totaux.pourcentageCA = (totaux.montantN / chiffreAffaires.montantN) * 100

  const totalEffectifs = {
    nombreN: effectifs.reduce((sum, e) => sum + e.nombreN, 0),
    nombreN1: effectifs.reduce((sum, e) => sum + e.nombreN1, 0),
  }

  const masseSalarialeMoyenne = totalEffectifs.nombreN > 0 
    ? totaux.montantN / totalEffectifs.nombreN / 12 
    : 0

  // Répartition par catégorie de charges
  const repartitionCharges = CATEGORIES_CHARGES.map(cat => {
    const chargesCat = charges.filter(c => c.categorie === cat.id)
    const montant = chargesCat.reduce((sum, c) => sum + c.montantN, 0)
    const pourcentage = totaux.montantN > 0 ? (montant / totaux.montantN) * 100 : 0
    
    return {
      ...cat,
      montant,
      pourcentage
    }
  })

  const renderTableauCharges = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <SalaryIcon sx={{ mr: 1 }} color="primary" />
            Détail des charges de personnel
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addCharge}
          >
            Ajouter charge
          </Button>
        </Stack>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Désignation</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Montant N-1</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Montant N</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Évolution</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>% CA</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Observations</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {charges.map(charge => {
                return (
                  <TableRow key={charge.id}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={charge.designation}
                        onChange={(e) => handleChargeChange(charge.id, 'designation', e.target.value)}
                        placeholder="Description de la charge..."
                        fullWidth
                        sx={{ minWidth: 200 }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={charge.categorie}
                          onChange={(e) => handleChargeChange(charge.id, 'categorie', e.target.value)}
                        >
                          {CATEGORIES_CHARGES.map(cat => (
                            <MenuItem key={cat.id} value={cat.id}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <cat.icon fontSize="small" sx={{ color: cat.color }} />
                                <Typography variant="body2">{cat.label}</Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={charge.montantN1}
                        onChange={(e) => handleChargeChange(charge.id, 'montantN1', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={charge.montantN}
                        onChange={(e) => handleChargeChange(charge.id, 'montantN', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                        {charge.evolution > 0 ? <GrowthIcon fontSize="small" color="error" /> : charge.evolution < 0 ? <DeclineIcon fontSize="small" color="success" /> : null}
                        <Typography 
                          variant="body2" 
                          color={charge.evolution > 0 ? 'error.main' : charge.evolution < 0 ? 'success.main' : 'inherit'}
                          sx={{ fontWeight: 500 }}
                        >
                          {charge.evolution > 0 ? '+' : ''}{formatPercent(charge.evolution)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Chip
                        label={formatPercent(charge.pourcentageCA)}
                        size="small"
                        color={charge.pourcentageCA > 3 ? "warning" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <TextField
                        size="small"
                        value={charge.observations}
                        onChange={(e) => handleChargeChange(charge.id, 'observations', e.target.value)}
                        placeholder="Observations..."
                        fullWidth
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeCharge(charge.id)}
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
                  {formatCurrency(totaux.montantN1)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.montantN)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                    {(totaux.evolution ?? 0) > 0 ? <GrowthIcon fontSize="small" color="error" /> : (totaux.evolution ?? 0) < 0 ? <DeclineIcon fontSize="small" color="success" /> : null}
                    <Typography
                      variant="body2"
                      color={(totaux.evolution ?? 0) > 0 ? 'error.main' : 'success.main'}
                      sx={{ fontWeight: 600 }}
                    >
                      {(totaux.evolution ?? 0) > 0 ? '+' : ''}{formatPercent(totaux.evolution ?? 0)}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatPercent(totaux.pourcentageCA ?? 0)}
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} colSpan={2}>du CA</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const renderTableauEffectifs = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <GroupIcon sx={{ mr: 1 }} color="primary" />
          Effectifs et rémunérations moyennes
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Effectif N-1</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Effectif N</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Variation</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Salaire moyen</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Charges sociales</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Autres avantages</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Coût total/pers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {effectifs.map(effectif => {
                const variation = effectif.nombreN - effectif.nombreN1
                const coutTotal = effectif.salaireMoyen + effectif.chargeSociale + effectif.autresAvantages
                
                return (
                  <TableRow key={effectif.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                          <EmployeeIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="body2">{effectif.categorie}</Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={effectif.nombreN1}
                        onChange={(e) => handleEffectifChange(effectif.id, 'nombreN1', parseInt(e.target.value) || 0)}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={effectif.nombreN}
                        onChange={(e) => handleEffectifChange(effectif.id, 'nombreN', parseInt(e.target.value) || 0)}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Chip
                        label={variation > 0 ? `+${variation}` : variation.toString()}
                        size="small"
                        color={variation > 0 ? "success" : variation < 0 ? "error" : "default"}
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={effectif.salaireMoyen}
                        onChange={(e) => handleEffectifChange(effectif.id, 'salaireMoyen', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={effectif.chargeSociale}
                        onChange={(e) => handleEffectifChange(effectif.id, 'chargeSociale', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={effectif.autresAvantages}
                        onChange={(e) => handleEffectifChange(effectif.id, 'autresAvantages', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatCurrency(coutTotal)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
              
              {/* Ligne de total */}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), fontWeight: 600 }}>
                <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {totalEffectifs.nombreN1}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {totalEffectifs.nombreN}
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={`${totalEffectifs.nombreN - totalEffectifs.nombreN1 > 0 ? '+' : ''}${totalEffectifs.nombreN - totalEffectifs.nombreN1}`}
                    size="small"
                    color={totalEffectifs.nombreN > totalEffectifs.nombreN1 ? "success" : "error"}
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }} colSpan={4}>
                  Coût moyen: {formatCurrency(masseSalarialeMoyenne)}/mois
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const renderAnalyse = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <ChartIcon sx={{ mr: 1 }} color="primary" />
              Répartition des charges
            </Typography>
            
            {repartitionCharges.map(cat => {
              const IconComponent = cat.icon
              return (
                <Box key={cat.id} sx={{ mb: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <IconComponent fontSize="small" sx={{ color: cat.color }} />
                      <Typography variant="body2">{cat.label}</Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPercent(cat.pourcentage)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={cat.pourcentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(cat.color, 0.2),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: cat.color,
                      },
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {formatCurrency(cat.montant)}
                  </Typography>
                </Box>
              )
            })}
          </CardContent>
        </Card>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Indicateurs clés
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Alert severity="info">
                    <Typography variant="subtitle2">Effectif total</Typography>
                    <Typography variant="h6">
                      {totalEffectifs.nombreN} personnes
                    </Typography>
                    <Typography variant="caption">
                      {totalEffectifs.nombreN > totalEffectifs.nombreN1 ? '+' : ''}{totalEffectifs.nombreN - totalEffectifs.nombreN1} vs N-1
                    </Typography>
                  </Alert>
                </Grid>
                
                <Grid item xs={6}>
                  <Alert severity="warning">
                    <Typography variant="subtitle2">Charges / CA</Typography>
                    <Typography variant="h6">
                      {formatPercent(totaux.pourcentageCA ?? 0)}
                    </Typography>
                    <Typography variant="caption">
                      Masse salariale
                    </Typography>
                  </Alert>
                </Grid>
                
                <Grid item xs={6}>
                  <Alert severity="success">
                    <Typography variant="subtitle2">Productivité</Typography>
                    <Typography variant="h6">
                      {formatCurrency(chiffreAffaires.montantN / totalEffectifs.nombreN)}
                    </Typography>
                    <Typography variant="caption">
                      CA par employé
                    </Typography>
                  </Alert>
                </Grid>
                
                <Grid item xs={6}>
                  <Alert severity="info">
                    <Typography variant="subtitle2">Coût moyen</Typography>
                    <Typography variant="h6">
                      {formatCurrency(masseSalarialeMoyenne)}
                    </Typography>
                    <Typography variant="caption">
                      Par mois et par employé
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Ratios de performance
              </Typography>
              <Stack spacing={1}>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Charges sociales / Salaires</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPercent((charges.find(c => c.categorie === 'charges_sociales')?.montantN || 0) / (charges.find(c => c.categorie === 'salaires')?.montantN || 1) * 100)}
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Formation / Masse salariale</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatPercent((charges.find(c => c.categorie === 'formation')?.montantN || 0) / totaux.montantN * 100)}
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">Croissance charges vs CA</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: (totaux.evolution ?? 0) > 7.3 ? theme.palette.error.main : theme.palette.success.main }}>
                      {formatPercent(totaux.evolution ?? 0)} vs 7.3%
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
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
        <SheetHeader title="NOTE 19 - CHARGES DE PERSONNEL (en FCFA)" icon={<PersonnelIcon />} />
        {hasChanges && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              color="success"
            >
              Enregistrer
            </Button>
          </Box>
        )}

        {/* Indicateurs clés */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.montantN)}
                </Typography>
                <Typography variant="body2">Total charges</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                  {totalEffectifs.nombreN}
                </Typography>
                <Typography variant="body2">Effectifs</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {formatPercent(totaux.pourcentageCA ?? 0)}
                </Typography>
                <Typography variant="body2">% du CA</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                  {(totaux.evolution ?? 0) > 0 ? <GrowthIcon color="error" /> : <DeclineIcon color="success" />}
                  <Typography variant="h6" color={(totaux.evolution ?? 0) > 0 ? "error.main" : "success.main"} sx={{ fontWeight: 600 }}>
                    {(totaux.evolution ?? 0) > 0 ? '+' : ''}{formatPercent(totaux.evolution ?? 0)}
                  </Typography>
                </Stack>
                <Typography variant="body2">Évolution</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Cette note présente l'analyse détaillée des charges de personnel, leur évolution et leur impact sur la performance de l'entreprise.
          </Typography>
        </Alert>
      </Box>

      {/* Onglets */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="Charges détaillées" />
          <Tab label="Effectifs" />
          <Tab label="Analyse" />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      <TabPanel value={tabValue} index={0}>
        {renderTableauCharges()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderTableauEffectifs()}
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
          placeholder="Précisez la politique salariale, les négociations collectives, les plans de formation, les mesures d'optimisation des coûts, l'évolution prévisionnelle des effectifs..."
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

export default Note19SYSCOHADA