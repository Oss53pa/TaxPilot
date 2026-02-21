/**
 * Composant Compte de Resultat - SYSCOHADA
 * Valeurs calculees dynamiquement depuis la balance importee (N et N-1)
 */

import React, { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  TextField,
  Grid,
  // Tooltip,
} from '@mui/material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { useBalanceData } from '@/hooks/useBalanceData'
import { getLatestBalanceN1 } from '@/services/balanceStorageService'

interface CompteResultatProps {
  modeEdition?: boolean
}

// ────────── Static row structure (no hardcoded values) ──────────

interface LigneStructure {
  ref: string
  libelle: string
  comptes?: string[]
  /** 'credit' = bal.c (products), 'debit' = -bal.d (charges), 'net' = bal.d - bal.c (variation stocks) */
  sign?: 'credit' | 'debit' | 'net'
  isHeader?: boolean
  isSubTotal?: boolean
  isImportant?: boolean
  isTotalGeneral?: boolean
  /** refs of children to sum for total/subtotal rows */
  totalOf?: string[]
  level: number
}

const LIGNES_STRUCTURE: LigneStructure[] = [
  // PRODUITS
  {
    ref: 'RA',
    libelle: 'ACTIVITE D\'EXPLOITATION',
    isHeader: true,
    level: 0,
  },
  {
    ref: 'RB',
    libelle: 'Ventes de marchandises',
    comptes: ['701', '702', '703', '704', '705', '706', '707'],
    sign: 'credit',
    level: 1,
  },
  {
    ref: 'RC',
    libelle: 'Production vendue',
    comptes: ['704', '705', '706'],
    sign: 'credit',
    level: 1,
  },
  {
    ref: 'RD',
    libelle: 'Production stockee (ou destockage)',
    comptes: ['73'],
    sign: 'net',
    level: 1,
  },
  {
    ref: 'RE',
    libelle: 'Production immobilisee',
    comptes: ['72'],
    sign: 'credit',
    level: 1,
  },
  {
    ref: 'RF',
    libelle: 'Subventions d\'exploitation',
    comptes: ['71'],
    sign: 'credit',
    level: 1,
  },
  {
    ref: 'RG',
    libelle: 'Autres produits',
    comptes: ['75', '758'],
    sign: 'credit',
    level: 1,
  },
  {
    ref: 'RH',
    libelle: 'CHIFFRE D\'AFFAIRES (RB+RC)',
    totalOf: ['RB', 'RC'],
    isSubTotal: true,
    level: 0,
  },

  // CHARGES D'EXPLOITATION
  {
    ref: 'TA',
    libelle: 'Achats de marchandises',
    comptes: ['601', '602', '603', '604', '605', '608'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'TB',
    libelle: 'Variation de stocks de marchandises',
    comptes: ['6031'],
    sign: 'net',
    level: 1,
  },
  {
    ref: 'TC',
    libelle: 'Achats de matieres premieres',
    comptes: ['601', '602'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'TD',
    libelle: 'Variation de stocks de matieres premieres',
    comptes: ['6032'],
    sign: 'net',
    level: 1,
  },
  {
    ref: 'TE',
    libelle: 'Autres achats',
    comptes: ['604', '605', '608'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'TF',
    libelle: 'Transports',
    comptes: ['61'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'TG',
    libelle: 'Services exterieurs',
    comptes: ['62', '63'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'TH',
    libelle: 'Impots et taxes',
    comptes: ['64'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'TI',
    libelle: 'Charges de personnel',
    comptes: ['66'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'TJ',
    libelle: 'VALEUR AJOUTEE',
    // VA = CA + RD + RE + RF + RG + TA + TB + TC + TD + TE + TF + TG + TH
    totalOf: ['RH', 'RD', 'RE', 'RF', 'RG', 'TA', 'TB', 'TC', 'TD', 'TE', 'TF', 'TG', 'TH'],
    isSubTotal: true,
    level: 0,
  },
  {
    ref: 'TK',
    libelle: 'EXCEDENT BRUT D\'EXPLOITATION',
    // EBE = VA - Charges personnel
    totalOf: ['TJ', 'TI'],
    isSubTotal: true,
    level: 0,
  },

  // DOTATIONS ET REPRISES
  {
    ref: 'TL',
    libelle: 'Dotations aux amortissements et provisions',
    comptes: ['681', '691'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'TM',
    libelle: 'Reprises de provisions',
    comptes: ['791', '798'],
    sign: 'credit',
    level: 1,
  },
  {
    ref: 'TN',
    libelle: 'RESULTAT D\'EXPLOITATION',
    // RE = EBE + dotations + reprises
    totalOf: ['TK', 'TL', 'TM'],
    isSubTotal: true,
    isImportant: true,
    level: 0,
  },

  // RESULTAT FINANCIER
  {
    ref: 'UA',
    libelle: 'ACTIVITE FINANCIERE',
    isHeader: true,
    level: 0,
  },
  {
    ref: 'UB',
    libelle: 'Produits financiers',
    comptes: ['77'],
    sign: 'credit',
    level: 1,
  },
  {
    ref: 'UC',
    libelle: 'Charges financieres',
    comptes: ['67'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'UD',
    libelle: 'RESULTAT FINANCIER',
    totalOf: ['UB', 'UC'],
    isSubTotal: true,
    level: 0,
  },
  {
    ref: 'UE',
    libelle: 'RESULTAT COURANT AVANT IMPOTS',
    totalOf: ['TN', 'UD'],
    isSubTotal: true,
    isImportant: true,
    level: 0,
  },

  // HAO
  {
    ref: 'VA',
    libelle: 'HORS ACTIVITES ORDINAIRES (HAO)',
    isHeader: true,
    level: 0,
  },
  {
    ref: 'VB',
    libelle: 'Produits HAO',
    comptes: ['82', '84', '86', '88'],
    sign: 'credit',
    level: 1,
  },
  {
    ref: 'VC',
    libelle: 'Charges HAO',
    comptes: ['81', '83', '85'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'VD',
    libelle: 'RESULTAT HAO',
    totalOf: ['VB', 'VC'],
    isSubTotal: true,
    level: 0,
  },

  // IMPOTS
  {
    ref: 'WA',
    libelle: 'Participation des travailleurs',
    comptes: ['87'],
    sign: 'debit',
    level: 1,
  },
  {
    ref: 'WB',
    libelle: 'Impots sur le resultat',
    comptes: ['89'],
    sign: 'debit',
    level: 1,
  },

  // RESULTAT NET
  {
    ref: 'XZ',
    libelle: 'RESULTAT NET DE L\'EXERCICE',
    totalOf: ['UE', 'VD', 'WA', 'WB'],
    isTotalGeneral: true,
    level: 0,
  },
]

// ────────── Component ──────────

const CompteResultat: React.FC<CompteResultatProps> = ({ modeEdition: _modeEdition = false }) => {
  // Balance N
  const bal = useBalanceData()

  // Balance N-1
  const n1Entries = useMemo(() => {
    const stored = getLatestBalanceN1()
    return stored?.entries?.length ? stored.entries : []
  }, [])

  // N-1 helpers
  const sumDebitN1 = (prefixes: string[]) => Math.round(
    n1Entries.filter(e => prefixes.some(p => e.compte.startsWith(p)))
      .reduce((s, e) => s + Math.max(0, (e.solde_debit || e.debit || 0) - (e.solde_credit || e.credit || 0)), 0)
  )
  const sumCreditN1 = (prefixes: string[]) => Math.round(
    n1Entries.filter(e => prefixes.some(p => e.compte.startsWith(p)))
      .reduce((s, e) => s + Math.max(0, (e.solde_credit || e.credit || 0) - (e.solde_debit || e.debit || 0)), 0)
  )

  // Compute all values from balance data
  const lignesCompteResultat = useMemo(() => {
    // First pass: compute leaf-node values
    const valuesN: Record<string, number | null> = {}
    const valuesN1: Record<string, number | null> = {}

    for (const ligne of LIGNES_STRUCTURE) {
      if (ligne.isHeader) {
        valuesN[ligne.ref] = null
        valuesN1[ligne.ref] = null
        continue
      }

      if (ligne.comptes && ligne.sign) {
        const comptes = ligne.comptes
        switch (ligne.sign) {
          case 'credit':
            valuesN[ligne.ref] = bal.c(comptes)
            valuesN1[ligne.ref] = sumCreditN1(comptes)
            break
          case 'debit':
            valuesN[ligne.ref] = -bal.d(comptes)
            valuesN1[ligne.ref] = -sumDebitN1(comptes)
            break
          case 'net':
            // Variation stocks: debit - credit (can be positive or negative)
            valuesN[ligne.ref] = bal.d(comptes) - bal.c(comptes)
            valuesN1[ligne.ref] = sumDebitN1(comptes) - sumCreditN1(comptes)
            break
        }
      }
    }

    // Second pass: compute totals/subtotals (order matters - structure is top-down)
    for (const ligne of LIGNES_STRUCTURE) {
      if (ligne.totalOf) {
        let sumN = 0
        let sumN1 = 0
        for (const childRef of ligne.totalOf) {
          sumN += valuesN[childRef] ?? 0
          sumN1 += valuesN1[childRef] ?? 0
        }
        valuesN[ligne.ref] = Math.round(sumN)
        valuesN1[ligne.ref] = Math.round(sumN1)
      }
    }

    // Build final array with computed values
    return LIGNES_STRUCTURE.map(ligne => ({
      ref: ligne.ref,
      libelle: ligne.libelle,
      exerciceN: valuesN[ligne.ref] ?? null,
      exerciceN1: valuesN1[ligne.ref] ?? null,
      comptes: ligne.comptes,
      isHeader: ligne.isHeader,
      isSubTotal: ligne.isSubTotal,
      isImportant: ligne.isImportant,
      isTotalGeneral: ligne.isTotalGeneral,
      level: ligne.level,
    }))
  }, [bal, n1Entries]) // eslint-disable-line react-hooks/exhaustive-deps

  const formatMontant = (montant: number | null) => {
    if (montant === null) return ''
    if (montant === 0) return '-'

    const isNegative = montant < 0
    const absValue = Math.abs(montant)
    const formatted = new Intl.NumberFormat('fr-FR').format(absValue)

    return isNegative ? `(${formatted})` : formatted
  }

  const getRowStyle = (ligne: any) => {
    if (ligne.isTotalGeneral) {
      return {
        backgroundColor: '#22c55e',
        color: 'white',
        fontWeight: 700,
      }
    }
    if (ligne.isImportant) {
      return {
        backgroundColor: '#fffbeb',
        fontWeight: 700,
        borderTop: '2px solid #f59e0b',
        borderBottom: '2px solid #f59e0b',
      }
    }
    if (ligne.isSubTotal) {
      return {
        backgroundColor: P.primary50,
        fontWeight: 700,
      }
    }
    if (ligne.isHeader) {
      return {
        backgroundColor: P.primary100,
        fontWeight: 700,
      }
    }
    return {}
  }

  const getTextColor = (montant: number | null) => {
    if (montant === null) return 'inherit'
    return montant < 0 ? 'error.main' : 'success.dark'
  }

  // Calcul des ratios from actual computed values
  const ratios = useMemo(() => {
    const findVal = (ref: string) => {
      const row = lignesCompteResultat.find(l => l.ref === ref)
      return row?.exerciceN ?? 0
    }
    const ca = findVal('RH')
    const va = findVal('TJ')
    const ebe = findVal('TK')
    const re = findVal('TN')
    const rn = findVal('XZ')

    return {
      tauxVA: ca !== 0 ? (va / ca * 100).toFixed(1) : '0.0',
      tauxEBE: ca !== 0 ? (ebe / ca * 100).toFixed(1) : '0.0',
      tauxRE: ca !== 0 ? (re / ca * 100).toFixed(1) : '0.0',
      tauxRN: ca !== 0 ? (rn / ca * 100).toFixed(1) : '0.0',
    }
  }, [lignesCompteResultat])

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'secondary.main' }}>
        COMPTE DE RESULTAT
      </Typography>

      <Grid container spacing={3}>
        {/* Tableau principal */}
        <Grid item xs={12} lg={9}>
          <TableContainer component={Paper} sx={{ border: '2px solid #8b5cf6' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#8b5cf6' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 700, width: '60px' }}>Ref</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700 }}>Libelle</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                    Exercice N<br />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      2024
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                    Exercice N-1<br />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      2023
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lignesCompteResultat.map((ligne, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      ...getRowStyle(ligne),
                      '&:hover': {
                        backgroundColor: ligne.isHeader || ligne.isSubTotal || ligne.isTotalGeneral
                          ? undefined
                          : 'action.hover'
                      }
                    }}
                  >
                    <TableCell sx={{ fontWeight: ligne.isSubTotal || ligne.isTotalGeneral ? 700 : 400 }}>
                      {ligne.ref}
                    </TableCell>
                    <TableCell sx={{
                      fontWeight: ligne.isHeader || ligne.isSubTotal || ligne.isTotalGeneral ? 700 : 400,
                      pl: ligne.level * 3,
                    }}>
                      {ligne.libelle}
                      {ligne.comptes && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Comptes: {ligne.comptes.join(', ')}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      {_modeEdition && ligne.exerciceN !== null && !ligne.isSubTotal && !ligne.isTotalGeneral ? (
                        <TextField
                          size="small"
                          type="number"
                          defaultValue={ligne.exerciceN}
                          sx={{ width: '120px' }}
                          variant="standard"
                          inputProps={{
                            style: {
                              textAlign: 'right',
                              fontSize: '0.875rem',
                              fontFamily: 'monospace'
                            }
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: ligne.isSubTotal || ligne.isTotalGeneral ? 700 : 500,
                            color: ligne.isTotalGeneral ? 'inherit' : getTextColor(ligne.exerciceN)
                          }}
                        >
                          {formatMontant(ligne.exerciceN)}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: ligne.isSubTotal || ligne.isTotalGeneral ? 700 : 500,
                          color: ligne.isTotalGeneral ? 'inherit' : getTextColor(ligne.exerciceN1)
                        }}
                      >
                        {formatMontant(ligne.exerciceN1)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Panneau des ratios */}
        <Grid item xs={12} lg={3}>
          <Paper sx={{ p: 2, border: '2px solid #8b5cf6' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'secondary.main' }}>
              Ratios d'exploitation
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Taux de valeur ajoutee
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {ratios.tauxVA}%
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Taux d'EBE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {ratios.tauxEBE}%
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Taux de resultat d'exploitation
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                  {ratios.tauxRE}%
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Taux de resultat net
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                  {ratios.tauxRN}%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Analyse:</strong> Les ratios sont calcules automatiquement
                a partir des donnees de la balance importee.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Legende */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Legende:</strong> Les montants sont exprimes en FCFA.
          Les charges sont presentees entre parentheses.
          Les soldes intermediaires de gestion sont mis en evidence.
        </Typography>
      </Box>
    </Box>
  )
}

export default CompteResultat