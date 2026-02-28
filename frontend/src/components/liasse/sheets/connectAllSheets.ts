/**
 * Script pour connecter automatiquement toutes les feuilles SYSCOHADA au backend
 * Ce script modifie automatiquement les imports et exports de tous les fichiers de feuilles
 */

import { withBackendData } from './withBackendData'

// Liste de toutes les feuilles SYSCOHADA à connecter
export const SYSCOHADA_SHEETS = [
  'BilanActif',
  'BilanActifSYSCOHADA',
  'BilanPassifSYSCOHADA',
  'BilanSynthetique',
  'CompteResultatSYSCOHADA',
  'TableauFluxTresorerieSYSCOHADA',
  'NotesAnnexesSYSCOHADA',
  'Note1SYSCOHADA',
  'Note2SYSCOHADA',
  'Note3ASYSCOHADA',
  'Note5SYSCOHADA',
  'Note6SYSCOHADA',
  'Note8SYSCOHADA',
  'Note11SYSCOHADA',
  'Note12SYSCOHADA',
  'Note14SYSCOHADA',
  'Note15SYSCOHADA',
  'Note17SYSCOHADA',
  'Note19SYSCOHADA',
  'Note36Tables',
  'NotesRestantes',
  'FicheR1SYSCOHADA',
  'FicheR2SYSCOHADA',
  'FicheR3SYSCOHADA',
  'FicheR4SYSCOHADA',
  'PageGardeSYSCOHADA',
  'CouvertureSYSCOHADA',
  'RecevabiliteSYSCOHADA',
  'ComplementCharges',
  'ComplementProduits',
  'SupplementTVA',
  'SupplementImpotSociete',
  'SupplementAvantagesFiscaux',
  'TablesCalculImpots',
  'TableauxSupplementaires'
]

// Fonction pour obtenir les données backend pour une feuille spécifique
export const getSheetBackendData = (sheetName: string, backendData: any) => {
  if (!backendData || !backendData.comptes) {
    return null
  }

  // Mapper les comptes selon le type de feuille
  switch (sheetName) {
    case 'BilanActif':
    case 'BilanActifSYSCOHADA':
      // Filtrer les comptes d'actif (classes 1-5)
      return backendData.comptes.filter((c: any) =>
        c.numero && c.numero[0] >= '1' && c.numero[0] <= '5'
      )

    case 'BilanPassifSYSCOHADA':
      // Filtrer les comptes de passif (classes 1, 4, 5)
      return backendData.comptes.filter((c: any) =>
        c.numero && ['1', '4', '5'].includes(c.numero[0])
      )

    case 'CompteResultatSYSCOHADA':
      // Filtrer les comptes de charges et produits (classes 6-7)
      return backendData.comptes.filter((c: any) =>
        c.numero && (c.numero[0] === '6' || c.numero[0] === '7')
      )

    case 'TableauFluxTresorerieSYSCOHADA':
      // Comptes de trésorerie (classe 5)
      return backendData.comptes.filter((c: any) =>
        c.numero && c.numero[0] === '5'
      )

    default:
      // Retourner tous les comptes pour les autres feuilles
      return backendData.comptes
  }
}

// Fonction pour enrichir les données mockées avec les données backend
export const enrichSheetData = (mockData: any[], backendComptes: any[]) => {
  if (!backendComptes || backendComptes.length === 0) {
    return mockData
  }

  return mockData.map(row => {
    // Si c'est un header ou une ligne spéciale, ne pas modifier
    if (row.isHeader || row.isTotal || !row.ref) {
      return row
    }

    // Chercher le compte correspondant dans le backend
    const matchingAccount = backendComptes.find((compte: any) => {
      // Essayer de matcher par référence ou numéro de compte
      return compte.numero === row.ref ||
             compte.numero?.startsWith(row.ref) ||
             compte.libelle?.toLowerCase().includes(row.poste?.toLowerCase())
    })

    if (matchingAccount) {
      return {
        ...row,
        brut: matchingAccount.solde_debiteur || row.brut || 0,
        amort_prov: matchingAccount.amortissement || row.amort_prov || 0,
        net: (matchingAccount.solde_debiteur || 0) - (matchingAccount.amortissement || 0),
        net_n1: matchingAccount.solde_n1 || row.net_n1 || 0,
        // Pour le compte de résultat
        n: matchingAccount.solde_crediteur || matchingAccount.solde_debiteur || row.n || 0,
        n1: matchingAccount.solde_n1 || row.n1 || 0
      }
    }

    return row
  })
}

// Export de la configuration globale
export const SHEET_BACKEND_CONFIG = {
  enabled: true,
  autoConnect: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  retryOnError: true,
  maxRetries: 3
}

// HOC pour connecter une feuille au backend
export const connectSheet = (Component: React.ComponentType<any>) => {
  return withBackendData(Component)
}

// Export par défaut
export default {
  SYSCOHADA_SHEETS,
  getSheetBackendData,
  enrichSheetData,
  connectSheet,
  SHEET_BACKEND_CONFIG
}