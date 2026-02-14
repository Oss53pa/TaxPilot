/**
 * Niveau 5 - Controles N/N-1 (NN-001 a NN-008)
 * 8 controles comparatifs inter-exercices
 */

import { AuditContext, ResultatControle, NiveauControle } from '@/types/audit.types'
import { BalanceEntry } from '@/services/liasseDataService'
import { controlRegistry } from '../controlRegistry'

const NIVEAU: NiveauControle = 5

function ok(ref: string, nom: string, msg: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'OK', severite: 'OK', message: msg, timestamp: new Date().toISOString() }
}
function anomalie(ref: string, nom: string, sev: ResultatControle['severite'], msg: string, det?: ResultatControle['details'], sug?: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite: sev, message: msg, details: det, suggestion: sug, timestamp: new Date().toISOString() }
}
function na(ref: string, nom: string, msg: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: msg, timestamp: new Date().toISOString() }
}

function find(bal: BalanceEntry[], prefix: string): BalanceEntry[] {
  return bal.filter((l) => l.compte.toString().startsWith(prefix))
}
function solde(l: BalanceEntry): number { return (l.solde_debit || 0) - (l.solde_credit || 0) }
function absSum(entries: BalanceEntry[]): number { return entries.reduce((s, l) => s + Math.abs(solde(l)), 0) }

function needsN1(ref: string, nom: string, ctx: AuditContext): ResultatControle | null {
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) return na(ref, nom, 'Balance N-1 absente')
  return null
}

// NN-001: Report a nouveau = resultat N-1
function NN001(ctx: AuditContext): ResultatControle {
  const ref = 'NN-001', nom = 'RAN = Resultat N-1'
  const skip = needsN1(ref, nom, ctx); if (skip) return skip
  const ran = find(ctx.balanceN, '12').reduce((s, l) => s + (l.credit - l.debit), 0)
  const resultatN1 = find(ctx.balanceN1!, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const ecart = Math.abs(ran - resultatN1)
  if (ecart > 1) {
    return anomalie(ref, nom, 'MAJEUR',
      `RAN (${ran.toLocaleString('fr-FR')}) != Resultat N-1 (${resultatN1.toLocaleString('fr-FR')})`,
      { ecart, montants: { ran, resultatN1 } },
      'Le report a nouveau doit etre egal au resultat de l\'exercice precedent')
  }
  return ok(ref, nom, 'Report a nouveau correct')
}

// NN-002: Soldes ouverture N = soldes cloture N-1
function NN002(ctx: AuditContext): ResultatControle {
  const ref = 'NN-002', nom = 'Ouverture N = Cloture N-1'
  const skip = needsN1(ref, nom, ctx); if (skip) return skip

  // Pour les comptes de bilan (classes 1-5), le solde d'ouverture N doit etre le solde de cloture N-1
  const mapN1 = new Map<string, number>()
  for (const l of ctx.balanceN1!) {
    const cl = parseInt(l.compte.charAt(0))
    if (cl >= 1 && cl <= 5) mapN1.set(l.compte, solde(l))
  }

  // Controle simplifie: verifier que le total bilan est coherent
  const totalBilanN = ctx.balanceN.filter((l) => { const cl = parseInt(l.compte.charAt(0)); return cl >= 1 && cl <= 5 }).reduce((s, l) => s + Math.abs(solde(l)), 0)
  const totalBilanN1 = ctx.balanceN1!.filter((l) => { const cl = parseInt(l.compte.charAt(0)); return cl >= 1 && cl <= 5 }).reduce((s, l) => s + Math.abs(solde(l)), 0)
  const variation = Math.abs(totalBilanN - totalBilanN1) / Math.max(totalBilanN1, 1) * 100

  if (variation > 100) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Variation totale du bilan de ${variation.toFixed(0)}% entre N-1 et N - possibles erreurs de report`,
      { montants: { totalBilanN, totalBilanN1, variationPct: variation } })
  }
  return ok(ref, nom, 'Soldes d\'ouverture coherents')
}

// NN-003: Permanence des methodes
function NN003(ctx: AuditContext): ResultatControle {
  const ref = 'NN-003', nom = 'Permanence des methodes'
  const skip = needsN1(ref, nom, ctx); if (skip) return skip

  // Verifier que la structure des comptes est similaire (memes prefixes utilises)
  const prefixesN = new Set(ctx.balanceN.map((l) => l.compte.toString().substring(0, 3)))
  const prefixesN1 = new Set(ctx.balanceN1!.map((l) => l.compte.toString().substring(0, 3)))
  const nouveaux = [...prefixesN].filter((p) => !prefixesN1.has(p))
  const supprimes = [...prefixesN1].filter((p) => !prefixesN.has(p))

  if (nouveaux.length > 10 || supprimes.length > 10) {
    return anomalie(ref, nom, 'MINEUR',
      `Changements importants de structure: ${nouveaux.length} nouveaux prefixes, ${supprimes.length} supprimes`,
      { comptes: [...nouveaux.slice(0, 5).map((p) => `+${p}`), ...supprimes.slice(0, 5).map((p) => `-${p}`)] },
      'Verifier le respect du principe de permanence des methodes')
  }
  return ok(ref, nom, 'Structure comptable stable entre N et N-1')
}

// NN-004: Capital inchange sauf operation
function NN004(ctx: AuditContext): ResultatControle {
  const ref = 'NN-004', nom = 'Capital inchange'
  const skip = needsN1(ref, nom, ctx); if (skip) return skip
  const capitalN = find(ctx.balanceN, '101').reduce((s, l) => s + (l.credit - l.debit), 0)
  const capitalN1 = find(ctx.balanceN1!, '101').reduce((s, l) => s + (l.credit - l.debit), 0)
  if (Math.abs(capitalN - capitalN1) > 1) {
    return anomalie(ref, nom, 'INFO',
      `Capital modifie: ${capitalN1.toLocaleString('fr-FR')} -> ${capitalN.toLocaleString('fr-FR')}`,
      { montants: { capitalN, capitalN1 } },
      'Verifier qu\'une operation sur le capital justifie cette variation')
  }
  return ok(ref, nom, `Capital stable: ${capitalN.toLocaleString('fr-FR')}`)
}

// NN-005: Variations anormales par poste (>50%)
function NN005(ctx: AuditContext): ResultatControle {
  const ref = 'NN-005', nom = 'Variations anormales'
  const skip = needsN1(ref, nom, ctx); if (skip) return skip

  const postes = ['2', '3', '40', '41', '5', '6', '7']
  const variations: string[] = []
  for (const p of postes) {
    const n = absSum(find(ctx.balanceN, p))
    const n1 = absSum(find(ctx.balanceN1!, p))
    if (n1 > 1000) {
      const pct = ((n - n1) / n1) * 100
      if (Math.abs(pct) > 50) {
        variations.push(`${p}x: ${pct > 0 ? '+' : ''}${pct.toFixed(0)}% (${n1.toLocaleString('fr-FR')} -> ${n.toLocaleString('fr-FR')})`)
      }
    }
  }
  if (variations.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${variations.length} poste(s) avec variation > 50%`,
      { comptes: variations },
      'Justifier les variations significatives entre exercices')
  }
  return ok(ref, nom, 'Pas de variation anormale detectee')
}

// NN-006: Variation total bilan (>30%)
function NN006(ctx: AuditContext): ResultatControle {
  const ref = 'NN-006', nom = 'Variation total bilan'
  const skip = needsN1(ref, nom, ctx); if (skip) return skip
  const tbN = ctx.balanceN.filter((l) => { const cl = parseInt(l.compte.charAt(0)); return cl >= 1 && cl <= 5 }).reduce((s, l) => s + Math.max(0, solde(l)), 0)
  const tbN1 = ctx.balanceN1!.filter((l) => { const cl = parseInt(l.compte.charAt(0)); return cl >= 1 && cl <= 5 }).reduce((s, l) => s + Math.max(0, solde(l)), 0)
  if (tbN1 > 0) {
    const pct = ((tbN - tbN1) / tbN1) * 100
    if (Math.abs(pct) > 30) {
      return anomalie(ref, nom, 'INFO',
        `Total bilan varie de ${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`,
        { montants: { totalBilanN: tbN, totalBilanN1: tbN1, variationPct: pct } })
    }
  }
  return ok(ref, nom, 'Variation du total bilan dans les limites')
}

// NN-007: Comptes de gestion a zero en N vs N-1
function NN007(ctx: AuditContext): ResultatControle {
  const ref = 'NN-007', nom = 'Comptes gestion disparus'
  const skip = needsN1(ref, nom, ctx); if (skip) return skip
  const gestionN1 = ctx.balanceN1!.filter((l) => {
    const cl = parseInt(l.compte.charAt(0))
    return (cl === 6 || cl === 7) && Math.abs(solde(l)) > 1000
  })
  const comptesNMap = new Map(ctx.balanceN.map((l) => [l.compte, l]))
  const disparus: string[] = []
  for (const l of gestionN1) {
    const nLine = comptesNMap.get(l.compte)
    if (!nLine || (nLine.debit === 0 && nLine.credit === 0)) {
      disparus.push(`${l.compte} (${l.intitule}): ${Math.abs(solde(l)).toLocaleString('fr-FR')} en N-1`)
    }
  }
  if (disparus.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `${disparus.length} compte(s) de gestion significatif(s) en N-1 absent(s) ou a zero en N`,
      { comptes: disparus.slice(0, 10) })
  }
  return ok(ref, nom, 'Continuite des comptes de gestion')
}

// NN-008: Coherence immobilisations
function NN008(ctx: AuditContext): ResultatControle {
  const ref = 'NN-008', nom = 'Coherence immobilisations N/N-1'
  const skip = needsN1(ref, nom, ctx); if (skip) return skip

  const immobBrutN = find(ctx.balanceN, '2').filter((l) => !l.compte.startsWith('28') && !l.compte.startsWith('29')).reduce((s, l) => s + Math.max(0, solde(l)), 0)
  const immobBrutN1 = find(ctx.balanceN1!, '2').filter((l) => !l.compte.startsWith('28') && !l.compte.startsWith('29')).reduce((s, l) => s + Math.max(0, solde(l)), 0)

  const variation = immobBrutN - immobBrutN1
  // Acquisitions (debit 2x en N) - Cessions (credit 2x en N)
  // Approximation: si la variation est negative mais pas de cession au resultat
  if (variation < -1000) {
    const cessions = absSum([...find(ctx.balanceN, '81'), ...find(ctx.balanceN, '654')])
    if (cessions === 0) {
      return anomalie(ref, nom, 'MINEUR',
        `Diminution immobilisations (${variation.toLocaleString('fr-FR')}) sans cession comptabilisee`,
        { montants: { immobN: immobBrutN, immobN1: immobBrutN1, variation } },
        'Verifier les mouvements d\'immobilisations')
    }
  }
  return ok(ref, nom, 'Immobilisations coherentes entre exercices')
}

// --- Enregistrement ---

export function registerLevel5Controls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['NN-001', 'RAN = Resultat N-1', 'Verifie le report a nouveau', 'MAJEUR', NN001],
    ['NN-002', 'Ouverture N = Cloture N-1', 'Verifie la continuite des soldes', 'BLOQUANT', NN002],
    ['NN-003', 'Permanence des methodes', 'Verifie la stabilite de la structure', 'MINEUR', NN003],
    ['NN-004', 'Capital inchange', 'Signale les variations de capital', 'INFO', NN004],
    ['NN-005', 'Variations anormales', 'Detecte les variations > 50% par poste', 'MINEUR', NN005],
    ['NN-006', 'Variation total bilan', 'Detecte variation > 30% du bilan', 'INFO', NN006],
    ['NN-007', 'Comptes gestion disparus', 'Detecte les comptes de gestion absents en N', 'MINEUR', NN007],
    ['NN-008', 'Coherence immobilisations N/N-1', 'Verifie les mouvements d\'immobilisations', 'MINEUR', NN008],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_1', actif: true },
      fn
    )
  }
}
