import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import { DARK, BORDER, GOLD, TEXT_PRIMARY, TEXT_SECONDARY, BRAND, BODY } from './theme'

const PublicFooter: React.FC = () => (
  <Box sx={{ bgcolor: `${DARK} !important`, borderTop: `1px solid ${BORDER}`, pt: 6, pb: 4 }}>
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: { xs: 3, md: 5 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 1fr' },
          gap: { xs: 4, md: 5 },
          mb: 5,
        }}
      >
        {/* Brand */}
        <Box>
          <Box sx={{ fontFamily: BRAND, fontSize: '1.6rem', color: `${TEXT_PRIMARY} !important`, mb: 1.5 }}>
            Atlas Studio
          </Box>
          <Box sx={{ color: `${TEXT_SECONDARY} !important`, fontFamily: BODY, fontSize: '0.92rem', maxWidth: 280, lineHeight: 1.7 }}>
            Liass'Pilot — Liasse fiscale SYSCOHADA automatisée pour les 17 pays OHADA.
          </Box>
        </Box>

        {/* Applications */}
        <Box>
          <Box sx={{ color: `${TEXT_PRIMARY} !important`, fontWeight: 600, fontFamily: BODY, fontSize: '0.92rem', mb: 2 }}>
            Applications
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {[
              { label: 'Fonctionnalités', to: '/modules' },
              { label: 'Tarifs', to: '/pricing' },
              { label: 'Démo', to: '/demo' },
            ].map((l) => (
              <Box key={l.label} component={RouterLink} to={l.to} sx={{ color: `${TEXT_SECONDARY} !important`, fontFamily: BODY, fontSize: '0.92rem', textDecoration: 'none', transition: 'color 0.2s', '&:hover': { color: `${GOLD} !important` } }}>
                {l.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Ressources */}
        <Box>
          <Box sx={{ color: `${TEXT_PRIMARY} !important`, fontWeight: 600, fontFamily: BODY, fontSize: '0.92rem', mb: 2 }}>
            Ressources
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {[
              { label: 'Blog', to: '/blog' },
              { label: 'FAQ', to: '/faq' },
              { label: 'À propos', to: '/about' },
            ].map((l) => (
              <Box key={l.label} component={RouterLink} to={l.to} sx={{ color: `${TEXT_SECONDARY} !important`, fontFamily: BODY, fontSize: '0.92rem', textDecoration: 'none', transition: 'color 0.2s', '&:hover': { color: `${GOLD} !important` } }}>
                {l.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Légal */}
        <Box>
          <Box sx={{ color: `${TEXT_PRIMARY} !important`, fontWeight: 600, fontFamily: BODY, fontSize: '0.92rem', mb: 2 }}>
            Légal
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {[
              { label: 'Contact', to: '/contact' },
              { label: 'Mentions légales', to: '/mentions-legales' },
              { label: 'CGU', to: '/cgu' },
              { label: 'Confidentialité', to: '/confidentialite' },
            ].map((l) => (
              <Box key={l.label} component={RouterLink} to={l.to} sx={{ color: `${TEXT_SECONDARY} !important`, fontFamily: BODY, fontSize: '0.92rem', textDecoration: 'none', transition: 'color 0.2s', '&:hover': { color: `${GOLD} !important` } }}>
                {l.label}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Bottom */}
      <Box sx={{ borderTop: `1px solid ${BORDER}`, pt: 3, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ color: `${TEXT_SECONDARY} !important`, fontFamily: BODY, fontSize: '0.85rem' }}>
          © 2025 Atlas Studio. Tous droits réservés.
        </Box>
      </Box>
    </Box>
  </Box>
)

export default PublicFooter
