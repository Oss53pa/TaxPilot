import React from 'react'
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import NoteTemplate from '../NoteTemplate'
import type { PageProps } from '../../types'

const EMPTY_ROWS = 10

const Note33: React.FC<PageProps> = ({ entreprise, onNoteClick, ...props }) => {
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
      noteLabel="NOTE 33"
      noteTitle="NOTE 33 : ACHATS DESTINES A LA PRODUCTION"
      pageNumber="56"
    >
      <TableContainer>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            {/* Row 1: top-level groupings */}
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell rowSpan={2} sx={{ ...headerCellSx, width: '18%', textAlign: 'left' }}>
                DESIGNATION DES MATIERES ET PRODUITS
              </TableCell>
              <TableCell rowSpan={2} sx={{ ...headerCellSx, width: 60 }}>
                Unite de quantite choisie
              </TableCell>
              <TableCell colSpan={6} sx={headerCellSx}>
                Achats effectues au cours de l'exercice
              </TableCell>
              <TableCell rowSpan={2} sx={{ ...headerCellSx, borderRight: 'none' }}>
                Variation des stocks (en valeur)
              </TableCell>
            </TableRow>
            {/* Row 2: sub-groups for purchases */}
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell colSpan={2} sx={headerCellSx}>
                <Typography sx={{ fontSize: 8, fontWeight: 600 }}>Produits de l'Etat</Typography>
              </TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>
                <Typography sx={{ fontSize: 8, fontWeight: 600 }}>Produits importes achetes dans l'Etat</Typography>
              </TableCell>
              <TableCell colSpan={2} sx={headerCellSx}>
                <Typography sx={{ fontSize: 8, fontWeight: 600 }}>Produits importes achetes hors de l'Etat</Typography>
              </TableCell>
            </TableRow>
            {/* Row 3: Qty / Val sub-headers */}
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ ...headerCellSx, borderRight: 'none' }} colSpan={2}>&nbsp;</TableCell>
              {Array.from({ length: 3 }).map((_, i) => (
                <React.Fragment key={i}>
                  <TableCell sx={{ ...headerCellSx, fontSize: 8 }}>Qty</TableCell>
                  <TableCell sx={{ ...headerCellSx, fontSize: 8 }}>Val</TableCell>
                </React.Fragment>
              ))}
              <TableCell sx={{ ...headerCellSx, fontSize: 8, borderRight: 'none' }}>&nbsp;</TableCell>
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
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j} sx={{ ...dataCellSx, textAlign: 'right' }}>
                    &nbsp;
                  </TableCell>
                ))}
                <TableCell sx={{ ...dataCellSx, textAlign: 'right', borderRight: 'none' }}>
                  &nbsp;
                </TableCell>
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
              {Array.from({ length: 6 }).map((_, j) => (
                <TableCell key={j} sx={{ ...dataCellSx, fontWeight: 700, color: '#fff', bgcolor: '#1a1a1a', textAlign: 'right', borderColor: '#444' }}>
                  &nbsp;
                </TableCell>
              ))}
              <TableCell sx={{ ...dataCellSx, fontWeight: 700, color: '#fff', bgcolor: '#1a1a1a', textAlign: 'right', borderColor: '#444', borderRight: 'none' }}>
                &nbsp;
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Comment section */}
      <Box sx={{ mt: 1.5 }}>
        <Typography sx={{ fontSize: 9, fontStyle: 'italic', color: 'text.secondary' }}>
          Commentaire : Indiquer la repartition des achats par matiere ou famille de matieres.
        </Typography>
      </Box>
    </NoteTemplate>
  )
}

export default Note33
