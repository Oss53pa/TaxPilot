/**
 * Note 11 - Capital social et réserves
 * Connecté aux données de la balance (comptes 10x, 11x, 12, 13)
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
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material'
import {
  AccountBalance as CapitalIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as ShareholderIcon,
  Timeline as EvolutionIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { liasseDataService } from '../../../services/liasseDataService'

interface Actionnaire {
  id: string
  nom: string
  type: string
  nombreActions: number
  pourcentage: number
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

const Note11SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [capitalData, setCapitalData] = useState({
    capitalSocial: 0,
    primes: 0,
    ecartReevaluation: 0,
    capitalNonAppele: 0,
    reserves: 0,
    reportNouveau: 0,
    resultat: 0,
  })
  const [actionnaires, setActionnaires] = useState<Actionnaire[]>([])
  const [hasData, setHasData] = useState(false)
  const [comment, setComment] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadDataFromBalance()
  }, [])

  const loadDataFromBalance = () => {
    if (!liasseDataService.isLoaded()) {
      setHasData(false)
      return
    }
    const data = liasseDataService.generateNote11()
    setCapitalData(data)
    setHasData(data.capitalSocial > 0 || data.reserves > 0 || data.resultat !== 0)
  }

  const formatNumber = (value: number) => {
    if (!value || value === 0) return '-'
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value))
  }

  const formatCurrency = (value: number) => {
    if (!value || value === 0) return '-'
    const prefix = value < 0 ? '-' : ''
    return `${prefix}${formatNumber(value)} XOF`
  }

  const totalCapitauxPropres = capitalData.capitalSocial - capitalData.capitalNonAppele +
    capitalData.primes + capitalData.ecartReevaluation + capitalData.reserves +
    (capitalData.reportNouveau < 0 ? capitalData.reportNouveau : capitalData.reportNouveau) +
    (capitalData.resultat < 0 ? capitalData.resultat : capitalData.resultat)

  const addActionnaire = () => {
    setActionnaires(prev => [...prev, {
      id: Date.now().toString(),
      nom: '',
      type: 'personne_physique',
      nombreActions: 0,
      pourcentage: 0,
    }])
    setHasChanges(true)
  }

  const removeActionnaire = (id: string) => {
    setActionnaires(prev => prev.filter(a => a.id !== id))
    setHasChanges(true)
  }

  const renderSituationCapitaux = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <CapitalIcon sx={{ mr: 1 }} color="primary" />
          Situation des capitaux propres (comptes de la balance)
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Poste</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Comptes</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Exercice N</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Exercice N-1</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Capital social</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>101-104</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{formatCurrency(capitalData.capitalSocial)}</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.secondary }}>-</TableCell>
              </TableRow>
              {capitalData.capitalNonAppele > 0 && (
                <TableRow>
                  <TableCell sx={{ color: 'error.main' }}>(-) Actionnaires, capital non appelé</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>109</TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'error.main' }}>({formatNumber(capitalData.capitalNonAppele)} XOF)</TableCell>
                  <TableCell align="right" sx={{ color: theme.palette.text.secondary }}>-</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell>Primes liées au capital</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>105</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatCurrency(capitalData.primes)}</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.secondary }}>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Écarts de réévaluation</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>106</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatCurrency(capitalData.ecartReevaluation)}</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.secondary }}>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Réserves</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>111-118</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatCurrency(capitalData.reserves)}</TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.secondary }}>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Report à nouveau</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>12</TableCell>
                <TableCell align="right" sx={{
                  fontFamily: 'monospace',
                  color: capitalData.reportNouveau < 0 ? 'error.main' : 'inherit'
                }}>
                  {capitalData.reportNouveau !== 0 ? formatCurrency(capitalData.reportNouveau) : '-'}
                </TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.secondary }}>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Résultat net de l'exercice</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>13</TableCell>
                <TableCell align="right" sx={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: capitalData.resultat < 0 ? 'error.main' : 'success.main'
                }}>
                  {capitalData.resultat !== 0 ? formatCurrency(capitalData.resultat) : '-'}
                </TableCell>
                <TableCell align="right" sx={{ color: theme.palette.text.secondary }}>-</TableCell>
              </TableRow>
              {/* TOTAL */}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 700 }} colSpan={2}>TOTAL CAPITAUX PROPRES</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                  {formatCurrency(totalCapitauxPropres)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.text.secondary }}>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )

  const renderCompositionCapital = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <ShareholderIcon sx={{ mr: 1 }} color="primary" />
          Composition du capital social (saisie manuelle)
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          La répartition du capital entre actionnaires n'est pas disponible dans la balance comptable.
          Veuillez saisir manuellement les informations ci-dessous.
        </Alert>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Actionnaire</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Nombre d'actions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>% Capital</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {actionnaires.map(actionnaire => (
                <TableRow key={actionnaire.id}>
                  <TableCell>
                    <TextField
                      size="small"
                      value={actionnaire.nom}
                      onChange={(e) => {
                        setActionnaires(prev => prev.map(a =>
                          a.id === actionnaire.id ? { ...a, nom: e.target.value } : a
                        ))
                        setHasChanges(true)
                      }}
                      placeholder="Nom de l'actionnaire..."
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      value={actionnaire.type}
                      onChange={(e) => {
                        setActionnaires(prev => prev.map(a =>
                          a.id === actionnaire.id ? { ...a, type: e.target.value } : a
                        ))
                        setHasChanges(true)
                      }}
                      placeholder="PP / PM"
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      size="small"
                      type="number"
                      value={actionnaire.nombreActions}
                      onChange={(e) => {
                        setActionnaires(prev => prev.map(a =>
                          a.id === actionnaire.id ? { ...a, nombreActions: parseInt(e.target.value) || 0 } : a
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
                      value={actionnaire.pourcentage}
                      onChange={(e) => {
                        setActionnaires(prev => prev.map(a =>
                          a.id === actionnaire.id ? { ...a, pourcentage: parseFloat(e.target.value) || 0 } : a
                        ))
                        setHasChanges(true)
                      }}
                      sx={{ width: 80 }}
                      InputProps={{ endAdornment: '%' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" color="error" onClick={() => removeActionnaire(actionnaire.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {actionnaires.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: theme.palette.text.secondary }}>
                    Aucun actionnaire renseigné. Cliquez sur «Ajouter» pour saisir les données.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addActionnaire}>
            Ajouter actionnaire
          </Button>
        </Stack>
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
            <CapitalIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              NOTE 11 - CAPITAUX PROPRES
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Imprimer">
              <IconButton size="small"><PrintIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Exporter">
              <IconButton size="small"><ExportIcon /></IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {!hasData && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<WarningIcon />}>
            Aucune donnée de capitaux propres trouvée dans la balance. Importez une balance contenant des comptes 10x-13x.
          </Alert>
        )}

        {/* Indicateurs clés */}
        {hasData && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(capitalData.capitalSocial)}
                  </Typography>
                  <Typography variant="body2">Capital social</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(capitalData.reserves)}
                  </Typography>
                  <Typography variant="body2">Réserves</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(capitalData.resultat >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color={capitalData.resultat >= 0 ? 'success.main' : 'error.main'} sx={{ fontWeight: 600 }}>
                    {formatCurrency(capitalData.resultat)}
                  </Typography>
                  <Typography variant="body2">Résultat net</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totalCapitauxPropres)}
                  </Typography>
                  <Typography variant="body2">Total capitaux propres</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Onglets */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Situation" icon={<EvolutionIcon />} iconPosition="start" />
          <Tab label="Composition capital" icon={<ShareholderIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderSituationCapitaux()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderCompositionCapital()}
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
          placeholder="Précisez les conditions particulières : pactes d'actionnaires, options, autorisations d'augmentation de capital..."
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
