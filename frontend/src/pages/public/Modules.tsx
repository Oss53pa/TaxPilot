import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import {
  CloudUpload, Calculate, Description, Assessment, Verified,
  Security, TrendingUp, AccountBalance, Gavel,
  SmartToy, Download, ArrowForward, CheckCircle,
} from '@mui/icons-material'
import PublicLayout from './PublicLayout'
import { DARK, DARK_SURFACE, GOLD, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, HEADING, BODY } from './theme'

// ─── 16 real features ────────────────────────────────────────
const coreFeatures = [
  { icon: <CloudUpload />, label: 'Import balance CSV & Excel' },
  { icon: <Description />, label: 'Plan comptable SYSCOHADA révisé (1 005 comptes)' },
  { icon: <AccountBalance />, label: 'Bilan Actif & Passif complet' },
  { icon: <Calculate />, label: 'Compte de résultat & 9 SIG' },
  { icon: <TrendingUp />, label: 'TAFIRE / TFT (CAFG, FR, BFR, TN)' },
  { icon: <Description />, label: '18 notes annexes calculées' },
  { icon: <Assessment />, label: '129 contrôles de cohérence Proph3t' },
  { icon: <Gavel />, label: 'Passage fiscal automatique CI' },
  { icon: <Gavel />, label: '7 réintégrations fiscales auto (CGI)' },
  { icon: <Calculate />, label: 'Calcul IS & IMF' },
  { icon: <Download />, label: 'Export Excel 84 onglets (Mode A)' },
  { icon: <Download />, label: 'Export Excel template DGI (Mode B)' },
  { icon: <TrendingUp />, label: 'Comparatif N / N-1' },
  { icon: <TrendingUp />, label: 'Ratios financiers' },
  { icon: <Security />, label: 'Archivage SHA-256' },
  { icon: <SmartToy />, label: 'Proph3t chatbot' },
]

// ─── Deep-dive sections with real screenshots ────────────────
const sections = [
  {
    title: 'Import intelligent',
    subtitle: 'De votre balance à SYSCOHADA en 30 secondes',
    desc: "Glissez votre fichier. Liass'Pilot détecte les colonnes, mappe les 1 005 comptes SYSCOHADA et valide l'équilibre débit/crédit automatiquement.",
    points: [
      'Formats Excel (.xlsx, .xls), CSV, FEC',
      'Détection automatique des colonnes et encodage',
      'Mapping intelligent des comptes SYSCOHADA',
      "Validation d'équilibre et alertes en temps réel",
      'Comparatif N / N-1 immédiat après import',
    ],
    screenshot: '/screenshots/import.png',
  },
  {
    title: 'Moteur de calcul SYSCOHADA',
    subtitle: '84 onglets calculés à la volée',
    desc: "Le moteur recalcule en temps réel tous les postes du Bilan, Compte de Résultat, TAFIRE/TFT et les 18 notes annexes. Zéro formule manuelle.",
    points: [
      'Bilan Actif (brut, amortissements, net) & Passif',
      'Compte de résultat & 9 Soldes Intermédiaires de Gestion',
      'TAFIRE / TFT : CAFG, FR, BFR, Trésorerie Nette',
      '18 notes annexes calculées automatiquement',
      'Passage fiscal CI + 7 réintégrations auto (CGI)',
    ],
    screenshot: '/screenshots/liasse.png',
  },
  {
    title: '129 contrôles Proph3t',
    subtitle: 'IA de conformité SYSCOHADA',
    desc: "Avant d'exporter, Proph3t vérifie 129 points de cohérence : équilibre du bilan, concordance inter-feuillets, règles SYSCOHADA. Score de conformité instantané.",
    points: [
      'Équilibre Total Actif = Total Passif',
      'Concordance Résultat Net entre feuillets',
      'Cohérence TAFIRE / Bilan / Compte de résultat',
      'Anomalies classées : bloquant, majeur, mineur, info',
      'Score de conformité en pourcentage',
    ],
    screenshot: '/screenshots/audit.png',
  },
  {
    title: 'Export & conformité DGI',
    subtitle: 'Excel 84 onglets, template DGI, PDF',
    desc: "Exportez votre liasse dans le format exact attendu par l'administration fiscale. Deux modes Excel, PDF multi-format, XML télédéclaration à venir.",
    points: [
      'Mode A : Excel 84 onglets avec formules',
      'Mode B : Template officiel DGI',
      'PDF haute fidélité A3, A4, A5',
      'Impression directe',
      'Prochainement : XML télédéclaration (DSF, DAS, TVA, IS)',
    ],
    screenshot: '/screenshots/generation.png',
  },
]

const Modules: React.FC = () => (
  <PublicLayout>
    {/* ─── Header ──────────────────────────────────────── */}
    <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 4, md: 6 }, textAlign: 'center' }}>
      <Box sx={{ maxWidth: 650, mx: 'auto', px: 3 }}>
        <Box component="h1" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '2.4rem', md: '3.2rem' }, color: `${TEXT_PRIMARY} !important`, m: 0, mb: 1.5 }}>
          Fonctionnalités
        </Box>
        <Box component="p" sx={{ fontFamily: BODY, fontSize: '1.05rem', color: `${TEXT_SECONDARY} !important`, m: 0, lineHeight: 1.7 }}>
          Votre balance entre. Votre liasse sort. Conforme.
          <br />
          Économisez 50 %+ par rapport à un expert-comptable.
        </Box>
      </Box>
    </Box>

    {/* ─── Feature grid ───────────────────────────────── */}
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: 3, pb: { xs: 6, md: 10 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 1.5,
        }}
      >
        {coreFeatures.map((f) => (
          <Box
            key={f.label}
            sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1.2,
              p: 2, borderRadius: '12px',
              border: `1px solid ${BORDER}`,
              bgcolor: `${DARK_SURFACE} !important`,
              transition: 'all 0.25s',
              '&:hover': { borderColor: 'rgba(201,168,76,0.25)', transform: 'translateY(-2px)' },
            }}
          >
            <Box sx={{ color: `${GOLD} !important`, mt: 0.2, flexShrink: 0, '& .MuiSvgIcon-root': { fontSize: 20 } }}>
              {f.icon}
            </Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.88rem', color: `${TEXT_PRIMARY} !important`, lineHeight: 1.45 }}>
              {f.label}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>

    {/* ─── Deep-dive sections with real screenshots ───── */}
    {sections.map((sec, i) => (
      <Box
        key={sec.title}
        sx={{
          bgcolor: i % 2 === 0 ? `${DARK_SURFACE} !important` : `${DARK} !important`,
          borderTop: `1px solid ${BORDER}`,
          py: { xs: 6, md: 10 },
        }}
      >
        <Box sx={{ maxWidth: 1050, mx: 'auto', px: 3 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: i % 2 === 0 ? 'row' : 'row-reverse' },
              gap: { xs: 4, md: 5 },
              alignItems: 'center',
            }}
          >
            {/* Text */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ fontFamily: BODY, fontSize: '0.8rem', fontWeight: 600, color: `${GOLD} !important`, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
                {sec.subtitle}
              </Box>
              <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: { xs: '1.6rem', md: '2rem' }, color: `${TEXT_PRIMARY} !important`, m: 0, mb: 2 }}>
                {sec.title}
              </Box>
              <Box component="p" sx={{ fontFamily: BODY, fontSize: '0.95rem', color: `${TEXT_SECONDARY} !important`, lineHeight: 1.75, m: 0, mb: 3 }}>
                {sec.desc}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {sec.points.map((p) => (
                  <Box key={p} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <CheckCircle sx={{ fontSize: 16, color: `${GOLD} !important`, mt: 0.3, flexShrink: 0 }} />
                    <Box sx={{ fontFamily: BODY, fontSize: '0.9rem', color: `${TEXT_SECONDARY} !important`, lineHeight: 1.5 }}>{p}</Box>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Real screenshot */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Box
                sx={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
                  bgcolor: `${DARK} !important`,
                }}
              >
                <Box
                  component="img"
                  src={sec.screenshot}
                  alt={sec.title}
                  sx={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    borderRadius: '12px',
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    ))}

    {/* ─── Coming soon ────────────────────────────────── */}
    <Box sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
      <Box sx={{ maxWidth: 700, mx: 'auto', px: 3 }}>
        <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '1.6rem', md: '2rem' }, color: `${TEXT_PRIMARY} !important`, m: 0, mb: 1.5 }}>
          Prochainement
        </Box>
        <Box sx={{ fontFamily: BODY, fontSize: '0.92rem', color: `${TEXT_SECONDARY} !important`, mb: 4 }}>
          Fonctionnalités en cours de développement.
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {[
            'Multi-pays OHADA (17 pays)',
            'Secteurs spécialisés (banque, assurance, microfinance)',
            'E-Invoicing (UBL 2.1, CII, PEPPOL)',
            'XML télédéclaration (DSF, DAS, TVA, IS)',
            'Audit trail & workflow de validation',
          ].map((f) => (
            <Box key={f} sx={{ fontSize: '0.85rem', fontFamily: BODY, color: `${TEXT_SECONDARY} !important`, bgcolor: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, borderRadius: '999px', px: 2, py: 0.6 }}>
              {f}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>

    {/* ─── CTA ────────────────────────────────────────── */}
    <Box sx={{ bgcolor: `${DARK_SURFACE} !important`, borderTop: `1px solid ${BORDER}`, py: { xs: 7, md: 9 }, textAlign: 'center' }}>
      <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '1.6rem', md: '2.2rem' }, color: `${TEXT_PRIMARY} !important`, m: 0, mb: 1.5 }}>
        Essayez Liass'Pilot gratuitement
      </Box>
      <Box sx={{ fontFamily: BODY, color: `${TEXT_SECONDARY} !important`, fontSize: '0.95rem', mb: 4 }}>
        Souscrivez maintenant. Sans engagement.
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Box
          component={RouterLink} to="/register"
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            bgcolor: `${GOLD} !important`, color: '#1a1200 !important', fontWeight: 500, fontFamily: BODY,
            fontSize: '0.95rem', textDecoration: 'none', borderRadius: '8px', px: 4, py: 1.6,
            transition: 'all 0.25s', '&:hover': { bgcolor: '#d4b35a !important', transform: 'translateY(-2px)' },
          }}
        >
          Commencer gratuitement <ArrowForward sx={{ fontSize: 16 }} />
        </Box>
        <Box
          component={RouterLink} to="/demo"
          sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            border: '1px solid rgba(255,255,255,0.15)', bgcolor: 'transparent',
            color: `${TEXT_PRIMARY} !important`, fontWeight: 400, fontFamily: BODY,
            fontSize: '0.95rem', textDecoration: 'none', borderRadius: '8px', px: 4, py: 1.6,
            transition: 'all 0.25s', '&:hover': { borderColor: 'rgba(255,255,255,0.3)', transform: 'translateY(-2px)' },
          }}
        >
          Voir la démo
        </Box>
      </Box>
    </Box>
  </PublicLayout>
)

export default Modules
