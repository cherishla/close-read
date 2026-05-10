import { useQuery } from '@tanstack/react-query'
import { fetchIndexTrend } from '../services'

export function useIndexTrend(period: 20 | 30 | 60, date: string) {
  return useQuery({
    queryKey: ['index-trend', period, date],
    queryFn: () => fetchIndexTrend(period, date),
    staleTime: Infinity,
  })
}
