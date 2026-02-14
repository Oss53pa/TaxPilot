/**
 * Fiche R2 - Dirigeants et Commissaires aux comptes SYSCOHADA
 * Toutes les données sont auto-remplies depuis props.entreprise (injecté par withBackendData)
 * Modifiez dans Paramétrage > Entreprise > onglet "Dirigeants & CAC"
 */

import React from 'react'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
  Alert,
} from '@mui/material'
import {
  Business as BusinessIcon,
  AccountBox as PersonIcon,
  Gavel as AuditIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import type { Entreprise, DirigeantEntry, CommissaireEntry } from '@/types'

interface FicheR2SYSCOHADAProps {
  entreprise?: Entreprise
}

const FicheR2SYSCOHADA: React.FC<FicheR2SYSCOHADAProps> = ({ entreprise }) => {
  const theme = useTheme()
  const ent = entreprise

  const dirigeants: DirigeantEntry[] = ent?.dirigeants || []
  const commissaires: CommissaireEntry[] = ent?.commissaires_comptes || []

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  /** Formate une date ISO (YYYY-MM-DD) en DD/MM/YYYY */
  const formatDateFR = (isoDate?: string): string => {
    if (!isoDate) return '-'
    const parts = isoDate.split('-')
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`
    return isoDate
  }

  // Calculs totaux
  const totalRemunerationsDirigeants = dirigeants.reduce((sum, d) => sum + (d.remunerations || 0), 0)
  const totalHonorairesCommissaires = commissaires.reduce((sum, c) => sum + (c.honoraires || 0) + (c.autres_prestations || 0), 0)

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <BusinessIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              FICHE R2 - DIRIGEANTS ET COMMISSAIRES AUX COMPTES (en FCFA)
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Imprimer">
              <IconButton size="small">
                <PrintIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Exporter">
              <IconButton size="small">
                <ExportIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 2 }}>
          Toutes les données sont automatiquement issues du paramétrage.
          Modifiez-les dans <strong>Paramétrage &gt; Entreprise &gt; onglet "Dirigeants & CAC"</strong>.
        </Alert>

        {/* Indicateurs */}
        <Stack direction="row" spacing={2}>
          <Chip
            icon={<PersonIcon />}
            label={`${dirigeants.length} Dirigeant(s)`}
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<AuditIcon />}
            label={`${commissaires.length} Commissaire(s)`}
            color="secondary"
            variant="outlined"
          />
          <Chip
            label={`Rémunérations: ${formatNumber(totalRemunerationsDirigeants)}`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`Honoraires: ${formatNumber(totalHonorairesCommissaires)}`}
            color="warning"
            variant="outlined"
          />
        </Stack>
      </Box>

      {/* Section Dirigeants */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              DIRIGEANTS SOCIAUX
            </Typography>
            <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />
          </Stack>

          {dirigeants.length === 0 ? (
            <Alert severity="warning">
              Aucun dirigeant enregistré. Ajoutez-les dans <strong>Paramétrage &gt; Entreprise &gt; onglet "Dirigeants & CAC"</strong>.
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Qualité</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Nom et Prénoms</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Adresse</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mandat</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Rémunérations</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Avantages / Obs.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dirigeants.map((d) => (
                    <TableRow key={d.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: alpha(theme.palette.action.hover, 0.3) } }}>
                      <TableCell>{d.qualite || '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{d.nom || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.prenoms}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{d.adresse || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{d.telephone || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDateFR(d.date_nomination)}</Typography>
                        <Typography variant="caption" color="text.secondary">{d.duree_mandat ? `${d.duree_mandat} ans` : '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatNumber(d.remunerations || 0)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{d.avantages_nature || '-'}</Typography>
                        {d.observations && (
                          <Typography variant="caption" color="text.secondary">{d.observations}</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Ligne totaux */}
                  <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell colSpan={5} sx={{ fontWeight: 600, textAlign: 'right' }}>
                      TOTAL RÉMUNÉRATIONS
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>
                      {formatNumber(totalRemunerationsDirigeants)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Section Commissaires aux comptes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.secondary.main }}>
              <AuditIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              COMMISSAIRES AUX COMPTES
            </Typography>
            <Chip label="Auto" size="small" icon={<LockIcon />} color="default" />
          </Stack>

          {commissaires.length === 0 ? (
            <Alert severity="warning">
              Aucun commissaire aux comptes enregistré. Ajoutez-les dans <strong>Paramétrage &gt; Entreprise &gt; onglet "Dirigeants & CAC"</strong>.
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Nom et Prénoms</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cabinet / Adresse</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>N° Ordre</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mandat</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Honoraires</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Autres</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {commissaires.map((c) => (
                    <TableRow key={c.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: alpha(theme.palette.action.hover, 0.3) } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{c.nom || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.prenoms}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{c.cabinet || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.adresse}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{c.telephone || '-'}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                      </TableCell>
                      <TableCell>{c.numero_ordre || '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDateFR(c.date_nomination)}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.duree_mandat ? `${c.duree_mandat} ans` : '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatNumber(c.honoraires || 0)}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Typography variant="body2">{formatNumber(c.autres_prestations || 0)}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Ligne totaux */}
                  <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.08) }}>
                    <TableCell colSpan={5} sx={{ fontWeight: 600, textAlign: 'right' }}>
                      TOTAL HONORAIRES
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>
                      {formatNumber(commissaires.reduce((sum, c) => sum + (c.honoraires || 0), 0))}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>
                      {formatNumber(commissaires.reduce((sum, c) => sum + (c.autres_prestations || 0), 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Résumé financier */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          RÉSUMÉ FINANCIER
        </Typography>
        <Typography variant="body2">
          Total rémunérations dirigeants : <strong>{formatNumber(totalRemunerationsDirigeants)}</strong>
        </Typography>
        <Typography variant="body2">
          Total honoraires commissaires : <strong>{formatNumber(totalHonorairesCommissaires)}</strong>
        </Typography>
        <Typography variant="body2">
          Coût total gouvernance : <strong>{formatNumber(totalRemunerationsDirigeants + totalHonorairesCommissaires)}</strong>
        </Typography>
      </Alert>
    </Paper>
  )
}

export default FicheR2SYSCOHADA
