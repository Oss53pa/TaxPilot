import { logger } from '@/utils/logger'
/**
 * Composant générique pour afficher un tableau de la liasse fiscale
 * avec champ de commentaires intégré
 */

import React, { useState, useCallback, useEffect, memo } from 'react'
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
  Divider,
  useTheme,
  alpha,
  InputAdornment,
} from '@mui/material'
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Calculate as CalcIcon,
  Comment as CommentIcon,
  CheckCircle as ValidIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material'

interface TableColumn {
  id: string
  label: string
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'formula'
  width?: string
  align?: 'left' | 'center' | 'right'
  editable?: boolean
  required?: boolean
  formula?: string
  format?: (value: any) => string
}

interface TableRow {
  id: string
  [key: string]: any
}

interface ValidationMessage {
  type: 'error' | 'warning' | 'info' | 'success'
  message: string
  field?: string
}

interface LiasseTableauGeneriqueProps {
  title: string
  sheetId: string
  columns: TableColumn[]
  rows: TableRow[]
  onCellChange?: (rowId: string, columnId: string, value: any) => void
  onCommentChange?: (comment: string) => void
  onSave?: () => void
  comment?: string
  validations?: ValidationMessage[]
  readonly?: boolean
  showTotals?: boolean
  totalRow?: TableRow
  headerColor?: string
  alternateRowColors?: boolean
}

const LiasseTableauGenerique: React.FC<LiasseTableauGeneriqueProps> = ({
  title,
  sheetId: _sheetId,
  columns,
  rows,
  onCellChange,
  onCommentChange,
  onSave,
  comment = '',
  validations = [],
  readonly = false,
  showTotals = false,
  totalRow,
  headerColor = '#2563eb',
  alternateRowColors = true,
}) => {
  const theme = useTheme()
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [localComment, setLocalComment] = useState(comment)
  const [cellValues, setCellValues] = useState<{ [key: string]: any }>({})
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setLocalComment(comment)
  }, [comment])

  // Formatage des valeurs selon le type
  const formatValue = useCallback((value: any, column: TableColumn): string => {
    if (column.format) {
      return column.format(value)
    }

    if (value === null || value === undefined || value === '') {
      return '-'
    }

    switch (column.type) {
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value)
      
      case 'percentage':
        return `${(value * 100).toFixed(2)}%`
      
      case 'number':
        return new Intl.NumberFormat('fr-FR').format(value)
      
      case 'date':
        return new Date(value).toLocaleDateString('fr-FR')
      
      default:
        return String(value)
    }
  }, [])

  // Calcul des formules
  const calculateFormula = useCallback((formula: string, row: TableRow): number => {
    // Remplacer les références de colonnes par leurs valeurs
    let calculation = formula
    columns.forEach(col => {
      const value = row[col.id] || 0
      calculation = calculation.replace(new RegExp(col.id, 'g'), String(value))
    })

    try {
      // Évaluation sécurisée de la formule
      return Function('"use strict"; return (' + calculation + ')')()
    } catch (error) {
      logger.error('Erreur de calcul:', error)
      return 0
    }
  }, [columns])

  // Gestion de l'édition de cellule
  const handleCellClick = useCallback((rowId: string, columnId: string) => {
    if (!readonly) {
      const column = columns.find(c => c.id === columnId)
      if (column?.editable !== false) {
        setEditingCell(`${rowId}-${columnId}`)
      }
    }
  }, [readonly, columns])

  const handleCellChange = useCallback((rowId: string, columnId: string, value: any) => {
    const key = `${rowId}-${columnId}`
    setCellValues(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    
    if (onCellChange) {
      onCellChange(rowId, columnId, value)
    }
  }, [onCellChange])

  const handleCellBlur = useCallback(() => {
    setEditingCell(null)
  }, [])

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalComment(e.target.value)
    setHasChanges(true)
    
    if (onCommentChange) {
      onCommentChange(e.target.value)
    }
  }, [onCommentChange])

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave()
      setHasChanges(false)
    }
  }, [onSave])

  // Obtenir la valeur d'une cellule
  const getCellValue = (row: TableRow, column: TableColumn) => {
    const key = `${row.id}-${column.id}`
    
    if (cellValues[key] !== undefined) {
      return cellValues[key]
    }
    
    if (column.type === 'formula' && column.formula) {
      return calculateFormula(column.formula, row)
    }
    
    return row[column.id]
  }

  // Obtenir l'état de validation
  const getValidationStatus = () => {
    const errors = validations.filter(v => v.type === 'error')
    const warnings = validations.filter(v => v.type === 'warning')
    
    if (errors.length > 0) return 'error'
    if (warnings.length > 0) return 'warning'
    return 'valid'
  }

  const validationStatus = getValidationStatus()

  return (
    <Paper 
      elevation={3}
      sx={{ 
        p: 2,
        backgroundColor: theme.palette.background.paper,
        borderTop: `4px solid ${headerColor}`,
      }}
    >
      {/* En-tête avec titre et actions */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {validationStatus === 'valid' && (
              <Chip
                icon={<ValidIcon />}
                label="Validé"
                color="success"
                size="small"
              />
            )}
            {validationStatus === 'warning' && (
              <Chip
                icon={<WarningIcon />}
                label="Attention"
                color="warning"
                size="small"
              />
            )}
            {validationStatus === 'error' && (
              <Chip
                icon={<ErrorIcon />}
                label="Erreurs"
                color="error"
                size="small"
              />
            )}
          </Stack>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Actualiser">
              <IconButton size="small">
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
                color="primary"
              >
                Enregistrer
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Messages de validation */}
      {validations.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {validations.map((validation, index) => (
            <Alert 
              key={index} 
              severity={validation.type}
              sx={{ mb: 1 }}
            >
              {validation.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Tableau principal */}
      <TableContainer sx={{ mb: 3, maxHeight: '600px' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || (column.type === 'currency' || column.type === 'number' ? 'right' : 'left')}
                  sx={{
                    backgroundColor: alpha(headerColor, 0.1),
                    fontWeight: 600,
                    borderBottom: `2px solid ${headerColor}`,
                    width: column.width,
                    minWidth: column.width,
                  }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography variant="subtitle2">
                      {column.label}
                    </Typography>
                    {column.required && (
                      <Typography color="error" component="span">*</Typography>
                    )}
                    {column.type === 'formula' && (
                      <Tooltip title="Calculé automatiquement">
                        <CalcIcon fontSize="small" color="action" />
                      </Tooltip>
                    )}
                  </Stack>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                sx={{
                  backgroundColor: alternateRowColors && rowIndex % 2 === 0 
                    ? alpha(theme.palette.action.hover, 0.3)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                {columns.map((column) => {
                  const cellKey = `${row.id}-${column.id}`
                  const isEditing = editingCell === cellKey
                  const value = getCellValue(row, column)
                  const isEditable = !readonly && column.editable !== false && column.type !== 'formula'

                  return (
                    <TableCell
                      key={column.id}
                      align={column.align || (column.type === 'currency' || column.type === 'number' ? 'right' : 'left')}
                      onClick={() => isEditable && handleCellClick(row.id, column.id)}
                      sx={{
                        cursor: isEditable ? 'pointer' : 'default',
                        padding: '8px',
                        '&:hover': isEditable ? {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        } : {},
                      }}
                    >
                      {isEditing ? (
                        <TextField
                          value={value || ''}
                          onChange={(e) => handleCellChange(row.id, column.id, e.target.value)}
                          onBlur={handleCellBlur}
                          size="small"
                          fullWidth
                          autoFocus
                          type={column.type === 'number' || column.type === 'currency' ? 'number' : 'text'}
                          InputProps={{
                            startAdornment: column.type === 'currency' ? undefined : column.type === 'percentage' ? (
                              <InputAdornment position="end">%</InputAdornment>
                            ) : undefined,
                          }}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {formatValue(value, column)}
                          </Typography>
                          {isEditable && (
                            <EditIcon 
                              fontSize="small" 
                              sx={{ 
                                opacity: 0.3,
                                fontSize: '14px',
                              }} 
                            />
                          )}
                        </Box>
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
            
            {/* Ligne de totaux */}
            {showTotals && totalRow && (
              <TableRow
                sx={{
                  backgroundColor: alpha(headerColor, 0.1),
                  fontWeight: 600,
                }}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || (column.type === 'currency' || column.type === 'number' ? 'right' : 'left')}
                    sx={{
                      borderTop: `2px solid ${headerColor}`,
                      fontWeight: 600,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {formatValue(totalRow[column.id], column)}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 2 }} />

      {/* Zone de commentaires */}
      <Box>
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
          value={localComment}
          onChange={handleCommentChange}
          placeholder="Saisissez vos commentaires et observations pour ce tableau..."
          disabled={readonly}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: alpha(theme.palette.action.hover, 0.3),
            },
          }}
        />
      </Box>
    </Paper>
  )
}

// Comparateur personnalisé pour React.memo
const arePropsEqual = (prevProps: LiasseTableauGeneriqueProps, nextProps: LiasseTableauGeneriqueProps) => {
  // Comparaison rapide des props principales
  if (
    prevProps.title !== nextProps.title ||
    prevProps.readonly !== nextProps.readonly ||
    prevProps.comment !== nextProps.comment ||
    prevProps.showTotals !== nextProps.showTotals ||
    prevProps.headerColor !== nextProps.headerColor
  ) {
    return false
  }
  
  // Comparaison des arrays (colonnes, lignes, validations)
  if (prevProps.columns.length !== nextProps.columns.length ||
      prevProps.rows.length !== nextProps.rows.length ||
      (prevProps.validations || []).length !== (nextProps.validations || []).length) {
    return false
  }
  
  // Comparaison des colonnes (structure)
  for (let i = 0; i < prevProps.columns.length; i++) {
    const prevCol = prevProps.columns[i]
    const nextCol = nextProps.columns[i]
    if (prevCol.id !== nextCol.id || prevCol.label !== nextCol.label) {
      return false
    }
  }
  
  // Comparaison des données de lignes (valeurs)
  for (let i = 0; i < prevProps.rows.length; i++) {
    const prevRow = prevProps.rows[i]
    const nextRow = nextProps.rows[i]
    if (prevRow.id !== nextRow.id) {
      return false
    }
    
    // Comparaison des valeurs des cellules principales
    for (const col of prevProps.columns) {
      if (prevRow[col.id] !== nextRow[col.id]) {
        return false
      }
    }
  }
  
  return true
}

export default memo(LiasseTableauGenerique, arePropsEqual)