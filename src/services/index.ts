/**
 * Export centralisé de tous les services
 * Facilite l'import dans les composants
 */

export { apiClient } from './apiClient'
export { default as authService } from './authService'
export { default as balanceService } from './balanceService'
export { default as entrepriseService } from './entrepriseService'
export { default as generationService } from './generationService'
export { default as auditService } from './auditService'
export { default as reportingService } from './reportingService'
export { default as accountingService } from './accountingService'
export { default as templatesService } from './templatesService'
export { default as taxService } from './taxService'

// Types exports
export type { Balance, LigneBalance } from './balanceService'
export type { Entreprise, TypeLiasse, EntrepriseStats } from './entrepriseService'
export type { LiasseGeneration, GenerationRequest } from './generationService'
export type { AuditSession, AuditAnomalie, AuditRequest } from './auditService'
export type { Report, ReportTemplate, DashboardStats } from './reportingService'
export type { Template, TemplateVariable, GenerationRequest as TemplateGenerationRequest } from './templatesService'
export type { Impot, DeclarationFiscale, CalculFiscal } from './taxService'
export type { CompteComptable, PlanComptable, EcritureComptable } from './accountingService'