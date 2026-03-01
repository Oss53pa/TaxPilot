/**
 * Service de persistance localStorage pour le registre d'exercices fiscaux
 * Chaque exercice est identifie par son annee et peut contenir balance, audit, archive
 */

const STORAGE_KEY = 'fiscasync_exercices'

export type StatutExercice = 'en_cours' | 'cloture' | 'valide' | 'depose'

export interface ExerciceRecord {
  id: string
  annee: string
  label: string
  statut: StatutExercice
  dateDebut: string
  dateFin: string
  duree_mois: number
  hasBalance: boolean
  hasAudit: boolean
  hasArchive: boolean
  dateCreation: string
  dateModification: string
}

function readAll(): ExerciceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(records: ExerciceRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function getAllExercices(): ExerciceRecord[] {
  return readAll().sort((a, b) => b.annee.localeCompare(a.annee))
}

export function getExercice(annee: string): ExerciceRecord | null {
  return readAll().find(e => e.annee === annee) || null
}

export function getOrCreateExercice(annee: string): ExerciceRecord {
  const all = readAll()
  const existing = all.find(e => e.annee === annee)
  if (existing) return existing

  const year = parseInt(annee)
  const record: ExerciceRecord = {
    id: `ex_${annee}_${Date.now().toString(36)}`,
    annee,
    label: `Exercice ${annee}`,
    statut: 'en_cours',
    dateDebut: `${year}-01-01`,
    dateFin: `${year}-12-31`,
    duree_mois: 12,
    hasBalance: false,
    hasAudit: false,
    hasArchive: false,
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString(),
  }

  all.push(record)
  writeAll(all)
  return record
}

export function updateExercice(annee: string, partial: Partial<ExerciceRecord>): ExerciceRecord | null {
  const all = readAll()
  const idx = all.findIndex(e => e.annee === annee)
  if (idx === -1) return null

  all[idx] = { ...all[idx], ...partial, dateModification: new Date().toISOString() }
  writeAll(all)
  return all[idx]
}

export function deleteExercice(annee: string): boolean {
  const all = readAll()
  const filtered = all.filter(e => e.annee !== annee)
  if (filtered.length === all.length) return false
  writeAll(filtered)
  return true
}

export function markExerciceHasBalance(annee: string): void {
  updateExercice(annee, { hasBalance: true })
}

export function markExerciceHasAudit(annee: string): void {
  updateExercice(annee, { hasAudit: true })
}

export function markExerciceHasArchive(annee: string): void {
  updateExercice(annee, { hasArchive: true })
}
