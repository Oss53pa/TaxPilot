/**
 * Niveau 7 - Controles fiscaux (FI-001 a FI-010)
 * 10 controles verifiant la conformite fiscale
 */

import { AuditContext, ResultatControle, NiveauControle } from '@/types/audit.types'
import { BalanceEntry } from '@/services/liasseDataService'
import { controlRegistry } from '../controlRegistry'
import { getTauxFiscaux } from '@/config/taux-fiscaux-ci'

const NIVEAU: NiveauControle = 7

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
function absSum(entries: BalanceEntry[]): number { return entries.reduce((s, l) => s + Math.abs(solde(l)), 0) }
// FI-001: Resultat fiscal >= 0 ou deficit justifie
function FI001(ctx: AuditContext): ResultatControle {
  const ref = 'FI-001', nom = 'Resultat fiscal'
  const resultat = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  if (resultat < 0) {
    return anomalie(ref, nom, 'INFO',
      `Resultat deficitaire: ${resultat.toLocaleString('fr-FR')}`,
      {
        montants: { resultatNet: resultat },
        description: `Le resultat de l\'exercice est deficitaire (${resultat.toLocaleString('fr-FR')} FCFA). Un deficit est reportable sur les 5 exercices suivants (sauf amortissements reputes differes). L\'entreprise reste neanmoins redevable du minimum forfaitaire d\'imposition (IMF). Le deficit doit etre justifie et documente dans la declaration fiscale.`,
        attendu: 'Resultat beneficiaire ou deficit justifie',
        constate: `Resultat deficitaire de ${resultat.toLocaleString('fr-FR')} FCFA`,
        impactFiscal: 'Deficit reportable sur 5 exercices. IMF reste du meme si deficit. Report illimite pour amortissements reputes differes.',
      },
      'Constituer le dossier de report deficitaire. S\'assurer du paiement du minimum forfaitaire (IMF). Documenter les causes du deficit dans la liasse fiscale.',
      undefined,
      'Art. 7 CGI - Report deficitaire sur 5 exercices')
  }
  return ok(ref, nom, `Resultat: ${resultat.toLocaleString('fr-FR')}`)
}

// FI-002: Reintegrations amortissements vehicules (plafond)
function FI002(ctx: AuditContext): ResultatControle {
  const ref = 'FI-002', nom = 'Amort. vehicules tourisme'
  // Amortissement des vehicules de tourisme (245x) - plafond OHADA
  const valeurVehicules = absSum(find(ctx.balanceN, '245'))
  // Plafond: amortissement sur base max de 25 000 000 FCFA par vehicule
  if (valeurVehicules > 25000000) {
    const exces = valeurVehicules - 25000000
    return anomalie(ref, nom, 'MINEUR',
      `Vehicules de tourisme: ${valeurVehicules.toLocaleString('fr-FR')} (plafond fiscal: 25 000 000)`,
      {
        montants: { valeurVehicules, plafond: 25000000, excesAReintegrer: exces },
        description: `La valeur des vehicules de tourisme (${valeurVehicules.toLocaleString('fr-FR')} FCFA) depasse le plafond fiscal de 25 000 000 FCFA. L\'amortissement sur la fraction excedentaire (${exces.toLocaleString('fr-FR')}) n\'est pas deductible fiscalement et doit etre reintegre dans le resultat fiscal.`,
        attendu: 'Valeur individuelle vehicules tourisme <= 25 000 000 FCFA',
        constate: `Valeur vehicules: ${valeurVehicules.toLocaleString('fr-FR')}, exces: ${exces.toLocaleString('fr-FR')}`,
        impactFiscal: `Reintegration estimee de ${Math.round(exces * 0.2).toLocaleString('fr-FR')} FCFA (amortissement sur base excedentaire).`,
      },
      `Reintegrer dans le tableau de determination du resultat fiscal la fraction d\'amortissement calculee sur l\'exces de ${exces.toLocaleString('fr-FR')} FCFA au-dela du plafond.`,
      [{
        journal: 'FISCAL', date: new Date().toISOString().slice(0, 10),
        lignes: [{ sens: 'D' as const, compte: 'REINTEG', libelle: 'Reintegration amort. vehicules > 25M', montant: Math.round(exces * 0.2) }],
        commentaire: 'Reintegration fiscale estimee (taux 20% sur base excedentaire)'
      }],
      'Art. 8-1 CGI CEMAC - Plafond amortissement vehicules tourisme')
  }
  return ok(ref, nom, 'Vehicules de tourisme dans les limites')
}

// FI-003: Charges somptuaires
function FI003(ctx: AuditContext): ResultatControle {
  const ref = 'FI-003', nom = 'Charges somptuaires'
  // Charges non deductibles typiques: 627x (receptions, cadeaux), 628x
  const receptions = absSum(find(ctx.balanceN, '627'))
  const ca = absSum(find(ctx.balanceN, '70'))
  if (ca > 0 && receptions > ca * 0.01) {
    const ratio = receptions / ca * 100
    const excedent = receptions - ca * 0.01
    return anomalie(ref, nom, 'MINEUR',
      `Receptions et cadeaux (${receptions.toLocaleString('fr-FR')}) > 1% du CA (${ca.toLocaleString('fr-FR')})`,
      {
        montants: { receptions, ca, ratioPct: Math.round(ratio * 10) / 10, excedentAReintegrer: excedent },
        description: `Les charges de receptions et cadeaux (627x) representent ${ratio.toFixed(1)}% du chiffre d\'affaires, depassant le seuil de 1%. L\'excedent de ${excedent.toLocaleString('fr-FR')} FCFA n\'est pas deductible fiscalement et doit etre reintegre dans le resultat fiscal.`,
        attendu: 'Charges de receptions et cadeaux < 1% du CA',
        constate: `Ratio: ${ratio.toFixed(1)}%, excedent: ${excedent.toLocaleString('fr-FR')}`,
        impactFiscal: `Reintegration de ${excedent.toLocaleString('fr-FR')} FCFA dans le resultat fiscal.`,
      },
      `Reintegrer l'excedent de ${excedent.toLocaleString('fr-FR')} FCFA dans le tableau de passage du resultat comptable au resultat fiscal.`,
      [{
        journal: 'FISCAL', date: new Date().toISOString().slice(0, 10),
        lignes: [{ sens: 'D' as const, compte: 'REINTEG', libelle: 'Reintegration charges somptuaires excedentaires', montant: excedent }],
        commentaire: 'Excedent charges somptuaires au-dela de 1% du CA'
      }],
      'CGI - Charges somptuaires')
  }
  return ok(ref, nom, 'Charges somptuaires dans les limites')
}

// FI-004: Amendes et penalites (non deductibles)
function FI004(ctx: AuditContext): ResultatControle {
  const ref = 'FI-004', nom = 'Amendes et penalites'
  const amendes = absSum([...find(ctx.balanceN, '6471'), ...find(ctx.balanceN, '6478')])
  if (amendes > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Amendes et penalites: ${amendes.toLocaleString('fr-FR')} (non deductibles)`,
      {
        montants: { amendes },
        description: `Des amendes et penalites de ${amendes.toLocaleString('fr-FR')} FCFA sont comptabilisees (6471x/6478x). Ces charges sont integralement non deductibles du resultat fiscal et doivent etre reintegrees dans le tableau de passage au resultat fiscal.`,
        attendu: 'Aucune amende ou penalite, ou reintegration fiscale effectuee',
        constate: `Amendes et penalites: ${amendes.toLocaleString('fr-FR')} FCFA`,
        impactFiscal: `Reintegration obligatoire de ${amendes.toLocaleString('fr-FR')} FCFA (100% non deductible).`,
      },
      `Reintegrer la totalite des amendes (${amendes.toLocaleString('fr-FR')} FCFA) dans le resultat fiscal. Documenter la nature et l'origine de chaque penalite.`,
      [{
        journal: 'FISCAL', date: new Date().toISOString().slice(0, 10),
        lignes: [{ sens: 'D' as const, compte: 'REINTEG', libelle: 'Reintegration amendes et penalites', montant: amendes }],
        commentaire: 'Amendes et penalites - 100% non deductibles'
      }],
      'Art. 8-d CGI - Charges non deductibles')
  }
  return ok(ref, nom, 'Aucune amende ou penalite comptabilisee')
}

// FI-005: Dons et liberalites (plafond)
function FI005(ctx: AuditContext): ResultatControle {
  const ref = 'FI-005', nom = 'Dons et liberalites'
  const dons = absSum(find(ctx.balanceN, '6234'))
  const ca = absSum(find(ctx.balanceN, '70'))
  const plafond = ca * 0.001 // 1 pour mille
  if (dons > plafond && plafond > 0) {
    const exces = dons - plafond
    return anomalie(ref, nom, 'MINEUR',
      `Dons (${dons.toLocaleString('fr-FR')}) > plafond 1‰ du CA (${plafond.toLocaleString('fr-FR')})`,
      {
        montants: { dons, plafond, ca, excesAReintegrer: exces },
        description: `Les dons et liberalites (6234x) de ${dons.toLocaleString('fr-FR')} FCFA depassent le plafond de deductibilite de 1 pour mille du CA (${plafond.toLocaleString('fr-FR')} FCFA). L'excedent de ${exces.toLocaleString('fr-FR')} FCFA doit etre reintegre au resultat fiscal.`,
        attendu: `Dons et liberalites <= 1‰ du CA (${plafond.toLocaleString('fr-FR')})`,
        constate: `Dons: ${dons.toLocaleString('fr-FR')}, plafond: ${plafond.toLocaleString('fr-FR')}, exces: ${exces.toLocaleString('fr-FR')}`,
        impactFiscal: `Reintegration de ${exces.toLocaleString('fr-FR')} FCFA dans le resultat fiscal.`,
      },
      `Reintegrer l'excedent de ${exces.toLocaleString('fr-FR')} FCFA dans le tableau de passage au resultat fiscal.`,
      undefined,
      'Art. 8-e CGI - Plafond dons et liberalites')
  }
  return ok(ref, nom, 'Dons dans les limites du plafond')
}

// FI-006: Provisions non deductibles
function FI006(ctx: AuditContext): ResultatControle {
  const ref = 'FI-006', nom = 'Provisions non deductibles'
  const provisions = absSum([...find(ctx.balanceN, '691'), ...find(ctx.balanceN, '697')])
  if (provisions > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Dotations aux provisions: ${provisions.toLocaleString('fr-FR')} - verifier la deductibilite`,
      {
        montants: { dotationsProvisions: provisions },
        description: `Des dotations aux provisions de ${provisions.toLocaleString('fr-FR')} FCFA sont comptabilisees (691/697). Certaines provisions ne sont pas deductibles fiscalement: provisions pour propre assurance, provisions a caractere de reserves, provisions sans objet precis. Chaque provision doit etre examinee individuellement pour determiner sa deductibilite.`,
        attendu: 'Provisions individuellement justifiees et deductibles',
        constate: `Dotations aux provisions: ${provisions.toLocaleString('fr-FR')} FCFA a verifier`,
        impactFiscal: 'Provisions non deductibles a reintegrer dans le resultat fiscal. Risque de redressement si non justifiees.',
      },
      'Examiner chaque provision individuellement. Reintegrer les provisions non deductibles dans le resultat fiscal. Justifier les provisions deductibles par des elements probants.',
      undefined,
      'CGI - Deductibilite des provisions')
  }
  return ok(ref, nom, 'Pas de dotation aux provisions')
}

// FI-007: IS calcule vs IS comptabilise
function FI007(ctx: AuditContext): ResultatControle {
  const ref = 'FI-007', nom = 'IS calcule vs comptabilise'
  const resultat = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const isComptabilise = absSum(find(ctx.balanceN, '89'))

  if (resultat > 0) {
    const taux = getTauxFiscaux()
    const isEstime = resultat * taux.IS.taux_normal
    if (isComptabilise > 0) {
      const ecart = Math.abs(isEstime - isComptabilise)
      if (ecart > isEstime * 0.3) {
        return anomalie(ref, nom, 'MAJEUR',
          `IS comptabilise (${isComptabilise.toLocaleString('fr-FR')}) significativement different de l'estime (${isEstime.toLocaleString('fr-FR')} @ ${taux.IS.taux_normal * 100}%)`,
          {
            montants: { isComptabilise, isEstime, resultat, ecart, tauxIS: taux.IS.taux_normal * 100 },
            description: `L'IS comptabilise (${isComptabilise.toLocaleString('fr-FR')}) differe de ${ecart.toLocaleString('fr-FR')} FCFA par rapport a l'estimation au taux normal de ${taux.IS.taux_normal * 100}% (${isEstime.toLocaleString('fr-FR')}). L\'ecart peut s\'expliquer par des reintegrations, des deductions fiscales, un taux reduit, ou une erreur de calcul.`,
            attendu: `IS proche de ${isEstime.toLocaleString('fr-FR')} (taux ${taux.IS.taux_normal * 100}%)`,
            constate: `IS comptabilise: ${isComptabilise.toLocaleString('fr-FR')}, ecart: ${ecart.toLocaleString('fr-FR')}`,
            impactFiscal: 'IS mal calcule = risque de complement d\'impot, majorations et penalites de retard.',
          },
          'Verifier le calcul de l\'IS: reintegrations extracomptables, deductions, credits d\'impot, et reports deficitaires. S\'assurer que le taux applique est correct.')
      }
    } else {
      return anomalie(ref, nom, 'MAJEUR',
        `Resultat beneficiaire (${resultat.toLocaleString('fr-FR')}) sans IS comptabilise (89x)`,
        {
          montants: { resultat, isEstime: resultat * taux.IS.taux_normal },
          description: `Un resultat beneficiaire de ${resultat.toLocaleString('fr-FR')} FCFA est constate sans aucun impot comptabilise (89x). L\'IS estime au taux normal de ${taux.IS.taux_normal * 100}% serait de ${(resultat * taux.IS.taux_normal).toLocaleString('fr-FR')} FCFA.`,
          attendu: `IS comptabilise de ${(resultat * taux.IS.taux_normal).toLocaleString('fr-FR')} (taux ${taux.IS.taux_normal * 100}%)`,
          constate: 'Aucun IS comptabilise (89x = 0)',
          impactFiscal: `IS non comptabilise = dette fiscale potentielle de ${(resultat * taux.IS.taux_normal).toLocaleString('fr-FR')} FCFA + penalites.`,
        },
        `Comptabiliser l'impot sur les societes. IS estime: ${(resultat * taux.IS.taux_normal).toLocaleString('fr-FR')} FCFA au taux de ${taux.IS.taux_normal * 100}%.`)
    }
  }
  return ok(ref, nom, 'IS coherent avec le resultat')
}

// FI-008: Minimum forfaitaire (IMF)
function FI008(ctx: AuditContext): ResultatControle {
  const ref = 'FI-008', nom = 'Minimum forfaitaire (IMF)'
  const ca = absSum(find(ctx.balanceN, '70'))
  const isComptabilise = absSum(find(ctx.balanceN, '89'))
  if (ca > 0) {
    const taux = getTauxFiscaux()
    const imf = Math.max(ca * taux.IMF.taux, taux.IMF.minimum)
    if (isComptabilise > 0 && isComptabilise < imf) {
      return anomalie(ref, nom, 'MINEUR',
        `IS (${isComptabilise.toLocaleString('fr-FR')}) < IMF (${imf.toLocaleString('fr-FR')}) = ${taux.IMF.taux * 100}% du CA (min ${taux.IMF.minimum.toLocaleString('fr-FR')})`,
        {
          montants: { isComptabilise, imf, ca, complement: imf - isComptabilise },
          description: `L'impot comptabilise (${isComptabilise.toLocaleString('fr-FR')}) est inferieur au minimum forfaitaire d\'imposition (IMF = ${imf.toLocaleString('fr-FR')} FCFA, soit ${taux.IMF.taux * 100}% du CA avec un minimum de ${taux.IMF.minimum.toLocaleString('fr-FR')}). L\'entreprise doit payer au minimum l\'IMF, soit un complement de ${(imf - isComptabilise).toLocaleString('fr-FR')} FCFA.`,
          attendu: `IS >= IMF de ${imf.toLocaleString('fr-FR')} (${taux.IMF.taux * 100}% du CA)`,
          constate: `IS: ${isComptabilise.toLocaleString('fr-FR')}, IMF: ${imf.toLocaleString('fr-FR')}, complement: ${(imf - isComptabilise).toLocaleString('fr-FR')}`,
          impactFiscal: `Complement d'IS de ${(imf - isComptabilise).toLocaleString('fr-FR')} FCFA a payer au titre de l'IMF.`,
        },
        `Ajuster l'IS au montant de l'IMF: comptabiliser un complement de ${(imf - isComptabilise).toLocaleString('fr-FR')} FCFA.`,
        undefined,
        'CGI - Minimum forfaitaire d\'imposition')
    }
  }
  return ok(ref, nom, 'IMF respecte')
}

// FI-009: TVA a reverser coherente
function FI009(ctx: AuditContext): ResultatControle {
  const ref = 'FI-009', nom = 'TVA a reverser'
  const tvaCollectee = absSum(find(ctx.balanceN, '443'))
  const tvaDeductible = absSum(find(ctx.balanceN, '445'))
  const tvaDue = absSum(find(ctx.balanceN, '444'))
  if (tvaCollectee > 0 && tvaDeductible > 0) {
    const soldeTheorique = tvaCollectee - tvaDeductible
    if (soldeTheorique > 0 && tvaDue === 0) {
      return anomalie(ref, nom, 'MINEUR',
        `TVA due theorique (${soldeTheorique.toLocaleString('fr-FR')}) non comptabilisee (444x)`,
        {
          montants: { tvaCollectee, tvaDeductible, soldeTheorique },
          description: `La TVA collectee (${tvaCollectee.toLocaleString('fr-FR')}) depasse la TVA deductible (${tvaDeductible.toLocaleString('fr-FR')}), generant un solde de TVA a reverser de ${soldeTheorique.toLocaleString('fr-FR')} FCFA qui n\'est pas comptabilise au compte 444x. Ce montant doit etre declare et paye a l\'administration fiscale.`,
          attendu: 'TVA due (444x) = TVA collectee (443x) - TVA deductible (445x)',
          constate: `TVA due: 0, solde theorique: ${soldeTheorique.toLocaleString('fr-FR')}`,
          impactFiscal: `TVA non reversee de ${soldeTheorique.toLocaleString('fr-FR')} FCFA = dette fiscale + penalites de retard.`,
        },
        'Comptabiliser la TVA due au compte 444x. Verifier la concordance avec les declarations mensuelles de TVA.',
        [{
          journal: 'OD', date: new Date().toISOString().slice(0, 10),
          lignes: [
            { sens: 'D' as const, compte: '443000', libelle: 'TVA collectee - apurement', montant: soldeTheorique },
            { sens: 'C' as const, compte: '444000', libelle: 'Etat - TVA due', montant: soldeTheorique },
          ],
          commentaire: 'Centralisation TVA: transfert solde TVA collectee vers TVA due'
        }],
        'CGI - Declarations et paiement de la TVA')
    }
  }
  return ok(ref, nom, 'TVA a reverser coherente')
}

// FI-010: Charges personnel vs CNPS/NSIF
function FI010(ctx: AuditContext): ResultatControle {
  const ref = 'FI-010', nom = 'Charges personnel vs cotisations'
  const chargesPerso = absSum(find(ctx.balanceN, '66'))
  const cotisations = absSum([...find(ctx.balanceN, '664'), ...find(ctx.balanceN, '6413')])
  if (chargesPerso > 0 && cotisations === 0) {
    return anomalie(ref, nom, 'INFO',
      `Charges de personnel (${chargesPerso.toLocaleString('fr-FR')}) sans cotisations sociales (664x/6413x)`,
      {
        montants: { chargesPersonnel: chargesPerso },
        description: `Des charges de personnel de ${chargesPerso.toLocaleString('fr-FR')} FCFA sont comptabilisees sans aucune cotisation sociale patronale. L\'employeur est tenu de declarer et payer les cotisations CNPS (ou equivalent) sur les salaires verses.`,
        attendu: 'Cotisations sociales comptabilisees en coherence avec les charges de personnel',
        constate: `Charges personnel: ${chargesPerso.toLocaleString('fr-FR')}, cotisations: 0`,
        impactFiscal: 'Cotisations non declarees = risque de redressement CNPS + majorations + charges non deductibles.',
      },
      'Verifier les declarations sociales (CNPS/NSIF/CSS). Comptabiliser les cotisations patronales au compte 664x.')
  }
  if (chargesPerso > 0 && cotisations > 0) {
    const ratio = (cotisations / chargesPerso) * 100
    if (ratio < 10) {
      return anomalie(ref, nom, 'INFO',
        `Ratio cotisations/salaires faible: ${ratio.toFixed(1)}%`,
        {
          montants: { chargesPersonnel: chargesPerso, cotisations, ratioPct: Math.round(ratio * 10) / 10 },
          description: `Le ratio cotisations sociales / charges de personnel est de ${ratio.toFixed(1)}%, ce qui est inhabituellement bas. Les taux de cotisations patronales (CNPS, prevoyance, accidents du travail) representent generalement 15-25% de la masse salariale brute.`,
          attendu: 'Ratio cotisations/salaires entre 15% et 25%',
          constate: `Ratio: ${ratio.toFixed(1)}%`,
          impactFiscal: 'Cotisations sous-estimees = risque de redressement CNPS et charges patronales non deductibles.',
        },
        'Verifier l\'exhaustivite des cotisations sociales: prestations familiales, accidents du travail, retraite. S\'assurer que les declarations CNPS sont a jour.')
    }
  }
  return ok(ref, nom, 'Coherence charges personnel / cotisations')
}

// FI-011: Dons au-dela du plafond 5‰ du CA (comptes 658)
function FI011(ctx: AuditContext): ResultatControle {
  const ref = 'FI-011', nom = 'Dons excedentaires (658)'
  const dons = absSum(find(ctx.balanceN, '658'))
  const ca = absSum(find(ctx.balanceN, '70'))
  const taux = getTauxFiscaux()
  const plafond = ca * taux.DEDUCTIBILITE.plafond_dons // 5‰
  if (dons > plafond && plafond > 0) {
    const exces = dons - plafond
    return anomalie(ref, nom, 'MINEUR',
      `Dons (${dons.toLocaleString('fr-FR')}) > plafond 5‰ CA (${plafond.toLocaleString('fr-FR')}), exces: ${exces.toLocaleString('fr-FR')}`,
      {
        montants: { dons, plafond, ca, exces },
        description: `Les dons comptabilises au compte 658 (${dons.toLocaleString('fr-FR')} FCFA) depassent le plafond de deductibilite de 5 pour mille du CA (${plafond.toLocaleString('fr-FR')} FCFA). L'excedent de ${exces.toLocaleString('fr-FR')} FCFA est fiscalement non deductible.`,
        attendu: `Dons (658x) <= 5‰ du CA (${plafond.toLocaleString('fr-FR')})`,
        constate: `Dons: ${dons.toLocaleString('fr-FR')}, exces: ${exces.toLocaleString('fr-FR')}`,
        impactFiscal: `Reintegration de ${exces.toLocaleString('fr-FR')} FCFA dans le resultat fiscal.`,
      },
      `Reintegrer l'excedent de ${exces.toLocaleString('fr-FR')} FCFA dans le resultat fiscal.`,
      undefined,
      'CGI Art. 18-5 - Plafond dons')
  }
  return ok(ref, nom, 'Dons dans les limites (5‰ du CA)')
}

// FI-012: Charges somptuaires (compte 6257) — 100% non deductibles
function FI012(ctx: AuditContext): ResultatControle {
  const ref = 'FI-012', nom = 'Charges somptuaires (6257)'
  const somptuaires = absSum(find(ctx.balanceN, '6257'))
  if (somptuaires > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Charges somptuaires: ${somptuaires.toLocaleString('fr-FR')} (100% non deductibles)`,
      {
        montants: { somptuaires },
        description: `Des charges somptuaires de ${somptuaires.toLocaleString('fr-FR')} FCFA sont comptabilisees au compte 6257. Ces depenses de luxe (residence personnelle, chasse, peche, yacht, etc.) sont integralement non deductibles du resultat fiscal.`,
        attendu: 'Aucune charge somptuaire ou reintegration fiscale effectuee',
        constate: `Charges somptuaires (6257): ${somptuaires.toLocaleString('fr-FR')} FCFA`,
        impactFiscal: `Reintegration obligatoire de ${somptuaires.toLocaleString('fr-FR')} FCFA (100% non deductible).`,
      },
      `Reintegrer la totalite (${somptuaires.toLocaleString('fr-FR')} FCFA) dans le resultat fiscal. Documenter la nature des depenses somptuaires.`,
      undefined,
      'CGI Art. 18-6 - Charges somptuaires non deductibles')
  }
  return ok(ref, nom, 'Aucune charge somptuaire detectee')
}

// FI-013: Interets comptes courants associes — plafond fiscal
function FI013(ctx: AuditContext): ResultatControle {
  const ref = 'FI-013', nom = 'Interets comptes courants'
  const interetsCC = absSum(find(ctx.balanceN, '672'))
  const ccAssocies = absSum(find(ctx.balanceN, '455'))
  if (interetsCC > 0 && ccAssocies > 0) {
    const taux = getTauxFiscaux()
    const tauxPlafond = taux.DEDUCTIBILITE.plafond_interets_cc
    const interetsMax = ccAssocies * tauxPlafond
    if (interetsCC > interetsMax) {
      const exces = interetsCC - interetsMax
      return anomalie(ref, nom, 'MINEUR',
        `Interets CC (${interetsCC.toLocaleString('fr-FR')}) > plafond ${(tauxPlafond * 100).toFixed(1)}% (${interetsMax.toLocaleString('fr-FR')})`,
        {
          montants: { interetsCC, ccAssocies, tauxPlafond: tauxPlafond * 100, interetsMax, excesAReintegrer: exces },
          description: `Les interets sur comptes courants d'associes (${interetsCC.toLocaleString('fr-FR')}) depassent le plafond fiscal de ${(tauxPlafond * 100).toFixed(1)}% applique au solde moyen (${ccAssocies.toLocaleString('fr-FR')}). L'excedent de ${exces.toLocaleString('fr-FR')} doit etre reintegre.`,
          attendu: `Interets <= ${(tauxPlafond * 100).toFixed(1)}% du compte courant`,
          constate: `Interets: ${interetsCC.toLocaleString('fr-FR')}, plafond: ${interetsMax.toLocaleString('fr-FR')}`,
          impactFiscal: `Reintegration de ${exces.toLocaleString('fr-FR')} FCFA dans le resultat fiscal.`,
        },
        `Reintegrer ${exces.toLocaleString('fr-FR')} FCFA (interets excedentaires) dans le resultat fiscal.`,
        [{
          journal: 'FISCAL', date: new Date().toISOString().slice(0, 10),
          lignes: [{ sens: 'D' as const, compte: 'REINTEG', libelle: 'Reintegration interets CC > taux legal', montant: exces }],
          commentaire: 'Interets comptes courants excedant le taux plafond'
        }],
        'CGI Art. 18 - Deductibilite interets comptes courants')
    }
  }
  return ok(ref, nom, 'Interets comptes courants dans les limites')
}

// FI-014: Loyers verses vs charges locatives
function FI014(ctx: AuditContext): ResultatControle {
  const ref = 'FI-014', nom = 'Loyers vs occupation'
  const loyers = absSum(find(ctx.balanceN, '622'))
  const immobBatiments = absSum(find(ctx.balanceN, '231'))
  if (loyers > 0 && immobBatiments > 0) {
    return anomalie(ref, nom, 'INFO',
      `Loyers (${loyers.toLocaleString('fr-FR')}) et batiments propres (${immobBatiments.toLocaleString('fr-FR')}) simultanement`,
      {
        montants: { loyers, batimentsPropres: immobBatiments },
        description: 'L\'entreprise paie des loyers tout en possedant des batiments. Verifier la coherence: les loyers sont-ils pour des locaux supplementaires ou s\'agit-il d\'une erreur de classification?',
        attendu: 'Justification des loyers en presence de batiments propres',
        constate: `Loyers: ${loyers.toLocaleString('fr-FR')}, Batiments: ${immobBatiments.toLocaleString('fr-FR')}`,
        impactFiscal: 'Aucun impact direct si justifie. Loyers entre parties liees soumis a verification.',
      },
      'Documenter la justification economique des loyers payes malgre la possession de batiments.')
  }
  return ok(ref, nom, 'Coherence loyers et occupation')
}

// FI-015: Taux effectif d'imposition
function FI015(ctx: AuditContext): ResultatControle {
  const ref = 'FI-015', nom = 'Taux effectif d\'imposition'
  const resultat = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const isComptabilise = absSum(find(ctx.balanceN, '89'))
  if (resultat > 0 && isComptabilise > 0) {
    const tauxEffectif = (isComptabilise / resultat) * 100
    const taux = getTauxFiscaux()
    const tauxNormal = taux.IS.taux_normal * 100
    if (tauxEffectif > tauxNormal * 1.5) {
      return anomalie(ref, nom, 'INFO',
        `Taux effectif d'imposition eleve: ${tauxEffectif.toFixed(1)}% (taux normal: ${tauxNormal}%)`,
        {
          montants: { resultat, isComptabilise, tauxEffectif: Math.round(tauxEffectif * 10) / 10, tauxNormal },
          description: `Le taux effectif d'imposition (${tauxEffectif.toFixed(1)}%) est significativement superieur au taux normal (${tauxNormal}%). Cela peut s'expliquer par des reintegrations fiscales importantes, l'impact de l'IMF, ou une erreur de calcul.`,
          attendu: `Taux effectif proche de ${tauxNormal}%`,
          constate: `Taux effectif: ${tauxEffectif.toFixed(1)}%`,
          impactFiscal: `Charge fiscale potentiellement sur-estimee de ${(isComptabilise - resultat * taux.IS.taux_normal).toLocaleString('fr-FR')} FCFA.`,
        },
        'Analyser la determination du resultat fiscal: identifier les reintegrations et deductions. Verifier si l\'IMF s\'applique.')
    }
    if (tauxEffectif < tauxNormal * 0.3 && isComptabilise > 100000) {
      return anomalie(ref, nom, 'INFO',
        `Taux effectif d'imposition faible: ${tauxEffectif.toFixed(1)}% (taux normal: ${tauxNormal}%)`,
        {
          montants: { resultat, isComptabilise, tauxEffectif: Math.round(tauxEffectif * 10) / 10, tauxNormal },
          description: `Le taux effectif d'imposition (${tauxEffectif.toFixed(1)}%) est significativement inferieur au taux normal (${tauxNormal}%). Cela peut s'expliquer par des exonerations, des reports deficitaires, ou des deductions fiscales.`,
          attendu: `Taux effectif proche de ${tauxNormal}%`,
          constate: `Taux effectif: ${tauxEffectif.toFixed(1)}%`,
          impactFiscal: 'Verifier que les avantages fiscaux sont bien justifies et documentes.',
        },
        'Documenter les raisons du taux effectif bas: exonerations, zone franche, reports deficitaires, credits d\'impot.')
    }
  }
  return ok(ref, nom, 'Taux effectif d\'imposition normal')
}

// --- Enregistrement ---

export function registerLevel7Controls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['FI-001', 'Resultat fiscal', 'Verifie le resultat fiscal', 'INFO', FI001],
    ['FI-002', 'Amort. vehicules tourisme', 'Plafond amortissement vehicules', 'MINEUR', FI002],
    ['FI-003', 'Charges somptuaires', 'Detecte les charges somptuaires', 'MINEUR', FI003],
    ['FI-004', 'Amendes et penalites', 'Signale les charges non deductibles', 'MINEUR', FI004],
    ['FI-005', 'Dons et liberalites', 'Plafond de deductibilite des dons', 'MINEUR', FI005],
    ['FI-006', 'Provisions non deductibles', 'Verifie la deductibilite des provisions', 'MINEUR', FI006],
    ['FI-007', 'IS calcule vs comptabilise', 'Coherence de l\'impot sur les societes', 'MAJEUR', FI007],
    ['FI-008', 'Minimum forfaitaire (IMF)', 'IS >= 1% du CA', 'MINEUR', FI008],
    ['FI-009', 'TVA a reverser', 'Coherence TVA collectee/deductible/due', 'MINEUR', FI009],
    ['FI-010', 'Charges personnel vs cotisations', 'Coherence salaires/cotisations', 'INFO', FI010],
    ['FI-011', 'Dons excedentaires (658)', 'Plafond 5‰ du CA — CGI Art. 18-5', 'MINEUR', FI011],
    ['FI-012', 'Charges somptuaires (6257)', 'Depenses de luxe non deductibles — CGI Art. 18-6', 'MINEUR', FI012],
    ['FI-013', 'Interets comptes courants', 'Plafond fiscal interets CC associes', 'MINEUR', FI013],
    ['FI-014', 'Loyers vs occupation', 'Coherence loyers et batiments propres', 'INFO', FI014],
    ['FI-015', 'Taux effectif d\'imposition', 'Analyse du taux effectif d\'IS', 'INFO', FI015],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_3', actif: true },
      fn
    )
  }
}
