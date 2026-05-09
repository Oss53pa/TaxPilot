import React, { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Box, IconButton, Drawer } from '@mui/material'
import { DarkMode, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material'
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
  const [drawerOpen, setDrawerOpen] = useState(false)

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
            fontSize: { xs: '1.2rem', md: '1.5rem' },
            color: `${TEXT_PRIMARY} !important`,
            lineHeight: 1,
            textDecoration: 'none',
          }}
        >
          Atlas Studio
        </Box>
        <Box component="span" sx={{ color: `${TEXT_SECONDARY} !important`, fontSize: '0.95rem', mx: 0.5, fontFamily: BODY, display: { xs: 'none', sm: 'inline' } }}>/</Box>
        <Box
          component={RouterLink}
          to="/landing"
          sx={{
            fontFamily: BRAND,
            fontSize: '1.05rem',
            color: `${GOLD} !important`,
            textDecoration: 'none',
            display: { xs: 'none', sm: 'inline' },
          }}
        >
          Liass'Pilot
        </Box>
      </Box>

      {/* Center: nav links (desktop) */}
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

      {/* Right: actions (desktop) */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2.5 }}>
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
            color: '#ffffff !important',
            fontWeight: 600,
            fontFamily: BODY,
            fontSize: '0.82rem',
            textDecoration: 'none',
            borderRadius: '6px',
            px: 2.2,
            py: 0.8,
            lineHeight: 1.5,
            transition: 'background 0.2s',
            '&:hover': { bgcolor: '#115e59 !important' },
          }}
        >
          Souscrire
        </Box>
      </Box>

      {/* Mobile hamburger */}
      <IconButton
        onClick={() => setDrawerOpen(true)}
        sx={{ display: { xs: 'inline-flex', md: 'none' }, color: TEXT_PRIMARY }}
        aria-label="Ouvrir le menu"
      >
        <MenuIcon />
      </IconButton>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#0F0F0F',
            color: TEXT_PRIMARY,
            width: 280,
            borderLeft: `1px solid ${BORDER}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}` }}>
          <Box sx={{ fontFamily: BRAND, fontSize: '1.1rem', color: GOLD }}>Liass'Pilot</Box>
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: TEXT_SECONDARY }} aria-label="Fermer">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', py: 1 }}>
          {navLinks.map((link) => (
            <Box
              key={link.label}
              component={RouterLink}
              to={link.to}
              onClick={() => setDrawerOpen(false)}
              sx={{
                color: location.pathname === link.to ? `${GOLD} !important` : `${TEXT_PRIMARY} !important`,
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontFamily: BODY,
                fontWeight: location.pathname === link.to ? 600 : 400,
                px: 2.5,
                py: 1.5,
                borderLeft: location.pathname === link.to ? `3px solid ${GOLD}` : '3px solid transparent',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              {link.label}
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 'auto', borderTop: `1px solid ${BORDER}`, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            component={RouterLink}
            to="/login"
            onClick={() => setDrawerOpen(false)}
            sx={{
              color: `${TEXT_SECONDARY} !important`,
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontFamily: BODY,
              textAlign: 'center',
              py: 1,
              border: `1px solid ${BORDER}`,
              borderRadius: '6px',
            }}
          >
            Se connecter
          </Box>
          <Box
            component="a"
            href="https://atlas-studio.org/portal?app=taxpilot"
            onClick={() => setDrawerOpen(false)}
            sx={{
              display: 'block',
              bgcolor: `${GOLD} !important`,
              color: '#ffffff !important',
              fontWeight: 600,
              fontFamily: BODY,
              fontSize: '0.88rem',
              textDecoration: 'none',
              borderRadius: '6px',
              py: 1.1,
              textAlign: 'center',
              '&:hover': { bgcolor: '#115e59 !important' },
            }}
          >
            Souscrire
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}

export default PublicNav
