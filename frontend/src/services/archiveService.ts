/**
 * Service d'archive de liasse avec hash d'integrite SHA-256
 * Stockage localStorage avec verification d'integrite
 */

import type { SessionAudit, RapportPartie2 } from '@/types/audit.types'
import type { StoredBalance } from './balanceStorageService'
import { computeHash } from './audit/auditStorage'

const PREFIX = 'fiscasync_archive_'

export interface LiasseArchiveRecord {
  id: string
  exercice: string
  dateArchivage: string
  balance: {
    id: string
    fileName: string
    exercice: string
    version: number
    accountCount: number
    totalDebit: number
    totalCredit: number
  }
  auditSession?: {
    id: string
    phase: string
    scoreGlobal: number
    bloquantsRestants: number
    totalControles: number
  }
  rapportPartie2?: {
    corriges: number
    nonCorriges: number
    nouveaux: number
    conforme: boolean
  }
  liasseData: Record<string, unknown>
  hash: string
  contentHash: string
}

// --- Helpers ---

function getArchives(): LiasseArchiveRecord[] {
  try {
    const data = localStorage.getItem(PREFIX + 'records')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveArchives(archives: LiasseArchiveRecord[]): void {
  localStorage.setItem(PREFIX + 'records', JSON.stringify(archives))
}

/**
 * Creer une archive de liasse avec hash d'integrite
 */
export async function createLiasseArchive(
  balance: StoredBalance,
  liasseData: Record<string, unknown>,
  auditSession?: SessionAudit,
  rapportP2?: RapportPartie2
): Promise<LiasseArchiveRecord> {
  // Build archive content
  const content = {
    balance: balance.entries,
    liasseData,
    auditResultats: auditSession?.resultats || [],
    exercice: balance.exercice,
    timestamp: new Date().toISOString(),
  }

  const contentHash = await computeHash(JSON.stringify(content))

  const archive: LiasseArchiveRecord = {
    id: `LARCH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    exercice: balance.exercice,
    dateArchivage: new Date().toISOString(),
    balance: {
      id: balance.id,
      fileName: balance.fileName,
      exercice: balance.exercice,
      version: balance.version || 1,
      accountCount: balance.accountCount,
      totalDebit: balance.totalDebit,
      totalCredit: balance.totalCredit,
    },
    auditSession: auditSession ? {
      id: auditSession.id,
      phase: auditSession.phase,
      scoreGlobal: auditSession.resume.scoreGlobal,
      bloquantsRestants: auditSession.resume.bloquantsRestants,
      totalControles: auditSession.resume.totalControles,
    } : undefined,
    rapportPartie2: rapportP2 ? {
      corriges: rapportP2.synthese.corriges,
      nonCorriges: rapportP2.synthese.nonCorriges,
      nouveaux: rapportP2.synthese.nouveaux,
      conforme: rapportP2.synthese.conforme,
    } : undefined,
    liasseData,
    hash: '', // Will be set below
    contentHash,
  }

  // Hash the full archive (excluding hash field itself)
  archive.hash = await computeHash(JSON.stringify({ ...archive, hash: '' }))

  // Save
  const archives = getArchives()
  // Replace if same exercice
  const idx = archives.findIndex(a => a.exercice === balance.exercice)
  if (idx >= 0) {
    archives[idx] = archive
  } else {
    archives.unshift(archive)
  }
  saveArchives(archives)

  return archive
}

/**
 * Verifier l'integrite d'une archive
 */
export async function verifyArchiveIntegrity(archiveId: string): Promise<boolean> {
  const archives = getArchives()
  const archive = archives.find(a => a.id === archiveId)
  if (!archive) return false

  const expectedHash = await computeHash(JSON.stringify({ ...archive, hash: '' }))
  return expectedHash === archive.hash
}

/**
 * Exporter une archive en JSON
 */
export function exportArchiveJSON(archiveId: string): void {
  const archives = getArchives()
  const archive = archives.find(a => a.id === archiveId)
  if (!archive) throw new Error(`Archive ${archiveId} introuvable`)

  const json = JSON.stringify(archive, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `archive_liasse_${archive.exercice}_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Recuperer toutes les archives
 */
export function getAllLiasseArchives(): LiasseArchiveRecord[] {
  return getArchives()
}

/**
 * Recuperer une archive par exercice
 */
export function getLiasseArchive(exercice: string): LiasseArchiveRecord | null {
  const archives = getArchives()
  return archives.find(a => a.exercice === exercice) || null
}
