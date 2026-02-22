import { createContext, useContext } from 'react'

const PrintModeContext = createContext(false)

export const PrintModeProvider = PrintModeContext.Provider
export const usePrintMode = () => useContext(PrintModeContext)
