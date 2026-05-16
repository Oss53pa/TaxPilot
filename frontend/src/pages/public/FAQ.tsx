import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import { Add, Remove, ArrowForward } from '@mui/icons-material'
import PublicLayout from './PublicLayout'
import { DARK_SURFACE, GOLD, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, HEADING, BODY } from './theme'

// ─── Data ────────────────────────────────────────────────────
const sections = [
  {
    title: 'Général',
    items: [
      { q: "Qu'est-ce que Liass'Pilot ?", a: "Liass'Pilot est une solution SaaS qui automatise la production de liasses fiscales conformes au référentiel SYSCOHADA Révisé, pour les 17 pays de l'espace OHADA." },
      { q: "Qu'est-ce qu'une liasse fiscale ?", a: "C'est l'ensemble des états financiers obligatoires — Bilan, Compte de Résultat, TAFIRE, Notes Annexes — que chaque entreprise doit produire annuellement." },
      { q: "Quels pays sont couverts ?", a: "Les 17 pays OHADA : Bénin, Burkina Faso, Cameroun, Centrafrique, Comores, Congo, Côte d'Ivoire, Gabon, Guinée, Guinée-Bissau, Guinée Équatoriale, Mali, Niger, RDC, Sénégal, Tchad, Togo." },
      { q: "SMT, SA, SN — quelle différence ?", a: "SMT (Système Minimal de Trésorerie) pour les micro-entreprises. SA (Système Allégé) pour les PME. SN (Système Normal) pour les entreprises de taille moyenne et grande. Liass'Pilot gère les trois." },
    ],
  },
  {
    title: 'Fonctionnalités',
    items: [
      { q: "Quels formats d'import ?", a: "Excel (.xlsx, .xls), CSV et FEC. Le mapping des 1 005 comptes SYSCOHADA est automatique." },
      { q: "Comment marchent les contrôles ?", a: "169 contrôles Proph3t vérifient l'équilibre du bilan, la concordance des postes, la cohérence inter-feuillets et le respect des règles SYSCOHADA. Score de conformité en temps réel." },
      { q: "Puis-je gérer plusieurs sociétés ?", a: "Oui. Le plan Cabinet · 10 dossiers couvre jusqu'à 10 clients ; le plan Cabinet · illimité supprime la limite et ajoute API, SLA et white-label. Gestion des rôles et permissions par collaborateur incluse dès le plan Cabinet." },
      { q: "Quels formats d'export ?", a: "Excel 84 onglets (Mode A), Excel template DGI (Mode B), PDF A3/A4/A5. Prochainement : XML télédéclaration." },
    ],
  },
  {
    title: 'Tarifs',
    items: [
      { q: "Combien ça coûte ?", a: "Entreprise (1 société) : 450 000 FCFA/an. Cabinet · 10 dossiers : 1 500 000 FCFA/an. Cabinet · illimité (API + SLA 99.9% + white-label) : 3 000 000 FCFA/an. Tarifs annuels HT, sans engagement." },
      { q: "Puis-je changer de plan ?", a: "Oui, passage entre les 3 plans (Entreprise, Cabinet 10 dossiers, Cabinet illimité) à tout moment, au prorata." },
      { q: "Moyens de paiement ?", a: "Carte bancaire (Visa, Mastercard), Mobile Money (Orange, MTN, Moov), virement bancaire, Western Union." },
      { q: "Essai gratuit ?", a: "Sans engagement, annulation à tout moment." },
    ],
  },
  {
    title: 'Sécurité',
    items: [
      { q: "Mes données sont-elles protégées ?", a: "Chiffrement SSL/TLS en transit, AES-256 au repos. Archivage SHA-256. Sauvegardes quotidiennes." },
      { q: "Qui accède à mes données ?", a: "Uniquement les utilisateurs autorisés de votre organisation. Rôles et permissions + audit trail complet." },
      { q: "Durée de conservation ?", a: "Tant que votre abonnement est actif. Export et suppression possibles à tout moment." },
    ],
  },
  {
    title: 'Support',
    items: [
      { q: "Comment contacter le support ?", a: "Email pour tous les plans (réponse < 48h). Support prioritaire 24h pour les plans Cabinet · 10 dossiers et Cabinet · illimité. Account manager dédié pour Cabinet · illimité." },
      { q: "Proposez-vous des formations ?", a: "Webinaires, documentation complète, tutoriels vidéo. Formation personnalisée sur demande pour les plans Cabinet." },
    ],
  },
]

// ─── Accordion item ──────────────────────────────────────────
const Item: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <Box sx={{ borderBottom: `1px solid ${BORDER}` }}>
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          py: 2.5,
          cursor: 'pointer',
        }}
      >
        <Box
          sx={{
            fontFamily: BODY,
            fontWeight: 500,
            fontSize: '1rem',
            color: TEXT_PRIMARY,
            lineHeight: 1.5,
          }}
        >
          {q}
        </Box>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: `1px solid ${open ? GOLD : BORDER}`,
            bgcolor: open ? 'rgba(15,118,110,0.1)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            mt: 0.2,
            transition: 'all 0.25s',
          }}
        >
          {open
            ? <Remove sx={{ fontSize: 16, color: GOLD }} />
            : <Add sx={{ fontSize: 16, color: TEXT_SECONDARY }} />
          }
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.35s ease',
        }}
      >
        <Box sx={{ overflow: 'hidden' }}>
          <Box
            sx={{
              fontFamily: BODY,
              fontSize: '0.92rem',
              color: TEXT_SECONDARY,
              lineHeight: 1.8,
              pb: 2.5,
              maxWidth: 600,
            }}
          >
            {a}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

// ─── Page ────────────────────────────────────────────────────
const FAQ: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <PublicLayout>
      {/* Header */}
      <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 4, md: 6 }, textAlign: 'center' }}>
        <Box sx={{ maxWidth: 550, mx: 'auto', px: 3 }}>
          <Box
            component="h1"
            sx={{
              fontFamily: HEADING,
              fontWeight: 500,
              fontSize: { xs: '2.4rem', md: '3.2rem' },
              color: TEXT_PRIMARY,
              m: 0,
              mb: 1.5,
            }}
          >
            Questions fréquentes
          </Box>
          <Box
            component="p"
            sx={{
              fontFamily: BODY,
              fontSize: '1rem',
              color: TEXT_SECONDARY,
              m: 0,
              lineHeight: 1.7,
            }}
          >
            Tout ce que vous devez savoir sur Liass'Pilot.
          </Box>
        </Box>
      </Box>

      {/* 2-col layout: nav + content */}
      <Box sx={{ maxWidth: 920, mx: 'auto', px: 3, pb: { xs: 8, md: 14 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 6 },
          }}
        >
          {/* Left: category nav */}
          <Box
            sx={{
              flex: '0 0 200px',
              position: { md: 'sticky' },
              top: { md: 80 },
              alignSelf: { md: 'flex-start' },
            }}
          >
            {/* Mobile: horizontal scroll */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                gap: 0.8,
                overflowX: 'auto',
                pb: 1,
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {sections.map((sec, i) => (
                <Box
                  key={sec.title}
                  onClick={() => setActiveIdx(i)}
                  sx={{
                    px: 2,
                    py: 0.8,
                    borderRadius: '8px',
                    fontFamily: BODY,
                    fontSize: '0.85rem',
                    fontWeight: i === activeIdx ? 600 : 400,
                    color: i === activeIdx ? '#ffffff' : TEXT_SECONDARY,
                    bgcolor: i === activeIdx ? GOLD : DARK_SURFACE,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  {sec.title}
                </Box>
              ))}
            </Box>

            {/* Desktop: vertical nav */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              {sections.map((sec, i) => (
                <Box
                  key={sec.title}
                  onClick={() => setActiveIdx(i)}
                  sx={{
                    px: 2,
                    py: 1.2,
                    borderRadius: '10px',
                    fontFamily: BODY,
                    fontSize: '0.92rem',
                    fontWeight: i === activeIdx ? 600 : 400,
                    color: i === activeIdx ? GOLD : TEXT_SECONDARY,
                    bgcolor: i === activeIdx ? 'rgba(15,118,110,0.06)' : 'transparent',
                    borderLeft: i === activeIdx ? `3px solid ${GOLD}` : '3px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': i !== activeIdx ? { color: TEXT_PRIMARY, bgcolor: 'rgba(0,0,0,0.02)' } : {},
                  }}
                >
                  {sec.title}
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      fontWeight: 400,
                      fontSize: '0.78rem',
                      color: i === activeIdx ? 'rgba(15,118,110,0.6)' : 'rgba(0,0,0,0.2)',
                    }}
                  >
                    {sec.items.length}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right: questions */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Section title */}
            <Box
              component="h2"
              sx={{
                fontFamily: HEADING,
                fontWeight: 600,
                fontSize: '1.4rem',
                color: TEXT_PRIMARY,
                m: 0,
                mb: 1,
              }}
            >
              {sections[activeIdx].title}
            </Box>
            <Box
              sx={{
                fontFamily: BODY,
                fontSize: '0.85rem',
                color: TEXT_SECONDARY,
                mb: 3,
              }}
            >
              {sections[activeIdx].items.length} questions
            </Box>

            {/* Items */}
            <Box>
              {sections[activeIdx].items.map((item) => (
                <Item key={item.q} q={item.q} a={item.a} />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* CTA */}
      <Box
        sx={{
          bgcolor: DARK_SURFACE,
          borderTop: `1px solid ${BORDER}`,
          py: { xs: 7, md: 9 },
          textAlign: 'center',
        }}
      >
        <Box
          component="h2"
          sx={{
            fontFamily: HEADING,
            fontWeight: 500,
            fontSize: { xs: '1.6rem', md: '2.2rem' },
            color: TEXT_PRIMARY,
            m: 0,
            mb: 1.5,
          }}
        >
          Une autre question ?
        </Box>
        <Box
          component="p"
          sx={{
            fontFamily: BODY,
            color: TEXT_SECONDARY,
            fontSize: '0.95rem',
            m: 0,
            mb: 4,
          }}
        >
          Notre équipe répond sous 24 heures.
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Box
            component={RouterLink}
            to="/contact"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: GOLD,
              color: '#ffffff !important',
              fontWeight: 500,
              fontFamily: BODY,
              fontSize: '0.95rem',
              textDecoration: 'none',
              borderRadius: '8px',
              px: 4,
              py: 1.6,
              transition: 'all 0.25s',
              '&:hover': { bgcolor: '#115e59', transform: 'translateY(-2px)' },
            }}
          >
            Nous contacter <ArrowForward sx={{ fontSize: 16 }} />
          </Box>
          <Box
            component="a"
            href="https://atlasstudio.app/portal?app=liasspilot"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid rgba(0,0,0,0.15)',
              bgcolor: 'transparent',
              color: `${TEXT_PRIMARY} !important`,
              fontWeight: 400,
              fontFamily: BODY,
              fontSize: '0.95rem',
              textDecoration: 'none',
              borderRadius: '8px',
              px: 4,
              py: 1.6,
              transition: 'all 0.25s',
              '&:hover': { borderColor: 'rgba(0,0,0,0.3)', transform: 'translateY(-2px)' },
            }}
          >
            Souscrire
          </Box>
        </Box>
      </Box>
    </PublicLayout>
  )
}

export default FAQ
