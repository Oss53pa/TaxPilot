/**
 * Dialog d'export batch de plusieurs liasses
 * Connecté au backend via generationService.exportBatch()
 */

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Box,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Divider,
  Stack,
  Paper,
} from '@mui/material'
import {
  Download,
  Close,
  PictureAsPdf,
  TableChart,
  CheckCircle,
} from '@mui/icons-material'
import { generationService, LiasseGeneration } from '@/services/generationService'

interface BatchExportDialogProps {
  liasses: LiasseGeneration[]
  open: boolean
  onClose: () => void
}

interface ExportProgress {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
  progress: number
  message: string
  download_url?: string
}

const BatchExportDialog: React.FC<BatchExportDialogProps> = ({
  liasses,
  open,
  onClose,
}) => {
  const [selectedLiasses, setSelectedLiasses] = useState<string[]>(
    liasses.map((l) => l.id)
  )
  const [exportFormat, setExportFormat] = useState<'PDF' | 'EXCEL'>('PDF')
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleToggleLiasse = (liasseId: string) => {
    if (selectedLiasses.includes(liasseId)) {
      setSelectedLiasses(selectedLiasses.filter((id) => id !== liasseId))
    } else {
      setSelectedLiasses([...selectedLiasses, liasseId])
    }
  }

  const handleSelectAll = () => {
    if (selectedLiasses.length === liasses.length) {
      setSelectedLiasses([])
    } else {
      setSelectedLiasses(liasses.map((l) => l.id))
    }
  }

  const handleExport = async () => {
    if (selectedLiasses.length === 0) {
      setError('Veuillez sélectionner au moins une liasse')
      return
    }

    setExporting(true)
    setError(null)
    setExportProgress({
      status: 'PENDING',
      progress: 0,
      message: 'Initialisation de l\'export...',
    })

    try {
      // Lancer l'export batch
      const result = await generationService.exportBatch(selectedLiasses, exportFormat)
      const batchId = result.batch_id

      setExportProgress({
        status: 'PROCESSING',
        progress: 10,
        message: 'Export en cours...',
      })

      // Polling du statut d'export
      let downloadUrl: string | null = null
      let attempts = 0
      const maxAttempts = 60 // 2 minutes max

      while (!downloadUrl && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000)) // Poll toutes les 2s
        attempts++

        const status = await generationService.getBatchExportStatus(batchId)

        if (status.status === 'COMPLETED') {
          downloadUrl = status.download_url
          setExportProgress({
            status: 'COMPLETED',
            progress: 100,
            message: 'Export terminé avec succès !',
            download_url: downloadUrl,
          })
        } else if (status.status === 'ERROR') {
          throw new Error(status.error_message || 'Erreur lors de l\'export')
        } else {
          // En cours
          setExportProgress({
            status: 'PROCESSING',
            progress: Math.min(10 + (attempts / maxAttempts) * 80, 90),
            message: `Génération en cours... (${status.processed || 0}/${selectedLiasses.length} liasses)`,
          })
        }
      }

      if (!downloadUrl) {
        throw new Error('Timeout: l\'export a pris trop de temps')
      }

      // Télécharger automatiquement
      window.location.href = downloadUrl

      // Fermer après succès
      setTimeout(() => {
        onClose()
        resetState()
      }, 2000)
    } catch (err: any) {
      console.error('Batch export failed:', err)
      setError(err.message || 'Erreur lors de l\'export batch')
      setExportProgress({
        status: 'ERROR',
        progress: 0,
        message: 'Export échoué',
      })
    } finally {
      setExporting(false)
    }
  }

  const resetState = () => {
    setSelectedLiasses(liasses.map((l) => l.id))
    setExportFormat('PDF')
    setExportProgress(null)
    setError(null)
  }

  const handleClose = () => {
    if (!exporting) {
      resetState()
      onClose()
    }
  }

  const getFormatIcon = (format: 'PDF' | 'EXCEL') => {
    return format === 'PDF' ? <PictureAsPdf /> : <TableChart />
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Download color="primary" />
          <Typography variant="h6">Export Multiple de Liasses</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={exporting}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Format selection */}
          <FormControl fullWidth>
            <InputLabel>Format d'export</InputLabel>
            <Select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'PDF' | 'EXCEL')}
              label="Format d'export"
              disabled={exporting}
            >
              <MenuItem value="PDF">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PictureAsPdf />
                  <Box>
                    <Typography variant="body2">PDF (documents séparés)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Archive ZIP contenant un PDF par liasse
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value="EXCEL">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TableChart />
                  <Box>
                    <Typography variant="body2">Excel (classeur unique)</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Un fichier Excel avec une feuille par liasse
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Divider />

          {/* Selection header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">
              Liasses à exporter ({selectedLiasses.length}/{liasses.length})
            </Typography>
            <Button
              size="small"
              onClick={handleSelectAll}
              disabled={exporting}
            >
              {selectedLiasses.length === liasses.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </Button>
          </Box>

          {/* List of liasses */}
          <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
            <List dense>
              {liasses.map((liasse) => (
                <ListItem
                  key={liasse.id}
                  button
                  onClick={() => !exporting && handleToggleLiasse(liasse.id)}
                  disabled={exporting}
                >
                  <Checkbox
                    checked={selectedLiasses.includes(liasse.id)}
                    onChange={() => handleToggleLiasse(liasse.id)}
                    disabled={exporting}
                  />
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        {liasse.entreprise_detail?.raison_sociale || liasse.entreprise}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={liasse.exercice_detail?.nom || liasse.exercice}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={liasse.type_liasse}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={liasse.statut}
                          size="small"
                          color={
                            liasse.statut === 'TERMINEE' || liasse.statut === 'VALIDEE'
                              ? 'success'
                              : 'default'
                          }
                        />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Export progress */}
          {exportProgress && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {exportProgress.message}
                </Typography>
                {exportProgress.status === 'COMPLETED' && <CheckCircle color="success" />}
              </Box>
              <LinearProgress
                variant="determinate"
                value={exportProgress.progress}
                color={exportProgress.status === 'ERROR' ? 'error' : 'primary'}
              />
            </Box>
          )}

          {/* Success message */}
          {exportProgress?.status === 'COMPLETED' && (
            <Alert severity="success">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Export terminé avec succès !
              </Typography>
              <Typography variant="caption">
                Le téléchargement a démarré automatiquement
              </Typography>
            </Alert>
          )}

          {/* Error display */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={exporting}>
          {exportProgress?.status === 'COMPLETED' ? 'Fermer' : 'Annuler'}
        </Button>
        {exportProgress?.status !== 'COMPLETED' && (
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={exporting || selectedLiasses.length === 0}
            startIcon={getFormatIcon(exportFormat)}
          >
            {exporting
              ? 'Export en cours...'
              : `Exporter ${selectedLiasses.length} liasse(s)`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default BatchExportDialog
