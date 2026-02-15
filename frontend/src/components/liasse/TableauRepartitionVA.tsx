import type { FC } from 'react'
import { Box, Typography, Paper, Alert } from '@mui/material'

interface TableauRepartitionVAProps {
  modeEdition?: boolean
}

const TableauRepartitionVA: FC<TableauRepartitionVAProps> = ({ modeEdition: _modeEdition = false }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
        Tableau de Répartition de la Valeur Ajoutée
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>Répartition de la VA entre les partenaires</Alert>
      <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="h6" color="text.secondary">Contenu à implémenter</Typography>
      </Paper>
    </Box>
  )
}

export default TableauRepartitionVA