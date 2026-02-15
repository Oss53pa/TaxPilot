/**
 * Composant Grand Livre - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface GrandLivreProps {
  modeEdition?: boolean
}

const GrandLivre: React.FC<GrandLivreProps> = ({ modeEdition: _modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
        Grand Livre des Comptes
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Détail des mouvements par compte
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
      </Paper>
    </Box>
  )
}

export default GrandLivre