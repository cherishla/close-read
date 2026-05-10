import { useMemo } from 'react'
import { useMarketStructure } from '../../../hooks/useMarketStructure'
import { useMarketSummary } from '../../../hooks/useMarketSummary'
import { useFundFlow } from '../../../hooks/useFundFlow'
import { useSectors } from '../../../hooks/useSectors'
import { buildMarketBrief } from '../../../utils/marketBrief'
import { getPercentileBarColor, getPercentileLabelZh } from '../../../utils/percentile'
import type { PercentileLabel } from '../../../types'
import type { MarketRegimeType } from '../../../utils/marketBrief'

const REGIME_ACCENT: Record<MarketRegimeType, string> = {
  broadAdvance:          'bg-red-800',
  concentratedAdvance:   'bg-amber-600',
  indexStrongBreadthWeak:'bg-orange-600',
  rotation:              'bg-zinc-600',
  weakRebound:           'bg-yellow-700',
  broadWeakness:         'bg-green-800',
  divergent:             'bg-zinc-600',
}

const REGIME_TEXT: Record<MarketRegimeType, string> = {
  broadAdvance:          'text-red-400',
  concentratedAdvance:   'text-amber-400',
  indexStrongBreadthWeak:'text-orange-400',
  rotation:              'text-zinc-400',
  weakRebound:           'text-yellow-400',
  broadWeakness:         'text-green-400',
  divergent:             'text-zinc-400',
}

function HighLowBalance({ newHigh, newLow }: { newHigh: number; newLow: number }) {
  const total = Math.max(newHigh + newLow, 1)
  const highPct = Math.max((newHigh / total) * 100, newHigh > 0 ? 4 : 0)

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-red-400">{newHigh}</span>
        <span className="text-green-400">{newLow}</span>
      </div>
      <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-zinc-800">
        <div className="h-full bg-red-600 transition-all" style={{ width: `${highPct}%` }} />
        <div className="h-full bg-green-700 flex-1" />
      </div>
      <div className="flex justify-between text-[10px] text-zinc-600">
        <span>創高</span>
        <span>創低</span>
      </div>
    </div>
  )
}

function MetricBar({
  label, value, displayValue, percentileLabel,
}: {
  label: string
  value: number
  displayValue: string
  percentileLabel: PercentileLabel
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-zinc-500">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-zinc-200 tabular-nums">{displayValue}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-zinc-800 text-zinc-400">
            {getPercentileLabelZh(percentileLabel)}
          </span>
        </div>
      </div>
      <div className="w-full bg-zinc-800 rounded-full h-1">
        <div
          className={`h-1 rounded-full ${getPercentileBarColor(percentileLabel)}`}
          style={{ width: `${Math.max(4, Math.min(value, 100))}%` }}
        />
      </div>
    </div>
  )
}

function SectorTag({
  name,
  amount,
  sectorId,
  onSelect,
}: {
  name: string
  amount: number
  sectorId: string
  onSelect?: (id: string) => void
}) {
  const isPositive = amount > 0
  const colorClass = isPositive
    ? 'bg-red-950/60 text-red-300 border-red-900/40 hover:bg-red-900/50'
    : 'bg-green-950/60 text-green-300 border-green-900/40 hover:bg-green-900/50'
  const sign = isPositive ? '+' : ''

  return (
    <button
      onClick={() => onSelect?.(sectorId)}
      disabled={!onSelect}
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border transition-colors ${colorClass} disabled:cursor-default`}
    >
      {name}
      <span className="opacity-70">{sign}{Math.abs(amount).toFixed(0)}億</span>
    </button>
  )
}

function BriefSkeleton() {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-5 py-4 h-full">
      <div className="flex flex-col sm:flex-row gap-5 h-full">
        <div className="sm:w-48 space-y-3">
          <div className="h-7 w-32 bg-zinc-800 rounded animate-pulse" />
          <div className="h-3 w-40 bg-zinc-800 rounded animate-pulse" />
          <div className="h-2 w-full bg-zinc-800 rounded animate-pulse" />
          <div className="h-2 w-full bg-zinc-800 rounded animate-pulse" />
        </div>
        <div className="hidden sm:block w-px bg-zinc-800" />
        <div className="flex-1 flex flex-col justify-center space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3.5 bg-zinc-800 rounded animate-pulse" style={{ width: `${70 + i * 7}%` }} />
              <div className="h-2.5 bg-zinc-800/60 rounded animate-pulse w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type DailyBriefCardProps = {
  date: string
  onSelectSector?: (sectorId: string) => void
}

export function DailyBriefCard({ date, onSelectSector }: DailyBriefCardProps) {
  const { data: structure, isLoading: sl } = useMarketStructure(date)
  const { data: summary, isLoading: ml } = useMarketSummary(date)
  const { data: flow, isLoading: fl } = useFundFlow(date)
  const { data: sectors, isLoading: ql } = useSectors(date)

  const isLoading = sl || ml || fl || ql

  const brief = useMemo(() => {
    if (!structure || !summary || !flow || !sectors) return null
    return buildMarketBrief(structure, summary, flow, sectors)
  }, [structure, summary, flow, sectors])

  if (isLoading) return <BriefSkeleton />
  if (!brief || !structure) return null

  const accentClass = REGIME_ACCENT[brief.regime.type] ?? 'bg-zinc-600'
  const regimeColor = REGIME_TEXT[brief.regime.type] ?? 'text-zinc-400'
  const volPct = Math.min((brief.marketStatus.volumeRatio / 2) * 100, 100)

  const inflowTags = brief.fundFlow.inflow.slice(0, 2)
  const riskText = brief.contradictions[0]?.description ?? '今日結構一致，無明顯矛盾訊號'
  const watchItem = brief.continuityItems[0] ?? brief.validationItems[0]
  const watchText = watchItem
    ? `${watchItem.sector?.sectorName ?? watchItem.title}：${watchItem.description}`
    : '今日無待追蹤項目'

  return (
    <div className="relative bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden h-full">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentClass}`} />

      <div className="pl-6 pr-5 py-4 h-full flex flex-col sm:flex-row gap-4 sm:gap-5">

        {/* Left: regime + metrics */}
        <div className="sm:w-48 flex-shrink-0 flex flex-col gap-2.5">
          <div>
            <div className={`text-base font-bold leading-tight ${regimeColor}`}>
              {brief.regime.label}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed line-clamp-2">
              {brief.regime.description}
            </p>
          </div>

          <div className="space-y-2">
            <MetricBar
              label="上漲家數比例"
              value={brief.marketStatus.breadthScore}
              displayValue={`${brief.marketStatus.breadthScore.toFixed(0)}%`}
              percentileLabel={brief.marketStatus.breadthLabel}
            />
            <MetricBar
              label="成交量（20MA比）"
              value={volPct}
              displayValue={`${brief.marketStatus.volumeRatio.toFixed(1)}×`}
              percentileLabel={brief.marketStatus.volumeLabel}
            />
          </div>

          <HighLowBalance
            newHigh={structure.indicators.newHighCount}
            newLow={structure.indicators.newLowCount}
          />
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-zinc-800 self-stretch" />
        <div className="sm:hidden h-px bg-zinc-800" />

        {/* Right: 3 decision sections */}
        <div className="flex-1 flex flex-col justify-center space-y-3.5">

          {/* 資金主軸 */}
          <div className="flex gap-2.5">
            <span className="text-xs font-bold shrink-0 w-14 mt-0.5 text-red-400">資金主軸</span>
            <div>
              {inflowTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {inflowTags.map((f) => (
                    <SectorTag
                      key={f.sectorId}
                      name={f.sectorName}
                      amount={f.amount}
                      sectorId={f.sectorId}
                      onSelect={onSelectSector}
                    />
                  ))}
                  {brief.fundFlow.outflow[0] && (
                    <SectorTag
                      key={brief.fundFlow.outflow[0].sectorId}
                      name={brief.fundFlow.outflow[0].sectorName}
                      amount={brief.fundFlow.outflow[0].amount}
                      sectorId={brief.fundFlow.outflow[0].sectorId}
                      onSelect={onSelectSector}
                    />
                  )}
                </div>
              ) : (
                <span className="text-xs text-zinc-500">今日無明顯資金主線</span>
              )}
            </div>
          </div>

          {/* 風險提醒 */}
          <div className="flex gap-2.5">
            <span className="text-xs font-bold shrink-0 w-14 mt-0.5 text-amber-400">風險提醒</span>
            <div>
              {brief.contradictions[0] && (
                <div className="text-xs font-semibold text-zinc-100 leading-snug mb-0.5">
                  {brief.contradictions[0].sector?.sectorName ?? brief.contradictions[0].title}
                </div>
              )}
              <div className="text-[11px] text-zinc-500 leading-relaxed">{riskText}</div>
            </div>
          </div>

          {/* 明日觀察 */}
          <div className="flex gap-2.5">
            <span className="text-xs font-bold shrink-0 w-14 mt-0.5 text-violet-400">明日觀察</span>
            <div className="text-[11px] text-zinc-400 leading-relaxed line-clamp-3">
              {watchText}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
