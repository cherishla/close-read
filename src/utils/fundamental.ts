import type { PercentileLabel } from '../types'

const FUNDAMENTAL_VALUE_COLORS: Record<PercentileLabel, string> = {
  veryLow:  'text-blue-400',
  low:      'text-blue-400',
  mid:      'text-zinc-400',
  high:     'text-orange-400',
  veryHigh: 'text-red-400',
}

export function fundamentalValueColor(label: PercentileLabel): string {
  return FUNDAMENTAL_VALUE_COLORS[label]
}
