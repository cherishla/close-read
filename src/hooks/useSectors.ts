import { useQuery } from '@tanstack/react-query'
import { fetchSectors } from '../services'

export function useSectors(date: string) {
  return useQuery({
    queryKey: ['sectors', date],
    queryFn: () => fetchSectors(date),
    staleTime: Infinity,
  })
}
