/**
 * Fiche R3 - Participations et Filiales SYSCOHADA
 * Toutes les données sont auto-remplies depuis props.entreprise (injecté par withBackendData)
 * Modifiez dans Paramétrage > Entreprise > onglet "Participations"
 */

import React, { useState } from 'react'
import {
  Box,
  Paper,
  Grid,
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
  Tabs,
  Tab,
} from '@mui/material'
import {
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  ShowChart as ChartIcon,
  Lock as LockIcon,
} from '@mui/icons-material'
import type { Entreprise, ParticipationEntry } from '@/types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`participation-tabpanel-${index}`}
      aria-labelledby={`participation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}

interface FicheR3SYSCOHADAProps {
  entreprise?: Entreprise
}

const FicheR3SYSCOHADA: React.FC<FicheR3SYSCOHADAProps> = ({ entreprise }) => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const ent = entreprise

  const participations: ParticipationEntry[] = ent?.participations_filiales || []

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

  // Classification
  const filiales = participations.filter(p => p.pourcentage_participation > 50)
  const participationsMinoritaires = participations.filter(p => p.pourcentage_participation >= 10 && p.pourcentage_participation <= 50)

  // Calculs et statistiques
  const totalValeurComptable = participations.reduce((sum, p) => sum + (p.valeur_comptable || 0), 0)
  const totalValeurMarche = participations.reduce((sum, p) => sum + (p.valeur_marche || 0), 0)
  const totalDividendes = participations.reduce((sum, p) => sum + (p.dividendes_recus || 0), 0)
  const plusValueLatente = totalValeurMarche - totalValeurComptable

  const getParticipationType = (p: ParticipationEntry) => {
    if (p.pourcentage_participation > 50) return 'Filiale'
    if (p.pourcentage_participation >= 10) return 'Participation'
    return 'Portefeuille'
  }

  const getParticipationColor = (p: ParticipationEntry): 'success' | 'primary' | 'default' => {
    if (p.pourcentage_participation > 50) return 'success'
    if (p.pourcentage_participation >= 10) return 'primary'
    return 'default'
  }

  const renderParticipationTable = (participationsList: ParticipationEntry[]) => (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 600 }}>Société</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Forme / Secteur</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
            <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Participation</TableCell>
            <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Valorisation</TableCell>
            <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Dividendes</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Acquisition</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {participationsList.map((p) => (
            <TableRow key={p.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: alpha(theme.palette.action.hover, 0.3) } }}>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.raison_sociale || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">RCCM: {p.numero_rccm || '-'}</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={getParticipationType(p)}
                    color={getParticipationColor(p)}
                    size="small"
                  />
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{p.forme_juridique || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">{p.secteur_activite || '-'}</Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>Capital: {formatNumber(p.capital || 0)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{p.adresse || '-'}</Typography>
                <Typography variant="caption" color="text.secondary">{p.telephone || '-'}</Typography>
                <Typography variant="caption" display="block" color="text.secondary">{p.email || ''}</Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.pourcentage_participation || 0}%</Typography>
                <Typography variant="caption" color="text.secondary">{formatNumber(p.nombre_titres || 0)} titres</Typography>
                <Typography variant="caption" display="block" color="text.secondary">VN: {formatNumber(p.valeur_nominale || 0)}</Typography>
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Typography variant="body2">Comptable: {formatNumber(p.valeur_comptable || 0)}</Typography>
                <Typography variant="body2">Marché: {formatNumber(p.valeur_marche || 0)}</Typography>
                {(p.valeur_marche || 0) !== (p.valeur_comptable || 0) && (
                  <Chip
                    label={`${(p.valeur_marche || 0) > (p.valeur_comptable || 0) ? '+' : ''}${formatNumber((p.valeur_marche || 0) - (p.valeur_comptable || 0))}`}
                    color={(p.valeur_marche || 0) > (p.valeur_comptable || 0) ? 'success' : 'error'}
                    size="small"
                    icon={(p.valeur_marche || 0) > (p.valeur_comptable || 0) ? <UpIcon /> : <DownIcon />}
                    sx={{ mt: 0.5 }}
                  />
                )}
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatNumber(p.dividendes_recus || 0)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{formatDateFR(p.date_acquisition)}</Typography>
                <Typography variant="caption" color="text.secondary">{p.mode_acquisition || '-'}</Typography>
                {p.observations && (
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>{p.observations}</Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
          {/* Ligne totaux */}
          {participationsList.length > 0 && (
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
              <TableCell colSpan={4} sx={{ fontWeight: 600, textAlign: 'right' }}>
                TOTAUX
              </TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>
                <Typography variant="body2">Comptable: {formatNumber(participationsList.reduce((s, p) => s + (p.valeur_comptable || 0), 0))}</Typography>
                <Typography variant="body2">Marché: {formatNumber(participationsList.reduce((s, p) => s + (p.valeur_marche || 0), 0))}</Typography>
              </TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>
                {formatNumber(participationsList.reduce((s, p) => s + (p.dividendes_recus || 0), 0))}
              </TableCell>
              <TableCell />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )

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
            <ChartIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              FICHE R3 - PARTICIPATIONS ET FILIALES (en FCFA)
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
          Modifiez-les dans <strong>Paramétrage &gt; Entreprise &gt; onglet "Participations"</strong>.
        </Alert>

        {/* Indicateurs de synthèse */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                  {filiales.length}
                </Typography>
                <Typography variant="body2">Filiales (&gt;50%)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {participationsMinoritaires.length}
                </Typography>
                <Typography variant="body2">Participations</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#f5f5f5' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                  {formatNumber(totalValeurComptable)}
                </Typography>
                <Typography variant="body2">Valeur comptable</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', backgroundColor: '#f5f5f5' }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {formatNumber(totalDividendes)}
                </Typography>
                <Typography variant="body2">Dividendes reçus</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Alertes financières */}
        {plusValueLatente !== 0 && (
          <Alert
            severity={plusValueLatente > 0 ? 'success' : 'warning'}
            sx={{ mb: 2 }}
            icon={plusValueLatente > 0 ? <UpIcon /> : <DownIcon />}
          >
            <Typography variant="subtitle2">
              {plusValueLatente > 0 ? 'Plus-value latente' : 'Moins-value latente'} de {formatNumber(Math.abs(plusValueLatente))}
            </Typography>
            <Typography variant="body2">
              Écart entre valeur de marché ({formatNumber(totalValeurMarche)}) et valeur comptable ({formatNumber(totalValeurComptable)})
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Onglets */}
      <Box sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label={`Toutes les participations (${participations.length})`} />
          <Tab label={`Filiales (${filiales.length})`} />
          <Tab label={`Participations minoritaires (${participationsMinoritaires.length})`} />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      <TabPanel value={tabValue} index={0}>
        {participations.length > 0 ? (
          renderParticipationTable(participations)
        ) : (
          <Alert severity="warning">
            Aucune participation enregistrée. Ajoutez-les dans <strong>Paramétrage &gt; Entreprise &gt; onglet "Participations"</strong>.
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {filiales.length > 0 ? (
          renderParticipationTable(filiales)
        ) : (
          <Alert severity="info">
            Aucune filiale (participation supérieure à 50%) enregistrée.
          </Alert>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {participationsMinoritaires.length > 0 ? (
          renderParticipationTable(participationsMinoritaires)
        ) : (
          <Alert severity="info">
            Aucune participation minoritaire (entre 10% et 50%) enregistrée.
          </Alert>
        )}
      </TabPanel>
    </Paper>
  )
}

export default FicheR3SYSCOHADA
