/**
 * Niveau 1 - Controles fondamentaux (F-001 a F-011)
 * 11 controles verifiant les equilibres et coherences de base
 */

import { AuditContext, ResultatControle, NiveauControle } from '@/types/audit.types'
import { BalanceEntry } from '@/services/liasseDataService'
import { controlRegistry } from '../controlRegistry'

const NIVEAU: NiveauControle = 1
const TOLERANCE = 0.01

function ok(ref: string, nom: string, message: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'OK', severite: 'OK', message, timestamp: new Date().toISOString() }
}

function anomalie(
  ref: string, nom: string, severite: ResultatControle['severite'],
  message: string, details?: ResultatControle['details'],
  suggestion?: string, ecritures?: ResultatControle['ecrituresCorrectives'],
  refRegl?: string
): ResultatControle {
  return {
    ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite, message,
    details, suggestion, ecrituresCorrectives: ecritures,
    referenceReglementaire: refRegl, timestamp: new Date().toISOString(),
  }
}

function na(ref: string, nom: string, message: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message, timestamp: new Date().toISOString() }
}

// Helpers
function sumDebit(balance: BalanceEntry[]): number {
  return balance.reduce((s, l) => s + (l.debit || 0), 0)
}
function sumCredit(balance: BalanceEntry[]): number {
  return balance.reduce((s, l) => s + (l.credit || 0), 0)
}
function solde(line: BalanceEntry): number {
  return (line.solde_debit || 0) - (line.solde_credit || 0)
}
function findByPrefix(balance: BalanceEntry[], prefix: string): BalanceEntry[] {
  return balance.filter((l) => l.compte.toString().startsWith(prefix))
}
// F-001: Equilibre general N
function F001(ctx: AuditContext): ResultatControle {
  const ref = 'F-001', nom = 'Equilibre general N'
  const totalD = sumDebit(ctx.balanceN)
  const totalC = sumCredit(ctx.balanceN)
  const ecart = Math.abs(totalD - totalC)
  if (ecart > TOLERANCE) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Desequilibre de ${ecart.toLocaleString('fr-FR')}`,
      { ecart, montants: { totalDebit: totalD, totalCredit: totalC } },
      'La somme des debits doit etre egale a la somme des credits',
      [{
        journal: 'OD', date: new Date().toISOString().slice(0, 10),
        lignes: totalD > totalC
          ? [{ sens: 'C' as const, compte: '471000', libelle: 'Compte d\'attente', montant: ecart }]
          : [{ sens: 'D' as const, compte: '471000', libelle: 'Compte d\'attente', montant: ecart }],
        commentaire: 'Ecriture d\'equilibrage provisoire'
      }],
      'Art. 19 Acte Uniforme OHADA relatif au droit comptable')
  }
  return ok(ref, nom, `Balance equilibree (D=${totalD.toLocaleString('fr-FR')}, C=${totalC.toLocaleString('fr-FR')})`)
}

// F-002: Equilibre general N-1
function F002(ctx: AuditContext): ResultatControle {
  const ref = 'F-002', nom = 'Equilibre general N-1'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return na(ref, nom, 'Balance N-1 absente')
  }
  const totalD = sumDebit(ctx.balanceN1)
  const totalC = sumCredit(ctx.balanceN1)
  const ecart = Math.abs(totalD - totalC)
  if (ecart > TOLERANCE) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Desequilibre N-1 de ${ecart.toLocaleString('fr-FR')}`,
      { ecart, montants: { totalDebitN1: totalD, totalCreditN1: totalC } })
  }
  return ok(ref, nom, `Balance N-1 equilibree`)
}

// F-003: Resultat coherent
function F003(ctx: AuditContext): ResultatControle {
  const ref = 'F-003', nom = 'Resultat coherent'
  const produits = findByPrefix(ctx.balanceN, '7')
  const charges = findByPrefix(ctx.balanceN, '6')
  const totalProduits = produits.reduce((s, l) => s + (l.credit - l.debit), 0)
  const totalCharges = charges.reduce((s, l) => s + (l.debit - l.credit), 0)
  const resultatCalcule = totalProduits - totalCharges

  const comptes13 = findByPrefix(ctx.balanceN, '13')
  const resultatComptabilise = comptes13.reduce((s, l) => s + (l.credit - l.debit), 0)

  const ecart = Math.abs(resultatCalcule - resultatComptabilise)
  if (ecart > 1 && comptes13.length > 0) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Ecart de ${ecart.toLocaleString('fr-FR')} entre resultat calcule et compte 13x`,
      {
        ecart,
        montants: { resultatCalcule, resultatComptabilise, produits: totalProduits, charges: totalCharges }
      },
      'Le resultat (produits-charges) doit correspondre au solde du compte 13x',
      undefined,
      'Art. 34 Acte Uniforme OHADA')
  }
  if (comptes13.length === 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Resultat calcule: ${resultatCalcule.toLocaleString('fr-FR')} mais pas de compte 13x`,
      { montants: { resultatCalcule } })
  }
  return ok(ref, nom, `Resultat coherent: ${resultatCalcule.toLocaleString('fr-FR')}`)
}

// F-004: Total bilan equilibre
function F004(ctx: AuditContext): ResultatControle {
  const ref = 'F-004', nom = 'Total bilan equilibre'
  // Actif: classes 1(debiteur) + 2 + 3 + 4(debiteur) + 5(debiteur)
  const actifEntries = ctx.balanceN.filter((l) => {
    const cl = parseInt(l.compte.toString().charAt(0))
    return cl >= 1 && cl <= 5
  })
  // Actif = somme des soldes debiteurs
  let totalActif = 0
  let totalPassif = 0
  for (const l of actifEntries) {
    const s = solde(l)
    if (s > 0) totalActif += s
    else totalPassif += Math.abs(s)
  }
  const ecart = Math.abs(totalActif - totalPassif)
  if (ecart > 1) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Desequilibre bilan: Actif=${totalActif.toLocaleString('fr-FR')}, Passif=${totalPassif.toLocaleString('fr-FR')} (ecart: ${ecart.toLocaleString('fr-FR')})`,
      { ecart, montants: { totalActif, totalPassif } },
      'Le total de l\'actif doit etre egal au total du passif',
      undefined,
      'Art. 29 Acte Uniforme OHADA')
  }
  return ok(ref, nom, `Bilan equilibre: ${totalActif.toLocaleString('fr-FR')}`)
}

// F-005: Presence classes essentielles
function F005(ctx: AuditContext): ResultatControle {
  const ref = 'F-005', nom = 'Classes essentielles presentes'
  const classesPresentes = new Set<string>()
  for (const l of ctx.balanceN) {
    classesPresentes.add(l.compte.toString().charAt(0))
  }
  const requises = ['1', '2', '4', '5', '6', '7']
  const manquantes = requises.filter((c) => !classesPresentes.has(c))
  if (manquantes.length > 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `Classes manquantes: ${manquantes.join(', ')}`,
      { comptes: manquantes },
      'Une balance complete doit contenir les classes 1, 2, 4, 5, 6 et 7')
  }
  return ok(ref, nom, `Toutes les classes essentielles presentes (${[...classesPresentes].sort().join(', ')})`)
}

// F-006: Presence compte capital (101x)
function F006(ctx: AuditContext): ResultatControle {
  const ref = 'F-006', nom = 'Compte capital present'
  const capital = findByPrefix(ctx.balanceN, '101')
  if (capital.length === 0) {
    return anomalie(ref, nom, 'MAJEUR',
      'Aucun compte de capital social (101x) trouve',
      undefined,
      'Le capital social est obligatoire pour toute societe')
  }
  const montant = capital.reduce((s, l) => s + (l.credit - l.debit), 0)
  return ok(ref, nom, `Capital social: ${montant.toLocaleString('fr-FR')}`)
}

// F-007: Presence compte resultat (13x)
function F007(ctx: AuditContext): ResultatControle {
  const ref = 'F-007', nom = 'Compte resultat present'
  const resultat = findByPrefix(ctx.balanceN, '13')
  if (resultat.length === 0) {
    return anomalie(ref, nom, 'MINEUR',
      'Aucun compte de resultat (13x) trouve',
      undefined,
      'Le resultat de l\'exercice doit apparaitre dans la balance')
  }
  const montant = resultat.reduce((s, l) => s + (l.credit - l.debit), 0)
  return ok(ref, nom, `Resultat: ${montant.toLocaleString('fr-FR')}`)
}

// F-008: Report a nouveau coherent
function F008(ctx: AuditContext): ResultatControle {
  const ref = 'F-008', nom = 'Report a nouveau coherent'
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return na(ref, nom, 'Balance N-1 absente')
  }
  const ranN = findByPrefix(ctx.balanceN, '12')
  const resultatN1 = findByPrefix(ctx.balanceN1, '13')

  if (ranN.length === 0 && resultatN1.length > 0) {
    return anomalie(ref, nom, 'MAJEUR',
      'Pas de report a nouveau (12x) alors que la balance N-1 a un resultat',
      undefined,
      'Le resultat N-1 doit etre reporte au compte 12x en N')
  }
  if (ranN.length === 0) return na(ref, nom, 'Pas de RAN ni de resultat N-1')

  const montantRAN = ranN.reduce((s, l) => s + (l.credit - l.debit), 0)
  const montantResultatN1 = resultatN1.reduce((s, l) => s + (l.credit - l.debit), 0)
  const ecart = Math.abs(montantRAN - montantResultatN1)

  if (ecart > 1) {
    return anomalie(ref, nom, 'MAJEUR',
      `Report a nouveau (${montantRAN.toLocaleString('fr-FR')}) != Resultat N-1 (${montantResultatN1.toLocaleString('fr-FR')})`,
      { ecart, montants: { reportANouveau: montantRAN, resultatN1: montantResultatN1 } },
      'Le report a nouveau doit correspondre au resultat de l\'exercice precedent')
  }
  return ok(ref, nom, `Report a nouveau coherent: ${montantRAN.toLocaleString('fr-FR')}`)
}

// F-009: Nombre minimum de comptes
function F009(ctx: AuditContext): ResultatControle {
  const ref = 'F-009', nom = 'Nombre de comptes suffisant'
  const count = ctx.balanceN.length
  if (count < 50) {
    return anomalie(ref, nom, 'MINEUR',
      `Seulement ${count} comptes (une balance complete comporte generalement 50+)`,
      { montants: { nombreComptes: count } },
      'Une balance trop courte peut indiquer un import partiel')
  }
  return ok(ref, nom, `${count} comptes dans la balance`)
}

// F-010: Comptes a solde nul
function F010(ctx: AuditContext): ResultatControle {
  const ref = 'F-010', nom = 'Comptes a solde nul'
  const nuls = ctx.balanceN.filter((l) =>
    l.debit === 0 && l.credit === 0 &&
    (l.solde_debit || 0) === 0 && (l.solde_credit || 0) === 0
  )
  if (nuls.length > 0) {
    const pct = ((nuls.length / ctx.balanceN.length) * 100).toFixed(1)
    return anomalie(ref, nom, 'INFO',
      `${nuls.length} compte(s) a solde nul (${pct}%)`,
      { comptes: nuls.slice(0, 10).map((l) => l.compte) },
      'Les comptes a solde nul peuvent etre nettoyes')
  }
  return ok(ref, nom, 'Aucun compte a solde nul')
}

// F-011: Comptes collectifs non detailles
function F011(ctx: AuditContext): ResultatControle {
  const ref = 'F-011', nom = 'Comptes collectifs'
  // Comptes collectifs: 401, 411 (doivent avoir des sous-comptes)
  const collectifs = ['401', '411']
  const problemes: string[] = []
  for (const prefix of collectifs) {
    const exact = ctx.balanceN.filter((l) => l.compte.toString().trim() === prefix)
    const details = ctx.balanceN.filter((l) =>
      l.compte.toString().startsWith(prefix) && l.compte.toString().length > prefix.length
    )
    if (exact.length > 0 && details.length === 0) {
      problemes.push(prefix)
    }
  }
  if (problemes.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Comptes collectifs non detailles: ${problemes.join(', ')}`,
      { comptes: problemes },
      'Les comptes collectifs (401, 411) doivent etre ventiles en sous-comptes')
  }
  return ok(ref, nom, 'Comptes collectifs correctement detailles')
}

// --- Enregistrement ---

export function registerLevel1Controls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['F-001', 'Equilibre general N', 'Verifie que total debits = total credits', 'BLOQUANT', F001],
    ['F-002', 'Equilibre general N-1', 'Verifie l\'equilibre de la balance N-1', 'BLOQUANT', F002],
    ['F-003', 'Resultat coherent', 'Verifie coherence produits-charges vs compte 13x', 'BLOQUANT', F003],
    ['F-004', 'Total bilan equilibre', 'Verifie actif = passif', 'BLOQUANT', F004],
    ['F-005', 'Classes essentielles presentes', 'Verifie la presence des classes 1-7', 'MAJEUR', F005],
    ['F-006', 'Compte capital present', 'Verifie la presence du capital social', 'MAJEUR', F006],
    ['F-007', 'Compte resultat present', 'Verifie la presence du compte de resultat', 'MINEUR', F007],
    ['F-008', 'Report a nouveau coherent', 'Verifie RAN vs resultat N-1', 'MAJEUR', F008],
    ['F-009', 'Nombre de comptes suffisant', 'Verifie au moins 50 comptes', 'MINEUR', F009],
    ['F-010', 'Comptes a solde nul', 'Signale les comptes a solde nul', 'INFO', F010],
    ['F-011', 'Comptes collectifs', 'Verifie le detail des comptes collectifs', 'MINEUR', F011],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_1', actif: true },
      fn
    )
  }
}
