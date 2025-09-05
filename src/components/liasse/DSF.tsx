/**
 * Composant DSF - Déclaration Statistique et Fiscale SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface DSFProps {
  modeEdition?: boolean
}

const DSF: React.FC<DSFProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'error.main' }}>
        DSF - Déclaration Statistique et Fiscale
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        La DSF est en cours de préparation. Veuillez compléter les informations requises.
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Déclaration statistique et fiscale annuelle
        </Typography>
      </Paper>
    </Box>
  )
}

export default DSF