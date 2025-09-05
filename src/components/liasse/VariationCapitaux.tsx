/**
 * Composant Variation des Capitaux Propres - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface VariationCapitauxProps {
  modeEdition?: boolean
}

const VariationCapitaux: React.FC<VariationCapitauxProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'info.main' }}>
        Tableau de Variation des Capitaux Propres
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Ce tableau présente l'évolution des capitaux propres entre le début et la fin de l'exercice.
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Mouvements du capital, réserves et résultat
        </Typography>
      </Paper>
    </Box>
  )
}

export default VariationCapitaux