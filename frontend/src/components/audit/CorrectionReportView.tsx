/**
 * Vue du rapport de corrections avant/apres
 */

import React from 'react'
import {
  Box,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  Remove as FlatIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material'
import type { RapportCorrection } from '@/types/audit.types'

interface CorrectionReportViewProps {
  rapport: RapportCorrection
}

const evolutionIcon = (evolution: string) => {
  switch (evolution) {
    case 'CORRIGE': return <CheckIcon sx={{ color: '#16a34a' }} fontSize="small" />
    case 'AMELIORE': return <UpIcon sx={{ color: '#0ea5e9' }} fontSize="small" />
    case 'INCHANGE': return <FlatIcon sx={{ color: '#737373' }} fontSize="small" />
    case 'DEGRADE': return <DownIcon sx={{ color: '#dc2626' }} fontSize="small" />
    default: return null
  }
}

const evolutionColor = (evolution: string) => {
  switch (evolution) {
    case 'CORRIGE': return '#16a34a'
    case 'AMELIORE': return '#0ea5e9'
    case 'INCHANGE': return '#737373'
    case 'DEGRADE': return '#dc2626'
    default: return '#737373'
  }
}

const CorrectionReportView: React.FC<CorrectionReportViewProps> = ({ rapport }) => {
  const { synthese, corrections, comptesModifies } = rapport

  const corriges = corrections.filter((c) => c.evolution === 'CORRIGE').length
  const ameliores = corrections.filter((c) => c.evolution === 'AMELIORE').length
  const degrades = corrections.filter((c) => c.evolution === 'DEGRADE').length

  return (
    <Box>
      {/* En-tete */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Rapport genere le {new Date(rapport.dateGeneration).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </Typography>
      </Box>

      {/* Resume synthese */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fef2f2' }}>
            <Typography variant="h5" fontWeight={700} color="#dc2626">
              {synthese.bloquantsAvant}
            </Typography>
            <Typography variant="caption">Bloquants avant</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: synthese.bloquantsApres === 0 ? '#f0fdf4' : '#fef2f2' }}>
            <Typography variant="h5" fontWeight={700} color={synthese.bloquantsApres === 0 ? '#16a34a' : '#dc2626'}>
              {synthese.bloquantsApres}
            </Typography>
            <Typography variant="caption">Bloquants apres</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fffbeb' }}>
            <Typography variant="h5" fontWeight={700} color="#d97706">
              {synthese.majeursAvant}
            </Typography>
            <Typography variant="caption">Majeurs avant</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: synthese.majeursApres < synthese.majeursAvant ? '#f0fdf4' : '#fffbeb' }}>
            <Typography variant="h5" fontWeight={700} color={synthese.majeursApres < synthese.majeursAvant ? '#16a34a' : '#d97706'}>
              {synthese.majeursApres}
            </Typography>
            <Typography variant="caption">Majeurs apres</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#eff6ff' }}>
            <Typography variant="h5" fontWeight={700} color="#2563eb">
              {synthese.scoreAvant}%
            </Typography>
            <Typography variant="caption">Score avant</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={2}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: synthese.scoreApres > synthese.scoreAvant ? '#f0fdf4' : '#eff6ff' }}>
            <Typography variant="h5" fontWeight={700} color={synthese.scoreApres > synthese.scoreAvant ? '#16a34a' : '#2563eb'}>
              {synthese.scoreApres}%
            </Typography>
            <Typography variant="caption">Score apres</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Resume */}
      {corriges > 0 && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {corriges} anomalie(s) corrigee(s), {ameliores} amelioree(s)
          {degrades > 0 && `, ${degrades} degradee(s)`}
        </Alert>
      )}

      {/* Tableau detail corrections */}
      {corrections.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Detail des corrections
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Ref</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut avant</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}></TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Statut apres</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Evolution</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {corrections.map((c) => (
                  <TableRow key={c.ref}>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.ref}</TableCell>
                    <TableCell>{c.nom}</TableCell>
                    <TableCell>
                      <Chip label={c.severiteAvant} size="small" sx={{ bgcolor: '#f5f5f5', fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell><ArrowIcon fontSize="small" color="action" /></TableCell>
                    <TableCell>
                      <Chip label={c.severiteApres} size="small" sx={{ bgcolor: '#f5f5f5', fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {evolutionIcon(c.evolution)}
                        <Typography variant="caption" sx={{ color: evolutionColor(c.evolution), fontWeight: 600 }}>
                          {c.evolution}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Tableau comptes modifies */}
      {comptesModifies.length > 0 && (
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Comptes modifies
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Compte</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Libelle</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Solde avant</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Solde apres</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Ecart</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comptesModifies.map((c) => (
                  <TableRow key={c.compte}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{c.compte}</TableCell>
                    <TableCell>{c.libelle}</TableCell>
                    <TableCell align="right">{c.soldeAvant.toLocaleString('fr-FR')}</TableCell>
                    <TableCell align="right">{c.soldeApres.toLocaleString('fr-FR')}</TableCell>
                    <TableCell align="right" sx={{ color: c.ecart > 0 ? '#16a34a' : c.ecart < 0 ? '#dc2626' : 'text.secondary', fontWeight: 600 }}>
                      {c.ecart > 0 ? '+' : ''}{c.ecart.toLocaleString('fr-FR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {corrections.length === 0 && comptesModifies.length === 0 && (
        <Alert severity="info">
          Aucune correction detectee entre les deux sessions.
        </Alert>
      )}
    </Box>
  )
}

export default CorrectionReportView
