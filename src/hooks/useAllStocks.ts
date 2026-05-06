import { useQuery } from '@tanstack/react-query'
import { fetchAllStocks } from '../services'

export function useAllStocks(date: string) {
  return useQuery({
    queryKey: ['all-stocks', date],
    queryFn: () => fetchAllStocks(date),
    staleTime: Infinity,
  })
}
