import React, { useMemo } from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'
import { getCharges, getProduits, getPassif } from '../../services/liasse-calculs'

const FS = 10

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

/**
 * SYSCOHADA Note 28 — Dotations et charges pour provisions et depreciations
 *
 * Columns: A=Opening | B=Dotations (Expl/Fin/HAO) | C=Reprises (Expl/Fin/HAO) | D=Closing
 *
 * Account mappings based on SYSCOHADA Revise 2017:
 * - Provisions reglementees: balance 15, dot 6911, rep 7911
 * - Provisions financieres (risques/charges): balance 19, dot 6912/6913/6972/854, rep 7912/7913/7972/864
 * - Depreciations immobilisations: balance 28/29, dot 681/6914/6974/852/853, rep 781/7914/7974/862/863
 * - Depreciations stocks: balance 39, dot 6593, rep 7593
 * - Depreciations fournisseurs: balance 409, dot 6594, rep 7594
 * - Depreciations clients: balance 491, dot 6594/659, rep 7594/759
 * - Depreciations autres creances: balance 492-498, dot 6595-6598, rep 7595-7598
 * - Depreciations titres placement: balance 59, dot 6795, rep 7795
 */
const Note28: React.FC<PageProps> = ({ entreprise, balance, balanceN1, onNoteClick, ...props }) => {
  const theme = useTheme()

  const rows = useMemo(() => {
    const bal = balance || []
    const balN1 = balanceN1 || []
    const hasN1 = balN1.length > 0

    // Helper: opening = N-1 closing balance (credit side for provisions/depreciations)
    const opening = (prefixes: string[]) => hasN1 ? getPassif(balN1, prefixes) : null
    // Helper: closing balance of provision/depreciation accounts
    const closing = (prefixes: string[]) => getPassif(bal, prefixes)
    // Helper: dotations (charges = debit side of P&L dotation accounts)
    const dot = (prefixes: string[]) => getCharges(bal, prefixes)
    // Helper: reprises (produits = credit side of P&L reprise accounts)
    const rep = (prefixes: string[]) => getProduits(bal, prefixes)

    // Row builder: [ouverture, dot_expl, dot_fin, dot_hao, rep_expl, rep_fin, rep_hao, cloture]
    const makeRow = (
      ouv: number | null,
      dotExpl: number, dotFin: number, dotHao: number,
      repExpl: number, repFin: number, repHao: number,
      clot: number,
    ): (number | null)[] => [
      ouv, dotExpl || null, dotFin || null, dotHao || null,
      repExpl || null, repFin || null, repHao || null,
      clot || null,
    ]

    // --- Section 1: Provisions ---
    const r1Vals = makeRow(
      opening(['15']),
      dot(['6911']), 0, 0,
      rep(['7911']), 0, 0,
      closing(['15']),
    )

    const r2Vals = makeRow(
      opening(['19']),
      dot(['6912', '6913']), dot(['6972']), dot(['854']),
      rep(['7912', '7913']), rep(['7972']), rep(['864']),
      closing(['19']),
    )

    const r3Vals = makeRow(
      opening(['28', '29']),
      dot(['681', '6914']), dot(['6974']), dot(['852', '853']),
      rep(['781', '7914']), rep(['7974']), rep(['862', '863']),
      closing(['28', '29']),
    )

    // Section 1 total
    const st1Vals = r1Vals.map((_, i) => {
      const sum = (r1Vals[i] || 0) + (r2Vals[i] || 0) + (r3Vals[i] || 0)
      return sum || null
    })

    // --- Section 2: Depreciations ---
    const r4Vals = makeRow(
      opening(['39']),
      dot(['6593']), 0, 0,
      rep(['7593']), 0, 0,
      closing(['39']),
    )

    const r5Vals = makeRow(
      opening(['409']),
      dot(['6594']), 0, 0,
      rep(['7594']), 0, 0,
      closing(['409']),
    )

    const r6Vals = makeRow(
      opening(['491']),
      dot(['6594']), 0, 0,
      rep(['7594']), 0, 0,
      closing(['491']),
    )

    const r7Vals = makeRow(
      opening(['492', '493', '494', '495', '496', '497', '498']),
      dot(['6595', '6596', '6597', '6598']), 0, 0,
      rep(['7595', '7596', '7597', '7598']), 0, 0,
      closing(['492', '493', '494', '495', '496', '497', '498']),
    )

    const r8Vals = makeRow(
      opening(['59']),
      0, dot(['6795']), 0,
      0, rep(['7795']), 0,
      closing(['59']),
    )

    // Section 2 total
    const st2Vals = r4Vals.map((_, i) => {
      const sum = (r4Vals[i] || 0) + (r5Vals[i] || 0) + (r6Vals[i] || 0) + (r7Vals[i] || 0) + (r8Vals[i] || 0)
      return sum || null
    })

    // Grand total
    const totalVals = st1Vals.map((_, i) => {
      const sum = (st1Vals[i] || 0) + (st2Vals[i] || 0)
      return sum || null
    })

    return [
      { id: 'sh1', label: 'PROVISIONS', isSectionHeader: true, values: Array(8).fill(null) },
      { id: 'r1', label: 'Provisions reglementees', values: r1Vals },
      { id: 'r2', label: 'Provisions financieres pour risques et charges', values: r2Vals },
      { id: 'r3', label: 'Depreciations des immobilisations', values: r3Vals },
      { id: 'st1', label: 'TOTAL PROVISIONS', isSubtotal: true, bold: true, values: st1Vals },
      { id: 'sh2', label: 'DEPRECIATIONS', isSectionHeader: true, values: Array(8).fill(null) },
      { id: 'r4', label: 'Depreciations des stocks et en cours', values: r4Vals },
      { id: 'r5', label: 'Depreciations des comptes fournisseurs', values: r5Vals },
      { id: 'r6', label: 'Depreciations des comptes clients', values: r6Vals },
      { id: 'r7', label: 'Depreciations autres creances d\'exploitation', values: r7Vals },
      { id: 'r8', label: 'Depreciations des titres de placement', values: r8Vals },
      { id: 'st2', label: 'TOTAL DEPRECIATIONS', isSubtotal: true, bold: true, values: st2Vals },
      { id: 'total', label: 'TOTAL GENERAL', isTotal: true, bold: true, values: totalVals },
    ] as DataRow[]
  }, [balance, balanceN1])

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
      balance={balance}
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
