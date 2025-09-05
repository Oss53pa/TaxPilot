import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface TableauPassageResultatProps {
  modeEdition?: boolean
}

const TableauPassageResultat: React.FC<TableauPassageResultatProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#191919' }}>
        Tableau de Passage Résultat Comptable/Fiscal
      </Typography>
      <Alert severity="warning" sx={{ mb: 3 }}>Retraitements fiscaux à effectuer</Alert>
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">Contenu à implémenter</Typography>
      </Paper>
    </Box>
  )
}

export default TableauPassageResultat