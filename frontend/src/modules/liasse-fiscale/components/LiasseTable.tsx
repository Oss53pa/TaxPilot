import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, Chip, Typography, useTheme, InputBase,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

export interface Column {
  key: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  subLabel?: string
  editable?: boolean
  type?: 'text' | 'number'
}

export interface Row {
  id: string
  cells: Record<string, string | number | null>
  isSubtotal?: boolean
  isTotal?: boolean
  isSectionHeader?: boolean
  indent?: number
  bold?: boolean
}

interface LiasseTableProps {
  columns: Column[]
  rows: Row[]
  title?: string
  headerRows?: number
  compact?: boolean
  onNoteClick?: (noteNumber: string) => void
  onCellChange?: (rowId: string, colKey: string, value: string | number | null) => void
}

const fmt = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined || v === '') return ''
  if (typeof v === 'number') {
    if (v === 0) return ''
    return v.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  }
  return String(v)
}

// Inline editable cell component
const EditableCell: React.FC<{
  value: string | number | null
  type: 'text' | 'number'
  align: 'left' | 'center' | 'right'
  onSave: (value: string | number | null) => void
  sx?: Record<string, unknown>
}> = ({ value, type, align, onSave, sx }) => {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleClick = useCallback(() => {
    setEditValue(value != null ? String(value) : '')
    setEditing(true)
  }, [value])

  const handleSave = useCallback(() => {
    setEditing(false)
    const trimmed = editValue.trim()
    if (trimmed === '') {
      onSave(null)
    } else if (type === 'number') {
      const num = Number(trimmed.replace(/\s/g, '').replace(',', '.'))
      onSave(isNaN(num) ? null : num)
    } else {
      onSave(trimmed)
    }
  }, [editValue, type, onSave])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(false)
  }, [handleSave])

  if (editing) {
    return (
      <InputBase
        inputRef={inputRef}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        sx={{
          fontSize: 11,
          width: '100%',
          py: 0,
          px: 0.5,
          bgcolor: '#fff',
          border: '1px solid',
          borderColor: 'primary.main',
          borderRadius: 0.5,
          textAlign: align,
          '& input': { textAlign: align, py: 0, px: 0.5 },
        }}
        inputProps={{ style: { textAlign: align } }}
      />
    )
  }

  return (
    <Box
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        minHeight: 20,
        px: 0.5,
        py: 0.25,
        borderRadius: 0.5,
        border: '1px dashed transparent',
        '&:hover': {
          border: '1px dashed',
          borderColor: 'primary.light',
          bgcolor: alpha('#1976d2', 0.04),
        },
        ...sx,
      }}
    >
      {fmt(value) || <Typography component="span" sx={{ color: '#bbb', fontSize: 10, fontStyle: 'italic' }}>—</Typography>}
    </Box>
  )
}

const LiasseTable: React.FC<LiasseTableProps> = ({ columns, rows, title, compact, onNoteClick, onCellChange }) => {
  const theme = useTheme()

  // Show all rows including empty ones (same height as populated rows)
  const filteredRows = rows

  return (
    <Box sx={{ mb: 2 }}>
      {title && (
        <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 0.5 }}>
          {title}
        </Typography>
      )}
      <TableContainer sx={compact ? { overflow: 'hidden' } : undefined}>
        <Table size="small" sx={{ minWidth: compact ? 0 : 600, tableLayout: compact ? 'fixed' : 'auto', width: '100%' }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              {columns.map(col => (
                <TableCell
                  key={col.key}
                  align={col.align || 'center'}
                  sx={{
                    fontWeight: 600,
                    fontSize: compact ? 8 : 10,
                    width: col.width,
                    whiteSpace: 'nowrap',
                    py: compact ? 0.25 : 0.5,
                    px: compact ? 0.5 : 1,
                  }}
                >
                  {col.label}
                  {col.subLabel && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: compact ? 7 : 9, fontWeight: 400 }}>
                      {col.subLabel}
                    </Typography>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map(row => {
              const isTotal = row.isTotal
              const isSubtotal = row.isSubtotal
              const isSectionHeader = row.isSectionHeader
              const fontWeight = (isTotal || isSubtotal || row.bold) ? 600 : 400

              return (
                <TableRow
                  key={row.id}
                  className={isTotal || isSubtotal ? 'total-row' : undefined}
                  sx={{
                    bgcolor: isSectionHeader
                      ? alpha(theme.palette.primary.main, 0.1)
                      : isTotal
                        ? '#1a1a1a'
                        : isSubtotal
                          ? '#4a4a4a'
                          : 'transparent',
                    ...(isTotal && {
                      borderTop: '2px solid #333',
                      borderBottom: '2px solid #333',
                    }),
                    ...(isSubtotal && {
                      borderTop: '1px solid #666',
                    }),
                    '&:hover': {
                      bgcolor: isSectionHeader
                        ? alpha(theme.palette.primary.main, 0.15)
                        : isTotal
                          ? '#2a2a2a'
                          : isSubtotal
                            ? '#555'
                            : alpha(theme.palette.action.hover, 0.05),
                    },
                  }}
                >
                  {isSectionHeader ? (
                    <TableCell
                      colSpan={columns.length}
                      align="center"
                      sx={{
                        fontWeight: 700,
                        fontSize: 12,
                        color: theme.palette.primary.dark,
                        py: 1,
                      }}
                    >
                      {columns.map(c => row.cells[c.key]).find(v => v != null && v !== '') || ''}
                    </TableCell>
                  ) : (
                    columns.map(col => {
                      const val = row.cells[col.key]
                      const isNumeric = col.align === 'right' || (typeof val === 'number')
                      const isEditable = col.editable && !isTotal && !isSubtotal && onCellChange

                      return (
                        <TableCell
                          key={col.key}
                          align={col.align || (isNumeric ? 'right' : 'left')}
                          sx={{
                            fontWeight: isTotal || isSubtotal ? 700 : fontWeight,
                            fontSize: compact
                              ? (isTotal ? 9 : 8)
                              : (isTotal ? 12 : isSubtotal ? 11.5 : 11),
                            color: isTotal || isSubtotal ? '#fff' : undefined,
                            bgcolor: isTotal
                              ? '#1a1a1a'
                              : isSubtotal
                                ? '#4a4a4a'
                                : undefined,
                            py: compact ? 0.15 : isEditable ? 0.25 : 0.5,
                            px: compact ? 0.5 : 1,
                            height: compact ? 22 : 28,
                            pl: row.indent && col.key === columns[1]?.key
                              ? `${(row.indent * (compact ? 12 : 24)) + (compact ? 8 : 16)}px`
                              : undefined,
                            borderColor: isTotal || isSubtotal ? '#444' : undefined,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {isEditable ? (
                            <EditableCell
                              value={val}
                              type={col.type || (col.align === 'right' ? 'number' : 'text')}
                              align={col.align || (isNumeric ? 'right' : 'left')}
                              onSave={(newVal) => onCellChange(row.id, col.key, newVal)}
                            />
                          ) : col.key === 'note' && val && onNoteClick
                            ? <Chip
                                label={String(val)}
                                size="small"
                                variant="outlined"
                                clickable
                                onClick={() => onNoteClick(String(val))}
                                color="primary"
                                sx={{
                                  height: 18,
                                  minWidth: 18,
                                  fontSize: compact ? 8 : 10,
                                  fontWeight: 600,
                                  '& .MuiChip-label': { px: 0.5, py: 0 },
                                  '&:hover': { bgcolor: 'primary.main', color: 'white', borderColor: 'primary.main' },
                                }}
                              />
                            : fmt(val)}
                        </TableCell>
                      )
                    })
                  )}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default LiasseTable
