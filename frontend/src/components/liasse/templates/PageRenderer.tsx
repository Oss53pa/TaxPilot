/**
 * PageRenderer — Renders a liasse page using the module liasse components.
 * Uses dynamic imports from modules/liasse-fiscale/components/pages/.
 * Data is either provided via sharedData prop (print mode) or loaded via useLiasseFiscaleData.
 */

import React, { Suspense, useMemo } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import type { LiassePage } from '@/config/liasse-pages-config'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { useLiasseFiscaleData, type LiasseFiscaleData } from '@/hooks/useLiasseFiscaleData'
import { LiasseRegimeContext } from '@/modules/liasse-fiscale/components/LiasseHeader'

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
      Page {page.pageNum} / 84
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

// ── Loading fallback ──

const LoadingFallback: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
    <CircularProgress size={24} />
  </Box>
)

// ── Component cache to avoid re-creating lazy components on every render ──

const componentCache = new Map<string, React.LazyExoticComponent<React.ComponentType<any>>>()

function getLazyComponent(componentFile: string): React.LazyExoticComponent<React.ComponentType<any>> {
  let cached = componentCache.get(componentFile)
  if (!cached) {
    cached = React.lazy(() => import(`../../../modules/liasse-fiscale/components/pages/${componentFile}`))
    componentCache.set(componentFile, cached)
  }
  return cached
}

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════

export interface PageRendererProps {
  page: LiassePage
  showHeader?: boolean
  /** Pre-loaded data (used in print mode to avoid N hook calls) */
  sharedData?: LiasseFiscaleData
}

const PageRenderer: React.FC<PageRendererProps> = ({ page, showHeader = true, sharedData }) => {
  // Use shared data if provided, otherwise load via hook
  const hookData = useLiasseFiscaleData()
  const data = sharedData || hookData

  const Component = useMemo(() => {
    try {
      return getLazyComponent(page.componentFile)
    } catch {
      return null
    }
  }, [page.componentFile])

  if (!Component) {
    return <PagePlaceholder page={page} />
  }

  return (
    <LiasseRegimeContext.Provider value={data.regime}>
      <Box className="liasse-page" sx={{
        fontFamily: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
        '& *': { fontFamily: 'inherit !important' },
      }}>
        {showHeader && <DgiHeader page={page} />}
        <Suspense fallback={<LoadingFallback />}>
          <Component
            entreprise={data.entreprise}
            balance={data.balance}
            balanceN1={data.balanceN1}
            regime={data.regime}
          />
        </Suspense>
      </Box>
    </LiasseRegimeContext.Provider>
  )
}

export default PageRenderer
