/**
 * Tableau de Flux de Trésorerie (TFT) SYSCOHADA
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
  Alert,
  Button,
  Stack,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Save as SaveIcon,
  Calculate as CalcIcon,
  Comment as CommentIcon,
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  AutoFixHigh as AutoIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  AccountBalanceWallet as CashIcon,
} from '@mui/icons-material'

// Structure du TFT selon SYSCOHADA
const TFT_STRUCTURE = [
  { type: 'section', label: 'FLUX DE TRÉSORERIE LIÉS AUX ACTIVITÉS OPÉRATIONNELLES', bold: true },
  
  { type: 'line', ref: 'FA', label: 'Capacité d\'Autofinancement Globale (CAFG)', indent: 1 },
  { type: 'line', ref: 'FB', label: '(-) Variation actif circulant HAO', indent: 1, negative: true },
  { type: 'line', ref: 'FC', label: '(-) Variation des stocks', indent: 1, negative: true },
  { type: 'line', ref: 'FD', label: '(-) Variation des créances', indent: 1, negative: true },
  { type: 'line', ref: 'FE', label: '(+) Variation du passif circulant', indent: 1 },
  
  { type: 'line', ref: 'FF', label: 'Variation du BFR lié aux activités opérationnelles', indent: 2 },
  
  { type: 'total', ref: 'ZA', label: 'FLUX DE TRÉSORERIE OPÉRATIONNELS (A)', formula: 'FA+FB+FC+FD+FE' },
  
  { type: 'section', label: 'FLUX DE TRÉSORERIE LIÉS AUX ACTIVITÉS D\'INVESTISSEMENT', bold: true },
  
  { type: 'line', ref: 'FG', label: '(-) Décaissements liés aux acquisitions d\'immobilisations incorporelles', indent: 1, negative: true },
  { type: 'line', ref: 'FH', label: '(-) Décaissements liés aux acquisitions d\'immobilisations corporelles', indent: 1, negative: true },
  { type: 'line', ref: 'FI', label: '(-) Décaissements liés aux acquisitions d\'immobilisations financières', indent: 1, negative: true },
  { type: 'line', ref: 'FJ', label: '(+) Encaissements liés aux cessions d\'immobilisations incorporelles et corporelles', indent: 1 },
  { type: 'line', ref: 'FK', label: '(+) Encaissements liés aux cessions d\'immobilisations financières', indent: 1 },
  
  { type: 'total', ref: 'ZB', label: 'FLUX DE TRÉSORERIE D\'INVESTISSEMENT (B)', formula: 'FG+FH+FI+FJ+FK' },
  
  { type: 'section', label: 'FLUX DE TRÉSORERIE LIÉS AUX ACTIVITÉS DE FINANCEMENT', bold: true },
  
  { type: 'line', ref: 'FL', label: '(+) Augmentations de capital par apports nouveaux', indent: 1 },
  { type: 'line', ref: 'FM', label: '(+) Subventions d\'investissement reçues', indent: 1 },
  { type: 'line', ref: 'FN', label: '(+) Prélèvements sur le capital', indent: 1 },
  { type: 'line', ref: 'FO', label: '(+) Emprunts', indent: 1 },
  { type: 'line', ref: 'FP', label: '(+) Autres dettes financières', indent: 1 },
  { type: 'line', ref: 'FQ', label: '(-) Remboursements des emprunts et autres dettes financières', indent: 1, negative: true },
  { type: 'line', ref: 'FR', label: '(-) Dividendes versés', indent: 1, negative: true },
  
  { type: 'total', ref: 'ZC', label: 'FLUX DE TRÉSORERIE DE FINANCEMENT (C)', formula: 'FL+FM+FN+FO+FP+FQ+FR' },
  
  { type: 'grandtotal', ref: 'ZD', label: 'VARIATION DE TRÉSORERIE NETTE DE LA PÉRIODE (A+B+C)', formula: 'ZA+ZB+ZC' },
  
  { type: 'section', label: 'RÉCONCILIATION', bold: true },
  
  { type: 'line', ref: 'ZE', label: 'Trésorerie nette au 1er janvier', indent: 1 },
  { type: 'line', ref: 'ZD2', label: 'Variation de trésorerie nette de la période', indent: 1 },
  { type: 'line', ref: 'ZF', label: 'Incidence des variations de cours de devises', indent: 1 },
  
  { type: 'grandtotal', ref: 'ZG', label: 'TRÉSORERIE NETTE AU 31 DÉCEMBRE', formula: 'ZE+ZD+ZF' },
  
  { type: 'section', label: 'CONTRÔLE', bold: true },
  
  { type: 'line', ref: 'ZH', label: 'Trésorerie - Actif', indent: 1 },
  { type: 'line', ref: 'ZI', label: 'Trésorerie - Passif', indent: 1 },
  
  { type: 'total', ref: 'ZJ', label: 'TRÉSORERIE NETTE', formula: 'ZH-ZI' }
]

interface TFTData {
  [ref: string]: {
    montant: number
    montantN1: number
    note?: string
  }
}

const TableauFluxTresorerieSYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [data, setData] = useState<TFTData>({})
  const [comment, setComment] = useState('')
  const [isAutoMode, setIsAutoMode] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (isAutoMode) {
      loadDataFromBalance()
    }
  }, [isAutoMode])

  const loadDataFromBalance = () => {
    // Calculer automatiquement les flux depuis les autres états
    const newData: TFTData = {
      // CAFG = Résultat net + Dotations aux amortissements - Reprises
      FA: { montant: 0, montantN1: 0 },
      
      // Variations du BFR (à calculer depuis les bilans N et N-1)
      FB: { montant: 0, montantN1: 0 },
      FC: { montant: 0, montantN1: 0 },
      FD: { montant: 0, montantN1: 0 },
      FE: { montant: 0, montantN1: 0 },
      FF: { montant: 0, montantN1: 0 },
      
      // Flux d'investissement
      FG: { montant: 0, montantN1: 0 },
      FH: { montant: 0, montantN1: 0 },
      FI: { montant: 0, montantN1: 0 },
      FJ: { montant: 0, montantN1: 0 },
      FK: { montant: 0, montantN1: 0 },
      
      // Flux de financement
      FL: { montant: 0, montantN1: 0 },
      FM: { montant: 0, montantN1: 0 },
      FN: { montant: 0, montantN1: 0 },
      FO: { montant: 0, montantN1: 0 },
      FP: { montant: 0, montantN1: 0 },
      FQ: { montant: 0, montantN1: 0 },
      FR: { montant: 0, montantN1: 0 },
      
      // Trésorerie
      ZE: { montant: 0, montantN1: 0 },
      ZF: { montant: 0, montantN1: 0 },
      ZH: { montant: 0, montantN1: 0 },
      ZI: { montant: 0, montantN1: 0 }
    }
    
    setData(newData)
  }

  // Calculer les totaux
  const calculateTotals = useMemo(() => {
    const totals: TFTData = {}
    
    // Flux opérationnels (ZA)
    totals.ZA = {
      montant: (data.FA?.montant || 0) + (data.FB?.montant || 0) + (data.FC?.montant || 0) + 
               (data.FD?.montant || 0) + (data.FE?.montant || 0),
      montantN1: (data.FA?.montantN1 || 0) + (data.FB?.montantN1 || 0) + (data.FC?.montantN1 || 0) + 
                 (data.FD?.montantN1 || 0) + (data.FE?.montantN1 || 0)
    }
    
    // Flux d'investissement (ZB)
    totals.ZB = {
      montant: (data.FG?.montant || 0) + (data.FH?.montant || 0) + (data.FI?.montant || 0) + 
               (data.FJ?.montant || 0) + (data.FK?.montant || 0),
      montantN1: (data.FG?.montantN1 || 0) + (data.FH?.montantN1 || 0) + (data.FI?.montantN1 || 0) + 
                 (data.FJ?.montantN1 || 0) + (data.FK?.montantN1 || 0)
    }
    
    // Flux de financement (ZC)
    totals.ZC = {
      montant: (data.FL?.montant || 0) + (data.FM?.montant || 0) + (data.FN?.montant || 0) + 
               (data.FO?.montant || 0) + (data.FP?.montant || 0) + (data.FQ?.montant || 0) + 
               (data.FR?.montant || 0),
      montantN1: (data.FL?.montantN1 || 0) + (data.FM?.montantN1 || 0) + (data.FN?.montantN1 || 0) + 
                 (data.FO?.montantN1 || 0) + (data.FP?.montantN1 || 0) + (data.FQ?.montantN1 || 0) + 
                 (data.FR?.montantN1 || 0)
    }
    
    // Variation de trésorerie (ZD)
    totals.ZD = {
      montant: totals.ZA.montant + totals.ZB.montant + totals.ZC.montant,
      montantN1: totals.ZA.montantN1 + totals.ZB.montantN1 + totals.ZC.montantN1
    }
    
    // Pour la réconciliation
    totals.ZD2 = totals.ZD
    
    // Trésorerie au 31 décembre (ZG)
    totals.ZG = {
      montant: (data.ZE?.montant || 0) + totals.ZD.montant + (data.ZF?.montant || 0),
      montantN1: (data.ZE?.montantN1 || 0) + totals.ZD.montantN1 + (data.ZF?.montantN1 || 0)
    }
    
    // Trésorerie nette (ZJ)
    totals.ZJ = {
      montant: (data.ZH?.montant || 0) - (data.ZI?.montant || 0),
      montantN1: (data.ZH?.montantN1 || 0) - (data.ZI?.montantN1 || 0)
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
    
    if (showSign) {
      return value > 0 ? `+${formatted}` : `(${formatted})`
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

    const isTotal = item.type === 'total'
    const isGrandTotal = item.type === 'grandtotal'
    const indent = item.indent || 0

    const getFlowIcon = () => {
      if (item.ref === 'ZD' || item.ref === 'ZG') {
        const value = rowData.montant
        if (value > 0) return <UpIcon color="success" fontSize="small" sx={{ ml: 1 }} />
        if (value < 0) return <DownIcon color="error" fontSize="small" sx={{ ml: 1 }} />
      }
      return null
    }

    return (
      <TableRow 
        key={item.ref}
        sx={{
          backgroundColor: isGrandTotal 
            ? alpha(theme.palette.primary.main, 0.05)
            : isTotal 
            ? alpha(theme.palette.warning.main, 0.05)
            : 'transparent',
          '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.05)
          }
        }}
      >
        <TableCell sx={{ 
          width: '60px',
          fontWeight: isTotal || isGrandTotal ? 600 : 400,
          color: isGrandTotal ? theme.palette.primary.main : isTotal ? theme.palette.warning.dark : 'inherit'
        }}>
          {item.ref}
        </TableCell>
        
        <TableCell sx={{ 
          pl: indent * 3,
          fontWeight: isTotal || isGrandTotal ? 600 : 400,
          fontSize: isGrandTotal ? '0.95rem' : isTotal ? '0.9rem' : '0.875rem'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {item.label}
            {getFlowIcon()}
          </Box>
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
                fontWeight: isTotal || isGrandTotal ? 600 : 400,
                color: isGrandTotal && rowData.montant < 0 ? theme.palette.error.main :
                       isGrandTotal && rowData.montant > 0 ? theme.palette.success.main : 'inherit'
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
            <Typography variant="body2" sx={{ fontWeight: isTotal || isGrandTotal ? 600 : 400 }}>
              {formatNumber(rowData.montantN1)}
            </Typography>
          )}
        </TableCell>
      </TableRow>
    )
  }

  const handleSave = () => {
    console.log('Sauvegarde du TFT:', mergedData)
    setHasChanges(false)
  }

  const handleToggleMode = () => {
    setIsAutoMode(!isAutoMode)
    if (!isAutoMode) {
      loadDataFromBalance()
    }
  }

  // Validation
  const validations = []
  const variationTresorerie = mergedData.ZD?.montant || 0
  const tresorerieFinale = mergedData.ZG?.montant || 0
  const tresorerieNette = mergedData.ZJ?.montant || 0
  
  // Vérifier la cohérence entre ZG et ZJ
  if (Math.abs(tresorerieFinale - tresorerieNette) > 0.01) {
    validations.push({
      type: 'error' as const,
      message: `Incohérence : La trésorerie au 31/12 (${formatNumber(tresorerieFinale)}) ne correspond pas à la trésorerie nette (${formatNumber(tresorerieNette)})`
    })
  }

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
            <CashIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              TABLEAU DE FLUX DE TRÉSORERIE
            </Typography>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title={isAutoMode ? "Mode automatique" : "Mode manuel"}>
              <Button
                variant={isAutoMode ? "contained" : "outlined"}
                size="small"
                startIcon={<AutoIcon />}
                onClick={handleToggleMode}
                color="primary"
              >
                {isAutoMode ? 'Auto' : 'Manuel'}
              </Button>
            </Tooltip>
            
            <Tooltip title="Actualiser">
              <IconButton size="small" onClick={loadDataFromBalance}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
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

        {/* Indicateurs clés */}
        <Stack direction="row" spacing={2}>
          <Chip
            icon={variationTresorerie > 0 ? <UpIcon /> : variationTresorerie < 0 ? <DownIcon /> : undefined}
            label={`Variation: ${formatNumber(variationTresorerie, true)} XOF`}
            color={variationTresorerie > 0 ? "success" : variationTresorerie < 0 ? "error" : "default"}
            variant="outlined"
          />
          
          <Chip
            label={`Flux Opérationnels: ${formatNumber(mergedData.ZA?.montant)} XOF`}
            color="primary"
            variant="outlined"
          />
          
          <Chip
            label={`Flux Investissement: ${formatNumber(mergedData.ZB?.montant)} XOF`}
            color="info"
            variant="outlined"
          />
          
          <Chip
            label={`Flux Financement: ${formatNumber(mergedData.ZC?.montant)} XOF`}
            color="secondary"
            variant="outlined"
          />
          
          {isAutoMode && (
            <Chip
              icon={<CalcIcon />}
              label="Calculé automatiquement"
              color="info"
              size="small"
            />
          )}
        </Stack>
      </Box>

      {/* Messages de validation */}
      {validations.map((validation, index) => (
        <Alert 
          key={index} 
          severity={validation.type}
          sx={{ mb: 2 }}
        >
          {validation.message}
        </Alert>
      ))}

      {/* Tableau */}
      <TableContainer sx={{ mb: 3 }}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Réf</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>LIBELLÉ</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Note</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
                Exercice N
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Exercice N-1</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {TFT_STRUCTURE.map(renderRow)}
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
          placeholder="Saisissez vos commentaires sur les flux de trésorerie..."
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

export default TableauFluxTresorerieSYSCOHADA