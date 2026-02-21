/**
 * Note 8 - Stocks
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
import { formatCurrency } from '@/utils/formatting'
import { TabPanel } from '@/components/shared/TabPanel'
import { SheetHeader } from '@/components/liasse/common/SheetHeader'
import {
  Inventory as StockIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assessment as EvalIcon,
  Factory as RawMaterialIcon,
  ShoppingCart as GoodsIcon,
  Build as WorkIcon,
  Checkroom as FinishedIcon,
} from '@mui/icons-material'

interface Stock {
  id: string
  categorie: string
  designation: string
  quantite: number
  unite: string
  coutUnitaire: number
  valeurComptable: number
  valeurMarche: number
  provision: number
  methodeEvaluation: string
  dateInventaire: string
  observations: string
}

interface ValeursStocks {
  valeurComptable: number
  valeurMarche: number
  provisions: number
  valeurNette?: number
}

const CATEGORIES_STOCKS = [
  { 
    id: 'matieres_premieres', 
    label: 'Matières premières', 
    icon: RawMaterialIcon, 
    description: 'Matières et fournitures consommables destinées à la production'
  },
  { 
    id: 'marchandises', 
    label: 'Marchandises', 
    icon: GoodsIcon, 
    description: 'Biens achetés pour être revendus en état'
  },
  { 
    id: 'produits_cours', 
    label: 'Produits en cours', 
    icon: WorkIcon, 
    description: 'Produits non achevés à la date de clôture'
  },
  { 
    id: 'produits_finis', 
    label: 'Produits finis', 
    icon: FinishedIcon, 
    description: 'Produits achevés prêts à être commercialisés'
  },
  { 
    id: 'emballages', 
    label: 'Emballages', 
    icon: GoodsIcon, 
    description: 'Emballages commerciaux et récupérables'
  }
]

const UNITES = [
  'kg', 'tonnes', 'litres', 'm³', 'm²', 'm', 'pièces', 'lots', 'unités', 'autres'
]

const Note8SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [comment, setComment] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    const initialData: Stock[] = [
      {
        id: '1',
        categorie: 'matieres_premieres',
        designation: 'Farine de blé',
        quantite: 5000,
        unite: 'kg',
        coutUnitaire: 450,
        valeurComptable: 2250000,
        valeurMarche: 2100000,
        provision: 150000,
        methodeEvaluation: 'Coût moyen pondéré',
        dateInventaire: '2024-12-31',
        observations: ''
      },
      {
        id: '2',
        categorie: 'marchandises',
        designation: 'Produits électroniques',
        quantite: 150,
        unite: 'pièces',
        coutUnitaire: 85000,
        valeurComptable: 12750000,
        valeurMarche: 13200000,
        provision: 0,
        methodeEvaluation: 'FIFO (Premier entré, premier sorti)',
        dateInventaire: '2024-12-31',
        observations: ''
      },
      {
        id: '3',
        categorie: 'produits_finis',
        designation: 'Pain de mie',
        quantite: 2000,
        unite: 'unités',
        coutUnitaire: 650,
        valeurComptable: 1300000,
        valeurMarche: 1400000,
        provision: 0,
        methodeEvaluation: 'Coût moyen pondéré',
        dateInventaire: '2024-12-31',
        observations: ''
      }
    ]
    
    setStocks(initialData)
  }

  const handleStockChange = (id: string, field: keyof Stock, value: any) => {
    setStocks(prev => prev.map(stock => {
      if (stock.id === id) {
        const updated = { ...stock, [field]: value }
        
        // Recalculer la valeur comptable
        if (field === 'quantite' || field === 'coutUnitaire') {
          updated.valeurComptable = updated.quantite * updated.coutUnitaire
        }
        
        // Recalculer la provision si nécessaire
        if (field === 'valeurComptable' || field === 'valeurMarche') {
          if (updated.valeurMarche < updated.valeurComptable) {
            updated.provision = updated.valeurComptable - updated.valeurMarche
          } else {
            updated.provision = 0
          }
        }
        
        return updated
      }
      return stock
    }))
    setHasChanges(true)
  }

  const addStock = (categorie?: string) => {
    const newStock: Stock = {
      id: Date.now().toString(),
      categorie: categorie || 'marchandises',
      designation: '',
      quantite: 0,
      unite: 'unités',
      coutUnitaire: 0,
      valeurComptable: 0,
      valeurMarche: 0,
      provision: 0,
      methodeEvaluation: 'Coût moyen pondéré',
      dateInventaire: new Date().toISOString().split('T')[0],
      observations: ''
    }
    
    setStocks(prev => [...prev, newStock])
    setHasChanges(true)
  }

  const removeStock = (id: string) => {
    setStocks(prev => prev.filter(stock => stock.id !== id))
    setHasChanges(true)
  }

  const handleSave = () => {
    setHasChanges(false)
  }

  // Calculs de synthèse
  const syntheseByCategory = CATEGORIES_STOCKS.map(cat => {
    const stocksCategorie = stocks.filter(stock => stock.categorie === cat.id)
    const valeurComptable = stocksCategorie.reduce((sum, stock) => sum + stock.valeurComptable, 0)
    const valeurMarche = stocksCategorie.reduce((sum, stock) => sum + stock.valeurMarche, 0)
    const provisions = stocksCategorie.reduce((sum, stock) => sum + stock.provision, 0)
    
    return {
      ...cat,
      count: stocksCategorie.length,
      valeurComptable,
      valeurMarche,
      provisions,
      valeurNette: valeurComptable - provisions
    }
  })

  const totaux: ValeursStocks = {
    valeurComptable: stocks.reduce((sum, stock) => sum + stock.valeurComptable, 0),
    valeurMarche: stocks.reduce((sum, stock) => sum + stock.valeurMarche, 0),
    provisions: stocks.reduce((sum, stock) => sum + stock.provision, 0),
  }
  totaux.valeurNette = totaux.valeurComptable - totaux.provisions

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
                <TableCell align="right" sx={{ fontWeight: 600 }}>Nb articles</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur comptable</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur marché</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Provisions</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur nette</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syntheseByCategory.map(cat => {
                const ecartValeur = cat.valeurMarche - cat.valeurComptable
                const statusColor = ecartValeur < 0 ? 'error' : ecartValeur > 0 ? 'success' : 'default'
                
                return (
                  <TableRow key={cat.id}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <cat.icon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2">{cat.label}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {cat.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{cat.count}</TableCell>
                    <TableCell align="right">{formatCurrency(cat.valeurComptable)}</TableCell>
                    <TableCell align="right">{formatCurrency(cat.valeurMarche)}</TableCell>
                    <TableCell align="right">
                      {cat.provisions > 0 ? (
                        <Typography color="error.main" sx={{ fontWeight: 500 }}>
                          {formatCurrency(cat.provisions)}
                        </Typography>
                      ) : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 500 }}>
                      {formatCurrency(cat.valeurNette)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={ecartValeur < 0 ? 'Déprécié' : ecartValeur > 0 ? 'Plus-value' : 'Normal'}
                        size="small"
                        color={statusColor}
                        variant={ecartValeur === 0 ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), fontWeight: 600 }}>
                <TableCell sx={{ fontWeight: 600 }}>TOTAL</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{stocks.length}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(totaux.valeurComptable)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(totaux.valeurMarche)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {totaux.provisions > 0 ? formatCurrency(totaux.provisions) : '-'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(totaux.valeurNette || 0)}</TableCell>
                <TableCell align="center">
                  <Chip
                    label={`${stocks.length} articles`}
                    size="small"
                    color="primary"
                  />
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
            <StockIcon sx={{ mr: 1 }} color="primary" />
            Détail des stocks par article
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => addStock()}
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
                <TableCell align="right" sx={{ fontWeight: 600 }}>Quantité</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Coût unitaire</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur comptable</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Valeur marché</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Provision</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocks.map(stock => {
                void CATEGORIES_STOCKS.find(cat => cat.id === stock.categorie)
                const needsProvision = stock.valeurMarche < stock.valeurComptable
                
                return (
                  <TableRow 
                    key={stock.id}
                    sx={{
                      backgroundColor: needsProvision ? alpha(theme.palette.warning.main, 0.05) : 'transparent'
                    }}
                  >
                    <TableCell>
                      <TextField
                        size="small"
                        value={stock.designation}
                        onChange={(e) => handleStockChange(stock.id, 'designation', e.target.value)}
                        placeholder="Description de l'article..."
                        fullWidth
                        sx={{ minWidth: 180 }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={stock.categorie}
                          onChange={(e) => handleStockChange(stock.id, 'categorie', e.target.value)}
                        >
                          {CATEGORIES_STOCKS.map(cat => (
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
                    
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          size="small"
                          type="number"
                          value={stock.quantite}
                          onChange={(e) => handleStockChange(stock.id, 'quantite', parseFloat(e.target.value) || 0)}
                          sx={{ width: 100 }}
                        />
                        <FormControl size="small" sx={{ minWidth: 60 }}>
                          <Select
                            value={stock.unite}
                            onChange={(e) => handleStockChange(stock.id, 'unite', e.target.value)}
                          >
                            {UNITES.map(unite => (
                              <MenuItem key={unite} value={unite}>
                                {unite}
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
                        value={stock.coutUnitaire}
                        onChange={(e) => handleStockChange(stock.id, 'coutUnitaire', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(stock.valeurComptable)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={stock.valeurMarche}
                        onChange={(e) => handleStockChange(stock.id, 'valeurMarche', parseFloat(e.target.value) || 0)}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    
                    <TableCell align="right">
                      {stock.provision > 0 ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <WarningIcon fontSize="small" color="error" />
                          <Typography variant="body2" color="error.main" sx={{ fontWeight: 500 }}>
                            {formatCurrency(stock.provision)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.disabled">-</Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeStock(stock.id)}
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

        {totaux.provisions > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">
              Provisions pour dépréciation des stocks : {formatCurrency(totaux.provisions)}
            </Typography>
            <Typography variant="body2">
              Des provisions ont été constituées pour les stocks dont la valeur de marché est inférieure au coût comptable.
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
              est inférieure au coût comptabilisé, notamment pour :
            </Typography>
            <ul style={{ marginLeft: '20px', fontSize: '0.875rem' }}>
              <li>Stocks obsolètes ou détériorés</li>
              <li>Stocks à rotation lente</li>
              <li>Stocks dont le prix de marché a chuté</li>
            </ul>
            
            <Typography variant="subtitle1" gutterBottom>
              <strong>Date d'inventaire :</strong>
            </Typography>
            <Typography variant="body2">
              Inventaire physique réalisé au 31 décembre 2024
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
        <SheetHeader title="NOTE 8 - STOCKS (en FCFA)" icon={<StockIcon />} />
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
            Cette note présente la composition et l'évaluation des stocks selon les méthodes SYSCOHADA.
          </Typography>
        </Alert>

        {/* Indicateurs de synthèse */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.valeurComptable)}
                </Typography>
                <Typography variant="body2">Valeur comptable</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.valeurMarche)}
                </Typography>
                <Typography variant="body2">Valeur marché</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totaux.provisions)}
                </Typography>
                <Typography variant="body2">Provisions</Typography>
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
          placeholder="Précisez les méthodes d'évaluation spécifiques, les changements de méthode, les stocks en consignation, les nantissements ou autres sûretés..."
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