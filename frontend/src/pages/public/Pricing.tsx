import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import { CheckCircle, ArrowForward } from '@mui/icons-material'
import PublicLayout from './PublicLayout'
import { DARK_SURFACE, GOLD, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, HEADING, BODY } from './theme'

const features = [
  'Import balance CSV & Excel',
  'Plan comptable SYSCOHADA révisé (1 005 comptes)',
  'Bilan Actif & Passif complet',
  'Compte de résultat & 9 SIG',
  'TAFIRE / TFT (CAFG, FR, BFR, TN)',
  '18 notes annexes calculées',
  '129 contrôles de cohérence Proph3t',
  'Passage fiscal automatique CI',
  '7 réintégrations fiscales auto (CGI)',
  'Calcul IS & IMF',
  'Export Excel 84 onglets (Mode A)',
  'Export Excel template DGI (Mode B)',
  'Comparatif N / N-1',
  'Ratios financiers',
  'Archivage SHA-256',
  'Proph3t chatbot',
  'Multi-pays OHADA (17 pays)',
  'Secteurs spécialisés (banque, assurance, microfinance, EBNL)',
  'E-Invoicing (UBL 2.1, CII, PEPPOL)',
  'XML télédéclaration (DSF, DAS, TVA, IS)',
  'Audit trail & workflow de validation',
  'Support email & prioritaire',
]

const Pricing: React.FC = () => (
  <PublicLayout>
    {/* Header */}
    <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 2, md: 4 }, textAlign: 'center' }}>
      <Box sx={{ maxWidth: 600, mx: 'auto', px: 3 }}>
        <Box component="h1" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '2.4rem', md: '3.4rem' }, color: TEXT_PRIMARY, m: 0, mb: 1 }}>
          Choisissez votre plan
        </Box>
        <Box component="p" sx={{ fontFamily: BODY, fontSize: '1.05rem', color: TEXT_SECONDARY, m: 0, lineHeight: 1.7 }}>
          Toutes les fonctionnalités incluses. Choisissez la formule adaptée à votre taille.
        </Box>
      </Box>
    </Box>

    {/* Plans */}
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, py: { xs: 4, md: 6 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'stretch' }}>
        {/* Entreprise */}
        <Box
          sx={{
            flex: 1, p: 4, borderRadius: '14px',
            border: `1px solid ${BORDER}`, bgcolor: DARK_SURFACE,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.3rem', color: TEXT_PRIMARY, mb: 0.5 }}>
            Entreprise · 1 société
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 3 }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '2.8rem', color: GOLD, lineHeight: 1 }}>250 000</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.9rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
          </Box>

          <Box
            component="a" href="https://atlas-studio.org/portal?app=taxpilot&plan=Entreprise"
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              border: `1px solid ${BORDER}`, bgcolor: 'transparent',
              color: `${TEXT_PRIMARY} !important`, fontWeight: 500, fontFamily: BODY,
              fontSize: '0.92rem', textDecoration: 'none', borderRadius: '8px', px: 3, py: 1.4, mb: 3,
              transition: 'all 0.2s', '&:hover': { borderColor: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.03)' },
            }}
          >
            Souscrire <ArrowForward sx={{ fontSize: 16 }} />
          </Box>

          <Box sx={{ borderTop: `1px solid ${BORDER}`, pt: 2.5, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            {features.map((f) => (
              <Box key={f} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 15, color: '#22c55e', mt: 0.3, flexShrink: 0 }} />
                <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, lineHeight: 1.4 }}>{f}</Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Cabinet */}
        <Box
          sx={{
            flex: 1, p: 4, borderRadius: '14px',
            border: `2px solid ${GOLD}`, bgcolor: DARK_SURFACE,
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            transform: { md: 'scale(1.03)' }, zIndex: 1,
          }}
        >
          <Box sx={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: GOLD, color: '#1a1200', fontFamily: BODY, fontSize: '0.73rem', fontWeight: 600, px: 2, py: 0.4, borderRadius: '999px' }}>
            POPULAIRE
          </Box>

          <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.3rem', color: TEXT_PRIMARY, mb: 0.5 }}>
            Cabinet · illimité
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 3 }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '2.8rem', color: GOLD, lineHeight: 1 }}>1 500 000</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.9rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
          </Box>

          <Box
            component="a" href="https://atlas-studio.org/portal?app=taxpilot&plan=Cabinet"
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              bgcolor: GOLD, color: '#1a1200 !important', fontWeight: 500, fontFamily: BODY,
              fontSize: '0.92rem', textDecoration: 'none', borderRadius: '8px', px: 3, py: 1.4, mb: 3,
              transition: 'background 0.2s', '&:hover': { bgcolor: '#d4b35a' },
            }}
          >
            Souscrire <ArrowForward sx={{ fontSize: 16 }} />
          </Box>

          <Box sx={{ borderTop: `1px solid ${BORDER}`, pt: 2.5, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            {features.map((f) => (
              <Box key={f} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 15, color: '#22c55e', mt: 0.3, flexShrink: 0 }} />
                <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, lineHeight: 1.4 }}>{f}</Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ fontFamily: BODY, fontSize: '0.78rem', color: TEXT_SECONDARY, textAlign: 'center', mt: 3 }}>
        Sans engagement · Annulation à tout moment
      </Box>
    </Box>

    {/* ─── Comparison table ───────────────────────────── */}
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, pb: { xs: 6, md: 10 } }}>
      <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: { xs: '1.6rem', md: '2rem' }, color: TEXT_PRIMARY, m: 0, mb: 4, textAlign: 'center' }}>
        Comparez les plans en détail
      </Box>

      <Box
        sx={{
          borderRadius: '14px',
          border: `1px solid ${BORDER}`,
          bgcolor: DARK_SURFACE,
          overflow: 'hidden',
        }}
      >
        {/* Header row */}
        <Box sx={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, bgcolor: 'rgba(201,168,76,0.04)' }}>
          <Box sx={{ flex: 2, px: 3, py: 1.5, fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: TEXT_PRIMARY }}>Fonctionnalité</Box>
          <Box sx={{ flex: 1, px: 2, py: 1.5, fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: TEXT_PRIMARY, textAlign: 'center' }}>Entreprise</Box>
          <Box sx={{ flex: 1, px: 2, py: 1.5, fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: GOLD, textAlign: 'center' }}>Cabinet</Box>
        </Box>
        {/* Feature rows */}
        {features.map((f, i) => (
          <Box key={f} sx={{ display: 'flex', borderBottom: i < features.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <Box sx={{ flex: 2, px: 3, py: 1.2, fontFamily: BODY, fontSize: '0.8rem', color: TEXT_SECONDARY }}>{f}</Box>
            <Box sx={{ flex: 1, px: 2, py: 1.2, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} />
            </Box>
            <Box sx={{ flex: 1, px: 2, py: 1.2, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} />
            </Box>
          </Box>
        ))}
        {/* Price row */}
        <Box sx={{ display: 'flex', borderTop: `1px solid ${BORDER}`, bgcolor: 'rgba(201,168,76,0.04)' }}>
          <Box sx={{ flex: 2, px: 3, py: 1.5, fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, color: TEXT_PRIMARY }}>Prix</Box>
          <Box sx={{ flex: 1, px: 2, py: 1.5, textAlign: 'center' }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '1.1rem', color: GOLD }}>250 000</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
          </Box>
          <Box sx={{ flex: 1, px: 2, py: 1.5, textAlign: 'center' }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '1.1rem', color: GOLD }}>1 500 000</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
          </Box>
        </Box>
      </Box>
    </Box>

    {/* CTA */}
    <Box sx={{ textAlign: 'center', py: { xs: 6, md: 8 } }}>
      <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: { xs: '1.8rem', md: '2.2rem' }, color: TEXT_PRIMARY, m: 0, mb: 1.5 }}>
        Des questions sur nos tarifs ?
      </Box>
      <Box component="p" sx={{ fontFamily: BODY, color: TEXT_SECONDARY, fontSize: '0.95rem', m: 0, mb: 4 }}>
        Notre équipe est disponible pour vous accompagner.
      </Box>
      <Box
        component={RouterLink} to="/contact"
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          bgcolor: GOLD, color: '#1a1200 !important', fontWeight: 500, fontFamily: BODY,
          fontSize: '0.95rem', textDecoration: 'none', borderRadius: '8px', px: 4, py: 1.6,
          transition: 'background 0.2s', '&:hover': { bgcolor: '#d4b35a' },
        }}
      >
        Contactez-nous <ArrowForward sx={{ fontSize: 16 }} />
      </Box>
    </Box>
  </PublicLayout>
)

export default Pricing
