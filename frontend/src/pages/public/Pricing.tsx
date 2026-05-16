import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import { CheckCircle, ArrowForward } from '@mui/icons-material'
import PublicLayout from './PublicLayout'
import { useLandingContent } from '../../hooks/useLandingContent'
import { DARK_SURFACE, GOLD, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, HEADING, BODY } from './theme'

// Fonctionnalités communes à tous les plans (reflet des 169 contrôles + 80 feuillets)
const baseFeatures = [
  'Import balance CSV & Excel',
  'Plan comptable SYSCOHADA révisé (1 005 comptes)',
  'Bilan Actif & Passif complet',
  'Compte de résultat & 9 SIG',
  'TAFIRE / TFT (CAFG, FR, BFR, TN)',
  '18 notes annexes calculées',
  '169 contrôles de cohérence Proph3t',
  'Passage fiscal automatique CI',
  'Calcul IS & IMF, 7 réintégrations CGI',
  'Export Excel 84 onglets (Mode A & DGI)',
  'Comparatif N / N-1 + ratios financiers',
  'Multi-pays OHADA (17 pays)',
  'Archivage SHA-256',
]

// Différenciation par plan
const entrepriseFeatures = [
  '1 société',
  'Proph3t chatbot',
  'Support email (réponse < 48h)',
]

const cabinet10Features = [
  "Jusqu'à 10 dossiers clients",
  'Gestion équipe & rôles',
  'Proph3t chatbot',
  'E-Invoicing (UBL 2.1, CII, PEPPOL)',
  'XML télédéclaration (DSF, DAS, TVA, IS)',
  'Support prioritaire (réponse < 24h)',
]

const cabinetIllimiteFeatures = [
  'Dossiers illimités',
  'Gestion équipe avancée & SSO',
  'Proph3t chatbot',
  'E-Invoicing (UBL 2.1, CII, PEPPOL)',
  'XML télédéclaration (DSF, DAS, TVA, IS)',
  'API REST + Webhooks',
  'White-label disponible',
  'SLA 99.9% & account manager dédié',
  'Support prioritaire 24h/24',
]

// Pour la table comparative (lignes = matrice de toutes les features avec mark per plan)
type Tier = 'ent' | 'cab10' | 'cabIll'
const featureMatrix: { label: string; tiers: Record<Tier, boolean> }[] = [
  ...baseFeatures.map((f) => ({ label: f, tiers: { ent: true, cab10: true, cabIll: true } })),
  { label: '1 société', tiers: { ent: true, cab10: false, cabIll: false } },
  { label: "Jusqu'à 10 dossiers clients", tiers: { ent: false, cab10: true, cabIll: false } },
  { label: 'Dossiers illimités', tiers: { ent: false, cab10: false, cabIll: true } },
  { label: 'Gestion équipe & rôles', tiers: { ent: false, cab10: true, cabIll: true } },
  { label: 'SSO entreprise', tiers: { ent: false, cab10: false, cabIll: true } },
  { label: 'E-Invoicing (UBL 2.1, CII, PEPPOL)', tiers: { ent: false, cab10: true, cabIll: true } },
  { label: 'XML télédéclaration (DSF, DAS, TVA, IS)', tiers: { ent: false, cab10: true, cabIll: true } },
  { label: 'API REST + Webhooks', tiers: { ent: false, cab10: false, cabIll: true } },
  { label: 'White-label', tiers: { ent: false, cab10: false, cabIll: true } },
  { label: 'SLA 99.9%', tiers: { ent: false, cab10: false, cabIll: true } },
  { label: 'Account manager dédié', tiers: { ent: false, cab10: false, cabIll: true } },
  { label: 'Support', tiers: { ent: true, cab10: true, cabIll: true } },
]

const Pricing: React.FC = () => {
  const { content: remoteContent } = useLandingContent('taxpilot');
  const remotePricing = remoteContent?.pricing;
  const entreprisePrice = remotePricing?.plans?.[0]?.price ?? 450000;
  const cabinet10Price = remotePricing?.plans?.[1]?.price ?? 1500000;
  const cabinetIllPrice = remotePricing?.plans?.[2]?.price ?? 3000000;

  return (
  <PublicLayout>
    {/* Header */}
    <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 2, md: 4 }, textAlign: 'center' }}>
      <Box sx={{ maxWidth: 600, mx: 'auto', px: 3 }}>
        <Box component="h1" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '2.4rem', md: '3.4rem' }, color: TEXT_PRIMARY, m: 0, mb: 1 }}>
          Choisissez votre plan
        </Box>
        <Box component="p" sx={{ fontFamily: BODY, fontSize: '1.05rem', color: TEXT_SECONDARY, m: 0, lineHeight: 1.7 }}>
          Tous les plans incluent les 169 contrôles Proph3t et les 80 feuillets SYSCOHADA. Choisissez la formule adaptée à votre volume.
        </Box>
      </Box>
    </Box>

    {/* Plans (3 tiers) */}
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: { xs: 4, md: 6 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'stretch' }}>
        {/* ── Entreprise ── */}
        <Box
          sx={{
            flex: 1, p: 4, borderRadius: '14px',
            border: `1px solid ${BORDER}`, bgcolor: DARK_SURFACE,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.25rem', color: TEXT_PRIMARY, mb: 0.5 }}>
            Entreprise · 1 société
          </Box>
          <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, mb: 2 }}>
            Pour une société qui produit sa propre liasse fiscale.
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 3 }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '2.6rem', color: GOLD, lineHeight: 1 }}>{entreprisePrice.toLocaleString('fr-FR')}</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.9rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
          </Box>

          <Box
            component="a" href="https://atlasstudio.app/portal?app=liasspilot&plan=Entreprise"
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              border: `1px solid ${BORDER}`, bgcolor: 'transparent',
              color: `${TEXT_PRIMARY} !important`, fontWeight: 500, fontFamily: BODY,
              fontSize: '0.92rem', textDecoration: 'none', borderRadius: '8px', px: 3, py: 1.4, mb: 3,
              transition: 'all 0.2s', '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.03)' },
            }}
          >
            Souscrire <ArrowForward sx={{ fontSize: 16 }} />
          </Box>

          <Box sx={{ borderTop: `1px solid ${BORDER}`, pt: 2.5, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            {[...entrepriseFeatures, ...baseFeatures].map((f) => (
              <Box key={f} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 15, color: '#22c55e', mt: 0.3, flexShrink: 0 }} />
                <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, lineHeight: 1.4 }}>{f}</Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Cabinet · 10 dossiers (POPULAIRE) ── */}
        <Box
          sx={{
            flex: 1, p: 4, borderRadius: '14px',
            border: `2px solid ${GOLD}`, bgcolor: DARK_SURFACE,
            display: 'flex', flexDirection: 'column',
            position: 'relative',
            transform: { md: 'scale(1.03)' }, zIndex: 1,
          }}
        >
          <Box sx={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: GOLD, color: '#ffffff', fontFamily: BODY, fontSize: '0.73rem', fontWeight: 600, px: 2, py: 0.4, borderRadius: '999px' }}>
            POPULAIRE
          </Box>

          <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.25rem', color: TEXT_PRIMARY, mb: 0.5 }}>
            Cabinet · 10 dossiers
          </Box>
          <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, mb: 2 }}>
            Pour un cabinet jusqu'à 10 clients SYSCOHADA actifs.
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 3 }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '2.6rem', color: GOLD, lineHeight: 1 }}>{cabinet10Price.toLocaleString('fr-FR')}</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.9rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
          </Box>

          <Box
            component="a" href="https://atlasstudio.app/portal?app=liasspilot&plan=Cabinet10"
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              bgcolor: GOLD, color: '#ffffff !important', fontWeight: 500, fontFamily: BODY,
              fontSize: '0.92rem', textDecoration: 'none', borderRadius: '8px', px: 3, py: 1.4, mb: 3,
              transition: 'background 0.2s', '&:hover': { bgcolor: '#115e59' },
            }}
          >
            Souscrire <ArrowForward sx={{ fontSize: 16 }} />
          </Box>

          <Box sx={{ borderTop: `1px solid ${BORDER}`, pt: 2.5, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            {[...cabinet10Features, ...baseFeatures].map((f) => (
              <Box key={f} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 15, color: '#22c55e', mt: 0.3, flexShrink: 0 }} />
                <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, lineHeight: 1.4 }}>{f}</Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Cabinet · illimité ── */}
        <Box
          sx={{
            flex: 1, p: 4, borderRadius: '14px',
            border: `1px solid ${BORDER}`, bgcolor: DARK_SURFACE,
            display: 'flex', flexDirection: 'column',
          }}
        >
          <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.25rem', color: TEXT_PRIMARY, mb: 0.5 }}>
            Cabinet · illimité
          </Box>
          <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, mb: 2 }}>
            Pour les gros cabinets : API, SLA, white-label.
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 3 }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '2.6rem', color: GOLD, lineHeight: 1 }}>{cabinetIllPrice.toLocaleString('fr-FR')}</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.9rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
          </Box>

          <Box
            component="a" href="https://atlasstudio.app/portal?app=liasspilot&plan=CabinetIllimite"
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              border: `1px solid ${BORDER}`, bgcolor: 'transparent',
              color: `${TEXT_PRIMARY} !important`, fontWeight: 500, fontFamily: BODY,
              fontSize: '0.92rem', textDecoration: 'none', borderRadius: '8px', px: 3, py: 1.4, mb: 3,
              transition: 'all 0.2s', '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.03)' },
            }}
          >
            Souscrire <ArrowForward sx={{ fontSize: 16 }} />
          </Box>

          <Box sx={{ borderTop: `1px solid ${BORDER}`, pt: 2.5, display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            {[...cabinetIllimiteFeatures, ...baseFeatures].map((f) => (
              <Box key={f} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 15, color: '#22c55e', mt: 0.3, flexShrink: 0 }} />
                <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, lineHeight: 1.4 }}>{f}</Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ fontFamily: BODY, fontSize: '0.78rem', color: TEXT_SECONDARY, textAlign: 'center', mt: 3 }}>
        Sans engagement · Annulation à tout moment · Tarifs annuels HT
      </Box>
    </Box>

    {/* ─── Comparison table (3 tiers) ───────────────────────────── */}
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, pb: { xs: 6, md: 10 } }}>
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
        <Box sx={{ display: 'flex', borderBottom: `1px solid ${BORDER}`, bgcolor: 'rgba(15,118,110,0.04)' }}>
          <Box sx={{ flex: 2.2, px: 3, py: 1.5, fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: TEXT_PRIMARY }}>Fonctionnalité</Box>
          <Box sx={{ flex: 1, px: 2, py: 1.5, fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: TEXT_PRIMARY, textAlign: 'center' }}>Entreprise</Box>
          <Box sx={{ flex: 1, px: 2, py: 1.5, fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: GOLD, textAlign: 'center' }}>Cabinet 10</Box>
          <Box sx={{ flex: 1, px: 2, py: 1.5, fontFamily: BODY, fontSize: '0.82rem', fontWeight: 600, color: TEXT_PRIMARY, textAlign: 'center' }}>Illimité</Box>
        </Box>
        {/* Feature rows */}
        {featureMatrix.map((row, i) => (
          <Box key={row.label} sx={{ display: 'flex', borderBottom: i < featureMatrix.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
            <Box sx={{ flex: 2.2, px: 3, py: 1.2, fontFamily: BODY, fontSize: '0.8rem', color: TEXT_SECONDARY }}>{row.label}</Box>
            <Box sx={{ flex: 1, px: 2, py: 1.2, textAlign: 'center' }}>
              {row.tiers.ent ? <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} /> : <Box sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', opacity: 0.5 }}>—</Box>}
            </Box>
            <Box sx={{ flex: 1, px: 2, py: 1.2, textAlign: 'center' }}>
              {row.tiers.cab10 ? <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} /> : <Box sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', opacity: 0.5 }}>—</Box>}
            </Box>
            <Box sx={{ flex: 1, px: 2, py: 1.2, textAlign: 'center' }}>
              {row.tiers.cabIll ? <CheckCircle sx={{ fontSize: 16, color: '#22c55e' }} /> : <Box sx={{ color: TEXT_SECONDARY, fontSize: '0.85rem', opacity: 0.5 }}>—</Box>}
            </Box>
          </Box>
        ))}
        {/* Price row */}
        <Box sx={{ display: 'flex', borderTop: `1px solid ${BORDER}`, bgcolor: 'rgba(15,118,110,0.04)' }}>
          <Box sx={{ flex: 2.2, px: 3, py: 1.5, fontFamily: BODY, fontSize: '0.85rem', fontWeight: 600, color: TEXT_PRIMARY }}>Prix</Box>
          <Box sx={{ flex: 1, px: 2, py: 1.5, textAlign: 'center' }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '1.05rem', color: GOLD }}>{entreprisePrice.toLocaleString('fr-FR')}</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
          </Box>
          <Box sx={{ flex: 1, px: 2, py: 1.5, textAlign: 'center' }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '1.05rem', color: GOLD }}>{cabinet10Price.toLocaleString('fr-FR')}</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.7rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
          </Box>
          <Box sx={{ flex: 1, px: 2, py: 1.5, textAlign: 'center' }}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '1.05rem', color: GOLD }}>{cabinetIllPrice.toLocaleString('fr-FR')}</Box>
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
          bgcolor: GOLD, color: '#ffffff !important', fontWeight: 500, fontFamily: BODY,
          fontSize: '0.95rem', textDecoration: 'none', borderRadius: '8px', px: 4, py: 1.6,
          transition: 'background 0.2s', '&:hover': { bgcolor: '#115e59' },
        }}
      >
        Contactez-nous <ArrowForward sx={{ fontSize: 16 }} />
      </Box>
    </Box>
  </PublicLayout>
  )
}

export default Pricing
