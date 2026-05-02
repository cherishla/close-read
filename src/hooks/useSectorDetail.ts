import { useQuery } from '@tanstack/react-query'
import { fetchSectorDetail } from '../services'

export function useSectorDetail(sectorId: string, date: string) {
  return useQuery({
    queryKey: ['sector-detail', sectorId, date],
    queryFn: () => fetchSectorDetail(sectorId, date),
    staleTime: Infinity,
  })
}
