import { useQuery } from '@tanstack/react-query'
import { fetchStockDetail } from '../services'

export function useStockDetail(stockId: string, date: string) {
  return useQuery({
    queryKey: ['stock-detail', stockId, date],
    queryFn: () => fetchStockDetail(stockId, date),
    staleTime: Infinity,
  })
}
