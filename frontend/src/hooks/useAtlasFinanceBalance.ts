/**
 * useAtlasFinanceBalance — React-query hooks for Atlas Finance balance import.
 */
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  checkAtlasFinanceAvailable,
  importFromAtlasFinance,
  type AtlasFinanceImportResult,
} from '@/services/atlasFinanceImportService'

/**
 * Detect if Atlas Finance data is available for the current user.
 * Returns the list of societes + fiscal years they can import from.
 */
export function useAtlasFinanceAvailable() {
  return useQuery({
    queryKey: ['atlas-finance-available'],
    queryFn: checkAtlasFinanceAvailable,
    staleTime: 60 * 1000,
    retry: false,
  })
}

/**
 * Import a balance from Atlas Finance for a specific societe + fiscal year.
 */
export function useImportFromAtlasFinance() {
  return useMutation<
    AtlasFinanceImportResult,
    Error,
    {
      dossierId: string
      societeId: string
      fiscalYearId: string
      annee?: 'N' | 'N-1'
    }
  >({
    mutationFn: ({ dossierId, societeId, fiscalYearId, annee }) =>
      importFromAtlasFinance(dossierId, societeId, fiscalYearId, annee),
  })
}
