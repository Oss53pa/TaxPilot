/**
 * Composant État Complémentaire - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface EtatComplementsProps {
  modeEdition?: boolean
}

const EtatComplements: React.FC<EtatComplementsProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'primary.main' }}>
        État Complémentaire
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        L'état complémentaire fournit des informations additionnelles sur les états financiers.
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Informations complémentaires et détails des postes
        </Typography>
      </Paper>
    </Box>
  )
}

export default EtatComplements