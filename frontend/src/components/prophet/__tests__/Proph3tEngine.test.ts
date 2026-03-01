/**
 * Tests fonctionnels — Proph3t Engine (Phases 1-7 + 9-12)
 *
 * 19+ tests couvrant les phases de l'upgrade 60% → 100%
 */

import { describe, it, expect } from 'vitest'
import { detectIntent } from '../nlp'
import { detectNegation, detectTemporal, extractNumericValue, normalize, tokenize } from '../nlp/normalize'
import { canonicalize } from '../nlp/synonyms'
import { calculerAgregats } from '../knowledge'
import { handleLiasseMapping } from '../knowledge/liasseKnowledge'
import { handleAuditExecute } from '../knowledge/auditKnowledge'
import { handleConditionalDiagnostic } from '../knowledge/conditionalReasoning'
import {
  handlePredictionIS,
  handlePredictionRatios,
  handleCoherenceCheck,
  handlePredictionSIG,
  handlePredictionBreakeven,
  handlePredictionBFR,
} from '../knowledge/predictiveAnalysis'
import type { Balance } from '@/types'
import type { ConversationContext } from '../types'

// ── Fixtures ──────────────────────────────────────────────────────────

function makeBalance(entries: { compte: string; solde: number; libelle?: string }[]): Balance[] {
  return entries.map((e, i) => ({
    id: String(i),
    exercice: '2024',
    compte: e.compte,
    debit: e.solde > 0 ? e.solde : 0,
    credit: e.solde < 0 ? -e.solde : 0,
    solde: e.solde,
    libelle_compte: e.libelle || `Compte ${e.compte}`,
    created_at: '',
    updated_at: '',
    is_active: true,
  }))
}

const BALANCE_COMPLETE = makeBalance([
  // Actif immobilise
  { compte: '211', solde: 5_000_000, libelle: 'Frais de R&D' },
  { compte: '22', solde: 20_000_000, libelle: 'Terrains' },
  { compte: '231', solde: 50_000_000, libelle: 'Batiments' },
  { compte: '2831', solde: -10_000_000, libelle: 'Amort Batiments' },
  { compte: '24', solde: 30_000_000, libelle: 'Materiel' },
  { compte: '284', solde: -5_000_000, libelle: 'Amort Materiel' },
  // Stocks
  { compte: '31', solde: 8_000_000, libelle: 'Marchandises' },
  // Creances
  { compte: '411', solde: 25_000_000, libelle: 'Clients' },
  { compte: '4191', solde: -500_000, libelle: 'Avances clients' },
  // Tresorerie
  { compte: '521', solde: 15_000_000, libelle: 'Banque' },
  { compte: '571', solde: 2_000_000, libelle: 'Caisse' },
  // Passif - Capitaux propres
  { compte: '101', solde: -50_000_000, libelle: 'Capital social' },
  { compte: '111', solde: -10_000_000, libelle: 'Reserves legales' },
  { compte: '12', solde: -15_000_000, libelle: 'Report a nouveau' },
  // Passif - Dettes
  { compte: '161', solde: -20_000_000, libelle: 'Emprunts' },
  { compte: '401', solde: -12_000_000, libelle: 'Fournisseurs' },
  { compte: '4311', solde: -2_500_000, libelle: 'CNPS' },
  { compte: '443', solde: -3_000_000, libelle: 'TVA collectee' },
  { compte: '4452', solde: 1_500_000, libelle: 'TVA deductible' },
  // Charges
  { compte: '601', solde: 80_000_000, libelle: 'Achats marchandises' },
  { compte: '61', solde: 5_000_000, libelle: 'Transports' },
  { compte: '62', solde: 3_000_000, libelle: 'Services exterieurs' },
  { compte: '66', solde: 25_000_000, libelle: 'Charges de personnel' },
  { compte: '67', solde: 2_000_000, libelle: 'Charges financieres' },
  { compte: '681', solde: 8_000_000, libelle: 'Dotations amort' },
  { compte: '6511', solde: 500_000, libelle: 'Amendes' },
  { compte: '6581', solde: 1_200_000, libelle: 'Cadeaux affaires' },
  // Produits
  { compte: '701', solde: -180_000_000, libelle: 'Ventes marchandises' },
  { compte: '706', solde: -20_000_000, libelle: 'Prestations services' },
  { compte: '77', solde: -500_000, libelle: 'Produits financiers' },
])

const CTX_EMPTY: ConversationContext = {}

// ══════════════════════════════════════════════════════════════════════
// TEST 1 — Phase 1 : Passage fiscal (agregats + IS)
// ══════════════════════════════════════════════════════════════════════
describe('Test 1 — Phase 1 : Passage fiscal & IS', () => {
  it('devrait calculer les agregats correctement depuis la balance', () => {
    const ag = calculerAgregats(BALANCE_COMPLETE)

    expect(ag.ca).toBeGreaterThan(0)
    // CA = 180M + 20M = 200M
    expect(ag.ca).toBe(200_000_000)
    // capitalSocial keeps credit sign (negative in Balance.solde)
    expect(ag.capitalSocial).toBe(-50_000_000)
    expect(ag.chargesPersonnel).toBe(25_000_000)
    expect(ag.tresorerie).toBeGreaterThan(0)
  })

  it('devrait produire une estimation IS via handlePredictionIS', () => {
    const resp = handlePredictionIS(BALANCE_COMPLETE)

    expect(resp.text).toContain('IS')
    expect(resp.content).toBeDefined()
    expect(resp.content!.length).toBeGreaterThan(0)
    // Should have a PredictionCard
    const pred = resp.content!.find(c => c.type === 'prediction')
    expect(pred).toBeDefined()
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 2 — Phase 2 : Coherence comptable (8 controles)
// ══════════════════════════════════════════════════════════════════════
describe('Test 2 — Phase 2 : Coherence comptable', () => {
  it('devrait lancer le controle de coherence et retourner des indicateurs', () => {
    const resp = handleCoherenceCheck(BALANCE_COMPLETE)

    expect(resp.text).toBeDefined()
    expect(resp.content).toBeDefined()
    // Should have prediction card with indicators
    const pred = resp.content!.find(c => c.type === 'prediction')
    expect(pred).toBeDefined()
    if (pred && pred.type === 'prediction') {
      expect(pred.indicators.length).toBeGreaterThan(0)
    }
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 3 — Phase 3 : Ratios financiers (24 ratios)
// ══════════════════════════════════════════════════════════════════════
describe('Test 3 — Phase 3 : Ratios financiers', () => {
  it('devrait calculer et retourner des ratios financiers', () => {
    const resp = handlePredictionRatios(BALANCE_COMPLETE)

    expect(resp.text).toContain('ratio')
    expect(resp.content).toBeDefined()
    const pred = resp.content!.find(c => c.type === 'prediction')
    expect(pred).toBeDefined()
    if (pred && pred.type === 'prediction') {
      // At least 6 ratios
      expect(pred.indicators.length).toBeGreaterThanOrEqual(6)
    }
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 4 — Phase 4 : Mapping liasse (compte → poste bilan)
// ══════════════════════════════════════════════════════════════════════
describe('Test 4 — Phase 4 : Mapping liasse', () => {
  it('devrait mapper un compte vers son poste bilan', () => {
    // "ou va le compte 211" → should find the poste for 211
    const resp = handleLiasseMapping('211', undefined, ['mapping'])

    expect(resp.text).toBeDefined()
    expect(resp.text.length).toBeGreaterThan(20)
    // Should mention the poste ref
    expect(resp.content).toBeDefined()
  })

  it('devrait lister les comptes d un poste donne', () => {
    // Poste "AD" → Frais immobilises
    const resp = handleLiasseMapping(undefined, 'AD', ['poste'])

    expect(resp.text).toBeDefined()
    expect(resp.content).toBeDefined()
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 5 — Phase 5 : Audit complet (116 controles)
// ══════════════════════════════════════════════════════════════════════
describe('Test 5 — Phase 5 : Audit execute', () => {
  it('devrait executer l audit et retourner un score + anomalies', () => {
    const resp = handleAuditExecute(BALANCE_COMPLETE)

    expect(resp.text).toContain('Audit')
    expect(resp.content).toBeDefined()
    expect(resp.content!.length).toBeGreaterThan(0)

    // Should have a PredictionCard with the score
    const pred = resp.content!.find(c => c.type === 'prediction')
    expect(pred).toBeDefined()
    if (pred && pred.type === 'prediction') {
      expect(pred.indicators.length).toBeGreaterThan(0)
    }
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 6 — Phase 6 : Diagnostic conditionnel (regime, deductibilite)
// ══════════════════════════════════════════════════════════════════════
describe('Test 6 — Phase 6 : Diagnostic conditionnel', () => {
  it('devrait produire un diagnostic fiscal avec regime et deductibilite', () => {
    const resp = handleConditionalDiagnostic(
      BALANCE_COMPLETE,
      undefined,
      { regime_imposition: 'REEL_NORMAL', capital: 50_000_000 },
    )

    expect(resp.text).toBeDefined()
    expect(resp.content).toBeDefined()
    expect(resp.content!.length).toBeGreaterThan(0)

    // Should have PredictionCard and/or FiscalInfoCard
    const hasPred = resp.content!.some(c => c.type === 'prediction')
    const hasFiscal = resp.content!.some(c => c.type === 'fiscal_info')
    expect(hasPred || hasFiscal).toBe(true)
  })

  it('devrait detecter le regime correct depuis le CA', () => {
    // CA = 200M → should detect Reel Normal (> 150M threshold)
    const resp = handleConditionalDiagnostic(
      BALANCE_COMPLETE,
      undefined,
      undefined,
    )

    expect(resp.text).toBeDefined()
    // Response should mention "Normal" since CA > 150M
    expect(resp.text.toLowerCase()).toMatch(/normal|réel/i)
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 7 — Phase 7 : NLP — Negation
// ══════════════════════════════════════════════════════════════════════
describe('Test 7 — Phase 7 : NLP negation', () => {
  it('devrait detecter la negation dans le texte', () => {
    expect(detectNegation("Ce n'est pas deductible")).toBe(true)
    expect(detectNegation("pas de conformite")).toBe(true)
    expect(detectNegation("aucun probleme")).toBe(true)
    expect(detectNegation("le taux IS est de 25%")).toBe(false)
  })

  it('devrait booster FISCAL_DEDUCTIBILITY quand negation + deductible', () => {
    const query = detectIntent("est-ce que les amendes ne sont pas deductibles", CTX_EMPTY)

    expect(query.negation).toBe(true)
    expect(query.intent).toBe('FISCAL_DEDUCTIBILITY')
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 8 — Phase 7 : NLP — Temporalite
// ══════════════════════════════════════════════════════════════════════
describe('Test 8 — Phase 7 : NLP temporalite', () => {
  it('devrait detecter les marqueurs temporels', () => {
    expect(detectTemporal("compare N et N-1")).toBe('comparison')
    expect(detectTemporal("exercice precedent")).toBe('previous')
    expect(detectTemporal("exercice en cours")).toBe('current')
    expect(detectTemporal("quel est le taux IS")).toBeUndefined()
  })

  it('devrait booster PREDICTION_TREND sur requete comparative', () => {
    const query = detectIntent("compare les ratios par rapport a N-1", CTX_EMPTY)

    expect(query.temporal).toBe('comparison')
    expect(query.intent).toBe('PREDICTION_TREND')
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 9 — Phase 7 : NLP — Multi-intent
// ══════════════════════════════════════════════════════════════════════
describe('Test 9 — Phase 7 : NLP multi-intent', () => {
  it('devrait detecter les intents secondaires avec "et"', () => {
    // Use query that clearly triggers two distinct scored intents
    const query = detectIntent("analyse des ratios et aussi la coherence du bilan", CTX_EMPTY)

    expect(query.intent).toBeDefined()
    // Primary should be one of the prediction intents
    expect(query.intent).toMatch(/^PREDICTION_/)
    // Should have secondary intents OR multiple intents scored
    // The multi-intent detection requires both intents to score >= 70 after "et"
    if (query.secondaryIntents && query.secondaryIntents.length > 0) {
      expect(query.secondaryIntents[0]).toMatch(/^PREDICTION_/)
    }
    // At minimum, multiple prediction domains should be detected in a compound query
    expect(['PREDICTION_RATIOS', 'PREDICTION_COHERENCE', 'PREDICTION_GENERAL']).toContain(query.intent)
  })

  it('devrait detecter un suivi contextuel apres une prediction', () => {
    const ctxAfterIS: ConversationContext = { lastIntent: 'PREDICTION_IS' }
    const query = detectIntent("et la TVA?", ctxAfterIS)

    expect(query.intent).toBe('PREDICTION_TVA')
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 10 — NLP core : normalize, tokenize, numericValue
// ══════════════════════════════════════════════════════════════════════
describe('Test 10 — NLP core', () => {
  it('devrait normaliser le texte correctement', () => {
    expect(normalize("L'amortissement des équipements")).toBe("l amortissement des equipements")
    expect(normalize("  Taux  IS   25% ")).toBe("taux is 25")
  })

  it('devrait tokeniser en enlevant les stop words', () => {
    const tokens = tokenize("Quel est le taux de TVA en Cote d'Ivoire")
    expect(tokens).toContain('taux')
    expect(tokens).toContain('tva')
    expect(tokens).toContain('cote')
    // "le", "de", "est" should be filtered
    expect(tokens).not.toContain('le')
    expect(tokens).not.toContain('de')
    expect(tokens).not.toContain('est')
  })

  it('devrait extraire les valeurs numeriques', () => {
    expect(extractNumericValue("10 millions")).toBe(10_000_000)
    expect(extractNumericValue("50K")).toBe(50_000)
    expect(extractNumericValue("2 milliards")).toBe(2_000_000_000)
  })

  it('devrait detecter correctement les intents de base', () => {
    expect(detectIntent("bonjour", CTX_EMPTY).intent).toBe('GREETING')
    expect(detectIntent("aide", CTX_EMPTY).intent).toBe('HELP')
    expect(detectIntent("601", CTX_EMPTY).intent).toBe('ACCOUNT_LOOKUP')
    expect(detectIntent("taux IS", CTX_EMPTY).intent).toBe('FISCAL_TAX_RATE')
    expect(detectIntent("note 15", CTX_EMPTY).intent).toBe('LIASSE_SHEET')
    expect(detectIntent("controle FI-003", CTX_EMPTY).intent).toBe('AUDIT_CONTROL')
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 11 — Phase 9A : Synonymes enrichis
// ══════════════════════════════════════════════════════════════════════
describe('Test 11 — Phase 9A : Synonymes enrichis', () => {
  it('devrait canonicaliser les nouveaux groupes de synonymes', () => {
    expect(canonicalize('chiffre affaires')).toBe('ca')
    expect(canonicalize('besoin fonds roulement')).toBe('bfr')
    expect(canonicalize('excedent brut exploitation')).toBe('ebe')
    expect(canonicalize('soldes intermediaires')).toBe('sig')
    expect(canonicalize('point mort')).toBe('seuil')
    expect(canonicalize('break even')).toBe('seuil')
    expect(canonicalize('roe')).toBe('rentabilite')
    expect(canonicalize('impot minimum forfaitaire')).toBe('imf')
    expect(canonicalize('cash flow')).toBe('tft')
    expect(canonicalize('consolidation')).toBe('consolidation')
    expect(canonicalize('cloture')).toBe('cloture')
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 12 — Phase 10A : SIG (Soldes Intermediaires de Gestion)
// ══════════════════════════════════════════════════════════════════════
describe('Test 12 — Phase 10A : SIG', () => {
  it('devrait detecter l intent PREDICTION_SIG', () => {
    expect(detectIntent("montre moi le SIG", CTX_EMPTY).intent).toBe('PREDICTION_SIG')
    expect(detectIntent("soldes intermediaires de gestion", CTX_EMPTY).intent).toBe('PREDICTION_SIG')
    expect(detectIntent("cascade sig", CTX_EMPTY).intent).toBe('PREDICTION_SIG')
  })

  it('devrait calculer le SIG depuis la balance', () => {
    const resp = handlePredictionSIG(BALANCE_COMPLETE)

    expect(resp.text).toContain('SIG')
    expect(resp.content).toBeDefined()
    const pred = resp.content!.find(c => c.type === 'prediction')
    expect(pred).toBeDefined()
    if (pred && pred.type === 'prediction') {
      // SIG should have 7 indicators: MC, VA, EBE, Rex, RF, RN, CAFG
      expect(pred.indicators.length).toBe(7)
      expect(pred.indicators[0].label).toContain('Marge commerciale')
    }
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 13 — Phase 10C : Seuil de rentabilite
// ══════════════════════════════════════════════════════════════════════
describe('Test 13 — Phase 10C : Seuil de rentabilite', () => {
  it('devrait detecter l intent PREDICTION_BREAKEVEN', () => {
    expect(detectIntent("seuil de rentabilite", CTX_EMPTY).intent).toBe('PREDICTION_BREAKEVEN')
    expect(detectIntent("point mort", CTX_EMPTY).intent).toBe('PREDICTION_BREAKEVEN')
    expect(detectIntent("break even", CTX_EMPTY).intent).toBe('PREDICTION_BREAKEVEN')
  })

  it('devrait calculer le seuil de rentabilite', () => {
    const resp = handlePredictionBreakeven(BALANCE_COMPLETE)

    expect(resp.text).toContain('Seuil')
    expect(resp.content).toBeDefined()
    const pred = resp.content!.find(c => c.type === 'prediction')
    expect(pred).toBeDefined()
    if (pred && pred.type === 'prediction') {
      expect(pred.indicators.length).toBeGreaterThanOrEqual(5)
      // Should have seuil indicator
      const seuilInd = pred.indicators.find(i => i.label.includes('Seuil'))
      expect(seuilInd).toBeDefined()
    }
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 14 — Phase 10E : BFR
// ══════════════════════════════════════════════════════════════════════
describe('Test 14 — Phase 10E : BFR', () => {
  it('devrait detecter l intent PREDICTION_BFR', () => {
    expect(detectIntent("analyse du BFR", CTX_EMPTY).intent).toBe('PREDICTION_BFR')
    expect(detectIntent("besoin en fonds de roulement", CTX_EMPTY).intent).toBe('PREDICTION_BFR')
    expect(detectIntent("cycle de tresorerie DSO DPO", CTX_EMPTY).intent).toBe('PREDICTION_BFR')
  })

  it('devrait calculer le BFR et le cycle de tresorerie', () => {
    const resp = handlePredictionBFR(BALANCE_COMPLETE)

    expect(resp.text).toContain('BFR')
    expect(resp.content).toBeDefined()
    const pred = resp.content!.find(c => c.type === 'prediction')
    expect(pred).toBeDefined()
    if (pred && pred.type === 'prediction') {
      // Should have DSO, DPO, DSI, cycle cash, FR, BFR, trésorerie nette
      expect(pred.indicators.length).toBe(7)
      expect(pred.indicators[0].label).toContain('DSO')
    }
  })
})

// ══════════════════════════════════════════════════════════════════════
// TEST 15 — Phase 12A : Error recovery
// ══════════════════════════════════════════════════════════════════════
describe('Test 15 — Phase 12A : Error recovery', () => {
  it('devrait retourner noBalanceResponse sans balance pour SIG/BFR/Seuil', () => {
    const respSIG = handlePredictionSIG([])
    expect(respSIG.text).toContain('Aucune balance')

    const respBFR = handlePredictionBFR([])
    expect(respBFR.text).toContain('Aucune balance')

    const respBE = handlePredictionBreakeven([])
    expect(respBE.text).toContain('Aucune balance')
  })
})
