/**
 * Module d'audit - Barrel exports
 */

// Registre
export { controlRegistry } from './controlRegistry'

// Moteur
export { executePhase1, executePhase3, runLevel, computeResume, generateCorrectionReport } from './auditEngine'

// Storage
export * from './auditStorage'

// Enregistrement des controles
export { registerLevel0Controls } from './controls/level0-structural'
export { registerLevel1Controls } from './controls/level1-fundamental'
export { registerLevel2Controls } from './controls/level2-ohada-conformity'
export { registerLevel3Controls } from './controls/level3-balance-sense'
export { registerLevel4Controls } from './controls/level4-inter-account'
export { registerLevel5Controls } from './controls/level5-year-over-year'
export { registerLevel6Controls } from './controls/level6-financial-statements'
export { registerLevel7Controls } from './controls/level7-fiscal'
export { registerLevel8Controls } from './controls/level8-archive'
export { registerComparisonControls } from './controls/comparisonControls'

// Orchestrateur
export { auditOrchestrator } from './auditOrchestrator'

// Services
export { reclassementService } from './reclassementService'
export { reportGenerator } from './reportGenerator'
