/**
 * LiassePrintTemplate — Composant principal de la liasse fiscale SYSCOHADA
 * Affiche TOUTES les pages pour le regime selectionne avec sidebar de navigation.
 * 74 pages pour le Reel Normal, ~50 pour Simplifie, ~10 Forfaitaire, ~4 Micro.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  alpha,
  useTheme,
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  Print as PrintIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import {
  getPagesForRegime,
  getPagesBySection,
  SECTION_LABELS,
  REGIME_LABELS,
  type Regime,
  type SectionId,
} from '@/config/liasse-pages-config'
import PageRenderer from './PageRenderer'
import { printLiasse } from '@/services/liassePrintService'
import { exportLiasseExcel } from '@/services/exportService'
import './PrintLayout.css'

// ── Types ──

export type RegimeFiscal = 'normal' | 'simplifie' | 'forfaitaire' | 'micro'

export interface EntrepriseInfo {
  raison_sociale: string
  numero_contribuable: string
  forme_juridique?: string
  regime_imposition?: string
  secteur_activite?: string
  adresse?: string
  ville?: string
  rccm?: string
}

export interface LiassePrintTemplateProps {
  regime: RegimeFiscal
  entreprise: EntrepriseInfo
  exercice: string
  initialPageId?: string
}

// Map from RegimeFiscal to config Regime
const REGIME_MAP: Record<RegimeFiscal, Regime> = {
  normal: 'reel_normal',
  simplifie: 'reel_simplifie',
  forfaitaire: 'forfaitaire',
  micro: 'micro',
}

// ══════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════

interface SidebarProps {
  regime: Regime
  currentPageIndex: number
  onPageSelect: (index: number) => void
}

const Sidebar: React.FC<SidebarProps> = ({ regime, currentPageIndex, onPageSelect }) => {
  const theme = useTheme()
  const allPages = getPagesForRegime(regime)
  const sections = getPagesBySection(regime)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  return (
    <Box
      className="liasse-sidebar no-print"
      sx={{
        width: 260,
        minWidth: 260,
        borderRight: `1px solid ${P.primary200}`,
        overflowY: 'auto',
        backgroundColor: P.primary50,
        p: 1.5,
      }}
    >
      <Box sx={{ mb: 2, px: 0.5 }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 700, color: P.primary900 }}>
          Liasse Fiscale
        </Typography>
        <Typography sx={{ fontSize: '11px', color: P.primary500 }}>
          {REGIME_LABELS[regime]} — {allPages.length} pages
        </Typography>
      </Box>

      {(Object.entries(sections) as [SectionId, typeof allPages][]).map(([sectionKey, pages]) => {
        if (pages.length === 0) return null
        const isCollapsed = collapsedSections[sectionKey]

        return (
          <Box key={sectionKey} sx={{ mb: 1 }}>
            <Box
              onClick={() => toggleSection(sectionKey)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                px: 0.5,
                py: 0.3,
                borderRadius: 0.5,
                '&:hover': { backgroundColor: alpha(theme.palette.divider, 0.08) },
              }}
            >
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: P.primary400, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {SECTION_LABELS[sectionKey]} ({pages.length})
              </Typography>
              {isCollapsed ? <ExpandMoreIcon sx={{ fontSize: 14, color: P.primary400 }} /> : <ExpandLessIcon sx={{ fontSize: 14, color: P.primary400 }} />}
            </Box>

            {!isCollapsed && pages.map((page) => {
              const globalIdx = allPages.findIndex(p => p.id === page.id)
              const isActive = currentPageIndex === globalIdx

              return (
                <Box
                  key={page.id}
                  onClick={() => onPageSelect(globalIdx)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.4,
                    borderRadius: 0.5,
                    cursor: 'pointer',
                    backgroundColor: isActive ? P.primary900 : 'transparent',
                    color: isActive ? P.white : P.primary700,
                    fontSize: '11px',
                    '&:hover': {
                      backgroundColor: isActive ? P.primary900 : alpha(theme.palette.divider, 0.08),
                    },
                  }}
                >
                  <Typography sx={{
                    fontSize: '9px',
                    fontWeight: 600,
                    minWidth: 18,
                    color: isActive ? alpha(P.white, 0.7) : P.primary400,
                  }}>
                    {page.pageNum}
                  </Typography>
                  <Typography sx={{
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? P.white : P.primary700,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {page.label}
                  </Typography>
                </Box>
              )
            })}
          </Box>
        )
      })}
    </Box>
  )
}

// ══════════════════════════════════════════
// TOOLBAR
// ══════════════════════════════════════════

interface ToolbarProps {
  currentPageIndex: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  onFirst: () => void
  onLast: () => void
  onPrint: () => void
  onExcel: () => void
  onPdf: () => void
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentPageIndex, totalPages, onPrev, onNext, onFirst, onLast, onPrint, onExcel, onPdf,
}) => (
  <Box
    className="liasse-toolbar no-print"
    sx={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      backgroundColor: P.white,
      borderBottom: `1px solid ${P.primary200}`,
      px: 2,
      py: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Tooltip title="Premiere page">
        <IconButton size="small" onClick={onFirst} disabled={currentPageIndex === 0}>
          <FirstPageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Page precedente">
        <IconButton size="small" onClick={onPrev} disabled={currentPageIndex === 0}>
          <PrevIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Chip
        label={`Page ${currentPageIndex + 1} / ${totalPages}`}
        size="small"
        sx={{ fontWeight: 600, fontSize: '11px', minWidth: 100, justifyContent: 'center' }}
      />
      <Tooltip title="Page suivante">
        <IconButton size="small" onClick={onNext} disabled={currentPageIndex === totalPages - 1}>
          <NextIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Derniere page">
        <IconButton size="small" onClick={onLast} disabled={currentPageIndex === totalPages - 1}>
          <LastPageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>

    <Stack direction="row" spacing={1}>
      <Button size="small" variant="contained" startIcon={<PrintIcon />} onClick={onPrint}
        sx={{ backgroundColor: P.primary900, fontSize: '11px', '&:hover': { backgroundColor: P.primary800 } }}>
        Imprimer
      </Button>
      <Button size="small" variant="outlined" startIcon={<ExcelIcon />} onClick={onExcel} sx={{ fontSize: '11px' }}>
        Excel
      </Button>
      <Button size="small" variant="outlined" startIcon={<PdfIcon />} onClick={onPdf} sx={{ fontSize: '11px' }}>
        PDF
      </Button>
    </Stack>
  </Box>
)

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════

const LiassePrintTemplate: React.FC<LiassePrintTemplateProps> = ({ regime, entreprise, exercice, initialPageId }) => {
  const configRegime = REGIME_MAP[regime]
  const allPages = getPagesForRegime(configRegime)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  // Reset page index when regime changes or if out of bounds
  React.useEffect(() => {
    setCurrentPageIndex(0)
  }, [configRegime])

  // Navigate to a specific page when initialPageId is provided
  useEffect(() => {
    if (!initialPageId) return
    const idx = allPages.findIndex(p => p.id === initialPageId)
    if (idx >= 0) setCurrentPageIndex(idx)
  }, [initialPageId, allPages])

  const safeIndex = currentPageIndex < allPages.length ? currentPageIndex : 0
  const currentPage = allPages[safeIndex]

  const handlePageSelect = useCallback((index: number) => {
    setCurrentPageIndex(index)
    contentRef.current?.scrollTo({ top: 0 })
  }, [])

  const handlePrev = useCallback(() => handlePageSelect(Math.max(0, safeIndex - 1)), [safeIndex, handlePageSelect])
  const handleNext = useCallback(() => handlePageSelect(Math.min(allPages.length - 1, safeIndex + 1)), [safeIndex, allPages.length, handlePageSelect])
  const handleFirst = useCallback(() => handlePageSelect(0), [handlePageSelect])
  const handleLast = useCallback(() => handlePageSelect(allPages.length - 1), [allPages.length, handlePageSelect])

  const handlePrint = useCallback(() => {
    printLiasse(regime, entreprise, exercice)
  }, [regime, entreprise, exercice])

  const handleExcel = useCallback(() => {
    exportLiasseExcel(
      { raison_sociale: entreprise.raison_sociale, numero_contribuable: entreprise.numero_contribuable },
      exercice,
      regime === 'normal' ? 'SN' : 'SMT',
    )
  }, [regime, entreprise, exercice])

  const handlePdf = useCallback(() => {
    printLiasse(regime, entreprise, exercice)
  }, [regime, entreprise, exercice])

  // Keyboard navigation
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); handlePrev() }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); handleNext() }
      if (e.key === 'Home') { e.preventDefault(); handleFirst() }
      if (e.key === 'End') { e.preventDefault(); handleLast() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handlePrev, handleNext, handleFirst, handleLast])

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 600, border: `1px solid ${P.primary200}`, borderRadius: 1, overflow: 'hidden' }}>
      {/* Sidebar */}
      <Sidebar
        regime={configRegime}
        currentPageIndex={safeIndex}
        onPageSelect={handlePageSelect}
      />

      {/* Content area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <Toolbar
          currentPageIndex={safeIndex}
          totalPages={allPages.length}
          onPrev={handlePrev}
          onNext={handleNext}
          onFirst={handleFirst}
          onLast={handleLast}
          onPrint={handlePrint}
          onExcel={handleExcel}
          onPdf={handlePdf}
        />

        {/* Page content */}
        <Box
          ref={contentRef}
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            backgroundColor: P.primary50,
          }}
        >
          <Box sx={{
            width: '210mm',
            maxWidth: '210mm',
            mx: 'auto',
            backgroundColor: P.white,
            borderRadius: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            minHeight: '297mm',
          }}>
            {currentPage && (
              <PageRenderer key={currentPage.id} page={currentPage} showHeader />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default LiassePrintTemplate
