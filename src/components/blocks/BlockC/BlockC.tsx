import { useState } from 'react'
import { useFundFlow } from '../../../hooks/useFundFlow'
import { useSectors } from '../../../hooks/useSectors'
import { Card } from '../../ui/Card'
import { IndicatorRow } from '../../ui/IndicatorRow'
import { SkeletonTable } from '../../ui/Skeleton'
import { ErrorRetry } from '../../ui/ErrorRetry'
import type { Sector, SectorFlow } from '../../../types'

type BlockCProps = { date: string }
type Tab = 'flow' | 'institutional' | 'chip'

// ─── 流向 Tab ────────────────────────────────────────────────────────────────

function FlowBar({ items, isInflow }: { items: SectorFlow[]; isInflow: boolean }) {
  const maxAmount = Math.max(...items.map((i) => Math.abs(i.amount)))
  const colorClass = isInflow ? 'bg-red-500' : 'bg-blue-500'
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.sectorId} className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 w-20 shrink-0 truncate">{item.sectorName}</span>
          <div className="flex-1 bg-zinc-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${colorClass}`}
              style={{ width: `${(Math.abs(item.amount) / maxAmount) * 100}%` }}
            />
          </div>
          <span className={`text-xs font-medium w-16 text-right ${isInflow ? 'text-red-400' : 'text-green-400'}`}>
            {isInflow ? '+' : ''}{item.amount.toFixed(1)}億
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── 法人 Tab ────────────────────────────────────────────────────────────────

function InstitutionalRow({ s }: { s: Sector }) {
  const streak = s.institutionalStreak ?? 0
  const isBuy = streak > 0
  const streakStyle = isBuy ? 'bg-red-950 text-red-400' : 'bg-green-950 text-green-400'
  const cumColor = isBuy ? 'text-red-400' : 'text-green-400'
  return (
    <div className="flex items-start gap-2">
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 tabular-nums ${streakStyle}`}>
        {isBuy ? '+' : ''}{streak}日
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs text-zinc-200 truncate">{s.sectorName}</span>
          {s.institutionalCumulative5d !== undefined && (
            <span className={`text-[10px] font-medium shrink-0 tabular-nums ${cumColor}`}>
              {s.institutionalCumulative5d > 0 ? '+' : ''}{s.institutionalCumulative5d}億/5日
            </span>
          )}
        </div>
        {s.institutionalAvgCost !== undefined && (
          <div className="text-[10px] text-zinc-600 mt-0.5">均成本約 {s.institutionalAvgCost} 元</div>
        )}
      </div>
    </div>
  )
}

function InstitutionalTab({ sectors }: { sectors: Sector[] }) {
  const withStreak = sectors.filter((s) => (s.institutionalStreak ?? 0) !== 0)
  const buyers = withStreak
    .filter((s) => (s.institutionalStreak ?? 0) > 0)
    .sort((a, b) => (b.institutionalStreak ?? 0) - (a.institutionalStreak ?? 0))
    .slice(0, 4)
  const sellers = withStreak
    .filter((s) => (s.institutionalStreak ?? 0) < 0)
    .sort((a, b) => (a.institutionalStreak ?? 0) - (b.institutionalStreak ?? 0))
    .slice(0, 4)

  if (buyers.length === 0 && sellers.length === 0) {
    return <p className="text-xs text-zinc-600">今日無明顯法人連續行為</p>
  }

  return (
    <div className="space-y-4">
      {buyers.length > 0 && (
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-red-400">連續買超</div>
          {buyers.map((s) => <InstitutionalRow key={s.sectorId} s={s} />)}
        </div>
      )}
      {buyers.length > 0 && sellers.length > 0 && (
        <div className="h-px bg-zinc-800" />
      )}
      {sellers.length > 0 && (
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-green-400">連續賣超</div>
          {sellers.map((s) => <InstitutionalRow key={s.sectorId} s={s} />)}
        </div>
      )}
    </div>
  )
}

// ─── 籌碼 Tab ────────────────────────────────────────────────────────────────

type RiskType = '雙重警示' | '融資偏高' | '當沖過熱'

function chipRisk(s: Sector): RiskType | null {
  const highMargin = (s.marginRatio ?? 0) > 60
  const highDaytrading = (s.daytradingRatio ?? 0) > 45
  if (highMargin && highDaytrading) return '雙重警示'
  if (highMargin) return '融資偏高'
  if (highDaytrading) return '當沖過熱'
  return null
}

const RISK_STYLE: Record<RiskType, string> = {
  '雙重警示': 'bg-orange-950 text-orange-400',
  '融資偏高':  'bg-amber-950 text-amber-400',
  '當沖過熱':  'bg-purple-950 text-purple-400',
}

function ChipTab({ sectors }: { sectors: Sector[] }) {
  const warnings = sectors
    .filter((s) => s.institutionalFlow > 0)
    .flatMap((s) => {
      const risk = chipRisk(s)
      return risk ? [{ sector: s, risk }] : []
    })

  if (warnings.length === 0) {
    return <p className="text-xs text-zinc-600">今日無籌碼鬆動訊號</p>
  }

  return (
    <div className="space-y-3">
      {warnings.map(({ sector: s, risk }) => (
        <div key={s.sectorId} className="flex items-start gap-2">
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${RISK_STYLE[risk]}`}>
            {risk}
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-zinc-200 truncate">{s.sectorName}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5 tabular-nums">
              融資 {s.marginRatio ?? '—'}%　當沖 {s.daytradingRatio ?? '—'}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 主元件 ──────────────────────────────────────────────────────────────────

const TAB_LABELS: Record<Tab, string> = { flow: '流向', institutional: '法人', chip: '籌碼' }

export function BlockC({ date }: BlockCProps) {
  const [tab, setTab] = useState<Tab>('flow')
  const { data: flow, isLoading: flowLoading, isError: flowError, refetch: flowRefetch } = useFundFlow(date)
  const { data: sectors, isLoading: sectorsLoading, isError: sectorsError, refetch: sectorsRefetch } = useSectors(date)

  const isLoading = flowLoading || sectorsLoading
  const isError = flowError || sectorsError

  const tabBar = (
    <div className="flex gap-1">
      {(['flow', 'institutional', 'chip'] as Tab[]).map((t) => (
        <button
          key={t}
          onClick={() => setTab(t)}
          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
            tab === t
              ? 'bg-zinc-600 text-zinc-100'
              : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {TAB_LABELS[t]}
        </button>
      ))}
    </div>
  )

  return (
    <Card title="資金流向" action={tabBar}>
      {isLoading && <SkeletonTable rows={5} />}
      {isError && (
        <ErrorRetry message="資料載入失敗" onRetry={() => { flowRefetch(); sectorsRefetch() }} />
      )}

      {!isLoading && !isError && tab === 'flow' && flow && (
        <div className="space-y-5">
          <IndicatorRow label="資金集中度" indicator={flow.concentration} />
          <div>
            <div className="text-xs font-semibold text-red-400 mb-2">流入 Top5</div>
            <FlowBar items={flow.inflow} isInflow={true} />
          </div>
          <div>
            <div className="text-xs font-semibold text-green-400 mb-2">流出 Top5</div>
            <FlowBar items={flow.outflow} isInflow={false} />
          </div>
        </div>
      )}

      {!isLoading && !isError && tab === 'institutional' && sectors && (
        <InstitutionalTab sectors={sectors.sectors} />
      )}

      {!isLoading && !isError && tab === 'chip' && sectors && (
        <ChipTab sectors={sectors.sectors} />
      )}
    </Card>
  )
}
