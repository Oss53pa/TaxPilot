import { useCallback, useEffect, useRef } from 'react'

const DB_NAME = 'fiscasync-drafts'
const STORE_NAME = 'drafts'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
  })
}

async function saveDraft(key: string, data: unknown): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ key, data, savedAt: new Date().toISOString() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function loadDraft<T>(key: string): Promise<T | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(key)
    request.onsuccess = () => resolve(request.result?.data ?? null)
    request.onerror = () => reject(request.error)
  })
}

async function deleteDraft(key: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export function useAutoSave<T>(
  key: string,
  data: T,
  options: { intervalMs?: number; enabled?: boolean } = {}
) {
  const { intervalMs = 30000, enabled = true } = options
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const save = useCallback(async () => {
    if (!enabled || !data) return
    try {
      await saveDraft(key, data)
    } catch {
      // Silent fail for auto-save
    }
  }, [key, data, enabled])

  useEffect(() => {
    if (!enabled) return
    timerRef.current = setInterval(save, intervalMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [save, intervalMs, enabled])

  // Save on unmount
  useEffect(() => {
    return () => { save() }
  }, [save])

  return {
    save,
    load: () => loadDraft<T>(key),
    clear: () => deleteDraft(key),
  }
}
