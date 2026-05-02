import { useQuery } from '@tanstack/react-query'
import { fetchSectorVolume } from '../services'

export function useSectorVolume(sectorId: string, date: string) {
  return useQuery({
    queryKey: ['sector-volume', sectorId, date],
    queryFn: () => fetchSectorVolume(sectorId, date),
    staleTime: Infinity,
  })
}
