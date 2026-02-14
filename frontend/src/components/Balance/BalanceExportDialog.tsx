/**
 * Dialog d'export avancé de balance avec options
 * Connecté au backend via balanceService.exportBalanceAdvanced()
 */

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Box,
  Typography,
  Alert,
  Stack,
  Divider,
  IconButton,
  CircularProgress,
} from '@mui/material'
import {
  Close,
  GetApp,
  PictureAsPdf,
  TableChart,
  Description,
} from '@mui/icons-material'
import { balanceService } from '@/services/balanceService'

interface BalanceExportDialogProps {
  open: boolean
  onClose: () => void
  balanceId: string
  balanceName?: string
}

const BalanceExportDialog: React.FC<BalanceExportDialogProps> = ({
  open,
  onClose,
  balanceId,
  balanceName = 'Balance',
}) => {
  const [format, setFormat] = useState<'XLSX' | 'CSV' | 'PDF'>('XLSX')
  const [includeLignes, setIncludeLignes] = useState(true)
  const [includeStatistiques, setIncludeStatistiques] = useState(true)
  const [includeGraphiques, setIncludeGraphiques] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    try {
      setExporting(true)
      setError(null)

      await balanceService.exportBalanceAdvanced(balanceId, format, {
        includeLignes,
        includeStatistiques,
        includeGraphiques,
      })

      // Success - file downloaded automatically by service
      setTimeout(() => {
        onClose()
        // Reset state
        setIncludeLignes(true)
        setIncludeStatistiques(true)
        setIncludeGraphiques(false)
        setFormat('XLSX')
      }, 500)
    } catch (err: any) {
      console.error('Export failed:', err)
      setError(err.message || 'Erreur lors de l\'export de la balance')
    } finally {
      setExporting(false)
    }
  }

  const getFormatIcon = (fmt: string) => {
    switch (fmt) {
      case 'PDF':
        return <PictureAsPdf />
      case 'CSV':
        return <Description />
      case 'XLSX':
      default:
        return <TableChart />
    }
  }

  const getFormatDescription = (fmt: string) => {
    switch (fmt) {
      case 'PDF':
        return 'Document PDF imprimable'
      case 'CSV':
        return 'Fichier CSV pour Excel/LibreOffice'
      case 'XLSX':
        return 'Classeur Excel avec mise en forme'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GetApp color="primary" />
          <Typography variant="h6">Exporter la Balance</Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={exporting}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Info balance */}
          <Alert severity="info" icon={false}>
            <Typography variant="body2">
              <strong>Balance:</strong> {balanceName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID: {balanceId}
            </Typography>
          </Alert>

          {/* Format selection */}
          <Box>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
              Format d'export
            </FormLabel>
            <FormControl fullWidth>
              <RadioGroup
                value={format}
                onChange={(e) => setFormat(e.target.value as 'XLSX' | 'CSV' | 'PDF')}
              >
                {(['XLSX', 'CSV', 'PDF'] as const).map((fmt) => (
                  <FormControlLabel
                    key={fmt}
                    value={fmt}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFormatIcon(fmt)}
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {fmt}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getFormatDescription(fmt)}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    disabled={exporting}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Divider />

          {/* Export options */}
          <Box>
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
              Options d'export
            </FormLabel>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeLignes}
                    onChange={(e) => setIncludeLignes(e.target.checked)}
                    disabled={exporting}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Inclure les lignes de balance</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Détail de tous les comptes avec mouvements
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeStatistiques}
                    onChange={(e) => setIncludeStatistiques(e.target.checked)}
                    disabled={exporting}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Inclure les statistiques</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Totaux, écarts, nb de comptes, équilibre
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeGraphiques}
                    onChange={(e) => setIncludeGraphiques(e.target.checked)}
                    disabled={exporting || format === 'CSV'}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2">Inclure les graphiques</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Répartition par classe, évolution {format === 'CSV' && '(non disponible en CSV)'}
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Box>

          {/* Error display */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={exporting}>
          Annuler
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={exporting ? <CircularProgress size={20} /> : <GetApp />}
          disabled={exporting}
        >
          {exporting ? 'Export en cours...' : 'Exporter'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BalanceExportDialog
