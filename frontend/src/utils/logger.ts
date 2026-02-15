/**
 * Logger centralisé - remplace les console.log/error éparpillés
 * En production, seuls warn et error sont affichés.
 */

const isDev = import.meta.env.DEV

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('[FiscaSync]', ...args)
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info('[FiscaSync]', ...args)
  },
  warn: (...args: unknown[]) => {
    console.warn('[FiscaSync]', ...args)
  },
  error: (...args: unknown[]) => {
    console.error('[FiscaSync]', ...args)
  },
}
