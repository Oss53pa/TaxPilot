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
function anomalie(ref: string, nom: string, sev: ResultatControle['severite'], msg: string, det?: ResultatControle['details'], sug?: string, ecr?: ResultatControle['ecrituresCorrectives'], refR?: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite: sev, message: msg, details: det, suggestion: sug, ecrituresCorrectives: ecr, referenceReglementaire: refR, timestamp: new Date().toISOString() }
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
      {
        ecart, montants: { actif, passif },
        description: `Le bilan genere a partir du mapping SYSCOHADA est desequilibre de ${ecart.toLocaleString('fr-FR')} FCFA. L\'actif (${actif.toLocaleString('fr-FR')}) ne correspond pas au passif (${passif.toLocaleString('fr-FR')}). Cela peut provenir de comptes non mappes, d\'un mapping incorrect, ou d\'un desequilibre dans la balance source.`
      },
      'Verifier que tous les comptes de bilan sont correctement affectes dans le mapping. Identifier les comptes non mappes (controle C-006) et les erreurs d\'affectation actif/passif.',
      undefined,
      'Art. 29 Acte Uniforme OHADA - Equilibre du bilan')
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
    const brutImmo = sumForPrefixes(ctx.balanceN, immobPrefixes)
    const amortImmo = sumForPrefixes(ctx.balanceN, ['28', '29'])
    return anomalie(ref, nom, 'BLOQUANT', `Sous-total actif immobilise negatif: ${totalImmob.toLocaleString('fr-FR')}`,
      {
        montants: { actifImmobilise: totalImmob, immobilisationsBrutes: brutImmo, amortissements: amortImmo, actifCirculant: totalCirc },
        description: `L\'actif immobilise net est negatif (${totalImmob.toLocaleString('fr-FR')} FCFA), ce qui signifie que les amortissements cumules (${amortImmo.toLocaleString('fr-FR')}) depassent la valeur brute des immobilisations (${brutImmo.toLocaleString('fr-FR')}). C\'est comptablement impossible et indique des amortissements non soldes apres cession d\'immobilisations.`
      },
      'Solder les amortissements des immobilisations cedees ou mises au rebut. Verifier les plans d\'amortissement pour chaque categorie d\'immobilisation.',
      undefined,
      'Art. 45 Acte Uniforme OHADA')
  }
  return ok(ref, nom, `Sous-totaux actif coherents (Immo: ${totalImmob.toLocaleString('fr-FR')}, Circ: ${totalCirc.toLocaleString('fr-FR')})`)
}

// EF-003: Sous-totaux passif
function EF003(ctx: AuditContext): ResultatControle {
  const ref = 'EF-003', nom = 'Sous-totaux passif'
  const cp = sumForPrefixes(ctx.balanceN, ['10', '11', '12', '13', '14'])
  const dettesF = sumForPrefixes(ctx.balanceN, ['16', '17', '18'])
  const dettesC = sumForPrefixes(ctx.balanceN, ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'])

  if (cp < 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `Capitaux propres negatifs dans les etats financiers: ${cp.toLocaleString('fr-FR')}`,
      {
        montants: { capitauxPropres: cp, dettesFinancieres: dettesF, dettesCourantes: dettesC },
        description: `Les capitaux propres consolides (comptes 10-14) sont negatifs a ${cp.toLocaleString('fr-FR')} FCFA dans la presentation des etats financiers. L\'entreprise est en situation de fonds propres negatifs, ce qui implique des obligations legales de regularisation.`
      },
      'Regulariser les capitaux propres par augmentation de capital, incorporation de comptes courants, ou abandon de creances.',
      undefined,
      'Art. 664 AUSCGIE')
  }
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
      {
        ecart, montants: { bilanMapping: actif, bilanBalance: totalBilanBalance },
        description: `L\'ecart de ${ecart.toLocaleString('fr-FR')} FCFA entre le bilan issu du mapping (${actif.toLocaleString('fr-FR')}) et la balance brute (${totalBilanBalance.toLocaleString('fr-FR')}) depasse 5%. Des comptes de bilan ne sont pas correctement affectes dans le mapping SYSCOHADA, ce qui produira des etats financiers incomplets.`
      },
      'Identifier les comptes non mappes (voir controle C-006) et completer le mapping. Verifier que les amortissements et depreciations sont correctement affectes.',
      undefined,
      'Art. 29 Acte Uniforme OHADA')
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
      {
        ecart, montants: { resultatCdR, resultatBilan, produits, charges },
        description: `Le resultat calcule a partir du compte de resultat (produits ${produits.toLocaleString('fr-FR')} - charges ${charges.toLocaleString('fr-FR')} = ${resultatCdR.toLocaleString('fr-FR')}) differe du resultat inscrit au bilan (compte 13x = ${resultatBilan.toLocaleString('fr-FR')}). Les deux montants doivent etre strictement identiques. L\'ecart indique une incoherence dans les ecritures de cloture.`
      },
      'Verifier les ecritures de determination du resultat. Le solde du compte 13x doit correspondre exactement a la difference entre les produits (classe 7) et les charges (classe 6).',
      [{
        journal: 'OD', date: new Date().toISOString().slice(0, 10),
        lignes: resultatCdR > resultatBilan
          ? [
            { sens: 'D' as const, compte: '120000', libelle: 'Report a nouveau - ajustement', montant: ecart },
            { sens: 'C' as const, compte: '130000', libelle: 'Resultat - correction', montant: ecart },
          ]
          : [
            { sens: 'D' as const, compte: '130000', libelle: 'Resultat - correction', montant: ecart },
            { sens: 'C' as const, compte: '120000', libelle: 'Report a nouveau - ajustement', montant: ecart },
          ],
        commentaire: 'Correction ecart resultat CdR vs bilan'
      }],
      'Art. 34 Acte Uniforme OHADA')
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
      {
        montants: { ventes: ventesMses, achats: achatsMses, variationStocks: varStocksMses, margeBrute },
        description: `La marge brute sur marchandises est negative (${margeBrute.toLocaleString('fr-FR')} FCFA). Le cout des marchandises vendues (achats ${achatsMses.toLocaleString('fr-FR')} + variation stocks ${varStocksMses.toLocaleString('fr-FR')}) depasse les ventes de marchandises (${ventesMses.toLocaleString('fr-FR')}). Cela peut indiquer des ventes a perte, une erreur de valorisation des stocks, ou un probleme de classification comptable.`
      },
      'Verifier la coherence entre ventes (701x), achats (601x) et variation de stocks (6031x). S\'assurer que les comptes de charges et de produits sont correctement classes.',
      undefined,
      'Art. 30-32 Acte Uniforme OHADA - SIG')
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
      {
        montants: { production: ca, consommations: consomm, valeurAjoutee: va },
        description: `La valeur ajoutee est negative (${va.toLocaleString('fr-FR')} FCFA): les consommations intermediaires (${consomm.toLocaleString('fr-FR')}) depassent la production (${ca.toLocaleString('fr-FR')}). L\'entreprise consomme plus de richesse qu\'elle n\'en cree. C\'est une situation critique qui remet en cause la viabilite du modele economique.`
      },
      'Analyser la structure des couts: identifier les postes de consommation excessifs (achats, services exterieurs). Evaluer la politique de prix et la pertinence du modele economique.',
      undefined,
      'Art. 30-32 Acte Uniforme OHADA - SIG')
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
      {
        ecart,
        montants: { resultatAO: rao, resultatHAO: hao, impotSocietes: impot, resultatNetCalcule: resultatNet, resultatComptabilise: resultat13 },
        description: `La cascade du resultat n\'est pas coherente: Resultat AO (${rao.toLocaleString('fr-FR')}) + Resultat HAO (${hao.toLocaleString('fr-FR')}) - IS (${impot.toLocaleString('fr-FR')}) = ${resultatNet.toLocaleString('fr-FR')}, mais le compte 13x affiche ${resultat13.toLocaleString('fr-FR')}. L\'ecart de ${ecart.toLocaleString('fr-FR')} FCFA indique une erreur dans la determination du resultat.`
      },
      'Reconstituer la cascade du resultat etape par etape. Verifier les ecritures d\'IS et les operations HAO. S\'assurer que le compte 13x reflette le resultat net final.',
      undefined,
      'Art. 32 Acte Uniforme OHADA - Determination du resultat')
  }
  return ok(ref, nom, 'Cascade du resultat coherente')
}

// EF-009: CAF additive = CAF soustractive
function EF009(ctx: AuditContext): ResultatControle {
  const ref = 'EF-009', nom = 'CAF coherente'
  // CAF additive: Resultat + Dotations - Reprises + VNC cessions - Produits cessions
  const resultat = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const dotations = sumForPrefixes(ctx.balanceN, ['681', '682', '691', '697', '687'])
  const reprises = sumForPrefixes(ctx.balanceN, ['791', '797', '787', '798'])
  const vncCessions = sumForPrefixes(ctx.balanceN, ['81'])
  const produitsCessions = sumForPrefixes(ctx.balanceN, ['82'])
  const cafAdd = resultat + dotations - reprises + vncCessions - produitsCessions

  // CAF soustractive: EBE + transferts de charges + autres produits - autres charges + produits financiers - charges financieres + HAO net
  const ca = sumForPrefixes(ctx.balanceN, ['70', '71', '72', '73'])
  const consommations = sumForPrefixes(ctx.balanceN, ['60', '61', '62'])
  const va = ca - consommations
  const chargesPerso = sumForPrefixes(ctx.balanceN, ['66'])
  const impots = sumForPrefixes(ctx.balanceN, ['64'])
  const ebe = va - chargesPerso - impots
  const autresProduits = sumForPrefixes(ctx.balanceN, ['75', '77', '78'])
  const autresCharges = sumForPrefixes(ctx.balanceN, ['65', '67', '68'])
  const haoNet = sumForPrefixes(ctx.balanceN, ['84', '86', '88']) - sumForPrefixes(ctx.balanceN, ['83', '85', '87'])
  const isNet = sumForPrefixes(ctx.balanceN, ['89'])
  const cafSoustr = ebe + autresProduits - autresCharges - haoNet - isNet

  const ecart = Math.abs(cafAdd - cafSoustr)

  if (ecart > Math.max(Math.abs(cafAdd) * 0.05, 10000) && find(ctx.balanceN, '13').length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `CAF additive (${cafAdd.toLocaleString('fr-FR')}) != CAF soustractive (${cafSoustr.toLocaleString('fr-FR')})`,
      {
        ecart,
        montants: { cafAdditive: cafAdd, cafSoustractive: cafSoustr, resultat, dotations, reprises, ebe },
        description: `L\'ecart de ${ecart.toLocaleString('fr-FR')} FCFA entre la CAF additive (resultat + dotations - reprises = ${cafAdd.toLocaleString('fr-FR')}) et la CAF soustractive (a partir de l\'EBE = ${cafSoustr.toLocaleString('fr-FR')}) indique une incoherence dans la classification des charges et produits calcules vs decaisses.`
      },
      'Verifier la classification des charges et produits entre elements calcules (dotations, reprises) et decaisses. Les deux methodes de calcul de la CAF doivent donner le meme resultat.',
      undefined,
      'Art. 32 Acte Uniforme OHADA - TFT')
  }
  return ok(ref, nom, `CAF coherente: ${cafAdd.toLocaleString('fr-FR')} (additive) / ${cafSoustr.toLocaleString('fr-FR')} (soustractive)`)
}

// EF-010: TFT - Tresorerie cloture
function EF010(ctx: AuditContext): ResultatControle {
  const ref = 'EF-010', nom = 'TFT - Tresorerie cloture'
  const tresoActif = find(ctx.balanceN, '5').reduce((s, l) => s + Math.max(0, solde(l)), 0)
  const tresoPassif = find(ctx.balanceN, '5').reduce((s, l) => s + Math.max(0, -solde(l)), 0)
  const tresoNette = tresoActif - tresoPassif

  if (tresoNette < 0) {
    return anomalie(ref, nom, 'INFO',
      `Tresorerie nette negative a la cloture: ${tresoNette.toLocaleString('fr-FR')}`,
      {
        montants: { tresoNette, tresoActif, tresoPassif },
        description: `La tresorerie nette de cloture est negative (${tresoNette.toLocaleString('fr-FR')} FCFA). La tresorerie-actif (${tresoActif.toLocaleString('fr-FR')}) est inferieure a la tresorerie-passif (${tresoPassif.toLocaleString('fr-FR')}), ce qui indique une dependance aux concours bancaires courants.`
      },
      'Analyser les causes de la tresorerie negative: BFR excessif, insuffisance du fonds de roulement, ou investissements non finances.',
      undefined,
      'Art. 32 Acte Uniforme OHADA - TFT')
  }
  return ok(ref, nom, `Tresorerie nette: ${tresoNette.toLocaleString('fr-FR')}`)
}

// EF-011: TFT - Flux exploitation
function EF011(ctx: AuditContext): ResultatControle {
  const ref = 'EF-011', nom = 'TFT - Flux exploitation'
  // Estimation simplifiee des flux d'exploitation: CAF - variation BFR
  const resultat = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const dotations = sumForPrefixes(ctx.balanceN, ['681', '682', '691', '697'])
  const reprises = sumForPrefixes(ctx.balanceN, ['791', '797'])
  const cafEstimee = resultat + dotations - reprises

  if (cafEstimee < 0 && resultat > 0) {
    return anomalie(ref, nom, 'INFO',
      `CAF negative (${cafEstimee.toLocaleString('fr-FR')}) malgre un resultat positif (${resultat.toLocaleString('fr-FR')})`,
      {
        montants: { cafEstimee, resultat, dotations, reprises },
        description: `La capacite d\'autofinancement estimee est negative (${cafEstimee.toLocaleString('fr-FR')}) alors que le resultat est positif (${resultat.toLocaleString('fr-FR')}). Les reprises sur provisions/depreciations (${reprises.toLocaleString('fr-FR')}) depassent les dotations (${dotations.toLocaleString('fr-FR')}), ce qui gonfle le resultat sans generer de tresorerie.`
      },
      'Analyser l\'impact des reprises de provisions sur le resultat. S\'assurer que la tresorerie d\'exploitation couvre les besoins courants.',
      undefined,
      'Art. 32 Acte Uniforme OHADA - TFT')
  }
  return ok(ref, nom, `CAF estimee: ${cafEstimee.toLocaleString('fr-FR')}`)
}

// EF-012: TFT - Variation tresorerie
function EF012(ctx: AuditContext): ResultatControle {
  const ref = 'EF-012', nom = 'TFT - Variation tresorerie'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: 'N-1 absente', timestamp: new Date().toISOString() }
  }
  const tresoN = find(ctx.balanceN, '5').reduce((s, l) => s + solde(l), 0)
  const tresoN1 = find(ctx.balanceN1, '5').reduce((s, l) => s + solde(l), 0)
  const variation = tresoN - tresoN1
  const pctVar = tresoN1 !== 0 ? (variation / Math.abs(tresoN1)) * 100 : 0

  if (Math.abs(pctVar) > 50 && Math.abs(variation) > 10000) {
    return anomalie(ref, nom, 'INFO',
      `Variation de tresorerie significative: ${variation > 0 ? '+' : ''}${variation.toLocaleString('fr-FR')} (${pctVar > 0 ? '+' : ''}${pctVar.toFixed(0)}%)`,
      {
        montants: { tresoN, tresoN1, variation, variationPct: Math.round(pctVar) },
        description: `La tresorerie a varie de ${pctVar.toFixed(0)}% entre N-1 (${tresoN1.toLocaleString('fr-FR')}) et N (${tresoN.toLocaleString('fr-FR')}). Une variation de plus de 50% merite une analyse: flux d\'exploitation, investissements, financement.`
      },
      'Analyser l\'origine de la variation de tresorerie dans le TFT: flux d\'exploitation, flux d\'investissement, flux de financement.')
  }
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
      {
        montants: { variationCP: variation, resultat: resultatN, cpN, cpN1 },
        description: `La variation des capitaux propres (${variation.toLocaleString('fr-FR')} = CP N ${cpN.toLocaleString('fr-FR')} - CP N-1 ${cpN1.toLocaleString('fr-FR')}) differe significativement du resultat de l\'exercice (${resultatN.toLocaleString('fr-FR')}). L\'ecart de ${ecart.toLocaleString('fr-FR')} peut s\'expliquer par des dividendes distribues, une augmentation/reduction de capital, ou des mouvements de reserves.`
      },
      'Identifier les operations ayant affecte les capitaux propres en dehors du resultat: dividendes, augmentation de capital, incorporation de reserves, etc. Verifier le tableau de variation des capitaux propres.')
  }
  return ok(ref, nom, 'Variation capitaux propres coherente')
}

// EF-014 a EF-018: Notes annexes vs etats principaux
function EF014(ctx: AuditContext): ResultatControle {
  const ref = 'EF-014', nom = 'Note 3A - Immobilisations brutes'
  const immobBrut = find(ctx.balanceN, '2').filter((l) => !l.compte.startsWith('28') && !l.compte.startsWith('29')).reduce((s, l) => s + Math.max(0, solde(l)), 0)
  const amort = find(ctx.balanceN, '28').reduce((s, l) => s + Math.abs(solde(l)), 0)
  const immobNet = immobBrut - amort

  if (immobBrut > 0 && amort > immobBrut) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Immobilisations nettes negatives: Brut(${immobBrut.toLocaleString('fr-FR')}) - Amort(${amort.toLocaleString('fr-FR')}) = ${immobNet.toLocaleString('fr-FR')}`,
      {
        montants: { immobBrut, amortissements: amort, immobNet },
        description: 'Les amortissements cumules depassent la valeur brute des immobilisations dans la note 3A. Les valeurs nettes comptables seraient negatives, ce qui est impossible.'
      },
      'Solder les amortissements des immobilisations sorties. Verifier la coherence du tableau des immobilisations.',
      undefined,
      'Art. 45 Acte Uniforme OHADA')
  }
  return ok(ref, nom, `Immobilisations: Brut ${immobBrut.toLocaleString('fr-FR')}, Net ${immobNet.toLocaleString('fr-FR')}`)
}

function EF015(ctx: AuditContext): ResultatControle {
  const ref = 'EF-015', nom = 'Note 3B - Amortissements'
  const amort = find(ctx.balanceN, '28').reduce((s, l) => s + Math.abs(solde(l)), 0)
  const dotations = sumForPrefixes(ctx.balanceN, ['681', '682'])

  if (amort > 0 && dotations === 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Amortissements cumules (${amort.toLocaleString('fr-FR')}) sans dotation de l'exercice`,
      {
        montants: { amortissementsCumules: amort, dotationsExercice: dotations },
        description: `Des amortissements cumules de ${amort.toLocaleString('fr-FR')} FCFA existent au bilan mais aucune dotation n\'a ete passee dans l\'exercice. La note 3B sera incomplete sans les mouvements de l\'exercice.`
      },
      'Comptabiliser les dotations aux amortissements de l\'exercice pour completer le tableau des amortissements (note 3B).')
  }
  return ok(ref, nom, `Amortissements cumules: ${amort.toLocaleString('fr-FR')}, Dotations exercice: ${dotations.toLocaleString('fr-FR')}`)
}

function EF016(ctx: AuditContext): ResultatControle {
  const ref = 'EF-016', nom = 'Note 3H - Creances'
  const creancesClients = sumForPrefixes(ctx.balanceN, ['41'])
  const creancesFiscales = sumForPrefixes(ctx.balanceN, ['44'])
  const autresCreances = sumForPrefixes(ctx.balanceN, ['42', '43', '45', '46', '47'])
  const totalCreances = creancesClients + creancesFiscales + autresCreances
  const depreciations = sumForPrefixes(ctx.balanceN, ['49'])

  if (depreciations > totalCreances && totalCreances > 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `Depreciations creances (${depreciations.toLocaleString('fr-FR')}) > total creances (${totalCreances.toLocaleString('fr-FR')})`,
      {
        montants: { totalCreances, clients: creancesClients, fiscales: creancesFiscales, autres: autresCreances, depreciations },
        description: 'Les depreciations de creances depassent le montant total des creances, ce qui donnerait des creances nettes negatives dans la note 3H.'
      },
      'Regulariser les depreciations de creances: solder les depreciations des creances abandonnees ou recouvrees.')
  }
  return ok(ref, nom, `Total creances: ${totalCreances.toLocaleString('fr-FR')} (Clients: ${creancesClients.toLocaleString('fr-FR')})`)
}

function EF017(ctx: AuditContext): ResultatControle {
  const ref = 'EF-017', nom = 'Note 3I - Dettes'
  const dettesFinancieres = sumForPrefixes(ctx.balanceN, ['16'])
  const dettesFournisseurs = sumForPrefixes(ctx.balanceN, ['40'])
  const dettesFiscales = sumForPrefixes(ctx.balanceN, ['44'])
  const dettesSociales = sumForPrefixes(ctx.balanceN, ['42', '43'])
  const totalDettes = dettesFinancieres + dettesFournisseurs + dettesFiscales + dettesSociales

  if (totalDettes === 0) {
    const ca = sumForPrefixes(ctx.balanceN, ['70'])
    if (ca > 0) {
      return anomalie(ref, nom, 'INFO',
        `Aucune dette au bilan malgre un CA de ${ca.toLocaleString('fr-FR')}`,
        {
          montants: { totalDettes: 0, chiffreAffaires: ca },
          description: 'L\'absence totale de dettes (fournisseurs, fiscales, sociales) est inhabituelle pour une entreprise en activite. Les dettes de fin d\'exercice (fournisseurs, charges a payer) devraient normalement exister.'
        },
        'Verifier la completude des ecritures de cloture: factures non parvenues, charges a payer, dettes fiscales et sociales.')
    }
  }
  return ok(ref, nom, `Total dettes: ${totalDettes.toLocaleString('fr-FR')} (Fin: ${dettesFinancieres.toLocaleString('fr-FR')}, Fourn: ${dettesFournisseurs.toLocaleString('fr-FR')})`)
}

function EF018(ctx: AuditContext): ResultatControle {
  const ref = 'EF-018', nom = 'Note 3J - Provisions'
  const provRisques = sumForPrefixes(ctx.balanceN, ['19'])
  const depImmob = sumForPrefixes(ctx.balanceN, ['29'])
  const depStocks = sumForPrefixes(ctx.balanceN, ['39'])
  const depTiers = sumForPrefixes(ctx.balanceN, ['49'])
  const totalProvisions = provRisques + depImmob + depStocks + depTiers

  if (totalProvisions > 0) {
    return ok(ref, nom, `Provisions et depreciations: ${totalProvisions.toLocaleString('fr-FR')} (Risques: ${provRisques.toLocaleString('fr-FR')}, Dep.Immo: ${depImmob.toLocaleString('fr-FR')}, Dep.Stocks: ${depStocks.toLocaleString('fr-FR')}, Dep.Tiers: ${depTiers.toLocaleString('fr-FR')})`)
  }
  return ok(ref, nom, `Aucune provision ou depreciation au bilan`)
}

// EF-019: Effectifs non vide si charges personnel
function EF019(ctx: AuditContext): ResultatControle {
  const ref = 'EF-019', nom = 'Effectifs vs charges personnel'
  const chargesPerso = sumForPrefixes(ctx.balanceN, ['66'])
  if (chargesPerso > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Charges de personnel (${chargesPerso.toLocaleString('fr-FR')}) - verifier que les effectifs sont renseignes en annexe`,
      {
        montants: { chargesPersonnel: chargesPerso },
        description: `Des charges de personnel de ${chargesPerso.toLocaleString('fr-FR')} FCFA sont comptabilisees. L\'annexe aux etats financiers doit obligatoirement mentionner les effectifs moyens de l\'exercice (cadres, agents de maitrise, employes) et la masse salariale.`
      },
      'Renseigner les effectifs et la masse salariale dans la note 30 de l\'annexe. Indiquer la repartition par categorie professionnelle.',
      undefined,
      'Art. 56 Acte Uniforme OHADA - Contenu de l\'annexe')
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
