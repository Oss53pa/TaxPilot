import { logger } from '@/utils/logger'
/**
 * Compte de Résultat SYSCOHADA - Avec intégration automatique de la balance
 */

import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Calculate as CalcIcon,
  Comment as CommentIcon,
  Refresh as RefreshIcon,
  TrendingUp as ProfitIcon,
  TrendingDown as LossIcon,
} from '@mui/icons-material'
import { liasseDataService } from '@/services/liasseDataService'
import EditableToolbar from '../shared/EditableToolbar'

// Structure du Compte de Résultat SYSCOHADA
const COMPTE_RESULTAT_STRUCTURE = [
  { type: 'section', label: 'ACTIVITÉ D\'EXPLOITATION', bold: true },

  { type: 'header', label: 'PRODUITS D\'EXPLOITATION' },
  { type: 'line', ref: 'TA', label: 'Ventes de marchandises', note: '21', indent: 1 },
  { type: 'line', ref: 'RA', label: '(-) Achats de marchandises', note: '22', indent: 1, negative: true },
  { type: 'line', ref: 'RB', label: '(-/+) Variation de stocks de marchandises', note: '6', indent: 1, negative: true },
  { type: 'subtotal', ref: 'XA', label: 'MARGE COMMERCIALE (TA + RA + RB)', formula: 'TA+RA+RB' },

  { type: 'line', ref: 'TB', label: 'Ventes de produits fabriqués', note: '21', indent: 1 },
  { type: 'line', ref: 'TC', label: 'Travaux, services vendus', note: '21', indent: 1 },
  { type: 'line', ref: 'TD', label: 'Production stockée (ou déstockage)', note: '6', indent: 1 },
  { type: 'line', ref: 'TE', label: 'Production immobilisée', note: '21', indent: 1 },
  { type: 'line', ref: 'TF', label: 'Produits accessoires', note: '21', indent: 1 },
  { type: 'subtotal', ref: 'XB', label: 'CHIFFRE D\'AFFAIRES (TA + TB + TC + TD + TF)', formula: 'TA+TB+TC+TD+TF' },

  { type: 'line', ref: 'TG', label: 'Subventions d\'exploitation', note: '26', indent: 1 },
  { type: 'line', ref: 'TH', label: 'Autres produits', note: '27', indent: 1 },
  { type: 'line', ref: 'RC', label: '(-) Achats de matières premières et fournitures liées', note: '22', indent: 1, negative: true },
  { type: 'line', ref: 'RD', label: '(-/+) Variation de stocks de matières premières', note: '6', indent: 1, negative: true },
  { type: 'line', ref: 'RE', label: '(-) Autres achats', note: '23', indent: 1, negative: true },
  { type: 'line', ref: 'RF', label: '(-/+) Variation de stocks d\'autres approvisionnements', note: '6', indent: 1, negative: true },
  { type: 'line', ref: 'RG', label: '(-) Transports', note: '24', indent: 1, negative: true },
  { type: 'line', ref: 'RH', label: '(-) Services extérieurs', note: '25', indent: 1, negative: true },
  { type: 'line', ref: 'RI', label: '(-) Impôts et taxes', note: '26', indent: 1, negative: true },
  { type: 'line', ref: 'RJ', label: '(-) Autres charges', note: '27', indent: 1, negative: true },

  { type: 'subtotal', ref: 'XC', label: 'VALEUR AJOUTÉE', formula: 'XB+RC+RD+RE+RF+RG+RH+RI+RJ+TG+TH' },

  { type: 'line', ref: 'RK', label: '(-) Charges de personnel', note: '28', indent: 1, negative: true },

  { type: 'subtotal', ref: 'XD', label: 'EXCÉDENT BRUT D\'EXPLOITATION', formula: 'XC+RK' },

  { type: 'line', ref: 'TI', label: 'Reprises d\'amortissements, provisions et dépréciations', note: '28', indent: 1 },
  { type: 'line', ref: 'RL', label: '(-) Dotations aux amortissements', note: '3C', indent: 1, negative: true },
  { type: 'line', ref: 'RM', label: '(-) Dotations aux provisions et dépréciations', note: '3D', indent: 1, negative: true },

  { type: 'total', ref: 'XE', label: 'RÉSULTAT D\'EXPLOITATION', formula: 'XD+TI+RL+RM' },

  { type: 'section', label: 'ACTIVITÉ FINANCIÈRE', bold: true },

  { type: 'line', ref: 'TJ', label: 'Revenus financiers et assimilés', note: '29', indent: 1 },
  { type: 'line', ref: 'TK', label: 'Gains de change', note: '29', indent: 1 },
  { type: 'line', ref: 'TL', label: 'Reprises de provisions et dépréciations financières', note: '29', indent: 1 },
  { type: 'line', ref: 'TM', label: 'Transferts de charges financières', note: '29', indent: 1 },

  { type: 'line', ref: 'RN', label: '(-) Frais financiers et charges assimilées', note: '29', indent: 1, negative: true },
  { type: 'line', ref: 'RO', label: '(-) Pertes de change', note: '29', indent: 1, negative: true },
  { type: 'line', ref: 'RP', label: '(-) Dotations aux provisions et dépréciations financières', note: '29', indent: 1, negative: true },

  { type: 'total', ref: 'XF', label: 'RÉSULTAT FINANCIER', formula: 'TJ+TK+TL+TM+RN+RO+RP' },

  { type: 'total', ref: 'XG', label: 'RÉSULTAT DES ACTIVITÉS ORDINAIRES', formula: 'XE+XF' },

  { type: 'section', label: 'HORS ACTIVITÉS ORDINAIRES (HAO)', bold: true },

  { type: 'line', ref: 'TN', label: 'Produits des cessions d\'immobilisations', note: '3D', indent: 1 },
  { type: 'line', ref: 'TO', label: 'Autres produits HAO', note: '30', indent: 1 },

  { type: 'line', ref: 'RQ', label: '(-) Valeurs comptables des cessions d\'immobilisations', note: '3D', indent: 1, negative: true },
  { type: 'line', ref: 'RR', label: '(-) Autres charges HAO', note: '30', indent: 1, negative: true },

  { type: 'total', ref: 'XH', label: 'RÉSULTAT HAO', formula: 'TN+TO+RQ+RR' },

  { type: 'line', ref: 'RS', label: '(-) Impôt sur le résultat', note: '31', indent: 0, negative: true },

  { type: 'grandtotal', ref: 'XI', label: 'RÉSULTAT NET DE L\'EXERCICE', formula: 'XG+XH+RS' }
]

interface CompteResultatData {
  [ref: string]: {
    montant: number
    montantN1: number
    note?: string
  }
}

const CompteResultatSYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [data, setData] = useState<CompteResultatData>({})
  const [comment, setComment] = useState('')
  const [isAutoMode, setIsAutoMode] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (isAutoMode) {
      loadDataFromBalance()
    }
  }, [isAutoMode])

  const loadDataFromBalance = () => {
    const { charges, produits } = liasseDataService.generateCompteResultat()
    
    const newData: CompteResultatData = {}
    
    // Mapper les charges
    charges.forEach((item: any) => {
      newData[item.ref] = {
        montant: -(item.montant || 0), // Négatif car ce sont des charges
        montantN1: -(item.montant_n1 || 0),
        note: ''
      }
    })
    
    // Mapper les produits
    produits.forEach((item: any) => {
      newData[item.ref] = {
        montant: item.montant || 0,
        montantN1: item.montant_n1 || 0,
        note: ''
      }
    })
    
    setData(newData)
  }

  // Calculer les totaux et sous-totaux
  const calculateTotals = useMemo(() => {
    const totals: CompteResultatData = {}
    
    const calculate = (formula: string) => {
      const refs = formula.match(/[A-Z]{2}/g) || []
      let montant = 0, montantN1 = 0
      
      refs.forEach(ref => {
        if (data[ref]) {
          montant += data[ref].montant || 0
          montantN1 += data[ref].montantN1 || 0
        }
      })
      
      return { montant, montantN1 }
    }
    
    // Marge commerciale
    totals.XA = calculate('TA+RA+RB')
    
    // Chiffre d'affaires
    totals.XB = {
      montant: (data.TA?.montant || 0) + (data.TB?.montant || 0) + (data.TC?.montant || 0) + (data.TD?.montant || 0) + (data.TF?.montant || 0),
      montantN1: (data.TA?.montantN1 || 0) + (data.TB?.montantN1 || 0) + (data.TC?.montantN1 || 0) + (data.TD?.montantN1 || 0) + (data.TF?.montantN1 || 0)
    }
    
    // Valeur ajoutée
    totals.XC = {
      montant: totals.XB.montant + (data.TG?.montant || 0) + (data.TH?.montant || 0) + (data.RC?.montant || 0) + (data.RD?.montant || 0) + (data.RE?.montant || 0) + (data.RF?.montant || 0) + (data.RG?.montant || 0) + (data.RH?.montant || 0) + (data.RI?.montant || 0) + (data.RJ?.montant || 0),
      montantN1: totals.XB.montantN1 + (data.TG?.montantN1 || 0) + (data.TH?.montantN1 || 0) + (data.RC?.montantN1 || 0) + (data.RD?.montantN1 || 0) + (data.RE?.montantN1 || 0) + (data.RF?.montantN1 || 0) + (data.RG?.montantN1 || 0) + (data.RH?.montantN1 || 0) + (data.RI?.montantN1 || 0) + (data.RJ?.montantN1 || 0)
    }
    
    // EBE
    totals.XD = {
      montant: totals.XC.montant + (data.RK?.montant || 0),
      montantN1: totals.XC.montantN1 + (data.RK?.montantN1 || 0)
    }
    
    // Résultat d'exploitation
    totals.XE = {
      montant: totals.XD.montant + (data.TI?.montant || 0) + (data.RL?.montant || 0) + (data.RM?.montant || 0),
      montantN1: totals.XD.montantN1 + (data.TI?.montantN1 || 0) + (data.RL?.montantN1 || 0) + (data.RM?.montantN1 || 0)
    }
    
    // Résultat financier
    totals.XF = calculate('TJ+TK+TL+TM+RN+RO+RP')
    
    // Résultat des activités ordinaires
    totals.XG = {
      montant: totals.XE.montant + totals.XF.montant,
      montantN1: totals.XE.montantN1 + totals.XF.montantN1
    }
    
    // Résultat HAO
    totals.XH = calculate('TN+TO+RQ+RR')
    
    // Résultat net
    totals.XI = {
      montant: totals.XG.montant + totals.XH.montant + (data.RS?.montant || 0),
      montantN1: totals.XG.montantN1 + totals.XH.montantN1 + (data.RS?.montantN1 || 0)
    }
    
    return totals
  }, [data])

  const mergedData = { ...data, ...calculateTotals }

  const handleCellChange = (ref: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    
    setData(prev => ({
      ...prev,
      [ref]: {
        ...prev[ref],
        [field]: field === 'note' ? value : numValue
      }
    }))
    
    setHasChanges(true)
  }

  const formatNumber = (value: number | undefined, showSign: boolean = false) => {
    if (!value || value === 0) return '-'
    
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value))
    
    if (showSign && value > 0) {
      return `+${formatted}`
    }
    
    return value < 0 ? `(${formatted})` : formatted
  }

  const renderRow = (item: any) => {
    const rowData = mergedData[item.ref] || { montant: 0, montantN1: 0 }
    const isEditable = !isAutoMode && item.type === 'line'
    
    if (item.type === 'section') {
      return (
        <TableRow key={item.label}>
          <TableCell colSpan={5} sx={{ 
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            fontWeight: 700,
            fontSize: '0.95rem',
            color: theme.palette.primary.dark,
            textAlign: 'center',
            py: 1.5
          }}>
            {item.label}
          </TableCell>
        </TableRow>
      )
    }
    
    if (item.type === 'header') {
      return (
        <TableRow key={item.label}>
          <TableCell colSpan={5} sx={{ 
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            fontWeight: 600,
            fontSize: '0.9rem',
            color: theme.palette.info.dark,
            pl: 2
          }}>
            {item.label}
          </TableCell>
        </TableRow>
      )
    }

    const isSubtotal = item.type === 'subtotal'
    const isTotal = item.type === 'total'
    const isGrandTotal = item.type === 'grandtotal'
    const indent = item.indent || 0

    // Déterminer la couleur en fonction du résultat
    const getResultColor = () => {
      if (!isTotal && !isGrandTotal && !isSubtotal) return 'inherit'
      const value = rowData.montant
      if (value > 0) return theme.palette.success.main
      if (value < 0) return theme.palette.error.main
      return 'inherit'
    }

    return (
      <TableRow 
        key={item.ref}
        sx={{
          backgroundColor: isGrandTotal 
            ? alpha(theme.palette.primary.main, 0.05)
            : isTotal 
            ? alpha(theme.palette.warning.main, 0.03)
            : isSubtotal
            ? alpha(theme.palette.info.main, 0.03)
            : 'transparent',
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.05)
          }
        }}
      >
        <TableCell sx={{ 
          width: '60px',
          fontWeight: isTotal || isGrandTotal || isSubtotal ? 600 : 400,
          color: getResultColor()
        }}>
          {item.ref}
        </TableCell>
        
        <TableCell sx={{ 
          pl: indent * 3,
          fontWeight: isTotal || isGrandTotal ? 600 : isSubtotal ? 500 : 400,
          fontSize: isGrandTotal ? '0.95rem' : isTotal ? '0.9rem' : '0.875rem'
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <span>{item.label}</span>
            {isGrandTotal && rowData.montant !== 0 && (
              rowData.montant > 0 ? 
                <ProfitIcon color="success" fontSize="small" /> : 
                <LossIcon color="error" fontSize="small" />
            )}
          </Stack>
        </TableCell>
        
        <TableCell sx={{ width: '60px', textAlign: 'center' }}>
          {item.note && <Chip label={item.note} size="small" variant="outlined" />}
        </TableCell>
        
        <TableCell align="right" sx={{ 
          width: '150px',
          backgroundColor: alpha(theme.palette.info.main, 0.05)
        }}>
          {isEditable ? (
            <TextField
              size="small"
              type="number"
              value={rowData.montant || ''}
              onChange={(e) => handleCellChange(item.ref, 'montant', e.target.value)}
              fullWidth
              disabled={!isEditable}
              InputProps={{
                sx: { fontSize: '0.875rem' }
              }}
            />
          ) : (
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: isTotal || isGrandTotal || isSubtotal ? 600 : 400,
                color: getResultColor()
              }}
            >
              {formatNumber(rowData.montant, isGrandTotal)}
            </Typography>
          )}
        </TableCell>
        
        <TableCell align="right" sx={{ width: '150px' }}>
          {isEditable ? (
            <TextField
              size="small"
              type="number"
              value={rowData.montantN1 || ''}
              onChange={(e) => handleCellChange(item.ref, 'montantN1', e.target.value)}
              fullWidth
              disabled={!isEditable}
              InputProps={{
                sx: { fontSize: '0.875rem' }
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ fontWeight: isTotal || isGrandTotal || isSubtotal ? 600 : 400 }}>
              {formatNumber(rowData.montantN1)}
            </Typography>
          )}
        </TableCell>
      </TableRow>
    )
  }

  const handleSave = () => {
    logger.debug('Sauvegarde du Compte de Résultat:', mergedData)
    setHasChanges(false)
  }

  const handleToggleMode = () => {
    setIsAutoMode(!isAutoMode)
    if (!isAutoMode) {
      loadDataFromBalance()
    }
  }

  // Validation et indicateurs
  const resultatNet = mergedData.XI?.montant || 0
  const isProfit = resultatNet > 0
  const variation = resultatNet - (mergedData.XI?.montantN1 || 0)
  const variationPercent = mergedData.XI?.montantN1 ? (variation / Math.abs(mergedData.XI.montantN1)) * 100 : 0

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
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            COMPTE DE RÉSULTAT (en FCFA)
          </Typography>
          
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Actualiser depuis la balance">
              <IconButton size="small" onClick={loadDataFromBalance}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <EditableToolbar
              isEditMode={!isAutoMode}
              onToggleEdit={handleToggleMode}
              hasChanges={hasChanges}
              onSave={handleSave}
            />
          </Stack>
        </Stack>

        {/* Indicateurs clés */}
        <Stack direction="row" spacing={2}>
          <Chip
            icon={isProfit ? <ProfitIcon /> : <LossIcon />}
            label={`Résultat Net: ${formatNumber(resultatNet)}`}
            color={isProfit ? "success" : "error"}
            variant="outlined"
          />
          
          <Chip
            label={`CA: ${formatNumber(mergedData.XB?.montant)}`}
            color="primary"
            variant="outlined"
          />
          
          <Chip
            label={`EBE: ${formatNumber(mergedData.XD?.montant)}`}
            color="info"
            variant="outlined"
          />
          
          {variation !== 0 && (
            <Chip
              label={`Variation: ${variation > 0 ? '+' : ''}${variationPercent.toFixed(1)}%`}
              color={variation > 0 ? "success" : "error"}
              size="small"
            />
          )}
          
          {isAutoMode && (
            <Chip
              icon={<CalcIcon />}
              label="Synchronisé"
              color="info"
              size="small"
            />
          )}
        </Stack>
      </Box>

      {/* Tableau */}
      <TableContainer sx={{ mb: 3 }}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Réf</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>LIBELLÉ</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Note</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Exercice N
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Exercice N-1</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {COMPTE_RESULTAT_STRUCTURE.map(renderRow)}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Zone de commentaires */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: alpha(theme.palette.action.hover, 0.3),
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <CommentIcon color="action" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Commentaires et observations
          </Typography>
        </Stack>

        <TextField
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Saisissez vos commentaires et observations pour le Compte de Résultat..."
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

export default CompteResultatSYSCOHADA