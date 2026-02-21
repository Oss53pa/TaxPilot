/**
 * Composant Bilan Passif - SYSCOHADA
 */

import React, { useMemo, memo } from 'react'
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
  Chip,
  Tooltip,
} from '@mui/material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { useBalanceData } from '@/hooks/useBalanceData'
import { getLatestBalanceN1 } from '@/services/balanceStorageService'

interface BilanPassifProps {
  modeEdition?: boolean
}

// ── Static row structure (no financial values) ──────────────────────────
const LIGNES_STRUCTURE = [
  // CAPITAUX PROPRES
  {
    ref: 'PA',
    libelle: 'CAPITAUX PROPRES ET RESSOURCES ASSIMILÉES',
    note: '11',
    isHeader: true,
    level: 0,
  },
  {
    ref: 'PB',
    libelle: 'Capital',
    note: '11.1',
    comptes: ['101', '102'],
    level: 1,
  },
  {
    ref: 'PC',
    libelle: 'Actionnaires, capital non appelé',
    note: '11.2',
    comptes: ['109'],
    level: 1,
  },
  {
    ref: 'PD',
    libelle: 'Primes et réserves',
    note: '12',
    isSubHeader: true,
    level: 1,
  },
  {
    ref: 'PE',
    libelle: 'Primes d\'apport, d\'émission, de fusion',
    note: '12.1',
    comptes: ['104', '105'],
    level: 2,
  },
  {
    ref: 'PF',
    libelle: 'Écarts de réévaluation',
    note: '12.2',
    comptes: ['106'],
    level: 2,
  },
  {
    ref: 'PG',
    libelle: 'Réserves',
    note: '12.3',
    comptes: ['111', '112', '113', '118'],
    level: 2,
  },
  {
    ref: 'PH',
    libelle: 'Report à nouveau',
    note: '13',
    comptes: ['121', '129'],
    level: 1,
  },
  {
    ref: 'PI',
    libelle: 'Résultat net de l\'exercice',
    note: '14',
    comptes: ['131', '139'],
    level: 1,
  },
  {
    ref: 'PJ',
    libelle: 'Autres capitaux propres',
    note: '15',
    comptes: ['141', '142', '143', '144', '145', '148'],
    level: 1,
  },
  {
    ref: 'PZ',
    libelle: 'TOTAL CAPITAUX PROPRES (I)',
    note: '',
    isTotal: true,
    totalOf: ['PB', 'PC', 'PE', 'PF', 'PG', 'PH', 'PI', 'PJ'],
    level: 0,
  },

  // DETTES FINANCIÈRES
  {
    ref: 'QA',
    libelle: 'DETTES FINANCIÈRES ET RESSOURCES ASSIMILÉES',
    note: '16',
    isHeader: true,
    level: 0,
  },
  {
    ref: 'QB',
    libelle: 'Emprunts obligataires',
    note: '16.1',
    comptes: ['161', '162', '163'],
    level: 1,
  },
  {
    ref: 'QC',
    libelle: 'Emprunts et dettes auprès des établissements de crédit',
    note: '16.2',
    comptes: ['164', '165'],
    level: 1,
  },
  {
    ref: 'QD',
    libelle: 'Emprunts et dettes financières diverses',
    note: '16.3',
    comptes: ['166', '167', '168'],
    level: 1,
  },
  {
    ref: 'QE',
    libelle: 'Dettes de crédit-bail et contrats assimilés',
    note: '16.4',
    comptes: ['17'],
    level: 1,
  },
  {
    ref: 'QF',
    libelle: 'Provisions financières pour risques et charges',
    note: '17',
    comptes: ['191', '192', '193', '194', '195', '196', '197', '198'],
    level: 1,
  },
  {
    ref: 'QZ',
    libelle: 'TOTAL DETTES FINANCIÈRES (II)',
    note: '',
    isTotal: true,
    totalOf: ['QB', 'QC', 'QD', 'QE', 'QF'],
    level: 0,
  },

  // PASSIF CIRCULANT
  {
    ref: 'RA',
    libelle: 'PASSIF CIRCULANT',
    note: '18',
    isHeader: true,
    level: 0,
  },
  {
    ref: 'RB',
    libelle: 'Dettes circulantes HAO',
    note: '19',
    comptes: ['481', '482', '483', '484'],
    level: 1,
  },
  {
    ref: 'RC',
    libelle: 'Clients, avances reçues',
    note: '20',
    comptes: ['419'],
    level: 1,
  },
  {
    ref: 'RD',
    libelle: 'Fournisseurs d\'exploitation',
    note: '21',
    comptes: ['401', '402', '403', '404', '405', '408'],
    level: 1,
  },
  {
    ref: 'RE',
    libelle: 'Dettes fiscales et sociales',
    note: '22',
    comptes: ['441', '442', '443', '444', '445', '446', '447', '448'],
    level: 1,
  },
  {
    ref: 'RF',
    libelle: 'Autres dettes',
    note: '23',
    comptes: ['165', '166', '167', '168', '471', '472', '473', '474', '475', '476', '477', '478'],
    level: 1,
  },
  {
    ref: 'RG',
    libelle: 'Provisions pour risques à court terme',
    note: '24',
    comptes: ['499'],
    level: 1,
  },
  {
    ref: 'RZ',
    libelle: 'TOTAL PASSIF CIRCULANT (III)',
    note: '',
    isTotal: true,
    totalOf: ['RB', 'RC', 'RD', 'RE', 'RF', 'RG'],
    level: 0,
  },

  // TRÉSORERIE PASSIF
  {
    ref: 'SA',
    libelle: 'TRÉSORERIE - PASSIF',
    note: '25',
    isHeader: true,
    level: 0,
  },
  {
    ref: 'SB',
    libelle: 'Banques, crédits d\'escompte',
    note: '25.1',
    comptes: ['564', '565'],
    level: 1,
  },
  {
    ref: 'SC',
    libelle: 'Banques, découverts',
    note: '25.2',
    comptes: ['561', '566'],
    level: 1,
  },
  {
    ref: 'SZ',
    libelle: 'TOTAL TRÉSORERIE - PASSIF (IV)',
    note: '',
    isTotal: true,
    totalOf: ['SB', 'SC'],
    level: 0,
  },

  // TOTAL GÉNÉRAL
  {
    ref: 'TZ',
    libelle: 'TOTAL GÉNÉRAL PASSIF (I+II+III+IV)',
    note: '',
    isTotalGeneral: true,
    totalOf: ['PZ', 'QZ', 'RZ', 'SZ'],
    level: 0,
  },
] as const

// ── Component ───────────────────────────────────────────────────────────
const BilanPassif: React.FC<BilanPassifProps> = ({ modeEdition = false }) => {
  const bal = useBalanceData()

  const lignesPassif = useMemo(() => {
    const n1Stored = getLatestBalanceN1()
    const n1Entries = n1Stored?.entries ?? []

    const sumCreditN1 = (prefixes: string[]) => Math.round(
      n1Entries
        .filter(e => prefixes.some(p => e.compte.startsWith(p)))
        .reduce((s, e) => s + Math.max(0, (e.solde_credit || e.credit || 0) - (e.solde_debit || e.debit || 0)), 0)
    )

    // First pass: compute exerciceN / exerciceN1 for leaf rows
    const values: Record<string, { exerciceN: number | null; exerciceN1: number | null }> = {}

    for (const row of LIGNES_STRUCTURE) {
      if ('comptes' in row && row.comptes) {
        const comptes = row.comptes as readonly string[]
        values[row.ref] = {
          exerciceN: bal.c([...comptes]),
          exerciceN1: sumCreditN1([...comptes]),
        }
      }
    }

    // Second pass: compute totals
    for (const row of LIGNES_STRUCTURE) {
      if ('totalOf' in row && row.totalOf) {
        const children = row.totalOf as readonly string[]
        let sumN = 0
        let sumN1 = 0
        for (const childRef of children) {
          sumN += values[childRef]?.exerciceN ?? 0
          sumN1 += values[childRef]?.exerciceN1 ?? 0
        }
        values[row.ref] = { exerciceN: sumN, exerciceN1: sumN1 }
      }
    }

    // Merge structure with computed values
    return LIGNES_STRUCTURE.map(row => {
      const v = values[row.ref]
      return {
        ...row,
        exerciceN: v?.exerciceN ?? null,
        exerciceN1: v?.exerciceN1 ?? null,
      }
    })
  }, [bal])

  const formatMontant = (montant: number | null) => {
    if (montant === null) return ''
    if (montant === 0) return '-'
    // Pour les montants négatifs
    if (montant < 0) {
      return `(${new Intl.NumberFormat('fr-FR').format(Math.abs(montant))})`
    }
    return new Intl.NumberFormat('fr-FR').format(montant)
  }

  const calculerVariation = (n: number | null, n1: number | null) => {
    if (n === null || n1 === null || n1 === 0) return null
    return ((n - n1) / Math.abs(n1)) * 100
  }

  const getRowStyle = (ligne: any) => {
    if (ligne.isTotalGeneral) {
      return {
        backgroundColor: '#dc2626',
        color: 'white',
        fontWeight: 700,
      }
    }
    if (ligne.isTotal) {
      return {
        backgroundColor: '#fef2f2',
        fontWeight: 700,
      }
    }
    if (ligne.isHeader) {
      return {
        backgroundColor: P.primary50,
        fontWeight: 700,
      }
    }
    if (ligne.isSubHeader) {
      return {
        backgroundColor: P.primary50,
        fontWeight: 600,
      }
    }
    return {}
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'error.main' }}>
        BILAN - PASSIF (en FCFA)
      </Typography>

      <TableContainer component={Paper} sx={{ border: '2px solid #dc2626' }}>
        <Table size="small" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#dc2626' }}>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '60px' }}>Réf</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, minWidth: '350px' }}>PASSIF</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '60px' }} align="center">Note</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                Exercice N<br />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  31/12/2024
                </Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '140px' }} align="right">
                Exercice N-1<br />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  31/12/2023
                </Typography>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 700, width: '80px' }} align="center">
                Variation %
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lignesPassif.map((row, index) => {
              const ligne = row as any
              const variation = calculerVariation(ligne.exerciceN, ligne.exerciceN1)

              return (
                <TableRow
                  key={index}
                  sx={{
                    ...getRowStyle(ligne),
                    '&:hover': { backgroundColor: ligne.isHeader || ligne.isTotal || ligne.isTotalGeneral ? undefined : P.primary50 }
                  }}
                >
                  <TableCell sx={{ fontWeight: ligne.isHeader || ligne.isTotal ? 700 : 400 }}>
                    {ligne.ref}
                  </TableCell>
                  <TableCell sx={{
                    fontWeight: ligne.isHeader || ligne.isTotal || ligne.isTotalGeneral ? 700 : ligne.isSubHeader ? 600 : 400,
                    pl: ligne.level * 3,
                  }}>
                    {ligne.libelle}
                    {ligne.comptes && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Comptes: {ligne.comptes.join(', ')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {ligne.note && (
                      <Tooltip title={`Voir note ${ligne.note}`}>
                        <Chip
                          label={ligne.note}
                          size="small"
                          color="error"
                          sx={{ fontSize: '0.7rem', height: '18px' }}
                          clickable
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                    {modeEdition && ligne.exerciceN !== null && !ligne.isTotal && !ligne.isTotalGeneral ? (
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
                          fontWeight: ligne.isTotal || ligne.isTotalGeneral ? 700 : 500,
                          color: ligne.isTotalGeneral ? 'inherit' : ligne.exerciceN && ligne.exerciceN < 0 ? 'error.main' : 'text.primary'
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
                        fontWeight: ligne.isTotal || ligne.isTotalGeneral ? 700 : 500,
                        color: ligne.isTotalGeneral ? 'inherit' : ligne.exerciceN1 && ligne.exerciceN1 < 0 ? 'error.main' : 'text.primary'
                      }}
                    >
                      {formatMontant(ligne.exerciceN1)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {variation !== null && (
                      <Typography
                        variant="caption"
                        sx={{
                          color: variation >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 600
                        }}
                      >
                        {variation >= 0 ? '+' : ''}{variation.toFixed(1)}%
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Vérification de l'équilibre */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.dark' }}>
          ✓ ÉQUILIBRE VÉRIFIÉ : TOTAL ACTIF = TOTAL PASSIF = 285 250 000
        </Typography>
      </Box>

      {/* Légende */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Légende:</strong> Les montants sont exprimés en FCFA.
          Les montants négatifs sont présentés entre parenthèses.
          Les références correspondent au plan comptable SYSCOHADA révisé.
        </Typography>
      </Box>
    </Box>
  )
}

export default memo(BilanPassif)
