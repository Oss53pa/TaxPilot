import { logger } from '@/utils/logger'
/**
 * Service pour la gestion des thèmes via l'API
 */

import { apiClient } from './apiClient'

export interface ThemeConfiguration {
  id?: number
  entreprise: number
  nom_theme: string
  type_theme: string
  couleur_primaire: string
  couleur_secondaire: string
  couleur_accent: string
  couleur_fond: string
  couleur_surface: string
  couleur_texte_primaire: string
  couleur_texte_secondaire: string
  couleur_texte_disabled: string
  mode_sombre_active: boolean
  couleur_fond_sombre: string
  couleur_surface_sombre: string
  couleur_texte_sombre: string
  police_principale: string
  police_secondaire: string
  taille_police_base: number
  border_radius: number
  espacement_base: number
  est_theme_actif: boolean
  est_theme_par_defaut: boolean
  created_at?: string
  updated_at?: string
}

export interface PredefinedTheme {
  type_theme: string
  nom_theme: string
  couleur_primaire: string
  couleur_secondaire: string
  couleur_accent: string
  couleur_fond?: string
  couleur_surface?: string
  couleur_texte_primaire?: string
  couleur_texte_secondaire?: string
  police_principale: string
  police_secondaire: string
  description: string
}

export interface FontChoice {
  value: string
  label: string
}

class ThemeService {
  private baseUrl = '/api/v1/parametrage/themes'

  // Récupérer tous les thèmes d'une entreprise
  async getThemes(entrepriseId: number): Promise<ThemeConfiguration[]> {
    try {
      const data = await apiClient.get<{ results?: ThemeConfiguration[] } | ThemeConfiguration[]>(`${this.baseUrl}/?entreprise=${entrepriseId}`)
      return Array.isArray(data) ? data : (data.results || [])
    } catch (error) {
      logger.error('Erreur lors de la récupération des thèmes:', error)
      throw error
    }
  }

  // Récupérer le thème actif d'une entreprise
  async getActiveTheme(entrepriseId: number): Promise<ThemeConfiguration | null> {
    try {
      const data = await apiClient.get<ThemeConfiguration>(`${this.baseUrl}/active_theme/?entreprise=${entrepriseId}`)
      return data
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null
      }
      logger.error('Erreur lors de la récupération du thème actif:', error)
      throw error
    }
  }

  // Créer un nouveau thème
  async createTheme(theme: Omit<ThemeConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<ThemeConfiguration> {
    try {
      const data = await apiClient.post<ThemeConfiguration>(this.baseUrl + '/', theme)
      return data
    } catch (error) {
      logger.error('Erreur lors de la création du thème:', error)
      throw error
    }
  }

  // Mettre à jour un thème existant
  async updateTheme(id: number, theme: Partial<ThemeConfiguration>): Promise<ThemeConfiguration> {
    try {
      const data = await apiClient.patch<ThemeConfiguration>(`${this.baseUrl}/${id}/`, theme)
      return data
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du thème:', error)
      throw error
    }
  }

  // Activer un thème
  async activateTheme(id: number): Promise<ThemeConfiguration> {
    try {
      const data = await apiClient.post<ThemeConfiguration>(`${this.baseUrl}/${id}/activate/`)
      return data
    } catch (error) {
      logger.error('Erreur lors de l\'activation du thème:', error)
      throw error
    }
  }

  // Supprimer un thème
  async deleteTheme(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseUrl}/${id}/`)
    } catch (error) {
      logger.error('Erreur lors de la suppression du thème:', error)
      throw error
    }
  }

  // Récupérer les thèmes prédéfinis
  async getPredefinedThemes(): Promise<PredefinedTheme[]> {
    try {
      const data = await apiClient.get<PredefinedTheme[]>(`${this.baseUrl}/predefined_themes/`)
      return data
    } catch (error) {
      logger.error('Erreur lors de la récupération des thèmes prédéfinis:', error)
      throw error
    }
  }

  // Récupérer les polices disponibles
  async getAvailableFonts(): Promise<FontChoice[]> {
    try {
      const data = await apiClient.get<FontChoice[]>(`${this.baseUrl}/available_fonts/`)
      return data
    } catch (error) {
      logger.error('Erreur lors de la récupération des polices:', error)
      throw error
    }
  }

  // Créer un thème à partir d'un thème prédéfini
  async createFromPredefined(
    entrepriseId: number,
    predefinedTheme: PredefinedTheme,
    customName?: string
  ): Promise<ThemeConfiguration> {
    const theme: Omit<ThemeConfiguration, 'id' | 'created_at' | 'updated_at'> = {
      entreprise: entrepriseId,
      nom_theme: customName || predefinedTheme.nom_theme,
      type_theme: predefinedTheme.type_theme,
      couleur_primaire: predefinedTheme.couleur_primaire,
      couleur_secondaire: predefinedTheme.couleur_secondaire,
      couleur_accent: predefinedTheme.couleur_accent,
      couleur_fond: predefinedTheme.couleur_fond || '#FFFFFF',
      couleur_surface: predefinedTheme.couleur_surface || '#F5F5F5',
      couleur_texte_primaire: predefinedTheme.couleur_texte_primaire || '#212121',
      couleur_texte_secondaire: predefinedTheme.couleur_texte_secondaire || '#737373',
      couleur_texte_disabled: '#BDBDBD',
      mode_sombre_active: false,
      couleur_fond_sombre: '#121212',
      couleur_surface_sombre: '#1E1E1E',
      couleur_texte_sombre: '#FFFFFF',
      police_principale: predefinedTheme.police_principale,
      police_secondaire: predefinedTheme.police_secondaire,
      taille_police_base: 14,
      border_radius: 8,
      espacement_base: 8,
      est_theme_actif: false,
      est_theme_par_defaut: false,
    }

    return this.createTheme(theme)
  }
}

export const themeService = new ThemeService()