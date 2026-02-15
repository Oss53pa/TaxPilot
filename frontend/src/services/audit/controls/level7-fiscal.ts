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
function anomalie(ref: string, nom: string, sev: ResultatControle['severite'], msg: string, det?: ResultatControle['details'], sug?: string, refR?: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite: sev, message: msg, details: det, suggestion: sug, referenceReglementaire: refR, timestamp: new Date().toISOString() }
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
      { montants: { resultatNet: resultat } },
      'Un resultat deficitaire doit etre justifie et peut etre reporte sur les exercices suivants',
      'Art. 7 CGI - Report deficitaire')
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
    return anomalie(ref, nom, 'MINEUR',
      `Vehicules de tourisme: ${valeurVehicules.toLocaleString('fr-FR')} (plafond fiscal: 25 000 000)`,
      { montants: { valeurVehicules, plafond: 25000000 } },
      'Reintegrer la fraction d\'amortissement excedant la base de 25 M FCFA',
      'Art. 8-1 CGI CEMAC')
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
    return anomalie(ref, nom, 'MINEUR',
      `Receptions et cadeaux (${receptions.toLocaleString('fr-FR')}) > 1% du CA (${ca.toLocaleString('fr-FR')})`,
      { montants: { receptions, ca, ratioPct: (receptions / ca * 100) } },
      'Les charges somptuaires au-dela des seuils sont a reintegrer fiscalement')
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
      { montants: { amendes } },
      'Les amendes et penalites fiscales ne sont pas deductibles du resultat fiscal',
      'Art. 8-d CGI')
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
    return anomalie(ref, nom, 'MINEUR',
      `Dons (${dons.toLocaleString('fr-FR')}) > plafond 1‰ du CA (${plafond.toLocaleString('fr-FR')})`,
      { montants: { dons, plafond, ca } },
      'Les dons au-dela du plafond sont a reintegrer au resultat fiscal',
      'Art. 8-e CGI')
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
      { montants: { dotationsProvisions: provisions } },
      'Certaines provisions ne sont pas deductibles fiscalement (provisions pour propre assurance, etc.)')
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
          { montants: { isComptabilise, isEstime, resultat, ecart } },
          'Verifier le calcul de l\'IS et les reintegrations/deductions')
      }
    } else {
      return anomalie(ref, nom, 'MAJEUR',
        `Resultat beneficiaire (${resultat.toLocaleString('fr-FR')}) sans IS comptabilise (89x)`,
        { montants: { resultat } },
        'Comptabiliser l\'impot sur les societes')
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
        { montants: { isComptabilise, imf, ca } },
        'Verifier que le minimum forfaitaire est respecte')
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
        { montants: { tvaCollectee, tvaDeductible, soldeTheorique } })
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
      { montants: { chargesPersonnel: chargesPerso } },
      'Verifier les declarations CNPS/NSIF')
  }
  if (chargesPerso > 0 && cotisations > 0) {
    const ratio = (cotisations / chargesPerso) * 100
    if (ratio < 10) {
      return anomalie(ref, nom, 'INFO',
        `Ratio cotisations/salaires faible: ${ratio.toFixed(1)}%`,
        { montants: { chargesPersonnel: chargesPerso, cotisations, ratioPct: ratio } })
    }
  }
  return ok(ref, nom, 'Coherence charges personnel / cotisations')
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
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_3', actif: true },
      fn
    )
  }
}
