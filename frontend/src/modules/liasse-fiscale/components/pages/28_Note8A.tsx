import React from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const EXERCICE_YEARS = ['2018', '2019', '2020', '2021', '2022']
const ACCOUNT_PREFIXES = ['60...', '61...', '62...', '63...', '....']

const Note8A: React.FC<PageProps> = ({ entreprise }) => {
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
  const sectionSx = {
    fontWeight: 700,
    fontSize: 12,
    color: theme.palette.primary.dark,
    py: 1,
    bgcolor: alpha(theme.palette.primary.main, 0.1),
  }
  const subtotalSx = {
    fontWeight: 600,
    fontSize: 11.5,
    bgcolor: alpha(theme.palette.grey[900], 0.08),
    borderTop: '1px solid #bbb',
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

  return (
    <Box>
      <LiasseHeader entreprise={entreprise} noteLabel="NOTE 8A" pageNumber="24" />

      {/* Note title */}
      <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 1.5, borderTop: '1px solid #000', pt: 0.75 }}>
        NOTE 8A : TABLEAU D'ETALEMENT DES CHARGES IMMOBILISEES
      </Typography>

      <TableContainer>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            {/* Row 1: three main column groups */}
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell rowSpan={2} sx={{ ...headerSx, width: '22%' }} />
              <TableCell colSpan={2} align="center" sx={headerSx}>
                Frais d'etablissement
              </TableCell>
              <TableCell colSpan={2} align="center" sx={headerSx}>
                Charges a repartir
              </TableCell>
              <TableCell colSpan={2} align="center" sx={headerSx}>
                Primes de remboursement
              </TableCell>
            </TableRow>
            {/* Row 2: sub-headers Comptes | Montants for each group */}
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell align="center" sx={headerSx}>Comptes</TableCell>
              <TableCell align="right" sx={headerSx}>Montants</TableCell>
              <TableCell align="center" sx={headerSx}>Comptes</TableCell>
              <TableCell align="right" sx={headerSx}>Montants</TableCell>
              <TableCell align="center" sx={headerSx}>Comptes</TableCell>
              <TableCell align="right" sx={headerSx}>Montants</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Compte transitoire a solder */}
            <TableRow sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) } }}>
              <TableCell sx={cellSx}>Compte transitoire a solder : 4751</TableCell>
              <TableCell align="center" sx={cellSx}>{null}</TableCell>
              <TableCell align="right" sx={cellSx}>{null}</TableCell>
              <TableCell align="center" sx={cellSx}>{null}</TableCell>
              <TableCell align="right" sx={cellSx}>{null}</TableCell>
              <TableCell align="center" sx={cellSx}>{null}</TableCell>
              <TableCell align="right" sx={cellSx}>{null}</TableCell>
            </TableRow>

            {/* Montant global a etaler */}
            <TableRow sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) } }}>
              <TableCell sx={cellSx}>Montant global a etaler au 1er janvier 2018</TableCell>
              <TableCell align="center" sx={cellSx}>{null}</TableCell>
              <TableCell align="right" sx={cellSx}>{null}</TableCell>
              <TableCell align="center" sx={cellSx}>{null}</TableCell>
              <TableCell align="right" sx={cellSx}>{null}</TableCell>
              <TableCell align="center" sx={cellSx}>{null}</TableCell>
              <TableCell align="right" sx={cellSx}>{null}</TableCell>
            </TableRow>

            {/* Duree d'etalement retenue */}
            <TableRow sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) } }}>
              <TableCell sx={cellSx}>Duree d'etalement retenue</TableCell>
              <TableCell align="center" sx={cellSx}>{null}</TableCell>
              <TableCell align="right" sx={cellSx}>{null}</TableCell>
              <TableCell align="center" sx={cellSx}>{null}</TableCell>
              <TableCell align="right" sx={cellSx}>{null}</TableCell>
              <TableCell align="center" sx={cellSx}>{null}</TableCell>
              <TableCell align="right" sx={cellSx}>{null}</TableCell>
            </TableRow>

            {/* Exercice year sections */}
            {EXERCICE_YEARS.map(year => (
              <React.Fragment key={year}>
                {/* Section header for the year */}
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={sectionSx}>
                    Exercice {year}
                  </TableCell>
                </TableRow>

                {/* Account detail rows */}
                {ACCOUNT_PREFIXES.map((prefix, idx) => (
                  <TableRow
                    key={`${year}-${idx}`}
                    sx={{ '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) } }}
                  >
                    <TableCell sx={{ ...cellSx, pl: 3 }}>{prefix}</TableCell>
                    <TableCell align="center" sx={cellSx}>{null}</TableCell>
                    <TableCell align="right" sx={cellSx}>{null}</TableCell>
                    <TableCell align="center" sx={cellSx}>{null}</TableCell>
                    <TableCell align="right" sx={cellSx}>{null}</TableCell>
                    <TableCell align="center" sx={cellSx}>{null}</TableCell>
                    <TableCell align="right" sx={cellSx}>{null}</TableCell>
                  </TableRow>
                ))}

                {/* Subtotal for the year */}
                <TableRow sx={{ '&:hover': { bgcolor: alpha(theme.palette.grey[900], 0.12) } }}>
                  <TableCell sx={subtotalSx}>Total exercice {year}</TableCell>
                  <TableCell align="center" sx={subtotalSx}>{null}</TableCell>
                  <TableCell align="right" sx={subtotalSx}>{null}</TableCell>
                  <TableCell align="center" sx={subtotalSx}>{null}</TableCell>
                  <TableCell align="right" sx={subtotalSx}>{null}</TableCell>
                  <TableCell align="center" sx={subtotalSx}>{null}</TableCell>
                  <TableCell align="right" sx={subtotalSx}>{null}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}

            {/* TOTAL GENERAL */}
            <TableRow sx={{ '&:hover': { bgcolor: '#2a2a2a' } }}>
              <TableCell sx={totalSx}>TOTAL GENERAL</TableCell>
              <TableCell align="center" sx={totalSx}>{null}</TableCell>
              <TableCell align="right" sx={totalSx}>{null}</TableCell>
              <TableCell align="center" sx={totalSx}>{null}</TableCell>
              <TableCell align="right" sx={totalSx}>{null}</TableCell>
              <TableCell align="center" sx={totalSx}>{null}</TableCell>
              <TableCell align="right" sx={totalSx}>{null}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

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
          Indiquer pour chaque categorie de charges immobilisees : la nature, le montant initial,
          la duree d'etalement retenue, la quote-part etalee au cours de l'exercice et le solde
          restant a etaler. En cas de changement de methode, indiquer l'incidence sur les resultats.
        </Typography>
      </Box>
    </Box>
  )
}

export default Note8A
