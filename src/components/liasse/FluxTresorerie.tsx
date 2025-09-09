/**
 * Composant Flux de Trésorerie - SYSCOHADA
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
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney,
  BusinessCenter,
} from '@mui/icons-material'

interface FluxTresorerieProps {
  modeEdition?: boolean
}

interface FluxItem {
  code: string
  libelle: string
  n: number
  n1: number
  sousTotal?: boolean
  total?: boolean
}

const FluxTresorerie: React.FC<FluxTresorerieProps> = ({ modeEdition = false }) => {
  const [fluxData, setFluxData] = useState<FluxItem[]>([
    // FLUX DE TRÉSORERIE LIÉS À L'ACTIVITÉ (méthode indirecte)
    { code: 'FA01', libelle: 'Résultat net de l\'exercice', n: 0, n1: 0 },
    { code: 'FA02', libelle: 'Dotations aux amortissements et provisions', n: 0, n1: 0 },
    { code: 'FA03', libelle: 'Plus ou moins-values de cession', n: 0, n1: 0 },
    { code: 'FA04', libelle: 'Variation des stocks', n: 0, n1: 0 },
    { code: 'FA05', libelle: 'Variation des créances d\'exploitation', n: 0, n1: 0 },
    { code: 'FA06', libelle: 'Variation des dettes d\'exploitation', n: 0, n1: 0 },
    { code: 'FA07', libelle: 'Autres variations', n: 0, n1: 0 },
    { code: 'FA_ST', libelle: 'FLUX DE TRÉSORERIE PROVENANT DE L\'EXPLOITATION', n: 0, n1: 0, sousTotal: true },

    // FLUX DE TRÉSORERIE LIÉS AUX OPÉRATIONS D'INVESTISSEMENT
    { code: 'FI01', libelle: 'Acquisitions d\'immobilisations corporelles', n: 0, n1: 0 },
    { code: 'FI02', libelle: 'Acquisitions d\'immobilisations incorporelles', n: 0, n1: 0 },
    { code: 'FI03', libelle: 'Acquisitions d\'immobilisations financières', n: 0, n1: 0 },
    { code: 'FI04', libelle: 'Cessions d\'immobilisations corporelles', n: 0, n1: 0 },
    { code: 'FI05', libelle: 'Cessions d\'immobilisations incorporelles', n: 0, n1: 0 },
    { code: 'FI06', libelle: 'Cessions d\'immobilisations financières', n: 0, n1: 0 },
    { code: 'FI07', libelle: 'Dividendes et intérêts reçus', n: 0, n1: 0 },
    { code: 'FI_ST', libelle: 'FLUX DE TRÉSORERIE LIÉS AUX INVESTISSEMENTS', n: 0, n1: 0, sousTotal: true },

    // FLUX DE TRÉSORERIE LIÉS AUX OPÉRATIONS DE FINANCEMENT
    { code: 'FF01', libelle: 'Augmentation de capital en espèces', n: 0, n1: 0 },
    { code: 'FF02', libelle: 'Émission d\'emprunts', n: 0, n1: 0 },
    { code: 'FF03', libelle: 'Remboursement d\'emprunts', n: 0, n1: 0 },
    { code: 'FF04', libelle: 'Dividendes versés', n: 0, n1: 0 },
    { code: 'FF05', libelle: 'Autres opérations de financement', n: 0, n1: 0 },
    { code: 'FF_ST', libelle: 'FLUX DE TRÉSORERIE LIÉS AU FINANCEMENT', n: 0, n1: 0, sousTotal: true },

    // VARIATION DE LA TRÉSORERIE
    { code: 'VT01', libelle: 'VARIATION DE TRÉSORERIE', n: 0, n1: 0, total: true },
    { code: 'VT02', libelle: 'Trésorerie d\'ouverture', n: 0, n1: 0 },
    { code: 'VT03', libelle: 'Trésorerie de clôture', n: 0, n1: 0, total: true },
  ])

  const updateValue = (code: string, field: 'n' | 'n1', value: number) => {
    if (!modeEdition) return

    setFluxData(prev => prev.map(item => {
      if (item.code === code) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  // Calcul automatique des sous-totaux
  React.useEffect(() => {
    setFluxData(prev => prev.map(item => {
      if (item.code === 'FA_ST') {
        const exploitation = prev.filter(p => p.code.startsWith('FA') && p.code !== 'FA_ST')
        return {
          ...item,
          n: exploitation.reduce((sum, p) => sum + p.n, 0),
          n1: exploitation.reduce((sum, p) => sum + p.n1, 0)
        }
      }
      if (item.code === 'FI_ST') {
        const investissement = prev.filter(p => p.code.startsWith('FI') && p.code !== 'FI_ST')
        return {
          ...item,
          n: investissement.reduce((sum, p) => sum + p.n, 0),
          n1: investissement.reduce((sum, p) => sum + p.n1, 0)
        }
      }
      if (item.code === 'FF_ST') {
        const financement = prev.filter(p => p.code.startsWith('FF') && p.code !== 'FF_ST')
        return {
          ...item,
          n: financement.reduce((sum, p) => sum + p.n, 0),
          n1: financement.reduce((sum, p) => sum + p.n1, 0)
        }
      }
      if (item.code === 'VT01') {
        const faSt = prev.find(p => p.code === 'FA_ST')
        const fiSt = prev.find(p => p.code === 'FI_ST')
        const ffSt = prev.find(p => p.code === 'FF_ST')
        return {
          ...item,
          n: (faSt?.n || 0) + (fiSt?.n || 0) + (ffSt?.n || 0),
          n1: (faSt?.n1 || 0) + (fiSt?.n1 || 0) + (ffSt?.n1 || 0)
        }
      }
      if (item.code === 'VT03') {
        const vt01 = prev.find(p => p.code === 'VT01')
        const vt02 = prev.find(p => p.code === 'VT02')
        return {
          ...item,
          n: (vt02?.n || 0) + (vt01?.n || 0),
          n1: (vt02?.n1 || 0) + (vt01?.n1 || 0)
        }
      }
      return item
    }))
  }, [fluxData])

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const getFluxIcon = (code: string) => {
    if (code.startsWith('FA')) return <TrendingUp color="success" />
    if (code.startsWith('FI')) return <BusinessCenter color="warning" />
    if (code.startsWith('FF')) return <AccountBalance color="info" />
    return <AttachMoney color="primary" />
  }

  const getRowStyle = (item: FluxItem) => {
    if (item.total) {
      return {
        backgroundColor: 'primary.light',
        fontWeight: 700,
        '& .MuiTableCell-root': { fontWeight: 700, color: 'primary.main' }
      }
    }
    if (item.sousTotal) {
      return {
        backgroundColor: 'grey.100',
        fontWeight: 600,
        '& .MuiTableCell-root': { fontWeight: 600 }
      }
    }
    return {}
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AttachMoney sx={{ mr: 2, color: 'success.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
            Tableau des Flux de Trésorerie
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Méthode indirecte - SYSCOHADA
          </Typography>
        </Box>
      </Box>
      
      {!modeEdition && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Ce tableau présente les mouvements de trésorerie de l'exercice selon la méthode indirecte.
        </Alert>
      )}

      {/* Statistiques rapides */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flexGrow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Flux d'exploitation
                </Typography>
                <Typography variant="h6" color="success.main">
                  {formatNumber(fluxData.find(f => f.code === 'FA_ST')?.n || 0)} FCFA
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessCenter sx={{ color: 'warning.main', mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Flux d'investissement
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {formatNumber(fluxData.find(f => f.code === 'FI_ST')?.n || 0)} FCFA
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ flexGrow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountBalance sx={{ color: 'info.main', mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Flux de financement
                </Typography>
                <Typography variant="h6" color="info.main">
                  {formatNumber(fluxData.find(f => f.code === 'FF_ST')?.n || 0)} FCFA
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700, minWidth: 60 }}>Code</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, minWidth: 300 }}>Libellé</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700, minWidth: 120 }}>N</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700, minWidth: 120 }}>N-1</TableCell>
              {modeEdition && (
                <TableCell sx={{ color: 'white', fontWeight: 700, width: 50 }}>Info</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {fluxData.map((item, index) => {
              const isCategory = item.code.includes('_ST') || item.code.startsWith('VT')
              
              return (
                <React.Fragment key={item.code}>
                  {/* Séparateur pour les catégories */}
                  {isCategory && index > 0 && (
                    <TableRow>
                      <TableCell colSpan={modeEdition ? 5 : 4} sx={{ p: 0, border: 'none' }}>
                        <Divider sx={{ my: 1 }} />
                      </TableCell>
                    </TableRow>
                  )}
                  
                  <TableRow sx={getRowStyle(item)}>
                    <TableCell>
                      <Chip 
                        label={item.code} 
                        size="small" 
                        variant={item.sousTotal || item.total ? 'filled' : 'outlined'}
                        color={item.total ? 'primary' : item.sousTotal ? 'default' : 'secondary'}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {!item.sousTotal && !item.total && getFluxIcon(item.code)}
                        <Typography sx={{ ml: item.sousTotal || item.total ? 0 : 1 }}>
                          {item.libelle}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="right">
                      {modeEdition && !item.sousTotal && !item.total ? (
                        <TextField
                          type="number"
                          value={item.n}
                          onChange={(e) => updateValue(item.code, 'n', Number(e.target.value))}
                          size="small"
                          sx={{ width: 100 }}
                          inputProps={{ style: { textAlign: 'right' } }}
                        />
                      ) : (
                        <Typography 
                          sx={{ 
                            fontWeight: item.sousTotal || item.total ? 600 : 400,
                            color: item.n < 0 ? 'error.main' : 'text.primary'
                          }}
                        >
                          {formatNumber(item.n)}
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell align="right">
                      {modeEdition && !item.sousTotal && !item.total ? (
                        <TextField
                          type="number"
                          value={item.n1}
                          onChange={(e) => updateValue(item.code, 'n1', Number(e.target.value))}
                          size="small"
                          sx={{ width: 100 }}
                          inputProps={{ style: { textAlign: 'right' } }}
                        />
                      ) : (
                        <Typography 
                          sx={{ 
                            fontWeight: item.sousTotal || item.total ? 600 : 400,
                            color: item.n1 < 0 ? 'error.main' : 'text.primary'
                          }}
                        >
                          {formatNumber(item.n1)}
                        </Typography>
                      )}
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
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
              Flux d'exploitation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Flux de trésorerie générés par l'activité opérationnelle de l'entreprise.
              Un flux positif indique une génération de liquidités.
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, flexGrow: 1, minWidth: 300 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'warning.main' }}>
              Flux d'investissement
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Flux liés aux acquisitions et cessions d'immobilisations.
              Un flux négatif traduit des investissements.
            </Typography>
          </Paper>
          
          <Paper sx={{ p: 2, flexGrow: 1, minWidth: 300 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'info.main' }}>
              Flux de financement
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Flux liés aux relations avec les actionnaires et créanciers financiers.
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default FluxTresorerie