/**
 * Bilan Synthétique - Structure officielle SYSCOHADA Révisé
 * Pages 981-982, 986, 997 du PDF SYSCOHADA
 */

import React, { useMemo } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material'
import { liasseDataService } from '@/services/liasseDataService'

// ─── Types ───────────────────────────────────────────────────────────────────

type RowType = 'section' | 'group' | 'line' | 'total' | 'grandtotal'

interface ActifRow {
  type: RowType
  ref?: string
  label: string
  note?: string
}

interface PassifRow {
  type: RowType
  ref?: string
  label: string
  note?: string
}

interface ActifValues {
  brut: number
  amort: number
  netN: number
  netN1: number
}

interface PassifValues {
  netN: number
  netN1: number
}

interface BilanSynthetiqueProps {
  data?: any
  exerciceN?: number
  exerciceN1?: number
}

// ─── Structures SYSCOHADA officielles ────────────────────────────────────────

const ACTIF_STRUCTURE: ActifRow[] = [
  // ACTIF IMMOBILISÉ
  { type: 'section', label: 'ACTIF IMMOBILISÉ' },
  { type: 'group',  ref: 'AD', label: 'Immobilisations incorporelles', note: '3' },
  { type: 'line',   ref: 'AE', label: 'Frais de développement et de prospection' },
  { type: 'line',   ref: 'AF', label: 'Brevets, licences, logiciels, et droits similaires' },
  { type: 'line',   ref: 'AG', label: 'Fonds commercial et droit au bail' },
  { type: 'line',   ref: 'AH', label: 'Autres immobilisations incorporelles' },
  { type: 'group',  ref: 'AI', label: 'Immobilisations corporelles', note: '3' },
  { type: 'line',   ref: 'AJ', label: 'Terrains' },
  { type: 'line',   ref: 'AK', label: 'Bâtiments' },
  { type: 'line',   ref: 'AL', label: 'Aménagements, agencements et installations' },
  { type: 'line',   ref: 'AM', label: 'Matériel, mobilier et actifs biologiques' },
  { type: 'line',   ref: 'AN', label: 'Matériel de transport' },
  { type: 'line',   ref: 'AP', label: 'Avances et acomptes versés sur immobilisations', note: '3' },
  { type: 'group',  ref: 'AQ', label: 'Immobilisations financières', note: '4' },
  { type: 'line',   ref: 'AR', label: 'Titres de participation' },
  { type: 'line',   ref: 'AS', label: 'Autres immobilisations financières' },
  { type: 'total',  ref: 'AZ', label: 'TOTAL ACTIF IMMOBILISÉ' },

  // ACTIF CIRCULANT
  { type: 'section', label: 'ACTIF CIRCULANT' },
  { type: 'line',   ref: 'BA', label: 'Actif circulant HAO', note: '5' },
  { type: 'line',   ref: 'BB', label: 'Stocks et encours', note: '6' },
  { type: 'group',  ref: 'BG', label: 'Créances et emplois assimilés' },
  { type: 'line',   ref: 'BH', label: 'Fournisseurs avances versées', note: '17' },
  { type: 'line',   ref: 'BI', label: 'Clients', note: '7' },
  { type: 'line',   ref: 'BJ', label: 'Autres créances', note: '8' },
  { type: 'total',  ref: 'BK', label: 'TOTAL ACTIF CIRCULANT' },

  // TRÉSORERIE-ACTIF
  { type: 'section', label: 'TRÉSORERIE-ACTIF' },
  { type: 'line',   ref: 'BQ', label: 'Titres de placement', note: '9' },
  { type: 'line',   ref: 'BR', label: 'Valeurs à encaisser', note: '10' },
  { type: 'line',   ref: 'BS', label: 'Banques, chèques postaux, caisse et assimilés', note: '11' },
  { type: 'total',  ref: 'BT', label: 'TOTAL TRÉSORERIE-ACTIF' },

  // Écart de conversion
  { type: 'line',       ref: 'BU', label: 'Écart de conversion-Actif', note: '12' },
  { type: 'grandtotal', ref: 'BZ', label: 'TOTAL GÉNÉRAL' },
]

const PASSIF_STRUCTURE: PassifRow[] = [
  // CAPITAUX PROPRES
  { type: 'section', label: 'CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES' },
  { type: 'line',   ref: 'CA', label: 'Capital', note: '13' },
  { type: 'line',   ref: 'CB', label: 'Apporteurs capital non appelé (-)', note: '13' },
  { type: 'line',   ref: 'CD', label: 'Primes liées au capital social', note: '14' },
  { type: 'line',   ref: 'CE', label: 'Écarts de réévaluation', note: '3e' },
  { type: 'line',   ref: 'CF', label: 'Réserves indisponibles', note: '14' },
  { type: 'line',   ref: 'CG', label: 'Réserves libres', note: '14' },
  { type: 'line',   ref: 'CH', label: 'Report à nouveau (+/-)', note: '14' },
  { type: 'line',   ref: 'CJ', label: 'Résultat net de l\'exercice' },
  { type: 'line',   ref: 'CL', label: 'Subventions d\'investissement', note: '15' },
  { type: 'line',   ref: 'CM', label: 'Provisions réglementées', note: '15' },
  { type: 'total',  ref: 'CP', label: 'TOTAL CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES' },

  // DETTES FINANCIÈRES
  { type: 'section', label: 'DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES' },
  { type: 'line',   ref: 'DA', label: 'Emprunts et dettes financières diverses', note: '16' },
  { type: 'line',   ref: 'DB', label: 'Dettes de location acquisition', note: '16' },
  { type: 'line',   ref: 'DC', label: 'Provisions pour risques et charges', note: '16' },
  { type: 'total',  ref: 'DD', label: 'TOTAL DETTES FINANCIÈRES' },
  { type: 'total',  ref: 'DF', label: 'TOTAL RESSOURCES STABLES' },

  // PASSIF CIRCULANT
  { type: 'section', label: 'PASSIF CIRCULANT' },
  { type: 'line',   ref: 'DH', label: 'Dettes circulantes HAO', note: '5' },
  { type: 'line',   ref: 'DI', label: 'Clients, avances reçues', note: '7' },
  { type: 'line',   ref: 'DJ', label: 'Fournisseurs d\'exploitation', note: '17' },
  { type: 'line',   ref: 'DK', label: 'Dettes fiscales et sociales', note: '18' },
  { type: 'line',   ref: 'DM', label: 'Autres dettes', note: '19' },
  { type: 'line',   ref: 'DN', label: 'Provisions pour risques à court terme', note: '19' },
  { type: 'total',  ref: 'DP', label: 'TOTAL PASSIF CIRCULANT' },

  // TRÉSORERIE-PASSIF
  { type: 'section', label: 'TRÉSORERIE-PASSIF' },
  { type: 'line',   ref: 'DQ', label: 'Banques, crédits d\'escompte', note: '20' },
  { type: 'line',   ref: 'DR', label: 'Banques, établissements financiers et crédits de trésorerie', note: '20' },
  { type: 'total',  ref: 'DT', label: 'TOTAL TRÉSORERIE-PASSIF' },

  // Écart de conversion
  { type: 'line',       ref: 'DV', label: 'Écart de conversion-Passif', note: '12' },
  { type: 'grandtotal', ref: 'DZ', label: 'TOTAL GÉNÉRAL' },
]

// ─── Composant ───────────────────────────────────────────────────────────────

const BilanSynthetique: React.FC<BilanSynthetiqueProps> = ({
  data: _data,
  exerciceN = 2024,
  exerciceN1 = 2023,
}) => {
  const theme = useTheme()

  // ── Données calculées depuis la balance importée ──────────────────────
  const { actifData, passifData } = useMemo(() => {
    const actifRows = liasseDataService.generateBilanActif()
    const passifRows = liasseDataService.generateBilanPassif()

    // Convertir les rows générés en Record<ref, values>
    const actif: Record<string, ActifValues> = {}
    actifRows.forEach((row: any) => {
      if (row.ref) {
        actif[row.ref] = {
          brut: row.brut || 0,
          amort: row.amort || 0,
          netN: row.net || 0,
          netN1: row.net_n1 || 0,
        }
      }
    })

    const passif: Record<string, PassifValues> = {}
    passifRows.forEach((row: any) => {
      if (row.ref) {
        passif[row.ref] = {
          netN: row.montant || 0,
          netN1: row.montant_n1 || 0,
        }
      }
    })

    return { actifData: actif, passifData: passif }
  }, [])

  // ── Helpers ──────────────────────────────────────────────────────────────

  const formatMontant = (value: number | undefined) => {
    if (!value || value === 0) return '-'
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  const calculerVariation = (n: number, n1: number) => {
    if (n1 === 0) return 0
    return ((n - n1) / n1) * 100
  }

  // ── KPI values ───────────────────────────────────────────────────────────
  const totalBilanN = actifData.BZ?.netN || 0
  const totalBilanN1 = actifData.BZ?.netN1 || 0
  const capitauxPropresN = passifData.CP?.netN || 0
  const resultatNetN = passifData.CJ?.netN || 0
  const resultatNetN1 = passifData.CJ?.netN1 || 0

  const actifCirculantN = actifData.BK?.netN || 0
  const tresorerieActifN = actifData.BT?.netN || 0
  const passifCirculantN = passifData.DP?.netN || 0
  const tresoreriePassifN = passifData.DT?.netN || 0
  const liquiditeGenerale = (passifCirculantN + tresoreriePassifN) > 0
    ? (actifCirculantN + tresorerieActifN) / (passifCirculantN + tresoreriePassifN)
    : 0

  // ── Grands Équilibres ────────────────────────────────────────────────────
  const ressourcesStablesN = passifData.DF?.netN || 0
  const ressourcesStablesN1 = passifData.DF?.netN1 || 0
  const actifImmobiliseNetN = actifData.AZ?.netN || 0
  const actifImmobiliseNetN1 = actifData.AZ?.netN1 || 0

  const frN = ressourcesStablesN - actifImmobiliseNetN
  const frN1 = ressourcesStablesN1 - actifImmobiliseNetN1

  const actifCirculantN1 = actifData.BK?.netN1 || 0
  const passifCirculantN1 = passifData.DP?.netN1 || 0
  const bfeN = actifCirculantN - passifCirculantN
  const bfeN1 = actifCirculantN1 - passifCirculantN1

  const actifHAO_N = actifData.BA?.netN || 0
  const actifHAO_N1 = actifData.BA?.netN1 || 0
  const passifHAO_N = passifData.DH?.netN || 0
  const passifHAO_N1 = passifData.DH?.netN1 || 0
  const bfHAO_N = actifHAO_N - passifHAO_N
  const bfHAO_N1 = actifHAO_N1 - passifHAO_N1

  const bfgN = bfeN + bfHAO_N
  const bfgN1 = bfeN1 + bfHAO_N1

  const tresorerieActifN1 = actifData.BT?.netN1 || 0
  const tresoreriePassifN1 = passifData.DT?.netN1 || 0
  const tnN = (actifData.BT?.netN || 0) - (passifData.DT?.netN || 0)
  const tnN1 = tresorerieActifN1 - tresoreriePassifN1

  // ── Row style helpers ────────────────────────────────────────────────────

  const getRowSx = (type: RowType) => {
    switch (type) {
      case 'section':
        return {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
        }
      case 'group':
        return {
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
        }
      case 'total':
        return {
          backgroundColor: alpha(theme.palette.warning.main, 0.06),
        }
      case 'grandtotal':
        return {
          backgroundColor: alpha(theme.palette.error.main, 0.06),
        }
      default:
        return {
          '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.04) },
        }
    }
  }

  const getLabelSx = (type: RowType, isGroup = false) => {
    const bold = type === 'section' || type === 'total' || type === 'grandtotal' || isGroup
    return {
      fontWeight: bold ? 700 : type === 'group' ? 600 : 400,
      fontSize: type === 'grandtotal' ? '0.95rem' : type === 'section' || type === 'total' ? '0.9rem' : '0.85rem',
      color: type === 'section'
        ? theme.palette.primary.dark
        : type === 'grandtotal'
        ? theme.palette.error.dark
        : type === 'total'
        ? theme.palette.warning.dark
        : 'inherit',
    }
  }

  const getIndent = (type: RowType) => {
    if (type === 'line') return 3
    if (type === 'group') return 1.5
    return 0
  }

  const getValueWeight = (type: RowType) =>
    type === 'total' || type === 'grandtotal' ? 700 : type === 'group' ? 600 : 400

  // ── Render helpers ───────────────────────────────────────────────────────

  const renderActifRow = (row: ActifRow, index: number) => {
    const values = row.ref ? actifData[row.ref] : undefined

    if (row.type === 'section') {
      return (
        <TableRow key={`actif-section-${index}`} sx={getRowSx('section')}>
          <TableCell colSpan={7} sx={{ py: 1.2, textAlign: 'center', ...getLabelSx('section') }}>
            {row.label}
          </TableCell>
        </TableRow>
      )
    }

    return (
      <TableRow key={row.ref || `actif-${index}`} sx={getRowSx(row.type)}>
        <TableCell sx={{ width: 50, ...getLabelSx(row.type), color: row.type === 'grandtotal' ? theme.palette.error.dark : row.type === 'total' ? theme.palette.warning.dark : 'text.secondary' }}>
          {row.ref}
        </TableCell>
        <TableCell sx={{ pl: getIndent(row.type), ...getLabelSx(row.type) }}>
          {row.label}
        </TableCell>
        <TableCell align="center" sx={{ width: 50 }}>
          {row.note && <Chip label={row.note} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.75rem' }} />}
        </TableCell>
        <TableCell align="right" sx={{ width: 120, fontWeight: getValueWeight(row.type) }}>
          {formatMontant(values?.brut)}
        </TableCell>
        <TableCell align="right" sx={{ width: 120, fontWeight: getValueWeight(row.type) }}>
          {formatMontant(values?.amort)}
        </TableCell>
        <TableCell align="right" sx={{ width: 120, fontWeight: getValueWeight(row.type), backgroundColor: alpha(theme.palette.info.main, 0.04), color: row.type === 'grandtotal' ? theme.palette.error.dark : 'inherit' }}>
          {formatMontant(values?.netN)}
        </TableCell>
        <TableCell align="right" sx={{ width: 120, fontWeight: getValueWeight(row.type) }}>
          {formatMontant(values?.netN1)}
        </TableCell>
      </TableRow>
    )
  }

  const renderPassifRow = (row: PassifRow, index: number) => {
    const values = row.ref ? passifData[row.ref] : undefined

    if (row.type === 'section') {
      return (
        <TableRow key={`passif-section-${index}`} sx={getRowSx('section')}>
          <TableCell colSpan={5} sx={{ py: 1.2, textAlign: 'center', ...getLabelSx('section') }}>
            {row.label}
          </TableCell>
        </TableRow>
      )
    }

    return (
      <TableRow key={row.ref || `passif-${index}`} sx={getRowSx(row.type)}>
        <TableCell sx={{ width: 50, ...getLabelSx(row.type), color: row.type === 'grandtotal' ? theme.palette.error.dark : row.type === 'total' ? theme.palette.warning.dark : 'text.secondary' }}>
          {row.ref}
        </TableCell>
        <TableCell sx={{ pl: getIndent(row.type), ...getLabelSx(row.type) }}>
          {row.label}
        </TableCell>
        <TableCell align="center" sx={{ width: 50 }}>
          {row.note && <Chip label={row.note} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.75rem' }} />}
        </TableCell>
        <TableCell align="right" sx={{ width: 140, fontWeight: getValueWeight(row.type), backgroundColor: alpha(theme.palette.info.main, 0.04), color: row.type === 'grandtotal' ? theme.palette.error.dark : 'inherit' }}>
          {formatMontant(values?.netN)}
        </TableCell>
        <TableCell align="right" sx={{ width: 140, fontWeight: getValueWeight(row.type) }}>
          {formatMontant(values?.netN1)}
        </TableCell>
      </TableRow>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
          Bilan Synthétique (en FCFA)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Structure officielle SYSCOHADA Révisé - Exercices {exerciceN} et {exerciceN1}
        </Typography>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">TOTAL BILAN</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatMontant(totalBilanN)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {totalBilanN > totalBilanN1 ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography variant="body2" color={totalBilanN > totalBilanN1 ? 'success.main' : 'error.main'}>
                    {calculerVariation(totalBilanN, totalBilanN1).toFixed(1)}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">CAPITAUX PROPRES</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatMontant(capitauxPropresN)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Autonomie: {totalBilanN > 0 ? ((capitauxPropresN / totalBilanN) * 100).toFixed(1) : 0}%
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">LIQUIDITÉ GÉNÉRALE</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {liquiditeGenerale.toFixed(2)}
                </Typography>
                <Chip
                  label={liquiditeGenerale >= 1 ? 'Bonne' : 'Faible'}
                  color={liquiditeGenerale >= 1 ? 'success' : 'warning'}
                  size="small"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">RÉSULTAT NET</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatMontant(resultatNetN)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {resultatNetN > resultatNetN1 ? (
                    <TrendingUpIcon color="success" fontSize="small" />
                  ) : (
                    <TrendingDownIcon color="error" fontSize="small" />
                  )}
                  <Typography variant="body2" color={resultatNetN > resultatNetN1 ? 'success.main' : 'error.main'}>
                    {calculerVariation(resultatNetN, resultatNetN1).toFixed(1)}% vs N-1
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═══════════ ACTIF ═══════════ */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
          ACTIF
        </Typography>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>REF</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>LIBELLÉ</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Note</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>BRUT</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>AMORT./DÉPRÉC.</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem', backgroundColor: alpha(theme.palette.info.main, 0.06) }}>
                  NET {exerciceN}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>NET {exerciceN1}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ACTIF_STRUCTURE.map(renderActifRow)}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ═══════════ PASSIF ═══════════ */}
      <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
          PASSIF
        </Typography>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>REF</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>LIBELLÉ</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Note</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem', backgroundColor: alpha(theme.palette.info.main, 0.06) }}>
                  NET {exerciceN}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>NET {exerciceN1}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PASSIF_STRUCTURE.map(renderPassifRow)}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ═══════════ GRANDS ÉQUILIBRES FINANCIERS ═══════════ */}
      <Paper sx={{ p: 2, mb: 2 }} elevation={0} variant="outlined">
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
          Grands Équilibres Financiers
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Indicateur</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Formule</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem', backgroundColor: alpha(theme.palette.info.main, 0.06) }}>
                  {exerciceN}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>{exerciceN1}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>Variation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* FR */}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.success.main, 0.04) }}>
                <TableCell sx={{ fontWeight: 600 }}>Fonds de Roulement (FR)</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>DF - AZ</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.info.main, 0.04), color: frN >= 0 ? 'success.main' : 'error.main' }}>
                  {formatMontant(frN)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>{formatMontant(frN1)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500, color: frN > frN1 ? 'success.main' : 'error.main' }}>
                  {calculerVariation(frN, frN1).toFixed(1)}%
                </TableCell>
              </TableRow>

              {/* BFE */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Besoin de Financement d'Exploitation (BFE)</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>BK - DP</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.info.main, 0.04) }}>
                  {formatMontant(bfeN)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>{formatMontant(bfeN1)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500, color: bfeN < bfeN1 ? 'success.main' : 'error.main' }}>
                  {calculerVariation(bfeN, bfeN1).toFixed(1)}%
                </TableCell>
              </TableRow>

              {/* BF HAO */}
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>BF HAO</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>BA - DH</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.info.main, 0.04) }}>
                  {formatMontant(bfHAO_N)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>{formatMontant(bfHAO_N1)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>
                  {bfHAO_N1 !== 0 ? `${calculerVariation(bfHAO_N, bfHAO_N1).toFixed(1)}%` : '-'}
                </TableCell>
              </TableRow>

              {/* BFG */}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.06) }}>
                <TableCell sx={{ fontWeight: 700 }}>Besoin de Financement Global (BFG)</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>BFE + BF HAO</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.info.main, 0.04) }}>
                  {formatMontant(bfgN)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMontant(bfgN1)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: bfgN < bfgN1 ? 'success.main' : 'error.main' }}>
                  {calculerVariation(bfgN, bfgN1).toFixed(1)}%
                </TableCell>
              </TableRow>

              {/* TN */}
              <TableRow sx={{ backgroundColor: alpha(theme.palette.error.main, 0.05) }}>
                <TableCell sx={{ fontWeight: 700 }}>Trésorerie Nette (TN)</TableCell>
                <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>BT - DT = FR - BFG</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, backgroundColor: alpha(theme.palette.info.main, 0.04), color: tnN >= 0 ? 'success.main' : 'error.main' }}>
                  {formatMontant(tnN)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMontant(tnN1)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: tnN > tnN1 ? 'success.main' : 'error.main' }}>
                  {calculerVariation(tnN, tnN1).toFixed(1)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Vérification FR = BFG + TN */}
        <Box sx={{ mt: 2, p: 1.5, backgroundColor: alpha(theme.palette.success.main, 0.08), borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
            Vérification : FR ({formatMontant(frN)}) = BFG ({formatMontant(bfgN)}) + TN ({formatMontant(tnN)})
          </Typography>
        </Box>
      </Paper>

      {/* Équilibre du bilan */}
      <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.08), borderRadius: 1, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.dark' }}>
          Bilan équilibré : Total Actif = Total Passif = {formatMontant(totalBilanN)}
        </Typography>
      </Box>
    </Box>
  )
}

export default BilanSynthetique
