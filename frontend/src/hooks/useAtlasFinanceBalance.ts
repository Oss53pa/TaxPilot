/**
 * useAtlasFinanceBalance — React-query hooks for Atlas Finance balance import.
 */
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  checkAtlasFinanceAvailable,
  importFromAtlasFinance,
} from '@/services/atlasFinanceImportService'

export function useAtlasFinanceAvailable() {
  return useQuery({
    queryKey: ['atlas-finance-available'],
    queryFn: checkAtlasFinanceAvailable,
    staleTime: 60 * 1000,
  })
}

export function useImportFromAtlasFinance() {
  return useMutation({
    mutationFn: ({
      dossierId,
      fiscalYear,
      annee,
      entityId,
    }: {
      dossierId: string
      fiscalYear: number
      annee?: 'N' | 'N-1'
      entityId?: string
    }) => importFromAtlasFinance(dossierId, fiscalYear, annee, entityId),
  })
}
