import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import { ArrowForward } from '@mui/icons-material'
import PublicLayout from './PublicLayout'
import { DARK, DARK_SURFACE, GOLD, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, HEADING, BODY, BRAND } from './theme'

const values = [
  { title: 'Conformité', desc: "SYSCOHADA Révisé est notre ADN. Chaque calcul, chaque feuillet, chaque contrôle respecte le référentiel à la lettre." },
  { title: 'Simplicité', desc: "Votre balance entre, votre liasse sort. Pas de formation nécessaire. L'interface est pensée pour les comptables, pas les développeurs." },
  { title: 'Accessibilité', desc: "Des tarifs adaptés au marché africain. Un expert-comptable facture entre 500K et 2M FCFA. Nous, à partir de 250K FCFA/an." },
  { title: 'Fiabilité', desc: "129 contrôles Proph3t, archivage SHA-256, sauvegardes quotidiennes. Vos données fiscales méritent le plus haut niveau de sécurité." },
]

const About: React.FC = () => (
  <PublicLayout>
    {/* Header */}
    <Box sx={{ pt: { xs: 8, md: 14 }, pb: { xs: 6, md: 10 }, textAlign: 'center' }}>
      <Box sx={{ maxWidth: 650, mx: 'auto', px: 3 }}>
        <Box sx={{ fontFamily: BRAND, fontSize: '2.5rem', color: `${TEXT_PRIMARY} !important`, mb: 2 }}>
          Atlas Studio
        </Box>
        <Box component="h1" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '2rem', md: '2.8rem' }, color: `${TEXT_PRIMARY} !important`, m: 0, mb: 2 }}>
          La liasse fiscale SYSCOHADA,
          <br />
          repensée pour l'Afrique.
        </Box>
        <Box component="p" sx={{ fontFamily: BODY, fontSize: '1.05rem', color: `${TEXT_SECONDARY} !important`, m: 0, lineHeight: 1.8, maxWidth: 520, mx: 'auto' }}>
          Atlas Studio développe Liass'Pilot, le premier logiciel SaaS dédié à la production automatisée de liasses fiscales conformes SYSCOHADA pour les 17 pays de l'espace OHADA.
        </Box>
      </Box>
    </Box>

    {/* Mission */}
    <Box sx={{ bgcolor: `${DARK_SURFACE} !important`, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 800, mx: 'auto', px: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 6 } }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ fontFamily: BODY, fontSize: '0.8rem', fontWeight: 600, color: `${GOLD} !important`, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
              Notre mission
            </Box>
            <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: { xs: '1.6rem', md: '2rem' }, color: `${TEXT_PRIMARY} !important`, m: 0, mb: 2 }}>
              Démocratiser la conformité fiscale en Afrique
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ fontFamily: BODY, fontSize: '0.95rem', color: `${TEXT_SECONDARY} !important`, lineHeight: 1.8 }}>
              Dans l'espace OHADA, produire une liasse fiscale conforme reste un processus coûteux et complexe. Les experts-comptables facturent entre 500 000 et 2 000 000 FCFA par liasse. Les PME et cabinets comptables méritent un outil moderne, abordable et fiable.
            </Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.95rem', color: `${TEXT_SECONDARY} !important`, lineHeight: 1.8, mt: 2 }}>
              Liass'Pilot automatise l'intégralité du processus : de l'import de la balance comptable à l'export de la liasse fiscale complète, en passant par 129 contrôles de cohérence alimentés par notre IA Proph3t.
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>

    {/* Values */}
    <Box sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: { xs: '1.8rem', md: '2.4rem' }, color: `${TEXT_PRIMARY} !important`, m: 0, mb: 1 }}>
            Nos valeurs
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
          {values.map((v) => (
            <Box
              key={v.title}
              sx={{
                p: 3.5, borderRadius: '14px',
                border: `1px solid ${BORDER}`,
                bgcolor: `${DARK_SURFACE} !important`,
              }}
            >
              <Box component="h3" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.2rem', color: `${GOLD} !important`, m: 0, mb: 1.5 }}>
                {v.title}
              </Box>
              <Box sx={{ fontFamily: BODY, fontSize: '0.92rem', color: `${TEXT_SECONDARY} !important`, lineHeight: 1.7 }}>
                {v.desc}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>

    {/* Stats */}
    <Box sx={{ bgcolor: `${DARK_SURFACE} !important`, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, py: { xs: 5, md: 7 } }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 4, sm: 0 }, justifyContent: 'space-around', textAlign: 'center' }}>
        {[
          { value: '17', label: 'Pays OHADA couverts' },
          { value: '1 005', label: 'Comptes SYSCOHADA' },
          { value: '129', label: 'Contrôles Proph3t' },
          { value: '84', label: 'Onglets Excel générés' },
        ].map((s) => (
          <Box key={s.label}>
            <Box sx={{ fontFamily: HEADING, fontWeight: 700, fontStyle: 'italic', fontSize: '2.8rem', color: `${GOLD} !important`, lineHeight: 1 }}>{s.value}</Box>
            <Box sx={{ fontFamily: BODY, fontSize: '0.82rem', color: `${TEXT_SECONDARY} !important`, mt: 1 }}>{s.label}</Box>
          </Box>
        ))}
      </Box>
    </Box>

    {/* CTA */}
    <Box sx={{ py: { xs: 7, md: 9 }, textAlign: 'center' }}>
      <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '1.6rem', md: '2.2rem' }, color: `${TEXT_PRIMARY} !important`, m: 0, mb: 1.5 }}>
        Rejoignez le mouvement
      </Box>
      <Box sx={{ fontFamily: BODY, color: `${TEXT_SECONDARY} !important`, fontSize: '0.95rem', mb: 4 }}>
        Plus de 500 entreprises nous font déjà confiance en Afrique.
      </Box>
      <Box
        component="a" href="https://atlas-studio.org/portal?app=taxpilot"
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          bgcolor: `${GOLD} !important`, color: '#1a1200 !important', fontWeight: 500, fontFamily: BODY,
          fontSize: '0.95rem', textDecoration: 'none', borderRadius: '8px', px: 4, py: 1.6,
          transition: 'all 0.25s', '&:hover': { bgcolor: '#d4b35a !important', transform: 'translateY(-2px)' },
        }}
      >
        Souscrire maintenant <ArrowForward sx={{ fontSize: 16 }} />
      </Box>
    </Box>
  </PublicLayout>
)

export default About
