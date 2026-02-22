import React from 'react'
import { Box, Typography } from '@mui/material'
import { usePrintMode } from '@/components/liasse/PrintModeContext'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
  label?: string
}

export function TabPanel({ children, value, index, label, ...other }: TabPanelProps) {
  const printMode = usePrintMode()

  if (printMode) {
    return (
      <Box sx={{ pt: 1 }}>
        {label && (
          <Typography sx={{ fontWeight: 700, fontSize: 13, mb: 1, '@media screen': { display: 'none' } }}>
            {label}
          </Typography>
        )}
        {children}
      </Box>
    )
  }

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  )
}
