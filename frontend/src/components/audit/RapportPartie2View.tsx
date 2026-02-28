/**
 * Vue du Rapport Partie 2 (comparaison V1 vs V2)
 * Affiche les anomalies corrigees, non corrigees et nouvelles
 */

import React from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  AlertTitle,
  Stack,
  Card,
  CardContent,
  alpha,
  useTheme,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  NewReleases as NewIcon,
} from '@mui/icons-material'
import type { RapportPartie2, Severite } from '@/types/audit.types'

interface RapportPartie2ViewProps {
  rapport: RapportPartie2
}

const SEVERITE_COLOR: Record<Severite, 'error' | 'warning' | 'info' | 'success'> = {
  BLOQUANT: 'error',
  MAJEUR: 'warning',
  MINEUR: 'warning',
  INFO: 'info',
  OK: 'success',
}

const EVOLUTION_CONFIG = {
  corrige: { label: 'Corrige', color: 'success' as const, icon: <CheckIcon fontSize="small" /> },
  non_corrige: { label: 'Non corrige', color: 'error' as const, icon: <CancelIcon fontSize="small" /> },
  nouveau: { label: 'Nouveau', color: 'warning' as const, icon: <NewIcon fontSize="small" /> },
}

const RapportPartie2View: React.FC<RapportPartie2ViewProps> = ({ rapport }) => {
  const theme = useTheme()
  const { synthese, items, comptesModifies } = rapport

  return (
    <Box>
      {/* Resume */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card elevation={0} sx={{ flex: 1, border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`, bgcolor: alpha(theme.palette.success.main, 0.04) }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="success.main">
              {synthese.corriges}
            </Typography>
            <Typography variant="body2" color="text.secondary">Corriges</Typography>
          </CardContent>
        </Card>
        <Card elevation={0} sx={{ flex: 1, border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`, bgcolor: alpha(theme.palette.error.main, 0.04) }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="error.main">
              {synthese.nonCorriges}
            </Typography>
            <Typography variant="body2" color="text.secondary">Non corriges</Typography>
          </CardContent>
        </Card>
        <Card elevation={0} sx={{ flex: 1, border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`, bgcolor: alpha(theme.palette.warning.main, 0.04) }}>
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} color="warning.main">
              {synthese.nouveaux}
            </Typography>
            <Typography variant="body2" color="text.secondary">Nouveaux</Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Message conformite */}
      {synthese.conforme ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>CONFORME</AlertTitle>
          0 anomalie bloquante restante — la balance peut etre deployee en liasse.
        </Alert>
      ) : (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>NON CONFORME</AlertTitle>
          {synthese.bloquantsRestants} anomalie(s) bloquante(s) restante(s) — corrections supplementaires necessaires.
        </Alert>
      )}

      {/* Tableau V1 vs V2 */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Detail des anomalies V1 / V2
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}`, mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <TableCell sx={{ fontWeight: 600, width: 80 }}>Ref</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 100, textAlign: 'center' }}>Severite V1</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 100, textAlign: 'center' }}>Severite V2</TableCell>
              <TableCell sx={{ fontWeight: 600, width: 130, textAlign: 'center' }}>Evolution</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => {
              const evoConfig = EVOLUTION_CONFIG[item.evolution]
              return (
                <TableRow key={item.ref} hover sx={
                  item.evolution === 'corrige'
                    ? { bgcolor: alpha(theme.palette.success.main, 0.03) }
                    : item.evolution === 'nouveau'
                      ? { bgcolor: alpha(theme.palette.warning.main, 0.03) }
                      : undefined
                }>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {item.ref}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.nom}</Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip label={item.severiteV1} size="small" color={SEVERITE_COLOR[item.severiteV1]} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip label={item.severiteV2} size="small" color={SEVERITE_COLOR[item.severiteV2]} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22 }} />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Chip
                      icon={evoConfig.icon}
                      label={evoConfig.label}
                      size="small"
                      color={evoConfig.color}
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">Aucune anomalie a comparer</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Comptes modifies */}
      {comptesModifies.length > 0 && (
        <>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Comptes modifies ({comptesModifies.length})
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.08)}` }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <TableCell sx={{ fontWeight: 600, width: 100 }}>Compte</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Libelle</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Solde V1</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Solde V2</TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Ecart</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comptesModifies.map((c) => (
                  <TableRow key={c.compte} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {c.compte}
                      </Typography>
                    </TableCell>
                    <TableCell>{c.libelle}</TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {c.soldeAvant.toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', fontFamily: 'monospace' }}>
                      {c.soldeApres.toLocaleString('fr-FR')}
                    </TableCell>
                    <TableCell sx={{
                      textAlign: 'right', fontFamily: 'monospace', fontWeight: 600,
                      color: c.ecart > 0 ? theme.palette.success.main : theme.palette.error.main,
                    }}>
                      {c.ecart > 0 ? '+' : ''}{c.ecart.toLocaleString('fr-FR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  )
}

export default RapportPartie2View
