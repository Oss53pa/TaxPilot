import React from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'

const EMPTY_ROWS = 10

const Note32: React.FC<PageProps> = ({ entreprise, onNoteClick, ...props }) => {
  const theme = useTheme()

  const placeholderRows = Array.from({ length: EMPTY_ROWS }, (_, i) => i + 1)

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
    py: 0.3,
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
            {/* Row 1: top-level groupings */}
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
            {/* Row 2: Qty / Val sub-headers */}
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
            {placeholderRows.map((num) => (
              <TableRow
                key={num}
                sx={{
                  '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) },
                }}
              >
                <TableCell sx={{ ...dataCellSx, textAlign: 'left' }}>&nbsp;</TableCell>
                <TableCell sx={{ ...dataCellSx, textAlign: 'center' }}>&nbsp;</TableCell>
                {Array.from({ length: 12 }).map((_, j) => (
                  <TableCell key={j} sx={{ ...dataCellSx, textAlign: 'right', ...(j === 11 && { borderRight: 'none' }) }}>
                    &nbsp;
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
              <TableCell sx={{ ...dataCellSx, fontWeight: 700, fontSize: 11, color: '#fff', bgcolor: '#1a1a1a', textAlign: 'left', borderColor: '#444' }}>
                TOTAL
              </TableCell>
              <TableCell sx={{ ...dataCellSx, bgcolor: '#1a1a1a', borderColor: '#444' }}>&nbsp;</TableCell>
              {Array.from({ length: 12 }).map((_, j) => (
                <TableCell key={j} sx={{ ...dataCellSx, fontWeight: 700, color: '#fff', bgcolor: '#1a1a1a', textAlign: 'right', borderColor: '#444', ...(j === 11 && { borderRight: 'none' }) }}>
                  &nbsp;
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Comment section */}
      <Box sx={{ mt: 1.5 }}>
        <Typography sx={{ fontSize: 9, fontStyle: 'italic', color: 'text.secondary' }}>
          Commentaire : Indiquer la repartition de la production par produit ou famille de produits.
        </Typography>
      </Box>
    </NoteTemplate>
  )
}

export default Note32
