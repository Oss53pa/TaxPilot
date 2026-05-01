/**
 * GuidedTour — Visite guid\u00e9e in-app sans d\u00e9pendance externe
 * Affiche un overlay avec spotlight + tooltip qui pointe vers les \u00e9l\u00e9ments cl\u00e9s.
 * D\u00e9clench\u00e9e automatiquement \u00e0 la premi\u00e8re connexion (flag localStorage).
 */
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Box, Typography, Button, IconButton, LinearProgress } from '@mui/material'
import { Close as CloseIcon, ArrowForward, ArrowBack } from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

export interface TourStep {
  id: string
  /** CSS selector or null for centered modal */
  selector: string | null
  title: string
  content: string
  /** Optional route to navigate to before showing this step */
  route?: string
  /** Tooltip placement relative to target */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    selector: null,
    placement: 'center',
    title: 'Bienvenue dans Liass\'Pilot',
    content: 'D\u00e9couvrez votre nouvelle solution de production de liasse fiscale SYSCOHADA en moins de 2 minutes. Cliquez sur "Suivant" pour commencer la visite.',
  },
  {
    id: 'sidebar',
    selector: '[data-tour="sidebar"]',
    placement: 'right',
    title: 'Navigation principale',
    content: 'La barre lat\u00e9rale donne acc\u00e8s \u00e0 tous les modules : Dossiers, Balance, Audit, Liasse Fiscale, Reporting et plus. Vous pouvez la r\u00e9duire avec l\'ic\u00f4ne en haut.',
  },
  {
    id: 'dashboard',
    selector: '[data-tour="dashboard"]',
    placement: 'bottom',
    route: '/dashboard',
    title: 'Tableau de bord',
    content: 'Vue d\'ensemble de votre activit\u00e9 : KPIs temps r\u00e9el, alertes, raccourcis et derni\u00e8res actions. C\'est votre point de d\u00e9part quotidien.',
  },
  {
    id: 'import-balance',
    selector: '[data-tour="import-balance"]',
    placement: 'bottom',
    route: '/import-balance',
    title: 'Importer une balance',
    content: 'Importez votre balance SYSCOHADA depuis Excel ou CSV. Le syst\u00e8me d\u00e9tecte automatiquement les colonnes et lance les contr\u00f4les.',
  },
  {
    id: 'audit',
    selector: '[data-tour="audit"]',
    placement: 'bottom',
    route: '/audit',
    title: 'Audit & Contr\u00f4les',
    content: '169 contr\u00f4les automatis\u00e9s v\u00e9rifient la coh\u00e9rence de votre balance. R\u00e9solvez les erreurs bloquantes avant de g\u00e9n\u00e9rer la liasse.',
  },
  {
    id: 'liasse',
    selector: '[data-tour="liasse"]',
    placement: 'bottom',
    route: '/liasse-fiscale',
    title: 'G\u00e9n\u00e9ration de la liasse',
    content: '80+ pages SYSCOHADA g\u00e9n\u00e9r\u00e9es automatiquement : Bilan, Compte de R\u00e9sultat, SIG, TFT, Notes Annexes, Passage Fiscal.',
  },
  {
    id: 'help',
    selector: '[data-tour="help"]',
    placement: 'bottom',
    title: 'Centre d\'aide',
    content: 'Besoin d\'aide ? Acc\u00e9dez \u00e0 la FAQ, aux formations vid\u00e9o et au support depuis ce menu. PROPH3T, notre IA fiscale, est \u00e9galement disponible.',
  },
  {
    id: 'finish',
    selector: null,
    placement: 'center',
    title: 'Vous \u00eates pr\u00eat \ud83c\udf89',
    content: 'La visite est termin\u00e9e ! Vous pouvez maintenant explorer Liass\'Pilot \u00e0 votre rythme. Vous trouverez ce tour dans la section "Aide" si vous voulez le revoir.',
  },
]

const STORAGE_KEY = 'liasspilot_guided_tour_completed'

export function hasCompletedTour(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1'
}

export function markTourCompleted(): void {
  localStorage.setItem(STORAGE_KEY, '1')
}

export function resetTour(): void {
  localStorage.removeItem(STORAGE_KEY)
}

interface GuidedTourProps {
  open: boolean
  onClose: () => void
}

const GuidedTour: React.FC<GuidedTourProps> = ({ open, onClose }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [stepIndex, setStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentStep = TOUR_STEPS[stepIndex]
  const isLast = stepIndex === TOUR_STEPS.length - 1
  const isFirst = stepIndex === 0

  const updateTargetRect = useCallback(() => {
    if (!currentStep) return
    if (!currentStep.selector || currentStep.placement === 'center') {
      setTargetRect(null)
      return
    }
    const el = document.querySelector(currentStep.selector)
    if (el) {
      setTargetRect(el.getBoundingClientRect())
    } else {
      setTargetRect(null)
    }
  }, [currentStep])

  // Navigate to required route + wait for DOM, then locate target
  useEffect(() => {
    if (!open || !currentStep) return

    if (currentStep.route && location.pathname !== currentStep.route) {
      navigate(currentStep.route)
    }

    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
    updateTimeoutRef.current = setTimeout(updateTargetRect, 400)

    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
    }
  }, [open, currentStep, location.pathname, navigate, updateTargetRect])

  // Re-locate on resize
  useEffect(() => {
    if (!open) return
    const handler = () => updateTargetRect()
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [open, updateTargetRect])

  const handleNext = () => {
    if (isLast) {
      handleFinish()
    } else {
      setStepIndex(stepIndex + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirst) setStepIndex(stepIndex - 1)
  }

  const handleFinish = () => {
    markTourCompleted()
    setStepIndex(0)
    onClose()
  }

  const handleSkip = () => {
    markTourCompleted()
    setStepIndex(0)
    onClose()
  }

  if (!open || !currentStep) return null

  // Tooltip positioning
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 100000,
    maxWidth: 380,
    background: '#fff',
    color: '#171717',
    borderRadius: 12,
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    padding: 24,
  }

  if (!targetRect || currentStep.placement === 'center') {
    tooltipStyle.top = '50%'
    tooltipStyle.left = '50%'
    tooltipStyle.transform = 'translate(-50%, -50%)'
  } else {
    const margin = 16
    switch (currentStep.placement) {
      case 'top':
        tooltipStyle.top = targetRect.top - margin
        tooltipStyle.left = targetRect.left + targetRect.width / 2
        tooltipStyle.transform = 'translate(-50%, -100%)'
        break
      case 'bottom':
        tooltipStyle.top = targetRect.bottom + margin
        tooltipStyle.left = targetRect.left + targetRect.width / 2
        tooltipStyle.transform = 'translateX(-50%)'
        break
      case 'left':
        tooltipStyle.top = targetRect.top + targetRect.height / 2
        tooltipStyle.left = targetRect.left - margin
        tooltipStyle.transform = 'translate(-100%, -50%)'
        break
      case 'right':
      default:
        tooltipStyle.top = targetRect.top + targetRect.height / 2
        tooltipStyle.left = targetRect.right + margin
        tooltipStyle.transform = 'translateY(-50%)'
        break
    }
  }

  // Spotlight cutout via SVG mask
  const spotlightPadding = 8
  const spot = targetRect
    ? {
        x: targetRect.left - spotlightPadding,
        y: targetRect.top - spotlightPadding,
        width: targetRect.width + spotlightPadding * 2,
        height: targetRect.height + spotlightPadding * 2,
      }
    : null

  const progress = ((stepIndex + 1) / TOUR_STEPS.length) * 100

  return (
    <>
      {/* Overlay with optional spotlight */}
      <svg
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          pointerEvents: 'auto',
        }}
        onClick={handleSkip}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spot && (
              <rect
                x={spot.x}
                y={spot.y}
                width={spot.width}
                height={spot.height}
                rx={8}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.65)"
          mask="url(#spotlight-mask)"
        />
        {spot && (
          <rect
            x={spot.x}
            y={spot.y}
            width={spot.width}
            height={spot.height}
            rx={8}
            fill="none"
            stroke="#EF9F27"
            strokeWidth={2}
          />
        )}
      </svg>

      {/* Tooltip */}
      <Box style={tooltipStyle} onClick={(e) => e.stopPropagation()}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            \u00c9TAPE {stepIndex + 1} / {TOUR_STEPS.length}
          </Typography>
          <IconButton size="small" onClick={handleSkip} sx={{ mt: -1, mr: -1 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
          {currentStep.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          {currentStep.content}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mb: 2, height: 4, borderRadius: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button size="small" onClick={handleSkip} sx={{ color: 'text.secondary' }}>
            Passer
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isFirst && (
              <Button
                size="small"
                onClick={handlePrev}
                startIcon={<ArrowBack />}
                variant="outlined"
              >
                Pr\u00e9c\u00e9dent
              </Button>
            )}
            <Button
              size="small"
              onClick={handleNext}
              endIcon={!isLast ? <ArrowForward /> : undefined}
              variant="contained"
            >
              {isLast ? 'Terminer' : 'Suivant'}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default GuidedTour
