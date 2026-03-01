/**
 * Note 14 - Emprunts et dettes financières
 * Connectée aux données de la balance (comptes 16x, 17x, 18x, 19x)
 */

import React, { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Grid, TextField, Stack, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Alert, useTheme, alpha, IconButton, Tooltip,
} from '@mui/material'
import {
  AccountBalance as DetteIcon, Print as PrintIcon,
  GetApp as ExportIcon, Warning as WarningIcon, Info as InfoIcon,
} from '@mui/icons-material'
import { liasseDataService } from '@/services/liasseDataService'

interface DetteLine { id: string; categorie: string; designation: string; montantN: number; montantN1: number; echeanceCT: number; echeanceLT: number }

const Note14SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [lignes, setLignes] = useState<DetteLine[]>([])
  const [hasData, setHasData] = useState(false)
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!liasseDataService.isLoaded()) { setHasData(false); return }
    const data = liasseDataService.generateNote14()
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
            <DetteIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>NOTE 14 - EMPRUNTS ET DETTES FINANCIÈRES</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Imprimer"><IconButton size="small"><PrintIcon /></IconButton></Tooltip>
            <Tooltip title="Exporter"><IconButton size="small"><ExportIcon /></IconButton></Tooltip>
          </Stack>
        </Stack>

        {!hasData && <Alert severity="info" sx={{ mb: 2 }} icon={<WarningIcon />}>Aucune dette financière trouvée. Importez une balance contenant des comptes 16x-19x.</Alert>}

        {hasData && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.error.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="error.main" sx={{ fontWeight: 600 }}>{fmtC(totalN)}</Typography>
                  <Typography variant="body2">Total dettes financières (N)</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>{lignes.length}</Typography>
                  <Typography variant="body2">Catégories d'emprunts</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      <Card sx={{ mb: 3 }}><CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Détail des emprunts et dettes financières</Typography>
        <TableContainer><Table size="small">
          <TableHead><TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableCell sx={{ fontWeight: 600 }}>Nature</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>Montant N</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>Montant N-1</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>Catégorie</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {lignes.map(l => (
              <TableRow key={l.id} hover>
                <TableCell>{l.designation}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{fmt(l.montantN)}</TableCell>
                <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>{fmt(l.montantN1)}</TableCell>
                <TableCell align="right"><Chip label={l.categorie.replace('_', ' ')} size="small" variant="outlined" /></TableCell>
              </TableRow>
            ))}
            <TableRow className="total-row" sx={{ backgroundColor: '#1a1a1a', borderTop: '2px solid #333', borderBottom: '2px solid #333' }}>
              <TableCell sx={{ fontWeight: 700, color: '#fff', borderColor: '#444' }}>TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#fff', borderColor: '#444' }}>{fmt(totalN)}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#fff', borderColor: '#444' }}>{fmt(lignes.reduce((s, l) => s + l.montantN1, 0))}</TableCell>
              <TableCell sx={{ borderColor: '#444' }} />
            </TableRow>
          </TableBody>
        </Table></TableContainer>
      </CardContent></Card>

      <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.action.hover, 0.3), borderRadius: 1, border: `1px solid ${theme.palette.divider}`, mt: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><InfoIcon color="action" /><Typography variant="subtitle1" sx={{ fontWeight: 500 }}>Commentaires</Typography></Stack>
        <TextField fullWidth multiline rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="Conditions des emprunts, taux d'intérêt, garanties..." variant="outlined" sx={{ '& .MuiOutlinedInput-root': { backgroundColor: theme.palette.background.paper } }} />
      </Box>
    </Paper>
  )
}

export default Note14SYSCOHADA
