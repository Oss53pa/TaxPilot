import React from 'react'
import { Box, Typography } from '@mui/material'
import LiasseHeader from '../LiasseHeader'
import type { PageProps } from '../../types'

const Suppl7: React.FC<PageProps> = ({ entreprise }) => {
  return (
    <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
      <LiasseHeader entreprise={entreprise} pageNumber="75" />
      <Typography sx={{ fontSize: '9pt', fontWeight: 700, textAlign: 'center', mb: 2, fontFamily: 'inherit' }}>
        SUPPLEMENT 7
      </Typography>
      <Box sx={{ border: '0.5px solid #d4d4d4', minHeight: 400, p: 1 }}>
        <Typography sx={{ fontSize: '7.5pt', color: '#737373', fontFamily: 'inherit' }}>
          Page supplementaire a completer
        </Typography>
      </Box>
    </Box>
  )
}

export default Suppl7
