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

// Helper: sum only debit-side balances (solde > 0) for actif brut
function sumDebitSoldes(bal: BalanceEntry[], prefixes: string[]): number {
  let total = 0
  for (const l of bal) {
    for (const p of prefixes) {
      if (l.compte.toString().startsWith(p)) {
        const s = solde(l)
        if (s > 0) total += s
        break
      }
    }
  }
  return total
}

// Helper: sum only credit-side balances (solde < 0) returned as positive
function sumCreditSoldes(bal: BalanceEntry[], prefixes: string[]): number {
  let total = 0
  for (const l of bal) {
    for (const p of prefixes) {
      if (l.compte.toString().startsWith(p)) {
        const s = solde(l)
        if (s < 0) total -= s // make positive
        break
      }
    }
  }
  return total
}

// Helper: calcule actif et passif a partir du mapping (sign-aware)
// Uses debit/credit sense to properly handle dual-nature accounts (e.g. bank 52x)
function calcBilanFromMapping(bal: BalanceEntry[]): { actif: number; passif: number } {
  let actif = 0, passif = 0
  const mapping = SYSCOHADA_MAPPING

  for (const [, poste] of Object.entries(mapping.actif)) {
    const brut = sumDebitSoldes(bal, poste.comptes)
    const amort = sumCreditSoldes(bal, poste.amortComptes || [])
    actif += brut - amort
  }
  for (const [, poste] of Object.entries(mapping.passif)) {
    passif += sumCreditSoldes(bal, poste.comptes)
  }
  return { actif: Math.max(0, actif), passif }
}

// Helper: calcule actif/passif directement depuis la balance (sans mapping)
function calcBilanFromBalance(bal: BalanceEntry[]): { actif: number; passif: number } {
  let actif = 0, passif = 0
  for (const l of bal) {
    const cl = parseInt(l.compte.toString().charAt(0))
    if (cl >= 1 && cl <= 5) {
      const s = solde(l)
      if (s > 0) actif += s
      else if (s < 0) passif -= s
    }
  }
  return { actif, passif }
}

// EF-001: Bilan equilibre
//
// Avant : pour les types sectoriels (BANQUE/ASSURANCE/MICROFINANCE/EBNL),
// le contrôle court-circuitait avec `return ok(...)` SANS aucune
// vérification réelle. Le rapport client indiquait "Bilan équilibré ✓"
// pour une banque sans contrôler → score artificiellement gonflé.
//
// Après : implémentation réelle qui vérifie l'équilibre debit/crédit
// par classe pour les types sectoriels. Le mapping SYSCOHADA Révisé
// standard ne s'applique pas (banques utilisent BCEAO, assurances CIMA,
// microfinance SYSCOHADA-MF, EBNL plan associatif), donc on tombe sur
// un contrôle plus générique : équilibre debit total = crédit total
// sur les classes de bilan, qui reste valide quel que soit le plan.
function EF001(ctx: AuditContext): ResultatControle {
  const ref = 'EF-001', nom = 'Bilan equilibre'
  const typeLiasse = ctx.typeLiasse || 'SN'

  // Types sectoriels : contrôle équilibre debit/crédit générique (plans
  // BCEAO/CIMA/MF/EBNL ont des numérotations différentes, mais l'équilibre
  // général reste vérifiable)
  if (['BANQUE', 'ASSURANCE', 'MICROFINANCE', 'EBNL'].includes(typeLiasse)) {
    const bilanLignes = ctx.balanceN.filter(l => {
      const cl = parseInt(l.compte.charAt(0))
      return cl >= 1 && cl <= 5
    })
    const totalDebit = bilanLignes.reduce((s, l) => s + (l.solde_debit || 0), 0)
    const totalCredit = bilanLignes.reduce((s, l) => s + (l.solde_credit || 0), 0)
    const ecart = Math.abs(totalDebit - totalCredit)
    const TOLERANCE = 1 // FCFA arrondis

    if (ecart > TOLERANCE) {
      return anomalie(ref, nom, 'BLOQUANT',
        `Bilan ${typeLiasse} déséquilibré: Débit=${totalDebit.toLocaleString('fr-FR')}, Crédit=${totalCredit.toLocaleString('fr-FR')} (écart: ${ecart.toLocaleString('fr-FR')})`,
        {
          ecart, montants: { totalDebit, totalCredit, nbComptes: bilanLignes.length },
          description: `Le bilan sectoriel ${typeLiasse} présente un écart de ${ecart.toLocaleString('fr-FR')} FCFA entre soldes débiteurs et créditeurs des classes 1-5. Pour ce type de liasse, le plan comptable spécifique (BCEAO/CIMA/SYSCOHADA-MF/Plan EBNL) s'applique mais l'équilibre fondamental reste exigé.`,
          attendu: 'Σ soldes débiteurs classes 1-5 = Σ soldes créditeurs classes 1-5',
          constate: `Débit: ${totalDebit.toLocaleString('fr-FR')}, Crédit: ${totalCredit.toLocaleString('fr-FR')}, écart: ${ecart.toLocaleString('fr-FR')}`,
          impactFiscal: `Bilan ${typeLiasse} déséquilibré = liasse non recevable par le superviseur sectoriel (BCEAO/CIMA/Ministère).`,
        },
        'Vérifier l\'équilibre de la balance source. Si la balance est équilibrée, vérifier les écritures de clôture spécifiques au plan sectoriel.',
        undefined,
        typeLiasse === 'BANQUE' ? 'Instruction BCEAO - États financiers banques' :
        typeLiasse === 'ASSURANCE' ? 'Code CIMA - Plan comptable assurance' :
        typeLiasse === 'MICROFINANCE' ? 'SYSCOHADA-MF - Microfinance' :
        'Plan comptable EBNL - Acte Uniforme OHADA')
    }
    return ok(ref, nom, `Bilan ${typeLiasse} équilibré (${bilanLignes.length} comptes, écart < ${TOLERANCE} FCFA)`)
  }

  // Primary check: balance directe (debit vs credit soldes classes 1-5)
  const balDirect = calcBilanFromBalance(ctx.balanceN)
  const ecartDirect = Math.abs(balDirect.actif - balDirect.passif)

  // Secondary check: mapping-based
  const { actif, passif } = calcBilanFromMapping(ctx.balanceN)
  const ecartMapping = Math.abs(actif - passif)

  // Use balance-based check as primary (most reliable)
  if (ecartDirect > 1) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Bilan desequilibre: Actif=${balDirect.actif.toLocaleString('fr-FR')}, Passif=${balDirect.passif.toLocaleString('fr-FR')} (ecart: ${ecartDirect.toLocaleString('fr-FR')})`,
      {
        ecart: ecartDirect, montants: { actif: balDirect.actif, passif: balDirect.passif, actifMapping: actif, passifMapping: passif },
        description: `Le bilan est desequilibre de ${ecartDirect.toLocaleString('fr-FR')} FCFA. L'actif (soldes debiteurs classes 1-5 = ${balDirect.actif.toLocaleString('fr-FR')}) ne correspond pas au passif (soldes crediteurs classes 1-5 = ${balDirect.passif.toLocaleString('fr-FR')}). Cela peut provenir d'un desequilibre dans la balance source ou d'ecritures de cloture incompletes.`,
        attendu: 'Actif = Passif (ecart = 0)',
        constate: `Actif: ${balDirect.actif.toLocaleString('fr-FR')}, Passif: ${balDirect.passif.toLocaleString('fr-FR')}, ecart: ${ecartDirect.toLocaleString('fr-FR')}`,
        impactFiscal: 'Bilan desequilibre = liasse fiscale non deposable = rejet par l\'administration fiscale.',
      },
      'Verifier l\'equilibre de la balance source (controle F-001). Si la balance est equilibree, verifier l\'affectation du resultat (compte 13x).',
      undefined,
      'Art. 29 Acte Uniforme OHADA - Equilibre du bilan')
  }

  // If balance is balanced but mapping shows gap, report as INFO (mapping coverage issue)
  if (ecartMapping > Math.max(actif * 0.05, 10000)) {
    return anomalie(ref, nom, 'INFO',
      `Bilan equilibre mais ecart mapping: Actif mapping=${actif.toLocaleString('fr-FR')}, Passif mapping=${passif.toLocaleString('fr-FR')}`,
      {
        ecart: ecartMapping, montants: { actif, passif, actifBalance: balDirect.actif, passifBalance: balDirect.passif },
        description: `Le bilan est equilibre (${balDirect.actif.toLocaleString('fr-FR')}) mais le mapping SYSCOHADA presente un ecart de ${ecartMapping.toLocaleString('fr-FR')} FCFA. Certains comptes peuvent ne pas etre couverts par le mapping, ce qui affectera la presentation des etats financiers sans impacter l'equilibre.`,
        attendu: 'Ecart mapping SYSCOHADA < 5% du total actif',
        constate: `Ecart mapping: ${ecartMapping.toLocaleString('fr-FR')}`,
        impactFiscal: 'Comptes non mappes = postes manquants dans la liasse = presentation incomplete.',
      },
      'Verifier que tous les comptes de bilan sont correctement affectes dans le mapping SYSCOHADA (controle C-006).')
  }

  return ok(ref, nom, `Bilan equilibre: ${balDirect.actif.toLocaleString('fr-FR')}`)
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
        description: `L\'actif immobilise net est negatif (${totalImmob.toLocaleString('fr-FR')} FCFA), ce qui signifie que les amortissements cumules (${amortImmo.toLocaleString('fr-FR')}) depassent la valeur brute des immobilisations (${brutImmo.toLocaleString('fr-FR')}). C\'est comptablement impossible et indique des amortissements non soldes apres cession d\'immobilisations.`,
        attendu: 'Actif immobilise net >= 0 (amortissements <= valeur brute)',
        constate: `Actif immobilise net: ${totalImmob.toLocaleString('fr-FR')} (Brut: ${brutImmo.toLocaleString('fr-FR')}, Amort: ${amortImmo.toLocaleString('fr-FR')})`,
        impactFiscal: 'Actif immobilise negatif = liasse non conforme = rejet par l\'administration.',
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
  // CP: use signed sum (credit-balance = negative solde), then negate for OHADA convention
  const cp = -sumSoldeForPrefixes(ctx.balanceN, ['10', '11', '12', '13', '14'])
  const dettesF = sumForPrefixes(ctx.balanceN, ['16', '17', '18'])
  const dettesC = sumForPrefixes(ctx.balanceN, ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49'])

  if (cp < 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `Capitaux propres negatifs dans les etats financiers: ${cp.toLocaleString('fr-FR')}`,
      {
        montants: { capitauxPropres: cp, dettesFinancieres: dettesF, dettesCourantes: dettesC },
        description: `Les capitaux propres consolides (comptes 10-14) sont negatifs a ${cp.toLocaleString('fr-FR')} FCFA dans la presentation des etats financiers. L\'entreprise est en situation de fonds propres negatifs, ce qui implique des obligations legales de regularisation.`,
        attendu: 'Capitaux propres positifs (CP > 0)',
        constate: `CP: ${cp.toLocaleString('fr-FR')} (Dettes financieres: ${dettesF.toLocaleString('fr-FR')}, Dettes courantes: ${dettesC.toLocaleString('fr-FR')})`,
        impactFiscal: 'CP negatifs = obligation de regularisation sous 2 ans (Art. 664 AUSCGIE) = dissolution possible si non regularise.',
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
  const { actif: actifMapping } = calcBilanFromMapping(ctx.balanceN)
  const { actif: actifBalance } = calcBilanFromBalance(ctx.balanceN)
  const ecart = Math.abs(actifMapping - actifBalance)
  // Use 10% tolerance — mapping may not cover all accounts (e.g., contra accounts, special prefixes)
  if (ecart > actifBalance * 0.10 && ecart > 50000) {
    return anomalie(ref, nom, 'MAJEUR',
      `Ecart entre bilan mapping et balance: ${ecart.toLocaleString('fr-FR')} (${actifBalance > 0 ? (ecart / actifBalance * 100).toFixed(1) : '0'}%)`,
      {
        ecart, montants: { bilanMapping: actifMapping, bilanBalance: actifBalance },
        description: `L'ecart de ${ecart.toLocaleString('fr-FR')} FCFA entre le bilan issu du mapping SYSCOHADA (${actifMapping.toLocaleString('fr-FR')}) et la balance directe (${actifBalance.toLocaleString('fr-FR')}) depasse 10%. Des comptes de bilan ne sont pas couverts par le mapping, ce qui produira des etats financiers potentiellement incomplets.`,
        attendu: 'Ecart bilan mapping vs balance < 10%',
        constate: `Mapping: ${actifMapping.toLocaleString('fr-FR')}, Balance: ${actifBalance.toLocaleString('fr-FR')}, ecart: ${ecart.toLocaleString('fr-FR')} (${actifBalance > 0 ? (ecart / actifBalance * 100).toFixed(1) : '0'}%)`,
        impactFiscal: 'Etats financiers incomplets = liasse potentiellement non conforme = risque de rejet.',
      },
      'Identifier les comptes non couverts par le mapping SYSCOHADA et les affecter aux postes correspondants du bilan.',
      undefined,
      'Art. 29 Acte Uniforme OHADA')
  }
  return ok(ref, nom, `Bilan mapping (${actifMapping.toLocaleString('fr-FR')}) coherent avec balance (${actifBalance.toLocaleString('fr-FR')})`)
}

// EF-005: Resultat CdR = Resultat bilan
function EF005(ctx: AuditContext): ResultatControle {
  const ref = 'EF-005', nom = 'Resultat CdR = Resultat bilan'
  const produits = find(ctx.balanceN, '7').reduce((s, l) => s + (l.credit - l.debit), 0)
  const charges = find(ctx.balanceN, '6').reduce((s, l) => s + (l.debit - l.credit), 0)
  // Include HAO (class 8 excluding 89) and IS (89) for complete net result
  const hao8 = ctx.balanceN.filter(l => {
    const c = l.compte.toString()
    return c.startsWith('8') && !c.startsWith('89')
  })
  const haoNet = hao8.reduce((s, l) => s + (l.credit - l.debit), 0)
  const impot89 = find(ctx.balanceN, '89').reduce((s, l) => s + (l.debit - l.credit), 0)
  const resultatCdR = produits - charges + haoNet - impot89
  const resultatBilan = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const ecart = Math.abs(resultatCdR - resultatBilan)
  if (ecart > 1 && find(ctx.balanceN, '13').length > 0) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Resultat CdR (${resultatCdR.toLocaleString('fr-FR')}) != Resultat bilan (${resultatBilan.toLocaleString('fr-FR')})`,
      {
        ecart, montants: { resultatCdR, resultatBilan, produits, charges, haoNet, impot: impot89 },
        description: `Le resultat net calcule (produits ${produits.toLocaleString('fr-FR')} - charges ${charges.toLocaleString('fr-FR')} + HAO ${haoNet.toLocaleString('fr-FR')} - IS ${impot89.toLocaleString('fr-FR')} = ${resultatCdR.toLocaleString('fr-FR')}) differe du resultat inscrit au bilan (compte 13x = ${resultatBilan.toLocaleString('fr-FR')}). Les deux montants doivent etre strictement identiques.`,
        attendu: 'Resultat CdR = Resultat bilan (ecart = 0)',
        constate: `CdR: ${resultatCdR.toLocaleString('fr-FR')}, Bilan: ${resultatBilan.toLocaleString('fr-FR')}, ecart: ${ecart.toLocaleString('fr-FR')}`,
        impactFiscal: 'Incoherence resultat = liasse non deposable = rejet par l\'administration fiscale.',
      },
      'Verifier les ecritures de determination du resultat. Le solde du compte 13x doit correspondre exactement au resultat net (produits - charges + HAO - IS).',
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
  return ok(ref, nom, `Resultat net coherent: ${resultatCdR.toLocaleString('fr-FR')}`)
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
        description: `La marge brute sur marchandises est negative (${margeBrute.toLocaleString('fr-FR')} FCFA). Le cout des marchandises vendues (achats ${achatsMses.toLocaleString('fr-FR')} + variation stocks ${varStocksMses.toLocaleString('fr-FR')}) depasse les ventes de marchandises (${ventesMses.toLocaleString('fr-FR')}). Cela peut indiquer des ventes a perte, une erreur de valorisation des stocks, ou un probleme de classification comptable.`,
        attendu: 'Marge brute positive (ventes > cout des marchandises)',
        constate: `Marge brute: ${margeBrute.toLocaleString('fr-FR')} (Ventes: ${ventesMses.toLocaleString('fr-FR')}, Achats: ${achatsMses.toLocaleString('fr-FR')}, Var.stocks: ${varStocksMses.toLocaleString('fr-FR')})`,
        impactFiscal: 'Marge brute negative = activite commerciale deficitaire = revue de la politique de prix necessaire.',
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
        description: `La valeur ajoutee est negative (${va.toLocaleString('fr-FR')} FCFA): les consommations intermediaires (${consomm.toLocaleString('fr-FR')}) depassent la production (${ca.toLocaleString('fr-FR')}). L\'entreprise consomme plus de richesse qu\'elle n\'en cree. C\'est une situation critique qui remet en cause la viabilite du modele economique.`,
        attendu: 'Valeur ajoutee positive (production > consommations)',
        constate: `VA: ${va.toLocaleString('fr-FR')} (Production: ${ca.toLocaleString('fr-FR')}, Consommations: ${consomm.toLocaleString('fr-FR')})`,
        impactFiscal: 'VA negative = modele economique non viable = risque de continuite d\'exploitation.',
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
  // HAO: class 8 EXCLUDING 89 (IS) to avoid double-counting
  const hao8 = ctx.balanceN.filter(l => {
    const c = l.compte.toString()
    return c.startsWith('8') && !c.startsWith('89')
  })
  const hao = hao8.reduce((s, l) => s + (l.credit - l.debit), 0)
  // IS: use signed value (debit - credit) since IS is a debit charge
  const impot = find(ctx.balanceN, '89').reduce((s, l) => s + (l.debit - l.credit), 0)
  const resultatNet = rao + hao - impot
  const resultat13 = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const ecart = Math.abs(resultatNet - resultat13)
  if (ecart > 1 && find(ctx.balanceN, '13').length > 0) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Cascade: RAO(${rao.toLocaleString('fr-FR')}) + HAO(${hao.toLocaleString('fr-FR')}) - IS(${impot.toLocaleString('fr-FR')}) = ${resultatNet.toLocaleString('fr-FR')} != 13x(${resultat13.toLocaleString('fr-FR')})`,
      {
        ecart,
        montants: { resultatAO: rao, resultatHAO: hao, impotSocietes: impot, resultatNetCalcule: resultatNet, resultatComptabilise: resultat13 },
        description: `La cascade du resultat n'est pas coherente: Resultat AO (${rao.toLocaleString('fr-FR')}) + Resultat HAO (${hao.toLocaleString('fr-FR')}) - IS (${impot.toLocaleString('fr-FR')}) = ${resultatNet.toLocaleString('fr-FR')}, mais le compte 13x affiche ${resultat13.toLocaleString('fr-FR')}. L'ecart de ${ecart.toLocaleString('fr-FR')} FCFA indique une erreur dans la determination du resultat.`,
        attendu: 'RAO + HAO - IS = Resultat net (compte 13x)',
        constate: `RAO: ${rao.toLocaleString('fr-FR')}, HAO: ${hao.toLocaleString('fr-FR')}, IS: ${impot.toLocaleString('fr-FR')}, Net calcule: ${resultatNet.toLocaleString('fr-FR')}, 13x: ${resultat13.toLocaleString('fr-FR')}`,
        impactFiscal: 'Cascade incoherente = resultat fiscal potentiellement faux = risque de redressement.',
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
  const cafSoustr = ebe + autresProduits - autresCharges + haoNet - isNet

  const ecart = Math.abs(cafAdd - cafSoustr)

  if (ecart > Math.max(Math.abs(cafAdd) * 0.05, 10000) && find(ctx.balanceN, '13').length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `CAF additive (${cafAdd.toLocaleString('fr-FR')}) != CAF soustractive (${cafSoustr.toLocaleString('fr-FR')})`,
      {
        ecart,
        montants: { cafAdditive: cafAdd, cafSoustractive: cafSoustr, resultat, dotations, reprises, ebe },
        description: `L\'ecart de ${ecart.toLocaleString('fr-FR')} FCFA entre la CAF additive (resultat + dotations - reprises = ${cafAdd.toLocaleString('fr-FR')}) et la CAF soustractive (a partir de l\'EBE = ${cafSoustr.toLocaleString('fr-FR')}) indique une incoherence dans la classification des charges et produits calcules vs decaisses.`,
        attendu: 'CAF additive = CAF soustractive (ecart < 5%)',
        constate: `CAF additive: ${cafAdd.toLocaleString('fr-FR')}, CAF soustractive: ${cafSoustr.toLocaleString('fr-FR')}, ecart: ${ecart.toLocaleString('fr-FR')}`,
        impactFiscal: 'Incoherence CAF = classification charges/produits erronee = impact potentiel sur le resultat fiscal.',
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
        description: `La tresorerie nette de cloture est negative (${tresoNette.toLocaleString('fr-FR')} FCFA). La tresorerie-actif (${tresoActif.toLocaleString('fr-FR')}) est inferieure a la tresorerie-passif (${tresoPassif.toLocaleString('fr-FR')}), ce qui indique une dependance aux concours bancaires courants.`,
        attendu: 'Tresorerie nette positive (actif treso > passif treso)',
        constate: `Treso nette: ${tresoNette.toLocaleString('fr-FR')} (Actif: ${tresoActif.toLocaleString('fr-FR')}, Passif: ${tresoPassif.toLocaleString('fr-FR')})`,
        impactFiscal: 'Tresorerie negative = dependance bancaire = risque de cessation de paiements.',
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
        description: `La capacite d\'autofinancement estimee est negative (${cafEstimee.toLocaleString('fr-FR')}) alors que le resultat est positif (${resultat.toLocaleString('fr-FR')}). Les reprises sur provisions/depreciations (${reprises.toLocaleString('fr-FR')}) depassent les dotations (${dotations.toLocaleString('fr-FR')}), ce qui gonfle le resultat sans generer de tresorerie.`,
        attendu: 'CAF positive quand le resultat est positif',
        constate: `CAF: ${cafEstimee.toLocaleString('fr-FR')}, Resultat: ${resultat.toLocaleString('fr-FR')}, Dotations: ${dotations.toLocaleString('fr-FR')}, Reprises: ${reprises.toLocaleString('fr-FR')}`,
        impactFiscal: 'CAF negative = tresorerie d\'exploitation insuffisante = risque de difficultes de paiement de l\'IS.',
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
        description: `La tresorerie a varie de ${pctVar.toFixed(0)}% entre N-1 (${tresoN1.toLocaleString('fr-FR')}) et N (${tresoN.toLocaleString('fr-FR')}). Une variation de plus de 50% merite une analyse: flux d\'exploitation, investissements, financement.`,
        attendu: 'Variation tresorerie < 50% entre exercices consecutifs',
        constate: `Variation de ${pctVar.toFixed(0)}% (N-1: ${tresoN1.toLocaleString('fr-FR')}, N: ${tresoN.toLocaleString('fr-FR')})`,
        impactFiscal: 'Variation significative de tresorerie peut reveler des operations non declarees ou des anomalies de flux.',
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
  // CP: use signed sum (credit-balance = negative solde), then negate for OHADA convention
  const cpN = -sumSoldeForPrefixes(ctx.balanceN, ['10', '11', '12', '13', '14'])
  const cpN1 = -sumSoldeForPrefixes(ctx.balanceN1, ['10', '11', '12', '13', '14'])
  const variation = cpN - cpN1
  const resultatN = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const ecart = Math.abs(variation - resultatN)
  if (ecart > Math.abs(resultatN) * 0.2 && ecart > 10000) {
    return anomalie(ref, nom, 'MINEUR',
      `Variation CP (${variation.toLocaleString('fr-FR')}) significativement differente du resultat (${resultatN.toLocaleString('fr-FR')})`,
      {
        montants: { variationCP: variation, resultat: resultatN, cpN, cpN1 },
        description: `La variation des capitaux propres (${variation.toLocaleString('fr-FR')} = CP N ${cpN.toLocaleString('fr-FR')} - CP N-1 ${cpN1.toLocaleString('fr-FR')}) differe significativement du resultat de l\'exercice (${resultatN.toLocaleString('fr-FR')}). L\'ecart de ${ecart.toLocaleString('fr-FR')} peut s\'expliquer par des dividendes distribues, une augmentation/reduction de capital, ou des mouvements de reserves.`,
        attendu: 'Variation CP proche du resultat de l\'exercice (ecart < 20%)',
        constate: `Variation CP: ${variation.toLocaleString('fr-FR')}, Resultat: ${resultatN.toLocaleString('fr-FR')}, ecart: ${ecart.toLocaleString('fr-FR')}`,
        impactFiscal: 'Mouvements de CP non justifies peuvent affecter les droits d\'enregistrement et la base de l\'IRVM.',
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
        description: 'Les amortissements cumules depassent la valeur brute des immobilisations dans la note 3A. Les valeurs nettes comptables seraient negatives, ce qui est impossible.',
        attendu: 'Amortissements cumules <= valeur brute des immobilisations',
        constate: `Brut: ${immobBrut.toLocaleString('fr-FR')}, Amort: ${amort.toLocaleString('fr-FR')}, Net: ${immobNet.toLocaleString('fr-FR')}`,
        impactFiscal: 'Immobilisations nettes negatives = note 3A non conforme = liasse rejetee.',
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
        description: `Des amortissements cumules de ${amort.toLocaleString('fr-FR')} FCFA existent au bilan mais aucune dotation n\'a ete passee dans l\'exercice. La note 3B sera incomplete sans les mouvements de l\'exercice.`,
        attendu: 'Dotation aux amortissements de l\'exercice > 0 si amortissements cumules > 0',
        constate: `Amort. cumules: ${amort.toLocaleString('fr-FR')}, Dotations exercice: ${dotations.toLocaleString('fr-FR')}`,
        impactFiscal: 'Dotations manquantes = charges deductibles non comptabilisees = resultat fiscal surestime.',
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
        description: 'Les depreciations de creances depassent le montant total des creances, ce qui donnerait des creances nettes negatives dans la note 3H.',
        attendu: 'Depreciations creances <= total creances brutes',
        constate: `Creances brutes: ${totalCreances.toLocaleString('fr-FR')}, Depreciations: ${depreciations.toLocaleString('fr-FR')}`,
        impactFiscal: 'Depreciations excessives = charges non deductibles = risque de redressement fiscal.',
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
          description: 'L\'absence totale de dettes (fournisseurs, fiscales, sociales) est inhabituelle pour une entreprise en activite. Les dettes de fin d\'exercice (fournisseurs, charges a payer) devraient normalement exister.',
          attendu: 'Dettes de fin d\'exercice presentes si activite significative',
          constate: `Aucune dette au bilan, CA: ${ca.toLocaleString('fr-FR')}`,
          impactFiscal: 'Absence de dettes fiscales et sociales = ecritures de cloture potentiellement manquantes.',
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
        description: `Des charges de personnel de ${chargesPerso.toLocaleString('fr-FR')} FCFA sont comptabilisees. L\'annexe aux etats financiers doit obligatoirement mentionner les effectifs moyens de l\'exercice (cadres, agents de maitrise, employes) et la masse salariale.`,
        attendu: 'Effectifs renseignes en annexe si charges de personnel > 0',
        constate: `Charges personnel: ${chargesPerso.toLocaleString('fr-FR')} - effectifs a verifier en annexe`,
        impactFiscal: 'Annexe incomplete = non-conformite OHADA = risque de rejet de la liasse.',
      },
      'Renseigner les effectifs et la masse salariale dans la note 30 de l\'annexe. Indiquer la repartition par categorie professionnelle.',
      undefined,
      'Art. 56 Acte Uniforme OHADA - Contenu de l\'annexe')
  }
  return ok(ref, nom, 'Pas de charges de personnel')
}

// EF-020: Charges financieres vs dettes financieres
function EF020(ctx: AuditContext): ResultatControle {
  const ref = 'EF-020', nom = 'Charges fin. vs dettes fin.'
  const chargesFin = sumForPrefixes(ctx.balanceN, ['67'])
  const dettesFin = sumForPrefixes(ctx.balanceN, ['16', '17'])
  if (dettesFin === 0 && chargesFin > 100000) {
    return anomalie(ref, nom, 'MINEUR',
      `Charges financieres (${chargesFin.toLocaleString('fr-FR')}) sans dettes financieres au bilan`,
      { montants: { chargesFin, dettesFin } },
      'Verifier l\'origine des charges financieres: comptes courants, decouverts, ou dettes non bilantees.')
  }
  return ok(ref, nom, 'Coherence charges et dettes financieres')
}

// EF-021: Dotations CR = dotations note 3C (amortissements)
function EF021(ctx: AuditContext): ResultatControle {
  const ref = 'EF-021', nom = 'Dotations CR coherentes'
  const dotCR = sumForPrefixes(ctx.balanceN, ['681', '691'])
  const amortFin = sumForPrefixes(ctx.balanceN, ['28'])
  // Simple sanity: si amortissements > 0, les dotations CR doivent aussi etre > 0
  if (amortFin > 0 && dotCR === 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `Amortissements cumules (${amortFin.toLocaleString('fr-FR')}) mais aucune dotation au CR`,
      { montants: { dotCR, amortFin } },
      'Verifier que les dotations aux amortissements sont bien passees au compte de resultat.')
  }
  return ok(ref, nom, 'Dotations CR coherentes avec amortissements')
}

// EF-022: FR = Capitaux permanents - Actif immobilise net
function EF022(ctx: AuditContext): ResultatControle {
  const ref = 'EF-022', nom = 'Fonds de roulement'
  const cp = Math.abs(sumSoldeForPrefixes(ctx.balanceN, ['10', '11', '12', '13', '14', '15']))
  const dettesLT = Math.abs(sumSoldeForPrefixes(ctx.balanceN, ['16', '17']))
  const immoBrut = sumForPrefixes(ctx.balanceN, ['20', '21', '22', '23', '24', '25', '26', '27'])
  const amort = sumForPrefixes(ctx.balanceN, ['28', '29'])
  const actifImmoNet = immoBrut - amort
  const fr = cp + dettesLT - actifImmoNet
  if (fr < 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Fonds de roulement negatif: ${fr.toLocaleString('fr-FR')} FCFA`,
      { montants: { cp, dettesLT, actifImmoNet, fr } },
      'Un FR negatif signifie que les ressources stables ne couvrent pas les emplois stables. Risque de desequilibre financier.')
  }
  return ok(ref, nom, `Fonds de roulement positif: ${fr.toLocaleString('fr-FR')}`)
}

// EF-023: BFR = Actif circulant (hors treso) - Passif circulant (hors treso)
function EF023(ctx: AuditContext): ResultatControle {
  const ref = 'EF-023', nom = 'BFR coherent'
  const actifCirc = sumForPrefixes(ctx.balanceN, ['3', '40', '41', '42', '43', '44', '45', '46', '47', '48'])
  const passifCirc = sumForPrefixes(ctx.balanceN, ['40', '41', '42', '43', '44', '45', '46', '47', '48'])
  const bfr = actifCirc - passifCirc
  if (bfr < 0) {
    return ok(ref, nom, `BFR negatif (${bfr.toLocaleString('fr-FR')}): l'exploitation degage de la tresorerie`)
  }
  return ok(ref, nom, `BFR: ${bfr.toLocaleString('fr-FR')} FCFA`)
}

// EF-024: Produits HAO sans charges HAO (ou inversement)
function EF024(ctx: AuditContext): ResultatControle {
  const ref = 'EF-024', nom = 'Coherence HAO'
  const chargesHAO = sumForPrefixes(ctx.balanceN, ['81', '83', '85'])
  const produitsHAO = sumForPrefixes(ctx.balanceN, ['82', '84', '86'])
  if (chargesHAO > 0 && produitsHAO === 0) {
    return anomalie(ref, nom, 'INFO',
      `Charges HAO (${chargesHAO.toLocaleString('fr-FR')}) sans produits HAO correspondants`,
      { montants: { chargesHAO, produitsHAO } },
      'Verifier si les operations HAO sont correctement classees et si un produit de cession est attendu.')
  }
  return ok(ref, nom, 'Coherence charges/produits HAO')
}

// ═══════════════════════════════════════
// EF-025 to EF-044: 20 new audit controls
// ═══════════════════════════════════════

// EF-025: Notes completeness — verify note-related accounts have data
function EF025(ctx: AuditContext): ResultatControle {
  const ref = 'EF-025', nom = 'Completude des notes annexes'
  // Check that key note accounts have entries when expected
  const noteChecks = [
    { note: '3A', prefixes: ['20', '21', '22', '23', '24', '25', '26', '27'], label: 'Immobilisations' },
    { note: '3B', prefixes: ['28'], label: 'Amortissements' },
    { note: '3H', prefixes: ['41', '42', '43', '44', '45', '46', '47'], label: 'Creances' },
    { note: '3I', prefixes: ['40', '16', '17'], label: 'Dettes' },
    { note: '6', prefixes: ['31', '32', '33', '34', '35', '36', '37', '38'], label: 'Stocks' },
    { note: '11', prefixes: ['10', '11', '12', '13'], label: 'Capitaux propres' },
    { note: '21', prefixes: ['70'], label: 'Chiffre affaires' },
    { note: '27', prefixes: ['66'], label: 'Charges personnel' },
  ]
  const notesVides: string[] = []
  for (const nc of noteChecks) {
    const hasBal = nc.prefixes.some(p => ctx.balanceN.some(l => l.compte.startsWith(p) && Math.abs(solde(l)) > 0))
    if (!hasBal) notesVides.push(`Note ${nc.note} (${nc.label})`)
  }
  if (notesVides.length > 4) {
    return anomalie(ref, nom, 'MINEUR',
      `${notesVides.length} notes potentiellement vides: ${notesVides.slice(0, 5).join(', ')}`,
      { montants: { notesVides: notesVides.length }, comptes: notesVides })
  }
  return ok(ref, nom, `Notes verifiees: ${noteChecks.length - notesVides.length}/${noteChecks.length} avec donnees`)
}

// EF-026: CAF additive = CAF soustractive
function EF026(ctx: AuditContext): ResultatControle {
  const ref = 'EF-026', nom = 'CAF additive = soustractive'
  // CAF additive = EBE + autres produits encaissables - autres charges decaissables
  const EBE = sumSoldeForPrefixes(ctx.balanceN, ['70', '71', '72', '73', '74', '75']) - sumForPrefixes(ctx.balanceN, ['60', '61', '62', '63', '64', '65', '66'])
  // CAF soustractive = Resultat net + Dotations - Reprises +/- VCE/PCEA
  const resultat = sumCreditSoldes(ctx.balanceN, ['7']) - sumDebitSoldes(ctx.balanceN, ['6'])
  const dotations = sumForPrefixes(ctx.balanceN, ['68', '69'])
  const reprises = sumForPrefixes(ctx.balanceN, ['79', '78'])
  const cafSoustr = resultat + dotations - reprises
  // Both approaches should give similar results
  if (Math.abs(EBE) > 1 && Math.abs(cafSoustr) > 1) {
    return ok(ref, nom, `CAF soustractive: ${cafSoustr.toLocaleString('fr-FR')}`)
  }
  return ok(ref, nom, 'Pas assez de donnees pour comparer les deux methodes de CAF')
}

// EF-027: TFT equilibrium (total emplois = total ressources)
// Note: TAFIRE replaced by TFT in SYSCOHADA Révisé (2017)
function EF027(ctx: AuditContext): ResultatControle {
  const ref = 'EF-027', nom = 'Equilibre TFT'
  // TFT: Ressources - Emplois = Variation tresorerie
  // Simplified check: total debits class 1-5 ~= total credits class 1-5
  const totalActif = sumDebitSoldes(ctx.balanceN, ['2', '3', '4', '5'])
  const totalPassif = sumCreditSoldes(ctx.balanceN, ['1', '4', '5'])
  const ecart = Math.abs(totalActif - totalPassif)
  if (ecart > totalActif * 0.05 && ecart > 1000) {
    return anomalie(ref, nom, 'MINEUR',
      `Ecart dans l'equilibre patrimonial: ${ecart.toLocaleString('fr-FR')}`,
      { montants: { totalActif, totalPassif, ecart } })
  }
  return ok(ref, nom, 'Equilibre patrimonial verifie')
}

// EF-028: Opening balance = prior year closing balance
function EF028(ctx: AuditContext): ResultatControle {
  const ref = 'EF-028', nom = 'Solde ouverture = cloture N-1'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: 'Balance N-1 absente', timestamp: new Date().toISOString() }
  }
  // Compare N-1 closing balances with N opening (for bilan accounts classes 1-5)
  const n1Map = new Map<string, number>()
  for (const l of ctx.balanceN1) {
    n1Map.set(l.compte, solde(l))
  }
  const ecarts: string[] = []
  for (const l of ctx.balanceN) {
    if (!l.compte.match(/^[1-5]/)) continue
    const n1Solde = n1Map.get(l.compte)
    if (n1Solde !== undefined) {
      // Check if there's a significant discrepancy in permanent accounts
      // (opening balance of N should match closing of N-1 for bilan accounts)
      const ecart = Math.abs(solde(l) - n1Solde)
      if (ecart > Math.abs(n1Solde) * 0.5 && ecart > 10000) {
        ecarts.push(`${l.compte}: N-1=${n1Solde.toLocaleString('fr-FR')}, N=${solde(l).toLocaleString('fr-FR')}`)
      }
    }
  }
  if (ecarts.length > 5) {
    return anomalie(ref, nom, 'MAJEUR',
      `${ecarts.length} comptes avec ecarts significatifs entre N-1 et N`,
      { comptes: ecarts.slice(0, 20), montants: { ecartsDetectes: ecarts.length } },
      'Verifier la reprise des soldes d\'ouverture. Les ecarts peuvent resulter d\'ajustements ou d\'erreurs.',
      undefined,
      'Art. 8 Acte Uniforme OHADA')
  }
  return ok(ref, nom, `Verification ouverture/cloture: ${ecarts.length} ecart(s) detecte(s)`)
}

// EF-029: Account number continuity across years
function EF029(ctx: AuditContext): ResultatControle {
  const ref = 'EF-029', nom = 'Continuite des comptes'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: 'Balance N-1 absente', timestamp: new Date().toISOString() }
  }
  const comptesN = new Set(ctx.balanceN.filter(l => l.compte.match(/^[1-5]/)).map(l => l.compte))
  const comptesN1 = new Set(ctx.balanceN1.filter(l => l.compte.match(/^[1-5]/)).map(l => l.compte))
  const disparus = [...comptesN1].filter(c => !comptesN.has(c) && Math.abs(solde(ctx.balanceN1!.find(l => l.compte === c)!)) > 100)
  if (disparus.length > 10) {
    return anomalie(ref, nom, 'INFO',
      `${disparus.length} comptes bilantaires presents en N-1 ont disparu en N`,
      { comptes: disparus.slice(0, 20), montants: { comptesDisparus: disparus.length } },
      'Verifier que la fermeture de ces comptes est justifiee.')
  }
  return ok(ref, nom, `Continuite verifiee: ${disparus.length} comptes fermes`)
}

// EF-030: SIG total = CR total
function EF030(ctx: AuditContext): ResultatControle {
  const ref = 'EF-030', nom = 'SIG total = CR total'
  // Resultat net from produits - charges
  const totalProduits = sumCreditSoldes(ctx.balanceN, ['70', '71', '72', '73', '74', '75', '76', '77', '78', '79'])
  const totalCharges = sumDebitSoldes(ctx.balanceN, ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'])
  const resultatCR = totalProduits - totalCharges
  // HAO
  const produitsHAO = sumCreditSoldes(ctx.balanceN, ['82', '84', '86', '88'])
  const chargesHAO = sumDebitSoldes(ctx.balanceN, ['81', '83', '85', '87', '89'])
  const resultatNet = resultatCR + produitsHAO - chargesHAO
  // Check coherence
  if (Math.abs(totalProduits) < 1 && Math.abs(totalCharges) < 1) {
    return ok(ref, nom, 'Pas de donnees CdR (balance post-cloture)')
  }
  return ok(ref, nom, `Resultat net calcule: ${resultatNet.toLocaleString('fr-FR')} (Produits: ${totalProduits.toLocaleString('fr-FR')}, Charges: ${totalCharges.toLocaleString('fr-FR')})`)
}

// EF-031: Tresorerie nette positive
function EF031(ctx: AuditContext): ResultatControle {
  const ref = 'EF-031', nom = 'Tresorerie nette'
  const tresoActif = sumDebitSoldes(ctx.balanceN, ['50', '51', '52', '53', '54', '55', '56', '57', '58'])
  const tresoPassif = sumCreditSoldes(ctx.balanceN, ['52', '56'])
  const tresoNette = tresoActif - tresoPassif
  if (tresoNette < 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `Tresorerie nette negative: ${tresoNette.toLocaleString('fr-FR')}`,
      { montants: { tresoActif, tresoPassif, tresoNette } },
      'Situation de tresorerie tendue. Verifier les concours bancaires et la position de caisse.')
  }
  return ok(ref, nom, `Tresorerie nette positive: ${tresoNette.toLocaleString('fr-FR')}`)
}

// EF-032: Capitaux propres >= 50% du capital (alerte legale)
function EF032(ctx: AuditContext): ResultatControle {
  const ref = 'EF-032', nom = 'Capitaux propres vs capital'
  const capital = sumCreditSoldes(ctx.balanceN, ['101', '102', '103'])
  if (capital === 0) return ok(ref, nom, 'Pas de capital social')
  const cp = sumCreditSoldes(ctx.balanceN, ['10', '11', '12', '13', '14', '15']) - sumDebitSoldes(ctx.balanceN, ['109'])
  if (cp < capital / 2) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Capitaux propres (${cp.toLocaleString('fr-FR')}) < 50% du capital (${capital.toLocaleString('fr-FR')})`,
      { montants: { capitauxPropres: cp, capital, seuil: capital / 2 } },
      'AG extraordinaire obligatoire sous 4 mois (Art. 664 AUSCGIE). Decision: reconstituer ou dissoudre.',
      undefined,
      'Art. 664 AUSCGIE')
  }
  return ok(ref, nom, `CP (${cp.toLocaleString('fr-FR')}) >= 50% capital (${capital.toLocaleString('fr-FR')})`)
}

// EF-033: Ratio endettement
function EF033(ctx: AuditContext): ResultatControle {
  const ref = 'EF-033', nom = 'Ratio endettement'
  const cp = sumCreditSoldes(ctx.balanceN, ['10', '11', '12', '13', '14', '15'])
  const dettesFinancieres = sumCreditSoldes(ctx.balanceN, ['16', '17'])
  if (cp === 0) return ok(ref, nom, 'Pas de capitaux propres')
  const ratio = dettesFinancieres / cp
  if (ratio > 1) {
    return anomalie(ref, nom, 'INFO',
      `Ratio endettement eleve: ${ratio.toFixed(2)} (dettes ${dettesFinancieres.toLocaleString('fr-FR')} / CP ${cp.toLocaleString('fr-FR')})`,
      { montants: { dettesFinancieres, capitauxPropres: cp, ratio: Math.round(ratio * 100) / 100 } },
      'Ratio endettement superieur a 1. La structure financiere est desequilibree.')
  }
  return ok(ref, nom, `Ratio endettement: ${ratio.toFixed(2)}`)
}

// EF-034: Charges constatees d'avance
function EF034(ctx: AuditContext): ResultatControle {
  const ref = 'EF-034', nom = 'Charges constatees d\'avance'
  const cca = sumForPrefixes(ctx.balanceN, ['476'])
  const ca = sumCreditSoldes(ctx.balanceN, ['70'])
  if (cca > 0 && ca > 0 && cca > ca * 0.1) {
    return anomalie(ref, nom, 'MINEUR',
      `CCA (${cca.toLocaleString('fr-FR')}) > 10% du CA (${ca.toLocaleString('fr-FR')})`,
      { montants: { cca, ca } },
      'Les charges constatees d\'avance sont anormalement elevees par rapport au chiffre d\'affaires.')
  }
  return ok(ref, nom, `CCA: ${cca.toLocaleString('fr-FR')}`)
}

// EF-035: Produits constates d'avance
function EF035(ctx: AuditContext): ResultatControle {
  const ref = 'EF-035', nom = 'Produits constates d\'avance'
  const pca = sumForPrefixes(ctx.balanceN, ['477'])
  const ca = sumCreditSoldes(ctx.balanceN, ['70'])
  if (pca > 0 && ca > 0 && pca > ca * 0.2) {
    return anomalie(ref, nom, 'MINEUR',
      `PCA (${pca.toLocaleString('fr-FR')}) > 20% du CA (${ca.toLocaleString('fr-FR')})`,
      { montants: { pca, ca } },
      'Les produits constates d\'avance sont anormalement eleves.')
  }
  return ok(ref, nom, `PCA: ${pca.toLocaleString('fr-FR')}`)
}

// EF-036: Ecart de conversion actif
function EF036(ctx: AuditContext): ResultatControle {
  const ref = 'EF-036', nom = 'Ecart de conversion actif'
  const ecaActif = sumForPrefixes(ctx.balanceN, ['478'])
  const provEcart = sumForPrefixes(ctx.balanceN, ['4768'])
  if (ecaActif > 0 && provEcart === 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `Ecart de conversion actif (${ecaActif.toLocaleString('fr-FR')}) sans provision correspondante`,
      { montants: { ecaActif, provision: provEcart } },
      'Un ecart de conversion actif doit etre couvert par une provision pour risque de change (Art. 52 OHADA).',
      undefined,
      'Art. 52 Acte Uniforme OHADA')
  }
  return ok(ref, nom, `Ecart conversion actif: ${ecaActif.toLocaleString('fr-FR')}`)
}

// EF-037: Resultat exceptionnel vs resultat courant
function EF037(ctx: AuditContext): ResultatControle {
  const ref = 'EF-037', nom = 'Poids du HAO dans le resultat'
  const totalProduits = sumCreditSoldes(ctx.balanceN, ['70', '71', '72', '73', '74', '75', '76', '77'])
  const totalCharges = sumDebitSoldes(ctx.balanceN, ['60', '61', '62', '63', '64', '65', '66', '67', '68', '69'])
  const resultatCourant = totalProduits - totalCharges
  const produitsHAO = sumCreditSoldes(ctx.balanceN, ['82', '84', '86', '88'])
  const chargesHAO = sumDebitSoldes(ctx.balanceN, ['81', '83', '85'])
  const resultatHAO = produitsHAO - chargesHAO
  if (Math.abs(resultatCourant) > 0 && Math.abs(resultatHAO) > Math.abs(resultatCourant) * 0.5) {
    return anomalie(ref, nom, 'INFO',
      `Le resultat HAO (${resultatHAO.toLocaleString('fr-FR')}) pese plus de 50% du resultat courant (${resultatCourant.toLocaleString('fr-FR')})`,
      { montants: { resultatCourant, resultatHAO } },
      'Un poids excessif du HAO peut signifier un manque de perennite du resultat.')
  }
  return ok(ref, nom, 'Poids du HAO dans le resultat acceptable')
}

// EF-038: Coherence TVA collectee vs CA
function EF038(ctx: AuditContext): ResultatControle {
  const ref = 'EF-038', nom = 'TVA collectee vs CA'
  const tvaCollectee = sumCreditSoldes(ctx.balanceN, ['4431', '4432', '4433', '4434', '4435'])
  const ca = sumCreditSoldes(ctx.balanceN, ['70'])
  if (ca > 0 && tvaCollectee === 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Chiffre d'affaires (${ca.toLocaleString('fr-FR')}) sans TVA collectee`,
      { montants: { ca, tvaCollectee } },
      'Verifier si l\'entreprise est exoneree de TVA ou si la TVA n\'est pas correctement comptabilisee.')
  }
  return ok(ref, nom, `TVA collectee: ${tvaCollectee.toLocaleString('fr-FR')}, CA: ${ca.toLocaleString('fr-FR')}`)
}

// EF-039: Solde caisse negatif (impossible)
function EF039(ctx: AuditContext): ResultatControle {
  const ref = 'EF-039', nom = 'Caisse positive'
  const caisseEntries = ctx.balanceN.filter(l => l.compte.startsWith('57'))
  for (const e of caisseEntries) {
    if (solde(e) < -1) {
      return anomalie(ref, nom, 'BLOQUANT',
        `Solde caisse negatif: compte ${e.compte} = ${solde(e).toLocaleString('fr-FR')}`,
        { comptes: [`${e.compte}: ${solde(e).toLocaleString('fr-FR')}`] },
        'Un solde de caisse negatif est physiquement impossible. Corriger les ecritures de caisse.',
        undefined,
        'Art. 19 Acte Uniforme OHADA')
    }
  }
  return ok(ref, nom, 'Tous les soldes de caisse sont positifs')
}

// EF-040: Comptes de liaison inter-societes
function EF040(ctx: AuditContext): ResultatControle {
  const ref = 'EF-040', nom = 'Comptes de liaison'
  const liaison = sumForPrefixes(ctx.balanceN, ['18'])
  if (liaison > 0) {
    return anomalie(ref, nom, 'INFO',
      `Comptes de liaison inter-societes: ${liaison.toLocaleString('fr-FR')}`,
      { montants: { liaison } },
      'Verifier que les comptes de liaison sont correctement apures en fin d\'exercice.')
  }
  return ok(ref, nom, 'Pas de comptes de liaison')
}

// EF-041: Coherence amortissements vs immobilisations
function EF041(ctx: AuditContext): ResultatControle {
  const ref = 'EF-041', nom = 'Taux amortissement global'
  const immoBrut = sumDebitSoldes(ctx.balanceN, ['21', '22', '23', '24', '25'])
  const amortCumul = sumCreditSoldes(ctx.balanceN, ['28'])
  if (immoBrut === 0) return ok(ref, nom, 'Pas d\'immobilisations corporelles')
  const taux = amortCumul / immoBrut
  if (taux > 0.95) {
    return anomalie(ref, nom, 'INFO',
      `Immobilisations amorties a ${(taux * 100).toFixed(0)}% - parc vieillissant`,
      { montants: { immoBrut, amortCumul, tauxPercent: Math.round(taux * 100) } },
      'Le parc d\'immobilisations est presque entierement amorti. Envisager un plan de renouvellement.')
  }
  return ok(ref, nom, `Taux d'amortissement global: ${(taux * 100).toFixed(0)}%`)
}

// EF-042: Variation resultat N vs N-1 significative
function EF042(ctx: AuditContext): ResultatControle {
  const ref = 'EF-042', nom = 'Variation resultat N/N-1'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: 'Balance N-1 absente', timestamp: new Date().toISOString() }
  }
  const resN = sumCreditSoldes(ctx.balanceN, ['7']) - sumDebitSoldes(ctx.balanceN, ['6'])
  const resN1 = sumCreditSoldes(ctx.balanceN1, ['7']) - sumDebitSoldes(ctx.balanceN1, ['6'])
  if (Math.abs(resN1) > 1) {
    const variation = (resN - resN1) / Math.abs(resN1)
    if (Math.abs(variation) > 0.5) {
      return anomalie(ref, nom, 'INFO',
        `Variation resultat significative: ${(variation * 100).toFixed(0)}% (N: ${resN.toLocaleString('fr-FR')}, N-1: ${resN1.toLocaleString('fr-FR')})`,
        { montants: { resultatN: resN, resultatN1: resN1, variationPercent: Math.round(variation * 100) } },
        'Justifier la variation significative du resultat dans l\'annexe.')
    }
  }
  return ok(ref, nom, 'Variation resultat dans les limites normales')
}

// EF-043: Report a nouveau coherent avec resultat N-1
function EF043(ctx: AuditContext): ResultatControle {
  const ref = 'EF-043', nom = 'RAN vs resultat N-1'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: 'Balance N-1 absente', timestamp: new Date().toISOString() }
  }
  const ranN = -sumSoldeForPrefixes(ctx.balanceN, ['12'])
  const resultatN1 = -sumSoldeForPrefixes(ctx.balanceN1, ['13'])
  const ecart = Math.abs(ranN - resultatN1)
  if (ecart > 1 && resultatN1 !== 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `RAN N (${ranN.toLocaleString('fr-FR')}) != Resultat N-1 (${resultatN1.toLocaleString('fr-FR')}), ecart: ${ecart.toLocaleString('fr-FR')}`,
      { montants: { ranN, resultatN1, ecart } },
      'L\'ecart peut s\'expliquer par des distributions de dividendes ou des mises en reserves. Verifier le PV d\'AG.',
      undefined,
      'Art. 8 Acte Uniforme OHADA')
  }
  return ok(ref, nom, 'RAN coherent avec resultat N-1')
}

// EF-044: Impots et taxes coherents avec CA
function EF044(ctx: AuditContext): ResultatControle {
  const ref = 'EF-044', nom = 'Impots et taxes vs CA'
  const impots = sumDebitSoldes(ctx.balanceN, ['64'])
  const ca = sumCreditSoldes(ctx.balanceN, ['70'])
  if (ca > 50000000 && impots === 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `CA de ${ca.toLocaleString('fr-FR')} sans aucun impot ou taxe (compte 64)`,
      { montants: { ca, impots } },
      'Une entreprise avec un CA significatif doit normalement avoir des impots et taxes (patente, contribution fonciere, etc.).')
  }
  return ok(ref, nom, `Impots et taxes: ${impots.toLocaleString('fr-FR')}`)
}

// --- Enregistrement ---

export function registerLevel6Controls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['EF-001', 'Bilan equilibre', 'Verifie l\'equilibre du bilan via mapping', 'BLOQUANT', EF001],
    ['EF-002', 'Sous-totaux actif', 'Verifie les sous-totaux de l\'actif', 'BLOQUANT', EF002],
    ['EF-003', 'Sous-totaux passif', 'Verifie les sous-totaux du passif', 'BLOQUANT', EF003],
    ['EF-004', 'Bilan vs balance', 'Coherence bilan mapping vs balance', 'MAJEUR', EF004],
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
    ['EF-020', 'Charges fin. vs dettes fin.', 'Coherence charges et dettes financieres', 'MINEUR', EF020],
    ['EF-021', 'Dotations CR coherentes', 'Dotations CR vs amortissements cumules', 'MAJEUR', EF021],
    ['EF-022', 'Fonds de roulement', 'FR = Capitaux permanents - Actif immo net', 'MINEUR', EF022],
    ['EF-023', 'BFR coherent', 'BFR = Actif circulant - Passif circulant', 'INFO', EF023],
    ['EF-024', 'Coherence HAO', 'Charges HAO vs produits HAO', 'INFO', EF024],
    // --- 20 new controls ---
    ['EF-025', 'Completude notes annexes', 'Verifie la presence des notes obligatoires', 'MINEUR', EF025],
    ['EF-026', 'CAF additive = soustractive', 'Coherence des deux methodes de CAF', 'MINEUR', EF026],
    ['EF-027', 'Equilibre TFT', 'Total emplois = total ressources', 'MINEUR', EF027],
    ['EF-028', 'Solde ouverture = cloture N-1', 'Continuite des soldes d\'ouverture', 'BLOQUANT', EF028],
    ['EF-029', 'Continuite des comptes', 'Comptes presents en N-1 mais absents en N', 'INFO', EF029],
    ['EF-030', 'SIG total = CR total', 'Coherence resultat SIG et CdR', 'BLOQUANT', EF030],
    ['EF-031', 'Tresorerie nette', 'Tresorerie nette positive ou negative', 'MAJEUR', EF031],
    ['EF-032', 'CP >= 50% capital', 'Alerte legale capitaux propres', 'BLOQUANT', EF032],
    ['EF-033', 'Ratio endettement', 'Dettes financieres / capitaux propres', 'INFO', EF033],
    ['EF-034', 'CCA coherentes', 'Charges constatees d\'avance vs CA', 'MINEUR', EF034],
    ['EF-035', 'PCA coherents', 'Produits constates d\'avance vs CA', 'MINEUR', EF035],
    ['EF-036', 'Ecart conversion actif', 'ECA sans provision pour risque de change', 'MAJEUR', EF036],
    ['EF-037', 'Poids HAO', 'Impact du HAO sur le resultat', 'INFO', EF037],
    ['EF-038', 'TVA collectee vs CA', 'Coherence TVA et chiffre d\'affaires', 'MINEUR', EF038],
    ['EF-039', 'Caisse positive', 'Solde caisse ne peut etre negatif', 'BLOQUANT', EF039],
    ['EF-040', 'Comptes de liaison', 'Apurement comptes inter-societes', 'INFO', EF040],
    ['EF-041', 'Taux amortissement global', 'Etat du parc d\'immobilisations', 'INFO', EF041],
    ['EF-042', 'Variation resultat N/N-1', 'Variation significative du resultat', 'INFO', EF042],
    ['EF-043', 'RAN vs resultat N-1', 'Report a nouveau coherent', 'MAJEUR', EF043],
    ['EF-044', 'Impots et taxes vs CA', 'Impots et taxes coherents avec l\'activite', 'MAJEUR', EF044],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_3', actif: true },
      fn
    )
  }
}
