/**
 * Utilitaire pour connecter automatiquement les composants au backend
 * Remplace les données mockées par les appels API réels
 */

import * as services from '@/services'

// Configuration des mappings service -> méthodes
export const SERVICE_MAPPINGS: Record<string, { service: any; methods: Record<string, string> }> = {
  // Entreprises
  'entreprises': {
    service: services.entrepriseService,
    methods: {
      list: 'getEntreprises',
      get: 'getEntreprise',
      create: 'createEntreprise',
      update: 'updateEntreprise',
      delete: 'deleteEntreprise',
      stats: 'getDashboardStats'
    }
  },

  // Balances
  'balances': {
    service: services.balanceService,
    methods: {
      list: 'getBalances',
      get: 'getBalance',
      create: 'createBalance',
      import: 'importBalance',
      details: 'getBalanceDetails',
      validate: 'validateBalance'
    }
  },

  // Audits
  'audits': {
    service: services.auditService,
    methods: {
      list: 'getAuditSessions',
      get: 'getAuditSession',
      start: 'startAudit',
      anomalies: 'getAuditAnomalies',
      stats: 'getAuditStats'
    }
  },

  // Générations
  'generations': {
    service: services.generationService,
    methods: {
      list: 'getLiasseGenerations',
      get: 'getLiasseGeneration',
      generate: 'generateLiasse',
      status: 'getGenerationStatus',
      download: 'downloadLiasse'
    }
  },

  // Templates
  'templates': {
    service: services.templatesService,
    methods: {
      list: 'getTemplates',
      get: 'getTemplate',
      create: 'createTemplate',
      update: 'updateTemplate',
      preview: 'previewTemplate'
    }
  },

  // Fiscalité
  'fiscal': {
    service: services.taxService,
    methods: {
      declarations: 'getDeclarations',
      obligations: 'getObligations',
      calculateIS: 'calculateIS',
      calculateTVA: 'calculateTVA',
      submit: 'submitDeclaration'
    }
  },

  // Comptabilité
  'comptabilite': {
    service: services.accountingService,
    methods: {
      plans: 'getPlansComptables',
      comptes: 'getComptes',
      ecritures: 'getEcritures',
      balance: 'getBalance',
      grandLivre: 'getGrandLivre'
    }
  },

  // Reporting
  'reporting': {
    service: services.reportingService,
    methods: {
      reports: 'getReports',
      generate: 'generateReport',
      dashboard: 'getDashboardStats',
      analytics: 'getAnalytics'
    }
  }
}

// Fonction générique pour remplacer les données mockées
export const replaceMockData = async (
  serviceType: string,
  method: string,
  params?: any,
  defaultData?: any
) => {
  try {
    const mapping = SERVICE_MAPPINGS[serviceType]
    if (!mapping) {
      console.warn(`Service mapping not found for ${serviceType}`)
      return defaultData
    }

    const methodName = mapping.methods[method]
    if (!methodName) {
      console.warn(`Method ${method} not found in ${serviceType}`)
      return defaultData
    }

    console.log(`Fetching ${serviceType}.${method} from backend...`)
    const response = await (mapping.service as any)[methodName](params)

    // Gérer les réponses paginées
    return response?.results !== undefined ? response.results : response
  } catch (error) {
    console.error(`Error fetching ${serviceType}.${method}:`, error)
    return defaultData || []
  }
}

// Fonction pour convertir les données mockées au format backend
export const convertToBackendFormat = (mockData: any[], dataType: string) => {
  switch (dataType) {
    case 'balance':
      return mockData.map(item => ({
        id: item.id,
        numero_compte: item.compte || item.account,
        libelle_compte: item.libelle || item.accountName,
        solde_debit: item.debit || item.debitAmount || 0,
        solde_credit: item.credit || item.creditAmount || 0,
        ...item
      }))

    case 'entreprise':
      return mockData.map(item => ({
        id: item.id,
        raison_sociale: item.name || item.nom,
        numero_contribuable: item.registrationNumber || item.numeroContribuable,
        forme_juridique: item.structure || item.formeJuridique,
        ...item
      }))

    case 'audit':
      return mockData.map(item => ({
        id: item.id,
        type_audit: item.type || 'COMPLET',
        statut: item.status || 'EN_ATTENTE',
        progression: item.progress || 0,
        resultats: {
          score_global: item.score || 0,
          nb_anomalies: item.anomalies || 0,
          nb_warnings: item.warnings || 0,
          nb_erreurs: item.errors || 0
        },
        ...item
      }))

    default:
      return mockData
  }
}

// Hook helper pour utiliser dans les composants
export const useBackendService = (serviceType: string) => {
  const mapping = SERVICE_MAPPINGS[serviceType]

  const callMethod = async (method: string, params?: any) => {
    return replaceMockData(serviceType, method, params)
  }

  return {
    service: mapping?.service,
    callMethod,
    methods: mapping?.methods
  }
}

// Export des services pour utilisation directe
export { services }
