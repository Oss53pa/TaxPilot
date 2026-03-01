/**
 * Knowledge — Audit & Controles
 */

import { controlRegistry } from '@/services/audit/controlRegistry'
import { computeResume } from '@/services/audit/auditEngine'
import {
  registerLevel0Controls,
  registerLevel1Controls,
  registerLevel2Controls,
  registerLevel3Controls,
  registerLevel4Controls,
  registerLevel5Controls,
  registerLevel6Controls,
  registerLevel7Controls,
  registerLevel8Controls,
} from '@/services/audit'
import { PLAN_SYSCOHADA_REVISE } from '@/data/SYSCOHADARevisePlan'
import { SYSCOHADA_MAPPING } from '@/services/liasseDataService'
import type { AuditContext, NiveauControle, ResultatControle } from '@/types/audit.types'
import type { Balance } from '@/types'
import type { Proph3tResponse, AuditControlCard, PredictionCard, FiscalInfoCard } from '../types'

// ── Ensure controls are registered ──────────────────────────────────

let registered = false

function ensureRegistered() {
  if (registered) return
  registerLevel0Controls()
  registerLevel1Controls()
  registerLevel2Controls()
  registerLevel3Controls()
  registerLevel4Controls()
  registerLevel5Controls()
  registerLevel6Controls()
  registerLevel7Controls()
  registerLevel8Controls()
  registered = true
}

const LEVEL_LABELS: Record<number, string> = {
  0: 'Structurel',
  1: 'Fondamental',
  2: 'Conformite OHADA',
  3: 'Sens des soldes',
  4: 'Inter-comptes',
  5: 'Variation N/N-1',
  6: 'Etats financiers',
  7: 'Fiscal',
  8: 'Archivage',
}

const SEVERITY_ORDER = ['BLOQUANT', 'MAJEUR', 'MINEUR', 'INFO', 'OK']

// ── Control by ref ──────────────────────────────────────────────────

export function handleAuditControl(ref: string): Proph3tResponse {
  ensureRegistered()

  const control = controlRegistry.get(ref)
  if (!control) {
    return {
      text: `Le controle **${ref}** n'existe pas. Les references suivent le format XX-NNN (ex: FI-003, ST-001, BA-012).\n\nTapez "audit" pour voir la liste des niveaux disponibles.`,
      suggestions: ['Audit general', 'Niveau 0', 'Niveau 7'],
    }
  }

  const def = control.definition
  const card: AuditControlCard = {
    type: 'audit_control',
    controls: [{
      ref: def.ref,
      nom: def.nom,
      niveau: def.niveau,
      description: def.description,
      severite: def.severiteDefaut,
      phase: def.phase,
    }],
  }

  return {
    text: `**Controle ${def.ref}** — ${def.nom}\n\n${def.description}\n\n- **Niveau** : ${def.niveau} (${LEVEL_LABELS[def.niveau] || 'Inconnu'})\n- **Severite** : ${def.severiteDefaut}\n- **Phase** : ${def.phase}\n- **Actif** : ${def.actif ? 'Oui' : 'Non'}`,
    content: [card],
    suggestions: [
      `Niveau ${def.niveau}`,
      'Audit general',
      def.niveau < 8 ? `Niveau ${def.niveau + 1}` : 'Niveau 0',
    ],
  }
}

// ── Controls by level ───────────────────────────────────────────────

export function handleAuditLevel(niveau: number): Proph3tResponse {
  ensureRegistered()

  if (niveau < 0 || niveau > 8) {
    return {
      text: `Le niveau **${niveau}** n'existe pas. Les niveaux d'audit vont de 0 a 8.`,
      suggestions: ['Niveau 0', 'Niveau 4', 'Niveau 7', 'Audit general'],
    }
  }

  const controls = controlRegistry.getByLevel(niveau as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)
  const label = LEVEL_LABELS[niveau] || 'Inconnu'

  if (controls.length === 0) {
    return {
      text: `**Niveau ${niveau} — ${label}**\n\nAucun controle actif a ce niveau.`,
      suggestions: ['Audit general', niveau > 0 ? `Niveau ${niveau - 1}` : 'Niveau 1'],
    }
  }

  // Stats by severity
  const severityStats: Record<string, number> = {}
  for (const c of controls) {
    const s = c.definition.severiteDefaut
    severityStats[s] = (severityStats[s] || 0) + 1
  }
  const statsStr = SEVERITY_ORDER
    .filter(s => severityStats[s])
    .map(s => `${s}: ${severityStats[s]}`)
    .join(' | ')

  const entries = controls.slice(0, 10).map(c => ({
    ref: c.definition.ref,
    nom: c.definition.nom,
    niveau: c.definition.niveau,
    description: c.definition.description,
    severite: c.definition.severiteDefaut,
    phase: c.definition.phase,
  }))

  const card: AuditControlCard = {
    type: 'audit_control',
    controls: entries,
    summary: `${controls.length} controles | ${statsStr}`,
  }

  return {
    text: `**Niveau ${niveau} — ${label}**\n\n**${controls.length}** controles actifs a ce niveau.\n\n${statsStr}`,
    content: [card],
    suggestions: [
      niveau > 0 ? `Niveau ${niveau - 1}` : 'Niveau 1',
      niveau < 8 ? `Niveau ${niveau + 1}` : 'Niveau 7',
      'Audit general',
    ],
  }
}

// ── Execute audit on balance ────────────────────────────────────────

function toAuditEntries(balance: Balance[]) {
  return balance.map(b => ({
    compte: b.compte,
    intitule: b.libelle_compte || '',
    debit: b.debit,
    credit: b.credit,
    solde_debit: Math.max(0, b.solde),
    solde_credit: Math.max(0, -b.solde),
  }))
}

function scoreStatus(score: number): 'excellent' | 'bon' | 'acceptable' | 'critique' {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'bon'
  if (score >= 50) return 'acceptable'
  return 'critique'
}

function fmt(n: number): string {
  return n.toLocaleString('fr-FR')
}

export function handleAuditExecute(balanceN: Balance[], balanceN1?: Balance[]): Proph3tResponse {
  ensureRegistered()

  const entries = toAuditEntries(balanceN)
  const entriesN1 = balanceN1 ? toAuditEntries(balanceN1) : undefined

  const context: AuditContext = {
    balanceN: entries,
    balanceN1: entriesN1,
    planComptable: PLAN_SYSCOHADA_REVISE,
    mappingSyscohada: SYSCOHADA_MAPPING,
    typeLiasse: 'SN',
  }

  // Execute all 9 levels synchronously
  const allResults: ResultatControle[] = []
  const levels: NiveauControle[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]

  for (const niveau of levels) {
    const controls = controlRegistry.getByLevel(niveau)
    for (const { definition, execute } of controls) {
      if (!definition.actif) continue
      try {
        const result = execute(context)
        if (Array.isArray(result)) allResults.push(...result)
        else allResults.push(result)
      } catch (err) {
        allResults.push({
          ref: definition.ref,
          nom: definition.nom,
          niveau: definition.niveau,
          statut: 'ERREUR_EXEC',
          severite: 'INFO',
          message: `Erreur: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: new Date().toISOString(),
        })
      }
    }
  }

  const resume = computeResume(allResults)
  const { parSeverite, scoreGlobal } = resume

  // ── Anomalies triées par sévérité ──
  const anomalies = allResults
    .filter(r => r.statut === 'ANOMALIE' || r.statut === 'ERREUR_EXEC')
    .sort((a, b) => {
      const order = { BLOQUANT: 0, MAJEUR: 1, MINEUR: 2, INFO: 3, OK: 4 }
      return (order[a.severite] ?? 4) - (order[b.severite] ?? 4)
    })

  // ── PredictionCard : score global + ventilation ──
  const summaryCard: PredictionCard = {
    type: 'prediction',
    title: `Audit Complet — Score ${scoreGlobal}/100`,
    indicators: [
      { label: 'Score global', value: `${scoreGlobal}/100`, status: scoreStatus(scoreGlobal) },
      { label: 'Controles executes', value: fmt(allResults.length), status: 'bon' },
      { label: 'OK', value: fmt(parSeverite.OK), status: 'excellent' },
      { label: 'Bloquants', value: fmt(parSeverite.BLOQUANT), status: parSeverite.BLOQUANT > 0 ? 'critique' : 'excellent' },
      { label: 'Majeurs', value: fmt(parSeverite.MAJEUR), status: parSeverite.MAJEUR > 0 ? 'acceptable' : 'excellent' },
      { label: 'Mineurs', value: fmt(parSeverite.MINEUR), status: parSeverite.MINEUR > 0 ? 'bon' : 'excellent' },
      { label: 'Info', value: fmt(parSeverite.INFO), status: 'bon' },
      { label: 'Anomalies total', value: fmt(anomalies.length), status: anomalies.length === 0 ? 'excellent' : scoreStatus(scoreGlobal) },
    ],
    narrative: buildAuditNarrative(scoreGlobal, parSeverite, anomalies.length, allResults.length),
    recommendations: buildAuditRecommendations(anomalies),
  }

  // ── FiscalInfoCard : détail des anomalies (top 15) ──
  const topAnomalies = anomalies.slice(0, 15)
  const detailCard: FiscalInfoCard = {
    type: 'fiscal_info',
    category: `${anomalies.length} anomalie${anomalies.length > 1 ? 's' : ''} detectee${anomalies.length > 1 ? 's' : ''}`,
    items: topAnomalies.map(a => ({
      label: `[${a.severite}] ${a.ref} — ${a.nom}`,
      value: a.message,
    })),
  }

  // ── Niveau par niveau ──
  const niveauLines = levels.map(n => {
    const nResults = allResults.filter(r => r.niveau === n)
    const nOk = nResults.filter(r => r.statut === 'OK').length
    const nAno = nResults.filter(r => r.statut === 'ANOMALIE').length
    const tag = nAno === 0 ? '✓' : `⚠ ${nAno}`
    return `- Niv. ${n} (${LEVEL_LABELS[n]}) : ${nOk}/${nResults.length} OK ${tag}`
  }).join('\n')

  const text = `**Audit complet execute** — **${allResults.length}** controles sur **${balanceN.length}** lignes\n\n**Score : ${scoreGlobal}/100**\n\n${niveauLines}\n\n${anomalies.length === 0 ? 'Aucune anomalie detectee. Balance conforme !' : `**${anomalies.length} anomalie${anomalies.length > 1 ? 's' : ''}** detectee${anomalies.length > 1 ? 's' : ''} (${parSeverite.BLOQUANT} bloquant${parSeverite.BLOQUANT > 1 ? 's' : ''}, ${parSeverite.MAJEUR} majeur${parSeverite.MAJEUR > 1 ? 's' : ''}, ${parSeverite.MINEUR} mineur${parSeverite.MINEUR > 1 ? 's' : ''}).`}`

  return {
    text,
    content: [summaryCard, ...(anomalies.length > 0 ? [detailCard] : [])],
    suggestions: anomalies.length > 0
      ? [
          anomalies[0] ? `Controle ${anomalies[0].ref}` : 'Audit',
          'Coherence',
          'Analyse ratios',
        ]
      : ['Analyse ratios', 'Estimation IS', 'Coherence'],
  }
}

function buildAuditNarrative(
  score: number,
  parSeverite: Record<string, number>,
  anomCount: number,
  totalControles: number,
): string {
  const okPct = totalControles > 0 ? Math.round(((totalControles - anomCount) / totalControles) * 100) : 0

  if (score >= 95) return `Excellent. ${okPct}% des controles sont conformes. La balance est de tres bonne qualite.`
  if (score >= 80) return `Bonne qualite globale (${okPct}% conformes). Quelques points d'attention a verifier.`
  if (score >= 60) return `Qualite moyenne (${okPct}% conformes). Des anomalies significatives necessitent correction.`
  if (score >= 40) return `Qualite insuffisante. ${parSeverite.BLOQUANT} bloquant(s) et ${parSeverite.MAJEUR} majeur(s) a corriger imperativement.`
  return `Balance non conforme. De nombreuses anomalies bloquantes necessitent une correction immediate avant tout depot.`
}

function buildAuditRecommendations(anomalies: ResultatControle[]): string[] {
  const recs: string[] = []
  const bloquants = anomalies.filter(a => a.severite === 'BLOQUANT')
  const majeurs = anomalies.filter(a => a.severite === 'MAJEUR')

  if (bloquants.length > 0) {
    recs.push(`Corriger en priorite les ${bloquants.length} anomalie(s) BLOQUANTE(S) : ${bloquants.map(b => b.ref).join(', ')}`)
  }
  if (majeurs.length > 0) {
    recs.push(`Traiter les ${majeurs.length} anomalie(s) MAJEURE(S) : ${majeurs.map(m => m.ref).join(', ')}`)
  }

  // Suggestions spécifiques par type de contrôle
  const refs = new Set(anomalies.map(a => a.ref))
  if (Array.from(refs).some(r => r.startsWith('S-'))) {
    recs.push('Verifier la structure du fichier balance (format, colonnes, encodage)')
  }
  if (Array.from(refs).some(r => r.startsWith('F-'))) {
    recs.push('Verifier les equilibres fondamentaux (total debit = total credit)')
  }
  if (Array.from(refs).some(r => r.startsWith('SS-'))) {
    recs.push('Verifier les sens de soldes anormaux (comptes debiteurs/crediteurs inverses)')
  }
  if (Array.from(refs).some(r => r.startsWith('IC-'))) {
    recs.push('Verifier les rapprochements inter-comptes (TVA, clients/fournisseurs)')
  }
  if (Array.from(refs).some(r => r.startsWith('FI-'))) {
    recs.push('Revoir les points fiscaux (IS, TVA, retenues) avant depot de la liasse')
  }

  if (recs.length === 0) {
    recs.push('Balance conforme — Vous pouvez proceder a la generation de la liasse fiscale')
  }

  return recs.slice(0, 6)
}

// ── General audit overview ──────────────────────────────────────────

export function handleAuditGeneral(): Proph3tResponse {
  ensureRegistered()

  const total = controlRegistry.size
  const active = controlRegistry.activeCount

  const byLevel: { niveau: number; label: string; count: number }[] = []
  for (let i = 0; i <= 8; i++) {
    const controls = controlRegistry.getByLevel(i as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)
    byLevel.push({ niveau: i, label: LEVEL_LABELS[i] || 'Inconnu', count: controls.length })
  }

  const levelsStr = byLevel.map(l => `- Niveau **${l.niveau}** (${l.label}) : **${l.count}** controles`).join('\n')

  // Summary card
  const entries = byLevel.filter(l => l.count > 0).slice(0, 5).map(l => {
    const controls = controlRegistry.getByLevel(l.niveau as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)
    const first = controls[0]?.definition
    return {
      ref: `NIV-${l.niveau}`,
      nom: l.label,
      niveau: l.niveau,
      description: `${l.count} controles actifs`,
      severite: first?.severiteDefaut || 'INFO',
      phase: first?.phase || 'PHASE_1',
    }
  })

  const card: AuditControlCard = {
    type: 'audit_control',
    controls: entries,
    summary: `${total} controles enregistres, ${active} actifs, 9 niveaux`,
  }

  return {
    text: `**Systeme d'Audit FiscaSync** — Vue d'ensemble\n\n**${total}** controles enregistres (${active} actifs) repartis en **9 niveaux** :\n\n${levelsStr}`,
    content: [card],
    suggestions: ['Niveau 0', 'Niveau 3', 'Niveau 7', 'Controle FI-003'],
  }
}
