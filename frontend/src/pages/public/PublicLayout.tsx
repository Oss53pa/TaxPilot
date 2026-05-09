import React from 'react'
import { Box, GlobalStyles } from '@mui/material'
import PublicNav from './PublicNav'
import PublicFooter from './PublicFooter'
import { DARK, TEXT_PRIMARY, BODY } from './theme'

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <GlobalStyles
      styles={{
        'body, html': {
          backgroundColor: `${DARK} !important`,
        },
      }}
    />
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: `${DARK} !important`,
        color: `${TEXT_PRIMARY} !important`,
        fontFamily: BODY,
        '& *:not(style)': {
          borderColor: 'rgba(0,0,0,0.07)',
        },
      }}
    >
      <PublicNav />
      {children}
      <PublicFooter />
    </Box>
  </>
)

export default PublicLayout
