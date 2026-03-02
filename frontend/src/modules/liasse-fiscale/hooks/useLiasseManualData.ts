import { useState, useCallback } from 'react'

const STORAGE_PREFIX = 'fiscasync_liasse_manual_'

type ManualData = Record<string, Record<string, string | number | null>>

/**
 * Hook to manage manual data entry for a liasse page.
 * Data is stored in localStorage keyed by pageId.
 *
 * Usage:
 *   const { getData, setCell, rows } = useLiasseManualData('suppl5', initialRows)
 *   // Pass rows to LiasseTable, pass setCell as onCellChange
 */
export function useLiasseManualData(pageId: string, initialRows: { id: string; cells: Record<string, string | number | null> }[]) {
  const storageKey = STORAGE_PREFIX + pageId

  const [manualData, setManualData] = useState<ManualData>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return {}
  })

  const setCell = useCallback((rowId: string, colKey: string, value: string | number | null) => {
    setManualData(prev => {
      const next = { ...prev }
      if (!next[rowId]) next[rowId] = {}
      next[rowId] = { ...next[rowId], [colKey]: value }
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch { /* storage full */ }
      return next
    })
  }, [storageKey])

  const getData = useCallback((rowId: string, colKey: string): string | number | null => {
    return manualData[rowId]?.[colKey] ?? null
  }, [manualData])

  // Merge manual data into initial rows
  const mergedRows = initialRows.map(row => {
    const overrides = manualData[row.id]
    if (!overrides) return row
    return {
      ...row,
      cells: { ...row.cells, ...overrides },
    }
  })

  return { getData, setCell, mergedRows, manualData }
}
