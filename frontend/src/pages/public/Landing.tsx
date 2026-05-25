import React, { useEffect, useRef } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Avatar, AvatarGroup, keyframes } from '@mui/material'
import { AutoAwesome, ArrowForward } from '@mui/icons-material'
import PublicLayout from './PublicLayout'
import { useLandingContent } from '../../hooks/useLandingContent'
import { DARK, DARK_SURFACE, GOLD, GOLD_RGB, GOLD_MUTED, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, BORDER_STRONG, BG_PAGE, HEADING, BODY } from './theme'

// ─── Keyframe animations ─────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
`
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`
const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
`
const slideRight = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
`
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`
const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(15,118,110,0.3); }
  50%      { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
`
const countUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ─── Scroll-reveal hook ──────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

const Reveal: React.FC<{ children: React.ReactNode; delay?: number; direction?: 'up' | 'scale' | 'left' }> = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useReveal()
  const anim = direction === 'scale' ? scaleIn : direction === 'left' ? slideRight : fadeUp
  return (
    <Box
      ref={ref}
      sx={{
        opacity: 0,
        '&.revealed': {
          animation: `${anim} 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s forwards`,
        },
      }}
    >
      {children}
    </Box>
  )
}

// ─── Data ────────────────────────────────────────────────────
const allFeatures = [
  'Import balance CSV & Excel',
  'Plan comptable SYSCOHADA révisé (1 005 comptes)',
  'Bilan Actif & Passif complet',
  'Compte de résultat & 9 SIG',
  'TAFIRE / TFT (CAFG, FR, BFR, TN)',
  '18 notes annexes calculées',
  '169 contrôles de cohérence Proph3t',
  'Passage fiscal automatique CI',
  '7 réintégrations fiscales auto (CGI)',
  'Calcul IS & IMF',
  'Export Excel 84 onglets (Mode A)',
  'Export Excel template DGI (Mode B)',
  'Comparatif N / N-1',
  'Ratios financiers',
  'Archivage SHA-256',
  'Proph3t chatbot',
]

// ─── Component ───────────────────────────────────────────────
const Landing: React.FC = () => {
  const { content: remoteContent } = useLandingContent('taxpilot');
  const remoteStats = remoteContent?.stats;
  const stats: { value: string; label: string }[] = remoteStats?.items ?? [
    { value: '1 005', label: 'COMPTES SYSCOHADA' },
    { value: '169', label: 'CONTRÔLES PROPH3T' },
    { value: '84', label: 'ONGLETS EXCEL' },
    { value: '17', label: 'PAYS OHADA' },
  ];
  const remotePricing = remoteContent?.pricing;
  const entreprisePrice = remotePricing?.plans?.[0]?.price ?? 450000;
  const cabinet10Price = remotePricing?.plans?.[1]?.price ?? 1500000;
  const cabinetIllPrice = remotePricing?.plans?.[2]?.price ?? 3000000;

  return (
  <PublicLayout>
    {/* ─── Hero Section ───────────────────────────────── */}
    <Box sx={{ pt: { xs: 10, md: 14 }, pb: { xs: 6, md: 10 }, textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
      {/* Halo d'ambiance teal — profondeur subtile derrière le hero */}
      <Box
        sx={{
          position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
          width: 'min(900px, 120%)', height: 520, pointerEvents: 'none', zIndex: 0,
          background: `radial-gradient(circle, rgba(${GOLD_RGB},0.10) 0%, rgba(${GOLD_RGB},0.04) 35%, rgba(${GOLD_RGB},0) 70%)`,
        }}
      />
      {/* Grille fine en arrière-plan, masquée en fondu */}
      <Box
        sx={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.6,
          backgroundImage:
            'linear-gradient(rgba(28,25,23,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(28,25,23,0.035) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(70% 60% at 50% 10%, #000 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(70% 60% at 50% 10%, #000 0%, transparent 75%)',
        }}
      />
      <Box sx={{ maxWidth: 780, mx: 'auto', px: 3, position: 'relative', zIndex: 1 }}>
        {/* Badges — staggered fade in */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 5 }}>
          {['SYSCOHADA natif', 'Proph3t IA', 'Économisez 50 %+'].map((badge, i) => (
            <Box
              key={badge}
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.6,
                bgcolor: 'rgba(15,118,110,0.08)', border: '1px solid rgba(15,118,110,0.18)',
                borderRadius: '999px', px: 2, py: 0.6,
                opacity: 0,
                animation: `${fadeUp} 0.6s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.12}s forwards`,
              }}
            >
              <AutoAwesome sx={{ fontSize: 13, color: GOLD }} />
              <Box component="span" sx={{ fontSize: '0.78rem', color: GOLD, fontWeight: 500, fontFamily: BODY }}>{badge}</Box>
            </Box>
          ))}
        </Box>

        {/* Heading line 1 */}
        <Box
          component="h1"
          sx={{
            fontFamily: HEADING, fontWeight: 500,
            fontSize: { xs: '2.6rem', sm: '3.2rem', md: '3.8rem' },
            lineHeight: 1.2, color: TEXT_PRIMARY, m: 0, mb: 1,
            opacity: 0,
            animation: `${fadeUp} 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s forwards`,
          }}
        >
          Liasse fiscale SYSCOHADA
        </Box>

        {/* Heading line 2 — shimmer gold */}
        <Box
          component="h2"
          sx={{
            fontFamily: HEADING, fontWeight: 300, fontStyle: 'italic',
            fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem' },
            lineHeight: 1.2, m: 0, mb: 4,
            background: `linear-gradient(90deg, ${GOLD_MUTED} 0%, ${GOLD} 40%, ${GOLD_MUTED} 60%, ${GOLD} 100%)`,
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            opacity: 0,
            animation: `${fadeUp} 0.8s cubic-bezier(0.22,1,0.36,1) 0.45s forwards, ${shimmer} 4s linear 1.5s infinite`,
          }}
        >
          automatisée et intelligente.
        </Box>

        {/* Subtitle */}
        <Box
          component="p"
          sx={{
            fontSize: '0.95rem', fontFamily: BODY, fontWeight: 400, color: TEXT_SECONDARY,
            maxWidth: 560, mx: 'auto', lineHeight: 1.7, m: 0, mb: 4.5,
            opacity: 0,
            animation: `${fadeIn} 0.8s ease ${0.65}s forwards`,
          }}
        >
          Votre balance entre. Votre liasse sort. Conforme. Un expert-comptable facture la liasse entre{' '}
          <Box component="span" sx={{ color: TEXT_PRIMARY, fontWeight: 700 }}>500 000 et 2 000 000 FCFA</Box>.
          {' '}Liass'Pilot vous fait économiser au minimum 50 %.
        </Box>

        {/* CTA Buttons */}
        <Box
          sx={{
            display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, justifyContent: 'center', mb: 1,
            opacity: 0,
            animation: `${fadeUp} 0.7s cubic-bezier(0.22,1,0.36,1) 0.8s forwards`,
          }}
        >
          <Box
            component="a" href="https://atlasstudio.app/portal?app=liasspilot"
            sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              bgcolor: GOLD, color: '#ffffff !important', fontWeight: 500, fontFamily: BODY,
              fontSize: '0.92rem', textDecoration: 'none', borderRadius: '8px', px: 3.5, py: 1.5,
              transition: 'all 0.25s',
              animation: `${pulse} 2.5s ease 2s 3`,
              '&:hover': { bgcolor: '#115e59', transform: 'translateY(-2px)' },
            }}
          >
            Souscrire maintenant <ArrowForward sx={{ fontSize: 16 }} />
          </Box>
          <Box
            component={RouterLink} to="/demo"
            sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 0.8,
              border: '1px solid rgba(0,0,0,0.15)', bgcolor: 'transparent',
              color: `${TEXT_PRIMARY} !important`, fontWeight: 400, fontFamily: BODY,
              fontSize: '0.92rem', textDecoration: 'none', borderRadius: '8px', px: 3.5, py: 1.5,
              transition: 'all 0.25s',
              '&:hover': { borderColor: 'rgba(0,0,0,0.3)', bgcolor: 'rgba(0,0,0,0.03)', transform: 'translateY(-2px)' },
            }}
          >
            Voir la démo
          </Box>
        </Box>
        <Box sx={{ fontFamily: BODY, fontSize: '0.78rem', color: TEXT_SECONDARY, mb: 5, opacity: 0, animation: `${fadeIn} 0.6s ease 1s forwards` }}>
          Sans engagement · Annulation à tout moment
        </Box>

        {/* Social proof */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2, opacity: 0, animation: `${fadeUp} 0.6s cubic-bezier(0.22,1,0.36,1) 1.1s forwards` }}>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 30, height: 30, fontSize: '0.7rem', border: `2px solid ${DARK} !important`, bgcolor: `${GOLD} !important`, color: '#ffffff !important', fontWeight: 700, fontFamily: BODY } }}>
            <Avatar>AD</Avatar><Avatar>MC</Avatar><Avatar>IK</Avatar><Avatar>FN</Avatar>
          </AvatarGroup>
          <Box component="span" sx={{ fontSize: '0.82rem', color: TEXT_SECONDARY, fontFamily: BODY }}>
            Rejoint par <Box component="span" sx={{ color: TEXT_PRIMARY, fontWeight: 700 }}>500+ entreprises</Box> en Afrique
          </Box>
        </Box>
      </Box>
    </Box>

    {/* ─── Stats Banner — count-up on scroll ──────────── */}
    <Box sx={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, bgcolor: DARK_SURFACE, py: { xs: 5, md: 7 } }}>
      <Reveal>
        <Box sx={{ maxWidth: 1000, mx: 'auto', px: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 5, sm: 0 }, justifyContent: 'space-around', alignItems: 'center' }}>
          {stats.map((stat: { value: string; label: string }, i: number) => (
            <Box
              key={stat.label}
              sx={{
                textAlign: 'center',
                opacity: 0,
                animation: `${countUp} 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.15}s forwards`,
              }}
            >
              <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontStyle: 'italic', fontSize: { xs: '2.5rem', md: '3.2rem' }, color: GOLD, lineHeight: 1 }}>{stat.value}</Box>
              <Box sx={{ fontSize: '0.7rem', fontWeight: 500, fontFamily: BODY, letterSpacing: '0.2em', color: TEXT_SECONDARY, mt: 1 }}>{stat.label}</Box>
            </Box>
          ))}
        </Box>
      </Reveal>
    </Box>

    {/* ─── Features list ──────────────────────────────── */}
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 3 }}>
        <Reveal>
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: { xs: '2rem', md: '2.6rem' }, color: TEXT_PRIMARY, m: 0, mb: 1.5 }}>
              Fonctionnalités
            </Box>
            <Box component="p" sx={{ fontSize: '1rem', fontFamily: BODY, color: TEXT_SECONDARY, m: 0 }}>
              Votre balance entre. Votre liasse sort. Conforme.
            </Box>
          </Box>
        </Reveal>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 1.2,
          }}
        >
          {allFeatures.map((f, i) => (
            <Reveal key={f} delay={i * 0.06} direction="left">
              <Box
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.2,
                  px: 2.5, py: 1.5,
                  borderRadius: '10px',
                  border: `1px solid ${BORDER}`,
                  bgcolor: DARK_SURFACE,
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: 'rgba(15,118,110,0.25)',
                    transform: 'translateX(6px)',
                    bgcolor: 'rgba(15,118,110,0.04)',
                  },
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: GOLD, flexShrink: 0, transition: 'transform 0.3s', '.revealed:hover &': { transform: 'scale(1.5)' } }} />
                <Box sx={{ fontFamily: BODY, fontSize: '0.88rem', color: TEXT_SECONDARY, transition: 'color 0.3s' }}>{f}</Box>
              </Box>
            </Reveal>
          ))}
        </Box>

        {/* Coming soon */}
        <Reveal delay={0.2}>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: TEXT_SECONDARY, mb: 1.5 }}>Prochainement</Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {[
                'Multi-pays OHADA (17 pays)',
                'Secteurs spécialisés (banque, assurance, microfinance, EBNL)',
                'E-Invoicing (UBL 2.1, CII, PEPPOL)',
                'XML télédéclaration (DSF, DAS, TVA, IS)',
                'Audit trail & workflow de validation',
                'Support email & prioritaire',
              ].map((f) => (
                <Box
                  key={f}
                  sx={{
                    fontSize: '0.78rem', fontFamily: BODY, color: TEXT_SECONDARY,
                    bgcolor: 'rgba(0,0,0,0.03)', border: `1px solid ${BORDER}`,
                    borderRadius: '999px', px: 1.8, py: 0.4, opacity: 0.7,
                    transition: 'all 0.3s',
                    '&:hover': { opacity: 1, borderColor: 'rgba(15,118,110,0.2)' },
                  }}
                >
                  {f}
                </Box>
              ))}
            </Box>
          </Box>
        </Reveal>
      </Box>
    </Box>

    {/* ─── Comment ça marche — version compacte, 5 étapes en ligne ── */}
    <Box sx={{ bgcolor: DARK_SURFACE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, py: { xs: 7, md: 9 } }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3 }}>
        <Reveal>
          <Box sx={{ textAlign: 'center', mb: 5 }}>
            <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: { xs: '1.8rem', md: '2.2rem' }, color: TEXT_PRIMARY, m: 0, mb: 1 }}>
              Comment ça marche
            </Box>
            <Box component="p" sx={{ fontSize: '0.95rem', fontFamily: BODY, color: TEXT_SECONDARY, m: 0 }}>
              5 étapes. Zéro friction.
            </Box>
          </Box>
        </Reveal>

        <Reveal delay={0.1}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(5, 1fr)', md: 'repeat(5, 1fr)' },
              gap: { xs: 2, md: 1.5 },
              position: 'relative',
            }}
          >
            {/* Ligne de liaison en arrière-plan (desktop uniquement) */}
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                top: 28,
                left: '10%',
                right: '10%',
                height: '1px',
                background: `linear-gradient(90deg, transparent 0%, rgba(${GOLD_RGB}, 0.25) 20%, rgba(${GOLD_RGB}, 0.25) 80%, transparent 100%)`,
                zIndex: 0,
              }}
            />

            {[
              { step: '01', title: 'Importer', desc: 'Excel / CSV / API' },
              { step: '02', title: 'Vérifier', desc: 'Balance N / N-1' },
              { step: '03', title: 'Contrôler', desc: '169 audits Proph3t' },
              { step: '04', title: 'Générer', desc: '80+ feuillets SYSCOHADA' },
              { step: '05', title: 'Exporter', desc: 'Excel DGI / PDF' },
            ].map((item) => (
              <Box
                key={item.step}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  px: 1,
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: DARK,
                    border: `1px solid rgba(${GOLD_RGB}, 0.25)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: HEADING,
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: GOLD,
                    mb: 1.8,
                    transition: 'all 0.25s',
                    '&:hover': {
                      borderColor: GOLD,
                      boxShadow: `0 0 0 4px rgba(${GOLD_RGB}, 0.08)`,
                    },
                  }}
                >
                  {item.step}
                </Box>
                <Box
                  component="h3"
                  sx={{
                    fontFamily: HEADING,
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: TEXT_PRIMARY,
                    m: 0,
                    mb: 0.5,
                  }}
                >
                  {item.title}
                </Box>
                <Box
                  sx={{
                    fontFamily: BODY,
                    fontSize: '0.78rem',
                    color: TEXT_SECONDARY,
                    lineHeight: 1.5,
                  }}
                >
                  {item.desc}
                </Box>
              </Box>
            ))}
          </Box>
        </Reveal>

        <Reveal delay={0.15}>
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Box
              component={RouterLink}
              to="/demo"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                color: `${TEXT_SECONDARY} !important`,
                fontFamily: BODY,
                fontSize: '0.85rem',
                textDecoration: 'none',
                transition: 'color 0.2s',
                '&:hover': { color: `${GOLD} !important` },
              }}
            >
              Voir la démo interactive <ArrowForward sx={{ fontSize: 14 }} />
            </Box>
          </Box>
        </Reveal>
      </Box>
    </Box>

    {/* ─── Pricing preview ────────────────────────────── */}
    <Box sx={{ bgcolor: DARK_SURFACE, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, py: { xs: 8, md: 10 } }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 3, textAlign: 'center' }}>
        <Reveal>
          <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: { xs: '2rem', md: '2.4rem' }, color: TEXT_PRIMARY, m: 0, mb: 1.5 }}>
            Choisissez votre plan
          </Box>
          <Box component="p" sx={{ fontFamily: BODY, color: TEXT_SECONDARY, fontSize: '0.95rem', m: 0, mb: 5 }}>
            Toutes les fonctionnalités incluses. Choisissez la formule adaptée à votre taille.
          </Box>
        </Reveal>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2.5, justifyItems: 'center' }}>
          {/* Plan Entreprise */}
          <Reveal delay={0.1} direction="scale">
            <Box
              sx={{
                width: '100%', maxWidth: 360, p: 3.5, borderRadius: '14px',
                border: `1px solid ${BORDER_STRONG}`, bgcolor: BG_PAGE, textAlign: 'left',
                boxShadow: '0 1px 2px rgba(28,25,23,0.04), 0 8px 24px rgba(28,25,23,0.06)',
                transition: 'all 0.35s',
                '&:hover': { borderColor: GOLD, transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(28,25,23,0.12)' },
              }}
            >
              <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.1rem', color: TEXT_PRIMARY, mb: 0.5 }}>Entreprise · 1 société</Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 0.5 }}>
                <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '2.4rem', color: GOLD, lineHeight: 1 }}>{entreprisePrice.toLocaleString('fr-FR')}</Box>
                <Box sx={{ fontFamily: BODY, fontSize: '0.85rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
              </Box>
              <Box
                component="a" href="https://atlasstudio.app/portal?app=liasspilot&plan=Entreprise"
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2.5,
                  border: `1px solid ${BORDER}`, bgcolor: 'transparent',
                  color: `${TEXT_PRIMARY} !important`, fontWeight: 500, fontFamily: BODY,
                  fontSize: '0.9rem', textDecoration: 'none', borderRadius: '8px', px: 3, py: 1.3,
                  transition: 'all 0.25s', '&:hover': { borderColor: 'rgba(0,0,0,0.3)', transform: 'translateY(-1px)' },
                }}
              >
                Souscrire <ArrowForward sx={{ fontSize: 16 }} />
              </Box>
            </Box>
          </Reveal>

          {/* Plan Cabinet · 10 dossiers (POPULAIRE) */}
          <Reveal delay={0.2} direction="scale">
            <Box
              sx={{
                width: '100%', maxWidth: 360, p: 3.5, borderRadius: '14px',
                border: `2px solid ${GOLD}`, bgcolor: BG_PAGE, textAlign: 'left', position: 'relative',
                boxShadow: '0 0 0 1px rgba(15,118,110,0.10), 0 12px 32px -8px rgba(15,118,110,0.22)',
                transition: 'all 0.35s',
                '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 48px -10px rgba(15,118,110,0.30)' },
              }}
            >
              <Box sx={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 0.5, bgcolor: GOLD, color: '#ffffff', fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600, px: 1.8, py: 0.35, borderRadius: '999px' }}>
                POPULAIRE
              </Box>
              <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.1rem', color: TEXT_PRIMARY, mb: 0.5 }}>Cabinet · 10 dossiers</Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 0.5 }}>
                <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '2.4rem', color: GOLD, lineHeight: 1 }}>{cabinet10Price.toLocaleString('fr-FR')}</Box>
                <Box sx={{ fontFamily: BODY, fontSize: '0.85rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
              </Box>
              <Box
                component="a" href="https://atlasstudio.app/portal?app=liasspilot&plan=Cabinet10"
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2.5,
                  bgcolor: GOLD, color: '#ffffff !important', fontWeight: 500, fontFamily: BODY,
                  fontSize: '0.9rem', textDecoration: 'none', borderRadius: '8px', px: 3, py: 1.3,
                  transition: 'all 0.25s', '&:hover': { bgcolor: '#115e59', transform: 'translateY(-1px)' },
                }}
              >
                Souscrire <ArrowForward sx={{ fontSize: 16 }} />
              </Box>
            </Box>
          </Reveal>

          {/* Plan Cabinet · illimité */}
          <Reveal delay={0.3} direction="scale">
            <Box
              sx={{
                width: '100%', maxWidth: 360, p: 3.5, borderRadius: '14px',
                border: `1px solid ${BORDER_STRONG}`, bgcolor: BG_PAGE, textAlign: 'left',
                boxShadow: '0 1px 2px rgba(28,25,23,0.04), 0 8px 24px rgba(28,25,23,0.06)',
                transition: 'all 0.35s',
                '&:hover': { borderColor: GOLD, transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(28,25,23,0.12)' },
              }}
            >
              <Box sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.1rem', color: TEXT_PRIMARY, mb: 0.5 }}>Cabinet · illimité</Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 0.5 }}>
                <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontSize: '2.4rem', color: GOLD, lineHeight: 1 }}>{cabinetIllPrice.toLocaleString('fr-FR')}</Box>
                <Box sx={{ fontFamily: BODY, fontSize: '0.85rem', color: TEXT_SECONDARY }}>FCFA/an</Box>
              </Box>
              <Box
                component="a" href="https://atlasstudio.app/portal?app=liasspilot&plan=CabinetIllimite"
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2.5,
                  border: `1px solid ${BORDER}`, bgcolor: 'transparent',
                  color: `${TEXT_PRIMARY} !important`, fontWeight: 500, fontFamily: BODY,
                  fontSize: '0.9rem', textDecoration: 'none', borderRadius: '8px', px: 3, py: 1.3,
                  transition: 'all 0.25s', '&:hover': { borderColor: 'rgba(0,0,0,0.3)', transform: 'translateY(-1px)' },
                }}
              >
                Souscrire <ArrowForward sx={{ fontSize: 16 }} />
              </Box>
            </Box>
          </Reveal>
        </Box>

        <Reveal delay={0.1}>
          <Box sx={{ fontFamily: BODY, fontSize: '0.78rem', color: TEXT_SECONDARY, mt: 3 }}>
            Sans engagement · Annulation à tout moment
          </Box>
        </Reveal>
      </Box>
    </Box>

    {/* ─── CTA Section ────────────────────────────────── */}
    <Box sx={{ py: { xs: 8, md: 10 }, textAlign: 'center' }}>
      <Reveal>
        <Box sx={{ maxWidth: 520, mx: 'auto', px: 3 }}>
          <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: { xs: '1.8rem', md: '2.3rem' }, color: TEXT_PRIMARY, m: 0, mb: 1.5 }}>
            Prêt à simplifier votre liasse fiscale ?
          </Box>
          <Box component="p" sx={{ color: TEXT_SECONDARY, fontFamily: BODY, fontSize: '0.92rem', m: 0, mb: 4 }}>
            Souscrivez maintenant. Sans engagement.
          </Box>
          <Box
            component="a" href="https://atlasstudio.app/portal?app=liasspilot"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              bgcolor: GOLD, color: '#ffffff !important', fontWeight: 500, fontFamily: BODY,
              fontSize: '0.95rem', textDecoration: 'none', borderRadius: '8px', px: 4, py: 1.6,
              transition: 'all 0.25s',
              '&:hover': { bgcolor: '#115e59', transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(15,118,110,0.25)' },
            }}
          >
            Commencer gratuitement <ArrowForward sx={{ fontSize: 16 }} />
          </Box>
        </Box>
      </Reveal>
    </Box>
  </PublicLayout>
  )
}

export default Landing
