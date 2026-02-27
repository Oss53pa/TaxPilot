/**
 * Note 14 - Emprunts et dettes financières
 * Connectée aux données de la balance (comptes 16x)
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  AccountBalance as DebtIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  GetApp as ExportIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { liasseDataService } from '../../../services/liasseDataService'
import CommentairesSection from '../shared/CommentairesSection'

interface EmpruntLine {
  compte: string
  intitule: string
  solde: number
  debit: number
  credit: number
}

const Note14SYSCOHADA: React.FC = () => {
  const theme = useTheme()
  const [emprunts, setEmprunts] = useState<EmpruntLine[]>([])
  const [comment, setComment] = useState('')
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    loadDataFromBalance()
  }, [])

  const loadDataFromBalance = () => {
    if (!liasseDataService.isLoaded()) {
      setHasData(false)
      return
    }

    const data = liasseDataService.generateNote14()
    setEmprunts(data)
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

  const totalSolde = emprunts.reduce((sum, e) => sum + e.solde, 0)
  const totalDebit = emprunts.reduce((sum, e) => sum + e.debit, 0)
  const totalCredit = emprunts.reduce((sum, e) => sum + e.credit, 0)

  // Catégoriser par type
  const categories = [
    { label: 'Emprunts obligataires', prefix: '161', items: emprunts.filter(e => e.compte.startsWith('161')) },
    { label: 'Emprunts auprès des établissements de crédit', prefix: '162-163', items: emprunts.filter(e => e.compte.startsWith('162') || e.compte.startsWith('163')) },
    { label: 'Emprunts et dettes financières diverses', prefix: '164', items: emprunts.filter(e => e.compte.startsWith('164')) },
    { label: 'Dépôts et cautionnements reçus', prefix: '165-166', items: emprunts.filter(e => e.compte.startsWith('165') || e.compte.startsWith('166')) },
    { label: 'Dettes de crédit-bail', prefix: '167', items: emprunts.filter(e => e.compte.startsWith('167')) },
    { label: 'Autres emprunts et dettes', prefix: '168-169', items: emprunts.filter(e => e.compte.startsWith('168') || e.compte.startsWith('169')) },
  ].filter(cat => cat.items.length > 0)

  const handleSave = () => {
    console.log('Sauvegarde Note 14:', { emprunts, comment })
  }

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
            <DebtIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              NOTE 14 - EMPRUNTS ET DETTES FINANCIÈRES
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
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

        {/* Indicateurs clés */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(totalSolde)}
                </Typography>
                <Typography variant="body2">Total dettes financières</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="info.main" sx={{ fontWeight: 600 }}>
                  {emprunts.length}
                </Typography>
                <Typography variant="body2">Comptes d'emprunts</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ textAlign: 'center', backgroundColor: alpha(theme.palette.warning.main, 0.1) }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h6" color="warning.main" sx={{ fontWeight: 600 }}>
                  {categories.length}
                </Typography>
                <Typography variant="body2">Catégories</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {!hasData && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<WarningIcon />}>
          Aucune donnée d'emprunt trouvée dans la balance. Importez une balance contenant des comptes 16x pour alimenter cette note.
        </Alert>
      )}

      {/* Tableau détaillé par catégorie */}
      {categories.map((cat) => (
        <Card key={cat.prefix} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: theme.palette.primary.main }}>
              {cat.label}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Compte</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Mouvements débit</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Mouvements crédit</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: alpha(theme.palette.info.main, 0.1) }}>
                      Solde N
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cat.items.map((emprunt) => (
                    <TableRow key={emprunt.compte} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {emprunt.compte}
                        </Typography>
                      </TableCell>
                      <TableCell>{emprunt.intitule}</TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                        {formatNumber(emprunt.debit)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                        {formatNumber(emprunt.credit)}
                      </TableCell>
                      <TableCell align="right" sx={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        backgroundColor: alpha(theme.palette.info.main, 0.05),
                      }}>
                        {formatNumber(emprunt.solde)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Sous-total catégorie */}
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 600 }}>
                      Sous-total {cat.label}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {formatNumber(cat.items.reduce((s, e) => s + e.debit, 0))}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {formatNumber(cat.items.reduce((s, e) => s + e.credit, 0))}
                    </TableCell>
                    <TableCell align="right" sx={{
                      fontWeight: 600,
                      fontFamily: 'monospace',
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                    }}>
                      {formatNumber(cat.items.reduce((s, e) => s + e.solde, 0))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      ))}

      {/* Tableau récapitulatif */}
      {hasData && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Récapitulatif des emprunts et dettes financières
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 600 }}>Catégorie</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Exercice N</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Exercice N-1</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Variation</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((cat) => {
                    const total = cat.items.reduce((s, e) => s + e.solde, 0)
                    return (
                      <TableRow key={cat.prefix} hover>
                        <TableCell>{cat.label}</TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                          {formatNumber(total)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace', color: theme.palette.text.secondary }}>
                          -
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          -
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {/* Grand total */}
                  <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem' }}>TOTAL EMPRUNTS ET DETTES FINANCIÈRES</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {formatNumber(totalSolde)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace', color: theme.palette.text.secondary }}>
                      -
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                      -
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

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
          placeholder="Précisez les conditions des emprunts, les taux d'intérêt, les garanties, les échéances, les covenants bancaires..."
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

export default Note14SYSCOHADA
