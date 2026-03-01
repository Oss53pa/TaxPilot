/**
 * Hook de commodite pour l'exercice fiscal actif
 * + useExerciceEffect pour reagir aux changements d'exercice
 */

import { useEffect, useCallback } from 'react'
import { useExerciceStore } from '../store/exerciceStore'

/**
 * Hook principal : retourne l'exercice actif et les actions
 */
export function useExercice() {
  const { activeExercice, exercices, setActiveExercice, loadExercices, createExercice, refreshExercices } =
    useExerciceStore()

  useEffect(() => {
    loadExercices()
  }, [loadExercices])

  return {
    activeExercice,
    exercices,
    annee: activeExercice?.annee || null,
    setActiveExercice,
    createExercice,
    refreshExercices,
  }
}

/**
 * Hook qui execute un callback chaque fois que l'exercice actif change
 * via le CustomEvent 'fiscasync:exercice-changed'
 */
export function useExerciceEffect(callback: (annee: string) => void) {
  const stableCallback = useCallback(callback, [callback])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.annee) {
        stableCallback(detail.annee)
      }
    }

    window.addEventListener('fiscasync:exercice-changed', handler)
    return () => window.removeEventListener('fiscasync:exercice-changed', handler)
  }, [stableCallback])
}
