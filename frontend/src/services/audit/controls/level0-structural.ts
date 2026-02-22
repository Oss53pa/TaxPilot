/**
 * Niveau 0 - Controles structurels a l'import (S-001 a S-010)
 * 10 controles BLOQUANTS/MINEURS verifiant l'integrite du fichier balance
 */

import { AuditContext, ResultatControle, NiveauControle } from '@/types/audit.types'
import { controlRegistry } from '../controlRegistry'

const NIVEAU: NiveauControle = 0

function ok(ref: string, nom: string, message: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'OK', severite: 'OK', message, timestamp: new Date().toISOString() }
}

function anomalie(
  ref: string, nom: string, severite: ResultatControle['severite'],
  message: string, details?: ResultatControle['details'],
  suggestion?: string, refRegl?: string
): ResultatControle {
  return {
    ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite, message,
    details, suggestion, referenceReglementaire: refRegl,
    timestamp: new Date().toISOString(),
  }
}

// S-001: Fichier lisible (balance non vide)
function S001(ctx: AuditContext): ResultatControle {
  const ref = 'S-001', nom = 'Fichier lisible'
  if (!ctx.balanceN || !Array.isArray(ctx.balanceN)) {
    return anomalie(ref, nom, 'BLOQUANT', 'La balance est absente ou illisible',
      undefined, 'Reimporter le fichier balance en format Excel (.xlsx) ou CSV')
  }
  if (ctx.balanceN.length === 0) {
    return anomalie(ref, nom, 'BLOQUANT', 'La balance ne contient aucune ligne',
      undefined, 'Reimporter un fichier balance contenant des donnees comptables')
  }
  return ok(ref, nom, `Balance lisible: ${ctx.balanceN.length} lignes`)
}

// S-002: Colonnes identifiees
function S002(ctx: AuditContext): ResultatControle {
  const ref = 'S-002', nom = 'Colonnes identifiees'
  if (!ctx.balanceN.length) return ok(ref, nom, 'Aucune donnee a verifier')
  const sample = ctx.balanceN[0]
  const hasCompte = 'compte' in sample
  const hasLibelle = 'intitule' in sample
  const hasDebit = 'debit' in sample
  const hasCredit = 'credit' in sample
  const missing: string[] = []
  if (!hasCompte) missing.push('compte')
  if (!hasLibelle) missing.push('intitule')
  if (!hasDebit) missing.push('debit')
  if (!hasCredit) missing.push('credit')
  if (missing.length > 0) {
    return anomalie(ref, nom, 'BLOQUANT', `Colonnes manquantes: ${missing.join(', ')}`,
      undefined, 'Verifier que le fichier contient les colonnes: Compte, Libelle, Debit, Credit')
  }
  return ok(ref, nom, 'Toutes les colonnes requises sont presentes')
}

// S-003: Numeros de compte valides
function S003(ctx: AuditContext): ResultatControle {
  const ref = 'S-003', nom = 'Numeros de compte valides'
  const total = ctx.balanceN.length
  const invalides: string[] = []
  for (const line of ctx.balanceN) {
    const c = (line.compte || '').toString().trim()
    if (!/^\d{2,12}$/.test(c)) {
      invalides.push(c || '(vide)')
    }
  }
  const pctValide = total > 0 ? ((total - invalides.length) / total) * 100 : 0
  if (pctValide < 80) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Seulement ${pctValide.toFixed(1)}% de comptes valides (seuil: 80%)`,
      { comptes: invalides.slice(0, 20) },
      'Verifier le format des numeros de compte (2 a 12 chiffres)')
  }
  if (invalides.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${invalides.length} compte(s) avec format non standard`,
      { comptes: invalides.slice(0, 10) },
      'Corriger les numeros de compte non standard (format attendu: 2 a 12 chiffres)')
  }
  return ok(ref, nom, `Tous les ${total} comptes ont un format valide`)
}

// S-004: Montants numeriques
function S004(ctx: AuditContext): ResultatControle {
  const ref = 'S-004', nom = 'Montants numeriques'
  const nonNumeriques: string[] = []
  for (const line of ctx.balanceN) {
    if (typeof line.debit !== 'number' || isNaN(line.debit) ||
        typeof line.credit !== 'number' || isNaN(line.credit)) {
      nonNumeriques.push(line.compte)
    }
  }
  if (nonNumeriques.length > 0) {
    return anomalie(ref, nom, 'BLOQUANT',
      `${nonNumeriques.length} ligne(s) avec montants non numeriques`,
      { comptes: nonNumeriques.slice(0, 10) },
      'Verifier que les colonnes debit et credit contiennent uniquement des montants numeriques')
  }
  return ok(ref, nom, 'Tous les montants sont numeriques')
}

// S-005: Fichier non vide (>=10 comptes)
function S005(ctx: AuditContext): ResultatControle {
  const ref = 'S-005', nom = 'Nombre minimum de lignes'
  if (ctx.balanceN.length < 10) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Seulement ${ctx.balanceN.length} comptes (minimum requis: 10)`,
      undefined,
      'Une balance standard contient au minimum 10 comptes')
  }
  return ok(ref, nom, `${ctx.balanceN.length} comptes dans la balance`)
}

// S-006: Pas de doublons de comptes
function S006(ctx: AuditContext): ResultatControle {
  const ref = 'S-006', nom = 'Pas de doublons'
  const comptesVus = new Map<string, number>()
  const doublons: string[] = []
  for (const line of ctx.balanceN) {
    const c = line.compte.toString().trim()
    const count = (comptesVus.get(c) || 0) + 1
    comptesVus.set(c, count)
    if (count === 2) doublons.push(c)
  }
  if (doublons.length > 0) {
    return anomalie(ref, nom, 'BLOQUANT',
      `${doublons.length} compte(s) en doublon detecte(s)`,
      { comptes: doublons.slice(0, 10) },
      'Fusionner ou supprimer les doublons avant audit')
  }
  return ok(ref, nom, 'Aucun doublon de compte detecte')
}

// S-007: Encodage correct (accents)
function S007(ctx: AuditContext): ResultatControle {
  const ref = 'S-007', nom = 'Encodage correct'
  const problemes: string[] = []
  for (const line of ctx.balanceN) {
    const lib = line.intitule || ''
    if (/[ï¿½Ã©Ã¨Ã ]|\\u00/.test(lib)) {
      problemes.push(line.compte)
    }
  }
  if (problemes.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${problemes.length} libelle(s) avec encodage suspect`,
      { comptes: problemes.slice(0, 5) },
      'Verifier l\'encodage UTF-8 du fichier source')
  }
  return ok(ref, nom, 'Encodage des libelles correct')
}

// S-008: Lignes de totaux exclues
function S008(ctx: AuditContext): ResultatControle {
  const ref = 'S-008', nom = 'Lignes de totaux'
  const totaux: string[] = []
  for (const line of ctx.balanceN) {
    const lib = (line.intitule || '').toUpperCase()
    if (/^(TOTAL|SOUS[- ]?TOTAL|S\/?TOTAL)/.test(lib) ||
        /^(CLASSE|SECTION)\s*\d/.test(lib)) {
      totaux.push(`${line.compte}: ${line.intitule}`)
    }
  }
  if (totaux.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${totaux.length} ligne(s) de totaux detectee(s)`,
      { comptes: totaux.slice(0, 5) },
      'Exclure les lignes de totaux pour eviter les doubles comptages')
  }
  return ok(ref, nom, 'Aucune ligne de totaux detectee')
}

// S-009: Balance N-1 presente
function S009(ctx: AuditContext): ResultatControle {
  const ref = 'S-009', nom = 'Balance N-1 presente'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return anomalie(ref, nom, 'MINEUR',
      'Balance N-1 non fournie - les controles comparatifs seront limites',
      undefined,
      'Fournir la balance N-1 pour activer les controles de variation')
  }
  return ok(ref, nom, `Balance N-1 presente: ${ctx.balanceN1.length} lignes`)
}

// S-010: Coherence entre fichiers N et N-1
function S010(ctx: AuditContext): ResultatControle {
  const ref = 'S-010', nom = 'Coherence N / N-1'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK',
      message: 'Balance N-1 absente, controle non applicable', timestamp: new Date().toISOString() }
  }
  const comptesN = new Set(ctx.balanceN.map((l) => l.compte.toString().trim()))
  const comptesN1 = new Set(ctx.balanceN1.map((l) => l.compte.toString().trim()))
  const dansNPasDansN1 = [...comptesN].filter((c) => !comptesN1.has(c))
  const dansN1PasDansN = [...comptesN1].filter((c) => !comptesN.has(c))
  const total = comptesN.size + comptesN1.size
  const communs = [...comptesN].filter((c) => comptesN1.has(c)).length
  const tauxCommun = total > 0 ? (communs * 2 / total) * 100 : 0

  if (tauxCommun < 50) {
    return anomalie(ref, nom, 'MAJEUR',
      `Seulement ${tauxCommun.toFixed(0)}% de comptes communs entre N et N-1`,
      { comptes: [...dansNPasDansN1.slice(0, 5), ...dansN1PasDansN.slice(0, 5)] },
      'Verifier que les fichiers N et N-1 correspondent a la meme entreprise')
  }
  if (dansNPasDansN1.length > 10 || dansN1PasDansN.length > 10) {
    return anomalie(ref, nom, 'MINEUR',
      `${dansNPasDansN1.length} nouveaux comptes en N, ${dansN1PasDansN.length} disparus`,
      { montants: { nouveauxN: dansNPasDansN1.length, disparusN1: dansN1PasDansN.length } },
      'Verifier la correspondance des plans de comptes entre les deux exercices')
  }
  return ok(ref, nom, `${tauxCommun.toFixed(0)}% de comptes communs entre N et N-1`)
}

// --- Enregistrement ---

export function registerLevel0Controls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['S-001', 'Fichier lisible', 'Verifie que la balance est lisible et non vide', 'BLOQUANT', S001],
    ['S-002', 'Colonnes identifiees', 'Verifie la presence des colonnes requises', 'BLOQUANT', S002],
    ['S-003', 'Numeros de compte valides', 'Verifie le format des numeros de compte', 'BLOQUANT', S003],
    ['S-004', 'Montants numeriques', 'Verifie que les montants sont numeriques', 'BLOQUANT', S004],
    ['S-005', 'Nombre minimum de lignes', 'Verifie au moins 10 comptes', 'BLOQUANT', S005],
    ['S-006', 'Pas de doublons', 'Verifie l\'absence de comptes en doublon', 'BLOQUANT', S006],
    ['S-007', 'Encodage correct', 'Verifie l\'encodage des caracteres', 'MINEUR', S007],
    ['S-008', 'Lignes de totaux', 'Detecte les lignes de totaux a exclure', 'MINEUR', S008],
    ['S-009', 'Balance N-1 presente', 'Verifie la presence de la balance N-1', 'MINEUR', S009],
    ['S-010', 'Coherence N / N-1', 'Verifie la coherence entre N et N-1', 'MAJEUR', S010],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_1', actif: true },
      fn
    )
  }
}
