import React from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'

const FS = 10 // base font size

const cellSx = {
  fontSize: FS,
  py: 0.3,
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

interface DataRow {
  id: string
  label: string
  values: (number | null)[] // [ouverture, dot_expl, dot_fin, dot_hao, rep_expl, rep_fin, rep_hao, cloture]
  isTotal?: boolean
  isSubtotal?: boolean
  isSectionHeader?: boolean
  bold?: boolean
}

const Note28: React.FC<PageProps> = ({ entreprise, onNoteClick, ...props }) => {
  const theme = useTheme()

  const emptyVals = (): (number | null)[] => Array(8).fill(null)

  const rows: DataRow[] = [
    // Section 1: Provisions
    { id: 'sh1', label: 'PROVISIONS', isSectionHeader: true, values: emptyVals() },
    { id: 'r1', label: 'Provisions reglementees', values: emptyVals() },
    { id: 'r2', label: 'Provisions financieres pour risques et charges', values: emptyVals() },
    { id: 'r3', label: 'Depreciations des immobilisations', values: emptyVals() },
    { id: 'st1', label: 'TOTAL DOTATIONS', isSubtotal: true, bold: true, values: emptyVals() },

    // Section 2: Depreciations
    { id: 'sh2', label: 'DEPRECIATIONS', isSectionHeader: true, values: emptyVals() },
    { id: 'r4', label: 'Depreciations des stocks et en cours', values: emptyVals() },
    { id: 'r5', label: 'Depreciations des comptes fournisseurs', values: emptyVals() },
    { id: 'r6', label: 'Depreciations des comptes clients', values: emptyVals() },
    { id: 'r7', label: 'Depreciations autres creances d\'exploitation', values: emptyVals() },
    { id: 'r8', label: 'Depreciations des titres de placement', values: emptyVals() },
    { id: 'st2', label: 'TOTAL DEPRECIATIONS', isSubtotal: true, bold: true, values: emptyVals() },

    // Grand total
    { id: 'total', label: 'TOTAL GENERAL', isTotal: true, bold: true, values: emptyVals() },
  ]

  const fmt = (v: number | null): string => {
    if (v === null || v === undefined || v === 0) return ''
    return Math.round(v).toLocaleString('fr-FR')
  }

  const getRowBgColor = (row: DataRow) => {
    if (row.isSectionHeader) return alpha(theme.palette.primary.main, 0.1)
    if (row.isTotal) return '#1a1a1a'
    if (row.isSubtotal) return '#4a4a4a'
    return 'transparent'
  }

  const getRowTextColor = (row: DataRow) => {
    if (row.isTotal || row.isSubtotal) return '#fff'
    if (row.isSectionHeader) return theme.palette.primary.dark
    return undefined
  }

  return (
    <NoteTemplate
      {...props}
      entreprise={entreprise}
      onNoteClick={onNoteClick}
      noteLabel="NOTE 28"
      noteTitle="NOTE 28 : DOTATIONS ET CHARGES POUR PROVISIONS ET DEPRECIATIONS"
      pageNumber="51"
      commentSection={false}
    >
      <TableContainer>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            {/* Row 1: top-level group headers */}
            <TableRow sx={{ bgcolor: 'grey.200' }}>
              <TableCell rowSpan={2} sx={{ ...headerCellSx, width: '22%', textAlign: 'left' }}>
                NATURE
              </TableCell>
              <TableCell rowSpan={2} sx={{ ...headerCellSx, width: '10%' }}>
                <Box>A : PROVISIONS</Box>
                <Box sx={{ fontSize: 8 }}>A L'OUVERTURE</Box>
              </TableCell>
              <TableCell colSpan={3} sx={{ ...headerCellSx, borderBottom: '2px solid #999' }}>
                <Box>B : AUGMENTATIONS</Box>
                <Box sx={{ fontSize: 8 }}>DOTATIONS</Box>
              </TableCell>
              <TableCell colSpan={3} sx={{ ...headerCellSx, borderBottom: '2px solid #999' }}>
                <Box>C : DIMINUTIONS</Box>
                <Box sx={{ fontSize: 8 }}>REPRISES</Box>
              </TableCell>
              <TableCell rowSpan={2} sx={headerCellSx}>
                <Box>D=A+B-C</Box>
                <Box sx={{ fontSize: 8 }}>PROVISIONS</Box>
                <Box sx={{ fontSize: 8 }}>A LA CLOTURE</Box>
              </TableCell>
            </TableRow>
            {/* Row 2: sub-columns for B and C */}
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={headerCellSx}>D'exploitation</TableCell>
              <TableCell sx={headerCellSx}>Financieres</TableCell>
              <TableCell sx={headerCellSx}>HAO</TableCell>
              <TableCell sx={headerCellSx}>D'exploitation</TableCell>
              <TableCell sx={headerCellSx}>Financieres</TableCell>
              <TableCell sx={headerCellSx}>HAO</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              if (row.isSectionHeader) {
                return (
                  <TableRow
                    key={row.id}
                    sx={{
                      bgcolor: getRowBgColor(row),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                    }}
                  >
                    <TableCell
                      colSpan={9}
                      align="center"
                      sx={{
                        ...cellSx,
                        fontWeight: 700,
                        fontSize: 11,
                        color: theme.palette.primary.dark,
                        py: 0.75,
                      }}
                    >
                      {row.label}
                    </TableCell>
                  </TableRow>
                )
              }

              return (
                <TableRow
                  key={row.id}
                  sx={{
                    bgcolor: getRowBgColor(row),
                    ...(row.isTotal && {
                      borderTop: '2px solid #333',
                      borderBottom: '2px solid #333',
                    }),
                    ...(row.isSubtotal && {
                      borderTop: '1px solid #666',
                    }),
                    '&:hover': {
                      bgcolor: row.isTotal
                        ? '#2a2a2a'
                        : row.isSubtotal
                          ? '#555'
                          : alpha(theme.palette.action.hover, 0.05),
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      ...cellSx,
                      fontWeight: row.bold ? 700 : 400,
                      fontSize: row.isTotal ? 11 : FS,
                      color: getRowTextColor(row),
                      bgcolor: getRowBgColor(row),
                      textAlign: 'left',
                      ...((row.isTotal || row.isSubtotal) && {
                        borderRight: '1px solid #444',
                        borderBottom: '1px solid #444',
                      }),
                    }}
                  >
                    {row.label}
                  </TableCell>
                  {row.values.map((val, vi) => (
                    <TableCell
                      key={vi}
                      align="right"
                      sx={{
                        ...cellSx,
                        fontWeight: row.bold ? 700 : 400,
                        fontSize: row.isTotal ? 11 : FS,
                        color: getRowTextColor(row),
                        bgcolor: getRowBgColor(row),
                        ...((row.isTotal || row.isSubtotal) && {
                          borderRight: '1px solid #444',
                          borderBottom: '1px solid #444',
                        }),
                      }}
                    >
                      {fmt(val)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Comment section */}
      <Box sx={{
        mt: 1.5,
        p: 1.5,
        bgcolor: alpha(theme.palette.action.hover, 0.3),
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Typography sx={{ fontSize: 10, fontStyle: 'italic', color: 'text.secondary' }}>
          Commenter toute variation significative.
        </Typography>
      </Box>
    </NoteTemplate>
  )
}

export default Note28
