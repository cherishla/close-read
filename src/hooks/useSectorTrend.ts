import { useQuery } from '@tanstack/react-query'
import { fetchSectorTrend } from '../services'

export function useSectorTrend(sectorId: string, date: string) {
  return useQuery({
    queryKey: ['sector-trend', sectorId, date],
    queryFn: () => fetchSectorTrend(sectorId, date),
    staleTime: Infinity,
  })
}
