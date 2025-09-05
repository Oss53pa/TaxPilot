import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface EtatDettesProps {
  modeEdition?: boolean
}

const EtatDettes: React.FC<EtatDettesProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#191919' }}>
        État des Dettes
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>Détail des dettes par échéance</Alert>
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">Contenu à implémenter</Typography>
      </Paper>
    </Box>
  )
}

export default EtatDettes