import { useQuery } from '@tanstack/react-query'
import { fetchSectorStocks } from '../services'

export function useSectorStocks(sectorId: string | null, date: string) {
  return useQuery({
    queryKey: ['sector-stocks', date, sectorId],
    queryFn: () => fetchSectorStocks(sectorId!, date),
    enabled: !!sectorId,
    staleTime: Infinity,
  })
}
