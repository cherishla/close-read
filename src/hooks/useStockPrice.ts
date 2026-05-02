import { useQuery } from '@tanstack/react-query'
import { fetchStockPrice } from '../services'
import type { StockPriceResponse } from '../types'

export function useStockPrice(stockId: string | null, date: string) {
  return useQuery<StockPriceResponse>({
    queryKey: ['stockPrice', stockId, date],
    queryFn: () => fetchStockPrice(stockId!, date),
    enabled: !!stockId,
    staleTime: Infinity,
  })
}
