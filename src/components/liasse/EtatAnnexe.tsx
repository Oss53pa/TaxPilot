/**
 * Composant État Annexé - SYSCOHADA
 */

import React from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface EtatAnnexeProps {
  modeEdition?: boolean
}

const EtatAnnexe: React.FC<EtatAnnexeProps> = ({ modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'secondary.main' }}>
        État Annexé
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        Cette section nécessite des informations détaillées sur les postes du bilan.
      </Alert>
      
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">
          Contenu à implémenter
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Détails et ventilation des postes du bilan
        </Typography>
      </Paper>
    </Box>
  )
}

export default EtatAnnexe