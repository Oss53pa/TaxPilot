/**
 * Note 11 - Capital social
 */

import React, { useState } from 'react'
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
} from '@mui/material'
import {
  AccountBalance as CapitalIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as ShareholderIcon,
  Timeline as EvolutionIcon,
  PieChart as DistributionIcon,
  Info as InfoIcon,
  Business as CorporateIcon,
  Groups as GroupIcon,
  TrendingUp as IncreaseIcon,
} from '@mui/icons-material'
import { formatNumber, formatCurrency } from '@/utils/formatting'
import { useBalanceData } from '@/hooks/useBalanceData'
import { TabPanel } from '@/components/shared/TabPanel'
import { SheetHeader } from '@/components/liasse/common/SheetHeader'

interface Actionnaire {
  id: string
  nom: string
  type: 'personne_physique' | 'personne_morale'
  nationalite: string
  nombreActions: number
  valeurNominale: number
  montantCapital: number
  pourcentage: number
  droitsVote: number
  dateEntree: string
  observations: string
}

interface MouvementCapital {
  id: string
  date: string
  type: 'augmentation' | 'reduction' | 'constitution'
  montant: number
  nombreActions: number
  prime: number
  nature: string
  description: string
}

const TYPES_ACTIONNAIRES = [
  { id: 'personne_physique', label: 'Personne physique', icon: ShareholderIcon },
  { id: 'personne_morale', label: 'Personne morale', icon: CorporateIcon }
]

const NATURES_AUGMENTATION = [
  'Apport en numéraire',
  'Apport en nature',
  'Incorporation de réserves',
  'Conversion de dettes',
  'Exercice d\'options',
  'Autre'
]

const Note11SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const bal = useBalanceData()
  const [tabValue, setTabValue] = useState(0)
  const [actionnaires, setActionnaires] = useState<Actionnaire[]>([])
  const [mouvements, setMouvements] = useState<MouvementCapital[]>([])
  const [capitalInfo, _setCapitalInfo] = useState(() => {
    // Capital social calculé depuis la balance importée
    const cs = bal.c(['101'])
    const cna = bal.d(['109'])
    const pe = bal.c(['104', '105'])
    const vn = 10000
    return {
      capitalSocial: cs,
      nombreActionsTotal: cs > 0 ? Math.round(cs / vn) : 0,
      valeurNominale: vn,
      capitalLibere: cs - cna,
      capitalNonAppele: cna,
      primeEmission: pe,
      dateConstitution: '',
      formeJuridique: 'SA',
      bourseInscription: ''
    }
  })
  const [comment, setComment] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const handleActionnaireChange = (id: string, field: keyof Actionnaire, value: any) => {
    setActionnaires(prev => prev.map(actionnaire => {
      if (actionnaire.id === id) {
        const updated = { ...actionnaire, [field]: value }
        
        // Recalculer le montant et pourcentage
        if (field === 'nombreActions' || field === 'valeurNominale') {
          updated.montantCapital = updated.nombreActions * updated.valeurNominale
          updated.pourcentage = (updated.nombreActions / capitalInfo.nombreActionsTotal) * 100
          updated.droitsVote = updated.pourcentage // Par défaut, droits de vote = % capital
        }
        
        return updated
      }
      return actionnaire
    }))
    setHasChanges(true)
  }

  const addActionnaire = () => {
    const newActionnaire: Actionnaire = {
      id: Date.now().toString(),
      nom: '',
      type: 'personne_physique',
      nationalite: 'Bénin',
      nombreActions: 0,
      valeurNominale: capitalInfo.valeurNominale,
      montantCapital: 0,
      pourcentage: 0,
      droitsVote: 0,
      dateEntree: new Date().toISOString().split('T')[0],
      observations: ''
    }
    
    setActionnaires(prev => [...prev, newActionnaire])
    setHasChanges(true)
  }

  const removeActionnaire = (id: string) => {
    setActionnaires(prev => prev.filter(a => a.id !== id))
    setHasChanges(true)
  }

  const addMouvement = () => {
    const newMouvement: MouvementCapital = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'augmentation',
      montant: 0,
      nombreActions: 0,
      prime: 0,
      nature: 'Apport en numéraire',
      description: ''
    }
    
    setMouvements(prev => [...prev, newMouvement])
    setHasChanges(true)
  }

  const removeMouvement = (id: string) => {
    setMouvements(prev => prev.filter(m => m.id !== id))
    setHasChanges(true)
  }

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const handleSave = () => {
    setHasChanges(false)
  }

  // Calculs de synthèse
  const totalActions = actionnaires.reduce((sum, a) => sum + a.nombreActions, 0)
  const totalCapital = actionnaires.reduce((sum, a) => sum + a.montantCapital, 0)
  const tauxLiberation = capitalInfo.capitalNonAppele > 0 
    ? ((capitalInfo.capitalLibere / capitalInfo.capitalSocial) * 100) 
    : 100

  // Concentration du capital
  const actionnairePrincipal = actionnaires.reduce((max, a) => 
    a.pourcentage > max.pourcentage ? a : max, actionnaires[0])
  
  // Répartition par type
  const repartitionType = TYPES_ACTIONNAIRES.map(type => {
    const actionnairesType = actionnaires.filter(a => a.type === type.id)
    const montant = actionnairesType.reduce((sum, a) => sum + a.montantCapital, 0)
    const pourcentage = totalCapital > 0 ? (montant / totalCapital) * 100 : 0
    
    return {
      ...type,
      count: actionnairesType.length,
      montant,
      pourcentage
    }
  })

  const renderCompositionCapital = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <GroupIcon sx={{ mr: 1 }} color="primary" />
          Composition du capital social
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Actionnaire</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nationalité</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Nb actions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>VN unitaire</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Montant capital</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>% Capital</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>% Droits vote</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actionnaires.map(actionnaire => {
                const TypeIcon = actionnaire.type === 'personne_morale' ? CorporateIcon : ShareholderIcon
                const isMajoritaire = actionnaire.pourcentage > 50
                const isSignificatif = actionnaire.pourcentage >= 10
                
                return (
                  <TableRow 
                    key={actionnaire.id}
                    sx={{
                      backgroundColor: isMajoritaire 
                        ? alpha(theme.palette.success.main, 0.05) 
                        : isSignificatif 
                        ? alpha(theme.palette.info.main, 0.05)
                        : 'transparent'
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <TypeIcon fontSize="small" color="action" />
                        <TextField
                          size="small"
                          value={actionnaire.nom}
                          onChange={(e) => handleActionnaireChange(actionnaire.id, 'nom', e.target.value)}
                          placeholder="Nom de l'actionnaire..."
                          fullWidth
                          sx={{ minWidth: 200 }}
                        />
                      </Stack>
                    </TableCell>
                    
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={actionnaire.type}
                          onChange={(e) => handleActionnaireChange(actionnaire.id, 'type', e.target.value)}
                        >
                          {TYPES_ACTIONNAIRES.map(type => (
                            <MenuItem key={type.id} value={type.id}>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <type.icon fontSize="small" />
                                <Typography variant="body2">{type.label}</Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    
                    <TableCell>
                      <TextField
                        size="small"
                        value={actionnaire.nationalite}
                        onChange={(e) => handleActionnaireChange(actionnaire.id, 'nationalite', e.target.value)}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={actionnaire.nombreActions}
                        onChange={(e) => handleActionnaireChange(actionnaire.id, 'nombreActions', parseInt(e.target.value) || 0)}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(actionnaire.valeurNominale)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(actionnaire.montantCapital)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Chip
                        label={formatPercent(actionnaire.pourcentage)}
                        size="small"
                        color={isMajoritaire ? "success" : isSignificatif ? "primary" : "default"}
                        variant={isMajoritaire ? "filled" : "outlined"}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={actionnaire.droitsVote}
                        onChange={(e) => handleActionnaireChange(actionnaire.id, 'droitsVote', parseFloat(e.target.value) || 0)}
                        sx={{ width: 80 }}
                        InputProps={{ endAdornment: '%' }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeActionnaire(actionnaire.id)}
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
                <TableCell sx={{ fontWeight: 600 }} colSpan={3}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatNumber(totalActions)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>-</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totalCapital)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>100.00%</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>100.00%</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addActionnaire}
          >
            Ajouter actionnaire
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )

  const renderEvolutionCapital = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <EvolutionIcon sx={{ mr: 1 }} color="primary" />
          Évolution du capital social
        </Typography>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.info.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Opération</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nature</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Montant</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Nb actions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Prime émission</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mouvements
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(mouvement => (
                  <TableRow key={mouvement.id}>
                    <TableCell>
                      <TextField
                        size="small"
                        type="date"
                        value={mouvement.date}
                        onChange={(e) => {
                          setMouvements(prev => prev.map(m => 
                            m.id === mouvement.id ? { ...m, date: e.target.value } : m
                          ))
                          setHasChanges(true)
                        }}
                        sx={{ width: 140 }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={
                          mouvement.type === 'augmentation' ? 'Augmentation' :
                          mouvement.type === 'reduction' ? 'Réduction' : 'Constitution'
                        }
                        size="small"
                        color={
                          mouvement.type === 'augmentation' ? 'success' :
                          mouvement.type === 'reduction' ? 'error' : 'primary'
                        }
                        icon={mouvement.type === 'augmentation' ? <IncreaseIcon /> : undefined}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={mouvement.nature}
                          onChange={(e) => {
                            setMouvements(prev => prev.map(m => 
                              m.id === mouvement.id ? { ...m, nature: e.target.value } : m
                            ))
                            setHasChanges(true)
                          }}
                        >
                          {NATURES_AUGMENTATION.map(nature => (
                            <MenuItem key={nature} value={nature}>
                              {nature}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={mouvement.montant}
                        onChange={(e) => {
                          setMouvements(prev => prev.map(m => 
                            m.id === mouvement.id ? { ...m, montant: parseFloat(e.target.value) || 0 } : m
                          ))
                          setHasChanges(true)
                        }}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={mouvement.nombreActions}
                        onChange={(e) => {
                          setMouvements(prev => prev.map(m => 
                            m.id === mouvement.id ? { ...m, nombreActions: parseInt(e.target.value) || 0 } : m
                          ))
                          setHasChanges(true)
                        }}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={mouvement.prime}
                        onChange={(e) => {
                          setMouvements(prev => prev.map(m => 
                            m.id === mouvement.id ? { ...m, prime: parseFloat(e.target.value) || 0 } : m
                          ))
                          setHasChanges(true)
                        }}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <TextField
                        size="small"
                        value={mouvement.description}
                        onChange={(e) => {
                          setMouvements(prev => prev.map(m => 
                            m.id === mouvement.id ? { ...m, description: e.target.value } : m
                          ))
                          setHasChanges(true)
                        }}
                        fullWidth
                        multiline
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeMouvement(mouvement.id)}
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

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={addMouvement}
          >
            Ajouter mouvement
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )

  const renderAnalyse = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <DistributionIcon sx={{ mr: 1 }} color="primary" />
              Répartition par type d'actionnaire
            </Typography>
            
            {repartitionType.map(type => {
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
                    {type.count} actionnaire(s) - {formatCurrency(type.montant)}
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
              Informations clés
            </Typography>
            
            <Stack spacing={2}>
              <Alert severity="info">
                <Typography variant="subtitle2">Actionnaire principal</Typography>
                <Typography variant="body2">
                  {actionnairePrincipal?.nom} détient {formatPercent(actionnairePrincipal?.pourcentage || 0)} du capital
                </Typography>
              </Alert>
              
              <Alert severity={tauxLiberation === 100 ? "success" : "warning"}>
                <Typography variant="subtitle2">Libération du capital</Typography>
                <Typography variant="body2">
                  Capital libéré à {formatPercent(tauxLiberation)}
                </Typography>
                {capitalInfo.capitalNonAppele > 0 && (
                  <Typography variant="caption">
                    Montant non appelé : {formatCurrency(capitalInfo.capitalNonAppele)}
                  </Typography>
                )}
              </Alert>
              
              {capitalInfo.primeEmission > 0 && (
                <Alert severity="success">
                  <Typography variant="subtitle2">Prime d'émission</Typography>
                  <Typography variant="body2">
                    {formatCurrency(capitalInfo.primeEmission)}
                  </Typography>
                </Alert>
              )}
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
        <SheetHeader title="NOTE 11 - CAPITAL SOCIAL (en FCFA)" icon={<CapitalIcon />} />
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
                  {formatCurrency(capitalInfo.capitalSocial)}
                </Typography>
                <Typography variant="body2">Capital social</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                  {formatNumber(capitalInfo.nombreActionsTotal)}
                </Typography>
                <Typography variant="body2">Actions</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(capitalInfo.valeurNominale)}
                </Typography>
                <Typography variant="body2">Valeur nominale</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {actionnaires.length}
                </Typography>
                <Typography variant="body2">Actionnaires</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            Cette note présente la composition du capital social, sa répartition entre actionnaires et son évolution.
          </Typography>
        </Alert>
      </Box>

      {/* Onglets */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="Composition" />
          <Tab label="Évolution" />
          <Tab label="Analyse" />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      <TabPanel value={tabValue} index={0}>
        {renderCompositionCapital()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderEvolutionCapital()}
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
          placeholder="Précisez les conditions particulières attachées aux actions, les pactes d'actionnaires, les options ou promesses de vente/achat, les autorisations d'augmentation de capital..."
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

export default Note11SYSCOHADA