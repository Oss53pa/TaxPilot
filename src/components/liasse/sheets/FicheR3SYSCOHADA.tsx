/**
 * Fiche R3 - Participations SYSCOHADA
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Grid,
  TextField,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
  Alert,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Business as BusinessIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  AccountBalance as BankIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material'

interface Participation {
  id: string
  raisonSociale: string
  formeJuridique: string
  secteurActivite: string
  adresse: string
  telephone: string
  email: string
  numeroRccm: string
  capital: number
  pourcentageParticipation: number
  nombreTitres: number
  valeurNominale: number
  valeurComptable: number
  valeurMarche: number
  dividendesRecus: number
  dateAcquisition: string
  modeAcquisition: string
  observations: string
  isFiliale: boolean
  isParticipation: boolean
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
      id={`participation-tabpanel-${index}`}
      aria-labelledby={`participation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

const FORMES_JURIDIQUES = [
  'SARL',
  'SA',
  'SAS',
  'SASU',
  'SNC',
  'SCS',
  'GIE',
  'Autre'
]

const MODES_ACQUISITION = [
  'Apport en nature',
  'Apport en numéraire',
  'Achat',
  'Fusion-acquisition',
  'Augmentation de capital',
  'Héritage/Succession',
  'Autre'
]

const SECTEURS_ACTIVITE = [
  'Agriculture',
  'Industrie manufacturière',
  'BTP',
  'Commerce',
  'Transport',
  'Télécommunications',
  'Services financiers',
  'Immobilier',
  'Services aux entreprises',
  'Santé',
  'Education',
  'Autre'
]

const FicheR3SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [participations, setParticipations] = useState<Participation[]>([])
  const [comment, setComment] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    setParticipations([
      {
        id: '1',
        raisonSociale: '',
        formeJuridique: '',
        secteurActivite: '',
        adresse: '',
        telephone: '',
        email: '',
        numeroRccm: '',
        capital: 0,
        pourcentageParticipation: 0,
        nombreTitres: 0,
        valeurNominale: 0,
        valeurComptable: 0,
        valeurMarche: 0,
        dividendesRecus: 0,
        dateAcquisition: '',
        modeAcquisition: '',
        observations: '',
        isFiliale: false,
        isParticipation: true
      }
    ])
  }

  const handleParticipationChange = (id: string, field: keyof Participation, value: string | number | boolean) => {
    setParticipations(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value }
        
        // Auto-calculer si c'est une filiale (>50%) ou participation (10-50%)
        if (field === 'pourcentageParticipation') {
          const percentage = value as number
          updated.isFiliale = percentage > 50
          updated.isParticipation = percentage >= 10 && percentage <= 50
        }
        
        return updated
      }
      return p
    }))
    setHasChanges(true)
  }

  const addParticipation = () => {
    const newParticipation: Participation = {
      id: Date.now().toString(),
      raisonSociale: '',
      formeJuridique: '',
      secteurActivite: '',
      adresse: '',
      telephone: '',
      email: '',
      numeroRccm: '',
      capital: 0,
      pourcentageParticipation: 0,
      nombreTitres: 0,
      valeurNominale: 0,
      valeurComptable: 0,
      valeurMarche: 0,
      dividendesRecus: 0,
      dateAcquisition: '',
      modeAcquisition: '',
      observations: '',
      isFiliale: false,
      isParticipation: true
    }
    setParticipations(prev => [...prev, newParticipation])
    setHasChanges(true)
  }

  const removeParticipation = (id: string) => {
    if (participations.length > 1) {
      setParticipations(prev => prev.filter(p => p.id !== id))
      setHasChanges(true)
    }
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatCurrency = (value: number) => {
    return `${formatNumber(value)} XOF`
  }

  const handleSave = () => {
    console.log('Sauvegarde Fiche R3:', { participations, comment })
    setHasChanges(false)
  }

  // Calculs et statistiques
  const filiales = participations.filter(p => p.isFiliale)
  const participationsMinoritaires = participations.filter(p => p.isParticipation && !p.isFiliale)
  const totalValeurComptable = participations.reduce((sum, p) => sum + (p.valeurComptable || 0), 0)
  const totalValeurMarche = participations.reduce((sum, p) => sum + (p.valeurMarche || 0), 0)
  const totalDividendes = participations.reduce((sum, p) => sum + (p.dividendesRecus || 0), 0)
  const plusValueLatente = totalValeurMarche - totalValeurComptable

  const getParticipationType = (participation: Participation) => {
    if (participation.pourcentageParticipation > 50) return 'Filiale'
    if (participation.pourcentageParticipation >= 10) return 'Participation'
    return 'Portefeuille'
  }

  const getParticipationColor = (participation: Participation) => {
    if (participation.isFiliale) return 'success'
    if (participation.isParticipation) return 'primary'
    return 'default'
  }

  const renderParticipationTable = (participationsList: Participation[]) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableCell sx={{ fontWeight: 600 }}>Société</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Forme/Secteur</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Participation</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Valorisation</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Dividendes</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {participationsList.map((participation) => (
            <TableRow key={participation.id}>
              <TableCell sx={{ width: 200 }}>
                <Stack spacing={1}>
                  <TextField
                    size="small"
                    label="Raison sociale"
                    value={participation.raisonSociale}
                    onChange={(e) => handleParticipationChange(participation.id, 'raisonSociale', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="N° RCCM"
                    value={participation.numeroRccm}
                    onChange={(e) => handleParticipationChange(participation.id, 'numeroRccm', e.target.value)}
                    fullWidth
                  />
                  <Chip
                    label={getParticipationType(participation)}
                    color={getParticipationColor(participation) as any}
                    size="small"
                  />
                </Stack>
              </TableCell>
              
              <TableCell sx={{ width: 180 }}>
                <Stack spacing={1}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Forme juridique</InputLabel>
                    <Select
                      value={participation.formeJuridique}
                      onChange={(e) => handleParticipationChange(participation.id, 'formeJuridique', e.target.value)}
                    >
                      {FORMES_JURIDIQUES.map((forme) => (
                        <MenuItem key={forme} value={forme}>
                          {forme}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Secteur</InputLabel>
                    <Select
                      value={participation.secteurActivite}
                      onChange={(e) => handleParticipationChange(participation.id, 'secteurActivite', e.target.value)}
                    >
                      {SECTEURS_ACTIVITE.map((secteur) => (
                        <MenuItem key={secteur} value={secteur}>
                          {secteur}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label="Capital social"
                    type="number"
                    value={participation.capital}
                    onChange={(e) => handleParticipationChange(participation.id, 'capital', parseFloat(e.target.value) || 0)}
                    fullWidth
                  />
                </Stack>
              </TableCell>
              
              <TableCell sx={{ width: 180 }}>
                <Stack spacing={1}>
                  <TextField
                    size="small"
                    multiline
                    rows={2}
                    label="Adresse"
                    value={participation.adresse}
                    onChange={(e) => handleParticipationChange(participation.id, 'adresse', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="Téléphone"
                    value={participation.telephone}
                    onChange={(e) => handleParticipationChange(participation.id, 'telephone', e.target.value)}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="Email"
                    value={participation.email}
                    onChange={(e) => handleParticipationChange(participation.id, 'email', e.target.value)}
                    fullWidth
                  />
                </Stack>
              </TableCell>
              
              <TableCell sx={{ width: 150 }}>
                <Stack spacing={1}>
                  <TextField
                    size="small"
                    label="% Participation"
                    type="number"
                    value={participation.pourcentageParticipation}
                    onChange={(e) => handleParticipationChange(participation.id, 'pourcentageParticipation', parseFloat(e.target.value) || 0)}
                    fullWidth
                    InputProps={{ endAdornment: '%' }}
                  />
                  <TextField
                    size="small"
                    label="Nb titres"
                    type="number"
                    value={participation.nombreTitres}
                    onChange={(e) => handleParticipationChange(participation.id, 'nombreTitres', parseFloat(e.target.value) || 0)}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="VN unitaire"
                    type="number"
                    value={participation.valeurNominale}
                    onChange={(e) => handleParticipationChange(participation.id, 'valeurNominale', parseFloat(e.target.value) || 0)}
                    fullWidth
                  />
                </Stack>
              </TableCell>
              
              <TableCell sx={{ width: 150 }}>
                <Stack spacing={1}>
                  <TextField
                    size="small"
                    label="Valeur comptable"
                    type="number"
                    value={participation.valeurComptable}
                    onChange={(e) => handleParticipationChange(participation.id, 'valeurComptable', parseFloat(e.target.value) || 0)}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="Valeur marché"
                    type="number"
                    value={participation.valeurMarche}
                    onChange={(e) => handleParticipationChange(participation.id, 'valeurMarche', parseFloat(e.target.value) || 0)}
                    fullWidth
                  />
                  {participation.valeurMarche !== participation.valeurComptable && (
                    <Chip
                      label={`${participation.valeurMarche > participation.valeurComptable ? '+' : ''}${formatNumber(participation.valeurMarche - participation.valeurComptable)}`}
                      color={participation.valeurMarche > participation.valeurComptable ? "success" : "error"}
                      size="small"
                      icon={participation.valeurMarche > participation.valeurComptable ? <UpIcon /> : <DownIcon />}
                    />
                  )}
                </Stack>
              </TableCell>
              
              <TableCell sx={{ width: 120 }}>
                <Stack spacing={1}>
                  <TextField
                    size="small"
                    label="Dividendes reçus"
                    type="number"
                    value={participation.dividendesRecus}
                    onChange={(e) => handleParticipationChange(participation.id, 'dividendesRecus', parseFloat(e.target.value) || 0)}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label="Date acquisition"
                    type="date"
                    value={participation.dateAcquisition}
                    onChange={(e) => handleParticipationChange(participation.id, 'dateAcquisition', e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel>Mode acquisition</InputLabel>
                    <Select
                      value={participation.modeAcquisition}
                      onChange={(e) => handleParticipationChange(participation.id, 'modeAcquisition', e.target.value)}
                    >
                      {MODES_ACQUISITION.map((mode) => (
                        <MenuItem key={mode} value={mode}>
                          {mode}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </TableCell>
              
              <TableCell sx={{ width: 80 }}>
                <Tooltip title="Supprimer">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeParticipation(participation.id)}
                    disabled={participations.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
            <ChartIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              FICHE R3 - PARTICIPATIONS ET FILIALES
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={addParticipation}
            >
              Ajouter participation
            </Button>
            
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
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                  {filiales.length}
                </Typography>
                <Typography variant="body2">Filiales (&gt;50%)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {participationsMinoritaires.length}
                </Typography>
                <Typography variant="body2">Participations</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totalValeurComptable)}
                </Typography>
                <Typography variant="body2">Valeur comptable</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totalDividendes)}
                </Typography>
                <Typography variant="body2">Dividendes reçus</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alertes financières */}
        {plusValueLatente !== 0 && (
          <Alert 
            severity={plusValueLatente > 0 ? "success" : "warning"} 
            sx={{ mb: 2 }}
            icon={plusValueLatente > 0 ? <UpIcon /> : <DownIcon />}
          >
            <Typography variant="subtitle2">
              {plusValueLatente > 0 ? 'Plus-value latente' : 'Moins-value latente'} de {formatCurrency(Math.abs(plusValueLatente))}
            </Typography>
            <Typography variant="body2">
              Écart entre valeur de marché ({formatCurrency(totalValeurMarche)}) et valeur comptable ({formatCurrency(totalValeurComptable)})
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Onglets */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`Toutes les participations (${participations.length})`} />
          <Tab label={`Filiales (${filiales.length})`} />
          <Tab label={`Participations minoritaires (${participationsMinoritaires.length})`} />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      <TabPanel value={tabValue} index={0}>
        {renderParticipationTable(participations)}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {filiales.length > 0 ? (
          renderParticipationTable(filiales)
        ) : (
          <Alert severity="info">
            Aucune filiale (participation supérieure à 50%) enregistrée.
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {participationsMinoritaires.length > 0 ? (
          renderParticipationTable(participationsMinoritaires)
        ) : (
          <Alert severity="info">
            Aucune participation minoritaire (entre 10% et 50%) enregistrée.
          </Alert>
        )}
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
          <CommentIcon color="action" />
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
          placeholder="Commentaires sur la stratégie de participation, évolution du portefeuille, synergies avec les filiales, perspectives d'investissement..."
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

export default FicheR3SYSCOHADA