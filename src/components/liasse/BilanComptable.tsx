/**
 * Composant Bilan Comptable - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface BilanComptableProps {
  modeEdition?: boolean
}

const BilanComptable: React.FC<BilanComptableProps> = ({ modeEdition: _modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#191919' }}>
        Bilan Comptable Synthétique
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Bilan comptable avant retraitements fiscaux
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
      </Paper>
    </Box>
  )
}

export default BilanComptable