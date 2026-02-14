import { useState, useCallback } from 'react'

interface UseEditableTableReturn {
  isEditMode: boolean
  setEditMode: (mode: boolean) => void
  toggleEditMode: () => void
  editedValues: Record<string, number | string>
  handleCellChange: (rowKey: string, colKey: string, value: number | string) => void
  getCellValue: (rowKey: string, colKey: string, defaultValue: number | string) => number | string
  hasChanges: boolean
  handleSave: () => void
  resetChanges: () => void
}

export function useEditableTable(): UseEditableTableReturn {
  const [isEditMode, setEditMode] = useState(false)
  const [editedValues, setEditedValues] = useState<Record<string, number | string>>({})
  const [hasChanges, setHasChanges] = useState(false)

  const toggleEditMode = useCallback(() => {
    setEditMode(prev => !prev)
  }, [])

  const handleCellChange = useCallback((rowKey: string, colKey: string, value: number | string) => {
    const key = `${rowKey}__${colKey}`
    setEditedValues(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }, [])

  const getCellValue = useCallback((rowKey: string, colKey: string, defaultValue: number | string): number | string => {
    const key = `${rowKey}__${colKey}`
    if (key in editedValues) {
      return editedValues[key]
    }
    return defaultValue
  }, [editedValues])

  const handleSave = useCallback(() => {
    console.log('Sauvegarde des modifications:', editedValues)
    setHasChanges(false)
  }, [editedValues])

  const resetChanges = useCallback(() => {
    setEditedValues({})
    setHasChanges(false)
  }, [])

  return {
    isEditMode,
    setEditMode,
    toggleEditMode,
    editedValues,
    handleCellChange,
    getCellValue,
    hasChanges,
    handleSave,
    resetChanges,
  }
}
