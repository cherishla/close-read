import type { PercentileLabel } from '../types'

export type FundamentalMetricKind = 'valuation' | 'quality' | 'growth'

const FUNDAMENTAL_VALUE_COLORS: Record<PercentileLabel, string> = {
  veryLow:  'text-blue-400',
  low:      'text-blue-400',
  mid:      'text-zinc-400',
  high:     'text-orange-400',
  veryHigh: 'text-red-400',
}

const QUALITY_VALUE_COLORS: Record<PercentileLabel, string> = {
  veryLow:  'text-red-400',
  low:      'text-orange-400',
  mid:      'text-zinc-400',
  high:     'text-blue-400',
  veryHigh: 'text-blue-400',
}

export function fundamentalValueColor(label: PercentileLabel): string {
  return FUNDAMENTAL_VALUE_COLORS[label]
}

export function fundamentalMetricColor(label: PercentileLabel, kind: FundamentalMetricKind): string {
  if (kind === 'quality' || kind === 'growth') return QUALITY_VALUE_COLORS[label]
  return FUNDAMENTAL_VALUE_COLORS[label]
}
