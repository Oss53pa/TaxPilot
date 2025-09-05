/**
 * Composant Fiches Impôts - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface FichesImpotsProps {
  modeEdition?: boolean
}

const FichesImpots: React.FC<FichesImpotsProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'warning.main' }}>
        Fiches de Détermination des Impôts
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Cette section contient les fiches de calcul des différents impôts et taxes.
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Calcul IS, TVA, et autres impôts et taxes
        </Typography>
      </Paper>
    </Box>
  )
}

export default FichesImpots