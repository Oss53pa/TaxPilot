/**
 * Note 17 - Chiffre d'affaires
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
  Tabs,
  Tab,
} from '@mui/material'
import {
  MonetizationOn as RevenueIcon,
  Save as SaveIcon,
  TrendingUp as GrowthIcon,
  TrendingDown as DeclineIcon,
  Timeline as TrendIcon,
  Public as ExportSalesIcon,
  Home as DomesticIcon,
  Assessment as AnalysisIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { formatCurrency } from '@/utils/formatting'
import { TabPanel } from '@/components/shared/TabPanel'
import { SheetHeader } from '@/components/liasse/common/SheetHeader'

interface ChiffreAffaires {
  id: string
  designation: string
  secteur: string
  zone: 'national' | 'export' | 'regional'
  montantN: number
  montantN1: number
  evolution: number
  pourcentage: number
  commentaire: string
}

interface ChiffreAffairesParPeriode {
  periode: string
  montant: number
  croissance: number
}

interface MontantsComparatifs {
  montantN: number
  montantN1: number
  evolution?: number
  pourcentageCA?: number
}

const SECTEURS_ACTIVITE = [
  'Vente de marchandises',
  'Production de biens',
  'Prestations de services',
  'Négoce international',
  'Distribution',
  'Manufacturing',
  'Conseil',
  'Formation',
  'Transport',
  'Logistique',
  'Autre'
]

const ZONES_GEOGRAPHIQUES = [
  { id: 'national', label: 'Marché national', icon: DomesticIcon },
  { id: 'regional', label: 'Marché régional (UEMOA/CEMAC)', icon: ExportSalesIcon },
  { id: 'export', label: 'Export international', icon: ExportSalesIcon }
]

const Note17SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [chiffresAffaires, setChiffresAffaires] = useState<ChiffreAffaires[]>([])
  const [evolutionMensuelle, setEvolutionMensuelle] = useState<ChiffreAffairesParPeriode[]>([])
  const [comment, setComment] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    // Données de chiffre d'affaires par secteur/zone
    const initialCA: ChiffreAffaires[] = [
      {
        id: '1',
        designation: 'Vente de produits alimentaires',
        secteur: 'Vente de marchandises',
        zone: 'national',
        montantN: 2500000000,
        montantN1: 2200000000,
        evolution: 13.6,
        pourcentage: 60,
        commentaire: 'Croissance due à l\'expansion géographique'
      },
      {
        id: '2',
        designation: 'Services de transport',
        secteur: 'Prestations de services',
        zone: 'regional',
        montantN: 800000000,
        montantN1: 750000000,
        evolution: 6.7,
        pourcentage: 20,
        commentaire: 'Nouveaux contrats avec partenaires régionaux'
      },
      {
        id: '3',
        designation: 'Export matières premières',
        secteur: 'Négoce international',
        zone: 'export',
        montantN: 700000000,
        montantN1: 800000000,
        evolution: -12.5,
        pourcentage: 17,
        commentaire: 'Impact de la conjoncture internationale'
      },
      {
        id: '4',
        designation: 'Services conseil',
        secteur: 'Conseil',
        zone: 'national',
        montantN: 120000000,
        montantN1: 90000000,
        evolution: 33.3,
        pourcentage: 3,
        commentaire: 'Développement de nouvelles activités'
      }
    ]

    // Évolution mensuelle de l'exercice
    const evolutionData: ChiffreAffairesParPeriode[] = [
      { periode: 'Janvier', montant: 320000000, croissance: 5.2 },
      { periode: 'Février', montant: 298000000, croissance: -1.8 },
      { periode: 'Mars', montant: 365000000, croissance: 12.4 },
      { periode: 'Avril', montant: 340000000, croissance: 8.3 },
      { periode: 'Mai', montant: 355000000, croissance: 15.2 },
      { periode: 'Juin', montant: 380000000, croissance: 18.7 },
      { periode: 'Juillet', montant: 342000000, croissance: 6.8 },
      { periode: 'Août', montant: 325000000, croissance: 2.1 },
      { periode: 'Septembre', montant: 368000000, croissance: 14.5 },
      { periode: 'Octobre', montant: 385000000, croissance: 19.2 },
      { periode: 'Novembre', montant: 352000000, croissance: 10.8 },
      { periode: 'Décembre', montant: 390000000, croissance: 22.1 }
    ]

    setChiffresAffaires(initialCA)
    setEvolutionMensuelle(evolutionData)
  }

  const handleCAChange = (id: string, field: keyof ChiffreAffaires, value: any) => {
    setChiffresAffaires(prev => prev.map(ca => {
      if (ca.id === id) {
        const updated = { ...ca, [field]: value }
        
        // Recalculer l'évolution si montants changés
        if (field === 'montantN' || field === 'montantN1') {
          if (updated.montantN1 > 0) {
            updated.evolution = ((updated.montantN - updated.montantN1) / updated.montantN1) * 100
          }
        }
        
        return updated
      }
      return ca
    }))
    
    // Recalculer les pourcentages
    const totalCA = chiffresAffaires.reduce((sum, ca) => sum + (ca.id === id ? (value as number) : ca.montantN), 0)
    if (totalCA > 0) {
      setChiffresAffaires(prev => prev.map(ca => ({
        ...ca,
        pourcentage: (ca.montantN / totalCA) * 100
      })))
    }
    
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
    montantN: chiffresAffaires.reduce((sum, ca) => sum + ca.montantN, 0),
    montantN1: chiffresAffaires.reduce((sum, ca) => sum + ca.montantN1, 0)
  }
  totaux.evolution = totaux.montantN1 > 0 ? ((totaux.montantN - totaux.montantN1) / totaux.montantN1) * 100 : 0

  // Répartition par zone géographique
  const repartitionZone = ZONES_GEOGRAPHIQUES.map(zone => {
    const montant = chiffresAffaires
      .filter(ca => ca.zone === zone.id)
      .reduce((sum, ca) => sum + ca.montantN, 0)
    return {
      ...zone,
      montant,
      pourcentage: totaux.montantN > 0 ? (montant / totaux.montantN) * 100 : 0
    }
  })

  const renderTableauSynthese = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <AnalysisIcon sx={{ mr: 1 }} color="primary" />
          Analyse du chiffre d'affaires
        </Typography>
        
        <Grid container spacing={3}>
          {/* Évolution globale */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                  {formatCurrency(totaux.montantN)}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Chiffre d'affaires N
                </Typography>
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                  {(totaux.evolution ?? 0) > 0 ? <GrowthIcon color="success" /> : <DeclineIcon color="error" />}
                  <Typography
                    variant="h6"
                    color={(totaux.evolution ?? 0) > 0 ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 600 }}
                  >
                    {(totaux.evolution ?? 0) > 0 ? '+' : ''}{formatPercent(totaux.evolution ?? 0)}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="textSecondary">
                  vs {formatCurrency(totaux.montantN1)} (N-1)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Top 3 activités */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Top 3 activités
                </Typography>
                {chiffresAffaires
                  .sort((a, b) => b.montantN - a.montantN)
                  .slice(0, 3)
                  .map((ca, index) => (
                    <Box key={ca.id} sx={{ mb: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {index + 1}. {ca.designation.substring(0, 25)}...
                        </Typography>
                        <Chip 
                          label={formatPercent(ca.pourcentage)} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  ))
                }
              </CardContent>
            </Card>
          </Grid>

          {/* Répartition géographique */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Répartition géographique
                </Typography>
                {repartitionZone.map(zone => {
                  const IconComponent = zone.icon
                  return (
                    <Box key={zone.id} sx={{ mb: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconComponent fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {zone.label}
                          </Typography>
                        </Stack>
                        <Chip 
                          label={formatPercent(zone.pourcentage)} 
                          size="small" 
                          color="secondary"
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                  )
                })}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )

  const renderTableauDetail = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <RevenueIcon sx={{ mr: 1 }} color="primary" />
          Détail par activité et zone géographique
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Activité</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Secteur</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Zone</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>CA N-1</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>CA N</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Évolution</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>% du CA</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Commentaire</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chiffresAffaires.map(ca => {
                return (
                  <TableRow key={ca.id}>
                    <TableCell sx={{ minWidth: 200 }}>
                      <TextField
                        size="small"
                        value={ca.designation}
                        onChange={(e) => handleCAChange(ca.id, 'designation', e.target.value)}
                        placeholder="Désignation de l'activité..."
                        fullWidth
                      />
                    </TableCell>
                    
                    <TableCell sx={{ minWidth: 150 }}>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={ca.secteur}
                          onChange={(e) => handleCAChange(ca.id, 'secteur', e.target.value)}
                        >
                          {SECTEURS_ACTIVITE.map(secteur => (
                            <MenuItem key={secteur} value={secteur}>
                              {secteur}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    
                    <TableCell sx={{ minWidth: 120 }}>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={ca.zone}
                          onChange={(e) => handleCAChange(ca.id, 'zone', e.target.value)}
                        >
                          {ZONES_GEOGRAPHIQUES.map(zone => {
                            const IconComponent = zone.icon
                            return (
                              <MenuItem key={zone.id} value={zone.id}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <IconComponent fontSize="small" />
                                  <Typography variant="body2">{zone.label}</Typography>
                                </Stack>
                              </MenuItem>
                            )
                          })}
                        </Select>
                      </FormControl>
                    </TableCell>
                    
                    <TableCell align="right" sx={{ minWidth: 120 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={ca.montantN1}
                        onChange={(e) => handleCAChange(ca.id, 'montantN1', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    
                    <TableCell align="right" sx={{ minWidth: 120 }}>
                      <TextField
                        size="small"
                        type="number"
                        value={ca.montantN}
                        onChange={(e) => handleCAChange(ca.id, 'montantN', parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    
                    <TableCell align="right" sx={{ minWidth: 100 }}>
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                        {ca.evolution > 0 ? <GrowthIcon fontSize="small" color="success" /> : <DeclineIcon fontSize="small" color="error" />}
                        <Typography 
                          variant="body2" 
                          color={ca.evolution > 0 ? 'success.main' : 'error.main'}
                          sx={{ fontWeight: 500 }}
                        >
                          {ca.evolution > 0 ? '+' : ''}{formatPercent(ca.evolution)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    
                    <TableCell align="right" sx={{ minWidth: 80 }}>
                      <Chip
                        label={formatPercent(ca.pourcentage)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell sx={{ minWidth: 200 }}>
                      <TextField
                        size="small"
                        value={ca.commentaire}
                        onChange={(e) => handleCAChange(ca.id, 'commentaire', e.target.value)}
                        placeholder="Commentaire..."
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
              
              {/* Ligne de total */}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), fontWeight: 600 }}>
                <TableCell sx={{ fontWeight: 600 }} colSpan={3}>TOTAL GÉNÉRAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.montantN1)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.montantN)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                    {(totaux.evolution ?? 0) > 0 ? <GrowthIcon fontSize="small" color="success" /> : <DeclineIcon fontSize="small" color="error" />}
                    <Typography
                      variant="body2"
                      color={(totaux.evolution ?? 0) > 0 ? 'success.main' : 'error.main'}
                      sx={{ fontWeight: 600 }}
                    >
                      {(totaux.evolution ?? 0) > 0 ? '+' : ''}{formatPercent(totaux.evolution ?? 0)}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>100.0%</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const renderEvolutionMensuelle = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <TrendIcon sx={{ mr: 1 }} color="primary" />
          Évolution mensuelle de l'exercice
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Mois</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Montant</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Croissance vs N-1</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>% du CA annuel</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tendance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evolutionMensuelle.map((periode, _index) => (
                <TableRow key={periode.periode}>
                  <TableCell>{periode.periode}</TableCell>
                  <TableCell align="right">{formatCurrency(periode.montant)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                      {periode.croissance > 0 ? <GrowthIcon fontSize="small" color="success" /> : <DeclineIcon fontSize="small" color="error" />}
                      <Typography 
                        variant="body2" 
                        color={periode.croissance > 0 ? 'success.main' : 'error.main'}
                      >
                        {periode.croissance > 0 ? '+' : ''}{formatPercent(periode.croissance)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    {formatPercent((periode.montant / totaux.montantN) * 100)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        periode.croissance > 10 ? 'Forte croissance' :
                        periode.croissance > 0 ? 'Croissance' :
                        periode.croissance > -5 ? 'Stable' : 'Baisse'
                      }
                      color={
                        periode.croissance > 10 ? 'success' :
                        periode.croissance > 0 ? 'info' :
                        periode.croissance > -5 ? 'warning' : 'error'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Analyse :</strong> Le chiffre d'affaires présente une croissance soutenue avec des pics en juin, octobre et décembre. 
            La croissance moyenne mensuelle est de {formatPercent(evolutionMensuelle.reduce((sum, p) => sum + p.croissance, 0) / evolutionMensuelle.length)}.
          </Typography>
        </Alert>
      </CardContent>
    </Card>
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
        <SheetHeader title="NOTE 17 - CHIFFRE D'AFFAIRES (en FCFA)" icon={<RevenueIcon />} />
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

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Cette note présente l'analyse détaillée du chiffre d'affaires par secteur d'activité et zone géographique.
          </Typography>
        </Alert>

        {/* Indicateurs clés */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.montantN)}
                </Typography>
                <Typography variant="body2">CA Exercice N</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.montantN1)}
                </Typography>
                <Typography variant="body2">CA Exercice N-1</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                  {(totaux.evolution ?? 0) > 0 ? <GrowthIcon color="success" /> : <DeclineIcon color="error" />}
                  <Typography variant="h6" color={(totaux.evolution ?? 0) > 0 ? "success.main" : "error.main"} sx={{ fontWeight: 600 }}>
                    {(totaux.evolution ?? 0) > 0 ? '+' : ''}{formatPercent(totaux.evolution ?? 0)}
                  </Typography>
                </Stack>
                <Typography variant="body2">Évolution</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {chiffresAffaires.length}
                </Typography>
                <Typography variant="body2">Activités</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Onglets */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="Synthèse" />
          <Tab label="Détail par activité" />
          <Tab label="Évolution mensuelle" />
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
        {renderEvolutionMensuelle()}
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
            Commentaires sur l'évolution du chiffre d'affaires
          </Typography>
        </Stack>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Analysez les facteurs d'évolution, les nouveaux marchés, l'impact de la conjoncture, les perspectives de croissance, les saisonnalités..."
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

export default Note17SYSCOHADA