import React from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'

const FS = 9 // base font size for this wide table

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

interface DataRow {
  ref: string
  label: string
  isTotal?: boolean
  isSectionHeader?: boolean
  bold?: boolean
  values: (number | null)[]
}

const Note27B: React.FC<PageProps> = ({ entreprise, onNoteClick, ...props }) => {
  const theme = useTheme()

  // 18 value columns: EFFECTIFS (Nationaux M, Nationaux F, Autres M, Autres F, Hors M, Hors F, TOTAL)
  //                    MASSE SALARIALE (Nationaux M, Nationaux F, Autres M, Autres F, Hors M, Hors F, TOTAL)
  // plus REF column and QUALIFICATIONS label = 2 + 14 = 16 value cols total
  // Effectifs: Nat M, Nat F, Autres M, Autres F, Hors M, Hors F, TOTAL = 7
  // Masse:     Nat M, Nat F, Autres M, Autres F, Hors M, Hors F, TOTAL = 7
  // Total value cols = 14

  const emptyVals = (): (number | null)[] => Array(14).fill(null)

  const rows: DataRow[] = [
    // Section: Personnel de l'entite
    { ref: '', label: 'PERSONNEL DE L\'ENTITE', isSectionHeader: true, values: emptyVals() },
    { ref: 'YA', label: '1. Cadres superieurs', values: emptyVals() },
    { ref: 'YB', label: '2. Techniciens superieurs et cadres moyens', values: emptyVals() },
    { ref: 'YC', label: '3. Techniciens, agents de maitrise et ouvriers qualifies', values: emptyVals() },
    { ref: 'YD', label: '4. Employes, manoeuvres, ouvriers, et apprentis', values: emptyVals() },
    { ref: 'YE', label: 'TOTAL (1) (A)', isTotal: true, bold: true, values: emptyVals() },
    // Section: Personnel exterieur
    { ref: '', label: 'PERSONNEL EXTERIEUR', isSectionHeader: true, values: emptyVals() },
    { ref: 'YF', label: '1. Personnel mis a la disposition de l\'entite par d\'autres entites', values: emptyVals() },
    { ref: 'YG', label: '2. Personnel paye par l\'entite mais affecte a d\'autres entites', values: emptyVals() },
    { ref: 'YH', label: 'TOTAL (2) (B)', isTotal: true, bold: true, values: emptyVals() },
    // Grand total
    { ref: 'YI', label: 'TOTAL GENERAL (A)+(B) = (1)+(2)', isTotal: true, bold: true, values: emptyVals() },
  ]

  const fmt = (v: number | null): string => {
    if (v === null || v === undefined || v === 0) return ''
    return Math.round(v).toLocaleString('fr-FR')
  }

  const getRowBgColor = (row: DataRow) => {
    if (row.isSectionHeader) return alpha(theme.palette.primary.main, 0.1)
    if (row.isTotal) return '#1a1a1a'
    return 'transparent'
  }

  const getRowTextColor = (row: DataRow) => {
    if (row.isTotal) return '#fff'
    if (row.isSectionHeader) return theme.palette.primary.dark
    return undefined
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
            {/* Row 1: top-level group headers */}
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
            {/* Row 2: sub-group headers */}
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              {/* Effectifs sub-groups */}
              <TableCell colSpan={2} sx={headerCellSx}>Nationaux</TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>Autres Etats Region (3)</TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>Hors Region</TableCell>
              <TableCell rowSpan={2} sx={headerCellSx}>TOTAL</TableCell>
              {/* Masse salariale sub-groups */}
              <TableCell colSpan={2} sx={headerCellSx}>Nationaux</TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>Autres Etats Region (3)</TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>Hors Region</TableCell>
              <TableCell rowSpan={2} sx={headerCellSx}>TOTAL</TableCell>
            </TableRow>
            {/* Row 3: M/F sub-columns */}
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              {/* Effectifs M/F */}
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              {/* TOTAL already rowSpan=2 */}
              {/* Masse salariale M/F */}
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              <TableCell sx={headerCellSx}>M</TableCell>
              <TableCell sx={headerCellSx}>F</TableCell>
              {/* TOTAL already rowSpan=2 */}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => {
              if (row.isSectionHeader) {
                return (
                  <TableRow
                    key={idx}
                    sx={{
                      bgcolor: getRowBgColor(row),
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
                      {row.label}
                    </TableCell>
                  </TableRow>
                )
              }

              return (
                <TableRow
                  key={idx}
                  sx={{
                    bgcolor: getRowBgColor(row),
                    ...(row.isTotal && {
                      borderTop: '2px solid #333',
                      borderBottom: '2px solid #333',
                    }),
                    '&:hover': {
                      bgcolor: row.isTotal
                        ? '#2a2a2a'
                        : alpha(theme.palette.action.hover, 0.05),
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      ...cellSx,
                      fontWeight: row.bold ? 700 : 400,
                      color: getRowTextColor(row),
                      textAlign: 'left',
                    }}
                  >
                    {row.label}
                  </TableCell>
                  <TableCell
                    sx={{
                      ...cellSx,
                      fontWeight: row.bold ? 700 : 400,
                      color: getRowTextColor(row),
                      textAlign: 'center',
                    }}
                  >
                    {row.ref}
                  </TableCell>
                  {row.values.map((val, vi) => (
                    <TableCell
                      key={vi}
                      align="right"
                      sx={{
                        ...cellSx,
                        fontWeight: row.bold ? 700 : 400,
                        color: getRowTextColor(row),
                        borderColor: row.isTotal ? '#444' : undefined,
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

      {/* Comment note about Zone OHADA */}
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
