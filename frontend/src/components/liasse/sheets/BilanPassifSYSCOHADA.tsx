/**
 * Bilan Passif SYSCOHADA - Avec intégration automatique de la balance
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
import {
  Calculate as CalcIcon,
  Comment as CommentIcon,
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'
import { liasseDataService } from '../../../services/liasseDataService'
import EditableToolbar from '../shared/EditableToolbar'

// Structure exacte du Passif selon SYSCOHADA
const PASSIF_STRUCTURE = [
  { type: 'section', label: 'CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES', bold: true },
  
  { type: 'group', ref: 'CP', label: 'Capitaux propres', indent: 1 },
  { type: 'line', ref: 'CA', label: 'Capital', note: '13', indent: 2 },
  { type: 'line', ref: 'CB', label: 'Actionnaires capital souscrit non appelé (-)', indent: 2 },
  { type: 'line', ref: 'CC', label: 'Primes liées au capital social', note: '14', indent: 2 },
  { type: 'line', ref: 'CD', label: 'Écarts de réévaluation', note: '3e', indent: 2 },
  { type: 'line', ref: 'CE', label: 'Réserves indisponibles', note: '14', indent: 2 },
  { type: 'line', ref: 'CF', label: 'Réserves libres', note: '14', indent: 2 },
  { type: 'line', ref: 'CG', label: 'Report à nouveau (+ ou -)', note: '14', indent: 2 },
  { type: 'line', ref: 'CH', label: 'Résultat net de l\'exercice (+ ou -)', indent: 2 },
  { type: 'line', ref: 'CI', label: 'Subventions d\'investissement', note: '15', indent: 2 },
  { type: 'line', ref: 'CJ', label: 'Provisions réglementées', note: '15', indent: 2 },
  
  { type: 'total', ref: 'CL', label: 'TOTAL CAPITAUX PROPRES', formula: 'CA-CB+CC+CD+CE+CF+CG+CH+CI+CJ' },
  
  { type: 'line', ref: 'CM', label: 'Autres capitaux propres', indent: 1 },
  { type: 'line', ref: 'CN', label: 'Comptes de l\'exploitant', indent: 2 },
  { type: 'line', ref: 'CO', label: 'Primes liées aux titres participatifs', indent: 2 },
  { type: 'line', ref: 'CR', label: 'Avances conditionnées', indent: 2 },
  
  { type: 'total', ref: 'CS', label: 'TOTAL AUTRES CAPITAUX PROPRES', formula: 'CM+CN+CO+CR' },
  
  { type: 'total', ref: 'CZ', label: 'TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES', formula: 'CL+CS' },
  
  { type: 'section', label: 'DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES', bold: true },
  
  { type: 'line', ref: 'DA', label: 'Emprunts obligataires', note: '16', indent: 1 },
  { type: 'line', ref: 'DB', label: 'Emprunts et dettes auprès des établissements de crédit', note: '16', indent: 1 },
  { type: 'line', ref: 'DC', label: 'Emprunts et dettes financières diverses', note: '16', indent: 1 },
  { type: 'line', ref: 'DD', label: 'Dettes de crédit-bail et contrats assimilés', note: '16', indent: 1 },
  { type: 'line', ref: 'DE', label: 'Dettes financières diverses', note: '16', indent: 1 },
  { type: 'line', ref: 'DF', label: 'Provisions pour risques et charges', note: '16', indent: 1 },
  
  { type: 'total', ref: 'DG', label: 'TOTAL DETTES FINANCIÈRES', formula: 'DA+DB+DC+DD+DE+DF' },
  
  { type: 'total', ref: 'DP', label: 'TOTAL RESSOURCES STABLES', formula: 'CZ+DG' },
  
  { type: 'section', label: 'PASSIF CIRCULANT', bold: true },
  
  { type: 'line', ref: 'DH', label: 'Dettes circulantes HAO', indent: 1 },
  { type: 'line', ref: 'DI', label: 'Clients, avances reçues', note: '17', indent: 1 },
  { type: 'line', ref: 'DJ', label: 'Fournisseurs d\'exploitation', note: '18', indent: 1 },
  { type: 'line', ref: 'DK', label: 'Dettes fiscales et sociales', note: '19', indent: 1 },
  { type: 'line', ref: 'DL', label: 'Autres dettes', note: '20', indent: 1 },
  { type: 'line', ref: 'DM', label: 'Provisions pour risques à court terme', note: '19', indent: 1 },
  
  { type: 'total', ref: 'DN', label: 'TOTAL PASSIF CIRCULANT', formula: 'DH+DI+DJ+DK+DL+DM' },
  
  { type: 'section', label: 'TRÉSORERIE - PASSIF', bold: true },
  
  { type: 'line', ref: 'DQ', label: 'Banques, crédits d\'escompte', note: '22', indent: 1 },
  { type: 'line', ref: 'DR', label: 'Banques, établissements financiers et crédits de trésorerie', note: '22', indent: 1 },
  
  { type: 'total', ref: 'DS', label: 'TOTAL TRÉSORERIE - PASSIF', formula: 'DQ+DR' },
  
  { type: 'line', ref: 'DT', label: 'Écart de conversion - Passif', note: '23', indent: 0 },
  
  { type: 'grandtotal', ref: 'DZ', label: 'TOTAL GÉNÉRAL PASSIF', formula: 'DP+DN+DS+DT' }
]

interface BilanPassifData {
  [ref: string]: {
    montant: number
    montantN1: number
    note?: string
  }
}

const BilanPassifSYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [data, setData] = useState<BilanPassifData>({})
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
    const passifData = liasseDataService.generateBilanPassif()
    
    const newData: BilanPassifData = {}
    passifData.forEach((item: any) => {
      newData[item.ref] = {
        montant: item.montant || 0,
        montantN1: item.montant_n1 || 0,
        note: ''
      }
    })
    
    setData(newData)
  }

  // Calculer les totaux automatiquement
  const calculateTotals = useMemo(() => {
    const totals: BilanPassifData = {}
    
    // Cherche d'abord dans totals (pour les sous-totaux déjà calculés), puis dans data
    const calculateGroup = (refs: string[]) => {
      let montant = 0, montantN1 = 0
      refs.forEach(ref => {
        const source = totals[ref] || data[ref]
        if (source) {
          // Gérer le cas spécial CB qui est soustrait
          if (ref === 'CB') {
            montant -= source.montant || 0
            montantN1 -= source.montantN1 || 0
          } else {
            montant += source.montant || 0
            montantN1 += source.montantN1 || 0
          }
        }
      })
      return { montant, montantN1 }
    }

    // Total Capitaux Propres (CL)
    totals.CL = calculateGroup(['CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'CI', 'CJ'])

    // Total Autres Capitaux Propres (CS)
    totals.CS = calculateGroup(['CM', 'CN', 'CO', 'CR'])

    // Total Capitaux Propres et Ressources Assimilées (CZ)
    totals.CZ = calculateGroup(['CL', 'CS'])

    // Total Dettes Financières (DG)
    totals.DG = calculateGroup(['DA', 'DB', 'DC', 'DD', 'DE', 'DF'])

    // Total Ressources Stables (DP)
    totals.DP = calculateGroup(['CZ', 'DG'])

    // Total Passif Circulant (DN)
    totals.DN = calculateGroup(['DH', 'DI', 'DJ', 'DK', 'DL', 'DM'])

    // Total Trésorerie Passif (DS)
    totals.DS = calculateGroup(['DQ', 'DR'])

    // Total Général Passif (DZ)
    totals.DZ = calculateGroup(['DP', 'DN', 'DS', 'DT'])
    
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
        [field]: field === 'note' ? value : numValue
      }
    }))
    
    setHasChanges(true)
  }

  const formatNumber = (value: number | undefined) => {
    if (!value || value === 0) return '-'
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
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
                color: isGrandTotal ? theme.palette.error.main : 'inherit'
              }}
            >
              {formatNumber(rowData.montant)}
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
    console.log('Sauvegarde du Bilan Passif:', mergedData)
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
  const totalPassif = mergedData.DZ?.montant || 0
  
  if (totalPassif === 0) {
    validations.push({
      type: 'warning' as const,
      message: 'Le bilan passif est vide. Importez une balance ou saisissez les données manuellement.'
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
            BILAN - PASSIF (en FCFA)
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

        <Stack direction="row" spacing={2}>
          <Chip
            icon={<ValidIcon />}
            label={`Total Passif: ${formatNumber(totalPassif)}`}
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
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Réf</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>PASSIF</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Note</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Net
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Net N-1</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {PASSIF_STRUCTURE.map(renderRow)}
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
          placeholder="Saisissez vos commentaires et observations pour le Bilan Passif..."
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

export default memo(BilanPassifSYSCOHADA)