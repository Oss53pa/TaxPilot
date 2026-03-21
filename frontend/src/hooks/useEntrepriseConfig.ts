/**
 * useEntrepriseConfig — Hook complet pour la config entreprise incluant branding
 * Reactif aux events entreprise-saved et dossier-changed
 */

import { useMemo, useState, useEffect, useCallback } from 'react'
import { getEntreprise, saveEntreprise } from '@/services/entrepriseStorageService'
import type { Entreprise } from '@/services/entrepriseService'

export function useEntrepriseConfig() {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const handler = () => setVersion(v => v + 1)
    window.addEventListener('fiscasync:entreprise-saved', handler)
    window.addEventListener('fiscasync:dossier-changed', handler)
    return () => {
      window.removeEventListener('fiscasync:entreprise-saved', handler)
      window.removeEventListener('fiscasync:dossier-changed', handler)
    }
  }, [])

  const entreprise = useMemo(() => {
    return getEntreprise() || {}
  }, [version])

  const exercice = useMemo(() => ({
    dateDebut: entreprise.exercice_debut || '',
    dateFin: entreprise.exercice_fin || '',
    dateDepot: entreprise.date_depot || '',
  }), [entreprise])

  const updateEntreprise = useCallback((updates: Partial<Entreprise>) => {
    const current = getEntreprise() || {}
    const merged = { ...current, ...updates }
    saveEntreprise(merged)
  }, [])

  return {
    entreprise: entreprise as Partial<Entreprise>,
    exercice,
    updateEntreprise,
    isLoaded: !!entreprise.raison_sociale,
  }
}
