import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const GardeBnc: React.FC<PageProps> = ({ entreprise }) => {
  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} pageNumber="77" />
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, textAlign: 'center', mb: 2, fontFamily: 'inherit' }}>
        GARDE (BNC)
      </Typography>
      <Box sx={{ border: '0.5px solid #d4d4d4', minHeight: 300, p: 1 }}>
        <Typography sx={{ fontSize: '7.5pt', color: '#737373', fontFamily: 'inherit' }}>
          Contenu a completer
        </Typography>
      </Box>
    </Box>
  )
}

export default GardeBnc
