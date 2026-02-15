import { logger } from '@/utils/logger'
/**
 * Service pour la gestion des paramètres régionaux via l'API
 */

import { apiClient } from './apiClient'

export interface RegionalSettings {
  id?: number
  entreprise: number
  pays: number
  pays_detail?: {
    id: number
    nom: string
    code: string
  }
  langue_principale: string
  langues_secondaires: string[]
  timezone: string
  devise_principale: number
  devise_principale_detail?: {
    id: number
    nom: string
    code: string
    symbole: string
  }
  devises_secondaires: number[]
  devises_secondaires_detail?: Array<{
    id: number
    nom: string
    code: string
    symbole: string
  }>
  format_date: string
  format_nombre: string
  separateur_milliers: string
  separateur_decimal: string
  symbole_devise_avant: boolean
  debut_exercice_fiscal: string
  fin_exercice_fiscal: string
  jours_ouvres: number[]
  jours_feries_nationaux: string[]
  afficher_codes_pays: boolean
  utiliser_noms_locaux: boolean
  created_at?: string
  updated_at?: string
}

export interface DefaultSettings {
  langue_principale: string
  timezone: string
  format_date: string
  format_nombre: string
  separateur_milliers: string
  separateur_decimal: string
  debut_exercice_fiscal: string
  fin_exercice_fiscal: string
  jours_ouvres: number[]
}

export interface TimezoneOption {
  code: string
  label: string
  offset: string
}

class RegionalService {
  private baseUrl = '/api/v1/parametrage/regional-settings'

  // Récupérer les paramètres régionaux d'une entreprise
  async getRegionalSettings(entrepriseId: number): Promise<RegionalSettings | null> {
    try {
      const data = await apiClient.get<{ results?: RegionalSettings[] } | RegionalSettings[]>(`${this.baseUrl}/?entreprise=${entrepriseId}`)
      const results = Array.isArray(data) ? data : (data.results || [])
      return results.length > 0 ? results[0] : null
    } catch (error) {
      logger.error('Erreur lors de la récupération des paramètres régionaux:', error)
      throw error
    }
  }

  // Créer les paramètres régionaux
  async createRegionalSettings(settings: Omit<RegionalSettings, 'id' | 'created_at' | 'updated_at'>): Promise<RegionalSettings> {
    try {
      const data = await apiClient.post<RegionalSettings>(this.baseUrl + '/', settings)
      return data
    } catch (error) {
      logger.error('Erreur lors de la création des paramètres régionaux:', error)
      throw error
    }
  }

  // Mettre à jour les paramètres régionaux
  async updateRegionalSettings(id: number, settings: Partial<RegionalSettings>): Promise<RegionalSettings> {
    try {
      const data = await apiClient.patch<RegionalSettings>(`${this.baseUrl}/${id}/`, settings)
      return data
    } catch (error) {
      logger.error('Erreur lors de la mise à jour des paramètres régionaux:', error)
      throw error
    }
  }

  // Récupérer les paramètres par défaut selon le pays
  async getDefaultSettings(paysCode: string = 'CI'): Promise<DefaultSettings> {
    try {
      const data = await apiClient.get<DefaultSettings>(`${this.baseUrl}/default_settings/?pays=${paysCode}`)
      return data
    } catch (error) {
      logger.error('Erreur lors de la récupération des paramètres par défaut:', error)
      throw error
    }
  }

  // Récupérer la liste des fuseaux horaires
  async getTimezones(): Promise<TimezoneOption[]> {
    try {
      const data = await apiClient.get<TimezoneOption[]>(`${this.baseUrl}/timezones/`)
      return data
    } catch (error) {
      logger.error('Erreur lors de la récupération des fuseaux horaires:', error)
      throw error
    }
  }

  // Créer ou mettre à jour les paramètres régionaux
  async saveRegionalSettings(
    entrepriseId: number,
    settings: Omit<RegionalSettings, 'id' | 'created_at' | 'updated_at'>
  ): Promise<RegionalSettings> {
    const existingSettings = await this.getRegionalSettings(entrepriseId)

    if (existingSettings) {
      return this.updateRegionalSettings(existingSettings.id!, settings)
    } else {
      return this.createRegionalSettings({ ...settings, entreprise: entrepriseId })
    }
  }

  // Valider les jours ouvrés (0=lundi, 6=dimanche)
  validateJoursOuvres(jours: number[]): boolean {
    return jours.every(jour => Number.isInteger(jour) && jour >= 0 && jour <= 6)
  }

  // Valider le format de date fiscal (MM-JJ)
  validateDateFiscale(date: string): boolean {
    const regex = /^\d{2}-\d{2}$/
    if (!regex.test(date)) return false

    const [month, day] = date.split('-').map(Number)
    return month >= 1 && month <= 12 && day >= 1 && day <= 31
  }

  // Obtenir les langues disponibles
  getLanguesDisponibles() {
    return [
      { code: 'fr', label: 'Français' },
      { code: 'en', label: 'English' },
      { code: 'pt', label: 'Português' },
      { code: 'ar', label: 'العربية' },
      { code: 'sw', label: 'Kiswahili' },
    ]
  }

  // Obtenir les formats de date disponibles
  getFormatsDate() {
    return [
      { code: 'DD/MM/YYYY', label: 'JJ/MM/AAAA' },
      { code: 'MM/DD/YYYY', label: 'MM/JJ/AAAA' },
      { code: 'YYYY-MM-DD', label: 'AAAA-MM-JJ' },
      { code: 'DD-MM-YYYY', label: 'JJ-MM-AAAA' },
    ]
  }

  // Obtenir les formats de nombre disponibles
  getFormatsNombre() {
    return [
      { code: 'FR', label: 'Français (1 234,56)' },
      { code: 'EN', label: 'Anglais (1,234.56)' },
      { code: 'SPACE', label: 'Espaces (1 234.56)' },
    ]
  }

  // Obtenir les jours de la semaine
  getJoursSemaine() {
    return [
      { value: 0, label: 'Lundi' },
      { value: 1, label: 'Mardi' },
      { value: 2, label: 'Mercredi' },
      { value: 3, label: 'Jeudi' },
      { value: 4, label: 'Vendredi' },
      { value: 5, label: 'Samedi' },
      { value: 6, label: 'Dimanche' },
    ]
  }
}

export const regionalService = new RegionalService()