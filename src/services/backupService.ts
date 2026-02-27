/**
 * Service pour la gestion des sauvegardes via l'API
 */

import { apiClient } from './apiClient'

export interface BackupConfiguration {
  id?: number
  entreprise: number
  nom_configuration: string
  type_sauvegarde: 'COMPLETE' | 'INCREMENTAL' | 'DIFFERENTIAL'
  frequence: 'MANUAL' | 'DAILY' | 'WEEKLY' | 'MONTHLY'
  type_stockage: 'LOCAL' | 'AWS_S3' | 'GOOGLE_CLOUD' | 'AZURE' | 'DROPBOX'
  chemin_stockage: string
  stockage_cloud_config: Record<string, any>
  chiffrement_active: boolean
  type_chiffrement: string
  mot_de_passe_requis: boolean
  heure_execution: string
  jour_semaine?: number
  jour_mois?: number
  retention_jours: number
  max_sauvegardes: number
  modules_inclus: string[]
  inclure_fichiers: boolean
  inclure_logs: boolean
  est_active: boolean
  derniere_execution?: string
  prochaine_execution?: string
  created_at?: string
  updated_at?: string
}

export interface BackupHistory {
  id?: number
  configuration: number
  configuration_nom: string
  date_debut: string
  date_fin?: string
  statut: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  taille_donnees: number
  taille_compresse: number
  taille_formatee: string
  taille_compresse_formatee: string
  fichier_backup: string
  checksum: string
  version_application: string
  nombre_fichiers: number
  nombre_tables: number
  message_statut: string
  logs_execution: string
  erreurs: string[]
  validation_effectuee: boolean
  validation_reussie: boolean
  date_validation?: string
  duree_execution?: string
  created_at?: string
  updated_at?: string
}

export interface RestoreOperation {
  id?: number
  entreprise: number
  backup_source: number
  backup_source_nom: string
  backup_source_date: string
  utilisateur?: number
  utilisateur_nom: string
  type_restauration: 'COMPLETE' | 'SELECTIVE' | 'POINT_IN_TIME'
  modules_a_restaurer: string[]
  restaurer_fichiers: boolean
  ecraser_donnees: boolean
  date_demande: string
  date_debut?: string
  date_fin?: string
  statut: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
  elements_restaures: number
  elements_echec: number
  message_statut: string
  logs_restauration: string
  validation_pre_restauration: boolean
  validation_post_restauration: boolean
  created_at?: string
  updated_at?: string
}

export interface BackupStats {
  total_configurations: number
  configurations_actives: number
  derniere_sauvegarde?: {
    date: string
    statut: string
    taille: string
  }
  taille_totale_sauvegardes: number
  nombre_sauvegardes_reussies: number
  nombre_sauvegardes_echec: number
}

export interface StorageType {
  code: string
  label: string
  description: string
}

class BackupService {
  private configUrl = '/api/v1/parametrage/backup-configs'
  private historyUrl = '/api/v1/parametrage/backup-history'
  private restoreUrl = '/api/v1/parametrage/restore-operations'

  // === CONFIGURATIONS DE SAUVEGARDE ===

  // Récupérer toutes les configurations d'une entreprise
  async getBackupConfigs(entrepriseId: number): Promise<BackupConfiguration[]> {
    try {
      const data = await apiClient.get<{ results?: BackupConfiguration[] } | BackupConfiguration[]>(`${this.configUrl}/?entreprise=${entrepriseId}`)
      return Array.isArray(data) ? data : (data.results || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des configurations:', error)
      throw error
    }
  }

  // Créer une nouvelle configuration
  async createBackupConfig(config: Omit<BackupConfiguration, 'id' | 'created_at' | 'updated_at'>): Promise<BackupConfiguration> {
    try {
      const data = await apiClient.post<BackupConfiguration>(this.configUrl + '/', config)
      return data
    } catch (error) {
      console.error('Erreur lors de la création de la configuration:', error)
      throw error
    }
  }

  // Mettre à jour une configuration
  async updateBackupConfig(id: number, config: Partial<BackupConfiguration>): Promise<BackupConfiguration> {
    try {
      const data = await apiClient.patch<BackupConfiguration>(`${this.configUrl}/${id}/`, config)
      return data
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error)
      throw error
    }
  }

  // Supprimer une configuration
  async deleteBackupConfig(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.configUrl}/${id}/`)
    } catch (error) {
      console.error('Erreur lors de la suppression de la configuration:', error)
      throw error
    }
  }

  // Exécuter une sauvegarde manuellement
  async executeBackup(configId: number): Promise<{ message: string; backup_id: number; statut: string }> {
    try {
      const data = await apiClient.post<{ message: string; backup_id: number; statut: string }>(`${this.configUrl}/${configId}/execute_backup/`)
      return data
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la sauvegarde:', error)
      throw error
    }
  }

  // Récupérer les types de stockage disponibles
  async getStorageTypes(): Promise<StorageType[]> {
    try {
      const data = await apiClient.get<StorageType[]>(`${this.configUrl}/storage_types/`)
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération des types de stockage:', error)
      throw error
    }
  }

  // Récupérer les statistiques de sauvegarde
  async getBackupStats(entrepriseId: number): Promise<BackupStats> {
    try {
      const data = await apiClient.get<BackupStats>(`${this.configUrl}/backup_stats/?entreprise=${entrepriseId}`)
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      throw error
    }
  }

  // === HISTORIQUE DES SAUVEGARDES ===

  // Récupérer l'historique des sauvegardes
  async getBackupHistory(entrepriseId: number, configId?: number): Promise<BackupHistory[]> {
    try {
      let url = `${this.historyUrl}/?entreprise=${entrepriseId}`
      if (configId) {
        url += `&configuration=${configId}`
      }
      const data = await apiClient.get<{ results?: BackupHistory[] } | BackupHistory[]>(url)
      return Array.isArray(data) ? data : (data.results || [])
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error)
      throw error
    }
  }

  // Récupérer l'historique récent
  async getRecentBackups(entrepriseId: number, limit: number = 10): Promise<BackupHistory[]> {
    try {
      const data = await apiClient.get<BackupHistory[]>(`${this.historyUrl}/recent/?entreprise=${entrepriseId}&limit=${limit}`)
      return data
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique récent:', error)
      throw error
    }
  }

  // === OPÉRATIONS DE RESTAURATION ===

  // Récupérer les opérations de restauration
  async getRestoreOperations(entrepriseId: number): Promise<RestoreOperation[]> {
    try {
      const data = await apiClient.get<{ results?: RestoreOperation[] } | RestoreOperation[]>(`${this.restoreUrl}/?entreprise=${entrepriseId}`)
      return Array.isArray(data) ? data : (data.results || [])
    } catch (error) {
      console.error('Erreur lors de la récupération des restaurations:', error)
      throw error
    }
  }

  // Créer une demande de restauration
  async createRestoreOperation(restore: Omit<RestoreOperation, 'id' | 'date_demande' | 'created_at' | 'updated_at'>): Promise<RestoreOperation> {
    try {
      const data = await apiClient.post<RestoreOperation>(this.restoreUrl + '/', restore)
      return data
    } catch (error) {
      console.error('Erreur lors de la création de la restauration:', error)
      throw error
    }
  }

  // Démarrer une restauration
  async startRestore(restoreId: number): Promise<RestoreOperation> {
    try {
      const data = await apiClient.post<RestoreOperation>(`${this.restoreUrl}/${restoreId}/start_restore/`)
      return data
    } catch (error) {
      console.error('Erreur lors du démarrage de la restauration:', error)
      throw error
    }
  }

  // Annuler une restauration
  async cancelRestore(restoreId: number): Promise<RestoreOperation> {
    try {
      const data = await apiClient.post<RestoreOperation>(`${this.restoreUrl}/${restoreId}/cancel_restore/`)
      return data
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la restauration:', error)
      throw error
    }
  }

  // === UTILITAIRES ===

  // Obtenir les types de sauvegarde
  getBackupTypes() {
    return [
      { value: 'COMPLETE', label: 'Sauvegarde Complète' },
      { value: 'INCREMENTAL', label: 'Sauvegarde Incrémentale' },
      { value: 'DIFFERENTIAL', label: 'Sauvegarde Différentielle' },
    ]
  }

  // Obtenir les fréquences
  getFrequencies() {
    return [
      { value: 'MANUAL', label: 'Manuel' },
      { value: 'DAILY', label: 'Quotidien' },
      { value: 'WEEKLY', label: 'Hebdomadaire' },
      { value: 'MONTHLY', label: 'Mensuel' },
    ]
  }

  // Obtenir les modules FiscaSync
  getModules() {
    return [
      { value: 'BALANCE', label: 'Balance' },
      { value: 'AUDIT', label: 'Audit' },
      { value: 'GENERATION', label: 'Génération' },
      { value: 'TEMPLATES', label: 'Templates' },
      { value: 'REPORTING', label: 'Reporting' },
      { value: 'TAX', label: 'Fiscal' },
      { value: 'CONSOLIDATION', label: 'Consolidation' },
      { value: 'PARAMETRAGE', label: 'Paramétrage' },
    ]
  }

  // Obtenir les types de restauration
  getRestoreTypes() {
    return [
      { value: 'COMPLETE', label: 'Restauration Complète' },
      { value: 'SELECTIVE', label: 'Restauration Sélective' },
      { value: 'POINT_IN_TIME', label: 'Restauration à un Point dans le Temps' },
    ]
  }

  // Formater la taille en octets
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  // Valider la configuration de sauvegarde
  validateBackupConfig(config: Partial<BackupConfiguration>): string[] {
    const errors: string[] = []

    if (!config.nom_configuration || config.nom_configuration.trim().length < 3) {
      errors.push('Le nom de configuration doit contenir au moins 3 caractères')
    }

    if (config.frequence === 'WEEKLY' && !config.jour_semaine) {
      errors.push('Le jour de la semaine est obligatoire pour une fréquence hebdomadaire')
    }

    if (config.frequence === 'MONTHLY' && !config.jour_mois) {
      errors.push('Le jour du mois est obligatoire pour une fréquence mensuelle')
    }

    if (config.retention_jours && (config.retention_jours < 1 || config.retention_jours > 365)) {
      errors.push('La rétention doit être entre 1 et 365 jours')
    }

    if (config.max_sauvegardes && (config.max_sauvegardes < 1 || config.max_sauvegardes > 100)) {
      errors.push('Le nombre maximum de sauvegardes doit être entre 1 et 100')
    }

    return errors
  }
}

export const backupService = new BackupService()