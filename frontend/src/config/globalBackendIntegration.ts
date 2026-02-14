/**
 * INTÉGRATION BACKEND GLOBALE
 * Ce fichier route les données vers Supabase (BaaS) ou localStorage (mode offline).
 * Quand BACKEND_ENABLED = true, toutes les requêtes passent par Supabase.
 * Quand BACKEND_ENABLED = false, l'app fonctionne en mode localStorage (données demo).
 */

import * as React from 'react'
import * as services from '@/services'

// Flag global : true = Supabase, false = localStorage demo
// Set to true once VITE_SUPABASE_URL is configured in .env
export const BACKEND_ENABLED = false

// Cache global pour éviter les appels répétés
const dataCache = new Map<string, any>()
const cacheTimeout = 5 * 60 * 1000 // 5 minutes

// Fonction principale qui intercepte et remplace les données mockées
export const getBackendData = async (dataType: string, params?: any): Promise<any> => {
  if (!BACKEND_ENABLED) {
    return null // Retourner null pour utiliser les données mockées
  }

  const cacheKey = `${dataType}_${JSON.stringify(params || {})}`
  const cached = dataCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < cacheTimeout) {
    console.log(`📦 Using cached data for ${dataType}`)
    return cached.data
  }

  try {
    console.log(`🔄 Fetching ${dataType} from backend...`)
    let data: any = null

    switch (dataType) {
      // ENTREPRISES
      case 'entreprises':
        try {
          const entreprisesRes = await services.entrepriseService.getEntreprises(params)
          data = entreprisesRes.results || entreprisesRes || []
        } catch (_e) {
          console.log('Error fetching entreprises, using empty array')
          data = []
        }
        break

      // BALANCES
      case 'balances':
      case 'balance': {
        const balancesRes = await services.balanceService.getBalances(params) as any
        data = balancesRes.results || []
        break
      }

      case 'balanceDetails':
        if (params?.id) {
          data = await services.balanceService.getLignesBalance(params.id, { page_size: 1000 })
        }
        break

      // AUDITS
      case 'audits':
      case 'auditSessions': {
        const auditsRes = await services.auditService.getAuditSessions(params) as any
        data = auditsRes.results || []
        break
      }

      case 'auditAnomalies': {
        if (params?.sessionId) {
          const anomaliesRes = await services.auditService.getAuditAnomalies(params.sessionId) as any
          data = anomaliesRes.results || []
        }
        break
      }

      case 'auditStats':
        data = await services.auditService.getAuditStats(params)
        break

      // GÉNÉRATIONS
      case 'generations':
      case 'liasseGenerations': {
        const generationsRes = await services.generationService.getLiasseGenerations(params) as any
        data = generationsRes.results || []
        break
      }

      case 'generationTemplates': {
        const templatesRes = await services.generationService.getAvailableTemplates(params?.type_liasse) as any
        data = templatesRes || []
        break
      }

      // TEMPLATES
      case 'templates': {
        const templateRes = await services.templatesService.getTemplates(params) as any
        data = templateRes.results || []
        break
      }

      // FISCAL
      case 'declarations':
      case 'declarationsFiscales': {
        const declarationsRes = await services.taxService.getDeclarations(params) as any
        data = declarationsRes.results || []
        break
      }

      case 'obligations':
      case 'obligationsFiscales': {
        const obligationsRes = await services.taxService.getObligations(params) as any
        data = obligationsRes.results || []
        break
      }

      case 'impots': {
        const impotsRes = await services.taxService.getImpots(params) as any
        data = impotsRes.results || []
        break
      }

      // COMPTABILITÉ
      case 'plansComptables':
        try {
          const plansRes = await services.accountingService.getPlansComptables(params) as any
          data = plansRes.results || plansRes || []
        } catch (_e) {
          console.log('Error fetching plansComptables, using empty array')
          data = []
        }
        break

      case 'comptes':
      case 'comptesComptables': {
        const comptesRes = await services.accountingService.getComptes(params) as any
        data = comptesRes.results || []
        break
      }

      case 'ecritures': {
        const ecrituresRes = await services.accountingService.getEcritures(params) as any
        data = ecrituresRes.results || []
        break
      }

      case 'journaux': {
        const journauxRes = await services.accountingService.getJournaux(params) as any
        data = journauxRes.results || []
        break
      }

      // REPORTING
      case 'reports':
      case 'rapports': {
        const reportsRes = await services.reportingService.getReports(params) as any
        data = reportsRes.results || []
        break
      }

      case 'dashboardStats':
        try {
          data = await services.reportingService.getDashboardStats(params)
        } catch (_e) {
          console.log('Error fetching dashboardStats, using default')
          data = {
            entreprises_total: 0,
            liasses_ce_mois: 0,
            audits_en_cours: 0,
            revenue_mensuel: 0,
            croissance_mensuelle: 0,
            top_erreurs: [],
            performance: {
              temps_moyen_generation: 0,
              taux_reussite: 100,
              satisfaction_client: 0
            }
          }
        }
        break

      case 'analytics':
        data = await services.reportingService.getAnalytics(params)
        break

      // PARAMÉTRAGE
      case 'typesLiasse':
        try {
          data = await services.entrepriseService.getTypesLiasse(params) || []
        } catch (_e) {
          console.log('Error fetching typesLiasse, using empty array')
          data = []
        }
        break

      case 'entrepriseStats':
        if (params?.id) {
          data = await services.entrepriseService.getStats(params.id)
        }
        break

      default:
        console.warn(`Unknown data type: ${dataType}`)
        return null
    }

    // Mettre en cache
    dataCache.set(cacheKey, { data, timestamp: Date.now() })
    console.log(`✅ Fetched ${dataType} successfully`)
    return data

  } catch (error) {
    console.error(`❌ Error fetching ${dataType}:`, error)
    return null // Retourner null pour utiliser les données mockées comme fallback
  }
}

// Fonction pour convertir les données mockées existantes
export const enhanceMockDataWithBackend = async (
  mockData: any[],
  dataType: string,
  params?: any
): Promise<any[]> => {
  const backendData = await getBackendData(dataType, params)

  if (!backendData || backendData.length === 0) {
    return mockData // Garder les données mockées si pas de données backend
  }

  // Merger les données mockées avec les données backend
  return backendData.map((item: any, index: number) => ({
    ...mockData[index] || {},
    ...item
  }))
}

// Hook React pour utiliser facilement dans les composants
export const useBackendDataGlobal = (dataType: string, params?: any, defaultData?: any) => {
  const [data, setData] = React.useState(defaultData)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error | null>(null)

  // Stabiliser les params pour éviter les boucles infinies
  const paramsKey = React.useMemo(() => {
    return params ? JSON.stringify(params) : ''
  }, [JSON.stringify(params)])

  React.useEffect(() => {
    if (!BACKEND_ENABLED) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      setLoading(true)
      try {
        const result = await getBackendData(dataType, params)
        setData(result || defaultData)
      } catch (err) {
        setError(err as Error)
        setData(defaultData)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [dataType, paramsKey])

  return { data, loading, error }
}

// Fonction pour initialiser automatiquement toutes les connexions au démarrage
export const initializeBackendConnections = async () => {
  console.log('🚀 Initializing global backend connections...')

  try {
    // Précharger les données essentielles
    await Promise.all([
      getBackendData('entreprises', { page_size: 100 }),
      getBackendData('dashboardStats'),
      getBackendData('plansComptables'),
      getBackendData('typesLiasse')
    ])

    console.log('✅ Backend connections initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing backend connections:', error)
  }
}

// Auto-initialisation au chargement
if (typeof window !== 'undefined' && BACKEND_ENABLED) {
  initializeBackendConnections()
}

// Export des services pour accès direct
export { services }