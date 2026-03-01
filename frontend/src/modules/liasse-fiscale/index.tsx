import React, { Suspense, useState, useEffect, useCallback, useMemo } from 'react'
import {
  Box, CircularProgress, Typography, Button, Chip, Paper, IconButton, Alert,
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Send as SendIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ChevronRight,
  ChevronLeft,
  TableChart as ExcelIcon,
  FactCheck as ControleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { fiscasyncPalette as P } from '@/theme/fiscasyncTheme'
import { getWorkflowState } from '@/services/workflowStateService'
import type { WorkflowState } from '@/services/workflowStateService'
import { getPagesForRegime } from '@/config/liasse-pages-config'
import { useLiasseFiscaleData } from '@/hooks/useLiasseFiscaleData'
import LiasseNav from './components/LiasseNav'
import LiassePage from './components/LiassePage'
import LiasseStats from './components/LiasseStats'
import { LiasseRegimeContext } from './components/LiasseHeader'
import { PAGES } from './config'
import { NOTE_TO_PAGE_ID, toConfigRegime } from './types'
import { exporterLiasse } from './services/liasse-export-excel'

const SIDEBAR_TRANSITION = 'width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1)'
const COLLAPSED_WIDTH = 40

const LiasseFiscaleModule: React.FC = () => {
  const navigate = useNavigate()
  const { entreprise, balance, balanceN1, regime, setRegime, refresh } = useLiasseFiscaleData()
  const [currentPageId, setCurrentPageId] = useState(PAGES[0].id)
  const [zoom, setZoom] = useState(100)
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null)

  useEffect(() => {
    setWorkflowState(getWorkflowState())
  }, [])

  // Reload data on window focus or exercise change
  useEffect(() => {
    window.addEventListener('focus', refresh)
    window.addEventListener('fiscasync:exercice-changed', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('fiscasync:exercice-changed', refresh)
    }
  }, [refresh])

  // Filter pages by regime
  const filteredPages = useMemo(() => {
    const configRegime = toConfigRegime(regime)
    const allowedIds = new Set(getPagesForRegime(configRegime).map(p => p.moduleId))
    return PAGES.filter(p => allowedIds.has(p.id))
  }, [regime])

  // Navigate to first page if current page is filtered out
  useEffect(() => {
    if (filteredPages.length > 0 && !filteredPages.find(p => p.id === currentPageId)) {
      setCurrentPageId(filteredPages[0].id)
    }
  }, [filteredPages, currentPageId])

  const currentPage = useMemo(
    () => filteredPages.find(p => p.id === currentPageId) || filteredPages[0],
    [currentPageId, filteredPages]
  )

  const currentPageIndex = useMemo(
    () => filteredPages.findIndex(p => p.id === currentPageId),
    [currentPageId, filteredPages]
  )

  const PageComponent = currentPage.component

  const handleNoteClick = useCallback((noteNumber: string) => {
    const pageId = NOTE_TO_PAGE_ID[noteNumber.toUpperCase()] || NOTE_TO_PAGE_ID[noteNumber]
    if (pageId) {
      setCurrentPageId(pageId)
    }
  }, [])

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 10, 200)), [])
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 10, 50)), [])
  const handleZoomReset = useCallback(() => setZoom(100), [])

  const handleExportExcel = useCallback(() => {
    const dateFin = entreprise.exercice_clos || '31/12/2024'
    const annee = parseInt(dateFin.slice(-4)) || 2024
    exporterLiasse(balance, balanceN1, entreprise, {
      annee,
      dateDebut: `01/01/${annee}`,
      dateFin,
      dureeMois: entreprise.duree_mois || 12,
    })
  }, [balance, balanceN1, entreprise])

  return (
    <LiasseRegimeContext.Provider value={regime}>
    <Box sx={{ display: 'flex', gap: 0, height: '100%', overflow: 'hidden', '@media print': { height: 'auto', overflow: 'visible' } }}>
      {/* ── Left sidebar ── */}
      <Box sx={{
        width: leftOpen ? 280 : COLLAPSED_WIDTH,
        minWidth: leftOpen ? 280 : COLLAPSED_WIDTH,
        transition: SIDEBAR_TRANSITION,
        overflow: 'hidden',
        flexShrink: 0,
        '@media print': { display: 'none' },
      }}>
        {leftOpen ? (
          <LiasseNav
            currentPageId={currentPageId}
            onPageSelect={setCurrentPageId}
            regime={regime}
            onRegimeChange={setRegime}
            onCollapse={() => setLeftOpen(false)}
          />
        ) : (
          <Box
            onClick={() => setLeftOpen(true)}
            sx={{
              width: COLLAPSED_WIDTH,
              height: '100%',
              bgcolor: '#171717',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 1.5,
              gap: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#262626' },
              transition: 'background-color 0.2s',
            }}
          >
            <ChevronRight sx={{ fontSize: 18, color: '#a3a3a3' }} />
            <Typography sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#a3a3a3',
              letterSpacing: 1,
              mt: 1,
            }}>
              Navigation
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Main content ── */}
      <Box sx={{ flexGrow: 1, minWidth: 0, mx: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Paper
          elevation={1}
          sx={{
            flexShrink: 0,
            px: 2,
            py: 1,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderRadius: 2,
            '@media print': { display: 'none' },
          }}
        >
          <Button
            size="small"
            startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
            onClick={() => navigate('/dashboard')}
            sx={{ color: P.primary600, fontWeight: 500, fontSize: '0.78rem', minWidth: 0, '&:hover': { bgcolor: 'grey.100' } }}
          >
            Retour
          </Button>

          <Box sx={{ borderLeft: '1px solid #e0e0e0', height: 24, mx: 0.5 }} />

          <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ maxWidth: 200 }}>
            {entreprise.denomination || 'Liasse Fiscale'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {entreprise.exercice_clos ? `Ex. ${entreprise.exercice_clos}` : ''}
          </Typography>

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={`${currentPageIndex + 1}/${filteredPages.length}`} size="small" sx={{ bgcolor: 'text.primary', color: P.white, fontWeight: 600, fontSize: '0.7rem', height: 24 }} />
            <Chip label={regime.replace(/_/g, ' ')} size="small" color="primary" variant="outlined" sx={{ fontSize: '0.7rem', height: 24 }} />
            {balance.length > 0 && (
              <Chip label={`${balance.length} comptes`} size="small" color="success" variant="outlined" sx={{ fontSize: '0.7rem', height: 24 }} />
            )}

            <Box sx={{ borderLeft: '1px solid #e0e0e0', height: 24, mx: 0.5 }} />

            {/* Zoom controls */}
            <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50} sx={{ p: 0.5 }}>
              <ZoomOutIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Chip
              label={`${zoom}%`}
              size="small"
              onClick={handleZoomReset}
              sx={{
                fontSize: '0.68rem',
                fontWeight: 600,
                height: 22,
                cursor: 'pointer',
                bgcolor: zoom !== 100 ? '#e5e5e5' : 'transparent',
                '&:hover': { bgcolor: '#d4d4d4' },
              }}
            />
            <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 200} sx={{ p: 0.5 }}>
              <ZoomInIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <Box sx={{ borderLeft: '1px solid #e0e0e0', height: 24, mx: 0.5 }} />

            <Button size="small" variant="outlined" startIcon={<ControleIcon sx={{ fontSize: 16 }} />} onClick={() => navigate('/validation-liasse')} sx={{ minWidth: 0, fontSize: '0.75rem', fontWeight: 600 }}>Contrôle</Button>
            <Button size="small" startIcon={<ExcelIcon sx={{ fontSize: 16 }} />} onClick={handleExportExcel} sx={{ minWidth: 0, fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Excel</Button>
            <Button size="small" startIcon={<DownloadIcon sx={{ fontSize: 16 }} />} onClick={() => window.print()} sx={{ minWidth: 0, fontSize: '0.75rem' }}>PDF</Button>
            <Button size="small" startIcon={<PrintIcon sx={{ fontSize: 16 }} />} onClick={() => window.print()} sx={{ minWidth: 0, fontSize: '0.75rem' }}>Imprimer</Button>
            <Button size="small" startIcon={<SendIcon sx={{ fontSize: 16 }} />} onClick={() => navigate('/teledeclaration')} sx={{ minWidth: 0, fontSize: '0.75rem' }}>Envoyer</Button>
          </Box>
        </Paper>

        {/* Controle status banner */}
        {workflowState && (
          <Box sx={{ mb: 1, '@media print': { display: 'none' } }}>
            {workflowState.controleDone && workflowState.controleResult === 'passed' && (
              <Alert severity="success" icon={<CheckCircleIcon />} sx={{ py: 0.25 }}
                action={<Chip label={`${workflowState.controleScore}/100`} size="small" color="success" sx={{ fontWeight: 700 }} />}>
                Controle de coherence valide
              </Alert>
            )}
            {workflowState.controleDone && workflowState.controleResult === 'passed_with_warnings' && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ py: 0.25 }}
                action={<Chip label={`${workflowState.controleScore}/100`} size="small" color="warning" sx={{ fontWeight: 700 }} />}>
                Controle valide avec avertissements
              </Alert>
            )}
            {workflowState.controleDone && workflowState.controleResult === 'failed' && (
              <Alert severity="error" sx={{ py: 0.25 }}
                action={
                  <Button size="small" color="inherit" onClick={() => navigate('/validation-liasse')}>
                    Voir les bloquants
                  </Button>
                }>
                {workflowState.controleBloquants} controle(s) bloquant(s) — Score: {workflowState.controleScore}/100
              </Alert>
            )}
            {!workflowState.controleDone && (
              <Alert severity="info" sx={{ py: 0.25 }}
                action={
                  <Button size="small" color="inherit" onClick={() => navigate('/validation-liasse')}>
                    Lancer le controle
                  </Button>
                }>
                Controle de coherence non lance
              </Alert>
            )}
          </Box>
        )}

        {/* Page content */}
        <Paper sx={{ p: 0, flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
          <Box sx={{ textAlign: 'center', py: 0.5, bgcolor: 'grey.50', borderBottom: 1, borderColor: 'divider', '@media print': { display: 'none' } }}>
            <Typography variant="caption" color="text.secondary">
              {currentPage.ongletExcel}
            </Typography>
          </Box>

          <Box sx={{ p: 2 }}>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <CircularProgress size={32} />
              </Box>
            }>
              <LiassePage orientation={currentPage.orientation} zoom={zoom}>
                <PageComponent entreprise={entreprise} balance={balance} balanceN1={balanceN1} regime={regime} onNoteClick={handleNoteClick} />
              </LiassePage>
            </Suspense>
          </Box>
        </Paper>
      </Box>

      {/* ── Right sidebar ── */}
      <Box sx={{
        width: rightOpen ? 300 : COLLAPSED_WIDTH,
        minWidth: rightOpen ? 300 : COLLAPSED_WIDTH,
        transition: SIDEBAR_TRANSITION,
        overflow: 'hidden',
        flexShrink: 0,
        '@media print': { display: 'none' },
      }}>
        {rightOpen ? (
          <LiasseStats
            currentPage={currentPage}
            entreprise={entreprise}
            balance={balance}
            balanceN1={balanceN1}
            onCollapse={() => setRightOpen(false)}
          />
        ) : (
          <Box
            onClick={() => setRightOpen(true)}
            sx={{
              width: COLLAPSED_WIDTH,
              height: '100%',
              bgcolor: '#fafafa',
              border: '1px solid #e5e5e5',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pt: 1.5,
              gap: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#f0f0f0' },
              transition: 'background-color 0.2s',
            }}
          >
            <ChevronLeft sx={{ fontSize: 18, color: '#737373' }} />
            <Typography sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              fontSize: '0.68rem',
              fontWeight: 600,
              color: '#737373',
              letterSpacing: 1,
              mt: 1,
            }}>
              Statistiques
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
    </LiasseRegimeContext.Provider>
  )
}

export default LiasseFiscaleModule
