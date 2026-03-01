import React from 'react'
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, Chip, Typography, useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'

export interface Column {
  key: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  subLabel?: string
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
}

const fmt = (v: string | number | null | undefined): string => {
  if (v === null || v === undefined || v === '') return ''
  if (typeof v === 'number') {
    if (v === 0) return ''
    return v.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  }
  return String(v)
}

const LiasseTable: React.FC<LiasseTableProps> = ({ columns, rows, title, compact: _compact, onNoteClick }) => {
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
      <TableContainer>
        <Table size="small" sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              {columns.map(col => (
                <TableCell
                  key={col.key}
                  align={col.align || 'center'}
                  sx={{
                    fontWeight: 600,
                    fontSize: 10,
                    width: col.width,
                    whiteSpace: 'nowrap',
                    py: 0.5,
                  }}
                >
                  {col.label}
                  {col.subLabel && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 9, fontWeight: 400 }}>
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
                    // Section header: single cell spanning all columns
                    // Pick the first non-empty cell value (label is usually in the 2nd column, not 'ref')
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

                      return (
                        <TableCell
                          key={col.key}
                          align={col.align || (isNumeric ? 'right' : 'left')}
                          sx={{
                            fontWeight: isTotal || isSubtotal ? 700 : fontWeight,
                            fontSize: isTotal ? 12 : isSubtotal ? 11.5 : 11,
                            color: isTotal || isSubtotal ? '#fff' : undefined,
                            bgcolor: isTotal
                              ? '#1a1a1a'
                              : isSubtotal
                                ? '#4a4a4a'
                                : undefined,
                            py: 0.5,
                            height: 28,
                            pl: row.indent && col.key === columns[0].key
                              ? `${(row.indent * 24) + 16}px`
                              : undefined,
                            borderColor: isTotal || isSubtotal ? '#444' : undefined,
                          }}
                        >
                          {col.key === 'note' && val && onNoteClick
                            ? <Chip
                                label={String(val)}
                                size="small"
                                variant="outlined"
                                clickable
                                onClick={() => onNoteClick(String(val))}
                                color="primary"
                                sx={{
                                  fontWeight: 600,
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
