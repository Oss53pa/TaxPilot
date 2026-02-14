/**
 * Knowledge — Audit & Controles
 */

import { controlRegistry } from '@/services/audit/controlRegistry'
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
import type { Proph3tResponse, AuditControlCard } from '../types'

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
