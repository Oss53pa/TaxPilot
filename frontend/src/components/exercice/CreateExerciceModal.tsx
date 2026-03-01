/**
 * Modal de creation d'un nouvel exercice fiscal
 */

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
} from '@mui/material'
import { useExercice } from '../../hooks/useExercice'
import { getExercice } from '../../services/exerciceStorageService'

interface Props {
  open: boolean
  onClose: () => void
}

const CreateExerciceModal: React.FC<Props> = ({ open, onClose }) => {
  const currentYear = new Date().getFullYear()
  const [annee, setAnnee] = useState(String(currentYear))
  const [error, setError] = useState<string | null>(null)
  const { createExercice } = useExercice()

  const handleCreate = () => {
    setError(null)
    const year = parseInt(annee)
    if (isNaN(year) || year < 2000 || year > 2099) {
      setError('Annee invalide (2000-2099)')
      return
    }
    if (getExercice(annee)) {
      setError(`L'exercice ${annee} existe deja`)
      return
    }
    createExercice(annee)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Nouvel exercice fiscal</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Annee"
            type="number"
            value={annee}
            onChange={e => setAnnee(e.target.value)}
            fullWidth
            autoFocus
            inputProps={{ min: 2000, max: 2099 }}
            helperText={`Dates: 01/01/${annee} - 31/12/${annee} (12 mois)`}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleCreate}>
          Creer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateExerciceModal
