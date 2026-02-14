/**
 * Composant Journal Général - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface JournalGeneralProps {
  modeEdition?: boolean
}

const JournalGeneral: React.FC<JournalGeneralProps> = ({ modeEdition: _modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#171717' }}>
        Journal Général
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        Écritures comptables de l'exercice
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
      </Paper>
    </Box>
  )
}

export default JournalGeneral