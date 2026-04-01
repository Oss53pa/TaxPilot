import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAllFiscalConfigs, updateFiscalConfig, type FiscalConfig } from '@/services/fiscalConfigService'

export function useFiscalConfigs() {
  return useQuery({
    queryKey: ['fiscal-configs'],
    queryFn: getAllFiscalConfigs,
    staleTime: 10 * 60 * 1000,
  })
}

export function useUpdateFiscalConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<FiscalConfig, 'id'>> }) =>
      updateFiscalConfig(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fiscal-configs'] })
    },
  })
}
