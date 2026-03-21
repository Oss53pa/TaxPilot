/**
 * usePaysTheme — Hook pour résoudre le thème visuel du pays
 */

import { useMemo } from 'react'
import { resolvePaysTheme, getPaysVisualConfig, type PaysTheme, type PaysVisualConfig } from '@/config/paysTheme'

export function usePaysTheme(codePays?: string, surcharge?: Partial<PaysTheme>) {
  return useMemo(() => {
    const code = codePays || 'CI'
    const config = getPaysVisualConfig(code)
    const theme = resolvePaysTheme(code, surcharge)
    return { ...theme, paysConfig: config }
  }, [codePays, surcharge])
}
