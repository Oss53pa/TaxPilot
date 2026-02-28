/**
 * Niveau 1 - Controles fondamentaux (F-001 a F-012)
 * 12 controles verifiant les equilibres et coherences de base
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
      {
        ecart, montants: { totalDebit: totalD, totalCredit: totalC },
        description: `La balance generale presente un desequilibre de ${ecart.toLocaleString('fr-FR')} FCFA. Le principe de la partie double impose que la somme des debits soit strictement egale a la somme des credits. Ce desequilibre bloque la production des etats financiers et invalide tous les controles de coherence.`
      },
      'Identifier l\'origine du desequilibre: erreur d\'import, ecriture incomplete, ou solde d\'ouverture mal reporte. Corriger la balance source puis reimporter.',
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
      {
        ecart, montants: { totalDebitN1: totalD, totalCreditN1: totalC },
        description: `La balance N-1 presente un desequilibre de ${ecart.toLocaleString('fr-FR')} FCFA. Cela compromet tous les controles comparatifs inter-exercices et remet en cause la fiabilite des donnees N-1.`
      },
      'Verifier la balance N-1 importee. Si elle provient d\'un autre logiciel, s\'assurer que l\'export est complet et equilibre.',
      undefined,
      'Art. 19 Acte Uniforme OHADA relatif au droit comptable')
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
        montants: { resultatCalcule, resultatComptabilise, produits: totalProduits, charges: totalCharges },
        description: `Le resultat calcule (produits classe 7 - charges classe 6 = ${resultatCalcule.toLocaleString('fr-FR')}) ne correspond pas au solde du compte 13x (${resultatComptabilise.toLocaleString('fr-FR')}). Ecart: ${ecart.toLocaleString('fr-FR')}. Causes possibles: affectation du resultat en cours, ecritures de cloture manquantes, ou erreur dans les a-nouveaux.`
      },
      'Verifier les ecritures d\'affectation du resultat et les operations de cloture. Le compte 13x doit refleter exactement la difference entre produits et charges.',
      resultatCalcule > resultatComptabilise ? [{
        journal: 'OD', date: new Date().toISOString().slice(0, 10),
        lignes: [
          { sens: 'D' as const, compte: '6x', libelle: 'Ajustement resultat', montant: ecart },
          { sens: 'C' as const, compte: '130000', libelle: 'Resultat de l\'exercice', montant: ecart },
        ],
        commentaire: 'Ecriture corrective pour aligner le resultat'
      }] : undefined,
      'Art. 34 Acte Uniforme OHADA')
  }
  if (comptes13.length === 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Resultat calcule: ${resultatCalcule.toLocaleString('fr-FR')} mais pas de compte 13x`,
      {
        montants: { resultatCalcule, produits: totalProduits, charges: totalCharges },
        description: 'Aucun compte de resultat (13x) n\'est present dans la balance. Pour une balance pre-cloture (en cours d\'exercice), c\'est normal car le resultat n\'est pas encore affecte. Pour une balance de cloture, le compte 13x est obligatoire.'
      },
      'Si la balance est post-cloture, ajouter le compte 131000 (benefice) ou 139000 (perte) avec le resultat de l\'exercice.')
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
  // Calculer la repartition par classe pour le detail
  const parClasse: Record<string, number> = {}
  for (const l of actifEntries) {
    const cl = l.compte.toString().charAt(0)
    parClasse[`classe${cl}`] = (parClasse[`classe${cl}`] || 0) + Math.abs(solde(l))
  }

  const ecart = Math.abs(totalActif - totalPassif)
  if (ecart > 1) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Desequilibre bilan: Actif=${totalActif.toLocaleString('fr-FR')}, Passif=${totalPassif.toLocaleString('fr-FR')} (ecart: ${ecart.toLocaleString('fr-FR')})`,
      {
        ecart, montants: { totalActif, totalPassif, ...parClasse },
        description: `Le bilan est desequilibre de ${ecart.toLocaleString('fr-FR')} FCFA. L\'actif (soldes debiteurs) et le passif (soldes crediteurs) des classes 1 a 5 doivent etre egaux. Ce desequilibre peut provenir d\'une erreur d\'affectation du resultat, de comptes mal classes, ou d\'ecritures incompletes.`
      },
      'Verifier l\'affectation du resultat (compte 13x), le classement des comptes de bilan, et les ecritures de regularisation.',
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
    const nomsClasses: Record<string, string> = { '1': 'Capitaux', '2': 'Immobilisations', '3': 'Stocks', '4': 'Tiers', '5': 'Tresorerie', '6': 'Charges', '7': 'Produits' }
    return anomalie(ref, nom, 'MAJEUR',
      `Classes manquantes: ${manquantes.map(c => `${c} (${nomsClasses[c]})`).join(', ')}`,
      {
        comptes: manquantes.map(c => `Classe ${c}: ${nomsClasses[c]}`),
        montants: { classesPresentes: classesPresentes.size, classesRequises: requises.length, classesManquantes: manquantes.length },
        description: `${manquantes.length} classe(s) comptable(s) essentielle(s) absente(s). Une balance complete en SYSCOHADA doit comporter les classes 1 (Capitaux), 2 (Immobilisations), 4 (Tiers), 5 (Tresorerie), 6 (Charges) et 7 (Produits). L\'absence d\'une classe indique un import incomplet ou une activite tres specifique.`
      },
      'Verifier l\'exhaustivite de l\'import. Si l\'absence est justifiee (ex: pas de stocks pour une societe de services), documenter dans l\'annexe.',
      undefined,
      'Art. 14 Acte Uniforme OHADA - Plan de comptes SYSCOHADA')
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
      {
        description: 'Aucun compte de capital social (101x) n\'est present dans la balance. Le capital est un element obligatoire du passif pour toute societe commerciale. Son absence peut indiquer un import partiel, un plan de comptes non conforme, ou une entreprise individuelle.',
        montants: { comptesCapital: 0 }
      },
      'Ajouter le compte 101000 (Capital social) ou verifier que la balance est complete.',
      undefined,
      'Art. 37 Acte Uniforme OHADA / Art. 311 AUSCGIE')
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
      {
        description: 'Aucun compte de resultat de l\'exercice (13x) n\'est present. Pour une balance en cours d\'exercice (pre-cloture), c\'est normal. Pour une balance de cloture, le compte 131 (benefice) ou 139 (perte) doit etre renseigne.',
        montants: { comptesResultat: 0 }
      },
      'Si la balance est post-cloture, comptabiliser le resultat dans le compte 131 ou 139.',
      undefined,
      'Art. 34 Acte Uniforme OHADA')
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
    const montantResN1 = resultatN1.reduce((s, l) => s + (l.credit - l.debit), 0)
    return anomalie(ref, nom, 'MAJEUR',
      'Pas de report a nouveau (12x) alors que la balance N-1 a un resultat',
      {
        montants: { reportANouveau: 0, resultatN1: montantResN1 },
        description: `Le resultat N-1 de ${montantResN1.toLocaleString('fr-FR')} n'a pas ete reporte dans le compte 12x en N. L\'affectation du resultat est une operation obligatoire d\'ouverture d\'exercice.`
      },
      'Passer l\'ecriture d\'affectation du resultat: debiter 13x et crediter 12x (ou 11x pour les reserves).',
      undefined,
      'Art. 36 Acte Uniforme OHADA')
  }
  if (ranN.length === 0) return na(ref, nom, 'Pas de RAN ni de resultat N-1')

  const montantRAN = ranN.reduce((s, l) => s + (l.credit - l.debit), 0)
  const montantResultatN1 = resultatN1.reduce((s, l) => s + (l.credit - l.debit), 0)
  const ecart = Math.abs(montantRAN - montantResultatN1)

  if (ecart > 1) {
    return anomalie(ref, nom, 'MAJEUR',
      `Report a nouveau (${montantRAN.toLocaleString('fr-FR')}) != Resultat N-1 (${montantResultatN1.toLocaleString('fr-FR')})`,
      {
        ecart, montants: { reportANouveau: montantRAN, resultatN1: montantResultatN1 },
        description: `L\'ecart de ${ecart.toLocaleString('fr-FR')} entre le report a nouveau (12x) et le resultat N-1 (13x) peut s\'expliquer par: distribution de dividendes, mise en reserve, ou erreur d\'affectation. Si une distribution a eu lieu, l\'ecart doit correspondre aux dividendes distribues.`
      },
      'Verifier l\'ecriture d\'affectation du resultat. Le RAN doit correspondre au resultat N-1 diminue des distributions et mises en reserve.',
      undefined,
      'Art. 36 Acte Uniforme OHADA')
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
      {
        montants: { nombreComptes: count, seuilRecommande: 50 },
        description: 'Une balance comptable standard pour une entreprise en activite comporte generalement plus de 50 comptes. Un nombre insuffisant peut indiquer un import partiel, une balance synthetique (comptes agreges), ou une micro-entreprise.'
      },
      'Verifier que l\'export est au niveau de detail le plus fin (comptes auxiliaires inclus). Utiliser une balance detaillee plutot que synthetique.')
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
      {
        comptes: nuls.slice(0, 10).map((l) => l.compte),
        montants: { comptesNuls: nuls.length, totalComptes: ctx.balanceN.length, pctNuls: parseFloat(pct) },
        description: 'Ces comptes ont un debit, credit, solde debiteur et solde crediteur tous egaux a zero. Ils n\'impactent pas les calculs mais alourdissent la balance. Leur presence peut indiquer des comptes crees mais jamais utilises.'
      },
      'Supprimer les comptes a solde nul de la balance pour plus de lisibilite, sauf si des mouvements sont prevus.')
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
      {
        comptes: problemes,
        montants: { comptesCollectifsNonDetailles: problemes.length },
        description: 'Les comptes collectifs (401 Fournisseurs, 411 Clients) sont utilises sans sous-comptes auxiliaires. En SYSCOHADA, ces comptes doivent etre ventiles par tiers pour permettre le suivi individuel des creances et dettes. L\'absence de detail empeche la justification des soldes.'
      },
      'Creer des sous-comptes par tiers (ex: 4110001 Client A, 4110002 Client B) pour permettre le lettrage et le suivi individuel.',
      undefined,
      'Art. 17 Acte Uniforme OHADA - Comptes collectifs et individuels')
  }
  return ok(ref, nom, 'Comptes collectifs correctement detailles')
}

// F-012: Solde sans mouvement (AUD-BAL-005)
function F012(ctx: AuditContext): ResultatControle {
  const ref = 'F-012', nom = 'Solde sans mouvement'

  const anomalies = ctx.balanceN.filter((l) => {
    const hasSolde = (l.solde_debit || 0) !== 0 || (l.solde_credit || 0) !== 0
    const hasMouvement = (l.debit || 0) !== 0 || (l.credit || 0) !== 0
    return hasSolde && !hasMouvement
  })

  if (anomalies.length > 0) {
    const totalNonJustifie = anomalies.reduce(
      (s, l) => s + (l.solde_debit || 0) + (l.solde_credit || 0), 0
    )
    return anomalie(ref, nom, 'BLOQUANT',
      `${anomalies.length} compte(s) avec solde sans aucun mouvement comptable. ` +
      `Montant total non justifie: ${totalNonJustifie.toLocaleString('fr-FR')} FCFA`,
      {
        comptes: anomalies.map((l) => `${l.compte} (${l.intitule || 'N/A'}): SD=${(l.solde_debit||0).toLocaleString('fr-FR')}, SC=${(l.solde_credit||0).toLocaleString('fr-FR')}`),
        montants: { nombreComptes: anomalies.length, totalNonJustifie },
        description: 'Un solde ne peut exister sans mouvement comptable. Causes possibles: ' +
          'report a nouveau inscrit directement en colonne Solde au lieu d\'etre passe en ecriture d\'ouverture, ' +
          'colonnes Mouvement mal renseignees lors de l\'export, ou balance incomplete.'
      },
      'Corriger la balance source: chaque compte avec un solde doit disposer de mouvements correspondants, puis reimporter la balance corrigee.',
      undefined,
      'Art. 19 et 20 Acte Uniforme OHADA relatif au droit comptable'
    )
  }
  return ok(ref, nom, 'Tous les comptes avec solde disposent de mouvements comptables')
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
    ['F-012', 'Solde sans mouvement', 'Verifie que tout compte avec solde a des mouvements', 'BLOQUANT', F012],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_1', actif: true },
      fn
    )
  }
}
