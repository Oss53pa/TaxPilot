import { createContext, useContext } from 'react'
import type { RegimeImposition } from './liasseFiscaleSheets'

export const RegimeContext = createContext<RegimeImposition>('REEL_NORMAL')
export const useRegimeImposition = () => useContext(RegimeContext)
