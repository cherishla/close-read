import type { PercentileLabel } from '../types'

export const PERCENTILE_COLORS: Record<PercentileLabel, string> = {
  veryLow: 'bg-zinc-800 text-zinc-300',
  low: 'bg-zinc-800 text-zinc-400',
  mid: 'bg-zinc-800 text-zinc-400',
  high: 'bg-orange-950 text-orange-400',
  veryHigh: 'bg-red-950 text-red-400',
}

export const PERCENTILE_BAR_COLORS: Record<PercentileLabel, string> = {
  veryLow: 'bg-zinc-400',
  low: 'bg-zinc-600',
  mid: 'bg-zinc-500',
  high: 'bg-orange-500',
  veryHigh: 'bg-red-500',
}

export const PERCENTILE_LABEL_ZH: Record<PercentileLabel, string> = {
  veryLow: '偏低',
  low: '中低',
  mid: '中位',
  high: '偏高',
  veryHigh: '極高',
}

export function getPercentileColor(label: PercentileLabel): string {
  return PERCENTILE_COLORS[label]
}

export function getPercentileBarColor(label: PercentileLabel): string {
  return PERCENTILE_BAR_COLORS[label]
}

export function getPercentileLabelZh(label: PercentileLabel): string {
  return PERCENTILE_LABEL_ZH[label]
}
