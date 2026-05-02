import type { PercentileLabel } from '../../types'
import { getPercentileColor, getPercentileLabelZh } from '../../utils/percentile'

type PercentilePillProps = {
  percentile: number
  label: PercentileLabel
}

export function PercentilePill({ percentile, label }: PercentilePillProps) {
  const colorClass = getPercentileColor(label)
  const labelZh = getPercentileLabelZh(label)

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      近一年 p{percentile} {labelZh}
    </span>
  )
}
