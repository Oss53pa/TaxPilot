import React, { useCallback, useState, useRef, useEffect } from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useTheme, InputBase,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const FS = 9

const cellSx = {
  fontSize: FS,
  py: 0.25,
  px: 0.5,
  borderRight: '1px solid #ccc',
  borderBottom: '1px solid #ccc',
} as const

const headerCellSx = {
  ...cellSx,
  fontWeight: 700,
  fontSize: FS,
  textAlign: 'center' as const,
  whiteSpace: 'nowrap' as const,
  bgcolor: 'grey.100',
} as const

// Column keys for the 14 value columns
const VAL_COLS = [
  'eff_nat_m', 'eff_nat_f', 'eff_aut_m', 'eff_aut_f', 'eff_hrs_m', 'eff_hrs_f', 'eff_total',
  'sal_nat_m', 'sal_nat_f', 'sal_aut_m', 'sal_aut_f', 'sal_hrs_m', 'sal_hrs_f', 'sal_total',
] as const

interface RowDef {
  id: string
  ref: string
  label: string
  isTotal?: boolean
  isSectionHeader?: boolean
  bold?: boolean
  totalOf?: string[] // row ids to sum for totals
}

const ROW_DEFS: RowDef[] = [
  { id: 'sh1', ref: '', label: 'PERSONNEL DE L\'ENTITE', isSectionHeader: true },
  { id: 'r1', ref: 'YA', label: '1. Cadres superieurs' },
  { id: 'r2', ref: 'YB', label: '2. Techniciens superieurs et cadres moyens' },
  { id: 'r3', ref: 'YC', label: '3. Techniciens, agents de maitrise et ouvriers qualifies' },
  { id: 'r4', ref: 'YD', label: '4. Employes, manoeuvres, ouvriers, et apprentis' },
  { id: 'st1', ref: 'YE', label: 'TOTAL (1) (A)', isTotal: true, bold: true, totalOf: ['r1', 'r2', 'r3', 'r4'] },
  { id: 'sh2', ref: '', label: 'PERSONNEL EXTERIEUR', isSectionHeader: true },
  { id: 'r5', ref: 'YF', label: '1. Personnel mis a la disposition de l\'entite par d\'autres entites' },
  { id: 'r6', ref: 'YG', label: '2. Personnel paye par l\'entite mais affecte a d\'autres entites' },
  { id: 'st2', ref: 'YH', label: 'TOTAL (2) (B)', isTotal: true, bold: true, totalOf: ['r5', 'r6'] },
  { id: 'total', ref: 'YI', label: 'TOTAL GENERAL (A)+(B) = (1)+(2)', isTotal: true, bold: true, totalOf: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] },
]

const emptyCells = () => {
  const cells: Record<string, string | number | null> = { label: '' }
  for (const col of VAL_COLS) cells[col] = null
  return cells
}

const InlineEdit: React.FC<{
  value: number | null
  onSave: (v: number | null) => void
}> = ({ value, onSave }) => {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) ref.current?.focus()
  }, [editing])

  const save = useCallback(() => {
    setEditing(false)
    const trimmed = text.trim().replace(/\s/g, '').replace(',', '.')
    onSave(trimmed === '' ? null : isNaN(Number(trimmed)) ? null : Number(trimmed))
  }, [text, onSave])

  if (editing) {
    return (
      <InputBase
        inputRef={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        sx={{ fontSize: FS, width: '100%', '& input': { textAlign: 'right', py: 0, px: 0.5 } }}
      />
    )
  }

  const fmt = value != null && value !== 0 ? Math.round(value).toLocaleString('fr-FR') : ''
  return (
    <Box
      onClick={() => { setText(value != null ? String(value) : ''); setEditing(true) }}
      sx={{ cursor: 'text', minHeight: 16, textAlign: 'right', '&:hover': { bgcolor: 'action.hover' } }}
    >
      {fmt}
    </Box>
  )
}

const Note27B: React.FC<PageProps> = ({ entreprise, onNoteClick, ...props }) => {
  const theme = useTheme()

  const baseRows = ROW_DEFS.map(d => ({
    id: d.id,
    cells: emptyCells(),
  }))

  const { mergedRows, setCell } = useLiasseManualData('note27b', baseRows)

  // Compute totals
  const getVal = (rowId: string, col: string): number => {
    const row = mergedRows.find(r => r.id === rowId)
    const v = row?.cells[col]
    return typeof v === 'number' ? v : 0
  }

  const totalVal = (rowDef: RowDef, col: string): number | null => {
    if (!rowDef.totalOf) return null
    const sum = rowDef.totalOf.reduce((acc, id) => acc + getVal(id, col), 0)
    return sum || null
  }

  const getRowBgColor = (row: RowDef) => {
    if (row.isSectionHeader) return alpha(theme.palette.primary.main, 0.1)
    if (row.isTotal) return '#1a1a1a'
    return 'transparent'
  }

  const getRowTextColor = (row: RowDef) => {
    if (row.isTotal) return '#fff'
    if (row.isSectionHeader) return theme.palette.primary.dark
    return undefined
  }

  const fmt = (v: number | null): string => {
    if (v === null || v === undefined || v === 0) return ''
    return Math.round(v).toLocaleString('fr-FR')
  }

  return (
    <NoteTemplate
      {...props}
      entreprise={entreprise}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 27B"
      noteTitle="NOTE 27B : EFFECTIFS, MASSE SALARIALE ET PERSONNEL EXTERIEUR"
      pageNumber="50"
      commentSection={false}
    >
      <TableContainer>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.200' }}>
              <TableCell rowSpan={3} sx={{ ...headerCellSx, width: '20%', textAlign: 'left' }}>
                QUALIFICATIONS
              </TableCell>
              <TableCell rowSpan={3} sx={{ ...headerCellSx, width: 30 }}>
                REF
              </TableCell>
              <TableCell colSpan={7} sx={{ ...headerCellSx, borderBottom: '2px solid #999' }}>
                EFFECTIFS
              </TableCell>
              <TableCell colSpan={7} sx={{ ...headerCellSx, borderBottom: '2px solid #999' }}>
                MASSE SALARIALE
              </TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell colSpan={2} sx={headerCellSx}>Nationaux</TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>Autres Etats Region (3)</TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>Hors Region</TableCell>
              <TableCell rowSpan={2} sx={headerCellSx}>TOTAL</TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>Nationaux</TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>Autres Etats Region (3)</TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>Hors Region</TableCell>
              <TableCell rowSpan={2} sx={headerCellSx}>TOTAL</TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ROW_DEFS.map((rowDef) => {
              if (rowDef.isSectionHeader) {
                return (
                  <TableRow
                    key={rowDef.id}
                    sx={{
                      bgcolor: getRowBgColor(rowDef),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                    }}
                  >
                    <TableCell
                      colSpan={16}
                      align="center"
                      sx={{
                        ...cellSx,
                        fontWeight: 700,
                        fontSize: 10,
                        color: theme.palette.primary.dark,
                        py: 0.75,
                      }}
                    >
                      {rowDef.label}
                    </TableCell>
                  </TableRow>
                )
              }

              const isComputed = !!rowDef.totalOf

              return (
                <TableRow
                  key={rowDef.id}
                  sx={{
                    bgcolor: getRowBgColor(rowDef),
                    ...(rowDef.isTotal && {
                      borderTop: '2px solid #333',
                      borderBottom: '2px solid #333',
                    }),
                    '&:hover': {
                      bgcolor: rowDef.isTotal
                        ? '#2a2a2a'
                        : alpha(theme.palette.action.hover, 0.05),
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      ...cellSx,
                      fontWeight: rowDef.bold ? 700 : 400,
                      color: getRowTextColor(rowDef),
                      textAlign: 'left',
                    }}
                  >
                    {rowDef.label}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellSx,
                      fontWeight: rowDef.bold ? 700 : 400,
                      color: getRowTextColor(rowDef),
                      textAlign: 'center',
                    }}
                  >
                    {rowDef.ref}
                  </TableCell>
                  {VAL_COLS.map((col) => (
                    <TableCell
                      key={col}
                      align="right"
                      sx={{
                        ...cellSx,
                        fontWeight: rowDef.bold ? 700 : 400,
                        color: getRowTextColor(rowDef),
                        borderColor: rowDef.isTotal ? '#444' : undefined,
                        p: isComputed ? undefined : 0,
                      }}
                    >
                      {isComputed
                        ? fmt(totalVal(rowDef, col))
                        : <InlineEdit value={getVal(rowDef.id, col) || null} onSave={v => setCell(rowDef.id, col, v)} />
                      }
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{
        mt: 1.5,
        p: 1.5,
        bgcolor: alpha(theme.palette.action.hover, 0.3),
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Typography sx={{ fontSize: 10, fontStyle: 'italic', color: 'text.secondary' }}>
          (3) Zone OHADA : Benin, Burkina Faso, Cameroun, Centrafrique, Comores, Congo, Cote d'Ivoire,
          Gabon, Guinee, Guinee Bissau, Guinee Equatoriale, Mali, Niger, RD Congo, Senegal, Tchad, Togo.
        </Typography>
      </Box>
    </NoteTemplate>
  )
}

export default Note27B
