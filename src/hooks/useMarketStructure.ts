import { useQuery } from '@tanstack/react-query'
import { fetchMarketStructure } from '../services'

export function useMarketStructure(date: string) {
  return useQuery({
    queryKey: ['market-structure', date],
    queryFn: () => fetchMarketStructure(date),
    staleTime: Infinity,
  })
}
