/**
 * PageRenderer — Route chaque page de la liasse vers son composant existant
 * ou affiche un placeholder structure pour les pages non encore implementees.
 */

import React, { Suspense } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import type { LiassePage } from '@/config/liasse-pages-config'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'

// Import existing sheet components directly (they're already wrapped with withBackendData)
import {
  CouvertureSYSCOHADA,
  PageGardeSYSCOHADA,
  RecevabiliteSYSCOHADA,
  FicheR1SYSCOHADA,
  FicheR2SYSCOHADA,
  FicheR3SYSCOHADA,
  FicheR4SYSCOHADA,
  BilanSynthetique,
  BilanActifSYSCOHADA,
  BilanPassifSYSCOHADA,
  CompteResultatSYSCOHADA,
  TableauFluxTresorerieSYSCOHADA,
  Note36Tables,
  Note1SYSCOHADA,
  Note2SYSCOHADA,
  Note3SYSCOHADA,
  Note4SYSCOHADA,
  Note5SYSCOHADA,
  Note6SYSCOHADA,
  Note7SYSCOHADA,
  Note8SYSCOHADA,
  Note9SYSCOHADA,
  Note10SYSCOHADA,
  Note11SYSCOHADA,
  Note12SYSCOHADA,
  Note13SYSCOHADA,
  Note14SYSCOHADA,
  Note15SYSCOHADA,
  Note16SYSCOHADA,
  Note17SYSCOHADA,
  Note18SYSCOHADA,
  Note19SYSCOHADA,
  Note20SYSCOHADA,
  Note21SYSCOHADA,
  Note22SYSCOHADA,
  Note23SYSCOHADA,
  Note24SYSCOHADA,
  Note25SYSCOHADA,
  Note26SYSCOHADA,
  Note27SYSCOHADA,
  Note28SYSCOHADA,
  Note29SYSCOHADA,
  Note30SYSCOHADA,
  Note31SYSCOHADA,
  Note32SYSCOHADA,
  Note33SYSCOHADA,
  Note34SYSCOHADA,
  Note35SYSCOHADA,
  Note36SYSCOHADA_NR,
  Note36NomenclatureSYSCOHADA,
  Note37SYSCOHADA,
  Note38SYSCOHADA,
  Note39SYSCOHADA,
  NotesDgiInsSYSCOHADA,
  NotesRestantes,
  ComplementCharges,
  ComplementProduits,
  SupplementTVA,
  SupplementImpotSociete,
  SupplementAvantagesFiscaux,
  TablesCalculImpots,
  TableauxSupplementaires,
  GardeDgiIns,
  GardeBic,
  GardeBnc,
  GardeBa,
  Garde301,
  Garde302,
  Garde3,
  Suppl4,
  Suppl5,
  Suppl6,
  Suppl7,
  CompTva2,
} from '@/components/liasse/sheets'

// ── Component registry ──
// Maps componentKey from liasse-pages-config.ts to actual React components

const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  // Couverture & Garde
  CouvertureSYSCOHADA,
  PageGardeSYSCOHADA,
  RecevabiliteSYSCOHADA,
  GardeDgiIns,
  GardeBic,
  GardeBnc,
  GardeBa,
  Garde301,
  Garde302,
  Garde3,

  // Fiches R
  FicheR1SYSCOHADA,
  FicheR2SYSCOHADA,
  FicheR3SYSCOHADA,
  FicheR4SYSCOHADA,

  // Etats financiers
  BilanSynthetique,
  BilanActifSYSCOHADA,
  BilanPassifSYSCOHADA,
  CompteResultatSYSCOHADA,
  TableauFluxTresorerieSYSCOHADA,

  // Notes existantes (dedicated components)
  Note36Tables,
  Note1SYSCOHADA,
  Note2SYSCOHADA,
  Note3SYSCOHADA,
  Note5SYSCOHADA,
  Note6SYSCOHADA,
  Note8SYSCOHADA,
  Note11SYSCOHADA,
  Note12SYSCOHADA,
  Note14SYSCOHADA,
  Note15SYSCOHADA,
  Note17SYSCOHADA,
  Note19SYSCOHADA,

  // Notes via factory (NotesRestantes)
  Note4SYSCOHADA,
  Note7SYSCOHADA,
  Note9SYSCOHADA,
  Note10SYSCOHADA,
  Note13SYSCOHADA,
  Note16SYSCOHADA,
  Note18SYSCOHADA,
  Note20SYSCOHADA,
  Note21SYSCOHADA,
  Note22SYSCOHADA,
  Note23SYSCOHADA,
  Note24SYSCOHADA,
  Note25SYSCOHADA,
  Note26SYSCOHADA,
  Note27SYSCOHADA,
  Note28SYSCOHADA,
  Note29SYSCOHADA,
  Note30SYSCOHADA,
  Note31SYSCOHADA,
  Note32SYSCOHADA,
  Note33SYSCOHADA,
  Note34SYSCOHADA,
  Note35SYSCOHADA,
  Note36SYSCOHADA: Note36SYSCOHADA_NR,
  Note36NomenclatureSYSCOHADA,
  Note37SYSCOHADA,
  Note38SYSCOHADA,
  Note39SYSCOHADA,
  NotesDgiInsSYSCOHADA,
  NotesRestantes,

  // Supplements
  TablesCalculImpots,
  TableauxSupplementaires,
  ComplementCharges,
  ComplementProduits,
  SupplementTVA,
  SupplementImpotSociete,
  SupplementAvantagesFiscaux,
  Suppl4,
  Suppl5,
  Suppl6,
  Suppl7,
  CompTva2,
}

// ── DGI Header ──

const DgiHeader: React.FC<{ page: LiassePage }> = ({ page }) => (
  <Box className="dgi-header" sx={{
    textAlign: 'center',
    borderBottom: `1px solid ${P.primary300}`,
    pb: 1,
    mb: 1.5,
    color: P.primary600,
  }}>
    <Typography sx={{ fontSize: '11px', color: P.primary400 }}>
      REPUBLIQUE DE COTE D'IVOIRE — Direction Generale des Impots
    </Typography>
    <Typography sx={{ fontSize: '14px', fontWeight: 700, mt: 0.5 }}>
      {page.label}
    </Typography>
    <Typography sx={{ fontSize: '10px', color: P.primary400 }}>
      Page {page.pageNum} / 74
    </Typography>
  </Box>
)

// ── Placeholder for unimplemented pages ──

const PagePlaceholder: React.FC<{ page: LiassePage }> = ({ page }) => (
  <Box className="liasse-page">
    <DgiHeader page={page} />
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 300,
      border: `2px dashed ${P.primary200}`,
      borderRadius: 2,
      color: P.primary400,
      py: 6,
    }}>
      <Typography sx={{ fontSize: '15px', fontWeight: 600, mb: 0.5, color: P.primary500 }}>
        {page.label}
      </Typography>
      <Typography sx={{ fontSize: '13px', color: P.primary400 }}>
        {page.sourceData === 'saisie_manuelle'
          ? 'A renseigner manuellement'
          : page.sourceData === 'balance'
            ? 'Aucune balance importee — Donnees calculees automatiquement'
            : 'Page a completer'}
      </Typography>
    </Box>
  </Box>
)

// ── Commentaire page ──

const CommentairePage: React.FC = () => {
  const [text, setText] = React.useState(() => {
    try {
      return localStorage.getItem('fiscasync_liasse_commentaire') || ''
    } catch { return '' }
  })

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    try { localStorage.setItem('fiscasync_liasse_commentaire', e.target.value) } catch { /* */ }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography sx={{ fontSize: '15px', fontWeight: 700, mb: 1.5 }}>
        COMMENTAIRES GENERAUX
      </Typography>
      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Saisissez vos commentaires ici..."
        style={{
          width: '100%',
          minHeight: 400,
          padding: 12,
          border: `1px solid ${P.primary200}`,
          borderRadius: 4,
          fontSize: 12,
          fontFamily: '"Segoe UI", Arial, sans-serif',
          resize: 'vertical',
        }}
      />
    </Box>
  )
}

// Add Commentaire to registry
COMPONENT_REGISTRY['Commentaire'] = CommentairePage

// ── Loading fallback ──

const LoadingFallback: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
    <CircularProgress size={24} />
  </Box>
)

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════

interface PageRendererProps {
  page: LiassePage
  showHeader?: boolean
}

const PageRenderer: React.FC<PageRendererProps> = ({ page, showHeader = true }) => {
  const Component = COMPONENT_REGISTRY[page.componentKey]

  if (!Component) {
    return <PagePlaceholder page={page} />
  }

  return (
    <Box className="liasse-page">
      {showHeader && <DgiHeader page={page} />}
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    </Box>
  )
}

export default PageRenderer
