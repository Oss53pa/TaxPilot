/**
 * Note 6 - Immobilisations corporelles
 * Connecté aux données de la balance (comptes 22-245, 28x)
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
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
  Print as PrintIcon,
  GetApp as ExportIcon,
  Assessment as EvalIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Home as BuildingIcon,
  DirectionsCar as VehicleIcon,
  Build as EquipmentIcon,
  Computer as ITIcon,
} from '@mui/icons-material'
import { liasseDataService } from '../../../services/liasseDataService'

interface CorpLine {
  id: string
  categorie: string
  label: string
  valeurBrute: number
  amortissements: number
  valeurNette: number
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

const CATEGORY_ICONS: Record<string, any> = {
  terrains: BuildingIcon,
  constructions: BuildingIcon,
  installations: EquipmentIcon,
  materiel_outillage: EquipmentIcon,
  materiel_transport: VehicleIcon,
  materiel_bureau: ITIcon,
  mobilier: BuildingIcon,
  autres: EquipmentIcon,
}

const DUREES_AMORTISSEMENT = [
  { label: 'Constructions', duree: '20 ans' },
  { label: 'Installations techniques', duree: '10 ans' },
  { label: 'Matériel et outillage', duree: '5 ans' },
  { label: 'Matériel de transport', duree: '4 ans' },
  { label: 'Matériel de bureau', duree: '3 ans' },
  { label: 'Mobilier', duree: '8 ans' },
]

const Note6SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [lignes, setLignes] = useState<CorpLine[]>([])
  const [hasData, setHasData] = useState(false)
  const [comment, setComment] = useState('')

  useEffect(() => {
    loadDataFromBalance()
  }, [])

  const loadDataFromBalance = () => {
    if (!liasseDataService.isLoaded()) {
      setHasData(false)
      return
    }
    const data = liasseDataService.generateNote6()
    setLignes(data)
    setHasData(data.length > 0)
  }

  const formatNumber = (value: number) => {
    if (!value || value === 0) return '-'
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatCurrency = (value: number) => {
    if (!value || value === 0) return '-'
    return `${formatNumber(value)} XOF`
  }

  const totaux = {
    valeurBrute: lignes.reduce((sum, l) => sum + l.valeurBrute, 0),
    amortissements: lignes.reduce((sum, l) => sum + l.amortissements, 0),
    valeurNette: lignes.reduce((sum, l) => sum + l.valeurNette, 0),
  }

  const renderTableauSynthese = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <EvalIcon sx={{ mr: 1 }} color="primary" />
          Tableau de synthèse des immobilisations corporelles
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur brute</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Amortissements</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur nette</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Taux amort.</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lignes.map(ligne => {
                const tauxMoyen = ligne.valeurBrute > 0 ? (ligne.amortissements / ligne.valeurBrute * 100) : 0
                const IconComp = CATEGORY_ICONS[ligne.categorie] || EquipmentIcon
                return (
                  <TableRow key={ligne.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <IconComp fontSize="small" color="action" />
                        <Typography variant="body2">{ligne.label}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatCurrency(ligne.valeurBrute)}</TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'error.main' }}>{formatCurrency(ligne.amortissements)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>{formatCurrency(ligne.valeurNette)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${tauxMoyen.toFixed(1)}%`}
                        size="small"
                        color={tauxMoyen > 80 ? 'error' : tauxMoyen > 50 ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCurrency(totaux.valeurBrute)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace', color: 'error.main' }}>{formatCurrency(totaux.amortissements)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCurrency(totaux.valeurNette)}</TableCell>
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

  const renderMethodes = () => (
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
              conformément aux dispositions du SYSCOHADA révisé.
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
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Durées d'amortissement usuelles :</strong>
            </Typography>
            <Table size="small">
              <TableBody>
                {DUREES_AMORTISSEMENT.map(d => (
                  <TableRow key={d.label}>
                    <TableCell>{d.label}</TableCell>
                    <TableCell align="right">{d.duree}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
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
              NOTE 6 - IMMOBILISATIONS CORPORELLES
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
            Aucune immobilisation corporelle trouvée dans la balance. Importez une balance contenant des comptes 22-245 pour alimenter cette note.
          </Alert>
        )}

        {/* Indicateurs de synthèse */}
        {hasData && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totaux.valeurBrute)}
                  </Typography>
                  <Typography variant="body2">Valeur brute</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.error.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totaux.amortissements)}
                  </Typography>
                  <Typography variant="body2">Amortissements cumulés</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totaux.valeurNette)}
                  </Typography>
                  <Typography variant="body2">Valeur nette</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Onglets */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Synthèse" />
          <Tab label="Méthodes comptables" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderTableauSynthese()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderMethodes()}
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
          placeholder="Précisez les réévaluations éventuelles, les nantissements, hypothèques ou autres sûretés grevant les immobilisations..."
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
