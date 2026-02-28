/**
 * Niveau 8 - Controles archives multi-exercices (AR-001 a AR-007)
 * 7 controles verifiant la continuite et coherence sur plusieurs exercices
 */

import { AuditContext, ResultatControle, NiveauControle, ArchiveAudit } from '@/types/audit.types'
import { BalanceEntry } from '@/services/liasseDataService'
import { controlRegistry } from '../controlRegistry'

const NIVEAU: NiveauControle = 8

function ok(ref: string, nom: string, msg: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'OK', severite: 'OK', message: msg, timestamp: new Date().toISOString() }
}
function anomalie(ref: string, nom: string, sev: ResultatControle['severite'], msg: string, det?: ResultatControle['details'], sug?: string, refR?: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'ANOMALIE', severite: sev, message: msg, details: det, suggestion: sug, referenceReglementaire: refR, timestamp: new Date().toISOString() }
}
function na(ref: string, nom: string, msg: string): ResultatControle {
  return { ref, nom, niveau: NIVEAU, statut: 'NON_APPLICABLE', severite: 'OK', message: msg, timestamp: new Date().toISOString() }
}

function find(bal: BalanceEntry[], prefix: string): BalanceEntry[] {
  return bal.filter((l) => l.compte.toString().startsWith(prefix))
}
function getArchives(ctx: AuditContext): ArchiveAudit[] {
  return ctx.liassesArchivees || []
}

function needsArchives(ref: string, nom: string, ctx: AuditContext): ResultatControle | null {
  if (!ctx.liassesArchivees || ctx.liassesArchivees.length === 0) {
    return na(ref, nom, 'Aucune archive disponible')
  }
  return null
}

// AR-001: Balance N-1 = liasse N-1 archivee
function AR001(ctx: AuditContext): ResultatControle {
  const ref = 'AR-001', nom = 'Balance N-1 = Archive N-1'
  const skip = needsArchives(ref, nom, ctx); if (skip) return skip
  if (!ctx.balanceN1 || ctx.balanceN1.length === 0) {
    return na(ref, nom, 'Balance N-1 absente')
  }

  const exerciceN1 = ctx.exercice ? String(parseInt(ctx.exercice) - 1) : undefined
  if (!exerciceN1) return na(ref, nom, 'Exercice non defini')

  const archiveN1 = ctx.liassesArchivees!.find((a) => a.exercice === exerciceN1)
  if (!archiveN1) return na(ref, nom, `Pas d'archive pour l'exercice ${exerciceN1}`)

  // Comparer les totaux
  const totalN1D = ctx.balanceN1.reduce((s, l) => s + l.debit, 0)
  const totalN1C = ctx.balanceN1.reduce((s, l) => s + l.credit, 0)
  const totalArchD = archiveN1.snapshot.totalDebit
  const totalArchC = archiveN1.snapshot.totalCredit

  const ecartD = Math.abs(totalN1D - totalArchD)
  const ecartC = Math.abs(totalN1C - totalArchC)

  if (ecartD > 1 || ecartC > 1) {
    return anomalie(ref, nom, 'BLOQUANT',
      `Balance N-1 differente de l'archive: ecarts D=${ecartD.toLocaleString('fr-FR')}, C=${ecartC.toLocaleString('fr-FR')}`,
      {
        montants: { totalN1Debit: totalN1D, archiveDebit: totalArchD, totalN1Credit: totalN1C, archiveCredit: totalArchC },
        description: `La balance N-1 importee ne correspond pas a la liasse N-1 archivee. Ecarts: Debits ${ecartD.toLocaleString('fr-FR')}, Credits ${ecartC.toLocaleString('fr-FR')}. Cela peut indiquer que le fichier N-1 importe n\'est pas la version definitive, ou que des modifications ont ete apportees apres l\'archivage. La continuite des exercices est compromise.`
      },
      'Utiliser la balance N-1 issue de l\'archive officielle. Si des corrections post-cloture ont eu lieu, re-archiver la version definitive.',
      'Art. 8 Acte Uniforme OHADA - Permanence des methodes et continuite')
  }
  return ok(ref, nom, 'Balance N-1 conforme a l\'archive')
}

// AR-002: Continuite du capital
function AR002(ctx: AuditContext): ResultatControle {
  const ref = 'AR-002', nom = 'Continuite du capital'
  const skip = needsArchives(ref, nom, ctx); if (skip) return skip

  const capitalN = find(ctx.balanceN, '101').reduce((s, l) => s + (l.credit - l.debit), 0)
  const archives = getArchives(ctx).sort((a, b) => a.exercice.localeCompare(b.exercice))
  const variations: string[] = []

  for (const arch of archives) {
    const capArch = find(arch.snapshot.lignes, '101').reduce((s, l) => s + (l.credit - l.debit), 0)
    if (Math.abs(capArch - capitalN) > 1) {
      variations.push(`${arch.exercice}: ${capArch.toLocaleString('fr-FR')} -> N: ${capitalN.toLocaleString('fr-FR')}`)
    }
  }

  if (variations.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Variation(s) de capital detectee(s) sur les archives`,
      {
        comptes: variations,
        montants: { variationsDetectees: variations.length, capitalActuel: capitalN },
        description: `${variations.length} variation(s) de capital ont ete detectees en comparant l\'exercice courant avec les exercices archives. Chaque modification du capital social doit resulter d\'une decision formelle en assemblee generale (augmentation, reduction, fusion). La continuite du capital est un indicateur cle de la stabilite juridique de l\'entreprise.`
      },
      'Justifier chaque variation de capital par le PV d\'AG correspondant. Verifier la concordance avec les actes notaries et les publications legales.',
      'Art. 8 Acte Uniforme OHADA - Permanence des methodes')
  }
  return ok(ref, nom, 'Capital stable sur les exercices archives')
}

// AR-003: Tendance des resultats (5 exercices)
function AR003(ctx: AuditContext): ResultatControle {
  const ref = 'AR-003', nom = 'Tendance des resultats'
  const skip = needsArchives(ref, nom, ctx); if (skip) return skip

  const archives = getArchives(ctx).sort((a, b) => a.exercice.localeCompare(b.exercice))
  const resultats: Array<{ exercice: string; resultat: number }> = []

  for (const arch of archives) {
    const res = find(arch.snapshot.lignes, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
    resultats.push({ exercice: arch.exercice, resultat: res })
  }

  const resN = find(ctx.balanceN, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  resultats.push({ exercice: ctx.exercice || 'N', resultat: resN })

  if (resultats.length >= 3) {
    const derniers = resultats.slice(-3)
    const tousDeficitaires = derniers.every((r) => r.resultat < 0)
    if (tousDeficitaires) {
      const totalDeficits = derniers.reduce((s, r) => s + Math.abs(r.resultat), 0)
      return anomalie(ref, nom, 'INFO',
        `Deficits consecutifs sur ${derniers.length} exercices`,
        {
          comptes: derniers.map((r) => `${r.exercice}: ${r.resultat.toLocaleString('fr-FR')}`),
          montants: { exercicesDeficitaires: derniers.length, totalDeficitsCumules: totalDeficits },
          description: `L\'entreprise est en deficit sur ${derniers.length} exercices consecutifs pour un total cumule de ${totalDeficits.toLocaleString('fr-FR')} FCFA. Des deficits repetes signalent un probleme structurel de rentabilite et peuvent remettre en cause la continuite d\'exploitation. Si les capitaux propres deviennent inferieurs a la moitie du capital, une AG extraordinaire doit statuer.`
        },
        'Evaluer la situation de continuite d\'exploitation. Envisager un plan de redressement ou une restructuration. Verifier si les capitaux propres restent superieurs a la moitie du capital.',
        'Art. 8 Acte Uniforme OHADA / Art. 664 AUSCGIE')
    }
  }
  return ok(ref, nom, `Tendance analysee sur ${resultats.length} exercice(s)`)
}

// AR-004: Rupture de serie
function AR004(ctx: AuditContext): ResultatControle {
  const ref = 'AR-004', nom = 'Rupture de serie'
  const skip = needsArchives(ref, nom, ctx); if (skip) return skip

  const archives = getArchives(ctx).sort((a, b) => a.exercice.localeCompare(b.exercice))
  if (archives.length < 2) return na(ref, nom, 'Moins de 2 archives')

  const exercices = archives.map((a) => parseInt(a.exercice)).filter((e) => !isNaN(e))
  const ruptures: string[] = []
  for (let i = 1; i < exercices.length; i++) {
    if (exercices[i] - exercices[i - 1] > 1) {
      ruptures.push(`Gap entre ${exercices[i - 1]} et ${exercices[i]}`)
    }
  }

  if (ruptures.length > 0) {
    return anomalie(ref, nom, 'MINEUR',
      `Rupture(s) dans la serie des exercices archives`,
      {
        comptes: ruptures,
        montants: { rupturesDetectees: ruptures.length, exercicesArchives: exercices.length },
        description: `${ruptures.length} rupture(s) ont ete detectees dans la serie des exercices archives. Des exercices manquants empechent l\'analyse de tendance complete et compromettent la verification de la continuite des reports a nouveau sur la periode concernee.`
      },
      'Archiver les exercices manquants pour reconstituer la serie complete. La conservation des balances sur au moins 5 exercices est recommandee.',
      'Art. 8 Acte Uniforme OHADA - Conservation des documents comptables')
  }
  return ok(ref, nom, 'Serie d\'exercices continue')
}

// AR-005: Coherence reports a nouveau successifs
function AR005(ctx: AuditContext): ResultatControle {
  const ref = 'AR-005', nom = 'Reports a nouveau successifs'
  const skip = needsArchives(ref, nom, ctx); if (skip) return skip

  const archives = getArchives(ctx).sort((a, b) => a.exercice.localeCompare(b.exercice))
  const incoherences: string[] = []

  for (let i = 1; i < archives.length; i++) {
    const resultatPrev = find(archives[i - 1].snapshot.lignes, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
    const ran = find(archives[i].snapshot.lignes, '12').reduce((s, l) => s + (l.credit - l.debit), 0)
    const ecart = Math.abs(ran - resultatPrev)
    if (ecart > 1) {
      incoherences.push(`${archives[i].exercice}: RAN(${ran.toLocaleString('fr-FR')}) != Res ${archives[i - 1].exercice}(${resultatPrev.toLocaleString('fr-FR')})`)
    }
  }

  if (incoherences.length > 0) {
    return anomalie(ref, nom, 'MAJEUR',
      `${incoherences.length} incoherence(s) de report a nouveau`,
      {
        comptes: incoherences,
        montants: { incoherences: incoherences.length, exercicesVerifies: archives.length },
        description: `${incoherences.length} incoherence(s) de report a nouveau detectees dans les exercices archives. Le RAN de chaque exercice doit correspondre au resultat (ou au resultat diminue des distributions) de l\'exercice precedent. Des ecarts non justifies remettent en cause la fiabilite de la chaine comptable sur plusieurs exercices.`
      },
      'Reconstituer la chaine des reports a nouveau. Pour chaque ecart, identifier s\'il s\'agit de dividendes distribues, de mises en reserves, ou d\'erreurs. Corriger les archives si necessaire.',
      'Art. 8 Acte Uniforme OHADA - Permanence des methodes')
  }
  return ok(ref, nom, 'Reports a nouveau coherents')
}

// AR-006: Methodes comptables stables
function AR006(ctx: AuditContext): ResultatControle {
  const ref = 'AR-006', nom = 'Methodes comptables stables'
  const skip = needsArchives(ref, nom, ctx); if (skip) return skip

  const archives = getArchives(ctx)
  if (archives.length < 2) return na(ref, nom, 'Moins de 2 archives')

  // Verifier que la structure des comptes est stable
  const prefixesN = new Set(ctx.balanceN.map((l) => l.compte.substring(0, 2)))
  const lastArch = archives[archives.length - 1]
  const prefixesArch = new Set(lastArch.snapshot.lignes.map((l) => l.compte.substring(0, 2)))

  const nouveaux = [...prefixesN].filter((p) => !prefixesArch.has(p))
  const supprimes = [...prefixesArch].filter((p) => !prefixesN.has(p))

  if (nouveaux.length > 5 || supprimes.length > 5) {
    return anomalie(ref, nom, 'INFO',
      `Changements de structure: +${nouveaux.length} prefixes, -${supprimes.length} prefixes`,
      {
        comptes: [...nouveaux.map((p) => `+${p}`), ...supprimes.map((p) => `-${p}`)],
        montants: { nouveauxPrefixes: nouveaux.length, prefixesSupprimes: supprimes.length },
        description: `La structure du plan de comptes a evolue par rapport au dernier exercice archive: ${nouveaux.length} nouveaux prefixes et ${supprimes.length} supprimes. Le principe de permanence des methodes impose de maintenir la meme nomenclature comptable d\'un exercice a l\'autre, sauf changement reglementaire justifie.`
      },
      'Documenter les raisons des changements de nomenclature dans l\'annexe. S\'assurer de la comparabilite des etats financiers entre exercices.',
      'Art. 8 Acte Uniforme OHADA - Permanence des methodes')
  }
  return ok(ref, nom, 'Methodes comptables stables')
}

// AR-007: Coherence ajustements retrospectifs
function AR007(ctx: AuditContext): ResultatControle {
  const ref = 'AR-007', nom = 'Ajustements retrospectifs'
  const skip = needsArchives(ref, nom, ctx); if (skip) return skip

  // Verifier si le RAN contient des ajustements (difference entre RAN et resultat N-1 > 0)
  const ranN = find(ctx.balanceN, '12').reduce((s, l) => s + (l.credit - l.debit), 0)
  const archives = getArchives(ctx).sort((a, b) => a.exercice.localeCompare(b.exercice))
  const lastArch = archives[archives.length - 1]
  if (!lastArch) return na(ref, nom, 'Pas d\'archive precedente')

  const resultatArch = find(lastArch.snapshot.lignes, '13').reduce((s, l) => s + (l.credit - l.debit), 0)
  const ecart = ranN - resultatArch

  if (Math.abs(ecart) > 1) {
    return anomalie(ref, nom, 'MAJEUR',
      `Ajustement retrospectif detecte: ${ecart.toLocaleString('fr-FR')} (RAN - Resultat archive)`,
      {
        montants: { ranN, resultatArchive: resultatArch, ajustement: ecart },
        description: `Un ecart de ${ecart.toLocaleString('fr-FR')} FCFA est detecte entre le report a nouveau de l\'exercice courant (${ranN.toLocaleString('fr-FR')}) et le resultat de la derniere archive (${resultatArch.toLocaleString('fr-FR')}). Cet ecart peut resulter d\'un ajustement retrospectif (correction d\'erreur sur exercice anterieur, changement de methode comptable) ou d\'une distribution de dividendes/mise en reserves.`
      },
      'Documenter l\'ajustement retrospectif dans l\'annexe aux etats financiers (nature, motif, impact sur les exercices anterieurs). S\'assurer de la conformite avec IAS 8 / SYSCOHADA.',
      'Art. 8 Acte Uniforme OHADA - Changements de methodes / IAS 8')
  }
  return ok(ref, nom, 'Pas d\'ajustement retrospectif')
}

// --- Enregistrement ---

export function registerLevel8Controls(): void {
  const defs: Array<[string, string, string, ResultatControle['severite'], (ctx: AuditContext) => ResultatControle]> = [
    ['AR-001', 'Balance N-1 = Archive N-1', 'Coherence balance N-1 vs archive', 'BLOQUANT', AR001],
    ['AR-002', 'Continuite du capital', 'Stabilite du capital sur les exercices', 'MINEUR', AR002],
    ['AR-003', 'Tendance des resultats', 'Analyse tendance multi-exercices', 'INFO', AR003],
    ['AR-004', 'Rupture de serie', 'Detecte les exercices manquants', 'MINEUR', AR004],
    ['AR-005', 'Reports a nouveau successifs', 'Coherence des RAN successifs', 'MAJEUR', AR005],
    ['AR-006', 'Methodes comptables stables', 'Permanence des methodes', 'INFO', AR006],
    ['AR-007', 'Ajustements retrospectifs', 'Detecte les ajustements IAS 8', 'MAJEUR', AR007],
  ]

  for (const [ref, nom, desc, sev, fn] of defs) {
    controlRegistry.register(
      { ref, niveau: NIVEAU, nom, description: desc, severiteDefaut: sev, phase: 'PHASE_1', actif: true },
      fn
    )
  }
}
