import React from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box } from '@mui/material'
import { ArrowForward } from '@mui/icons-material'
import PublicLayout from './PublicLayout'
import { DARK, DARK_SURFACE, GOLD, TEXT_PRIMARY, TEXT_SECONDARY, BORDER, HEADING, BODY } from './theme'

const posts = [
  {
    date: '28 mars 2025',
    category: 'Produit',
    title: "Liass'Pilot v2.0 : Export Excel template DGI (Mode B)",
    excerpt: "Le Mode B permet désormais d'exporter votre liasse dans le format exact du template officiel de la Direction Générale des Impôts. 84 onglets, mise en forme conforme.",
    readTime: '3 min',
  },
  {
    date: '15 mars 2025',
    category: 'SYSCOHADA',
    title: 'Comprendre les 9 SIG du Compte de Résultat SYSCOHADA',
    excerpt: "Marge brute, Valeur Ajoutée, EBE, Résultat d'exploitation... Décryptage des 9 Soldes Intermédiaires de Gestion et leur calcul automatique dans Liass'Pilot.",
    readTime: '5 min',
  },
  {
    date: '2 mars 2025',
    category: 'Fiscalité',
    title: 'Passage fiscal automatique : les 7 réintégrations du CGI ivoirien',
    excerpt: "Comment Liass'Pilot calcule automatiquement les réintégrations fiscales selon le Code Général des Impôts de Côte d'Ivoire : amortissements excédentaires, charges non déductibles, etc.",
    readTime: '4 min',
  },
  {
    date: '18 février 2025',
    category: 'Tutoriel',
    title: "Importer sa balance comptable en 30 secondes",
    excerpt: "Guide pas-à-pas pour importer votre balance depuis Excel, CSV ou FEC. Détection automatique des colonnes et mapping SYSCOHADA.",
    readTime: '2 min',
  },
  {
    date: '5 février 2025',
    category: 'Produit',
    title: '129 contrôles Proph3t : comment ça marche ?',
    excerpt: "Notre moteur d'IA Proph3t exécute 129 contrôles de cohérence sur votre liasse fiscale. Découvrez les 9 niveaux d'audit et le scoring de conformité.",
    readTime: '6 min',
  },
  {
    date: '20 janvier 2025',
    category: 'OHADA',
    title: 'SYSCOHADA Révisé 2024 : ce qui change pour votre liasse',
    excerpt: "Nouvelles dispositions du référentiel SYSCOHADA Révisé applicables à l'exercice 2024. Impact sur le TAFIRE, les notes annexes et le passage fiscal.",
    readTime: '7 min',
  },
]

const Blog: React.FC = () => (
  <PublicLayout>
    {/* Header */}
    <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 4, md: 6 }, textAlign: 'center' }}>
      <Box sx={{ maxWidth: 600, mx: 'auto', px: 3 }}>
        <Box component="h1" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '2.4rem', md: '3.2rem' }, color: `${TEXT_PRIMARY} !important`, m: 0, mb: 1.5 }}>
          Blog
        </Box>
        <Box component="p" sx={{ fontFamily: BODY, fontSize: '1.05rem', color: `${TEXT_SECONDARY} !important`, m: 0, lineHeight: 1.7 }}>
          Actualités produit, guides SYSCOHADA et conseils fiscaux pour l'espace OHADA.
        </Box>
      </Box>
    </Box>

    {/* Posts grid */}
    <Box sx={{ maxWidth: 1000, mx: 'auto', px: 3, pb: { xs: 8, md: 12 } }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
        {posts.map((post) => (
          <Box
            key={post.title}
            sx={{
              p: 3.5,
              borderRadius: '14px',
              border: `1px solid ${BORDER}`,
              bgcolor: `${DARK_SURFACE} !important`,
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.25s',
              cursor: 'pointer',
              '&:hover': { borderColor: 'rgba(201,168,76,0.25)', transform: 'translateY(-3px)' },
            }}
          >
            {/* Meta */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ fontFamily: BODY, fontSize: '0.78rem', color: `${TEXT_SECONDARY} !important` }}>
                {post.date}
              </Box>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: BORDER }} />
              <Box
                sx={{
                  fontFamily: BODY, fontSize: '0.72rem', fontWeight: 600,
                  color: `${GOLD} !important`,
                  bgcolor: 'rgba(201,168,76,0.08)',
                  border: '1px solid rgba(201,168,76,0.15)',
                  borderRadius: '999px', px: 1.2, py: 0.2,
                }}
              >
                {post.category}
              </Box>
              <Box sx={{ ml: 'auto', fontFamily: BODY, fontSize: '0.72rem', color: `${TEXT_SECONDARY} !important` }}>
                {post.readTime}
              </Box>
            </Box>

            {/* Title */}
            <Box component="h3" sx={{ fontFamily: HEADING, fontWeight: 600, fontSize: '1.15rem', color: `${TEXT_PRIMARY} !important`, m: 0, mb: 1.5, lineHeight: 1.4 }}>
              {post.title}
            </Box>

            {/* Excerpt */}
            <Box sx={{ fontFamily: BODY, fontSize: '0.9rem', color: `${TEXT_SECONDARY} !important`, lineHeight: 1.7, flex: 1 }}>
              {post.excerpt}
            </Box>

            {/* Read more */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2.5, fontFamily: BODY, fontSize: '0.85rem', fontWeight: 500, color: `${GOLD} !important` }}>
              Lire l'article <ArrowForward sx={{ fontSize: 14 }} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>

    {/* Newsletter CTA */}
    <Box sx={{ bgcolor: `${DARK_SURFACE} !important`, borderTop: `1px solid ${BORDER}`, py: { xs: 7, md: 9 }, textAlign: 'center' }}>
      <Box component="h2" sx={{ fontFamily: HEADING, fontWeight: 500, fontSize: { xs: '1.6rem', md: '2rem' }, color: `${TEXT_PRIMARY} !important`, m: 0, mb: 1.5 }}>
        Restez informé
      </Box>
      <Box sx={{ fontFamily: BODY, color: `${TEXT_SECONDARY} !important`, fontSize: '0.95rem', mb: 4 }}>
        Recevez nos articles sur la comptabilité SYSCOHADA et les mises à jour produit.
      </Box>
      <Box
        component={RouterLink} to="/register"
        sx={{
          display: 'inline-flex', alignItems: 'center', gap: 1,
          bgcolor: `${GOLD} !important`, color: '#1a1200 !important', fontWeight: 500, fontFamily: BODY,
          fontSize: '0.95rem', textDecoration: 'none', borderRadius: '8px', px: 4, py: 1.6,
          transition: 'all 0.25s', '&:hover': { bgcolor: '#d4b35a !important', transform: 'translateY(-2px)' },
        }}
      >
        S'inscrire <ArrowForward sx={{ fontSize: 16 }} />
      </Box>
    </Box>
  </PublicLayout>
)

export default Blog
