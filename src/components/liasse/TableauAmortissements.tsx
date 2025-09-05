/**
 * Composant Tableau Amortissements - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface TableauAmortissementsProps {
  modeEdition?: boolean
}

const TableauAmortissements: React.FC<TableauAmortissementsProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#191919' }}>
        Tableau des Amortissements
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Détail des amortissements par nature d'immobilisation
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
      </Paper>
    </Box>
  )
}

export default TableauAmortissements