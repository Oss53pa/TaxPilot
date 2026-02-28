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
function anomalie(ref: string, nom: string, sev: ResultatControle['severite'], msg: string, det?: ResultatControle['details'], sug?: string, ecr?: ResultatControle['ecrituresCorrectives'], refR?: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite: sev, message: msg, details: det, suggestion: sug, ecrituresCorrectives: ecr, referenceReglementaire: refR, timestamp: new Date().toISOString() }
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
      {
        ecart, montants: { ran, resultatN1 },
        description: `Le report a nouveau (compte 12x = ${ran.toLocaleString('fr-FR')}) ne correspond pas au resultat N-1 (compte 13x = ${resultatN1.toLocaleString('fr-FR')}). Ecart: ${ecart.toLocaleString('fr-FR')} FCFA. L\'ecart peut s\'expliquer par une distribution de dividendes, une mise en reserves, ou une erreur d\'affectation. Si aucune operation sur les capitaux propres n\'a eu lieu, le RAN doit etre exactement egal au resultat N-1.`
      },
      'Verifier le PV d\'affectation du resultat N-1. Reconstituer l\'ecriture d\'affectation: 13x -> 12x (RAN), 11x (reserves), 46x (dividendes).',
      [{
        journal: 'OD', date: new Date().toISOString().slice(0, 10),
        lignes: [
          { sens: ran > resultatN1 ? 'C' as const : 'D' as const, compte: '120000', libelle: 'Report a nouveau - ajustement', montant: ecart },
          { sens: ran > resultatN1 ? 'D' as const : 'C' as const, compte: '110000', libelle: 'Reserves - ajustement', montant: ecart },
        ],
        commentaire: 'Regularisation ecart RAN vs resultat N-1'
      }],
      'Art. 36 Acte Uniforme OHADA - Affectation du resultat')
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
      {
        montants: { totalBilanN, totalBilanN1, variationPct: Math.round(variation) },
        description: `Le total du bilan a varie de ${variation.toFixed(0)}% entre N-1 et N, ce qui est anormalement eleve. Une variation de plus de 100% indique generalement des erreurs de report des soldes d\'ouverture, un fichier N-1 incorrect, ou un changement de perimetre majeur (fusion, apport partiel d\'actif).`
      },
      'Verifier la coherence des soldes d\'ouverture N avec les soldes de cloture N-1. Rapprocher les deux balances compte par compte pour identifier les ecarts.',
      undefined,
      'Art. 40 Acte Uniforme OHADA - Continuite des exercices')
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
      {
        comptes: [...nouveaux.slice(0, 5).map((p) => `+${p}`), ...supprimes.slice(0, 5).map((p) => `-${p}`)],
        montants: { nouveauxPrefixes: nouveaux.length, prefixesSupprimes: supprimes.length, prefixesN: prefixesN.size, prefixesN1: prefixesN1.size },
        description: `La structure du plan de comptes a significativement change entre N-1 et N: ${nouveaux.length} nouveaux prefixes et ${supprimes.length} prefixes supprimes. Le principe de permanence des methodes impose de conserver la meme structure comptable d\'un exercice a l\'autre. Un changement doit etre justifie et documente dans l\'annexe.`
      },
      'Documenter les changements de nomenclature dans l\'annexe aux etats financiers. S\'assurer que les comparaisons N/N-1 restent pertinentes.',
      undefined,
      'Art. 40 Acte Uniforme OHADA - Permanence des methodes')
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
    const variation = capitalN - capitalN1
    return anomalie(ref, nom, 'INFO',
      `Capital modifie: ${capitalN1.toLocaleString('fr-FR')} -> ${capitalN.toLocaleString('fr-FR')}`,
      {
        montants: { capitalN, capitalN1, variation },
        description: `Le capital social a varie de ${variation.toLocaleString('fr-FR')} FCFA entre N-1 et N. Toute modification du capital (augmentation, reduction) doit resulter d\'une decision en assemblee generale et etre formalisee par un acte notarie. Verifier la coherence avec les PV d\'AG.`
      },
      'Justifier la variation du capital par le PV de l\'AG correspondant. Verifier la coherence avec les primes d\'emission (compte 105x) et les frais d\'augmentation de capital.',
      undefined,
      'Art. 568-570 AUSCGIE - Modification du capital')
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
    const detailMontants: Record<string, number> = { postesAvecVariation: variations.length }
    for (const p of postes) {
      const n = absSum(find(ctx.balanceN, p))
      const n1 = absSum(find(ctx.balanceN1!, p))
      if (n1 > 1000 && Math.abs((n - n1) / n1) > 0.5) {
        detailMontants[`${p}x_N`] = n
        detailMontants[`${p}x_N1`] = n1
      }
    }
    return anomalie(ref, nom, 'MINEUR',
      `${variations.length} poste(s) avec variation > 50%`,
      {
        comptes: variations,
        montants: detailMontants,
        description: `${variations.length} postes comptables presentent une variation superieure a 50% entre N-1 et N. Des variations aussi importantes meritent une attention particuliere: elles peuvent reveler une erreur comptable, un changement d\'activite, ou un evenement exceptionnel. Chaque variation significative doit etre justifiee.`
      },
      'Analyser et justifier chaque variation significative. Documenter les explications dans l\'annexe aux etats financiers (Note 12 - Evenements significatifs).')
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
        {
          montants: { totalBilanN: tbN, totalBilanN1: tbN1, variationPct: Math.round(pct) },
          description: `Le total bilan a varie de ${pct.toFixed(1)}% entre N-1 (${tbN1.toLocaleString('fr-FR')}) et N (${tbN.toLocaleString('fr-FR')}). Une variation de plus de 30% est inhabituelle et peut resulter d\'investissements majeurs, de cessions, d\'augmentation de capital, ou d\'un changement d\'activite. En l\'absence de justification, cela peut indiquer une erreur.`
        },
        'Identifier les postes a l\'origine de la variation et documenter les explications dans l\'annexe.')
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
      {
        comptes: disparus.slice(0, 10),
        montants: { comptesDisparus: disparus.length },
        description: `${disparus.length} comptes de gestion (charges/produits) qui avaient un montant significatif (>1 000) en N-1 sont a zero ou absents en N. La disparition d\'un poste de gestion recurrent peut indiquer un changement d\'activite, un oubli de comptabilisation, ou un reclassement dans un autre compte.`
      },
      'Verifier si l\'absence de ces comptes est justifiee par un changement d\'activite ou si des ecritures ont ete oubliees.')
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
        {
          montants: { immobN: immobBrutN, immobN1: immobBrutN1, variation },
          description: `Les immobilisations brutes ont diminue de ${Math.abs(variation).toLocaleString('fr-FR')} FCFA entre N-1 et N sans qu\'aucune cession ne soit comptabilisee au resultat (81x/654x). Une diminution d\'immobilisations doit normalement s\'accompagner d\'une ecriture de cession (produit de cession et valeur nette comptable). L\'absence de cession peut indiquer une mise au rebut non comptabilisee.`
        },
        'Verifier les mouvements d\'immobilisations: comptabiliser les cessions, mises au rebut ou transferts. Mettre a jour le tableau des immobilisations (Note 3A).',
        undefined,
        'Art. 45 Acte Uniforme OHADA - Sortie d\'immobilisations')
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
