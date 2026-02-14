import { useState } from 'react'
import { Box, Fab } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Proph3tChatPanel from './Proph3tChatPanel'

export default function Proph3tFloatingBall() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Chat panel */}
      <Proph3tChatPanel open={open} onClose={() => setOpen(false)} />

      {/* Floating ball */}
      <Fab
        onClick={() => setOpen(prev => !prev)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1400,
          width: 56,
          height: 56,
          bgcolor: '#171717',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#262626',
            transform: 'scale(1.1)',
          },
          // Pulse glow animation when closed
          ...(!open && {
            animation: 'prophet-pulse 3s ease-in-out infinite',
            '@keyframes prophet-pulse': {
              '0%, 100%': { boxShadow: '0 4px 14px rgba(0,0,0,0.25)' },
              '50%': { boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 0 20px rgba(23,23,23,0.15)' },
            },
          }),
        }}
      >
        {open ? (
          <CloseIcon />
        ) : (
          <Box
            component="span"
            sx={{
              fontFamily: "'Grand Hotel', cursive",
              fontSize: '1.6rem',
              lineHeight: 1,
              mt: '-2px', // optical alignment
            }}
          >
            P
          </Box>
        )}
      </Fab>
    </>
  )
}
