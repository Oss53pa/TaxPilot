import { logger } from '@/utils/logger'
/**
 * Tableau de Flux de Trésorerie (TFT) SYSCOHADA — Méthode indirecte
 *
 * Structure : FA→FG (opérationnel), FH→FK (investissement), FL→FP (financement)
 * Synthèse : FQ (variation), FR (début), FS (fin), FT (contrôle)
 *
 * Données calculées depuis liasseDataService.generateTFT()
 */

import { useState, useEffect, useMemo, type FC } from 'react'
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Stack,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Calculate as CalcIcon,
  Comment as CommentIcon,
  Refresh as RefreshIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  AccountBalanceWallet as CashIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { liasseDataService } from '../../../services/liasseDataService'
import EditableToolbar from '../shared/EditableToolbar'

// ═══════════════════════════════════════
// Structure du TFT selon SYSCOHADA
// ═══════════════════════════════════════

interface TFTItem {
  type: 'section' | 'line' | 'subtotal' | 'total' | 'grandtotal' | 'control'
  ref?: string
  label: string
  note?: string
  indent?: number
  negative?: boolean
  formula?: string
}

const TFT_STRUCTURE: TFTItem[] = [
  // ── Section A : Flux opérationnels (méthode indirecte) ──
  { type: 'section', label: 'A — FLUX DE TRÉSORERIE DES ACTIVITÉS OPÉRATIONNELLES' },

  { type: 'line', ref: 'FA', label: 'Résultat net de l\'exercice (SIG 9 / XI)', indent: 1 },
  { type: 'line', ref: 'FB', label: '(+) Dotations aux amortissements et provisions', note: '3C/3D', indent: 1 },
  { type: 'line', ref: 'FC', label: '(-) Reprises sur amortissements et provisions', note: '28', indent: 1, negative: true },
  { type: 'line', ref: 'FD', label: '(-) Plus ou moins-values de cession', note: '3D', indent: 1, negative: true },

  { type: 'subtotal', ref: 'FE', label: 'CAPACITÉ D\'AUTOFINANCEMENT GLOBALE (CAFG)', formula: 'FA+FB-FC-FD' },

  { type: 'line', ref: 'FF', label: 'Variation du Besoin en Fonds de Roulement (BFR)', indent: 1 },

  { type: 'total', ref: 'FG', label: 'FLUX DE TRÉSORERIE DES ACTIVITÉS OPÉRATIONNELLES (A)', formula: 'FE+FF' },

  // ── Section B : Flux d'investissement ──
  { type: 'section', label: 'B — FLUX DE TRÉSORERIE DES ACTIVITÉS D\'INVESTISSEMENT' },

  { type: 'line', ref: 'FH', label: '(-) Acquisitions d\'immobilisations', indent: 1, negative: true },
  { type: 'line', ref: 'FI', label: '(+) Cessions d\'immobilisations (prix de cession)', note: '3D', indent: 1 },
  { type: 'line', ref: 'FJ', label: '(-/+) Variation des immobilisations financières', indent: 1 },

  { type: 'total', ref: 'FK', label: 'FLUX DE TRÉSORERIE DES ACTIVITÉS D\'INVESTISSEMENT (B)', formula: '-FH+FI-FJ' },

  // ── Section C : Flux de financement ──
  { type: 'section', label: 'C — FLUX DE TRÉSORERIE DES ACTIVITÉS DE FINANCEMENT' },

  { type: 'line', ref: 'FL', label: '(+) Augmentation de capital', note: '13', indent: 1 },
  { type: 'line', ref: 'FM', label: '(+) Emprunts nouveaux', note: '16', indent: 1 },
  { type: 'line', ref: 'FN', label: '(-) Remboursements d\'emprunts', note: '16', indent: 1, negative: true },
  { type: 'line', ref: 'FO', label: '(-) Dividendes versés', indent: 1, negative: true },

  { type: 'total', ref: 'FP', label: 'FLUX DE TRÉSORERIE DES ACTIVITÉS DE FINANCEMENT (C)', formula: 'FL+FM-FN-FO' },

  // ── Synthèse ──
  { type: 'section', label: 'SYNTHÈSE' },

  { type: 'grandtotal', ref: 'FQ', label: 'VARIATION DE TRÉSORERIE NETTE (A + B + C)', formula: 'FG+FK+FP' },
  { type: 'line', ref: 'FR', label: 'Trésorerie nette au début de l\'exercice', indent: 1 },
  { type: 'grandtotal', ref: 'FS', label: 'TRÉSORERIE NETTE À LA FIN DE L\'EXERCICE' },

  // ── Contrôle ──
  { type: 'control', ref: 'FT', label: 'CONTRÔLE : FS − FR doit être = FQ' },
]

// ═══════════════════════════════════════
// Composant
// ═══════════════════════════════════════

interface TFTData {
  [ref: string]: {
    montant: number
    montantN1: number
    note?: string
  }
}

const TableauFluxTresorerieSYSCOHADA: FC = () => {
  const theme = useTheme()
  const [data, setData] = useState<TFTData>({})
  const [comment, setComment] = useState('')
  const [isAutoMode, setIsAutoMode] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [hasN1Data, setHasN1Data] = useState(false)

  useEffect(() => {
    if (isAutoMode) {
      loadDataFromBalance()
    }
  }, [isAutoMode])

  const loadDataFromBalance = () => {
    const tft = liasseDataService.generateTFT()

    const newData: TFTData = {
      // Section A — Opérationnel
      FA: { montant: tft.FA || 0, montantN1: 0 },
      FB: { montant: tft.FB || 0, montantN1: 0 },
      FC: { montant: tft.FC || 0, montantN1: 0 },
      FD: { montant: tft.FD || 0, montantN1: 0 },
      // FE calculé
      FF: { montant: tft.FF || 0, montantN1: 0 },
      // FG calculé

      // Section B — Investissement
      FH: { montant: tft.FH || 0, montantN1: 0 },
      FI: { montant: tft.FI || 0, montantN1: 0 },
      FJ: { montant: tft.FJ || 0, montantN1: 0 },
      // FK calculé

      // Section C — Financement
      FL: { montant: tft.FL || 0, montantN1: 0 },
      FM: { montant: tft.FM || 0, montantN1: 0 },
      FN: { montant: tft.FN || 0, montantN1: 0 },
      FO: { montant: tft.FO || 0, montantN1: 0 },
      // FP calculé

      // Synthèse (FR = début exercice, FS = fin exercice)
      FR: { montant: tft.FR || 0, montantN1: 0 },
    }

    setHasN1Data(tft.hasN1 || false)
    setData(newData)
  }

  // ═══════════════════════════════════════
  // Calcul des totaux en cascade
  // ═══════════════════════════════════════

  const calculateTotals = useMemo(() => {
    const totals: TFTData = {}

    const get = (ref: string) => data[ref]?.montant || 0
    const getN1 = (ref: string) => data[ref]?.montantN1 || 0

    // FE = FA + FB - FC - FD (CAFG)
    totals.FE = {
      montant: get('FA') + get('FB') - get('FC') - get('FD'),
      montantN1: getN1('FA') + getN1('FB') - getN1('FC') - getN1('FD'),
    }

    // FG = FE + FF (Flux opérationnels)
    totals.FG = {
      montant: totals.FE.montant + get('FF'),
      montantN1: totals.FE.montantN1 + getN1('FF'),
    }

    // FK = -FH + FI - FJ (Flux investissement)
    totals.FK = {
      montant: -get('FH') + get('FI') - get('FJ'),
      montantN1: -getN1('FH') + getN1('FI') - getN1('FJ'),
    }

    // FP = FL + FM - FN - FO (Flux financement)
    totals.FP = {
      montant: get('FL') + get('FM') - get('FN') - get('FO'),
      montantN1: getN1('FL') + getN1('FM') - getN1('FN') - getN1('FO'),
    }

    // FQ = FG + FK + FP (Variation trésorerie)
    totals.FQ = {
      montant: totals.FG.montant + totals.FK.montant + totals.FP.montant,
      montantN1: totals.FG.montantN1 + totals.FK.montantN1 + totals.FP.montantN1,
    }

    // FS = FR + FQ (Trésorerie fin)
    totals.FS = {
      montant: get('FR') + totals.FQ.montant,
      montantN1: getN1('FR') + totals.FQ.montantN1,
    }

    // FT = contrôle : FS - FR - FQ (doit être 0)
    totals.FT = {
      montant: totals.FS.montant - get('FR') - totals.FQ.montant,
      montantN1: totals.FS.montantN1 - getN1('FR') - totals.FQ.montantN1,
    }

    return totals
  }, [data])

  const mergedData = { ...data, ...calculateTotals }

  // ═══════════════════════════════════════
  // Contrôles de cohérence
  // ═══════════════════════════════════════

  const ecartControle = Math.abs(mergedData.FT?.montant || 0)
  const isControleOK = ecartControle < 1

  // Vérifier FA = XI du CdR
  const resultatCdR = useMemo(() => {
    const { charges, produits } = liasseDataService.generateCompteResultat()
    const totalProduits = produits.reduce((sum: number, r: any) => sum + (r.montant || 0), 0)
    const totalCharges = charges.reduce((sum: number, r: any) => sum + (r.montant || 0), 0)
    return totalProduits - totalCharges
  }, [data])

  const ecartFA = Math.abs((data.FA?.montant || 0) - resultatCdR)
  const isFACoherent = ecartFA < 1

  // ═══════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════

  const handleCellChange = (ref: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setData(prev => ({
      ...prev,
      [ref]: {
        ...prev[ref],
        [field]: field === 'note' ? value : numValue,
      },
    }))
    setHasChanges(true)
  }

  const handleToggleMode = () => {
    setIsAutoMode(!isAutoMode)
    if (!isAutoMode) loadDataFromBalance()
  }

  const handleSave = () => {
    logger.debug('Sauvegarde du TFT:', mergedData)
    setHasChanges(false)
  }

  // ═══════════════════════════════════════
  // Formatage
  // ═══════════════════════════════════════

  const formatNumber = (value: number | undefined, showSign: boolean = false) => {
    if (value === undefined || value === 0) return '-'
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value))
    if (showSign) return value > 0 ? `+${formatted}` : `(${formatted})`
    return value < 0 ? `(${formatted})` : formatted
  }

  // ═══════════════════════════════════════
  // Rendu des lignes
  // ═══════════════════════════════════════

  const renderRow = (item: TFTItem) => {
    if (item.type === 'section') {
      return (
        <TableRow key={item.label}>
          <TableCell colSpan={5} sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            fontWeight: 700,
            fontSize: '0.95rem',
            color: theme.palette.primary.dark,
            textAlign: 'center',
            py: 1.5,
          }}>
            {item.label}
          </TableCell>
        </TableRow>
      )
    }

    const ref = item.ref || ''
    const rowData = mergedData[ref] || { montant: 0, montantN1: 0 }
    const isEditable = !isAutoMode && item.type === 'line'
    const isSubtotal = item.type === 'subtotal'
    const isTotal = item.type === 'total'
    const isGrandTotal = item.type === 'grandtotal'
    const isControl = item.type === 'control'
    const indent = item.indent || 0

    const getResultColor = (value: number) => {
      if (!isTotal && !isGrandTotal && !isSubtotal) return 'inherit'
      if (value > 0) return theme.palette.success.main
      if (value < 0) return theme.palette.error.main
      return 'inherit'
    }

    const getFlowIcon = () => {
      if (isGrandTotal && ref === 'FQ') {
        const v = rowData.montant
        if (v > 0) return <UpIcon color="success" fontSize="small" sx={{ ml: 1 }} />
        if (v < 0) return <DownIcon color="error" fontSize="small" sx={{ ml: 1 }} />
      }
      return null
    }

    // Control row renders differently
    if (isControl) {
      return (
        <TableRow key={ref} sx={{
          backgroundColor: isControleOK
            ? alpha(theme.palette.success.main, 0.06)
            : alpha(theme.palette.error.main, 0.08),
        }}>
          <TableCell sx={{ width: 60, fontWeight: 700, fontFamily: 'monospace' }}>{ref}</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {isControleOK
                ? <CheckIcon color="success" fontSize="small" />
                : <WarningIcon color="error" fontSize="small" />}
              <span>{item.label}</span>
            </Stack>
          </TableCell>
          <TableCell />
          <TableCell align="right" sx={{
            fontWeight: 700,
            color: isControleOK ? theme.palette.success.main : theme.palette.error.main,
          }}>
            {isControleOK ? 'OK' : `Écart : ${formatNumber(ecartControle)}`}
          </TableCell>
          <TableCell align="right" sx={{ fontWeight: 700 }}>
            {isControleOK ? 'OK' : '-'}
          </TableCell>
        </TableRow>
      )
    }

    return (
      <TableRow
        key={ref}
        sx={{
          backgroundColor: isGrandTotal
            ? alpha(theme.palette.primary.main, 0.05)
            : isTotal
              ? alpha(theme.palette.warning.main, 0.04)
              : isSubtotal
                ? alpha(theme.palette.info.main, 0.03)
                : 'transparent',
          '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.05) },
        }}
      >
        {/* Réf */}
        <TableCell sx={{
          width: 60,
          fontWeight: isTotal || isGrandTotal || isSubtotal ? 600 : 400,
          color: isGrandTotal ? theme.palette.primary.main : isTotal ? theme.palette.warning.dark : 'inherit',
        }}>
          {ref}
        </TableCell>

        {/* Libellé */}
        <TableCell sx={{
          pl: indent * 3,
          fontWeight: isTotal || isGrandTotal ? 700 : isSubtotal ? 600 : 400,
          fontSize: isGrandTotal ? '0.95rem' : isTotal ? '0.9rem' : '0.875rem',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {item.label}
            {getFlowIcon()}
          </Box>
        </TableCell>

        {/* Note */}
        <TableCell sx={{ width: 60, textAlign: 'center' }}>
          {item.note && <Chip label={item.note} size="small" variant="outlined" />}
        </TableCell>

        {/* Exercice N */}
        <TableCell align="right" sx={{
          width: 150,
          backgroundColor: alpha(theme.palette.info.main, 0.05),
        }}>
          {isEditable ? (
            <TextField
              size="small"
              type="number"
              value={rowData.montant || ''}
              onChange={(e) => handleCellChange(ref, 'montant', e.target.value)}
              fullWidth
              InputProps={{ sx: { fontSize: '0.875rem' } }}
            />
          ) : (
            <Typography
              variant="body2"
              sx={{
                fontWeight: isTotal || isGrandTotal || isSubtotal ? 700 : 400,
                color: getResultColor(rowData.montant),
              }}
            >
              {formatNumber(rowData.montant, isGrandTotal)}
            </Typography>
          )}
        </TableCell>

        {/* Exercice N-1 */}
        <TableCell align="right" sx={{ width: 150 }}>
          {isEditable ? (
            <TextField
              size="small"
              type="number"
              value={rowData.montantN1 || ''}
              onChange={(e) => handleCellChange(ref, 'montantN1', e.target.value)}
              fullWidth
              InputProps={{ sx: { fontSize: '0.875rem' } }}
            />
          ) : (
            <Typography variant="body2" sx={{
              fontWeight: isTotal || isGrandTotal || isSubtotal ? 700 : 400,
            }}>
              {formatNumber(rowData.montantN1)}
            </Typography>
          )}
        </TableCell>
      </TableRow>
    )
  }

  // ═══════════════════════════════════════
  // KPIs
  // ═══════════════════════════════════════

  const variationTreso = mergedData.FQ?.montant || 0
  const fluxOpe = mergedData.FG?.montant || 0
  const fluxInv = mergedData.FK?.montant || 0
  const fluxFin = mergedData.FP?.montant || 0

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      {/* En-tête */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CashIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              TABLEAU DE FLUX DE TRÉSORERIE (en FCFA)
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Actualiser">
              <IconButton size="small" onClick={loadDataFromBalance}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <EditableToolbar
              isEditMode={!isAutoMode}
              onToggleEdit={handleToggleMode}
              hasChanges={hasChanges}
              onSave={handleSave}
            />
          </Stack>
        </Stack>

        {/* Chips KPI */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Chip
            icon={variationTreso > 0 ? <UpIcon /> : variationTreso < 0 ? <DownIcon /> : undefined}
            label={`Variation: ${formatNumber(variationTreso, true)}`}
            color={variationTreso > 0 ? 'success' : variationTreso < 0 ? 'error' : 'default'}
            variant="outlined"
          />
          <Chip
            label={`Flux Opérat.: ${formatNumber(fluxOpe)}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Flux Invest.: ${formatNumber(fluxInv)}`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`Flux Financ.: ${formatNumber(fluxFin)}`}
            color="secondary"
            variant="outlined"
          />
          {isAutoMode && (
            <Chip icon={<CalcIcon />} label="Synchronisé" color="info" size="small" />
          )}
        </Stack>
      </Box>

      {/* Alertes */}
      {!hasN1Data && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
          <Typography variant="body2">
            <strong>Données N-1 requises pour le calcul du TFT.</strong>{' '}
            Les lignes FF (variation BFR), FH (acquisitions), FJ (immo financières), FL (capital),
            FM/FN (emprunts) et FR (trésorerie début) nécessitent la balance N-1.
            En son absence, ces postes sont à 0.
          </Typography>
        </Alert>
      )}

      {/* Cohérence FA = XI */}
      <Alert
        severity={isFACoherent ? 'success' : 'error'}
        icon={isFACoherent ? <CheckIcon /> : <WarningIcon />}
        sx={{ mb: 2 }}
      >
        <Typography variant="body2">
          <strong>Cohérence :</strong>{' '}
          FA (Résultat net TFT) = {formatNumber(data.FA?.montant)}
          {' | '}
          XI (Résultat net CdR) = {formatNumber(resultatCdR)}
          {isFACoherent ? ' — Concordance vérifiée' : ` — Écart de ${formatNumber(ecartFA)} !`}
        </Typography>
      </Alert>

      {/* Tableau */}
      <TableContainer sx={{ mb: 3 }}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Réf</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>LIBELLÉ</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Note</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Exercice N</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Exercice N-1</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {TFT_STRUCTURE.map(renderRow)}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Zone de commentaires */}
      <Box sx={{
        p: 2,
        backgroundColor: alpha(theme.palette.action.hover, 0.3),
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <CommentIcon color="action" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Commentaires et observations
          </Typography>
        </Stack>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Saisissez vos commentaires sur les flux de trésorerie..."
          variant="outlined"
          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: theme.palette.background.paper } }}
        />
      </Box>
    </Paper>
  )
}

export default TableauFluxTresorerieSYSCOHADA
