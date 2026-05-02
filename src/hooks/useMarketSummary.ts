import { useQuery } from '@tanstack/react-query'
import { fetchMarketSummary } from '../services'

export function useMarketSummary(date: string) {
  return useQuery({
    queryKey: ['market-summary', date],
    queryFn: () => fetchMarketSummary(date),
    staleTime: Infinity,
  })
}
