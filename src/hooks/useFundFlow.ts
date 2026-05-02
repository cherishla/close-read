import { useQuery } from '@tanstack/react-query'
import { fetchFundFlow } from '../services'

export function useFundFlow(date: string) {
  return useQuery({
    queryKey: ['fund-flow', date],
    queryFn: () => fetchFundFlow(date),
    staleTime: Infinity,
  })
}
