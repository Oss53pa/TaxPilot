import React, { useState, useCallback } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Stack, useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Comment as CommentIcon } from '@mui/icons-material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const COMMENT_KEY = 'fiscasync_liasse_note_comment_note_16b_bis'

const fmt = (v: number | null): string => {
  if (v === null || v === undefined) return ''
  if (v === 0) return ''
  return v.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
}

interface Table1Row {
  id: string
  label: string
  anneeN: number | null
  anneeN1: number | null
}

interface Table2Row {
  id: string
  label: string
  rendementN: number | null
  justeValeurN: number | null
  rendementN1: number | null
  justeValeurN1: number | null
  isTotal?: boolean
}

const Note16BBis: React.FC<PageProps> = ({ entreprise }) => {
  const theme = useTheme()

  const [comment, setComment] = useState<string>(() => {
    try { return localStorage.getItem(COMMENT_KEY) || '' } catch { return '' }
  })

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setComment(val)
    try { localStorage.setItem(COMMENT_KEY, val) } catch { /* full */ }
  }, [])

  // ── Table 1: Actif/Passif net comptabilise au titre des regimes finances ──
  const table1Rows: Table1Row[] = [
    { id: 't1r1', label: "Valeur actuelle de l'obligation résultant de régimes financés", anneeN: null, anneeN1: null },
    { id: 't1r2', label: 'Valeur actuelle des actifs affectés aux plans de retraite', anneeN: null, anneeN1: null },
    { id: 't1r3', label: 'Excédent / Déficit de régime', anneeN: null, anneeN1: null },
  ]

  // ── Table 2: Valeur actuelle des actifs du regime ──
  const table2Rows: Table2Row[] = [
    { id: 't2r1', label: 'Actions', rendementN: null, justeValeurN: null, rendementN1: null, justeValeurN1: null },
    { id: 't2r2', label: 'Obligations', rendementN: null, justeValeurN: null, rendementN1: null, justeValeurN1: null },
    { id: 't2r3', label: 'Autres', rendementN: null, justeValeurN: null, rendementN1: null, justeValeurN1: null },
    { id: 't2total', label: 'Total', rendementN: null, justeValeurN: null, rendementN1: null, justeValeurN1: null, isTotal: true },
  ]

  const cellSx = (isTotal?: boolean) => ({
    fontWeight: isTotal ? 700 : 400,
    fontSize: isTotal ? 12 : 11,
    color: isTotal ? '#fff' : undefined,
    bgcolor: isTotal ? '#1a1a1a' : undefined,
    borderColor: isTotal ? '#444' : undefined,
    py: 0.5,
  })

  const totalRowSx = {
    bgcolor: '#1a1a1a',
    borderTop: '2px solid #333',
    borderBottom: '2px solid #333',
    '&:hover': { bgcolor: '#2a2a2a' },
  }

  const normalRowSx = {
    bgcolor: 'transparent',
    '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.05) },
  }

  return (
    <Box>
      <LiasseHeader entreprise={entreprise} noteLabel="NOTE 16B BIS" pageNumber="37" />

      <Typography sx={{ fontWeight: 700, fontSize: 12, mb: 1.5, borderTop: '1px solid #000', pt: 0.75 }}>
        NOTE 16B BIS : ENGAGEMENTS DE RETRAITE ET AVANTAGES ASSIMILES (METHODE ACTUARIELLE SUITE)
      </Typography>

      {/* ── Table 1: Actif/Passif net comptabilise ── */}
      <Typography sx={{ fontWeight: 700, fontSize: 11, mb: 0.5 }}>
        ACTIF/PASSIF NET COMPTABILISE AU TITRE DES REGIMES FINANCES
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell align="left" sx={{ fontWeight: 600, fontSize: 10, width: '50%', whiteSpace: 'nowrap', py: 0.5 }}>
                  Libellés
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: 10, width: '25%', whiteSpace: 'nowrap', py: 0.5 }}>
                  Année N
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: 10, width: '25%', whiteSpace: 'nowrap', py: 0.5 }}>
                  Année N-1
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {table1Rows.map(row => (
                <TableRow key={row.id} sx={normalRowSx}>
                  <TableCell align="left" sx={cellSx()}>{row.label}</TableCell>
                  <TableCell align="right" sx={cellSx()}>{fmt(row.anneeN)}</TableCell>
                  <TableCell align="right" sx={cellSx()}>{fmt(row.anneeN1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Typography variant="body2" sx={{ fontSize: 10, fontStyle: 'italic', color: 'text.secondary', mb: 2 }}>
        Indiquer le montant comptabilisé au passif (ou actif) à la clôture de l&apos;exercice.
      </Typography>

      {/* ── Table 2: Valeur actuelle des actifs du regime ── */}
      <Typography sx={{ fontWeight: 700, fontSize: 11, mb: 0.5 }}>
        VALEUR ACTUELLE DES ACTIFS DU REGIME
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell
                  rowSpan={2}
                  align="left"
                  sx={{ fontWeight: 600, fontSize: 10, width: '28%', whiteSpace: 'nowrap', py: 0.5, borderRight: `1px solid ${theme.palette.divider}` }}
                >
                  Libellés
                </TableCell>
                <TableCell
                  colSpan={2}
                  align="center"
                  sx={{ fontWeight: 600, fontSize: 10, py: 0.5, borderRight: `1px solid ${theme.palette.divider}` }}
                >
                  Année N
                </TableCell>
                <TableCell
                  colSpan={2}
                  align="center"
                  sx={{ fontWeight: 600, fontSize: 10, py: 0.5 }}
                >
                  Année N-1
                </TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: 10, width: '18%', whiteSpace: 'nowrap', py: 0.5 }}>
                  Rendement attendu
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 600, fontSize: 10, width: '18%', whiteSpace: 'nowrap', py: 0.5, borderRight: `1px solid ${theme.palette.divider}` }}
                >
                  Juste valeur des actifs
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: 10, width: '18%', whiteSpace: 'nowrap', py: 0.5 }}>
                  Rendement attendu
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, fontSize: 10, width: '18%', whiteSpace: 'nowrap', py: 0.5 }}>
                  Juste valeur des actifs
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {table2Rows.map(row => (
                <TableRow key={row.id} sx={row.isTotal ? totalRowSx : normalRowSx}>
                  <TableCell align="left" sx={cellSx(row.isTotal)}>{row.label}</TableCell>
                  <TableCell align="right" sx={cellSx(row.isTotal)}>{fmt(row.rendementN)}</TableCell>
                  <TableCell align="right" sx={cellSx(row.isTotal)}>{fmt(row.justeValeurN)}</TableCell>
                  <TableCell align="right" sx={cellSx(row.isTotal)}>{fmt(row.rendementN1)}</TableCell>
                  <TableCell align="right" sx={cellSx(row.isTotal)}>{fmt(row.justeValeurN1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Typography variant="body2" sx={{ fontSize: 10, fontStyle: 'italic', color: 'text.secondary', mb: 0.5 }}>
        - Expliquer comment les taux de rendement par catégorie d&apos;actifs et global ont été déterminés
      </Typography>
      <Typography variant="body2" sx={{ fontSize: 10, fontStyle: 'italic', color: 'text.secondary', mb: 2 }}>
        - Indiquer le montant des rendements réels des actifs affectés aux plans en N et N-1
      </Typography>

      {/* ── Comment section ── */}
      <Box sx={{
        mt: 2,
        p: 2,
        bgcolor: alpha(theme.palette.action.hover, 0.3),
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
      }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <CommentIcon color="action" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Commentaires et observations
          </Typography>
        </Stack>
        <TextField
          multiline
          minRows={3}
          maxRows={8}
          value={comment}
          onChange={handleCommentChange}
          placeholder="Saisissez vos commentaires et observations..."
          fullWidth
          variant="outlined"
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: theme.palette.background.paper } }}
        />
      </Box>
    </Box>
  )
}

export default Note16BBis
