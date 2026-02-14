/**
 * Types TypeScript pour TaxPilot
 * Application de Génération et Édition de Liasse Fiscale SYSCOHADA/IFRS
 */

// Types de base
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  is_active: boolean
}

// Types d'entreprise et paramétrage
export interface Entreprise extends BaseEntity {
  raison_sociale: string
  forme_juridique: string
  numero_contribuable: string
  rccm?: string
  ifu?: string
  adresse_ligne1: string
  adresse_ligne2?: string
  ville: string
  code_postal?: string
  pays: string
  telephone?: string
  email: string
  site_web?: string
  nom_dirigeant: string
  fonction_dirigeant: string
  email_dirigeant?: string
  regime_imposition: string
  centre_impots: string
  secteur_activite: string
  chiffre_affaires_annuel: number
  devise_principale: string
  precision_montants: number
  logo?: string
  couleur_principale: string
  couleur_secondaire: string
  is_groupe: boolean
  entreprise_mere?: string
  date_souscription: string
  type_abonnement: string
  type_liasse_recommande?: string
  capital_social?: number
  numero_comptable?: string
  exercice_debut?: string
  exercice_fin?: string
  date_depot?: string
  telephone_dirigeant?: string
  // R1 - Effectifs & Groupe
  nombre_etablissements?: number
  effectif_permanent?: number
  effectif_temporaire?: number
  masse_salariale?: number
  nom_groupe?: string
  pays_siege_groupe?: string
  // R1 - CAC & Expert comptable
  cac_nom?: string
  cac_adresse?: string
  cac_numero_inscription?: string
  expert_nom?: string
  expert_adresse?: string
  expert_numero_inscription?: string
  // R2 - Dirigeants & Commissaires
  dirigeants?: DirigeantEntry[]
  commissaires_comptes?: CommissaireEntry[]
  // R3 - Participations
  participations_filiales?: ParticipationEntry[]
}

// Types pour les données R2 (Dirigeants)
export interface DirigeantEntry {
  id: string
  qualite: string
  nom: string
  prenoms: string
  adresse: string
  telephone: string
  email: string
  date_nomination: string
  duree_mandat: string
  remunerations: number
  avantages_nature: string
  observations: string
}

// Types pour les données R2 (Commissaires aux comptes)
export interface CommissaireEntry {
  id: string
  nom: string
  prenoms: string
  cabinet: string
  adresse: string
  telephone: string
  email: string
  numero_ordre: string
  date_nomination: string
  duree_mandat: string
  honoraires: number
  autres_prestations: number
  observations: string
}

// Types pour les données R3 (Participations)
export interface ParticipationEntry {
  id: string
  raison_sociale: string
  forme_juridique: string
  secteur_activite: string
  adresse: string
  telephone: string
  email: string
  numero_rccm: string
  capital: number
  pourcentage_participation: number
  nombre_titres: number
  valeur_nominale: number
  valeur_comptable: number
  valeur_marche: number
  dividendes_recus: number
  date_acquisition: string
  mode_acquisition: string
  observations: string
}

// Types de balance
export interface Balance extends BaseEntity {
  exercice: string
  compte: string
  debit: number
  credit: number
  solde: number
  libelle_compte: string
}

// Types de liasse fiscale
export type TypeLiasse = 'SN' | 'SMT' | 'CONSO' | 'BANQUE' | 'ASSURANCE' | 'MICROFINANCE' | 'EBNL'

export interface LiasseFiscale extends BaseEntity {
  entreprise: string
  exercice: string
  type_liasse: TypeLiasse
  statut: 'BROUILLON' | 'VALIDEE' | 'DECLAREE' | 'ARCHIVEE'
  donnees_json: Record<string, any>
  date_generation?: string
  date_validation?: string
  date_declaration?: string
}

// Types d'audit
export interface AuditResult {
  score_global: number
  nb_anomalies: number
  anomalies: AuditAnomalie[]
  recommandations: string[]
  last_audit: string
}

export interface AuditAnomalie {
  id: string
  type: 'ERROR' | 'WARNING' | 'INFO'
  compte: string
  description: string
  montant_impact?: number
  suggestion_correction?: string
  priorite: 'HAUTE' | 'MOYENNE' | 'BASSE'
}

// Types de template
export interface Template extends BaseEntity {
  nom: string
  type_template: 'EXCEL' | 'WORD' | 'PDF' | 'XML'
  type_liasse: TypeLiasse
  fichier_modele: string
  mapping_json: Record<string, any>
  is_official: boolean
  description?: string
}

// Types d'utilisateur
export interface UtilisateurEntreprise extends BaseEntity {
  user: {
    id: string
    username: string
    email: string
    first_name: string
    last_name: string
    is_active: boolean
  }
  entreprise: string
  role: string
  modules_acces: Record<string, boolean>
  permissions_speciales: Record<string, boolean>
  date_invitation: string
  date_activation?: string
  est_actif: boolean
  derniere_connexion?: string
  langue_preferee: string
  theme_interface: string
}

// Types pour les formulaires
export interface EntrepriseFormData {
  raison_sociale: string
  forme_juridique: string
  numero_contribuable: string
  rccm?: string
  ifu?: string
  adresse_ligne1: string
  adresse_ligne2?: string
  ville: string
  code_postal?: string
  pays: string
  telephone?: string
  email: string
  site_web?: string
  nom_dirigeant: string
  fonction_dirigeant: string
  email_dirigeant?: string
  regime_imposition: string
  centre_impots: string
  secteur_activite: string
  chiffre_affaires_annuel: number
  devise_principale: string
  logo?: File
  capital_social?: number
  numero_comptable?: string
  exercice_debut?: string
  exercice_fin?: string
  date_depot?: string
  telephone_dirigeant?: string
  // R1
  nombre_etablissements?: number
  effectif_permanent?: number
  effectif_temporaire?: number
  masse_salariale?: number
  nom_groupe?: string
  pays_siege_groupe?: string
  cac_nom?: string
  cac_adresse?: string
  cac_numero_inscription?: string
  expert_nom?: string
  expert_adresse?: string
  expert_numero_inscription?: string
  // R2/R3 (JSON arrays)
  dirigeants?: DirigeantEntry[]
  commissaires_comptes?: CommissaireEntry[]
  participations_filiales?: ParticipationEntry[]
}

// Types pour les API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

// Types pour l'authentification
export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthUser {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  entreprise_courante?: Entreprise
  role?: string
}

// Types pour l'onboarding
export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
  component: string
}

export interface ConfigurationOnboarding extends BaseEntity {
  entreprise: string
  etape_entreprise_complete: boolean
  etape_fiscal_complete: boolean
  etape_comptable_complete: boolean
  etape_utilisateurs_complete: boolean
  etape_import_complete: boolean
  pourcentage_completion: number
  configuration_terminee: boolean
  date_completion?: string
  tests_validation: Record<string, any>
  derniere_validation?: string
}

// Types pour les notifications
export interface Notification extends BaseEntity {
  titre: string
  message: string
  type_notification: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  destinataire: string
  lue: boolean
  date_lecture?: string
  action_url?: string
  donnees_supplementaires?: Record<string, any>
}

// Types pour les graphiques et dashboards
export interface KPICard {
  title: string
  value: string | number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
  }[]
}

// Types d'erreur
export interface TaxPilotError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}