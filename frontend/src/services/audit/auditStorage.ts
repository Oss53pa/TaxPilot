/**
 * Persistence des sessions et resultats d'audit en localStorage
 */

import {
  SessionAudit,
  BalanceSnapshot,
  ArchiveAudit,
  RapportCorrection,
} from '@/types/audit.types'
import { BalanceEntry } from '@/services/liasseDataService'

const PREFIX = 'fiscasync_audit_'
const SESSIONS_KEY = `${PREFIX}sessions`
const SNAPSHOTS_KEY = `${PREFIX}snapshots`
const ARCHIVES_KEY = `${PREFIX}archives`
const REPORTS_KEY = `${PREFIX}correction_reports`

// --- Helpers ---

function getCollection<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function setCollection<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items))
}

// --- SHA-256 hash ---

export async function computeHash(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const buffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// --- Sessions ---

export function saveSession(session: SessionAudit): void {
  const sessions = getCollection<SessionAudit>(SESSIONS_KEY)
  const index = sessions.findIndex((s) => s.id === session.id)
  if (index >= 0) {
    sessions[index] = session
  } else {
    sessions.unshift(session)
  }
  // Garder max 50 sessions
  setCollection(SESSIONS_KEY, sessions.slice(0, 50))
}

export function getSession(id: string): SessionAudit | null {
  const sessions = getCollection<SessionAudit>(SESSIONS_KEY)
  return sessions.find((s) => s.id === id) || null
}

export function getAllSessions(): SessionAudit[] {
  return getCollection<SessionAudit>(SESSIONS_KEY)
}

export function deleteSession(id: string): void {
  const sessions = getCollection<SessionAudit>(SESSIONS_KEY)
  setCollection(
    SESSIONS_KEY,
    sessions.filter((s) => s.id !== id)
  )
}

// --- Snapshots ---

export async function saveSnapshot(
  balanceId: string,
  lignes: BalanceEntry[]
): Promise<BalanceSnapshot> {
  const totalDebit = lignes.reduce((sum, l) => sum + l.debit, 0)
  const totalCredit = lignes.reduce((sum, l) => sum + l.credit, 0)
  const hash = await computeHash(JSON.stringify(lignes))

  const snapshot: BalanceSnapshot = {
    id: `SNAP-${Date.now()}`,
    balanceId,
    date: new Date().toISOString(),
    lignes,
    totalDebit,
    totalCredit,
    hash,
  }

  const snapshots = getCollection<BalanceSnapshot>(SNAPSHOTS_KEY)
  snapshots.unshift(snapshot)
  setCollection(SNAPSHOTS_KEY, snapshots.slice(0, 20))

  return snapshot
}

export function getSnapshot(id: string): BalanceSnapshot | null {
  const snapshots = getCollection<BalanceSnapshot>(SNAPSHOTS_KEY)
  return snapshots.find((s) => s.id === id) || null
}

export function getSnapshotByBalance(balanceId: string): BalanceSnapshot | null {
  const snapshots = getCollection<BalanceSnapshot>(SNAPSHOTS_KEY)
  return snapshots.find((s) => s.balanceId === balanceId) || null
}

// --- Archives ---

export async function saveArchive(
  session: SessionAudit,
  snapshot: BalanceSnapshot
): Promise<ArchiveAudit> {
  const hash = await computeHash(JSON.stringify({ session, snapshot }))

  const archive: ArchiveAudit = {
    id: `ARCH-${Date.now()}`,
    exercice: session.exercice,
    dateArchivage: new Date().toISOString(),
    session,
    snapshot,
    hash,
  }

  const archives = getCollection<ArchiveAudit>(ARCHIVES_KEY)
  // Remplacer si meme exercice
  const existingIdx = archives.findIndex((a) => a.exercice === session.exercice)
  if (existingIdx >= 0) {
    archives[existingIdx] = archive
  } else {
    archives.unshift(archive)
  }
  setCollection(ARCHIVES_KEY, archives)

  return archive
}

export function getArchive(exercice: string): ArchiveAudit | null {
  const archives = getCollection<ArchiveAudit>(ARCHIVES_KEY)
  return archives.find((a) => a.exercice === exercice) || null
}

export function getAllArchives(): ArchiveAudit[] {
  return getCollection<ArchiveAudit>(ARCHIVES_KEY)
}

// --- Rapports de corrections ---

export function saveCorrectionReport(report: RapportCorrection): void {
  const reports = getCollection<RapportCorrection>(REPORTS_KEY)
  reports.unshift(report)
  setCollection(REPORTS_KEY, reports.slice(0, 20))
}

export function getCorrectionReport(id: string): RapportCorrection | null {
  const reports = getCollection<RapportCorrection>(REPORTS_KEY)
  return reports.find((r) => r.id === id) || null
}

export function getAllCorrectionReports(): RapportCorrection[] {
  return getCollection<RapportCorrection>(REPORTS_KEY)
}
