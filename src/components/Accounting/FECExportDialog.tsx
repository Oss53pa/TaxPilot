/**
 * Dialog d'export FEC (Fichier des Écritures Comptables)
 * Format standardisé obligatoire pour l'administration fiscale
 * Norme: FEC France / Afrique (format texte délimité par pipe |)
 */

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Chip,
} from '@mui/material'
import {
  Download,
  Close,
  CheckCircle,
  Warning,
  Info,
  Description,
} from '@mui/icons-material'
import { accountingService } from '@/services/accountingService'

interface FECExportDialogProps {
  open: boolean
  onClose: () => void
  entrepriseId?: string
  entrepriseName?: string
}

interface ExerciceOption {
  id: string
  nom: string
  date_debut: string
  date_fin: string
  est_cloture: boolean
}

const FECExportDialog: React.FC<FECExportDialogProps> = ({
  open,
  onClose,
  entrepriseId,
  entrepriseName,
}) => {
  const [selectedExercice, setSelectedExercice] = useState<string>('')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Mock exercices - à remplacer par un vrai call API
  const exercices: ExerciceOption[] = [
    {
      id: '1',
      nom: '2024',
      date_debut: '2024-01-01',
      date_fin: '2024-12-31',
      est_cloture: false,
    },
    {
      id: '2',
      nom: '2023',
      date_debut: '2023-01-01',
      date_fin: '2023-12-31',
      est_cloture: true,
    },
  ]

  const handleExport = async () => {
    if (!selectedExercice) {
      setError('Veuillez sélectionner un exercice')
      return
    }

    setExporting(true)
    setError(null)
    setSuccess(false)

    try {
      // Export FEC depuis le backend
      const blob = await accountingService.exportFEC(selectedExercice)

      // Téléchargement automatique
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Nom du fichier selon norme: FEC_SIREN_AAAAMMJJ
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      const siren = entrepriseId?.substring(0, 9) || '000000000'
      link.download = `FEC_${siren}_${today}.txt`

      link.click()
      window.URL.revokeObjectURL(url)

      setSuccess(true)

      // Fermer après 2 secondes
      setTimeout(() => {
        onClose()
        resetState()
      }, 2000)
    } catch (err: any) {
      console.error('FEC export failed:', err)
      setError(err.message || 'Erreur lors de l\'export du FEC')
    } finally {
      setExporting(false)
    }
  }

  const resetState = () => {
    setSelectedExercice('')
    setError(null)
    setSuccess(false)
  }

  const handleClose = () => {
    if (!exporting) {
      resetState()
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description color="primary" />
          <Typography variant="h6">Export FEC (Fichier des Écritures Comptables)</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" disabled={exporting}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Info entreprise */}
        {entrepriseName && (
          <Alert severity="info" icon={false} sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Entreprise:</strong> {entrepriseName}
            </Typography>
          </Alert>
        )}

        {/* Informations FEC */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'action.hover' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            📋 À propos du FEC
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Le Fichier des Écritures Comptables (FEC) est un fichier standardisé contenant
            toutes les écritures comptables de l'exercice. Il est obligatoire pour les contrôles
            fiscaux en France et dans plusieurs pays africains.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Format:</strong> Fichier texte délimité par pipe (|) selon norme fiscale
          </Typography>
        </Paper>

        {/* Sélection exercice */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Exercice comptable *</InputLabel>
          <Select
            value={selectedExercice}
            onChange={(e) => {
              setSelectedExercice(e.target.value)
              setError(null)
            }}
            label="Exercice comptable *"
            disabled={exporting}
          >
            {exercices.map((exercice) => (
              <MenuItem key={exercice.id} value={exercice.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2">{exercice.nom}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(exercice.date_debut).toLocaleDateString('fr-FR')} - {new Date(exercice.date_fin).toLocaleDateString('fr-FR')}
                    </Typography>
                  </Box>
                  {exercice.est_cloture && (
                    <Chip label="Clôturé" size="small" color="success" />
                  )}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Spécifications du fichier généré */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            📄 Contenu du fichier FEC
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="18 colonnes standard"
                secondary="JournalCode, JournalLib, EcritureNum, EcritureDate, CompteNum, etc."
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Encodage UTF-8"
                secondary="Compatible avec tous les logiciels fiscaux"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <CheckCircle color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Validation fiscale"
                secondary="Format conforme aux exigences de l'administration"
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          </List>
        </Paper>

        {/* Avertissements */}
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Important:</strong> Le FEC doit être conservé pendant la durée légale de conservation
            comptable (minimum 10 ans). Ne modifiez jamais ce fichier après génération.
          </Typography>
        </Alert>

        {/* Success message */}
        {success && (
          <Alert severity="success">
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              ✅ FEC exporté avec succès !
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
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={exporting}>
          {success ? 'Fermer' : 'Annuler'}
        </Button>
        {!success && (
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={exporting || !selectedExercice}
            startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
          >
            {exporting ? 'Export en cours...' : 'Exporter FEC'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default FECExportDialog
