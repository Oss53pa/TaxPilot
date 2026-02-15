/**
 * Note 6 - Immobilisations corporelles
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
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material'
import {
  BusinessCenter as ImmobilisationIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Assessment as EvalIcon,
  Info as InfoIcon,
  Home as BuildingIcon,
  DirectionsCar as VehicleIcon,
  Build as EquipmentIcon,
  Computer as ITIcon,
} from '@mui/icons-material'

interface ImmobilisationCorporelle {
  id: string
  categorie: string
  designation: string
  dateAcquisition: string
  valeurAcquisition: number
  valeurReevaluee?: number
  dureeAmortissement: number
  tauxAmortissement: number
  methodeAmortissement: string
  amortissementsCumules: number
  amortissementExercice: number
  valeurNetteComptable: number
  valeurMarche?: number
  cessions: {
    montant: number
    date: string
    plusMoinsValue: number
  }[]
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

const CATEGORIES_IMMOBILISATIONS = [
  { id: 'terrains', label: 'Terrains', icon: BuildingIcon, amortissable: false },
  { id: 'constructions', label: 'Constructions', icon: BuildingIcon, amortissable: true, dureeTypique: 20 },
  { id: 'installations', label: 'Installations techniques', icon: EquipmentIcon, amortissable: true, dureeTypique: 10 },
  { id: 'materiel_outillage', label: 'Matériel et outillage', icon: EquipmentIcon, amortissable: true, dureeTypique: 5 },
  { id: 'materiel_transport', label: 'Matériel de transport', icon: VehicleIcon, amortissable: true, dureeTypique: 4 },
  { id: 'materiel_bureau', label: 'Matériel de bureau', icon: ITIcon, amortissable: true, dureeTypique: 3 },
  { id: 'mobilier', label: 'Mobilier', icon: BuildingIcon, amortissable: true, dureeTypique: 8 },
  { id: 'autres', label: 'Autres immobilisations', icon: EquipmentIcon, amortissable: true, dureeTypique: 5 },
]

const Note6SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [immobilisations, setImmobilisations] = useState<ImmobilisationCorporelle[]>([])
  const [comment, setComment] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    // Charger les données existantes ou créer des exemples
    const initialData: ImmobilisationCorporelle[] = [
      {
        id: '1',
        categorie: 'constructions',
        designation: 'Bâtiment administratif',
        dateAcquisition: '2020-01-15',
        valeurAcquisition: 500000000,
        dureeAmortissement: 20,
        tauxAmortissement: 5,
        methodeAmortissement: 'Linéaire',
        amortissementsCumules: 125000000,
        amortissementExercice: 25000000,
        valeurNetteComptable: 375000000,
        cessions: [],
        observations: ''
      },
      {
        id: '2',
        categorie: 'materiel_transport',
        designation: 'Véhicule de service Toyota Land Cruiser',
        dateAcquisition: '2022-06-10',
        valeurAcquisition: 35000000,
        dureeAmortissement: 4,
        tauxAmortissement: 25,
        methodeAmortissement: 'Linéaire',
        amortissementsCumules: 17500000,
        amortissementExercice: 8750000,
        valeurNetteComptable: 17500000,
        cessions: [],
        observations: ''
      }
    ]
    
    setImmobilisations(initialData)
  }

  const handleImmobilisationChange = (id: string, field: keyof ImmobilisationCorporelle, value: any) => {
    setImmobilisations(prev => prev.map(immo => {
      if (immo.id === id) {
        const updated = { ...immo, [field]: value }
        
        // Recalculer automatiquement
        if (field === 'valeurAcquisition' || field === 'dureeAmortissement' || field === 'dateAcquisition') {
          updated.tauxAmortissement = updated.dureeAmortissement > 0 ? 100 / updated.dureeAmortissement : 0
          updated.amortissementExercice = updated.valeurAcquisition * (updated.tauxAmortissement / 100)
          updated.valeurNetteComptable = updated.valeurAcquisition - updated.amortissementsCumules
        }
        
        return updated
      }
      return immo
    }))
    setHasChanges(true)
  }

  const addImmobilisation = (categorie?: string) => {
    const newImmo: ImmobilisationCorporelle = {
      id: Date.now().toString(),
      categorie: categorie || 'autres',
      designation: '',
      dateAcquisition: new Date().toISOString().split('T')[0],
      valeurAcquisition: 0,
      dureeAmortissement: 5,
      tauxAmortissement: 20,
      methodeAmortissement: 'Linéaire',
      amortissementsCumules: 0,
      amortissementExercice: 0,
      valeurNetteComptable: 0,
      cessions: [],
      observations: ''
    }
    
    setImmobilisations(prev => [...prev, newImmo])
    setHasChanges(true)
  }

  const removeImmobilisation = (id: string) => {
    setImmobilisations(prev => prev.filter(immo => immo.id !== id))
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
    console.log('Sauvegarde Note 6:', { immobilisations, comment })
    setHasChanges(false)
  }

  // Calculs de synthèse
  const syntheseByCategory = CATEGORIES_IMMOBILISATIONS.map(cat => {
    const immosCategorie = immobilisations.filter(immo => immo.categorie === cat.id)
    const valeurBrute = immosCategorie.reduce((sum, immo) => sum + immo.valeurAcquisition, 0)
    const amortissements = immosCategorie.reduce((sum, immo) => sum + immo.amortissementsCumules, 0)
    const valeurNette = immosCategorie.reduce((sum, immo) => sum + immo.valeurNetteComptable, 0)
    
    return {
      ...cat,
      count: immosCategorie.length,
      valeurBrute,
      amortissements,
      valeurNette
    }
  }).filter(cat => cat.count > 0)

  const totaux = {
    valeurBrute: immobilisations.reduce((sum, immo) => sum + immo.valeurAcquisition, 0),
    amortissements: immobilisations.reduce((sum, immo) => sum + immo.amortissementsCumules, 0),
    valeurNette: immobilisations.reduce((sum, immo) => sum + immo.valeurNetteComptable, 0),
    dotationExercice: immobilisations.reduce((sum, immo) => sum + immo.amortissementExercice, 0)
  }

  const renderTableauSynthese = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <EvalIcon sx={{ mr: 1 }} color="primary" />
          Tableau de synthèse
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Nb</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur brute</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Amortissements</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur nette</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Taux amort. moyen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syntheseByCategory.map(cat => {
                const tauxMoyen = cat.valeurBrute > 0 ? (cat.amortissements / cat.valeurBrute * 100) : 0
                return (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <cat.icon fontSize="small" color="action" />
                        <Typography variant="body2">{cat.label}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{cat.count}</TableCell>
                    <TableCell align="right">{formatCurrency(cat.valeurBrute)}</TableCell>
                    <TableCell align="right">{formatCurrency(cat.amortissements)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {formatCurrency(cat.valeurNette)}
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={`${tauxMoyen.toFixed(1)}%`}
                        size="small"
                        color={tauxMoyen > 80 ? "error" : tauxMoyen > 50 ? "warning" : "default"}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), fontWeight: 600 }}>
                <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{immobilisations.length}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(totaux.valeurBrute)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(totaux.amortissements)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(totaux.valeurNette)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {totaux.valeurBrute > 0 ? `${(totaux.amortissements / totaux.valeurBrute * 100).toFixed(1)}%` : '-'}
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
            <ImmobilisationIcon sx={{ mr: 1 }} color="primary" />
            Détail des immobilisations corporelles
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => addImmobilisation()}
          >
            Ajouter
          </Button>
        </Stack>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Désignation</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date acquisition</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur acquisition</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Durée</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Amort. cumulés</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur nette</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {immobilisations.map(immo => {
                void CATEGORIES_IMMOBILISATIONS.find(cat => cat.id === immo.categorie)
                return (
                  <TableRow key={immo.id}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={immo.designation}
                        onChange={(e) => handleImmobilisationChange(immo.id, 'designation', e.target.value)}
                        placeholder="Description de l'immobilisation..."
                        fullWidth
                        sx={{ minWidth: 200 }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={immo.categorie}
                          onChange={(e) => handleImmobilisationChange(immo.id, 'categorie', e.target.value)}
                        >
                          {CATEGORIES_IMMOBILISATIONS.map(cat => (
                            <MenuItem key={cat.id} value={cat.id}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <cat.icon fontSize="small" />
                                <Typography variant="body2">{cat.label}</Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    
                    <TableCell>
                      <TextField
                        size="small"
                        type="date"
                        value={immo.dateAcquisition}
                        onChange={(e) => handleImmobilisationChange(immo.id, 'dateAcquisition', e.target.value)}
                        sx={{ width: 140 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={immo.valeurAcquisition}
                        onChange={(e) => handleImmobilisationChange(immo.id, 'valeurAcquisition', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={immo.dureeAmortissement}
                        onChange={(e) => handleImmobilisationChange(immo.id, 'dureeAmortissement', parseInt(e.target.value) || 0)}
                        sx={{ width: 80 }}
                        InputProps={{ endAdornment: 'ans' }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
                        {formatCurrency(immo.amortissementsCumules)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(immo.valeurNetteComptable)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeImmobilisation(immo.id)}
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
            <ImmobilisationIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              NOTE 6 - IMMOBILISATIONS CORPORELLES (en FCFA)
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

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Cette note détaille la composition et l'évolution des immobilisations corporelles selon les principes SYSCOHADA.
          </Typography>
        </Alert>

        {/* Indicateurs de synthèse */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.valeurBrute)}
                </Typography>
                <Typography variant="body2">Valeur brute</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.error.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.amortissements)}
                </Typography>
                <Typography variant="body2">Amortissements</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.valeurNette)}
                </Typography>
                <Typography variant="body2">Valeur nette</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.dotationExercice)}
                </Typography>
                <Typography variant="body2">Dotation exercice</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Onglets */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="Synthèse" />
          <Tab label="Détail" />
          <Tab label="Méthodes comptables" />
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
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Méthodes d'évaluation et d'amortissement
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Évaluation initiale :</strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  Les immobilisations corporelles sont comptabilisées au coût d'acquisition ou de production, 
                  qui comprend le prix d'achat et tous les frais directement attribuables nécessaires 
                  à la mise en état d'utilisation du bien.
                </Typography>
                
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Amortissements :</strong>
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Méthode linéaire"
                      secondary="Répartition uniforme sur la durée d'utilité"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Durées d'amortissement"
                      secondary="Conformes aux usages de la profession et à la réglementation fiscale"
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Durées d'amortissement usuelles :</strong>
                </Typography>
                <Table size="small">
                  <TableBody>
                    {CATEGORIES_IMMOBILISATIONS.filter(cat => cat.amortissable).map(cat => (
                      <TableRow key={cat.id}>
                        <TableCell>{cat.label}</TableCell>
                        <TableCell align="right">{cat.dureeTypique} ans</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
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
          placeholder="Précisez les méthodes d'évaluation spécifiques, les réévaluations éventuelles, les nantissements, hypothèques ou autres sûretés grevant les immobilisations..."
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

export default Note6SYSCOHADA