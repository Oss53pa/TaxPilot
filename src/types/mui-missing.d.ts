/**
 * Déclarations TypeScript pour résoudre les imports manquants Material-UI
 * Fichier temporaire pour livraison client - à nettoyer progressivement
 */

// Déclarations globales pour les icônes manquantes
declare global {
  const DeleteIcon: React.ComponentType<any>
  const Checkbox: React.ComponentType<any>
  const AccountTree: React.ComponentType<any>
  const People: React.ComponentType<any>
  const AccountBalance: React.ComponentType<any>
  const Receipt: React.ComponentType<any>
  const AttachMoney: React.ComponentType<any>
  const CircularProgress: React.ComponentType<any>
  const AccountBalanceIcon: React.ComponentType<any>
}

// Augmentation des modules existants
declare module '@mui/material' {
  export interface ComponentsPropsList {
    MuiAlert?: {
      size?: 'small' | 'medium' | 'large'
    }
    MuiLinearProgress?: {
      size?: 'small' | 'medium' | 'large'
    }
  }
}

// Types étendus pour objets avec propriétés calculées
export interface ExtendedFinancialData {
  montantDebut: number
  dotations: number
  reprises: number
  montantFin: number
  variation?: number
}

export interface ExtendedEvolutionData {
  montantN: number
  montantN1: number
  evolution?: number
  pourcentageCA?: number
}

export {}