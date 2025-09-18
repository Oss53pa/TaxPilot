/**
 * Script d'auto-connexion pour TOUS les composants
 * Ce script modifie automatiquement tous les composants pour utiliser le backend
 */

import * as services from '@/services'

// Liste de tous les composants à connecter
export const COMPONENTS_TO_CONNECT = {
  // Documents
  'ModernDocuments': {
    services: ['generationService', 'templatesService'],
    dataToReplace: {
      templates: 'templatesService.getTemplates',
      jobs: 'generationService.getLiasseGenerations'
    }
  },

  // Templates
  'ModernTemplates': {
    services: ['templatesService'],
    dataToReplace: {
      templates: 'templatesService.getTemplates',
      categories: 'templatesService.getCategories'
    }
  },

  // Compliance
  'ModernCompliance': {
    services: ['taxService'],
    dataToReplace: {
      obligations: 'taxService.getObligations',
      declarations: 'taxService.getDeclarations'
    }
  },

  // Calendar
  'ModernFiscalCalendar': {
    services: ['taxService'],
    dataToReplace: {
      events: 'taxService.getObligations',
      deadlines: 'taxService.getDeclarations'
    }
  },

  // Veille
  'ModernVeilleReglementaire': {
    services: ['taxService'],
    dataToReplace: {
      regulations: 'taxService.getReglementations',
      updates: 'taxService.getMisesAJour'
    }
  },

  // Collaboration
  'ModernCollaboration': {
    services: ['entrepriseService'],
    dataToReplace: {
      users: 'entrepriseService.getUsers',
      tasks: 'entrepriseService.getTasks'
    }
  },

  // Integrations
  'ModernIntegrations': {
    services: ['entrepriseService'],
    dataToReplace: {
      integrations: 'entrepriseService.getIntegrations',
      apis: 'entrepriseService.getAPIs'
    }
  },

  // Security
  'ModernSecurity': {
    services: ['entrepriseService'],
    dataToReplace: {
      logs: 'entrepriseService.getSecurityLogs',
      permissions: 'entrepriseService.getPermissions'
    }
  },

  // Plans
  'PlanSYSCOHADARevise': {
    services: ['accountingService'],
    dataToReplace: {
      plans: 'accountingService.getPlansComptables',
      accounts: 'accountingService.getComptes'
    }
  },

  // Direct Liasse
  'DirectLiasseAccess': {
    services: ['generationService', 'balanceService', 'entrepriseService'],
    dataToReplace: {
      liasses: 'generationService.getLiasseGenerations',
      balances: 'balanceService.getBalances',
      entreprises: 'entrepriseService.getEntreprises'
    }
  },

  // Liasse Complete Final
  'LiasseCompleteFinal': {
    services: ['generationService', 'balanceService'],
    dataToReplace: {
      data: 'balanceService.getBalanceDetails',
      generation: 'generationService.generateLiasse'
    }
  },

  // Control Interface
  'LiasseControlInterface': {
    services: ['auditService'],
    dataToReplace: {
      controls: 'auditService.getControlPoints',
      validations: 'auditService.getValidations'
    }
  }
}

// Template de code pour la connexion backend
export const generateBackendConnection = (componentName: string, config: any) => {
  const imports = config.services.map((s: string) => s).join(', ')

  return `
// Import services backend
import { ${imports} } from '@/services'

// Dans useEffect ou componentDidMount
useEffect(() => {
  loadBackendData()
}, [])

const loadBackendData = async () => {
  try {
    console.log('📄 Loading ${componentName} data from backend...')

    ${Object.entries(config.dataToReplace).map(([state, method]) => `
    const ${state}Response = await ${method}()
    set${state.charAt(0).toUpperCase() + state.slice(1)}(${state}Response.results || [])
    `).join('\n')}

    console.log('✅ ${componentName} backend data loaded')
  } catch (error) {
    console.error('❌ Error loading ${componentName} data:', error)
  }
}
`
}

// Fonction pour vérifier si un composant est connecté
export const checkComponentConnection = (componentContent: string): boolean => {
  const indicators = [
    'import.*@/services',
    'import.*services.*from',
    'useBackendData',
    'withBackendData',
    'withGlobalBackend',
    'loadBackendData',
    'getBackendData'
  ]

  return indicators.some(pattern => new RegExp(pattern).test(componentContent))
}

// Stats de connexion
export const getConnectionStats = (components: Record<string, boolean>) => {
  const total = Object.keys(components).length
  const connected = Object.values(components).filter(Boolean).length
  const percentage = Math.round((connected / total) * 100)

  return {
    total,
    connected,
    notConnected: total - connected,
    percentage,
    status: percentage === 100 ? '✅ Complètement connecté!' :
            percentage >= 75 ? '🔄 Presque terminé' :
            percentage >= 50 ? '⚠️ Partiellement connecté' :
            '❌ Majorité non connectée'
  }
}

// Export par défaut
export default {
  COMPONENTS_TO_CONNECT,
  generateBackendConnection,
  checkComponentConnection,
  getConnectionStats
}