/**
 * Base de donnees locale basee sur localStorage
 * Remplace le backend Django REST pour FiscaSync-Lite
 */

const DB_PREFIX = 'fiscasync_db_'

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function getCollection<T>(collection: string): T[] {
  try {
    const raw = localStorage.getItem(DB_PREFIX + collection)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCollection<T>(collection: string, data: T[]): void {
  localStorage.setItem(DB_PREFIX + collection, JSON.stringify(data))
}

function generateId(): number {
  const key = DB_PREFIX + '_id_counter'
  const current = parseInt(localStorage.getItem(key) || '1000', 10)
  const next = current + 1
  localStorage.setItem(key, String(next))
  return next
}

function matchesFilters(item: any, filters: Record<string, any>): boolean {
  for (const [key, value] of Object.entries(filters)) {
    if (key === 'page' || key === 'page_size' || key === 'ordering' || key === 'search' || key === 'format') continue
    if (value === undefined || value === null || value === '') continue

    if (key === 'search') {
      const searchStr = String(value).toLowerCase()
      const itemStr = JSON.stringify(item).toLowerCase()
      if (!itemStr.includes(searchStr)) return false
      continue
    }

    const itemValue = item[key]
    if (itemValue === undefined) continue
    if (String(itemValue) !== String(value)) return false
  }
  return true
}

export const localDb = {
  getAll<T>(collection: string, filters?: Record<string, any>): T[] {
    let items = getCollection<T>(collection)
    if (filters) {
      items = items.filter(item => matchesFilters(item, filters))
    }
    return items
  },

  getPaginated<T>(collection: string, filters?: Record<string, any>): PaginatedResponse<T> {
    let items = getCollection<T>(collection)

    if (filters) {
      // Handle search
      if (filters.search) {
        const searchStr = String(filters.search).toLowerCase()
        items = items.filter(item => JSON.stringify(item).toLowerCase().includes(searchStr))
      }
      items = items.filter(item => matchesFilters(item, filters))
    }

    // Handle ordering
    if (filters?.ordering) {
      const field = filters.ordering.replace(/^-/, '')
      const desc = filters.ordering.startsWith('-')
      items.sort((a: any, b: any) => {
        const va = a[field], vb = b[field]
        if (va < vb) return desc ? 1 : -1
        if (va > vb) return desc ? -1 : 1
        return 0
      })
    }

    const page = parseInt(filters?.page || '1', 10)
    const pageSize = parseInt(filters?.page_size || '20', 10)
    const start = (page - 1) * pageSize
    const paginatedItems = items.slice(start, start + pageSize)

    return {
      count: items.length,
      next: start + pageSize < items.length ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: paginatedItems,
    }
  },

  getById<T>(collection: string, id: number | string): T | null {
    const items = getCollection<any>(collection)
    const item = items.find((i: any) => String(i.id) === String(id) || i.slug === String(id))
    return item || null
  },

  create<T>(collection: string, item: any): T {
    const items = getCollection<any>(collection)
    const newItem = {
      ...item,
      id: item.id || generateId(),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    items.push(newItem)
    saveCollection(collection, items)
    return newItem as T
  },

  update<T>(collection: string, id: number | string, updates: any): T | null {
    const items = getCollection<any>(collection)
    const index = items.findIndex((i: any) => String(i.id) === String(id) || i.slug === String(id))
    if (index === -1) return null

    items[index] = {
      ...items[index],
      ...updates,
      id: items[index].id,
      updated_at: new Date().toISOString(),
    }
    saveCollection(collection, items)
    return items[index] as T
  },

  remove(collection: string, id: number | string): boolean {
    const items = getCollection<any>(collection)
    const filtered = items.filter((i: any) => String(i.id) !== String(id) && i.slug !== String(id))
    if (filtered.length === items.length) return false
    saveCollection(collection, filtered)
    return true
  },

  seed(collection: string, data: any[]): void {
    const existing = getCollection(collection)
    if (existing.length === 0) {
      saveCollection(collection, data)
    }
  },

  exportAll(): Record<string, any[]> {
    const result: Record<string, any[]> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(DB_PREFIX) && !key.endsWith('_id_counter')) {
        const collection = key.replace(DB_PREFIX, '')
        try {
          result[collection] = JSON.parse(localStorage.getItem(key) || '[]')
        } catch {
          // skip
        }
      }
    }
    return result
  },

  importAll(data: Record<string, any[]>): void {
    for (const [collection, items] of Object.entries(data)) {
      saveCollection(collection, items)
    }
  },

  clear(collection: string): void {
    localStorage.removeItem(DB_PREFIX + collection)
  },

  clearAll(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(DB_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  },
}

export default localDb
