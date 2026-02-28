/**
 * Note 17 - Chiffre d'affaires et autres produits
 * Connecté aux données de la balance (comptes 70x, 71, 72, 73)
 */

import React, { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Grid, TextField, Stack, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, useTheme, alpha, IconButton, Tooltip,
} from '@mui/material'
import {
  TrendingUp as RevenueIcon, Print as PrintIcon,
  GetApp as ExportIcon, Warning as WarningIcon, Info as InfoIcon,
} from '@mui/icons-material'
import { liasseDataService } from '@/services/liasseDataService'

interface CALine { id: string; categorie: string; designation: string; montantN: number; montantN1: number }

const Note17SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [lignes, setLignes] = useState<CALine[]>([])
  const [hasData, setHasData] = useState(false)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!liasseDataService.isLoaded()) { setHasData(false); return }
    const data = liasseDataService.generateNote17()
    setLignes(data)
    setHasData(data.length > 0)
  }, [])

  const fmt = (v: number) => !v ? '-' : new Intl.NumberFormat('fr-FR').format(v)
  const fmtC = (v: number) => !v ? '-' : `${fmt(v)} XOF`

  const totalN = lignes.reduce((s, l) => s + l.montantN, 0)

  return (
    <Paper elevation={0} sx={{ p: 2, backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <RevenueIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>NOTE 17 - CHIFFRE D'AFFAIRES ET AUTRES PRODUITS</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Imprimer"><IconButton size="small"><PrintIcon /></IconButton></Tooltip>
            <Tooltip title="Exporter"><IconButton size="small"><ExportIcon /></IconButton></Tooltip>
          </Stack>
        </Stack>

        {!hasData && <Alert severity="info" sx={{ mb: 2 }} icon={<WarningIcon />}>Aucun produit trouvé. Importez une balance contenant des comptes 70x-73x.</Alert>}

        {hasData && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.success.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>{fmtC(totalN)}</Typography>
                  <Typography variant="body2">Chiffre d'affaires total (N)</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>{lignes.length}</Typography>
                  <Typography variant="body2">Sources de revenus</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      <Card sx={{ mb: 3 }}><CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Décomposition du chiffre d'affaires</Typography>
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableCell sx={{ fontWeight: 600 }}>Nature des produits</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>Exercice N</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>Exercice N-1</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>% du total</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {lignes.map(l => {
              const pct = totalN > 0 ? (l.montantN / totalN * 100).toFixed(1) : '0.0'
              return (
                <TableRow key={l.id} hover>
                  <TableCell>{l.designation}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{fmt(l.montantN)}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{fmt(l.montantN1)}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{pct}%</TableCell>
                </TableRow>
              )
            })}
            <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <TableCell sx={{ fontWeight: 700 }}>TOTAL PRODUITS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>{fmt(totalN)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'text.secondary' }}>{fmt(lignes.reduce((s, l) => s + l.montantN1, 0))}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>100.0%</TableCell>
            </TableRow>
          </TableBody>
        </Table></TableContainer>
      </CardContent></Card>

      <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.action.hover, 0.3), borderRadius: 1, border: `1px solid ${theme.palette.divider}`, mt: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><InfoIcon color="action" /><Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Commentaires</Typography></Stack>
        <TextField fullWidth multiline rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Détail par zone géographique, par activité..." variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: theme.palette.background.paper } }} />
      </Box>
    </Paper>
  )
}

export default Note17SYSCOHADA
