import { useState, useEffect, useCallback } from 'react'
import { hasCompletedTour, resetTour } from '@/components/onboarding/GuidedTour'

/**
 * Hook pour g\u00e9rer la visite guid\u00e9e in-app.
 * Auto-d\u00e9clenche \u00e0 la premi\u00e8re connexion (apr\u00e8s un d\u00e9lai).
 */
export function useGuidedTour() {
  const [isOpen, setIsOpen] = useState(false)

  // Auto-launch on first visit (delay to let layout settle)
  useEffect(() => {
    if (!hasCompletedTour()) {
      const timer = setTimeout(() => setIsOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const start = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const restart = useCallback(() => {
    resetTour()
    setIsOpen(true)
  }, [])

  return { isOpen, start, close, restart }
}
