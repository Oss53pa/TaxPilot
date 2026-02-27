/**
 * Composant Variation des Capitaux Propres - SYSCOHADA
 */

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material'
import {
  Info,
  SwapHoriz,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  MonetizationOn,
  Savings,
} from '@mui/icons-material'

interface VariationCapitauxProps {
  modeEdition?: boolean
}

interface CapitauxItem {
  code: string
  libelle: string
  soldeOuverture: number
  augmentations: number
  diminutions: number
  soldeCloture: number
  isTotal?: boolean
  isSubTotal?: boolean
}

const VariationCapitaux: React.FC<VariationCapitauxProps> = ({ modeEdition = false }) => {
  const [capitauxData, setCapitauxData] = useState<CapitauxItem[]>([
    // CAPITAL SOCIAL
    { 
      code: 'CP01', 
      libelle: 'Capital social ou individuel', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0 
    },
    { 
      code: 'CP02', 
      libelle: 'Actionnaires, capital souscrit non appelé (-)', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0 
    },
    
    // PRIMES ET RÉSERVES
    { 
      code: 'CP03', 
      libelle: 'Primes et réserves consolidées', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0,
      isSubTotal: true 
    },
    { 
      code: 'CP03.1', 
      libelle: '- Primes d\'apport, de fusion, de conversion', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0 
    },
    { 
      code: 'CP03.2', 
      libelle: '- Écarts de réévaluation', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0 
    },
    { 
      code: 'CP03.3', 
      libelle: '- Réserves indisponibles', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0 
    },
    { 
      code: 'CP03.4', 
      libelle: '- Réserves libres', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0 
    },
    { 
      code: 'CP03.5', 
      libelle: '- Report à nouveau (+/-)', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0 
    },
    
    // RÉSULTAT
    { 
      code: 'CP04', 
      libelle: 'Résultat net de l\'exercice (+/-)', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0 
    },
    
    // AUTRES CAPITAUX PROPRES
    { 
      code: 'CP05', 
      libelle: 'Autres capitaux propres', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0,
      isSubTotal: true 
    },
    { 
      code: 'CP05.1', 
      libelle: '- Subventions d\'investissement', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0 
    },
    { 
      code: 'CP05.2', 
      libelle: '- Provisions réglementées et fonds assim.', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0 
    },
    
    // TOTAL CAPITAUX PROPRES
    { 
      code: 'CP_TOT', 
      libelle: 'TOTAL DES CAPITAUX PROPRES', 
      soldeOuverture: 0, 
      augmentations: 0, 
      diminutions: 0, 
      soldeCloture: 0,
      isTotal: true 
    },
  ])

  const updateValue = (code: string, field: keyof CapitauxItem, value: number) => {
    if (!modeEdition) return

    setCapitauxData(prev => prev.map(item => {
      if (item.code === code && typeof item[field] === 'number') {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  // Calcul automatique des soldes de clôture et des totaux
  React.useEffect(() => {
    setCapitauxData(prev => prev.map(item => {
      const newItem = { ...item }
      
      // Calcul du solde de clôture pour chaque ligne
      if (!item.isTotal && !item.isSubTotal) {
        newItem.soldeCloture = item.soldeOuverture + item.augmentations - item.diminutions
      }
      
      // Calcul des sous-totaux
      if (item.code === 'CP03') {
        const sousElements = prev.filter(p => p.code.startsWith('CP03.') && p.code !== 'CP03')
        newItem.soldeOuverture = sousElements.reduce((sum, p) => sum + p.soldeOuverture, 0)
        newItem.augmentations = sousElements.reduce((sum, p) => sum + p.augmentations, 0)
        newItem.diminutions = sousElements.reduce((sum, p) => sum + p.diminutions, 0)
        newItem.soldeCloture = sousElements.reduce((sum, p) => sum + (p.soldeOuverture + p.augmentations - p.diminutions), 0)
      }
      
      if (item.code === 'CP05') {
        const sousElements = prev.filter(p => p.code.startsWith('CP05.') && p.code !== 'CP05')
        newItem.soldeOuverture = sousElements.reduce((sum, p) => sum + p.soldeOuverture, 0)
        newItem.augmentations = sousElements.reduce((sum, p) => sum + p.augmentations, 0)
        newItem.diminutions = sousElements.reduce((sum, p) => sum + p.diminutions, 0)
        newItem.soldeCloture = sousElements.reduce((sum, p) => sum + (p.soldeOuverture + p.augmentations - p.diminutions), 0)
      }
      
      // Calcul du total général
      if (item.code === 'CP_TOT') {
        const elementsTotal = prev.filter(p => 
          ['CP01', 'CP02', 'CP03', 'CP04', 'CP05'].includes(p.code)
        )
        newItem.soldeOuverture = elementsTotal.reduce((sum, p) => sum + (p.soldeOuverture || 0), 0)
        newItem.augmentations = elementsTotal.reduce((sum, p) => sum + (p.augmentations || 0), 0)
        newItem.diminutions = elementsTotal.reduce((sum, p) => sum + (p.diminutions || 0), 0)
        newItem.soldeCloture = elementsTotal.reduce((sum, p) => {
          const solde = p.isSubTotal ? p.soldeCloture : (p.soldeOuverture + p.augmentations - p.diminutions)
          return sum + solde
        }, 0)
      }
      
      return newItem
    }))
  }, [capitauxData])

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const getRowStyle = (item: CapitauxItem) => {
    if (item.isTotal) {
      return {
        backgroundColor: 'primary.light',
        fontWeight: 700,
        '& .MuiTableCell-root': { fontWeight: 700, color: 'primary.main' }
      }
    }
    if (item.isSubTotal) {
      return {
        backgroundColor: 'grey.100',
        fontWeight: 600,
        '& .MuiTableCell-root': { fontWeight: 600 }
      }
    }
    if (item.code.includes('.')) {
      return {
        '& .MuiTableCell-root': { fontSize: '0.85rem', color: 'text.secondary' }
      }
    }
    return {}
  }

  const getIcon = (code: string) => {
    if (code.startsWith('CP01') || code.startsWith('CP02')) return <AccountBalance color="primary" />
    if (code.startsWith('CP03')) return <Savings color="success" />
    if (code.startsWith('CP04')) return <TrendingUp color="warning" />
    if (code.startsWith('CP05')) return <MonetizationOn color="info" />
    return null
  }

  const totalCapitaux = capitauxData.find(item => item.code === 'CP_TOT')
  const variationTotale = (totalCapitaux?.soldeCloture || 0) - (totalCapitaux?.soldeOuverture || 0)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SwapHoriz sx={{ mr: 2, color: 'info.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
            Tableau de Variation des Capitaux Propres
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Mouvements de l'exercice - SYSCOHADA
          </Typography>
        </Box>
      </Box>
      
      {!modeEdition && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Ce tableau présente l'évolution détaillée des capitaux propres entre le début et la fin de l'exercice.
        </Alert>
      )}

      {/* Statistiques rapides */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flexGrow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountBalance sx={{ color: 'primary.main', mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Capitaux propres d'ouverture
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {formatNumber(totalCapitaux?.soldeOuverture || 0)} FCFA
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {variationTotale >= 0 ? 
                <TrendingUp sx={{ color: 'success.main', mr: 1 }} /> :
                <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
              }
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Variation nette
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ color: variationTotale >= 0 ? 'success.main' : 'error.main' }}
                >
                  {formatNumber(variationTotale)} FCFA
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MonetizationOn sx={{ color: 'info.main', mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Capitaux propres de clôture
                </Typography>
                <Typography variant="h6" color="info.main">
                  {formatNumber(totalCapitaux?.soldeCloture || 0)} FCFA
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'info.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700, minWidth: 60 }}>Code</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, minWidth: 300 }}>Libellé</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700, minWidth: 120 }}>Solde d'ouverture</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700, minWidth: 120 }}>Augmentations</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700, minWidth: 120 }}>Diminutions</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700, minWidth: 120 }}>Solde de clôture</TableCell>
              {modeEdition && (
                <TableCell sx={{ color: 'white', fontWeight: 700, width: 50 }}>Info</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {capitauxData.map((item, index) => {
              const isIndented = item.code.includes('.')
              
              return (
                <React.Fragment key={item.code}>
                  {/* Séparateur avant les totaux */}
                  {item.isTotal && index > 0 && (
                    <TableRow>
                      <TableCell colSpan={modeEdition ? 7 : 6} sx={{ p: 0, border: 'none' }}>
                        <Divider sx={{ my: 1 }} />
                      </TableCell>
                    </TableRow>
                  )}
                  
                  <TableRow sx={getRowStyle(item)}>
                    <TableCell>
                      <Chip 
                        label={item.code} 
                        size="small" 
                        variant={item.isTotal ? 'filled' : item.isSubTotal ? 'filled' : 'outlined'}
                        color={item.isTotal ? 'primary' : item.isSubTotal ? 'default' : 'secondary'}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', pl: isIndented ? 3 : 0 }}>
                        {!isIndented && !item.isTotal && !item.isSubTotal && getIcon(item.code)}
                        <Typography sx={{ ml: (!isIndented && !item.isTotal && !item.isSubTotal) ? 1 : 0 }}>
                          {item.libelle}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="right">
                      {modeEdition && !item.isTotal && !item.isSubTotal ? (
                        <TextField
                          type="number"
                          value={item.soldeOuverture}
                          onChange={(e) => updateValue(item.code, 'soldeOuverture', Number(e.target.value))}
                          size="small"
                          sx={{ width: 100 }}
                          inputProps={{ style: { textAlign: 'right' } }}
                        />
                      ) : (
                        <Typography 
                          sx={{ 
                            fontWeight: item.isTotal || item.isSubTotal ? 600 : 400,
                            color: item.soldeOuverture < 0 ? 'error.main' : 'text.primary'
                          }}
                        >
                          {formatNumber(item.soldeOuverture)}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell align="right">
                      {modeEdition && !item.isTotal && !item.isSubTotal ? (
                        <TextField
                          type="number"
                          value={item.augmentations}
                          onChange={(e) => updateValue(item.code, 'augmentations', Number(e.target.value))}
                          size="small"
                          sx={{ width: 100 }}
                          inputProps={{ style: { textAlign: 'right' } }}
                        />
                      ) : (
                        <Typography 
                          sx={{ 
                            fontWeight: item.isTotal || item.isSubTotal ? 600 : 400,
                            color: 'success.main'
                          }}
                        >
                          {item.augmentations !== 0 ? formatNumber(item.augmentations) : '-'}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell align="right">
                      {modeEdition && !item.isTotal && !item.isSubTotal ? (
                        <TextField
                          type="number"
                          value={item.diminutions}
                          onChange={(e) => updateValue(item.code, 'diminutions', Number(e.target.value))}
                          size="small"
                          sx={{ width: 100 }}
                          inputProps={{ style: { textAlign: 'right' } }}
                        />
                      ) : (
                        <Typography 
                          sx={{ 
                            fontWeight: item.isTotal || item.isSubTotal ? 600 : 400,
                            color: 'error.main'
                          }}
                        >
                          {item.diminutions !== 0 ? formatNumber(item.diminutions) : '-'}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography 
                        sx={{ 
                          fontWeight: item.isTotal || item.isSubTotal ? 700 : 500,
                          color: item.isTotal ? 'primary.main' : 
                                 item.soldeCloture < 0 ? 'error.main' : 'text.primary'
                        }}
                      >
                        {formatNumber(item.soldeCloture)}
                      </Typography>
                    </TableCell>
                    
                    {modeEdition && (
                      <TableCell>
                        <Tooltip title="Information sur ce poste">
                          <IconButton size="small">
                            <Info fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Notes explicatives */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Notes explicatives
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 2, flexGrow: 1, minWidth: 300 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
              Capital social
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Montant du capital souscrit par les actionnaires, déduit des appels de fonds non versés.
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, flexGrow: 1, minWidth: 300 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
              Primes et réserves
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ensemble des primes d'apport, réserves légales et statutaires, report à nouveau.
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, flexGrow: 1, minWidth: 300 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}>
              Résultat de l'exercice
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bénéfice ou perte de l'exercice avant affectation.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default VariationCapitaux