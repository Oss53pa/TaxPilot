/**
 * Hook utilitaire pour accéder aux paramètres entreprise depuis localStorage
 */

import { useMemo } from 'react'
import { getEntreprise } from '@/services/entrepriseStorageService'
import type { Entreprise } from '@/services/entrepriseService'

export interface EntrepriseData {
  entreprise: Partial<Entreprise> | null
  hasEntreprise: boolean
  nom: string
  formeJuridique: string
  capitalSocial: number
  numeroContribuable: string
  rccm: string
  adresse: string
  ville: string
  pays: string
  email: string
  telephone: string
  nomDirigeant: string
  fonctionDirigeant: string
  regimeImposition: string
  secteurActivite: string
  exerciceDebut: string
  exerciceFin: string
  centreImpots: string
}

export function useEntrepriseData(): EntrepriseData {
  return useMemo(() => {
    const ent = getEntreprise()
    return {
      entreprise: ent,
      hasEntreprise: !!ent?.raison_sociale,
      nom: ent?.raison_sociale || '',
      formeJuridique: ent?.forme_juridique || '',
      capitalSocial: ent?.capital_social || 0,
      numeroContribuable: ent?.numero_contribuable || '',
      rccm: ent?.rccm || '',
      adresse: ent?.adresse_ligne1 || '',
      ville: ent?.ville || '',
      pays: ent?.pays || '',
      email: ent?.email || '',
      telephone: ent?.telephone || '',
      nomDirigeant: ent?.nom_dirigeant || '',
      fonctionDirigeant: ent?.fonction_dirigeant || '',
      regimeImposition: ent?.regime_imposition || '',
      secteurActivite: ent?.secteur_activite || '',
      exerciceDebut: ent?.exercice_debut || '',
      exerciceFin: ent?.exercice_fin || '',
      centreImpots: ent?.centre_impots || '',
    }
  }, [])
}
