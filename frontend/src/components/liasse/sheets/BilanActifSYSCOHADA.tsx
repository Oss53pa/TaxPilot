import { logger } from '@/utils/logger'
/**
 * Bilan Actif SYSCOHADA - Avec intégration automatique de la balance
 * Respecte le style et la charte graphique TaxPilot
 */

import React, { useState, useEffect, useMemo, memo } from 'react'
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
  Stack,
  useTheme,
  alpha,
} from '@mui/material'
import { formatNumber as formatNumberFR } from '@/utils/formatting'
import {
  Calculate as CalcIcon,
  Comment as CommentIcon,
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { liasseDataService } from '@/services/liasseDataService'
import EditableToolbar from '../shared/EditableToolbar'

// Structure exacte selon SYSCOHADA
const ACTIF_STRUCTURE = [
  { type: 'section', label: 'ACTIF IMMOBILISÉ', bold: true },
  
  { type: 'group', ref: 'AX', label: 'Charges immobilisées', note: '3', indent: 1 },
  { type: 'line', ref: 'AQ', label: 'Frais d\'établissement', indent: 2 },
  { type: 'line', ref: 'AR', label: 'Charges à répartir', indent: 2 },
  { type: 'line', ref: 'AS', label: 'Primes de remboursement des obligations', indent: 2 },
  
  { type: 'group', ref: 'AC', label: 'Immobilisations incorporelles', note: '3', indent: 1 },
  { type: 'line', ref: 'AD', label: 'Frais de recherche et développement', indent: 2 },
  { type: 'line', ref: 'AE', label: 'Brevets, licences, logiciels, et droits similaires', indent: 2 },
  { type: 'line', ref: 'AF', label: 'Fonds commercial et droit au bail', indent: 2 },
  { type: 'line', ref: 'AG', label: 'Autres immobilisations incorporelles', indent: 2 },
  
  { type: 'group', ref: 'AI', label: 'Immobilisations corporelles', note: '3', indent: 1 },
  { type: 'line', ref: 'AJ', label: 'Terrains', indent: 2 },
  { type: 'line', ref: 'AK', label: 'Bâtiments', indent: 2 },
  { type: 'line', ref: 'AL', label: 'Installations et agencements', indent: 2 },
  { type: 'line', ref: 'AM', label: 'Matériel', indent: 2 },
  { type: 'line', ref: 'AN', label: 'Matériel de transport', indent: 2 },
  
  { type: 'line', ref: 'AP', label: 'Avances et acomptes versés sur immobilisations', note: '3', indent: 1 },
  
  { type: 'group', ref: 'AW', label: 'Immobilisations financières', note: '4', indent: 1 },
  { type: 'line', ref: 'AT', label: 'Titres de participation', indent: 2 },
  { type: 'line', ref: 'AU', label: 'Autres immobilisations financières', indent: 2 },
  
  { type: 'total', ref: 'AZ', label: 'TOTAL ACTIF IMMOBILISÉ', formula: 'AX+AC+AI+AP+AW' },
  
  { type: 'section', label: 'ACTIF CIRCULANT', bold: true },
  
  { type: 'line', ref: 'BA', label: 'Actif circulant HAO', note: '5', indent: 1 },
  
  { type: 'group', ref: 'BB', label: 'Stocks et encours', note: '6', indent: 1 },
  { type: 'line', ref: 'BC', label: 'Marchandises', indent: 2 },
  { type: 'line', ref: 'BD', label: 'Matières premières et fournitures liées', indent: 2 },
  { type: 'line', ref: 'BE', label: 'Autres approvisionnements', indent: 2 },
  { type: 'line', ref: 'BF', label: 'Encours', indent: 2 },
  { type: 'line', ref: 'BG', label: 'Produits fabriqués', indent: 2 },
  
  { type: 'group', ref: 'BH', label: 'Créances et emplois assimilés', note: '7', indent: 1 },
  { type: 'line', ref: 'BI', label: 'Fournisseurs, avances versées', note: '17', indent: 2 },
  { type: 'line', ref: 'BJ', label: 'Clients', note: '7', indent: 2 },
  { type: 'line', ref: 'BK', label: 'Autres créances', note: '8', indent: 2 },
  
  { type: 'total', ref: 'BL', label: 'TOTAL ACTIF CIRCULANT', formula: 'BA+BB+BH' },
  
  { type: 'section', label: 'TRÉSORERIE - ACTIF', bold: true },
  
  { type: 'line', ref: 'BQ', label: 'Titres de placement', note: '9', indent: 1 },
  { type: 'line', ref: 'BR', label: 'Valeurs à encaisser', note: '10', indent: 1 },
  { type: 'line', ref: 'BS', label: 'Banques, chèques postaux, caisse et assimilés', note: '11', indent: 1 },
  
  { type: 'total', ref: 'BT', label: 'TOTAL TRÉSORERIE - ACTIF', formula: 'BQ+BR+BS' },
  
  { type: 'line', ref: 'BU', label: 'Écart de conversion - Actif', note: '12', indent: 0 },
  
  { type: 'grandtotal', ref: 'BZ', label: 'TOTAL GÉNÉRAL ACTIF', formula: 'AZ+BL+BT+BU' }
]

interface BilanActifData {
  [ref: string]: {
    brut: number
    amortProv: number
    net: number
    netN1: number
    note?: string
  }
}

const BilanActifSYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [data, setData] = useState<BilanActifData>({})
  const [comment, setComment] = useState('')
  const [isAutoMode, setIsAutoMode] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  // Charger les données depuis la balance
  useEffect(() => {
    if (isAutoMode) {
      loadDataFromBalance()
    }
  }, [isAutoMode])

  const loadDataFromBalance = () => {
    // Simuler le chargement depuis la balance
    // En production, cela viendrait de l'état Redux ou d'une API
    const balanceData = liasseDataService.generateBilanActif()
    
    const newData: BilanActifData = {}
    balanceData.forEach((item: any) => {
      newData[item.ref] = {
        brut: item.brut || 0,
        amortProv: item.amortProv || 0,
        net: item.net || 0,
        netN1: item.net_n1 || 0,
        note: ''
      }
    })
    
    setData(newData)
  }

  // Calculer les totaux automatiquement
  const calculateTotals = useMemo(() => {
    const totals: BilanActifData = {}
    
    // Calculer les totaux des groupes
    // Cherche d'abord dans totals (pour les sous-totaux déjà calculés), puis dans data
    const calculateGroup = (refs: string[]) => {
      let brut = 0, amortProv = 0, net = 0, netN1 = 0
      refs.forEach(ref => {
        const source = totals[ref] || data[ref]
        if (source) {
          brut += source.brut || 0
          amortProv += source.amortProv || 0
          net += source.net || 0
          netN1 += source.netN1 || 0
        }
      })
      return { brut, amortProv, net, netN1 }
    }
    
    // Charges immobilisées (AX)
    totals.AX = calculateGroup(['AQ', 'AR', 'AS'])
    
    // Immobilisations incorporelles (AC)
    totals.AC = calculateGroup(['AD', 'AE', 'AF', 'AG'])
    
    // Immobilisations corporelles (AI)
    totals.AI = calculateGroup(['AJ', 'AK', 'AL', 'AM', 'AN'])
    
    // Immobilisations financières (AW)
    totals.AW = calculateGroup(['AT', 'AU'])
    
    // Total Actif Immobilisé (AZ)
    totals.AZ = calculateGroup(['AX', 'AC', 'AI', 'AP', 'AW'])
    
    // Stocks (BB)
    totals.BB = calculateGroup(['BC', 'BD', 'BE', 'BF', 'BG'])
    
    // Créances (BH)
    totals.BH = calculateGroup(['BI', 'BJ', 'BK'])
    
    // Total Actif Circulant (BL)
    totals.BL = calculateGroup(['BA', 'BB', 'BH'])
    
    // Total Trésorerie Actif (BT)
    totals.BT = calculateGroup(['BQ', 'BR', 'BS'])
    
    // Total Général (BZ)
    totals.BZ = calculateGroup(['AZ', 'BL', 'BT', 'BU'])
    
    return totals
  }, [data])

  // Fusionner les données avec les totaux calculés
  const mergedData = { ...data, ...calculateTotals }

  const handleCellChange = (ref: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    
    setData(prev => ({
      ...prev,
      [ref]: {
        ...prev[ref],
        [field]: field === 'note' ? value : numValue,
        // Recalculer le net si brut ou amortProv change
        net: field === 'brut' 
          ? numValue - (prev[ref]?.amortProv || 0)
          : field === 'amortProv'
          ? (prev[ref]?.brut || 0) - numValue
          : prev[ref]?.net || 0
      }
    }))
    
    setHasChanges(true)
  }

  const formatNumber = (value: number | undefined) => {
    if (!value || value === 0) return '-'
    return formatNumberFR(value)
  }

  const renderRow = (item: any) => {
    const rowData = mergedData[item.ref] || { brut: 0, amortProv: 0, net: 0, netN1: 0 }
    const isEditable = !isAutoMode && item.type === 'line'
    
    if (item.type === 'section') {
      return (
        <TableRow key={item.label}>
          <TableCell colSpan={7} sx={{ 
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

    return (
      <TableRow 
        key={item.ref}
        sx={{
          backgroundColor: isGrandTotal 
            ? alpha(theme.palette.error.main, 0.05)
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
          color: isGrandTotal ? theme.palette.error.main : isTotal ? theme.palette.warning.dark : 'inherit'
        }}>
          {item.ref}
        </TableCell>
        
        <TableCell sx={{ 
          pl: indent * 3,
          fontWeight: isTotal || isGrandTotal ? 600 : item.type === 'group' ? 500 : 400,
          fontSize: isGrandTotal ? '0.95rem' : isTotal ? '0.9rem' : '0.875rem'
        }}>
          {item.label}
        </TableCell>
        
        <TableCell sx={{ width: '60px', textAlign: 'center' }}>
          {item.note ? (
            <Chip label={item.note} size="small" variant="outlined" />
          ) : isEditable ? (
            <TextField
              size="small"
              value={rowData.note || ''}
              onChange={(e) => handleCellChange(item.ref, 'note', e.target.value)}
              sx={{ width: '50px' }}
              disabled={!isEditable}
            />
          ) : null}
        </TableCell>
        
        <TableCell align="right" sx={{ width: '150px' }}>
          {isEditable ? (
            <TextField
              size="small"
              type="number"
              value={rowData.brut || ''}
              onChange={(e) => handleCellChange(item.ref, 'brut', e.target.value)}
              fullWidth
              disabled={!isEditable}
              InputProps={{
                sx: { fontSize: '0.875rem' }
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ fontWeight: isTotal || isGrandTotal ? 600 : 400 }}>
              {formatNumber(rowData.brut)}
            </Typography>
          )}
        </TableCell>
        
        <TableCell align="right" sx={{ width: '150px' }}>
          {isEditable ? (
            <TextField
              size="small"
              type="number"
              value={rowData.amortProv || ''}
              onChange={(e) => handleCellChange(item.ref, 'amortProv', e.target.value)}
              fullWidth
              disabled={!isEditable}
              InputProps={{
                sx: { fontSize: '0.875rem' }
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ fontWeight: isTotal || isGrandTotal ? 600 : 400 }}>
              {formatNumber(rowData.amortProv)}
            </Typography>
          )}
        </TableCell>
        
        <TableCell align="right" sx={{ 
          width: '150px',
          backgroundColor: alpha(theme.palette.info.main, 0.05)
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: isTotal || isGrandTotal ? 600 : 400,
              color: isGrandTotal ? theme.palette.error.main : 'inherit'
            }}
          >
            {formatNumber(rowData.net)}
          </Typography>
        </TableCell>
        
        <TableCell align="right" sx={{ width: '150px' }}>
          {isEditable ? (
            <TextField
              size="small"
              type="number"
              value={rowData.netN1 || ''}
              onChange={(e) => handleCellChange(item.ref, 'netN1', e.target.value)}
              fullWidth
              disabled={!isEditable}
              InputProps={{
                sx: { fontSize: '0.875rem' }
              }}
            />
          ) : (
            <Typography variant="body2" sx={{ fontWeight: isTotal || isGrandTotal ? 600 : 400 }}>
              {formatNumber(rowData.netN1)}
            </Typography>
          )}
        </TableCell>
      </TableRow>
    )
  }

  const handleSave = () => {
    // Logique de sauvegarde
    logger.debug('Sauvegarde du Bilan Actif:', mergedData)
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
  const totalNet = mergedData.BZ?.net || 0
  
  if (totalNet === 0) {
    validations.push({
      type: 'warning' as const,
      message: 'Le bilan actif est vide. Importez une balance ou saisissez les données manuellement.'
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
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            BILAN - ACTIF (en FCFA)
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

        {/* Indicateurs */}
        <Stack direction="row" spacing={2}>
          <Chip
            icon={<ValidIcon />}
            label={`Total Net: ${formatNumber(totalNet)}`}
            color="primary"
            variant="outlined"
          />
          {isAutoMode && (
            <Chip
              icon={<CalcIcon />}
              label="Données synchronisées avec la balance"
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
          icon={<WarningIcon />}
        >
          {validation.message}
        </Alert>
      ))}

      {/* Tableau */}
      <TableContainer sx={{ mb: 3 }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Réf</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>ACTIF</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Note</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Brut</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Amort./Prov.</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Net
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Net N-1</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ACTIF_STRUCTURE.map(renderRow)}
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
          placeholder="Saisissez vos commentaires et observations pour le Bilan Actif..."
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

export default memo(BilanActifSYSCOHADA)