/**
 * État des Soldes Intermédiaires de Gestion (SIG) - SYSCOHADA
 *
 * Cascade complète : Marge Commerciale → Production → VA → EBE → RE → RF → RAO → RHAO → RN
 * Données issues de la même balance que le Compte de Résultat (pas de double comptage).
 */

import React, { useState, useEffect, useMemo } from 'react'
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
  IconButton,
  Tooltip,
  Chip,
  Button,
  Stack,
  Alert,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  AutoFixHigh as AutoIcon,
  TrendingUp as ProfitIcon,
  TrendingDown as LossIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { liasseDataService } from '../../services/liasseDataService'

// ═══════════════════════════════════════
// Structure du SIG SYSCOHADA
// ═══════════════════════════════════════

interface SIGItem {
  type: 'section' | 'line' | 'sig' | 'separator'
  ref?: string
  label: string
  sign?: '+' | '-'       // Sens pour affichage
  indent?: number
  sigNum?: number         // Numéro du SIG (1-9) pour les lignes résultat
}

const SIG_STRUCTURE: SIGItem[] = [
  // ── SIG 1 : Marge Commerciale ──
  { type: 'section', label: 'DÉTERMINATION DE LA MARGE COMMERCIALE' },
  { type: 'line', ref: 'T1', label: 'Ventes de marchandises', sign: '+', indent: 1 },
  { type: 'line', ref: 'T2', label: 'Achats de marchandises', sign: '-', indent: 1 },
  { type: 'line', ref: 'T3', label: 'Variation de stocks de marchandises', sign: '-', indent: 1 },
  { type: 'sig', ref: 'SIG1', label: 'MARGE COMMERCIALE (SIG 1)', sigNum: 1 },

  { type: 'separator', label: '' },

  // ── SIG 2 : Production de l'exercice ──
  { type: 'section', label: 'DÉTERMINATION DE LA PRODUCTION DE L\'EXERCICE' },
  { type: 'line', ref: 'T4', label: 'Production vendue', sign: '+', indent: 1 },
  { type: 'line', ref: 'T5', label: 'Travaux et services vendus', sign: '+', indent: 1 },
  { type: 'line', ref: 'T6', label: 'Production stockée (ou déstockage)', sign: '+', indent: 1 },
  { type: 'line', ref: 'T7', label: 'Production immobilisée', sign: '+', indent: 1 },
  { type: 'sig', ref: 'SIG2', label: 'PRODUCTION DE L\'EXERCICE (SIG 2)', sigNum: 2 },

  { type: 'separator', label: '' },

  // ── SIG 3 : Valeur Ajoutée ──
  { type: 'section', label: 'DÉTERMINATION DE LA VALEUR AJOUTÉE' },
  { type: 'line', ref: 'SIG1_REP', label: 'Marge commerciale', sign: '+', indent: 1 },
  { type: 'line', ref: 'SIG2_REP', label: 'Production de l\'exercice', sign: '+', indent: 1 },
  { type: 'line', ref: 'T8', label: 'Achats de matières premières et fournitures liées', sign: '-', indent: 1 },
  { type: 'line', ref: 'T9', label: 'Variation de stocks de matières premières', sign: '-', indent: 1 },
  { type: 'line', ref: 'T10', label: 'Autres achats et charges externes', sign: '-', indent: 1 },
  { type: 'sig', ref: 'SIG3', label: 'VALEUR AJOUTÉE (SIG 3)', sigNum: 3 },

  { type: 'separator', label: '' },

  // ── SIG 4 : EBE ──
  { type: 'section', label: 'DÉTERMINATION DE L\'EBE' },
  { type: 'line', ref: 'SIG3_REP', label: 'Valeur ajoutée', sign: '+', indent: 1 },
  { type: 'line', ref: 'T11', label: 'Subventions d\'exploitation', sign: '+', indent: 1 },
  { type: 'line', ref: 'T12', label: 'Impôts et taxes', sign: '-', indent: 1 },
  { type: 'line', ref: 'T13', label: 'Charges de personnel', sign: '-', indent: 1 },
  { type: 'sig', ref: 'SIG4', label: 'EXCÉDENT BRUT D\'EXPLOITATION (SIG 4)', sigNum: 4 },

  { type: 'separator', label: '' },

  // ── SIG 5 : Résultat d'exploitation ──
  { type: 'section', label: 'DÉTERMINATION DU RÉSULTAT D\'EXPLOITATION' },
  { type: 'line', ref: 'SIG4_REP', label: 'Excédent brut d\'exploitation', sign: '+', indent: 1 },
  { type: 'line', ref: 'T14', label: 'Reprises d\'amortissements, provisions et dépréciations', sign: '+', indent: 1 },
  { type: 'line', ref: 'T15', label: 'Transferts de charges d\'exploitation', sign: '+', indent: 1 },
  { type: 'line', ref: 'T16', label: 'Autres produits', sign: '+', indent: 1 },
  { type: 'line', ref: 'T17', label: 'Dotations aux amortissements, provisions et dépréciations', sign: '-', indent: 1 },
  { type: 'line', ref: 'T18', label: 'Autres charges', sign: '-', indent: 1 },
  { type: 'sig', ref: 'SIG5', label: 'RÉSULTAT D\'EXPLOITATION (SIG 5)', sigNum: 5 },

  { type: 'separator', label: '' },

  // ── SIG 6 : Résultat financier ──
  { type: 'section', label: 'DÉTERMINATION DU RÉSULTAT FINANCIER' },
  { type: 'line', ref: 'T19', label: 'Produits financiers', sign: '+', indent: 1 },
  { type: 'line', ref: 'T20', label: 'Reprises de provisions et dépréciations financières', sign: '+', indent: 1 },
  { type: 'line', ref: 'T21', label: 'Transferts de charges financières', sign: '+', indent: 1 },
  { type: 'line', ref: 'T22', label: 'Charges financières', sign: '-', indent: 1 },
  { type: 'line', ref: 'T23', label: 'Dotations aux provisions et dépréciations financières', sign: '-', indent: 1 },
  { type: 'sig', ref: 'SIG6', label: 'RÉSULTAT FINANCIER (SIG 6)', sigNum: 6 },

  { type: 'separator', label: '' },

  // ── SIG 7 : Résultat des activités ordinaires ──
  { type: 'sig', ref: 'SIG7', label: 'RÉSULTAT DES ACTIVITÉS ORDINAIRES (SIG 7)', sigNum: 7 },

  { type: 'separator', label: '' },

  // ── SIG 8 : Résultat HAO ──
  { type: 'section', label: 'DÉTERMINATION DU RÉSULTAT HAO' },
  { type: 'line', ref: 'T24', label: 'Produits des cessions d\'immobilisations', sign: '+', indent: 1 },
  { type: 'line', ref: 'T25', label: 'Autres produits HAO', sign: '+', indent: 1 },
  { type: 'line', ref: 'T26', label: 'Valeurs comptables des cessions d\'immobilisations', sign: '-', indent: 1 },
  { type: 'line', ref: 'T27', label: 'Autres charges HAO', sign: '-', indent: 1 },
  { type: 'sig', ref: 'SIG8', label: 'RÉSULTAT HAO (SIG 8)', sigNum: 8 },

  { type: 'separator', label: '' },

  // ── SIG 9 : Résultat net ──
  { type: 'section', label: 'DÉTERMINATION DU RÉSULTAT NET' },
  { type: 'line', ref: 'SIG7_REP', label: 'Résultat des activités ordinaires', sign: '+', indent: 1 },
  { type: 'line', ref: 'SIG8_REP', label: 'Résultat HAO', sign: '+', indent: 1 },
  { type: 'line', ref: 'T28', label: 'Participation des travailleurs', sign: '-', indent: 1 },
  { type: 'line', ref: 'T29', label: 'Impôts sur le résultat', sign: '-', indent: 1 },
  { type: 'sig', ref: 'SIG9', label: 'RÉSULTAT NET (SIG 9)', sigNum: 9 },
]

// ═══════════════════════════════════════
// Mapping comptes → lignes T (source CdR)
// ═══════════════════════════════════════
//
// Les données viennent EXACTEMENT des mêmes comptes que le CdR
// via liasseDataService.generateCompteResultat()
// On regroupe simplement différemment les REFs CdR en lignes T du SIG.

/** Map CdR ref → SIG T ref */
const CDR_TO_SIG: Record<string, string> = {
  // SIG1 composants
  TA: 'T1',   // Ventes de marchandises
  RA: 'T2',   // Achats de marchandises
  RB: 'T3',   // Variation stocks marchandises

  // SIG2 composants
  TB: 'T4',   // Production vendue (part 1)
  TC: 'T5',   // Travaux, services vendus → on met TC en T5
  TD: 'T6',   // Production stockée
  TE: 'T7',   // Production immobilisée

  // SIG3 composants
  RC: 'T8',   // Achats matières premières
  RD: 'T9',   // Variation stocks matières
  // T10 = RE + RF + RG + RH (autres achats + variations + transports + services ext.)

  // SIG4 composants
  TG: 'T11',  // Subventions d'exploitation
  RI: 'T12',  // Impôts et taxes
  RK: 'T13',  // Charges de personnel

  // SIG5 composants
  TI: 'T14',  // Reprises amort/provisions
  TH: 'T16',  // Autres produits
  RL: 'T17_A', // Dotations amort (part de T17)
  RM: 'T17_B', // Dotations provisions (part de T17)
  RJ: 'T18',  // Autres charges

  // SIG6 composants
  TJ: 'T19_A', // Revenus financiers
  TK: 'T19_B', // Gains de change
  TL: 'T20',  // Reprises provisions financières
  TM: 'T21',  // Transferts charges financières (= T15 reclassé en SIG5 aussi)
  RN: 'T22_A', // Frais financiers
  RO: 'T22_B', // Pertes de change
  RP: 'T23',  // Dotations provisions financières

  // SIG8 composants
  TN: 'T24',  // Produits cessions immo
  TO: 'T25',  // Autres produits HAO
  RQ: 'T26',  // VNC cessions
  RR: 'T27',  // Autres charges HAO

  // SIG9 composants
  RS: 'T29',  // Impôts sur résultat
  // T28 = participation travailleurs (compte 87, pas dans le CdR standard)
}

// ═══════════════════════════════════════
// Composant
// ═══════════════════════════════════════

interface SIGData {
  [ref: string]: { montant: number; montantN1: number }
}

interface EtatSoldesGestionProps {
  modeEdition?: boolean
}

const EtatSoldesGestion: React.FC<EtatSoldesGestionProps> = ({ modeEdition: _modeEdition = false }) => {
  const theme = useTheme()
  const [data, setData] = useState<SIGData>({})
  const [isAutoMode, setIsAutoMode] = useState(true)

  useEffect(() => {
    if (isAutoMode) {
      loadDataFromBalance()
    }
  }, [isAutoMode])

  /**
   * Charge les données CdR et les répartit en lignes T du SIG
   */
  const loadDataFromBalance = () => {
    const { charges, produits } = liasseDataService.generateCompteResultat()
    const newData: SIGData = {}

    // Helper: ajouter un montant à un ref SIG (cumul si multi-refs CdR → même T)
    const addToRef = (sigRef: string, montant: number, montantN1: number) => {
      if (!newData[sigRef]) {
        newData[sigRef] = { montant: 0, montantN1: 0 }
      }
      newData[sigRef].montant += montant
      newData[sigRef].montantN1 += montantN1
    }

    // Mapper les charges (valeurs positives = charges)
    charges.forEach((item: any) => {
      const cdRef = item.ref as string
      const montant = item.montant || 0    // positif = charge
      const montantN1 = item.montant_n1 || 0

      // Cas spéciaux : plusieurs refs CdR → une seule ligne T
      if (cdRef === 'RE' || cdRef === 'RF' || cdRef === 'RG' || cdRef === 'RH') {
        addToRef('T10', montant, montantN1)
      } else if (cdRef === 'RL' || cdRef === 'RM') {
        addToRef('T17', montant, montantN1)
      } else if (cdRef === 'RN' || cdRef === 'RO') {
        addToRef('T22', montant, montantN1)
      } else {
        const sigRef = CDR_TO_SIG[cdRef]
        if (sigRef) addToRef(sigRef, montant, montantN1)
      }
    })

    // Mapper les produits (valeurs positives = produits)
    produits.forEach((item: any) => {
      const cdRef = item.ref as string
      const montant = item.montant || 0
      const montantN1 = item.montant_n1 || 0

      // TF (produits accessoires) → ajouté à T4 (production vendue)
      if (cdRef === 'TF') {
        addToRef('T4', montant, montantN1)
      } else if (cdRef === 'TJ' || cdRef === 'TK') {
        addToRef('T19', montant, montantN1)
      } else if (cdRef === 'TM') {
        // TM = transferts charges financières → T21 en SIG6
        // Mais aussi utilisable comme T15 en SIG5 (transferts charges exploitation)
        // Dans SYSCOHADA, TM concerne les transferts charges financières uniquement
        addToRef('T21', montant, montantN1)
      } else {
        const sigRef = CDR_TO_SIG[cdRef]
        if (sigRef) addToRef(sigRef, montant, montantN1)
      }
    })

    // T15 (transferts charges exploitation) : pas de compte spécifique séparé dans le CdR
    // → initialisé à 0 si pas encore défini
    if (!newData['T15']) newData['T15'] = { montant: 0, montantN1: 0 }
    // T28 (participation travailleurs, compte 87) : pas dans le CdR standard
    if (!newData['T28']) newData['T28'] = { montant: 0, montantN1: 0 }

    setData(newData)
  }

  // ═══════════════════════════════════════
  // Calcul cascade des SIG
  // ═══════════════════════════════════════

  const sigValues = useMemo(() => {
    const vals: SIGData = {}

    const get = (ref: string): { montant: number; montantN1: number } => {
      return data[ref] || { montant: 0, montantN1: 0 }
    }

    const makeVal = (montant: number, montantN1: number) => ({ montant, montantN1 })

    // SIG1 = T1 - T2 - T3
    const t1 = get('T1'), t2 = get('T2'), t3 = get('T3')
    vals.SIG1 = makeVal(
      t1.montant - t2.montant - t3.montant,
      t1.montantN1 - t2.montantN1 - t3.montantN1
    )

    // SIG2 = T4 + T5 + T6 + T7
    const t4 = get('T4'), t5 = get('T5'), t6 = get('T6'), t7 = get('T7')
    vals.SIG2 = makeVal(
      t4.montant + t5.montant + t6.montant + t7.montant,
      t4.montantN1 + t5.montantN1 + t6.montantN1 + t7.montantN1
    )

    // SIG3 = SIG1 + SIG2 - T8 - T9 - T10
    const t8 = get('T8'), t9 = get('T9'), t10 = get('T10')
    vals.SIG3 = makeVal(
      vals.SIG1.montant + vals.SIG2.montant - t8.montant - t9.montant - t10.montant,
      vals.SIG1.montantN1 + vals.SIG2.montantN1 - t8.montantN1 - t9.montantN1 - t10.montantN1
    )

    // SIG4 = SIG3 + T11 - T12 - T13
    const t11 = get('T11'), t12 = get('T12'), t13 = get('T13')
    vals.SIG4 = makeVal(
      vals.SIG3.montant + t11.montant - t12.montant - t13.montant,
      vals.SIG3.montantN1 + t11.montantN1 - t12.montantN1 - t13.montantN1
    )

    // SIG5 = SIG4 + T14 + T15 + T16 - T17 - T18
    const t14 = get('T14'), t15 = get('T15'), t16 = get('T16'), t17 = get('T17'), t18 = get('T18')
    vals.SIG5 = makeVal(
      vals.SIG4.montant + t14.montant + t15.montant + t16.montant - t17.montant - t18.montant,
      vals.SIG4.montantN1 + t14.montantN1 + t15.montantN1 + t16.montantN1 - t17.montantN1 - t18.montantN1
    )

    // SIG6 = T19 + T20 + T21 - T22 - T23
    const t19 = get('T19'), t20 = get('T20'), t21 = get('T21'), t22 = get('T22'), t23 = get('T23')
    vals.SIG6 = makeVal(
      t19.montant + t20.montant + t21.montant - t22.montant - t23.montant,
      t19.montantN1 + t20.montantN1 + t21.montantN1 - t22.montantN1 - t23.montantN1
    )

    // SIG7 = SIG5 + SIG6
    vals.SIG7 = makeVal(
      vals.SIG5.montant + vals.SIG6.montant,
      vals.SIG5.montantN1 + vals.SIG6.montantN1
    )

    // SIG8 = T24 + T25 - T26 - T27
    const t24 = get('T24'), t25 = get('T25'), t26 = get('T26'), t27 = get('T27')
    vals.SIG8 = makeVal(
      t24.montant + t25.montant - t26.montant - t27.montant,
      t24.montantN1 + t25.montantN1 - t26.montantN1 - t27.montantN1
    )

    // SIG9 = SIG7 + SIG8 - T28 - T29
    const t28 = get('T28'), t29 = get('T29')
    vals.SIG9 = makeVal(
      vals.SIG7.montant + vals.SIG8.montant - t28.montant - t29.montant,
      vals.SIG7.montantN1 + vals.SIG8.montantN1 - t28.montantN1 - t29.montantN1
    )

    // Refs de report (SIG_REP) pour les lignes de cascade
    vals.SIG1_REP = vals.SIG1
    vals.SIG2_REP = vals.SIG2
    vals.SIG3_REP = vals.SIG3
    vals.SIG4_REP = vals.SIG4
    vals.SIG7_REP = vals.SIG7
    vals.SIG8_REP = vals.SIG8

    return vals
  }, [data])

  // Données fusionnées : lignes T + SIG calculés
  const mergedData: SIGData = { ...data, ...sigValues }

  // ═══════════════════════════════════════
  // Contrôle de cohérence SIG9 vs CdR XI
  // ═══════════════════════════════════════

  const resultatNet = sigValues.SIG9?.montant || 0
  const resultatCdR = useMemo(() => {
    // Recalculer XI à partir des mêmes données CdR
    const { charges, produits } = liasseDataService.generateCompteResultat()
    const totalProduits = produits.reduce((sum: number, r: any) => sum + (r.montant || 0), 0)
    const totalCharges = charges.reduce((sum: number, r: any) => sum + (r.montant || 0), 0)
    return totalProduits - totalCharges
  }, [data])

  const ecartCoherence = Math.abs(resultatNet - resultatCdR)
  const isCoherent = ecartCoherence < 1 // Tolérance < 1 FCFA

  // ═══════════════════════════════════════
  // Formatage
  // ═══════════════════════════════════════

  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === 0) return '-'
    const formatted = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(value))
    return value < 0 ? `(${formatted})` : formatted
  }

  // ═══════════════════════════════════════
  // Rendu des lignes
  // ═══════════════════════════════════════

  const renderRow = (item: SIGItem, index: number) => {
    if (item.type === 'separator') {
      return (
        <TableRow key={`sep-${index}`}>
          <TableCell colSpan={5} sx={{ py: 0.5, border: 'none' }} />
        </TableRow>
      )
    }

    if (item.type === 'section') {
      return (
        <TableRow key={`sec-${index}`}>
          <TableCell colSpan={5} sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            fontWeight: 700,
            fontSize: '0.85rem',
            color: theme.palette.primary.dark,
            py: 1,
            textAlign: 'center',
          }}>
            {item.label}
          </TableCell>
        </TableRow>
      )
    }

    const ref = item.ref || ''
    const rowData = mergedData[ref] || { montant: 0, montantN1: 0 }
    const isSIG = item.type === 'sig'

    const getResultColor = (value: number) => {
      if (!isSIG) return 'inherit'
      if (value > 0) return theme.palette.success.main
      if (value < 0) return theme.palette.error.main
      return 'inherit'
    }

    return (
      <TableRow
        key={ref}
        sx={{
          backgroundColor: isSIG
            ? item.sigNum === 9
              ? alpha(theme.palette.primary.main, 0.06)
              : alpha(theme.palette.warning.main, 0.04)
            : 'transparent',
          '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.04) },
        }}
      >
        {/* Réf */}
        <TableCell sx={{
          width: 60,
          fontWeight: isSIG ? 700 : 400,
          fontFamily: 'monospace',
          fontSize: '0.8rem',
          color: isSIG ? getResultColor(rowData.montant) : 'text.secondary',
        }}>
          {ref.replace('_REP', '')}
        </TableCell>

        {/* Libellé */}
        <TableCell sx={{
          pl: (item.indent || 0) * 3,
          fontWeight: isSIG ? 700 : 400,
          fontSize: isSIG ? '0.9rem' : '0.85rem',
        }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <span>{item.label}</span>
            {isSIG && item.sigNum === 9 && rowData.montant !== 0 && (
              rowData.montant > 0
                ? <ProfitIcon color="success" fontSize="small" />
                : <LossIcon color="error" fontSize="small" />
            )}
          </Stack>
        </TableCell>

        {/* Signe (+/-) */}
        <TableCell align="center" sx={{
          width: 40,
          color: item.sign === '+' ? theme.palette.success.main : item.sign === '-' ? theme.palette.error.main : 'inherit',
          fontWeight: 600,
        }}>
          {item.sign || ''}
        </TableCell>

        {/* Exercice N */}
        <TableCell align="right" sx={{
          width: 150,
          backgroundColor: alpha(theme.palette.info.main, 0.04),
          fontWeight: isSIG ? 700 : 400,
          color: isSIG ? getResultColor(rowData.montant) : 'inherit',
          fontSize: isSIG && item.sigNum === 9 ? '0.95rem' : '0.875rem',
        }}>
          {formatNumber(rowData.montant)}
        </TableCell>

        {/* Exercice N-1 */}
        <TableCell align="right" sx={{
          width: 150,
          fontWeight: isSIG ? 700 : 400,
          fontSize: '0.875rem',
        }}>
          {formatNumber(rowData.montantN1)}
        </TableCell>
      </TableRow>
    )
  }

  // ═══════════════════════════════════════
  // Indicateurs KPI
  // ═══════════════════════════════════════

  const va = sigValues.SIG3?.montant || 0
  const ebe = sigValues.SIG4?.montant || 0
  const re = sigValues.SIG5?.montant || 0
  const isProfit = resultatNet > 0

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
          <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
            SOLDES INTERMÉDIAIRES DE GESTION (en FCFA)
          </Typography>

          <Stack direction="row" spacing={1}>
            <Tooltip title={isAutoMode ? 'Mode automatique (données de la balance)' : 'Mode manuel'}>
              <Button
                variant={isAutoMode ? 'contained' : 'outlined'}
                size="small"
                startIcon={<AutoIcon />}
                onClick={() => {
                  setIsAutoMode(!isAutoMode)
                  if (!isAutoMode) loadDataFromBalance()
                }}
                color="primary"
              >
                {isAutoMode ? 'Auto' : 'Manuel'}
              </Button>
            </Tooltip>

            <Tooltip title="Actualiser depuis la balance">
              <IconButton size="small" onClick={loadDataFromBalance}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

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

        {/* Chips KPI */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Chip
            icon={isProfit ? <ProfitIcon /> : <LossIcon />}
            label={`Résultat Net: ${formatNumber(resultatNet)}`}
            color={isProfit ? 'success' : 'error'}
            variant="outlined"
          />
          <Chip
            label={`VA: ${formatNumber(va)}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`EBE: ${formatNumber(ebe)}`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`RE: ${formatNumber(re)}`}
            color={re >= 0 ? 'success' : 'error'}
            variant="outlined"
          />
          {isAutoMode && (
            <Chip icon={<AutoIcon />} label="Synchronisé" color="info" size="small" />
          )}
        </Stack>
      </Box>

      {/* Contrôle de cohérence */}
      <Alert
        severity={isCoherent ? 'success' : 'error'}
        icon={isCoherent ? <CheckIcon /> : <WarningIcon />}
        sx={{ mb: 2 }}
      >
        <Typography variant="body2">
          <strong>Contrôle de cohérence :</strong>{' '}
          SIG 9 (Résultat Net) = {formatNumber(resultatNet)}
          {' | '}
          CdR XI (Résultat Net) = {formatNumber(resultatCdR)}
          {isCoherent
            ? ' — Concordance vérifiée'
            : ` — Écart de ${formatNumber(ecartCoherence)} détecté !`}
        </Typography>
      </Alert>

      {/* Tableau SIG */}
      <TableContainer sx={{ mb: 3 }}>
        <Table size="small" sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Réf</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem' }}>LIBELLÉ</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>+/−</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Exercice N</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Exercice N-1</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {SIG_STRUCTURE.map((item, index) => renderRow(item, index))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}

export default EtatSoldesGestion
