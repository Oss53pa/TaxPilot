import React from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const Note3B: React.FC<PageProps> = ({ entreprise }) => {
  const theme = useTheme()

  // ── Style objects ──
  const cellSx = {
    fontSize: 11,
    fontWeight: 400,
    py: 0.5,
    borderColor: theme.palette.divider,
  }
  const headerSx = {
    fontWeight: 600,
    fontSize: 10,
    whiteSpace: 'nowrap' as const,
    py: 0.5,
    bgcolor: 'grey.100',
    borderColor: theme.palette.divider,
  }
  const totalSx = {
    fontWeight: 700,
    fontSize: 12,
    color: '#fff',
    bgcolor: '#1a1a1a',
    borderTop: '2px solid #333',
    borderBottom: '2px solid #333',
    borderColor: '#444',
  }

  // ── Data rows (all null placeholders) ──
  const dataRows = [
    { id: 'r1', label: 'Terrains' },
    { id: 'r2', label: 'Batiments' },
    { id: 'r3', label: 'Materiel, mobilier' },
    { id: 'r4', label: 'Materiel de transport' },
  ]

  return (
    <Box>
      <LiasseHeader entreprise={entreprise} noteLabel="NOTE 3B" pageNumber="14" />

      {/* Note title */}
      <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 1.5, borderTop: '1px solid #000', pt: 0.75 }}>
        NOTE 3B : BIENS PRIS EN LOCATION ACQUISITION
      </Typography>

      <TableContainer>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            {/* Row 1: top-level grouped headers */}
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell rowSpan={2} align="left" sx={{ ...headerSx, width: '18%' }}>
                RUBRIQUES
              </TableCell>
              <TableCell rowSpan={2} align="center" sx={{ ...headerSx, width: 60 }}>
                Nature du contrat (I;M;A) [1]
              </TableCell>
              <TableCell rowSpan={2} align="right" sx={headerSx}>
                A: MONTANT BRUT A L'OUVERTURE
              </TableCell>
              <TableCell colSpan={3} align="center" sx={headerSx}>
                B: AUGMENTATIONS
              </TableCell>
              <TableCell colSpan={2} align="center" sx={headerSx}>
                C: DIMINUTIONS
              </TableCell>
              <TableCell rowSpan={2} align="right" sx={headerSx}>
                D=A+B-C: MONTANT BRUT A LA CLOTURE
              </TableCell>
            </TableRow>
            {/* Row 2: sub-headers for B and C */}
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell align="right" sx={headerSx}>Acquisitions Apports Creations</TableCell>
              <TableCell align="right" sx={headerSx}>Virements de poste a poste</TableCell>
              <TableCell align="right" sx={headerSx}>Suite a une reevaluation</TableCell>
              <TableCell align="right" sx={headerSx}>Cessions Scissions Hors service</TableCell>
              <TableCell align="right" sx={headerSx}>Virements de poste a poste</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dataRows.map(row => (
              <TableRow
                key={row.id}
                sx={{
                  '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) },
                }}
              >
                <TableCell align="left" sx={cellSx}>{row.label}</TableCell>
                <TableCell align="center" sx={cellSx}>{null}</TableCell>
                <TableCell align="right" sx={cellSx}>{null}</TableCell>
                <TableCell align="right" sx={cellSx}>{null}</TableCell>
                <TableCell align="right" sx={cellSx}>{null}</TableCell>
                <TableCell align="right" sx={cellSx}>{null}</TableCell>
                <TableCell align="right" sx={cellSx}>{null}</TableCell>
                <TableCell align="right" sx={cellSx}>{null}</TableCell>
                <TableCell align="right" sx={cellSx}>{null}</TableCell>
              </TableRow>
            ))}

            {/* Total row */}
            <TableRow sx={{ '&:hover': { bgcolor: '#2a2a2a' } }}>
              <TableCell align="left" sx={totalSx}>
                TOTAL IMMOBILISATIONS EN LOCATION-ACQUISITION
              </TableCell>
              <TableCell align="center" sx={totalSx}>{null}</TableCell>
              <TableCell align="right" sx={totalSx}>{null}</TableCell>
              <TableCell align="right" sx={totalSx}>{null}</TableCell>
              <TableCell align="right" sx={totalSx}>{null}</TableCell>
              <TableCell align="right" sx={totalSx}>{null}</TableCell>
              <TableCell align="right" sx={totalSx}>{null}</TableCell>
              <TableCell align="right" sx={totalSx}>{null}</TableCell>
              <TableCell align="right" sx={totalSx}>{null}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footnote */}
      <Typography sx={{ fontSize: 10, mt: 1, color: 'text.secondary' }}>
        [1] I : Credit-bail immobilier ; M : Credit-bail mobilier ; A : Autres contrats
      </Typography>

      {/* Comment section */}
      <Box sx={{
        mt: 2,
        p: 2,
        bgcolor: alpha(theme.palette.action.hover, 0.3),
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Commentaire
        </Typography>
        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
          Indiquer la nature du bien, le nom du bailleur et la duree du bail.
        </Typography>
      </Box>
    </Box>
  )
}

export default Note3B
