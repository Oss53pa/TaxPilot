/**
 * Composant Flux de Trésorerie - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface FluxTresorerieProps {
  modeEdition?: boolean
}

const FluxTresorerie: React.FC<FluxTresorerieProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'success.main' }}>
        Tableau des Flux de Trésorerie
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        Cette section est en cours de développement. Le tableau des flux de trésorerie sera disponible prochainement.
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Flux d'exploitation, d'investissement et de financement
        </Typography>
      </Paper>
    </Box>
  )
}

export default FluxTresorerie