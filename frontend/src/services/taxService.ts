import { logger } from '@/utils/logger'
/**
 * Service pour la gestion fiscale et calculs d'impôts
 * CONNEXION RÉELLE AU BACKEND DJANGO
 */

import { apiClient } from './apiClient'

export interface Impot {
  id: string
  code: string
  libelle: string
  type_impot: 'IS' | 'TVA' | 'PATENTE' | 'TAU' | 'CONTRIBUTION' | 'AUTRE'
  pays: string
  taux_normal: number
  taux_reduit?: number
  seuil_application?: number
  base_calcul: 'CA' | 'BENEFICE' | 'VALEUR_AJOUTEE' | 'MASSE_SALARIALE'
  periodicite: 'MENSUELLE' | 'TRIMESTRIELLE' | 'ANNUELLE'
  date_limite_declaration?: string
  date_limite_paiement?: string
  is_actif: boolean
  formule_calcul?: string
  abattements: AbattementFiscal[]
  created_at: string
  updated_at: string
}

export interface AbattementFiscal {
  id: string
  nom: string
  type_abattement: 'FIXE' | 'POURCENTAGE' | 'PROGRESSIF'
  valeur: number
  conditions: string
  seuil_min?: number
  seuil_max?: number
  is_obligatoire: boolean
}

export interface DeclarationFiscale {
  id: string
  entreprise: string
  entreprise_detail?: {
    raison_sociale: string
    numero_contribuable: string
  }
  exercice: string
  type_declaration: 'IS' | 'TVA' | 'PATENTE' | 'BILAN_FISCAL'
  periode_debut: string
  periode_fin: string
  statut: 'BROUILLON' | 'VALIDEE' | 'DEPOSEE' | 'ACCEPTEE' | 'REJETEE'
  numero_declaration?: string
  date_depot?: string
  montant_impot: number
  montant_acomptes: number
  montant_a_payer: number
  montant_credit?: number
  penalites?: number
  donnees_fiscales: any
  fichier_declaration?: string
  fichier_annexes?: string[]
  erreurs_validation?: Array<{
    champ: string
    message: string
    code: string
  }>
  created_at: string
  updated_at: string
}

export interface CalculFiscal {
  entreprise_id: string
  exercice_id: string
  type_calcul: 'IS' | 'TVA' | 'PATENTE' | 'SIMULATION'
  donnees_base: {
    chiffre_affaires: number
    benefice_comptable?: number
    charges_deductibles?: number
    charges_non_deductibles?: number
    provisions?: number
  }
  abattements_appliques: string[]
  resultat: {
    base_imposable: number
    taux_applique: number
    montant_impot: number
    acomptes_verses: number
    solde_a_payer: number
    credit_impot?: number
  }
  details_calcul: Array<{
    etape: string
    description: string
    montant: number
    taux?: number
  }>
}

export interface RegimeFiscal {
  id: string
  code: string
  libelle: string
  description: string
  pays: string
  conditions_eligibilite: string[]
  seuil_ca_min?: number
  seuil_ca_max?: number
  avantages: string[]
  obligations: string[]
  taux_is?: number
  franchise_tva?: boolean
  is_default: boolean
}

export interface ObligationFiscale {
  id: string
  libelle: string
  type_obligation: 'DECLARATION' | 'PAIEMENT' | 'TENUE_LIVRE' | 'AUTRE'
  periodicite: 'MENSUELLE' | 'TRIMESTRIELLE' | 'ANNUELLE' | 'PONCTUELLE'
  date_echeance: string
  entreprise: string
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'EN_RETARD'
  montant_estimé?: number
  description?: string
  penalites_retard?: number
  created_at: string
}

export interface SimulationFiscale {
  id: string
  nom: string
  entreprise: string
  scenarios: Array<{
    nom: string
    hypotheses: any
    resultats: any
  }>
  created_by: string
  created_at: string
}

class TaxService {
  private baseUrl = '/api/v1/tax/'

  // Impôts et taxes - CONNEXION RÉELLE AU BACKEND
  async getImpots(params?: {
    pays?: string
    type_impot?: string
    is_actif?: boolean
    page?: number
  }) {
    logger.debug('Fetching impôts from backend...', params)
    return apiClient.get(`${this.baseUrl}/impots/`, params)
  }

  async getImpot(id: string): Promise<Impot> {
    logger.debug(`Fetching impôt ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/impots/${id}/`)
  }

  async createImpot(impot: Partial<Impot>): Promise<Impot> {
    logger.debug('Creating impôt in backend...', impot)
    return apiClient.post(`${this.baseUrl}/impots/`, impot)
  }

  async updateImpot(id: string, impot: Partial<Impot>): Promise<Impot> {
    logger.debug(`Updating impôt ${id} in backend...`)
    return apiClient.patch(`${this.baseUrl}/impots/${id}/`, impot)
  }

  async deleteImpot(id: string): Promise<void> {
    logger.debug(`Deleting impôt ${id} from backend...`)
    return apiClient.delete(`${this.baseUrl}/impots/${id}/`)
  }

  // Calculs fiscaux - CONNEXION RÉELLE AU BACKEND
  async calculateIS(data: {
    entreprise_id: string
    exercice_id: string
    benefice_comptable: number
    reintegrations?: number
    deductions?: number
    abattements?: string[]
  }): Promise<CalculFiscal> {
    logger.debug('Calculating IS on backend...', data)
    return apiClient.post(`${this.baseUrl}/calcul/is/`, data)
  }

  async calculateTVA(data: {
    entreprise_id: string
    periode_debut: string
    periode_fin: string
    tva_collectee: number
    tva_deductible: number
  }): Promise<CalculFiscal> {
    logger.debug('Calculating TVA on backend...', data)
    return apiClient.post(`${this.baseUrl}/calcul/tva/`, data)
  }

  async calculatePatente(data: {
    entreprise_id: string
    exercice_id: string
    chiffre_affaires: number
    valeur_locative?: number
  }): Promise<CalculFiscal> {
    logger.debug('Calculating Patente on backend...', data)
    return apiClient.post(`${this.baseUrl}/calcul/patente/`, data)
  }

  async simulateFiscalImpact(data: {
    entreprise_id: string
    scenarios: Array<{
      nom: string
      ca_projete: number
      charges_prevues: number
      investissements?: number
    }>
  }) {
    logger.debug('Running fiscal simulation on backend...', data)
    return apiClient.post(`${this.baseUrl}/simulation/`, data)
  }

  // Déclarations fiscales - CONNEXION RÉELLE AU BACKEND
  async getDeclarations(params?: {
    entreprise?: string
    exercice?: string
    type_declaration?: string
    statut?: string
    periode_debut?: string
    periode_fin?: string
    page?: number
    page_size?: number
  }) {
    logger.debug('Fetching déclarations from backend...', params)
    return apiClient.get(`${this.baseUrl}/declarations/`, params)
  }

  async getDeclaration(id: string): Promise<DeclarationFiscale> {
    logger.debug(`Fetching déclaration ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/declarations/${id}/`)
  }

  async createDeclaration(declaration: Partial<DeclarationFiscale>): Promise<DeclarationFiscale> {
    logger.debug('Creating déclaration in backend...', declaration)
    return apiClient.post(`${this.baseUrl}/declarations/`, declaration)
  }

  async updateDeclaration(id: string, declaration: Partial<DeclarationFiscale>): Promise<DeclarationFiscale> {
    logger.debug(`Updating déclaration ${id} in backend...`)
    return apiClient.patch(`${this.baseUrl}/declarations/${id}/`, declaration)
  }

  async validateDeclaration(id: string): Promise<DeclarationFiscale> {
    logger.debug(`Validating déclaration ${id} on backend...`)
    return apiClient.post(`${this.baseUrl}/declarations/${id}/validate/`)
  }

  async submitDeclaration(id: string): Promise<DeclarationFiscale> {
    logger.debug(`Submitting déclaration ${id} to authorities...`)
    return apiClient.post(`${this.baseUrl}/declarations/${id}/submit/`)
  }

  async generateDeclarationPDF(id: string): Promise<Blob> {
    logger.debug(`Generating PDF for déclaration ${id}...`)
    const response = await apiClient.client.get(`${this.baseUrl}/declarations/${id}/pdf/`, {
      responseType: 'blob'
    })
    return response.data
  }

  // Régimes fiscaux - CONNEXION RÉELLE AU BACKEND
  async getRegimesFiscaux(params?: {
    pays?: string
    ca_entreprise?: number
    secteur?: string
  }) {
    logger.debug('Fetching régimes fiscaux from backend...', params)
    return apiClient.get(`${this.baseUrl}/regimes/`, params)
  }

  async getRegimeFiscal(id: string): Promise<RegimeFiscal> {
    logger.debug(`Fetching régime fiscal ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/regimes/${id}/`)
  }

  async getOptimalRegime(data: {
    entreprise_id: string
    ca_previsionnel: number
    secteur_activite: string
    pays: string
  }) {
    logger.debug('Getting optimal régime fiscal from backend...', data)
    return apiClient.post(`${this.baseUrl}/regimes/optimal/`, data)
  }

  async compareRegimes(regime_ids: string[], data: {
    ca_previsionnel: number
    charges_prevues: number
  }) {
    logger.debug('Comparing régimes fiscaux on backend...', data)
    return apiClient.post(`${this.baseUrl}/regimes/compare/`, {
      regime_ids,
      ...data
    })
  }

  // Obligations fiscales - CONNEXION RÉELLE AU BACKEND
  async getObligations(params?: {
    entreprise?: string
    type_obligation?: string
    statut?: string
    date_debut?: string
    date_fin?: string
    page?: number
    page_size?: number
  }) {
    logger.debug('Fetching obligations fiscales from backend...', params)
    return apiClient.get(`${this.baseUrl}/obligations/`, params)
  }

  async getObligation(id: string): Promise<ObligationFiscale> {
    logger.debug(`Fetching obligation ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/obligations/${id}/`)
  }

  async createObligation(obligation: Partial<ObligationFiscale>): Promise<ObligationFiscale> {
    logger.debug('Creating obligation in backend...', obligation)
    return apiClient.post(`${this.baseUrl}/obligations/`, obligation)
  }

  async markObligationDone(id: string): Promise<ObligationFiscale> {
    logger.debug(`Marking obligation ${id} as done...`)
    return apiClient.post(`${this.baseUrl}/obligations/${id}/mark-done/`)
  }

  async getObligationsCalendar(params: {
    entreprise: string
    annee: number
    mois?: number
  }) {
    logger.debug('Getting obligations calendar from backend...', params)
    return apiClient.get(`${this.baseUrl}/obligations/calendar/`, params)
  }

  async getObligationsEcheances(entreprise_id: string, jours_avance: number = 30) {
    logger.debug(`⏰ Getting upcoming obligations for entreprise ${entreprise_id}...`)
    return apiClient.get(`${this.baseUrl}/obligations/echeances/`, {
      entreprise: entreprise_id,
      jours_avance
    })
  }

  // Abattements et déductions - CONNEXION RÉELLE AU BACKEND
  async getAbattements(params?: {
    type_impot?: string
    pays?: string
    is_obligatoire?: boolean
  }) {
    logger.debug('Fetching abattements from backend...', params)
    return apiClient.get(`${this.baseUrl}/abattements/`, params)
  }

  async getAbattement(id: string): Promise<AbattementFiscal> {
    logger.debug(`Fetching abattement ${id} from backend...`)
    return apiClient.get(`${this.baseUrl}/abattements/${id}/`)
  }

  async calculateAbattement(abattement_id: string, base_calcul: number) {
    logger.debug(`Calculating abattement ${abattement_id} for base ${base_calcul}...`)
    return apiClient.post(`${this.baseUrl}/abattements/${abattement_id}/calculate/`, {
      base_calcul
    })
  }

  async getAbattementsEligibles(data: {
    entreprise_id: string
    type_impot: string
    montant_base: number
  }) {
    logger.debug('Getting eligible abattements from backend...', data)
    return apiClient.post(`${this.baseUrl}/abattements/eligibles/`, data)
  }

  // Analyses et optimisation - CONNEXION RÉELLE AU BACKEND
  async analyzeFiscalPosition(entreprise_id: string, exercice_id: string) {
    logger.debug(`Analyzing fiscal position for entreprise ${entreprise_id}...`)
    return apiClient.post(`${this.baseUrl}/analyse/position/`, {
      entreprise_id,
      exercice_id
    })
  }

  async getOptimizationSuggestions(entreprise_id: string, exercice_id: string) {
    logger.debug(`Getting optimization suggestions for entreprise ${entreprise_id}...`)
    return apiClient.get(`${this.baseUrl}/optimization/suggestions/`, {
      entreprise: entreprise_id,
      exercice: exercice_id
    })
  }

  async compareFiscalYears(entreprise_id: string, exercice1_id: string, exercice2_id: string) {
    logger.debug(`Comparing fiscal years for entreprise ${entreprise_id}...`)
    return apiClient.get(`${this.baseUrl}/analyse/compare-years/`, {
      entreprise: entreprise_id,
      exercice1: exercice1_id,
      exercice2: exercice2_id
    })
  }

  // Import/Export et intégrations - CONNEXION RÉELLE AU BACKEND
  async importDeclarationData(file: File, type_declaration: string) {
    logger.debug(`Importing ${type_declaration} declaration data...`)
    return apiClient.upload(`${this.baseUrl}/import/declaration/`, file, { type_declaration })
  }

  async exportDeclarationData(declaration_id: string, format: 'EXCEL' | 'CSV' | 'XML'): Promise<Blob> {
    logger.debug(`Exporting declaration ${declaration_id} as ${format}...`)
    const response = await apiClient.client.get(`${this.baseUrl}/export/declaration/${declaration_id}/`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data
  }

  async connectTaxAuthority(data: {
    pays: string
    identifiants: any
    type_connexion: 'API' | 'CERTIFICAT' | 'MANUEL'
  }) {
    logger.debug(`Connecting to tax authority for ${data.pays}...`)
    return apiClient.post(`${this.baseUrl}/authorities/connect/`, data)
  }

  async syncWithTaxAuthority(pays: string) {
    logger.debug(`Syncing with tax authority for ${pays}...`)
    return apiClient.post(`${this.baseUrl}/authorities/sync/`, { pays })
  }

  // Statistiques fiscales - CONNEXION RÉELLE AU BACKEND
  async getFiscalStats(params: {
    entreprise: string
    periode_debut: string
    periode_fin: string
  }) {
    logger.debug('Getting fiscal stats from backend...', params)
    return apiClient.get(`${this.baseUrl}/stats/`, params)
  }

  async getFiscalTrends(params: {
    entreprise?: string
    type_impot?: string
    periode_debut: string
    periode_fin: string
  }) {
    logger.debug('Getting fiscal trends from backend...', params)
    return apiClient.get(`${this.baseUrl}/trends/`, params)
  }

  async getBenchmarkData(data: {
    secteur_activite: string
    pays: string
    taille_entreprise: 'TPE' | 'PME' | 'ETI' | 'GE'
  }) {
    logger.debug('Getting benchmark fiscal data from backend...', data)
    return apiClient.get(`${this.baseUrl}/benchmark/`, data)
  }
}

export const taxService = new TaxService()
export default taxService