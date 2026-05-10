import { useQuery } from '@tanstack/react-query'
import { fetchStockPrice } from '../services'
import type { StockPriceResponse } from '../types'

export function useStockPrice(stockId: string | null, date: string, period: 20 | 60 = 20) {
  return useQuery<StockPriceResponse>({
    queryKey: ['stockPrice', stockId, date, period],
    queryFn: () => fetchStockPrice(stockId!, date, period),
    enabled: !!stockId,
    staleTime: Infinity,
  })
}
