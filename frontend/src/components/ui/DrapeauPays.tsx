/**
 * DrapeauPays — SVG flags for OHADA zone countries
 * Inline SVG, no external dependencies
 */
import React from 'react'
import { Box, Typography } from '@mui/material'

interface DrapeauPaysProps {
  codePays: string;
  width?: number;
  height?: number;
}

const FLAGS: Record<string, React.ReactNode> = {
  CI: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="600" fill="#F77F00" />
      <rect x="300" width="300" height="600" fill="#FFFFFF" />
      <rect x="600" width="300" height="600" fill="#009A44" />
    </svg>
  ),
  CM: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="600" fill="#007A5E" />
      <rect x="300" width="300" height="600" fill="#CE1126" />
      <rect x="600" width="300" height="600" fill="#FCD116" />
      <polygon points="450,180 468,240 530,240 480,275 498,335 450,300 402,335 420,275 370,240 432,240" fill="#FCD116" />
    </svg>
  ),
  SN: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="600" fill="#00853F" />
      <rect x="300" width="300" height="600" fill="#FDEF42" />
      <rect x="600" width="300" height="600" fill="#E31B23" />
      <polygon points="450,210 464,255 511,255 474,280 488,325 450,300 412,325 426,280 389,255 436,255" fill="#00853F" />
    </svg>
  ),
  GA: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="200" fill="#009E60" />
      <rect y="200" width="900" height="200" fill="#FCD116" />
      <rect y="400" width="900" height="200" fill="#003189" />
    </svg>
  ),
  BJ: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="360" height="600" fill="#008751" />
      <rect x="360" width="540" height="300" fill="#FCD116" />
      <rect x="360" y="300" width="540" height="300" fill="#E8112D" />
    </svg>
  ),
  TG: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="120" fill="#006A4E" />
      <rect y="120" width="900" height="120" fill="#FCD116" />
      <rect y="240" width="900" height="120" fill="#006A4E" />
      <rect y="360" width="900" height="120" fill="#FCD116" />
      <rect y="480" width="900" height="120" fill="#006A4E" />
      <rect width="360" height="360" fill="#D21034" />
      <polygon points="180,80 198,140 260,140 210,175 228,235 180,200 132,235 150,175 100,140 162,140" fill="#FFFFFF" />
    </svg>
  ),
  ML: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="600" fill="#009A3B" />
      <rect x="300" width="300" height="600" fill="#FCD116" />
      <rect x="600" width="300" height="600" fill="#CE1126" />
    </svg>
  ),
  BF: (
    <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="900" height="300" fill="#EF2B2D" />
      <rect y="300" width="900" height="300" fill="#009E49" />
      <polygon points="450,180 468,240 530,240 480,275 498,335 450,300 402,335 420,275 370,240 432,240" fill="#FCD116" />
    </svg>
  ),
}

export function DrapeauPays({ codePays, width = 60, height = 40 }: DrapeauPaysProps) {
  const code = codePays?.toUpperCase()
  const flag = FLAGS[code]

  if (!flag) {
    return (
      <Box sx={{
        width, height, display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: '#e5e5e5', borderRadius: 0.5, border: '1px solid #ddd',
      }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#888' }}>{code || '??'}</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{
      width, height, overflow: 'hidden', borderRadius: 0.5, border: '1px solid #ddd',
      '& svg': { width: '100%', height: '100%', display: 'block' },
    }}>
      {flag}
    </Box>
  )
}
