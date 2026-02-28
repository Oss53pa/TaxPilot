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
  sigle: string
  codeApe: string
  brancheActivite: string
  codeSecteur: string
  categorieImposition: string
  effectifDebut: number
  effectifFin: number
  isGroupe: boolean
  hasDeclaration301: boolean
  hasDeclaration302: boolean
  dateCreationEntreprise: string
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
      sigle: ent?.sigle || '',
      codeApe: ent?.code_ape || '',
      brancheActivite: ent?.branche_activite || '',
      codeSecteur: ent?.code_secteur || '',
      categorieImposition: ent?.categorie_imposition || '',
      effectifDebut: ent?.effectif_debut || 0,
      effectifFin: ent?.effectif_fin || 0,
      isGroupe: ent?.is_groupe || false,
      hasDeclaration301: ent?.has_declaration_301 || false,
      hasDeclaration302: ent?.has_declaration_302 || false,
      dateCreationEntreprise: ent?.date_creation_entreprise || '',
    }
  }, [])
}
