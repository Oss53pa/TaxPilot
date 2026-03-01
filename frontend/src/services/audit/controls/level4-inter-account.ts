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
    // Calculate totals for montants
    let totalBrut = 0, totalAmort = 0
    for (let i = 0; i <= 9; i++) {
      const brut = find(ctx.balanceN, `2${i}`).filter((l) => !l.compte.startsWith('28') && !l.compte.startsWith('29'))
      const amort = find(ctx.balanceN, `28${i}`)
      totalBrut += brut.reduce((s, l) => s + Math.abs(solde(l)), 0)
      totalAmort += amort.reduce((s, l) => s + Math.abs(solde(l)), 0)
    }
    return anomalie(ref, nom, 'BLOQUANT',
      `Amortissements depassant la valeur brute`,
      {
        comptes: anomalies, ecart: anomalies.length,
        montants: { totalValeurBrute: totalBrut, totalAmortissements: totalAmort, categoriesAnormales: anomalies.length },
        description: `${anomalies.length} categorie(s) d'immobilisations ont des amortissements cumules superieurs a la valeur brute d\'acquisition. C\'est comptablement impossible: un bien ne peut etre amorti au-dela de sa valeur d\'origine. Causes possibles: amortissements non soldes apres cession, erreur de calcul des dotations, ou confusion entre amortissements et depreciations.`,
        attendu: 'Amortissements cumules (28x) <= valeur brute (2x) pour chaque categorie',
        constate: `${anomalies.length} categorie(s) avec amortissements > valeur brute`,
        impactFiscal: 'Amortissements excessifs = charges deduites en trop = resultat fiscal sous-estime = risque de redressement.',
      },
      'Regulariser les amortissements: solder les amortissements des immobilisations cedees ou sorties, verifier les plans d\'amortissement, et corriger les ecritures erronees.',
      'Art. 45 Acte Uniforme OHADA - Amortissements')
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
      {
        comptes: sansAmort,
        montants: { categoriesSansAmort: sansAmort.length },
        description: `${sansAmort.length} categorie(s) d'immobilisations amortissables ne disposent pas de comptes d\'amortissement correspondants (28x). L\'absence d\'amortissement sur des immobilisations amortissables (corporelles et incorporelles) constitue une non-conformite comptable et fiscale.`,
        attendu: 'Chaque immobilisation amortissable dispose d\'un compte d\'amortissement (28x)',
        constate: `${sansAmort.length} categorie(s) sans amortissement correspondant`,
        impactFiscal: 'Amortissements non comptabilises = charges deductibles non utilisees = resultat fiscal sur-estime.',
      },
      'Comptabiliser les dotations aux amortissements manquantes. Verifier les plans d\'amortissement pour chaque categorie d\'immobilisation.',
      'Art. 44-46 Acte Uniforme OHADA - Amortissements obligatoires')
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
      {
        comptes: orphelins.slice(0, 10),
        montants: { amortissementsOrphelins: orphelins.length },
        description: `${orphelins.length} comptes d'amortissement (28x) n'ont pas d'immobilisation correspondante au bilan. Ces amortissements "orphelins" peuvent resulter d\'immobilisations cedees ou mises au rebut dont les amortissements n\'ont pas ete soldes.`,
        attendu: 'Chaque compte d\'amortissement (28x) a une immobilisation brute (2x) correspondante',
        constate: `${orphelins.length} amortissement(s) orphelin(s)`,
        impactFiscal: 'Amortissements orphelins faussent la valeur nette des immobilisations et les dotations futures.',
      },
      'Solder les amortissements orphelins par une ecriture de regularisation: debiter 28x et crediter 2x pour la valeur residuelle, ou passer l\'ecriture de sortie d\'immobilisation.',
      'Art. 45 Acte Uniforme OHADA')
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
    const amortBilan = absSum(find(ctx.balanceN, '28'))
    return anomalie(ref, nom, 'MINEUR',
      'Amortissements au bilan sans dotation au resultat (681/682)',
      {
        montants: { dotations: 0, amortissementsBilan: amortBilan },
        description: `Des amortissements cumules de ${amortBilan.toLocaleString('fr-FR')} FCFA figurent au bilan (28x) mais aucune dotation (681/682) n\'est comptabilisee au compte de resultat. Cela peut indiquer que les dotations de l\'exercice n\'ont pas ete passees, ou que la balance est pre-cloture.`,
        attendu: 'Dotations aux amortissements (681/682) comptabilisees si amortissements au bilan',
        constate: `Amortissements bilan: ${amortBilan.toLocaleString('fr-FR')}, dotations exercice: 0`,
        impactFiscal: 'Dotations omises = charges deductibles perdues (non reportables) = resultat fiscal sur-estime.',
      },
      'Comptabiliser les dotations aux amortissements de l\'exercice (debit 681x, credit 28x). Verifier les plans d\'amortissement.',
      'Art. 44 Acte Uniforme OHADA - Dotations aux amortissements')
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
      {
        comptes: problemes,
        montants: { categoriesAnormales: problemes.length },
        description: `${problemes.length} categorie(s) d'actifs ont des depreciations (29x/39x/49x) superieures a la valeur brute. Une depreciation ne peut exceder 100% de la valeur d\'origine de l\'actif. Causes possibles: depreciation non soldee apres sortie d\'actif, ou cumul de depreciations errone.`,
        attendu: 'Depreciations (29x/39x/49x) <= valeur brute de chaque categorie d\'actif',
        constate: `${problemes.length} categorie(s) avec depreciation excedant la valeur brute`,
        impactFiscal: 'Depreciations excessives = charges deduites en trop = risque de redressement fiscal.',
      },
      'Regulariser les depreciations excessives: solder les depreciations des actifs sortis et verifier les taux de depreciation appliques.',
      'Art. 46 Acte Uniforme OHADA - Depreciations')
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
      {
        montants: { provisions: prov, dotations: 0 },
        description: `Des provisions de ${prov.toLocaleString('fr-FR')} FCFA figurent au bilan (19x) mais aucune dotation (691/697) n\'est comptabilisee au resultat de l\'exercice. Cela peut indiquer des provisions anterieures sans mouvement cette annee, ou des dotations oubliees.`,
        attendu: 'Dotations (691/697) comptabilisees si provisions au bilan (19x)',
        constate: `Provisions bilan: ${prov.toLocaleString('fr-FR')}, dotations exercice: 0`,
        impactFiscal: 'Provisions sans mouvement a justifier individuellement pour eviter la reintegration fiscale.',
      },
      'Verifier si de nouvelles provisions doivent etre comptabilisees (691/697) ou si des reprises sont a passer (791/797). Justifier chaque provision au bilan.',
      'Art. 48 Acte Uniforme OHADA - Provisions pour risques et charges')
  }
  return ok(ref, nom, 'Dotations provisions coherentes')
}

// IC-007: Provision > 10% total bilan
function IC007(ctx: AuditContext): ResultatControle {
  const ref = 'IC-007', nom = 'Provisions elevees'
  const prov = absSum(find(ctx.balanceN, '19'))
  const tb = ctx.balanceN.filter((l) => { const cl = parseInt(l.compte.charAt(0)); return cl >= 1 && cl <= 5 }).reduce((s, l) => s + Math.abs(solde(l)), 0) / 2
  if (tb > 0 && prov > tb * 0.10) {
    const ratio = prov / tb * 100
    return anomalie(ref, nom, 'INFO',
      `Provisions (${prov.toLocaleString('fr-FR')}) > 10% du bilan (${tb.toLocaleString('fr-FR')})`,
      {
        montants: { provisions: prov, totalBilan: tb, ratioPct: Math.round(ratio) },
        description: `Les provisions pour risques et charges (19x) representent ${ratio.toFixed(1)}% du total bilan, ce qui est un niveau eleve. Un montant important de provisions peut indiquer des litiges significatifs, des restructurations en cours, ou des risques majeurs identifies. Chaque provision doit etre individuellement justifiee.`,
        attendu: 'Provisions pour risques et charges < 10% du total bilan',
        constate: `Provisions: ${prov.toLocaleString('fr-FR')} (${ratio.toFixed(1)}% du bilan)`,
        impactFiscal: 'Provisions excessives ou injustifiees = risque de reintegration fiscale et redressement.',
      },
      'Documenter et justifier chaque provision dans les notes annexes (nature du risque, montant, echeance estimee). Verifier qu\'aucune provision n\'est devenue sans objet.')
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
      {
        ecart, montants: { variationBilan, variation603: var603, stocksN, stocksN1 },
        description: `L'ecart entre la variation de stocks au bilan (${variationBilan.toLocaleString('fr-FR')} = stocks N ${stocksN.toLocaleString('fr-FR')} - stocks N-1 ${stocksN1.toLocaleString('fr-FR')}) et le compte 603 (${var603.toLocaleString('fr-FR')}) est de ${ecart.toLocaleString('fr-FR')} FCFA. La variation de stocks au bilan et la variation de stocks au resultat doivent etre symetriques.`,
        attendu: 'Variation stocks bilan = -variation stocks resultat (603)',
        constate: `Variation bilan: ${variationBilan.toLocaleString('fr-FR')}, compte 603: ${var603.toLocaleString('fr-FR')}, ecart: ${ecart.toLocaleString('fr-FR')}`,
        impactFiscal: 'Variation de stocks incoherente fausse le cout des marchandises vendues et le resultat fiscal.',
      },
      'Verifier les ecritures de variation de stocks (603/31x-32x-33x). Recalculer la variation sur la base de l\'inventaire physique.',
      'Art. 43 Acte Uniforme OHADA - Evaluation des stocks')
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
      {
        montants: { chargesPersonnel: chargesPerso },
        description: `Des charges de personnel de ${chargesPerso.toLocaleString('fr-FR')} FCFA sont comptabilisees (classe 66) mais aucune dette sociale n\'apparait au bilan (42x). En situation normale, le dernier mois de salaire et les cotisations sociales doivent etre provisionnes au passif.`,
        attendu: 'Dettes sociales (42x) presentes si charges de personnel comptabilisees',
        constate: `Charges personnel: ${chargesPerso.toLocaleString('fr-FR')}, dettes sociales: 0`,
        impactFiscal: 'Dettes sociales omises = passif sous-estime = ecritures de cloture incompletes.',
      },
      'Verifier que les dettes sociales de fin d\'exercice (salaires a payer, cotisations dues) sont bien comptabilisees au compte 42x.')
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
      {
        montants: { chiffreAffaires: ca },
        description: `Un chiffre d\'affaires de ${ca.toLocaleString('fr-FR')} FCFA est comptabilise sans aucune creance client au bilan. Sauf activite de vente au comptant exclusivement, des creances clients en cours (factures non encore reglees) devraient normalement exister en fin d\'exercice.`,
        attendu: 'Creances clients (411x) presentes si CA > 0',
        constate: `CA: ${ca.toLocaleString('fr-FR')}, creances clients: 0`,
        impactFiscal: 'Absence de creances peut indiquer des produits non declares ou un cut-off defaillant.',
      },
      'Verifier si l\'activite est exclusivement au comptant. Sinon, comptabiliser les creances clients en attente de reglement.')
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
      {
        montants: { achats },
        description: `Des achats de ${achats.toLocaleString('fr-FR')} FCFA sont comptabilises sans aucune dette fournisseur au bilan. Des factures fournisseurs en attente de reglement devraient normalement exister en fin d\'exercice, sauf si tous les achats sont regles au comptant.`,
        attendu: 'Dettes fournisseurs (401x) presentes si achats > 0',
        constate: `Achats: ${achats.toLocaleString('fr-FR')}, fournisseurs: 0`,
        impactFiscal: 'Absence de dettes fournisseurs peut indiquer des factures non parvenues omises (charges sous-estimees).',
      },
      'Verifier la completude des dettes fournisseurs. Comptabiliser les factures non parvenues (FNP) si applicable.')
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
      {
        montants: { chargesFinancieres: interets },
        description: `Des charges financieres de ${interets.toLocaleString('fr-FR')} FCFA sont comptabilisees (67x) sans aucun emprunt au bilan (16x). Les charges financieres peuvent provenir de decouverts bancaires (concours bancaires courants) ou d\'emprunts deja rembourses dans l\'exercice.`,
        attendu: 'Emprunts (16x) au bilan si charges financieres comptabilisees',
        constate: `Charges financieres: ${interets.toLocaleString('fr-FR')}, emprunts: 0`,
        impactFiscal: 'Charges financieres sans dette sous-jacente a justifier pour la deductibilite fiscale.',
      },
      'Verifier l\'origine des charges financieres: agios de decouverts, interets sur comptes courants associes, ou emprunts integralement rembourses.')
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
      {
        montants: { immobilisations: immob, dotations: 0 },
        description: `Des immobilisations de ${immob.toLocaleString('fr-FR')} FCFA figurent au bilan mais aucune dotation aux amortissements (681/682) n\'est comptabilisee au resultat. L\'amortissement est obligatoire pour toutes les immobilisations corporelles et incorporelles a duree de vie limitee.`,
        attendu: 'Dotations aux amortissements (681/682) > 0 si immobilisations au bilan',
        constate: `Immobilisations: ${immob.toLocaleString('fr-FR')}, dotations: 0`,
        impactFiscal: 'Dotations omises = charges deductibles perdues (amortissements non reportables).',
      },
      'Comptabiliser les dotations aux amortissements de l\'exercice. Etablir ou verifier les plans d\'amortissement pour chaque immobilisation.',
      'Art. 44-46 Acte Uniforme OHADA - Amortissements obligatoires')
  }
  if (immob > 0 && dotations > immob * 0.5) {
    return anomalie(ref, nom, 'INFO',
      `Dotations (${dotations.toLocaleString('fr-FR')}) > 50% des immobilisations (${immob.toLocaleString('fr-FR')})`,
      {
        montants: { immobilisations: immob, dotations, ratioPct: Math.round(dotations / immob * 100) },
        description: `Les dotations aux amortissements representent ${(dotations / immob * 100).toFixed(0)}% des immobilisations brutes. Un ratio aussi eleve peut indiquer des durees d\'amortissement tres courtes, des immobilisations anciennes presque totalement amorties, ou une erreur dans les plans d\'amortissement.`,
        attendu: 'Dotations / immobilisations brutes < 50%',
        constate: `Ratio: ${(dotations / immob * 100).toFixed(0)}%`,
        impactFiscal: 'Dotations excessives = charges deduites en trop = risque de reintegration fiscale.',
      },
      'Verifier les durees et taux d\'amortissement appliques. S\'assurer de la coherence avec les durees d\'utilite des actifs.',
      'Art. 45 Acte Uniforme OHADA - Duree d\'amortissement')
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
      {
        montants: { resultat },
        description: `Un resultat beneficiaire de ${resultat.toLocaleString('fr-FR')} FCFA est constate sans aucune charge d\'impot (89x). Un benefice doit normalement generer un impot sur les societes ou au minimum le minimum forfaitaire (IMF). L\'absence d\'impot peut indiquer un oubli de comptabilisation ou un exercice en cours.`,
        attendu: 'Impot (89x) comptabilise si resultat beneficiaire',
        constate: `Resultat: ${resultat.toLocaleString('fr-FR')}, impot: 0`,
        impactFiscal: 'IS non comptabilise = dette fiscale non provisionnee = etats financiers non conformes.',
      },
      'Calculer et comptabiliser l\'impot sur les societes (IS) ou le minimum forfaitaire. Verifier les reports deficitaires eventuels.',
      'CGI - Impot sur les societes')
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
      {
        montants: { ca, tvaCollectee: 0 },
        description: `Un chiffre d\'affaires de ${ca.toLocaleString('fr-FR')} FCFA est realise sans aucune TVA collectee. Sauf regime d\'exoneration (exports, zone franche, activites medicales), la TVA est normalement due sur les ventes de biens et services.`,
        attendu: 'TVA collectee (443x) > 0 si CA > 0 (sauf exoneration)',
        constate: `CA: ${ca.toLocaleString('fr-FR')}, TVA collectee: 0`,
        impactFiscal: 'TVA non collectee = dette TVA potentielle + penalites si assujetti.',
      },
      'Verifier le regime de TVA applicable. Si l\'entreprise est assujettie, comptabiliser la TVA collectee (443x) sur les ventes.',
      'CGI - Regime de TVA')
  }
  if (ca > 0 && tvaCollectee > 0) {
    const ratio = (tvaCollectee / ca) * 100
    if (ratio > 25 || ratio < 10) {
      return anomalie(ref, nom, 'INFO',
        `Ratio TVA/CA atypique: ${ratio.toFixed(1)}%`,
        {
          montants: { ca, tvaCollectee, ratioPct: Math.round(ratio) },
          description: `Le ratio TVA collectee / CA est de ${ratio.toFixed(1)}%, ce qui est en dehors de la fourchette habituelle (10-25%). Avec un taux normal de 18%, le ratio attendu est autour de 18%. Un ratio faible peut indiquer des operations exonerees; un ratio eleve peut signaler une erreur de calcul.`,
          attendu: 'Ratio TVA/CA entre 10% et 25% (taux normal 18%)',
          constate: `Ratio: ${ratio.toFixed(1)}%`,
          impactFiscal: 'Ratio anormal peut indiquer une TVA mal calculee = risque de redressement TVA.',
        },
        'Verifier le taux de TVA applique et identifier les operations exonerees ou a taux reduit.',
        'CGI - Taux de TVA')
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
      {
        montants: { achats, tvaDeductible: 0 },
        description: `Des achats et services de ${achats.toLocaleString('fr-FR')} FCFA sont comptabilises sans TVA deductible (445x). Si l\'entreprise est assujettie a la TVA, elle doit normalement recuperer la TVA sur ses achats. L\'absence peut indiquer un regime d\'exoneration ou un oubli de comptabilisation.`,
        attendu: 'TVA deductible (445x) > 0 si achats > 0 (sauf exoneration)',
        constate: `Achats/services: ${achats.toLocaleString('fr-FR')}, TVA deductible: 0`,
        impactFiscal: 'TVA deductible non comptabilisee = droit a deduction perdu = surcout fiscal.',
      },
      'Verifier si l\'entreprise est assujettie a la TVA. Si oui, comptabiliser la TVA deductible sur les achats et services eligibles.')
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
      {
        montants: { effetsRecevoir: effets },
        description: `Des effets a recevoir (412x) de ${effets.toLocaleString('fr-FR')} FCFA existent sans creances clients (411x). Les effets a recevoir resultent normalement de la mobilisation de creances clients par traites ou billets a ordre.`,
        attendu: 'Creances clients (411x) presentes si effets a recevoir (412x)',
        constate: `Effets a recevoir: ${effets.toLocaleString('fr-FR')}, clients: 0`,
        impactFiscal: 'Effets sans contrepartie client a justifier pour eviter la requalification fiscale.',
      },
      'Verifier l\'origine des effets a recevoir et leur coherence avec le poste clients.')
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
      {
        montants: { effetsPayer: effets },
        description: `Des effets a payer (402x) de ${effets.toLocaleString('fr-FR')} FCFA existent sans dettes fournisseurs (401x). Les effets a payer sont des traites acceptees en reglement de dettes fournisseurs.`,
        attendu: 'Dettes fournisseurs (401x) presentes si effets a payer (402x)',
        constate: `Effets a payer: ${effets.toLocaleString('fr-FR')}, fournisseurs: 0`,
        impactFiscal: 'Effets sans contrepartie fournisseur a justifier pour eviter la requalification.',
      },
      'Verifier l\'origine des effets a payer et leur coherence avec le poste fournisseurs.')
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
      {
        montants: { subventionsBilan: subvBilan },
        description: `Des subventions d\'investissement de ${subvBilan.toLocaleString('fr-FR')} FCFA figurent au bilan (14x) mais aucune reprise n\'est comptabilisee au resultat (71x). Les subventions d\'investissement doivent etre reprises au resultat au rythme des amortissements des biens qu\'elles ont permis d\'acquerir.`,
        attendu: 'Reprise de subventions (71x) au rythme des amortissements des biens subventionnes',
        constate: `Subventions bilan: ${subvBilan.toLocaleString('fr-FR')}, reprises: 0`,
        impactFiscal: 'Reprises de subventions omises = produits imposables non declares = resultat fiscal sous-estime.',
      },
      'Comptabiliser la quote-part de reprise de subventions au resultat (debit 14x, credit 71x) au prorata des amortissements des biens subventionnes.',
      'Art. 47 Acte Uniforme OHADA - Subventions d\'investissement')
  }
  return ok(ref, nom, 'Subventions bilan et produits coherents')
}

// IC-020: Comptes courants associes vs charges financieres
function IC020(ctx: AuditContext): ResultatControle {
  const ref = 'IC-020', nom = 'Comptes courants associes'
  const ccAssocies = absSum(find(ctx.balanceN, '455'))
  const interets = absSum(find(ctx.balanceN, '672'))
  if (ccAssocies > 0 && interets === 0) {
    return anomalie(ref, nom, 'INFO',
      `Comptes courants associes (${ccAssocies.toLocaleString('fr-FR')}) sans interets verses (672x)`,
      {
        montants: { compteCourant: ccAssocies },
        description: `Des comptes courants d'associes de ${ccAssocies.toLocaleString('fr-FR')} FCFA figurent au bilan sans interets comptabilises. Si les comptes courants sont remuneres, les interets doivent etre comptabilises et declares.`,
        attendu: 'Interets comptabilises si comptes courants remuneres',
        constate: `Comptes courants: ${ccAssocies.toLocaleString('fr-FR')}, Interets: 0`,
        impactFiscal: 'Les interets sur comptes courants sont deductibles dans la limite du taux legal. Verifier la convention.',
      },
      'Si les comptes courants sont remuneres, comptabiliser les interets au taux convenu (plafond fiscal: taux legal + 2 points).')
  }
  return ok(ref, nom, 'Comptes courants associes coherents')
}

// IC-021: Charges constatees d'avance vs charges
function IC021(ctx: AuditContext): ResultatControle {
  const ref = 'IC-021', nom = 'Charges constatees d\'avance'
  const cca = absSum(find(ctx.balanceN, '476'))
  const totalCharges = absSum([...find(ctx.balanceN, '6')])
  if (cca > 0 && totalCharges > 0 && cca > totalCharges * 0.20) {
    const ratio = (cca / totalCharges * 100).toFixed(1)
    return anomalie(ref, nom, 'MINEUR',
      `CCA (${cca.toLocaleString('fr-FR')}) > 20% des charges (${totalCharges.toLocaleString('fr-FR')}) — ratio ${ratio}%`,
      {
        montants: { cca, totalCharges, ratioPct: parseFloat(ratio) },
        description: `Les charges constatees d'avance representent ${ratio}% du total des charges, un ratio anormalement eleve qui peut indiquer une surestimation des CCA pour ameliorer le resultat.`,
        attendu: 'CCA < 20% des charges totales',
        constate: `CCA: ${cca.toLocaleString('fr-FR')}, ratio: ${ratio}%`,
        impactFiscal: 'CCA surestimees = charges de l\'exercice minorees = resultat fiscal majore artificiellement.',
      },
      'Justifier chaque CCA par un document probant (facture, contrat). Verifier la date de rattachement economique.',
      'Art. 49 Acte Uniforme OHADA - Rattachement des charges')
  }
  return ok(ref, nom, 'Charges constatees d\'avance coherentes')
}

// IC-022: Produits constates d'avance vs produits
function IC022(ctx: AuditContext): ResultatControle {
  const ref = 'IC-022', nom = 'Produits constates d\'avance'
  const pca = absSum(find(ctx.balanceN, '477'))
  const totalProduits = absSum([...find(ctx.balanceN, '7')])
  if (pca > 0 && totalProduits > 0 && pca > totalProduits * 0.20) {
    const ratio = (pca / totalProduits * 100).toFixed(1)
    return anomalie(ref, nom, 'MINEUR',
      `PCA (${pca.toLocaleString('fr-FR')}) > 20% des produits (${totalProduits.toLocaleString('fr-FR')}) — ratio ${ratio}%`,
      {
        montants: { pca, totalProduits, ratioPct: parseFloat(ratio) },
        description: `Les produits constates d'avance representent ${ratio}% du total des produits, un ratio eleve qui peut indiquer un report de chiffre d'affaires sur l'exercice suivant.`,
        attendu: 'PCA < 20% des produits totaux',
        constate: `PCA: ${pca.toLocaleString('fr-FR')}, ratio: ${ratio}%`,
        impactFiscal: 'PCA surestimes = produits de l\'exercice minores = resultat fiscal minore — risque de redressement.',
      },
      'Justifier chaque PCA par un document probant. Verifier la date de realisation effective des produits.')
  }
  return ok(ref, nom, 'Produits constates d\'avance coherents')
}

// IC-023: Charges a payer vs charges
function IC023(ctx: AuditContext): ResultatControle {
  const ref = 'IC-023', nom = 'Charges a payer'
  const cap = absSum(find(ctx.balanceN, '408'))  // FNP
  const capSociales = absSum(find(ctx.balanceN, '428'))
  const capFiscales = absSum(find(ctx.balanceN, '448'))
  const totalCAP = cap + capSociales + capFiscales
  const ca = absSum(find(ctx.balanceN, '70'))
  if (ca > 1000000 && totalCAP === 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Aucune charge a payer malgre un CA de ${ca.toLocaleString('fr-FR')}`,
      {
        montants: { chiffreAffaires: ca, chargesAPayer: 0 },
        description: 'Pour une entreprise en activite, des charges a payer (factures non parvenues, charges sociales/fiscales dues) existent normalement en fin d\'exercice. Leur absence peut indiquer des ecritures de cloture incompletes.',
        attendu: 'Charges a payer > 0 pour une entreprise en activite',
        constate: 'Aucune charge a payer comptabilisee (408/428/448)',
        impactFiscal: 'Charges a payer omises = charges de l\'exercice sous-estimees = resultat fiscal sur-estime.',
      },
      'Passer les ecritures de cloture: factures non parvenues (408), charges sociales a payer (428), charges fiscales a payer (448).',
      'Art. 48 Acte Uniforme OHADA - Rattachement des charges')
  }
  return ok(ref, nom, `Charges a payer: ${totalCAP.toLocaleString('fr-FR')}`)
}

// IC-024: Transferts de charges coherents
function IC024(ctx: AuditContext): ResultatControle {
  const ref = 'IC-024', nom = 'Transferts de charges'
  const transferts = absSum(find(ctx.balanceN, '78'))
  const totalCharges = absSum([...find(ctx.balanceN, '6')])
  if (transferts > 0 && totalCharges > 0 && transferts > totalCharges * 0.15) {
    const ratio = (transferts / totalCharges * 100).toFixed(1)
    return anomalie(ref, nom, 'MINEUR',
      `Transferts de charges (${transferts.toLocaleString('fr-FR')}) > 15% des charges (ratio ${ratio}%)`,
      {
        montants: { transferts, totalCharges, ratioPct: parseFloat(ratio) },
        description: `Les transferts de charges representent ${ratio}% des charges totales. Un ratio eleve peut indiquer une activation abusive de charges ou des erreurs de classification.`,
        attendu: 'Transferts de charges < 15% des charges totales',
        constate: `Ratio: ${ratio}%`,
        impactFiscal: 'Transferts de charges excessifs = resultat artificiellement ameliore — risque de requalification fiscale.',
      },
      'Justifier chaque transfert de charges: immobilisations produites par l\'entreprise, frais de distribution capitalises, etc.')
  }
  return ok(ref, nom, 'Transferts de charges coherents')
}

// IC-025: Ecart de conversion coherent
function IC025(ctx: AuditContext): ResultatControle {
  const ref = 'IC-025', nom = 'Ecarts de conversion'
  const ecaActif = absSum(find(ctx.balanceN, '478'))
  const ecaPassif = absSum(find(ctx.balanceN, '479'))
  const provECA = absSum(find(ctx.balanceN, '194'))
  if (ecaActif > 0 && provECA === 0) {
    return {
      ref, nom, niveau: NIVEAU, statut: 'ANOMALIE' as const, severite: 'MINEUR' as const,
      message: `Ecart de conversion actif (${ecaActif.toLocaleString('fr-FR')}) sans provision (194x)`,
      details: {
        montants: { ecartActif: ecaActif, ecartPassif: ecaPassif, provision: 0 },
        description: `Des ecarts de conversion actif de ${ecaActif.toLocaleString('fr-FR')} FCFA (pertes latentes de change) existent sans provision correspondante. Le principe de prudence impose de provisionner les pertes latentes de change.`,
        attendu: 'Provision >= ecart de conversion actif',
        constate: `ECA: ${ecaActif.toLocaleString('fr-FR')}, Provision: 0`,
        impactFiscal: 'Provision pour perte de change deductible fiscalement si correctement constituee.',
      },
      suggestion: 'Constituer une provision pour perte de change d\'un montant au moins egal a l\'ecart de conversion actif.',
      ecrituresCorrectives: [{
        journal: 'OD', date: new Date().toISOString().slice(0, 10),
        lignes: [
          { sens: 'D' as const, compte: '691600', libelle: 'Dotation provision perte de change', montant: ecaActif },
          { sens: 'C' as const, compte: '194000', libelle: 'Provision perte de change', montant: ecaActif },
        ],
        commentaire: 'Provision perte de change sur ecarts de conversion actif'
      }],
      referenceReglementaire: 'Art. 54 Acte Uniforme OHADA - Ecarts de conversion',
      timestamp: new Date().toISOString(),
    }
  }
  return ok(ref, nom, `Ecarts de conversion: Actif ${ecaActif.toLocaleString('fr-FR')}, Passif ${ecaPassif.toLocaleString('fr-FR')}`)
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
    ['IC-020', 'Comptes courants associes', 'Coherence CC vs interets', 'INFO', IC020],
    ['IC-021', 'Charges constatees d\'avance', 'CCA vs charges totales', 'MINEUR', IC021],
    ['IC-022', 'Produits constates d\'avance', 'PCA vs produits totaux', 'MINEUR', IC022],
    ['IC-023', 'Charges a payer', 'Presence de charges a payer', 'MINEUR', IC023],
    ['IC-024', 'Transferts de charges', 'Coherence transferts de charges', 'MINEUR', IC024],
    ['IC-025', 'Ecarts de conversion', 'Coherence ECA/ECP vs provisions', 'MINEUR', IC025],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_1', actif: true },
      fn
    )
  }
}
