/**
 * Note 8 - Stocks
 * Connecté aux données de la balance (comptes 31-37, provisions 39x)
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
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Inventory as StockIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assessment as EvalIcon,
} from '@mui/icons-material'
import { liasseDataService } from '../../../services/liasseDataService'

interface StockLine {
  id: string
  categorie: string
  designation: string
  valeurComptable: number
  provision: number
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
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

const Note8SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [stocks, setStocks] = useState<StockLine[]>([])
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
    const data = liasseDataService.generateNote8()
    setStocks(data)
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
    valeurComptable: stocks.reduce((sum, s) => sum + s.valeurComptable, 0),
    provision: stocks.reduce((sum, s) => sum + s.provision, 0),
    valeurNette: stocks.reduce((sum, s) => sum + s.valeurNette, 0),
  }

  const renderTableauSynthese = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <EvalIcon sx={{ mr: 1 }} color="primary" />
          Tableau de synthèse des stocks
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur brute</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Provisions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur nette</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocks.map(stock => (
                <TableRow key={stock.id}>
                  <TableCell>
                    <Typography variant="body2">{stock.designation}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{formatCurrency(stock.valeurComptable)}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    {stock.provision > 0 ? (
                      <Typography color="error.main" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                        {formatCurrency(stock.provision)}
                      </Typography>
                    ) : '-'}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                    {formatCurrency(stock.valeurNette)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={stock.provision > 0 ? 'Déprécié' : 'Normal'}
                      size="small"
                      color={stock.provision > 0 ? 'error' : 'default'}
                      variant={stock.provision > 0 ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCurrency(totaux.valeurComptable)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  {totaux.provision > 0 ? formatCurrency(totaux.provision) : '-'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCurrency(totaux.valeurNette)}</TableCell>
                <TableCell align="center">
                  <Chip label={`${stocks.length} catégories`} size="small" color="primary" variant="outlined" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {totaux.provision > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              Provisions pour dépréciation des stocks : {formatCurrency(totaux.provision)}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  )

  const renderMethodesComptables = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Méthodes d'évaluation des stocks
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Évaluation à l'entrée :</strong>
            </Typography>
            <Typography variant="body2" paragraph>
              Les stocks sont évalués au coût d'acquisition (marchandises) ou au coût de production
              (produits finis et en-cours), conformément aux dispositions du SYSCOHADA.
            </Typography>

            <Typography variant="subtitle1" gutterBottom>
              <strong>Évaluation à la sortie :</strong>
            </Typography>
            <Typography variant="body2" paragraph>
              Méthode du coût moyen pondéré principalement utilisée, avec application ponctuelle
              de la méthode FIFO selon la nature des stocks.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Provisions pour dépréciation :</strong>
            </Typography>
            <Typography variant="body2" paragraph>
              Des provisions sont constituées lorsque la valeur probable de réalisation
              est inférieure au coût comptabilisé (comptes 39x).
            </Typography>
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
            <StockIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              NOTE 8 - STOCKS
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
          </Stack>
        </Stack>

        {!hasData && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<WarningIcon />}>
            Aucun stock trouvé dans la balance. Importez une balance contenant des comptes 31-37 pour alimenter cette note.
          </Alert>
        )}

        {/* Indicateurs de synthèse */}
        {hasData && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totaux.valeurComptable)}
                  </Typography>
                  <Typography variant="body2">Valeur brute</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totaux.provision)}
                  </Typography>
                  <Typography variant="body2">Provisions</Typography>
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
        {renderMethodesComptables()}
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
          placeholder="Précisez les méthodes d'évaluation spécifiques, les changements de méthode, les stocks en consignation..."
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

export default Note8SYSCOHADA
