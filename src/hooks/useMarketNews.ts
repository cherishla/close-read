import { useQuery } from '@tanstack/react-query'
import { fetchMarketNews } from '../services'

export function useMarketNews(date: string) {
  return useQuery({
    queryKey: ['market-news', date],
    queryFn: () => fetchMarketNews(date),
    staleTime: Infinity,
  })
}
