import React, { useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { Box, IconButton, Drawer } from '@mui/material'
import { LightMode, PlayArrow, ArrowForward, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material'
import { TEAL, TEAL_DARK, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, BORDER_STRONG, BG_PAGE, BG_SURFACE_HOVER, BRAND, BODY } from './theme'

// Navigation principale harmonisée (5 entrées + Atlas Studio link)
const navLinks = [
  { label: 'Fonctionnalités', to: '/modules' },
  { label: 'Démo', to: '/demo' },
  { label: 'Tarifs', to: '/pricing' },
  { label: 'FAQ', to: '/faq' },
]

const PublicNav: React.FC = () => {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Style commun pour TOUS les liens textuels du nav (gauche, centre, droite "Se connecter")
  const navLinkSx = (active: boolean) => ({
    color: active ? `${TEXT_PRIMARY} !important` : `${TEXT_SECONDARY} !important`,
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontFamily: BODY,
    fontWeight: active ? 600 : 500,
    letterSpacing: '0.01em',
    transition: 'color 0.2s',
    cursor: 'pointer',
    '&:hover': { color: `${TEAL} !important` },
  })

  return (
    <Box
      component="nav"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        bgcolor: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${BORDER}`,
        px: { xs: 2, md: 5 },
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Left: brand */}
      <Box
        component={RouterLink}
        to="/landing"
        sx={{
          fontFamily: BRAND,
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          color: `${TEXT_PRIMARY} !important`,
          lineHeight: 1,
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        Liass'Pilot
      </Box>

      {/* Center: nav links (desktop) */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3.5 }}>
        {navLinks.map((link) => (
          <Box
            key={link.label}
            component={RouterLink}
            to={link.to}
            sx={navLinkSx(location.pathname === link.to)}
          >
            {link.label}
          </Box>
        ))}
        <Box
          component="a"
          href="https://atlasstudio.app"
          target="_blank"
          rel="noopener noreferrer"
          sx={navLinkSx(false)}
        >
          Atlas Studio
        </Box>
      </Box>

      {/* Right: actions (desktop) — théme + se connecter + Démo + Souscrire */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
        {/* Theme toggle (placeholder visuel) */}
        <IconButton
          aria-label="Mode clair"
          sx={{
            color: `${TEXT_SECONDARY} !important`,
            p: 0.5,
            '&:hover': { color: `${TEAL} !important`, bgcolor: 'transparent' },
          }}
        >
          <LightMode sx={{ fontSize: 18 }} />
        </IconButton>

        {/* Se connecter — même style que les nav links */}
        <Box
          component={RouterLink}
          to="/login"
          sx={navLinkSx(false)}
        >
          Se connecter
        </Box>

        {/* Démo — bouton secondaire (outline) */}
        <Box
          component={RouterLink}
          to="/demo"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            color: `${TEXT_PRIMARY} !important`,
            bgcolor: `${BG_PAGE} !important`,
            border: `1px solid ${BORDER_STRONG}`,
            fontFamily: BODY,
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
            borderRadius: '8px',
            px: 1.8,
            py: 0.7,
            lineHeight: 1.4,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: `${BG_SURFACE_HOVER} !important`,
              borderColor: `${TEAL} !important`,
              color: `${TEAL} !important`,
            },
          }}
        >
          <PlayArrow sx={{ fontSize: 14 }} /> Démo
        </Box>

        {/* Souscrire — CTA primaire (filled) */}
        <Box
          component="a"
          href="https://atlasstudio.app/portal?app=liasspilot"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.6,
            bgcolor: `${TEAL} !important`,
            color: '#ffffff !important',
            fontFamily: BODY,
            fontSize: '0.85rem',
            fontWeight: 600,
            textDecoration: 'none',
            borderRadius: '8px',
            px: 2,
            py: 0.7,
            lineHeight: 1.4,
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px rgba(15,118,110,0.15)',
            '&:hover': {
              bgcolor: `${TEAL_DARK} !important`,
              boxShadow: '0 4px 12px rgba(15,118,110,0.25)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          Souscrire <ArrowForward sx={{ fontSize: 14 }} />
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
            bgcolor: BG_PAGE,
            color: TEXT_PRIMARY,
            width: 280,
            borderLeft: `1px solid ${BORDER}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}` }}>
          <Box sx={{ fontFamily: BRAND, fontSize: '1.2rem', color: TEXT_PRIMARY }}>Liass'Pilot</Box>
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
                color: location.pathname === link.to ? `${TEAL} !important` : `${TEXT_PRIMARY} !important`,
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontFamily: BODY,
                fontWeight: location.pathname === link.to ? 600 : 500,
                px: 2.5,
                py: 1.5,
                borderLeft: location.pathname === link.to ? `3px solid ${TEAL}` : '3px solid transparent',
                '&:hover': { bgcolor: BG_SURFACE_HOVER },
              }}
            >
              {link.label}
            </Box>
          ))}
          <Box
            component="a"
            href="https://atlasstudio.app"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setDrawerOpen(false)}
            sx={{
              color: `${TEXT_PRIMARY} !important`,
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontFamily: BODY,
              fontWeight: 500,
              px: 2.5,
              py: 1.5,
              borderLeft: '3px solid transparent',
              '&:hover': { bgcolor: BG_SURFACE_HOVER },
            }}
          >
            Atlas Studio ↗
          </Box>
        </Box>

        <Box sx={{ mt: 'auto', borderTop: `1px solid ${BORDER}`, p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            component={RouterLink}
            to="/login"
            onClick={() => setDrawerOpen(false)}
            sx={{
              color: `${TEXT_PRIMARY} !important`,
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontFamily: BODY,
              fontWeight: 600,
              textAlign: 'center',
              py: 1,
              border: `1px solid ${BORDER_STRONG}`,
              borderRadius: '8px',
            }}
          >
            Se connecter
          </Box>
          <Box
            component="a"
            href="https://atlasstudio.app/portal?app=liasspilot"
            onClick={() => setDrawerOpen(false)}
            sx={{
              display: 'block',
              bgcolor: `${TEAL} !important`,
              color: '#ffffff !important',
              fontWeight: 600,
              fontFamily: BODY,
              fontSize: '0.9rem',
              textDecoration: 'none',
              borderRadius: '8px',
              py: 1.1,
              textAlign: 'center',
              '&:hover': { bgcolor: `${TEAL_DARK} !important` },
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
