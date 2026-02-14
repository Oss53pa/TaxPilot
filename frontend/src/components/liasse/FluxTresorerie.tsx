/**
 * Composant Flux de Trésorerie - SYSCOHADA (Méthode indirecte)
 * Version utilisée dans LiasseCompleteV2
 *
 * Données calculées depuis liasseDataService.generateTFT()
 */

import React, { useState, useEffect, useMemo } from 'react'
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
  Card,
  CardContent,
  Chip,
  Alert,
  Stack,
  useTheme,
  alpha,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AttachMoney,
  BusinessCenter,
  CheckCircle,
  Warning,
} from '@mui/icons-material'
import { liasseDataService } from '../../services/liasseDataService'

interface FluxTresorerieProps {
  modeEdition?: boolean
}

interface TFTRow {
  ref: string
  label: string
  type: 'section' | 'line' | 'subtotal' | 'total' | 'grandtotal' | 'control'
  montant: number
  montantN1: number
}

const FluxTresorerie: React.FC<FluxTresorerieProps> = ({ modeEdition: _modeEdition = false }) => {
  const theme = useTheme()
  const [rows, setRows] = useState<TFTRow[]>([])
  const [hasN1, setHasN1] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const tft = liasseDataService.generateTFT()
    setHasN1(tft.hasN1 || false)

    // Calculer les totaux
    const FA = tft.FA || 0
    const FB = tft.FB || 0
    const FC = tft.FC || 0
    const FD = tft.FD || 0
    const FE = FA + FB - FC - FD
    const FF = tft.FF || 0
    const FG = FE + FF

    const FH = tft.FH || 0
    const FI = tft.FI || 0
    const FJ = tft.FJ || 0
    const FK = -FH + FI - FJ

    const FL = tft.FL || 0
    const FM = tft.FM || 0
    const FN = tft.FN || 0
    const FO = tft.FO || 0
    const FP = FL + FM - FN - FO

    const FQ = FG + FK + FP
    const FR = tft.FR || 0
    const FS = FR + FQ

    setRows([
      { ref: '', label: 'FLUX DE TRÉSORERIE DES ACTIVITÉS OPÉRATIONNELLES', type: 'section', montant: 0, montantN1: 0 },
      { ref: 'FA', label: 'Résultat net de l\'exercice', type: 'line', montant: FA, montantN1: 0 },
      { ref: 'FB', label: '(+) Dotations aux amortissements et provisions', type: 'line', montant: FB, montantN1: 0 },
      { ref: 'FC', label: '(-) Reprises sur amortissements et provisions', type: 'line', montant: FC, montantN1: 0 },
      { ref: 'FD', label: '(-) Plus/moins-values de cession', type: 'line', montant: FD, montantN1: 0 },
      { ref: 'FE', label: 'CAPACITÉ D\'AUTOFINANCEMENT (CAFG)', type: 'subtotal', montant: FE, montantN1: 0 },
      { ref: 'FF', label: 'Variation du BFR', type: 'line', montant: FF, montantN1: 0 },
      { ref: 'FG', label: 'FLUX DE TRÉSORERIE OPÉRATIONNELS (A)', type: 'total', montant: FG, montantN1: 0 },

      { ref: '', label: 'FLUX DE TRÉSORERIE DES ACTIVITÉS D\'INVESTISSEMENT', type: 'section', montant: 0, montantN1: 0 },
      { ref: 'FH', label: '(-) Acquisitions d\'immobilisations', type: 'line', montant: FH, montantN1: 0 },
      { ref: 'FI', label: '(+) Cessions d\'immobilisations', type: 'line', montant: FI, montantN1: 0 },
      { ref: 'FJ', label: '(-/+) Variation immobilisations financières', type: 'line', montant: FJ, montantN1: 0 },
      { ref: 'FK', label: 'FLUX DE TRÉSORERIE D\'INVESTISSEMENT (B)', type: 'total', montant: FK, montantN1: 0 },

      { ref: '', label: 'FLUX DE TRÉSORERIE DES ACTIVITÉS DE FINANCEMENT', type: 'section', montant: 0, montantN1: 0 },
      { ref: 'FL', label: '(+) Augmentation de capital', type: 'line', montant: FL, montantN1: 0 },
      { ref: 'FM', label: '(+) Emprunts nouveaux', type: 'line', montant: FM, montantN1: 0 },
      { ref: 'FN', label: '(-) Remboursements d\'emprunts', type: 'line', montant: FN, montantN1: 0 },
      { ref: 'FO', label: '(-) Dividendes versés', type: 'line', montant: FO, montantN1: 0 },
      { ref: 'FP', label: 'FLUX DE TRÉSORERIE DE FINANCEMENT (C)', type: 'total', montant: FP, montantN1: 0 },

      { ref: '', label: 'SYNTHÈSE', type: 'section', montant: 0, montantN1: 0 },
      { ref: 'FQ', label: 'VARIATION DE TRÉSORERIE (A + B + C)', type: 'grandtotal', montant: FQ, montantN1: 0 },
      { ref: 'FR', label: 'Trésorerie début d\'exercice', type: 'line', montant: FR, montantN1: 0 },
      { ref: 'FS', label: 'TRÉSORERIE FIN D\'EXERCICE', type: 'grandtotal', montant: FS, montantN1: 0 },
    ])
  }

  const formatNumber = (value: number) => {
    if (value === 0) return '-'
    const formatted = new Intl.NumberFormat('fr-FR').format(Math.abs(value))
    return value < 0 ? `(${formatted})` : formatted
  }

  // KPI values
  const fluxOpe = rows.find(r => r.ref === 'FG')?.montant || 0
  const fluxInv = rows.find(r => r.ref === 'FK')?.montant || 0
  const fluxFin = rows.find(r => r.ref === 'FP')?.montant || 0
  const variation = rows.find(r => r.ref === 'FQ')?.montant || 0

  // Cohérence FA = XI
  const resultatCdR = useMemo(() => {
    const { charges, produits } = liasseDataService.generateCompteResultat()
    const tp = produits.reduce((sum: number, r: any) => sum + (r.montant || 0), 0)
    const tc = charges.reduce((sum: number, r: any) => sum + (r.montant || 0), 0)
    return tp - tc
  }, [rows])
  const faValue = rows.find(r => r.ref === 'FA')?.montant || 0
  const isFACoherent = Math.abs(faValue - resultatCdR) < 1

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AttachMoney sx={{ mr: 2, color: 'success.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
            Tableau des Flux de Trésorerie (en FCFA)
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Méthode indirecte — SYSCOHADA Révisé
          </Typography>
        </Box>
      </Box>

      {/* Alertes */}
      {!hasN1 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<Warning />}>
          <Typography variant="body2">
            <strong>Données N-1 absentes.</strong> Les postes nécessitant une comparaison N/N-1
            (variation BFR, acquisitions, emprunts, trésorerie début) sont à 0.
          </Typography>
        </Alert>
      )}

      <Alert
        severity={isFACoherent ? 'success' : 'error'}
        icon={isFACoherent ? <CheckCircle /> : <Warning />}
        sx={{ mb: 3 }}
      >
        <Typography variant="body2">
          <strong>Cohérence :</strong> FA = {formatNumber(faValue)} | XI (CdR) = {formatNumber(resultatCdR)}
          {isFACoherent ? ' — OK' : ' — Écart détecté'}
        </Typography>
      </Alert>

      {/* KPIs */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Card sx={{ flexGrow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Flux d'exploitation</Typography>
                <Typography variant="h6" color={fluxOpe >= 0 ? 'success.main' : 'error.main'}>
                  {formatNumber(fluxOpe)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flexGrow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessCenter sx={{ color: 'warning.main', mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Flux d'investissement</Typography>
                <Typography variant="h6" color={fluxInv >= 0 ? 'success.main' : 'warning.main'}>
                  {formatNumber(fluxInv)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flexGrow: 1 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountBalance sx={{ color: 'info.main', mr: 1 }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Flux de financement</Typography>
                <Typography variant="h6" color={fluxFin >= 0 ? 'info.main' : 'error.main'}>
                  {formatNumber(fluxFin)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Tableau */}
      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: 60 }}>Réf</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700 }}>Libellé</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700, width: 150 }}>Exercice N</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 700, width: 150 }}>Exercice N-1</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              if (row.type === 'section') {
                return (
                  <TableRow key={`sec-${index}`}>
                    <TableCell colSpan={4} sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      fontWeight: 700,
                      textAlign: 'center',
                      py: 1.5,
                      color: theme.palette.primary.dark,
                    }}>
                      {row.label}
                    </TableCell>
                  </TableRow>
                )
              }

              const isSubtotal = row.type === 'subtotal'
              const isTotal = row.type === 'total'
              const isGrandTotal = row.type === 'grandtotal'

              return (
                <TableRow
                  key={row.ref}
                  sx={{
                    backgroundColor: isGrandTotal
                      ? alpha(theme.palette.primary.main, 0.05)
                      : isTotal
                        ? alpha(theme.palette.warning.main, 0.04)
                        : isSubtotal
                          ? alpha(theme.palette.info.main, 0.03)
                          : 'transparent',
                  }}
                >
                  <TableCell sx={{
                    fontWeight: isTotal || isGrandTotal ? 700 : 400,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                  }}>
                    {row.ref}
                  </TableCell>
                  <TableCell sx={{
                    fontWeight: isTotal || isGrandTotal ? 700 : isSubtotal ? 600 : 400,
                    pl: row.type === 'line' ? 3 : 1,
                  }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <span>{row.label}</span>
                      {isGrandTotal && row.ref === 'FQ' && row.montant !== 0 && (
                        row.montant > 0
                          ? <TrendingUp color="success" fontSize="small" />
                          : <TrendingDown color="error" fontSize="small" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{
                    fontWeight: isTotal || isGrandTotal ? 700 : 400,
                    color: (isTotal || isGrandTotal) && row.montant < 0 ? 'error.main'
                      : (isTotal || isGrandTotal) && row.montant > 0 ? 'success.main' : 'inherit',
                  }}>
                    {formatNumber(row.montant)}
                  </TableCell>
                  <TableCell align="right" sx={{
                    fontWeight: isTotal || isGrandTotal ? 700 : 400,
                  }}>
                    {formatNumber(row.montantN1)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default FluxTresorerie
