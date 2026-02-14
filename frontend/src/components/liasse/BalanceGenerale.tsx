/**
 * Composant Balance Générale - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface BalanceGeneraleProps {
  modeEdition?: boolean
}

const BalanceGenerale: React.FC<BalanceGeneraleProps> = ({ modeEdition: _modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#171717' }}>
        Balance Générale des Comptes
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Soldes de tous les comptes au 31/12/2024
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
      </Paper>
    </Box>
  )
}

export default BalanceGenerale