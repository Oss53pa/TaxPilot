import React, { useCallback, useState, useRef, useEffect } from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useTheme, InputBase,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import { useLiasseManualData } from '../../hooks/useLiasseManualData'

const NUM_ROWS = 10

// 14 columns: designation, unite, then 6 pairs (qty/val) for: pays, OHADA, hors-OHADA, immobilisee, stock_ouv, stock_clot
const VAL_COLS = [
  'pays_qty', 'pays_val', 'ohada_qty', 'ohada_val', 'hors_qty', 'hors_val',
  'immo_qty', 'immo_val', 'stk_ouv_qty', 'stk_ouv_val', 'stk_clo_qty', 'stk_clo_val',
] as const

const InlineEdit: React.FC<{
  value: string | number | null
  type?: 'text' | 'number'
  align?: 'left' | 'center' | 'right'
  onSave: (v: string | number | null) => void
  fontSize?: number
}> = ({ value, type = 'number', align = 'right', onSave, fontSize = 10 }) => {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) ref.current?.focus()
  }, [editing])

  const save = useCallback(() => {
    setEditing(false)
    const trimmed = text.trim()
    if (trimmed === '') return onSave(null)
    if (type === 'number') {
      const num = Number(trimmed.replace(/\s/g, '').replace(',', '.'))
      onSave(isNaN(num) ? null : num)
    } else {
      onSave(trimmed)
    }
  }, [text, type, onSave])

  if (editing) {
    return (
      <InputBase
        inputRef={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        sx={{ fontSize, width: '100%', '& input': { textAlign: align, py: 0, px: 0.5 } }}
      />
    )
  }

  const display = typeof value === 'number' && value !== 0
    ? Math.round(value).toLocaleString('fr-FR')
    : (typeof value === 'string' ? value : '')

  return (
    <Box
      onClick={() => { setText(value != null ? String(value) : ''); setEditing(true) }}
      sx={{ cursor: 'text', minHeight: 16, textAlign: align, '&:hover': { bgcolor: 'action.hover' } }}
    >
      {display || '\u00A0'}
    </Box>
  )
}

const Note32: React.FC<PageProps> = ({ entreprise, onNoteClick, ...props }) => {
  const theme = useTheme()

  const baseRows = Array.from({ length: NUM_ROWS }, (_, i) => ({
    id: `r${i + 1}`,
    cells: {
      designation: null as string | number | null,
      unite: null as string | number | null,
      ...Object.fromEntries(VAL_COLS.map(c => [c, null])),
    },
  }))

  const { mergedRows, setCell } = useLiasseManualData('note32', baseRows)

  // Compute column totals
  const colTotal = (col: string): number => {
    let sum = 0
    for (const row of mergedRows) {
      const v = row.cells[col]
      if (typeof v === 'number') sum += v
    }
    return sum
  }

  const fmt = (v: number): string => v === 0 ? '' : Math.round(v).toLocaleString('fr-FR')

  const headerCellSx = {
    fontWeight: 600,
    fontSize: 9,
    whiteSpace: 'nowrap' as const,
    py: 0.5,
    borderRight: `1px solid ${theme.palette.divider}`,
    textAlign: 'center' as const,
  }

  const dataCellSx = {
    fontSize: 10,
    py: 0,
    px: 0,
    borderRight: `1px solid ${theme.palette.divider}`,
  }

  return (
    <NoteTemplate
      {...props}
      entreprise={entreprise}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 32"
      noteTitle="NOTE 32 : PRODUCTION DE L'EXERCICE"
      pageNumber="55"
    >
      <TableContainer>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell rowSpan={2} sx={{ ...headerCellSx, width: '16%', textAlign: 'left' }}>
                DESIGNATION DU PRODUIT
              </TableCell>
              <TableCell rowSpan={2} sx={{ ...headerCellSx, width: 60 }}>
                Unite de quantite choisie
              </TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>
                Production vendue dans le pays
              </TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>
                Production vendue dans les autres pays de l'OHADA
              </TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>
                Production vendue hors OHADA
              </TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>
                Production immobilisee
              </TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>
                Stock ouverture
              </TableCell>
              <TableCell colSpan={2} sx={{ ...headerCellSx, borderRight: 'none' }}>
                Stock cloture
              </TableCell>
            </TableRow>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <React.Fragment key={i}>
                  <TableCell sx={{ ...headerCellSx, fontSize: 8 }}>Qty</TableCell>
                  <TableCell sx={{ ...headerCellSx, fontSize: 8, ...(i === 5 && { borderRight: 'none' }) }}>Val</TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {mergedRows.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) } }}
              >
                <TableCell sx={{ ...dataCellSx, textAlign: 'left' }}>
                  <InlineEdit value={row.cells.designation} type="text" align="left" onSave={v => setCell(row.id, 'designation', v)} />
                </TableCell>
                <TableCell sx={{ ...dataCellSx, textAlign: 'center' }}>
                  <InlineEdit value={row.cells.unite} type="text" align="center" onSave={v => setCell(row.id, 'unite', v)} />
                </TableCell>
                {VAL_COLS.map((col, j) => (
                  <TableCell key={col} sx={{ ...dataCellSx, textAlign: 'right', ...(j === VAL_COLS.length - 1 && { borderRight: 'none' }) }}>
                    <InlineEdit value={row.cells[col]} onSave={v => setCell(row.id, col, v)} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* TOTAL row */}
            <TableRow sx={{
              bgcolor: '#1a1a1a',
              borderTop: '2px solid #333',
              borderBottom: '2px solid #333',
            }}>
              <TableCell sx={{ ...dataCellSx, fontWeight: 700, fontSize: 11, color: '#fff', bgcolor: '#1a1a1a', textAlign: 'left', borderColor: '#444', px: 0.5 }}>
                TOTAL
              </TableCell>
              <TableCell sx={{ ...dataCellSx, bgcolor: '#1a1a1a', borderColor: '#444' }}>&nbsp;</TableCell>
              {VAL_COLS.map((col, j) => (
                <TableCell key={col} sx={{ ...dataCellSx, fontWeight: 700, color: '#fff', bgcolor: '#1a1a1a', textAlign: 'right', borderColor: '#444', px: 0.5, ...(j === VAL_COLS.length - 1 && { borderRight: 'none' }) }}>
                  {fmt(colTotal(col))}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 1.5 }}>
        <Typography sx={{ fontSize: 9, fontStyle: 'italic', color: 'text.secondary' }}>
          Commentaire : Indiquer la repartition de la production par produit ou famille de produits.
        </Typography>
      </Box>
    </NoteTemplate>
  )
}

export default Note32
