import { useQuery } from '@tanstack/react-query'
import { fetchSectorFundFlow } from '../services'

export function useSectorFundFlow(sectorId: string, date: string) {
  return useQuery({
    queryKey: ['sector-fund-flow', sectorId, date],
    queryFn: () => fetchSectorFundFlow(sectorId, date),
    staleTime: Infinity,
  })
}
