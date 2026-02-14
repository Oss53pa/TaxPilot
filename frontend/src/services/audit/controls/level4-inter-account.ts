/**
 * Niveau 4 - Controles inter-comptes (IC-001 a IC-019)
 * 19 controles verifiant la coherence entre comptes lies
 */

import { AuditContext, ResultatControle, NiveauControle } from '@/types/audit.types'
import { BalanceEntry } from '@/services/liasseDataService'
import { controlRegistry } from '../controlRegistry'

const NIVEAU: NiveauControle = 4

function ok(ref: string, nom: string, msg: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'OK', severite: 'OK', message: msg, timestamp: new Date().toISOString() }
}

function anomalie(
  ref: string, nom: string, sev: ResultatControle['severite'], msg: string,
  det?: ResultatControle['details'], sug?: string, refR?: string
): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite: sev, message: msg,
    details: det, suggestion: sug, referenceReglementaire: refR,
    timestamp: new Date().toISOString() }
}

function na(ref: string, nom: string, msg: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: msg, timestamp: new Date().toISOString() }
}

function find(bal: BalanceEntry[], prefix: string): BalanceEntry[] {
  return bal.filter((l) => l.compte.toString().startsWith(prefix))
}
function solde(l: BalanceEntry): number { return (l.solde_debit || 0) - (l.solde_credit || 0) }
function absSum(entries: BalanceEntry[]): number { return entries.reduce((s, l) => s + Math.abs(solde(l)), 0) }

// IC-001: Amortissements <= valeur brute (28x <= 2x)
function IC001(ctx: AuditContext): ResultatControle {
  const ref = 'IC-001', nom = 'Amortissements <= valeur brute'
  // Pour chaque sous-classe 2x, verifier que 28x <= 2x
  const anomalies: string[] = []
  for (let i = 0; i <= 9; i++) {
    const brut = find(ctx.balanceN, `2${i}`).filter((l) => !l.compte.startsWith('28') && !l.compte.startsWith('29'))
    const amort = find(ctx.balanceN, `28${i}`)
    if (brut.length > 0 && amort.length > 0) {
      const valBrut = brut.reduce((s, l) => s + Math.abs(solde(l)), 0)
      const valAmort = amort.reduce((s, l) => s + Math.abs(solde(l)), 0)
      if (valAmort > valBrut + 1) {
        anomalies.push(`Classe 2${i}: Amort(${valAmort.toLocaleString('fr-FR')}) > Brut(${valBrut.toLocaleString('fr-FR')})`)
      }
    }
  }
  if (anomalies.length > 0) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Amortissements depassant la valeur brute`,
      { comptes: anomalies, ecart: anomalies.length },
      'Les amortissements cumules ne peuvent depasser la valeur brute d\'acquisition',
      'Art. 45 Acte Uniforme OHADA')
  }
  return ok(ref, nom, 'Amortissements coherents avec les valeurs brutes')
}

// IC-002: Immobilisation sans amortissement
function IC002(ctx: AuditContext): ResultatControle {
  const ref = 'IC-002', nom = 'Immobilisation sans amortissement'
  const amortissables = ['21', '23', '24', '245']
  const sansAmort: string[] = []
  for (const prefix of amortissables) {
    const immob = find(ctx.balanceN, prefix).filter((l) => !l.compte.startsWith('28') && !l.compte.startsWith('29') && solde(l) > 0)
    if (immob.length > 0) {
      const amortPrefix = '28' + prefix.substring(1)
      const amort = find(ctx.balanceN, amortPrefix)
      if (amort.length === 0) {
        sansAmort.push(`${prefix}x (${immob.length} comptes, pas d'amortissement ${amortPrefix}x)`)
      }
    }
  }
  if (sansAmort.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Immobilisations sans amortissement correspondant`,
      { comptes: sansAmort },
      'Verifier que les dotations aux amortissements sont bien comptabilisees')
  }
  return ok(ref, nom, 'Toutes les immobilisations ont des amortissements')
}

// IC-003: Amortissement sans immobilisation
function IC003(ctx: AuditContext): ResultatControle {
  const ref = 'IC-003', nom = 'Amortissement sans immobilisation'
  const orphelins: string[] = []
  const amort28 = find(ctx.balanceN, '28')
  for (const a of amort28) {
    const immobPrefix = '2' + a.compte.substring(2)
    const immob = ctx.balanceN.find((l) => l.compte.startsWith(immobPrefix.substring(0, 3)) && !l.compte.startsWith('28') && !l.compte.startsWith('29'))
    if (!immob && Math.abs(solde(a)) > 0) {
      orphelins.push(`${a.compte}: ${Math.abs(solde(a)).toLocaleString('fr-FR')}`)
    }
  }
  if (orphelins.length > 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `${orphelins.length} amortissement(s) sans immobilisation correspondante`,
      { comptes: orphelins.slice(0, 10) },
      'Amortissements orphelins a regulariser')
  }
  return ok(ref, nom, 'Tous les amortissements ont une immobilisation')
}

// IC-004: Dotation coherente avec variation amortissements
function IC004(ctx: AuditContext): ResultatControle {
  const ref = 'IC-004', nom = 'Dotation vs variation amortissements'
  const dot681 = absSum(find(ctx.balanceN, '681'))
  const dot682 = absSum(find(ctx.balanceN, '682'))
  const totalDotations = dot681 + dot682
  if (totalDotations === 0 && absSum(find(ctx.balanceN, '28')) > 0) {
    return anomalie(ref, nom, 'MINEUR',
      'Amortissements au bilan sans dotation au resultat (681/682)',
      { montants: { dotations: 0, amortissementsBilan: absSum(find(ctx.balanceN, '28')) } },
      'Verifier que les dotations aux amortissements sont comptabilisees')
  }
  return ok(ref, nom, `Dotations amortissements: ${totalDotations.toLocaleString('fr-FR')}`)
}

// IC-005: Depreciation <= valeur brute (29x/39x/49x)
function IC005(ctx: AuditContext): ResultatControle {
  const ref = 'IC-005', nom = 'Depreciations <= valeur brute'
  const checks = [
    { deprec: '29', brut: '2', label: 'Immobilisations' },
    { deprec: '39', brut: '3', label: 'Stocks' },
    { deprec: '49', brut: '4', label: 'Tiers' },
  ]
  const problemes: string[] = []
  for (const { deprec, brut, label } of checks) {
    const valBrut = find(ctx.balanceN, brut).filter((l) => !l.compte.startsWith('28') && !l.compte.startsWith('29') && !l.compte.startsWith('39') && !l.compte.startsWith('49')).reduce((s, l) => s + Math.abs(solde(l)), 0)
    const valDeprec = find(ctx.balanceN, deprec).reduce((s, l) => s + Math.abs(solde(l)), 0)
    if (valDeprec > valBrut + 1 && valBrut > 0) {
      problemes.push(`${label}: Deprec(${valDeprec.toLocaleString('fr-FR')}) > Brut(${valBrut.toLocaleString('fr-FR')})`)
    }
  }
  if (problemes.length > 0) {
    return anomalie(ref, nom, 'BLOQUANT',
      'Depreciations depassant la valeur brute',
      { comptes: problemes })
  }
  return ok(ref, nom, 'Depreciations coherentes')
}

// IC-006: Dotation provisions coherente
function IC006(ctx: AuditContext): ResultatControle {
  const ref = 'IC-006', nom = 'Dotation provisions coherente'
  const dot691 = absSum(find(ctx.balanceN, '691'))
  const dot697 = absSum(find(ctx.balanceN, '697'))
  const prov = absSum(find(ctx.balanceN, '19'))
  if ((dot691 + dot697) === 0 && prov > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Provisions au bilan (${prov.toLocaleString('fr-FR')}) sans dotation (691/697)`,
      { montants: { provisions: prov, dotations: 0 } })
  }
  return ok(ref, nom, 'Dotations provisions coherentes')
}

// IC-007: Provision > 10% total bilan
function IC007(ctx: AuditContext): ResultatControle {
  const ref = 'IC-007', nom = 'Provisions elevees'
  const prov = absSum(find(ctx.balanceN, '19'))
  const tb = ctx.balanceN.filter((l) => { const cl = parseInt(l.compte.charAt(0)); return cl >= 1 && cl <= 5 }).reduce((s, l) => s + Math.abs(solde(l)), 0) / 2
  if (tb > 0 && prov > tb * 0.10) {
    return anomalie(ref, nom, 'INFO',
      `Provisions (${prov.toLocaleString('fr-FR')}) > 10% du bilan (${tb.toLocaleString('fr-FR')})`,
      { montants: { provisions: prov, totalBilan: tb, ratio: (prov / tb * 100) } })
  }
  return ok(ref, nom, 'Provisions dans les limites')
}

// IC-008: Variation stocks coherente
function IC008(ctx: AuditContext): ResultatControle {
  const ref = 'IC-008', nom = 'Variation stocks coherente'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) return na(ref, nom, 'Balance N-1 absente')
  const stocksN = absSum(find(ctx.balanceN, '3'))
  const stocksN1 = absSum(find(ctx.balanceN1, '3'))
  const variationBilan = stocksN - stocksN1
  const var603 = find(ctx.balanceN, '603').reduce((s, l) => s + (l.debit - l.credit), 0)
  const ecart = Math.abs(variationBilan + var603) // 603 est en sens inverse
  if (ecart > Math.max(Math.abs(variationBilan) * 0.1, 10000)) {
    return anomalie(ref, nom, 'MAJEUR',
      `Variation stocks bilan (${variationBilan.toLocaleString('fr-FR')}) incoherente avec compte 603 (${var603.toLocaleString('fr-FR')})`,
      { ecart, montants: { variationBilan, variation603: var603 } },
      'La variation de stocks au bilan doit correspondre au compte 603 du resultat')
  }
  return ok(ref, nom, 'Variation stocks coherente')
}

// IC-009: Charges personnel vs dettes sociales
function IC009(ctx: AuditContext): ResultatControle {
  const ref = 'IC-009', nom = 'Personnel vs dettes sociales'
  const chargesPerso = absSum(find(ctx.balanceN, '66'))
  const dettesSociales = absSum(find(ctx.balanceN, '42'))
  if (chargesPerso > 0 && dettesSociales === 0) {
    return anomalie(ref, nom, 'INFO',
      `Charges de personnel (${chargesPerso.toLocaleString('fr-FR')}) sans dettes sociales (42x)`,
      { montants: { chargesPersonnel: chargesPerso } },
      'En general, des charges de personnel impliquent des dettes sociales')
  }
  return ok(ref, nom, 'Coherence charges personnel / dettes sociales')
}

// IC-010: CA non nul mais pas de creances
function IC010(ctx: AuditContext): ResultatControle {
  const ref = 'IC-010', nom = 'CA vs creances clients'
  const ca = absSum(find(ctx.balanceN, '70'))
  const creances = absSum(find(ctx.balanceN, '411'))
  if (ca > 0 && creances === 0) {
    return anomalie(ref, nom, 'INFO',
      `CA de ${ca.toLocaleString('fr-FR')} sans creances clients (411x)`,
      { montants: { chiffreAffaires: ca } },
      'Un CA significatif implique generalement des creances clients en cours')
  }
  return ok(ref, nom, 'CA et creances clients coherents')
}

// IC-011: Achats sans dettes fournisseurs
function IC011(ctx: AuditContext): ResultatControle {
  const ref = 'IC-011', nom = 'Achats vs dettes fournisseurs'
  const achats = absSum([...find(ctx.balanceN, '601'), ...find(ctx.balanceN, '602')])
  const fournisseurs = absSum(find(ctx.balanceN, '401'))
  if (achats > 0 && fournisseurs === 0) {
    return anomalie(ref, nom, 'INFO',
      `Achats de ${achats.toLocaleString('fr-FR')} sans dettes fournisseurs (401x)`,
      { montants: { achats } })
  }
  return ok(ref, nom, 'Achats et dettes fournisseurs coherents')
}

// IC-012: Interets vs emprunts
function IC012(ctx: AuditContext): ResultatControle {
  const ref = 'IC-012', nom = 'Interets vs emprunts'
  const interets = absSum(find(ctx.balanceN, '67'))
  const emprunts = absSum(find(ctx.balanceN, '16'))
  if (interets > 0 && emprunts === 0) {
    return anomalie(ref, nom, 'INFO',
      `Charges financieres (${interets.toLocaleString('fr-FR')}) sans emprunts (16x)`,
      { montants: { chargesFinancieres: interets } })
  }
  return ok(ref, nom, 'Interets et emprunts coherents')
}

// IC-013: Dotations amortissements vs immobilisations
function IC013(ctx: AuditContext): ResultatControle {
  const ref = 'IC-013', nom = 'Dotations vs immobilisations'
  const dotations = absSum([...find(ctx.balanceN, '681'), ...find(ctx.balanceN, '682')])
  const immob = find(ctx.balanceN, '2').filter((l) => !l.compte.startsWith('28') && !l.compte.startsWith('29')).reduce((s, l) => s + Math.max(0, solde(l)), 0)
  if (immob > 0 && dotations === 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Immobilisations (${immob.toLocaleString('fr-FR')}) sans dotations (681/682)`,
      { montants: { immobilisations: immob, dotations: 0 } })
  }
  if (immob > 0 && dotations > immob * 0.5) {
    return anomalie(ref, nom, 'INFO',
      `Dotations (${dotations.toLocaleString('fr-FR')}) > 50% des immobilisations (${immob.toLocaleString('fr-FR')})`,
      { montants: { immobilisations: immob, dotations } })
  }
  return ok(ref, nom, 'Dotations et immobilisations coherentes')
}

// IC-014: Impot vs resultat beneficiaire
function IC014(ctx: AuditContext): ResultatControle {
  const ref = 'IC-014', nom = 'Impot vs resultat'
  const resultat = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const impot = absSum(find(ctx.balanceN, '89'))
  if (resultat > 0 && impot === 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Resultat beneficiaire (${resultat.toLocaleString('fr-FR')}) sans impot (89x)`,
      { montants: { resultat } },
      'Un resultat beneficiaire doit normalement donner lieu a un impot')
  }
  return ok(ref, nom, 'Coherence resultat / impot')
}

// IC-015: TVA collectee vs CA
function IC015(ctx: AuditContext): ResultatControle {
  const ref = 'IC-015', nom = 'TVA collectee vs CA'
  const ca = absSum(find(ctx.balanceN, '70'))
  const tvaCollectee = absSum(find(ctx.balanceN, '443'))
  if (ca > 0 && tvaCollectee === 0) {
    return anomalie(ref, nom, 'MINEUR',
      `CA de ${ca.toLocaleString('fr-FR')} sans TVA collectee (443x)`,
      { montants: { ca, tvaCollectee: 0 } },
      'Verifier le regime de TVA')
  }
  if (ca > 0 && tvaCollectee > 0) {
    const ratio = (tvaCollectee / ca) * 100
    if (ratio > 25 || ratio < 10) {
      return anomalie(ref, nom, 'INFO',
        `Ratio TVA/CA atypique: ${ratio.toFixed(1)}%`,
        { montants: { ca, tvaCollectee, ratioPct: ratio } })
    }
  }
  return ok(ref, nom, 'TVA collectee coherente avec le CA')
}

// IC-016: TVA deductible vs achats
function IC016(ctx: AuditContext): ResultatControle {
  const ref = 'IC-016', nom = 'TVA deductible vs achats'
  const achats = absSum([...find(ctx.balanceN, '60'), ...find(ctx.balanceN, '61'), ...find(ctx.balanceN, '62')])
  const tvaDed = absSum(find(ctx.balanceN, '445'))
  if (achats > 0 && tvaDed === 0) {
    return anomalie(ref, nom, 'INFO',
      `Achats/services (${achats.toLocaleString('fr-FR')}) sans TVA deductible (445x)`,
      { montants: { achats, tvaDeductible: 0 } })
  }
  return ok(ref, nom, 'TVA deductible coherente')
}

// IC-017: Effets a recevoir vs clients
function IC017(ctx: AuditContext): ResultatControle {
  const ref = 'IC-017', nom = 'Effets a recevoir vs clients'
  const effets = absSum(find(ctx.balanceN, '412'))
  const clients = absSum(find(ctx.balanceN, '411'))
  if (effets > 0 && clients === 0) {
    return anomalie(ref, nom, 'INFO',
      `Effets a recevoir (${effets.toLocaleString('fr-FR')}) sans clients (411x)`,
      { montants: { effetsRecevoir: effets } })
  }
  return ok(ref, nom, 'Effets et clients coherents')
}

// IC-018: Effets a payer vs fournisseurs
function IC018(ctx: AuditContext): ResultatControle {
  const ref = 'IC-018', nom = 'Effets a payer vs fournisseurs'
  const effets = absSum(find(ctx.balanceN, '402'))
  const fournisseurs = absSum(find(ctx.balanceN, '401'))
  if (effets > 0 && fournisseurs === 0) {
    return anomalie(ref, nom, 'INFO',
      `Effets a payer (${effets.toLocaleString('fr-FR')}) sans fournisseurs (401x)`,
      { montants: { effetsPayer: effets } })
  }
  return ok(ref, nom, 'Effets et fournisseurs coherents')
}

// IC-019: Subventions bilan vs produits
function IC019(ctx: AuditContext): ResultatControle {
  const ref = 'IC-019', nom = 'Subventions bilan vs produits'
  const subvBilan = absSum(find(ctx.balanceN, '14'))
  const subvProduit = absSum(find(ctx.balanceN, '71'))
  if (subvBilan > 0 && subvProduit === 0) {
    return anomalie(ref, nom, 'INFO',
      `Subventions au bilan (${subvBilan.toLocaleString('fr-FR')}) sans reprise au resultat (71x)`,
      { montants: { subventionsBilan: subvBilan } },
      'Les subventions d\'investissement doivent etre reprises au resultat')
  }
  return ok(ref, nom, 'Subventions bilan et produits coherents')
}

// --- Enregistrement ---

export function registerLevel4Controls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['IC-001', 'Amortissements <= valeur brute', 'Verifie 28x <= 2x', 'BLOQUANT', IC001],
    ['IC-002', 'Immobilisation sans amortissement', 'Detecte immo sans amort', 'MINEUR', IC002],
    ['IC-003', 'Amortissement sans immobilisation', 'Detecte amort orphelins', 'MAJEUR', IC003],
    ['IC-004', 'Dotation vs variation amortissements', 'Coherence dotation/variation', 'MINEUR', IC004],
    ['IC-005', 'Depreciations <= valeur brute', 'Verifie 29x/39x/49x <= brut', 'BLOQUANT', IC005],
    ['IC-006', 'Dotation provisions coherente', 'Coherence dot. prov.', 'MINEUR', IC006],
    ['IC-007', 'Provisions elevees', 'Signale prov > 10% bilan', 'INFO', IC007],
    ['IC-008', 'Variation stocks coherente', 'Coherence stocks bilan vs 603', 'MAJEUR', IC008],
    ['IC-009', 'Personnel vs dettes sociales', 'Charges 66x vs dettes 42x', 'INFO', IC009],
    ['IC-010', 'CA vs creances clients', 'CA sans creances', 'INFO', IC010],
    ['IC-011', 'Achats vs dettes fournisseurs', 'Achats sans fournisseurs', 'INFO', IC011],
    ['IC-012', 'Interets vs emprunts', 'Charges fin. sans emprunts', 'INFO', IC012],
    ['IC-013', 'Dotations vs immobilisations', 'Coherence dot/immo', 'MINEUR', IC013],
    ['IC-014', 'Impot vs resultat', 'Resultat beneficiaire sans impot', 'MINEUR', IC014],
    ['IC-015', 'TVA collectee vs CA', 'Coherence TVA/CA', 'MINEUR', IC015],
    ['IC-016', 'TVA deductible vs achats', 'Coherence TVA ded./achats', 'INFO', IC016],
    ['IC-017', 'Effets a recevoir vs clients', 'Coherence effets/clients', 'INFO', IC017],
    ['IC-018', 'Effets a payer vs fournisseurs', 'Coherence effets/fournisseurs', 'INFO', IC018],
    ['IC-019', 'Subventions bilan vs produits', 'Coherence subv. bilan/resultat', 'INFO', IC019],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_1', actif: true },
      fn
    )
  }
}
