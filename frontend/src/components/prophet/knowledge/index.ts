export {
  handleFiscalTaxRate,
  handleFiscalCalculation,
  handleFiscalDeductibility,
  handleFiscalCalendar,
  handleFiscalGeneral,
} from './fiscalKnowledge'

export {
  handleLiasseSheet,
  handleLiasseRegime,
  handleLiasseCategory,
  handleLiasseMapping,
} from './liasseKnowledge'

export {
  handleAuditControl,
  handleAuditLevel,
  handleAuditGeneral,
  handleAuditExecute,
  ensureAuditControlsRegistered,
} from './auditKnowledge'

export {
  handlePredictionIS,
  handlePredictionTVA,
  handlePredictionRatios,
  handlePredictionTrend,
  handlePredictionAnomaly,
  handleCoherenceCheck,
  handlePredictionGeneral,
  handlePredictionSIG,
  handlePredictionBreakeven,
  handlePredictionBFR,
  handlePredictionForecast,
  calculerAgregats,
} from './predictiveAnalysis'
export type { Agregats } from './predictiveAnalysis'

export { projectAggregates, formatProjectionForCard } from './projections'
export type { ProjectionResult, AggregateProjection, ProjectionScenario, ProjectionConfidence } from './projections'

export {
  handleConditionalDiagnostic,
} from './conditionalReasoning'

export {
  detectRegimeSpecifique,
  detectOpportunitesRegimeSpecifique,
  calculerISAvecRegime,
  detectTvaSpecificites,
} from './regimesSpeciaux'

export {
  inferRemediations,
  groupRemediationsByAccount,
  formatRemediationsAsMarkdown,
} from './auditRemediation'
export type { RemediationAction, RemediationType, RemediationConfidence } from './auditRemediation'

export {
  handleMemoryRecall,
  rememberComputation,
  rememberForecast,
  addHypothesis,
  tickHypothesesTtl,
  appendToHistory,
  clearMemory,
  parseWhatIf,
  handleWhatIf,
} from './memoryRecall'
export type {
  RegimeSpecifique,
  RegimeContext,
  EntrepriseContext,
  TvaSpecificites,
  ISCalculRegime,
} from './regimesSpeciaux'
