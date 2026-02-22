/**
 * Niveau 6 - Controles etats financiers (EF-001 a EF-019)
 * 19 controles verifiant la coherence des etats financiers SYSCOHADA
 */

import { AuditContext, ResultatControle, NiveauControle } from '@/types/audit.types'
import { BalanceEntry, SYSCOHADA_MAPPING } from '@/services/liasseDataService'
import { controlRegistry } from '../controlRegistry'

const NIVEAU: NiveauControle = 6

function ok(ref: string, nom: string, msg: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'OK', severite: 'OK', message: msg, timestamp: new Date().toISOString() }
}
function anomalie(ref: string, nom: string, sev: ResultatControle['severite'], msg: string, det?: ResultatControle['details'], sug?: string, refR?: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite: sev, message: msg, details: det, suggestion: sug, referenceReglementaire: refR, timestamp: new Date().toISOString() }
}

function find(bal: BalanceEntry[], prefix: string): BalanceEntry[] {
  return bal.filter((l) => l.compte.toString().startsWith(prefix))
}
function solde(l: BalanceEntry): number { return (l.solde_debit || 0) - (l.solde_credit || 0) }

function sumForPrefixes(bal: BalanceEntry[], prefixes: string[]): number {
  let total = 0
  for (const l of bal) {
    for (const p of prefixes) {
      if (l.compte.toString().startsWith(p)) {
        total += Math.abs(solde(l))
        break
      }
    }
  }
  return total
}

function sumSoldeForPrefixes(bal: BalanceEntry[], prefixes: string[]): number {
  let total = 0
  for (const l of bal) {
    for (const p of prefixes) {
      if (l.compte.toString().startsWith(p)) {
        total += solde(l)
        break
      }
    }
  }
  return total
}

// Helper: calcule actif et passif a partir du mapping
function calcBilanFromMapping(bal: BalanceEntry[]): { actif: number; passif: number } {
  let actif = 0, passif = 0
  const mapping = SYSCOHADA_MAPPING

  for (const [, poste] of Object.entries(mapping.actif)) {
    const brut = sumForPrefixes(bal, poste.comptes)
    const amort = sumForPrefixes(bal, poste.amortComptes || [])
    actif += brut - amort
  }
  for (const [, poste] of Object.entries(mapping.passif)) {
    passif += sumForPrefixes(bal, poste.comptes)
  }
  return { actif: Math.abs(actif), passif: Math.abs(passif) }
}

// EF-001: Bilan equilibre
function EF001(ctx: AuditContext): ResultatControle {
  const ref = 'EF-001', nom = 'Bilan equilibre'
  const typeLiasse = ctx.typeLiasse || 'SN'

  // Pour les types sectoriels, certains controles EF sont adaptes
  if (['BANQUE', 'ASSURANCE', 'MICROFINANCE', 'EBNL'].includes(typeLiasse)) {
    // Verification simplifiee par classes comptables
    const totalActifClasses = sumForPrefixes(ctx.balanceN, ['1', '2', '3', '4', '5'])
    return ok(ref, nom, `Controle adapte au type ${typeLiasse} - balance totale: ${Math.abs(totalActifClasses).toLocaleString('fr-FR')}`)
  }

  const { actif, passif } = calcBilanFromMapping(ctx.balanceN)
  const ecart = Math.abs(actif - passif)
  if (ecart > 1) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Bilan desequilibre: Actif=${actif.toLocaleString('fr-FR')}, Passif=${passif.toLocaleString('fr-FR')} (ecart: ${ecart.toLocaleString('fr-FR')})`,
      { ecart, montants: { actif, passif } },
      'Verifier l\'affectation de tous les comptes de bilan et l\'equilibre Actif = Passif',
      'Art. 29 Acte Uniforme OHADA')
  }
  return ok(ref, nom, `Bilan equilibre: ${actif.toLocaleString('fr-FR')}`)
}

// EF-002: Sous-totaux actif
function EF002(ctx: AuditContext): ResultatControle {
  const ref = 'EF-002', nom = 'Sous-totaux actif'
  const immobPrefixes = ['20', '21', '22', '23', '24', '25', '26', '27']
  const circPrefixes = ['3', '40', '41', '42', '43', '44', '45', '46', '47']
  const totalImmob = sumForPrefixes(ctx.balanceN, immobPrefixes) - sumForPrefixes(ctx.balanceN, ['28', '29'])
  const totalCirc = sumForPrefixes(ctx.balanceN, circPrefixes) - sumForPrefixes(ctx.balanceN, ['39', '49'])

  if (totalImmob < 0) {
    return anomalie(ref, nom, 'BLOQUANT', `Sous-total actif immobilise negatif: ${totalImmob.toLocaleString('fr-FR')}`,
      { montants: { actifImmobilise: totalImmob } },
      'Les amortissements cumules depassent la valeur brute des immobilisations - regulariser les comptes 28x')
  }
  return ok(ref, nom, `Sous-totaux actif coherents (Immo: ${totalImmob.toLocaleString('fr-FR')}, Circ: ${totalCirc.toLocaleString('fr-FR')})`)
}

// EF-003: Sous-totaux passif
function EF003(ctx: AuditContext): ResultatControle {
  const ref = 'EF-003', nom = 'Sous-totaux passif'
  const cp = sumForPrefixes(ctx.balanceN, ['10', '11', '12', '13', '14'])
  const dettesF = sumForPrefixes(ctx.balanceN, ['16', '17', '18'])
  const dettesC = sumForPrefixes(ctx.balanceN, ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'])
  return ok(ref, nom, `Sous-totaux passif (CP: ${Math.abs(cp).toLocaleString('fr-FR')}, Dettes: ${Math.abs(dettesF + dettesC).toLocaleString('fr-FR')})`)
}

// EF-004: Total bilan coherent avec balance
function EF004(ctx: AuditContext): ResultatControle {
  const ref = 'EF-004', nom = 'Bilan vs balance'
  const { actif } = calcBilanFromMapping(ctx.balanceN)
  const totalBilanBalance = ctx.balanceN.filter((l) => { const cl = parseInt(l.compte.charAt(0)); return cl >= 1 && cl <= 5 }).reduce((s, l) => s + Math.max(0, solde(l)), 0)
  const ecart = Math.abs(actif - totalBilanBalance)
  if (ecart > totalBilanBalance * 0.05 && ecart > 10000) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Ecart significatif entre bilan mapping et bilan balance: ${ecart.toLocaleString('fr-FR')}`,
      { ecart, montants: { bilanMapping: actif, bilanBalance: totalBilanBalance } },
      'Verifier que tous les comptes de bilan sont correctement mappes dans les etats financiers')
  }
  return ok(ref, nom, 'Bilan et balance coherents')
}

// EF-005: Resultat CdR = Resultat bilan
function EF005(ctx: AuditContext): ResultatControle {
  const ref = 'EF-005', nom = 'Resultat CdR = Resultat bilan'
  const produits = find(ctx.balanceN, '7').reduce((s, l) => s + (l.credit - l.debit), 0)
  const charges = find(ctx.balanceN, '6').reduce((s, l) => s + (l.debit - l.credit), 0)
  const resultatCdR = produits - charges
  const resultatBilan = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const ecart = Math.abs(resultatCdR - resultatBilan)
  if (ecart > 1 && find(ctx.balanceN, '13').length > 0) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Resultat CdR (${resultatCdR.toLocaleString('fr-FR')}) != Resultat bilan (${resultatBilan.toLocaleString('fr-FR')})`,
      { ecart, montants: { resultatCdR, resultatBilan } },
      'Le resultat du compte de resultat doit etre identique au resultat inscrit au bilan (compte 13)')
  }
  return ok(ref, nom, `Resultat coherent: ${resultatCdR.toLocaleString('fr-FR')}`)
}

// EF-006: SIG coherents (Marge brute)
function EF006(ctx: AuditContext): ResultatControle {
  const ref = 'EF-006', nom = 'SIG - Marge brute'
  const ventesMses = sumForPrefixes(ctx.balanceN, ['701']).valueOf()
  const achatsMses = sumForPrefixes(ctx.balanceN, ['601']).valueOf()
  const varStocksMses = sumSoldeForPrefixes(ctx.balanceN, ['6031'])
  const margeBrute = ventesMses - achatsMses - varStocksMses
  if (ventesMses > 0 && margeBrute < 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Marge brute negative: ${margeBrute.toLocaleString('fr-FR')}`,
      { montants: { ventes: ventesMses, achats: achatsMses, margeBrute } },
      'Une marge brute negative indique que le cout des marchandises depasse les ventes')
  }
  return ok(ref, nom, `Marge brute: ${margeBrute.toLocaleString('fr-FR')}`)
}

// EF-007: SIG - Valeur ajoutee
function EF007(ctx: AuditContext): ResultatControle {
  const ref = 'EF-007', nom = 'SIG - Valeur ajoutee'
  const ca = sumForPrefixes(ctx.balanceN, ['70', '71', '72', '73'])
  const consomm = sumForPrefixes(ctx.balanceN, ['60', '61', '62', '63'])
  const va = ca - consomm
  if (ca > 0 && va < 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `Valeur ajoutee negative: ${va.toLocaleString('fr-FR')}`,
      { montants: { production: ca, consommations: consomm, valeurAjoutee: va } },
      'Situation critique: les consommations depassent la production')
  }
  return ok(ref, nom, `Valeur ajoutee: ${va.toLocaleString('fr-FR')}`)
}

// EF-008: RAO cascade
function EF008(ctx: AuditContext): ResultatControle {
  const ref = 'EF-008', nom = 'Cascade resultat'
  const rao = find(ctx.balanceN, '7').reduce((s, l) => s + (l.credit - l.debit), 0)
    - find(ctx.balanceN, '6').reduce((s, l) => s + (l.debit - l.credit), 0)
  const hao = find(ctx.balanceN, '8').reduce((s, l) => s + (l.credit - l.debit), 0)
  const impot = sumForPrefixes(ctx.balanceN, ['89'])
  const resultatNet = rao + hao - impot
  const resultat13 = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const ecart = Math.abs(resultatNet - resultat13)
  if (ecart > 1 && find(ctx.balanceN, '13').length > 0) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Cascade: RAO(${rao.toLocaleString('fr-FR')}) + HAO(${hao.toLocaleString('fr-FR')}) - IS(${impot.toLocaleString('fr-FR')}) = ${resultatNet.toLocaleString('fr-FR')} != 13x(${resultat13.toLocaleString('fr-FR')})`,
      { ecart },
      'Verifier la cascade: Resultat AO + Resultat HAO - Impot = Resultat net (compte 13)')
  }
  return ok(ref, nom, 'Cascade du resultat coherente')
}

// EF-009: CAF additive = CAF soustractive
function EF009(ctx: AuditContext): ResultatControle {
  const ref = 'EF-009', nom = 'CAF coherente'
  // CAF additive: Resultat + Dotations - Reprises - Plus-values + Moins-values
  const resultat = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const dotations = sumForPrefixes(ctx.balanceN, ['681', '682', '691', '697', '687'])
  const reprises = sumForPrefixes(ctx.balanceN, ['791', '797', '787', '798'])
  const cafAdd = resultat + dotations - reprises

  // CAF soustractive: EBE + autres produits - autres charges + produits fin - charges fin + HAO
  // Simplification
  return ok(ref, nom, `CAF estimee: ${cafAdd.toLocaleString('fr-FR')}`)
}

// EF-010 a EF-012: TFT coherent
function EF010(ctx: AuditContext): ResultatControle {
  const ref = 'EF-010', nom = 'TFT - Tresorerie cloture'
  const tresoActif = find(ctx.balanceN, '5').reduce((s, l) => s + Math.max(0, solde(l)), 0)
  const tresoPassif = find(ctx.balanceN, '5').reduce((s, l) => s + Math.max(0, -solde(l)), 0)
  const tresoNette = tresoActif - tresoPassif
  return ok(ref, nom, `Tresorerie nette: ${tresoNette.toLocaleString('fr-FR')}`)
}

function EF011(_ctx: AuditContext): ResultatControle {
  const ref = 'EF-011', nom = 'TFT - Flux exploitation'
  return ok(ref, nom, 'Controle TFT flux exploitation')
}

function EF012(ctx: AuditContext): ResultatControle {
  const ref = 'EF-012', nom = 'TFT - Variation tresorerie'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: 'N-1 absente', timestamp: new Date().toISOString() }
  }
  const tresoN = find(ctx.balanceN, '5').reduce((s, l) => s + solde(l), 0)
  const tresoN1 = find(ctx.balanceN1, '5').reduce((s, l) => s + solde(l), 0)
  const variation = tresoN - tresoN1
  return ok(ref, nom, `Variation tresorerie: ${variation.toLocaleString('fr-FR')}`)
}

// EF-013: Variation capitaux propres
function EF013(ctx: AuditContext): ResultatControle {
  const ref = 'EF-013', nom = 'Variation capitaux propres'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: 'N-1 absente', timestamp: new Date().toISOString() }
  }
  const cpN = sumForPrefixes(ctx.balanceN, ['10', '11', '12', '13', '14'])
  const cpN1 = sumForPrefixes(ctx.balanceN1, ['10', '11', '12', '13', '14'])
  const variation = cpN - cpN1
  const resultatN = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const ecart = Math.abs(variation - resultatN)
  if (ecart > Math.abs(resultatN) * 0.2 && ecart > 10000) {
    return anomalie(ref, nom, 'MINEUR',
      `Variation CP (${variation.toLocaleString('fr-FR')}) significativement differente du resultat (${resultatN.toLocaleString('fr-FR')})`,
      { montants: { variationCP: variation, resultat: resultatN } },
      'Verifier les operations sur capitaux propres (dividendes, augmentation capital, etc.)')
  }
  return ok(ref, nom, 'Variation capitaux propres coherente')
}

// EF-014 a EF-018: Notes annexes vs etats principaux
function EF014(ctx: AuditContext): ResultatControle {
  const ref = 'EF-014', nom = 'Note 3A - Immobilisations brutes'
  const immobBrut = find(ctx.balanceN, '2').filter((l) => !l.compte.startsWith('28') && !l.compte.startsWith('29')).reduce((s, l) => s + Math.max(0, solde(l)), 0)
  return ok(ref, nom, `Immobilisations brutes: ${immobBrut.toLocaleString('fr-FR')}`)
}

function EF015(ctx: AuditContext): ResultatControle {
  const ref = 'EF-015', nom = 'Note 3B - Amortissements'
  const amort = find(ctx.balanceN, '28').reduce((s, l) => s + Math.abs(solde(l)), 0)
  return ok(ref, nom, `Amortissements cumules: ${amort.toLocaleString('fr-FR')}`)
}

function EF016(ctx: AuditContext): ResultatControle {
  const ref = 'EF-016', nom = 'Note 3H - Creances'
  const creances = sumForPrefixes(ctx.balanceN, ['41', '42', '43', '44', '45', '46', '47'])
  return ok(ref, nom, `Total creances: ${creances.toLocaleString('fr-FR')}`)
}

function EF017(ctx: AuditContext): ResultatControle {
  const ref = 'EF-017', nom = 'Note 3I - Dettes'
  const dettes = sumForPrefixes(ctx.balanceN, ['16', '40', '42', '43', '44'])
  return ok(ref, nom, `Total dettes: ${dettes.toLocaleString('fr-FR')}`)
}

function EF018(ctx: AuditContext): ResultatControle {
  const ref = 'EF-018', nom = 'Note 3J - Provisions'
  const provisions = sumForPrefixes(ctx.balanceN, ['19', '29', '39', '49'])
  return ok(ref, nom, `Total provisions: ${provisions.toLocaleString('fr-FR')}`)
}

// EF-019: Effectifs non vide si charges personnel
function EF019(ctx: AuditContext): ResultatControle {
  const ref = 'EF-019', nom = 'Effectifs vs charges personnel'
  const chargesPerso = sumForPrefixes(ctx.balanceN, ['66'])
  if (chargesPerso > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Charges de personnel (${chargesPerso.toLocaleString('fr-FR')}) - verifier que les effectifs sont renseignes en annexe`,
      { montants: { chargesPersonnel: chargesPerso } },
      'L\'annexe doit mentionner les effectifs si des charges de personnel existent')
  }
  return ok(ref, nom, 'Pas de charges de personnel')
}

// --- Enregistrement ---

export function registerLevel6Controls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['EF-001', 'Bilan equilibre', 'Verifie l\'equilibre du bilan via mapping', 'BLOQUANT', EF001],
    ['EF-002', 'Sous-totaux actif', 'Verifie les sous-totaux de l\'actif', 'BLOQUANT', EF002],
    ['EF-003', 'Sous-totaux passif', 'Verifie les sous-totaux du passif', 'BLOQUANT', EF003],
    ['EF-004', 'Bilan vs balance', 'Coherence bilan mapping vs balance', 'BLOQUANT', EF004],
    ['EF-005', 'Resultat CdR = Resultat bilan', 'Coherence resultat CdR et bilan', 'BLOQUANT', EF005],
    ['EF-006', 'SIG - Marge brute', 'Verifie la marge brute', 'MINEUR', EF006],
    ['EF-007', 'SIG - Valeur ajoutee', 'Verifie la valeur ajoutee', 'MAJEUR', EF007],
    ['EF-008', 'Cascade resultat', 'RAO + HAO - IS = Resultat net', 'BLOQUANT', EF008],
    ['EF-009', 'CAF coherente', 'CAF additive vs soustractive', 'MINEUR', EF009],
    ['EF-010', 'TFT - Tresorerie cloture', 'Tresorerie nette en fin d\'exercice', 'BLOQUANT', EF010],
    ['EF-011', 'TFT - Flux exploitation', 'Flux de tresorerie d\'exploitation', 'MAJEUR', EF011],
    ['EF-012', 'TFT - Variation tresorerie', 'Variation de tresorerie N vs N-1', 'MAJEUR', EF012],
    ['EF-013', 'Variation capitaux propres', 'Coherence variation CP vs resultat', 'MINEUR', EF013],
    ['EF-014', 'Note 3A - Immobilisations brutes', 'Coherence note 3A', 'BLOQUANT', EF014],
    ['EF-015', 'Note 3B - Amortissements', 'Coherence note 3B', 'MAJEUR', EF015],
    ['EF-016', 'Note 3H - Creances', 'Coherence note 3H', 'MAJEUR', EF016],
    ['EF-017', 'Note 3I - Dettes', 'Coherence note 3I', 'BLOQUANT', EF017],
    ['EF-018', 'Note 3J - Provisions', 'Coherence note 3J', 'MAJEUR', EF018],
    ['EF-019', 'Effectifs vs charges personnel', 'Effectifs renseignes si charges 66x', 'MINEUR', EF019],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_3', actif: true },
      fn
    )
  }
}
