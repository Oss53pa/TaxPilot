/**
 * Composant État Soldes de Gestion - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface EtatSoldesGestionProps {
  modeEdition?: boolean
}

const EtatSoldesGestion: React.FC<EtatSoldesGestionProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#191919' }}>
        État des Soldes Intermédiaires de Gestion
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Calcul des soldes intermédiaires de gestion
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
      </Paper>
    </Box>
  )
}

export default EtatSoldesGestion