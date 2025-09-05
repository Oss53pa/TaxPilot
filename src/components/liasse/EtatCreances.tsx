import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface EtatCreancesProps {
  modeEdition?: boolean
}

const EtatCreances: React.FC<EtatCreancesProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#191919' }}>
        État des Créances
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>Détail des créances par échéance</Alert>
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">Contenu à implémenter</Typography>
      </Paper>
    </Box>
  )
}

export default EtatCreances