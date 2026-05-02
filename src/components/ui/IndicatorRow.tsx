import type { IndicatorValue } from '../../types'
import { DeltaBadge } from './DeltaBadge'
import { PercentilePill } from './PercentilePill'

type IndicatorRowProps = {
  label: string
  indicator: IndicatorValue
}

export function IndicatorRow({ label, indicator }: IndicatorRowProps) {
  const { value, unit, deltaVsYesterday, percentile1Y, percentileLabel } = indicator

  return (
    <div className="flex items-start justify-between py-2.5 border-b border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-400 min-w-[120px]">{label}</span>
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-100">
            {value.toFixed(2)}{unit}
          </span>
          <DeltaBadge delta={deltaVsYesterday} unit={unit} />
        </div>
        <PercentilePill percentile={percentile1Y} label={percentileLabel} />
      </div>
    </div>
  )
}
