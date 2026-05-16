import React from 'react'
import { Box } from '@mui/material'
import LiasseFiscaleModule from '@/modules/liasse-fiscale'

const LiasseFiscale: React.FC = () => {
  // data-tour anchor pour GuidedTour step "liasse" — wrapper neutre
  // (height/width 100% pour ne pas casser le layout du module enfant).
  return (
    <Box data-tour="liasse" sx={{ width: '100%', height: '100%' }}>
      <LiasseFiscaleModule />
    </Box>
  )
}

export default LiasseFiscale
