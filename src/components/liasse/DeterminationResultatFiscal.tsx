import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface DeterminationResultatFiscalProps {
  modeEdition?: boolean
}

const DeterminationResultatFiscal: React.FC<DeterminationResultatFiscalProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#191919' }}>
        Détermination du Résultat Fiscal
      </Typography>
      <Alert severity="error" sx={{ mb: 3 }}>Calcul du résultat imposable</Alert>
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">Contenu à implémenter</Typography>
      </Paper>
    </Box>
  )
}

export default DeterminationResultatFiscal