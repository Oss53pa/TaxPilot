import React from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Box } from '@mui/material'
import { DarkMode } from '@mui/icons-material'
import { GOLD, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, BRAND, BODY } from './theme'

const navLinks = [
  { label: 'Fonctionnalités', to: '/modules' },
  { label: 'Tarifs', to: '/pricing' },
  { label: 'Démo', to: '/demo' },
  { label: 'Blog', to: '/blog' },
  { label: 'À propos', to: '/about' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', to: '/contact' },
]

const PublicNav: React.FC = () => {
  const location = useLocation()

  return (
    <Box
      component="nav"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: 'rgba(17,17,17,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${BORDER}`,
        px: { xs: 2, md: 5 },
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left: brand */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
        <Box
          component={RouterLink}
          to="/landing"
          sx={{
            fontFamily: BRAND,
            fontSize: '1.5rem',
            color: `${TEXT_PRIMARY} !important`,
            lineHeight: 1,
            textDecoration: 'none',
          }}
        >
          Atlas Studio
        </Box>
        <Box component="span" sx={{ color: `${TEXT_SECONDARY} !important`, fontSize: '0.95rem', mx: 0.5, fontFamily: BODY }}>/</Box>
        <Box
          component={RouterLink}
          to="/landing"
          sx={{
            fontFamily: BRAND,
            fontSize: '1.05rem',
            color: `${GOLD} !important`,
            textDecoration: 'none',
          }}
        >
          Liass'Pilot
        </Box>
      </Box>

      {/* Center: nav links */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2.5 }}>
        {navLinks.map((link) => (
          <Box
            key={link.label}
            component={RouterLink}
            to={link.to}
            sx={{
              color: location.pathname === link.to ? `${TEXT_PRIMARY} !important` : `${TEXT_SECONDARY} !important`,
              textDecoration: 'none',
              fontSize: '0.88rem',
              fontFamily: BODY,
              fontWeight: location.pathname === link.to ? 600 : 400,
              transition: 'color 0.2s',
              '&:hover': { color: `${TEXT_PRIMARY} !important` },
            }}
          >
            {link.label}
          </Box>
        ))}
      </Box>

      {/* Right: actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <DarkMode sx={{ color: `${TEXT_SECONDARY} !important`, fontSize: 18, cursor: 'pointer', opacity: 0.7 }} />
        <Box
          component={RouterLink}
          to="/login"
          sx={{
            color: `${TEXT_SECONDARY} !important`,
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontFamily: BODY,
            fontWeight: 400,
            '&:hover': { color: `${TEXT_PRIMARY} !important` },
          }}
        >
          Se connecter
        </Box>
        <Box
          component="a"
          href="https://atlas-studio.org/portal?app=taxpilot"
          sx={{
            display: 'inline-block',
            bgcolor: `${GOLD} !important`,
            color: '#1a1200 !important',
            fontWeight: 600,
            fontFamily: BODY,
            fontSize: '0.82rem',
            textDecoration: 'none',
            borderRadius: '6px',
            px: 2.2,
            py: 0.8,
            lineHeight: 1.5,
            transition: 'background 0.2s',
            '&:hover': { bgcolor: '#d4b35a !important' },
          }}
        >
          Souscrire
        </Box>
      </Box>
    </Box>
  )
}

export default PublicNav
