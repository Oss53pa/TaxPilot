/**
 * Configuration des composants de la Liasse Fiscale
 * Mapping complet de tous les onglets et composants
 */

import React from 'react'

// Import des composants existants
import BilanActif from '../components/liasse/BilanActif'
import BilanPassif from '../components/liasse/BilanPassif'
import CompteResultat from '../components/liasse/CompteResultat'
import Tafire from '../components/liasse/Tafire'
import FluxTresorerie from '../components/liasse/FluxTresorerie'
import VariationCapitaux from '../components/liasse/VariationCapitaux'
import NotesAnnexesCompletesFinal from '../components/liasse/NotesAnnexesCompletesFinal'

// Import des nouveaux composants
import Couverture from '../components/liasse/sheets/Couverture'
import BilanSynthetique from '../components/liasse/sheets/BilanSynthetique'
import Note36Tables from '../components/liasse/sheets/Note36Tables'
import FicheR1SYSCOHADA from '../components/liasse/sheets/FicheR1SYSCOHADA'
import FicheR2SYSCOHADA from '../components/liasse/sheets/FicheR2SYSCOHADA'
import FicheR3SYSCOHADA from '../components/liasse/sheets/FicheR3SYSCOHADA'
import FicheR4SYSCOHADA from '../components/liasse/sheets/FicheR4SYSCOHADA'

// Icons
import {
  Assignment,
  AccountBalance,
  TrendingUp,
  TableChart,
  Description,
  Notes,
  AttachMoney,
  SwapHoriz,
  Assessment,
  Business,
  Group,
  TrendingDown,
  AccountTree,
  Category,
  VpnKey,
  Shield,
} from '@mui/icons-material'

export interface LiasseComponentConfig {
  id: string
  label: string
  icon: React.ReactElement
  component: React.ComponentType<any>
  description: string
  status: 'complete' | 'partial' | 'empty'
  completude: number
  category: string
  order: number
  isVisible: boolean
}

export const LIASSE_COMPONENTS: LiasseComponentConfig[] = [
  // Pages de garde et couverture
  {
    id: 'couverture',
    label: 'Page de Couverture',
    icon: React.createElement(Assignment),
    component: Couverture,
    description: 'Page de couverture de la liasse fiscale',
    status: 'complete',
    completude: 100,
    category: 'Couverture',
    order: 1,
    isVisible: true,
  },
  
  // Tables de référence
  {
    id: 'note36-codes',
    label: 'Note 36 - Tables des Codes',
    icon: React.createElement(AccountTree),
    component: Note36Tables,
    description: 'Plan comptable SYSCOHADA et codes de référence',
    status: 'complete',
    completude: 100,
    category: 'Références',
    order: 2,
    isVisible: true,
  },

  // Fiches de renseignements
  {
    id: 'fiche-r1',
    label: 'Fiche R1 - Renseignements Généraux',
    icon: React.createElement(Business),
    component: FicheR1SYSCOHADA,
    description: 'Identification et renseignements généraux de l\'entreprise',
    status: 'complete',
    completude: 95,
    category: 'Fiches',
    order: 3,
    isVisible: true,
  },
  {
    id: 'fiche-r2',
    label: 'Fiche R2 - Dirigeants et CAC',
    icon: React.createElement(Group),
    component: FicheR2SYSCOHADA,
    description: 'Dirigeants et commissaires aux comptes',
    status: 'complete',
    completude: 90,
    category: 'Fiches',
    order: 4,
    isVisible: true,
  },
  {
    id: 'fiche-r3',
    label: 'Fiche R3 - Participations',
    icon: React.createElement(Shield),
    component: FicheR3SYSCOHADA,
    description: 'Participations et filiales',
    status: 'complete',
    completude: 85,
    category: 'Fiches',
    order: 5,
    isVisible: true,
  },
  {
    id: 'fiche-r4',
    label: 'Fiche R4 - Informations Complémentaires',
    icon: React.createElement(Description),
    component: FicheR4SYSCOHADA,
    description: 'Autres informations requises',
    status: 'partial',
    completude: 70,
    category: 'Fiches',
    order: 6,
    isVisible: true,
  },

  // États financiers principaux
  {
    id: 'bilan-synthetique',
    label: 'Bilan Synthétique',
    icon: React.createElement(Assessment),
    component: BilanSynthetique,
    description: 'Vue d\'ensemble de la situation patrimoniale',
    status: 'complete',
    completude: 100,
    category: 'États financiers',
    order: 7,
    isVisible: true,
  },
  {
    id: 'bilan-actif',
    label: 'Bilan - Actif',
    icon: React.createElement(AccountBalance),
    component: BilanActif,
    description: 'État de la situation patrimoniale - Actif',
    status: 'complete',
    completude: 95,
    category: 'États financiers',
    order: 8,
    isVisible: true,
  },
  {
    id: 'bilan-passif',
    label: 'Bilan - Passif',
    icon: React.createElement(AccountBalance),
    component: BilanPassif,
    description: 'État de la situation patrimoniale - Passif',
    status: 'complete',
    completude: 92,
    category: 'États financiers',
    order: 9,
    isVisible: true,
  },
  {
    id: 'compte-resultat',
    label: 'Compte de Résultat',
    icon: React.createElement(TrendingUp),
    component: CompteResultat,
    description: 'Performance économique de l\'exercice',
    status: 'complete',
    completude: 88,
    category: 'États financiers',
    order: 10,
    isVisible: true,
  },
  {
    id: 'tafire',
    label: 'TAFIRE',
    icon: React.createElement(TableChart),
    component: Tafire,
    description: 'Tableau Financier des Ressources et Emplois',
    status: 'partial',
    completude: 75,
    category: 'États financiers',
    order: 11,
    isVisible: true,
  },
  {
    id: 'flux-tresorerie',
    label: 'Flux de Trésorerie',
    icon: React.createElement(AttachMoney),
    component: FluxTresorerie,
    description: 'Mouvements de trésorerie de l\'exercice',
    status: 'partial',
    completude: 65,
    category: 'États financiers',
    order: 12,
    isVisible: true,
  },
  {
    id: 'variation-capitaux',
    label: 'Variation Capitaux Propres',
    icon: React.createElement(SwapHoriz),
    component: VariationCapitaux,
    description: 'Évolution des capitaux propres',
    status: 'partial',
    completude: 70,
    category: 'États financiers',
    order: 13,
    isVisible: true,
  },
  
  // Notes annexes
  {
    id: 'notes-annexes',
    label: 'Notes Annexes (1-35)',
    icon: React.createElement(Notes),
    component: NotesAnnexesCompletesFinal,
    description: 'Notes explicatives détaillées aux états financiers',
    status: 'partial',
    completude: 80,
    category: 'Notes annexes',
    order: 14,
    isVisible: true,
  },
]

// Fonction utilitaire pour obtenir un composant par ID
export const getComponentById = (id: string): LiasseComponentConfig | undefined => {
  return LIASSE_COMPONENTS.find(comp => comp.id === id)
}

// Fonction pour obtenir les composants par catégorie
export const getComponentsByCategory = (): Record<string, LiasseComponentConfig[]> => {
  return LIASSE_COMPONENTS.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = []
    }
    acc[comp.category].push(comp)
    return acc
  }, {} as Record<string, LiasseComponentConfig[]>)
}

// Calcul de la complétude globale
export const getGlobalCompletude = (): number => {
  const visibleComponents = LIASSE_COMPONENTS.filter(comp => comp.isVisible)
  const totalCompletude = visibleComponents.reduce((sum, comp) => sum + comp.completude, 0)
  return Math.round(totalCompletude / visibleComponents.length)
}

// Statistiques par statut
export const getStatusStats = () => {
  const visibleComponents = LIASSE_COMPONENTS.filter(comp => comp.isVisible)
  return {
    total: visibleComponents.length,
    complete: visibleComponents.filter(comp => comp.status === 'complete').length,
    partial: visibleComponents.filter(comp => comp.status === 'partial').length,
    empty: visibleComponents.filter(comp => comp.status === 'empty').length,
  }
}