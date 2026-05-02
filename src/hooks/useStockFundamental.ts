import { useQuery } from '@tanstack/react-query'
import { fetchStockFundamental } from '../services'

export function useStockFundamental(stockId: string, date: string) {
  return useQuery({
    queryKey: ['stock-fundamental', stockId, date],
    queryFn: () => fetchStockFundamental(stockId, date),
    staleTime: Infinity,
  })
}
