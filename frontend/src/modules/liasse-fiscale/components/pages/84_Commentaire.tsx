import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const Commentaire: React.FC<PageProps> = ({ entreprise }) => {
  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} pageNumber="82" />
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, textAlign: 'center', mb: 2, fontFamily: 'inherit' }}>
        COMMENTAIRE
      </Typography>
      <Box sx={{ border: '0.5px solid #404040', minHeight: 500, p: 1 }}>
        <Typography sx={{ fontSize: '7.5pt', color: '#737373', fontFamily: 'inherit' }}>
          Commentaires et observations
        </Typography>
      </Box>
    </Box>
  )
}

export default Commentaire
