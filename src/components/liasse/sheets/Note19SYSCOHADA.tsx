/**
 * Note 19 - Charges de personnel
 * Connecté aux données de la balance (comptes 64x)
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Groups as PersonnelIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { liasseDataService } from '../../../services/liasseDataService'

interface ChargeLine {
  id: string
  designation: string
  montantN: number
  montantN1: number
}

const Note19SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [lignes, setLignes] = useState<ChargeLine[]>([])
  const [hasData, setHasData] = useState(false)
  const [comment, setComment] = useState('')

  useEffect(() => {
    loadDataFromBalance()
  }, [])

  const loadDataFromBalance = () => {
    if (!liasseDataService.isLoaded()) {
      setHasData(false)
      return
    }
    const data = liasseDataService.generateNote19()
    setLignes(data)
    setHasData(data.length > 0)
  }

  const formatNumber = (value: number) => {
    if (!value || value === 0) return '-'
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatCurrency = (value: number) => {
    if (!value || value === 0) return '-'
    return `${formatNumber(value)} XOF`
  }

  const totalN = lignes.reduce((sum, l) => sum + l.montantN, 0)
  const totalN1 = lignes.reduce((sum, l) => sum + l.montantN1, 0)

  // Get CA from balance for ratio
  const caTotal = liasseDataService.isLoaded()
    ? Math.abs(liasseDataService.getNetBalance(['701', '702', '703', '704', '705', '706', '707']))
    : 0
  const ratioPersonnel = caTotal > 0 ? (totalN / caTotal * 100).toFixed(1) : '-'

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
            <PersonnelIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              NOTE 19 - CHARGES DE PERSONNEL
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Imprimer">
              <IconButton size="small"><PrintIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Exporter">
              <IconButton size="small"><ExportIcon /></IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        {!hasData && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<WarningIcon />}>
            Aucune charge de personnel trouvée dans la balance. Importez une balance contenant des comptes 64x.
          </Alert>
        )}

        {/* Indicateurs */}
        {hasData && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(totalN)}
                  </Typography>
                  <Typography variant="body2">Total charges de personnel (N)</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                    {lignes.length}
                  </Typography>
                  <Typography variant="body2">Catégories de charges</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                    {ratioPersonnel}%
                  </Typography>
                  <Typography variant="body2">Charges personnel / CA</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Tableau détaillé */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Décomposition des charges de personnel
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 600 }}>Nature des charges</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Exercice N</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Exercice N-1</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>% du total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lignes.map(ligne => {
                  const pct = totalN > 0 ? (ligne.montantN / totalN * 100).toFixed(1) : '0.0'
                  return (
                    <TableRow key={ligne.id} hover>
                      <TableCell>{ligne.designation}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        {formatNumber(ligne.montantN)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace', color: theme.palette.text.secondary }}>
                        {formatNumber(ligne.montantN1)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                        {pct}%
                      </TableCell>
                    </TableRow>
                  )
                })}
                {/* Total */}
                <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                  <TableCell sx={{ fontWeight: 700 }}>TOTAL CHARGES DE PERSONNEL</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {formatNumber(totalN)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace', color: theme.palette.text.secondary }}>
                    {formatNumber(totalN1)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>100.0%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Zone de commentaires */}
      <Box sx={{
        p: 2,
        backgroundColor: alpha(theme.palette.action.hover, 0.3),
        borderRadius: 1,
        border: `1px solid ${theme.palette.divider}`,
        mt: 3
      }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <InfoIcon color="action" />
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Commentaires et informations complémentaires
          </Typography>
        </Stack>

        <TextField
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Précisez les effectifs, les conventions collectives, les changements de politique salariale, les avantages en nature..."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: theme.palette.background.paper,
            },
          }}
        />
      </Box>
    </Paper>
  )
}

export default Note19SYSCOHADA
