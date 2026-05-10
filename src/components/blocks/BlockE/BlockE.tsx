import { useState, useMemo } from 'react'
import { useSectorStocks } from '../../../hooks/useSectorStocks'
import { useSectors } from '../../../hooks/useSectors'
import { Card } from '../../ui/Card'
import { SkeletonTable } from '../../ui/Skeleton'
import { ErrorRetry } from '../../ui/ErrorRetry'
import type { Stock, StockCategory, StockSortKey, SortDirection } from '../../../types'
import { STOCK_CATEGORY_ZH_MAP } from '../../../utils/copyFormat'

type BlockEProps = {
  date: string
  sectorId: string
  onSelectStock: (s: Stock) => void
}

export const STOCK_CATEGORY_COLORS: Record<StockCategory, string> = {
  leader:  'bg-red-950 text-red-400',
  catchUp: 'bg-orange-950 text-orange-400',
  turning: 'bg-yellow-950 text-yellow-400',
  weak:    'bg-green-950 text-green-400',
}

type TableTab = 'today' | 'period' | 'risk'

const TAB_LABELS: Record<TableTab, string> = {
  today: '今日概覽', period: '區間表現', risk: '籌碼風險',
}

type SortState = { key: StockSortKey; dir: SortDirection }

const TAB_DEFAULTS: Record<TableTab, SortState> = {
  today:  { key: 'relativeStrength', dir: 'desc' },
  period: { key: 'monthChange',      dir: 'desc' },
  risk:   { key: 'marginRatio',      dir: 'desc' },
}

// ── colour helpers ──────────────────────────────────────────────

function concentrationColor(v: number): string {
  if (v >= 70) return 'text-red-400'
  if (v <= 30) return 'text-green-400'
  return 'text-zinc-400'
}

function changeColorClass(v: number): string {
  return v > 0 ? 'text-red-400' : v < 0 ? 'text-green-400' : 'text-zinc-400'
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return null
  if (streak >= 3)  return <span className="text-[10px] px-1 py-0.5 rounded bg-red-900/60 text-red-400 font-medium whitespace-nowrap">連買{streak}日</span>
  if (streak <= -3) return <span className="text-[10px] px-1 py-0.5 rounded bg-green-900/60 text-green-400 font-medium whitespace-nowrap">連賣{Math.abs(streak)}日</span>
  const color = streak > 0 ? 'text-red-700' : 'text-green-700'
  return <span className={`text-[10px] ${color}`}>{streak > 0 ? '+' : ''}{streak}d</span>
}

function marginRatioColor(v: number): string {
  if (v >= 70) return 'text-red-400'
  if (v >= 40) return 'text-yellow-400'
  return 'text-zinc-400'
}

function riskRatioColor(v: number, threshold = 30): string {
  return v >= threshold ? 'text-red-400' : 'text-zinc-400'
}

// ── shared sub-components ───────────────────────────────────────

type SortableThProps = {
  label: string
  sortKey: StockSortKey
  current: SortState
  onSort: (key: StockSortKey) => void
  className?: string
}

function SortableTh({ label, sortKey, current, onSort, className = '' }: SortableThProps) {
  const active = current.key === sortKey
  return (
    <th
      className={`py-2 px-3 text-xs text-zinc-500 font-medium cursor-pointer select-none hover:text-zinc-300 transition-colors group ${className}`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span className={`ml-1 ${active ? 'text-zinc-400' : 'text-zinc-700 group-hover:text-zinc-500'}`}>
        {active ? (current.dir === 'desc' ? '↓' : '↑') : '↕'}
      </span>
    </th>
  )
}

type RowBase = { stock: Stock; onSelect: (s: Stock) => void }

function StockTr({ onSelect, stock, children }: RowBase & { children: React.ReactNode }) {
  return (
    <tr
      className="hover:bg-zinc-800/70 cursor-pointer transition-colors"
      onClick={() => onSelect(stock)}
    >
      {children}
    </tr>
  )
}

function StockCell({ stock }: { stock: Stock }) {
  return (
    <td className="py-2 px-3">
      <div className="text-sm font-medium text-zinc-200">{stock.stockName}</div>
      <div className="text-xs text-zinc-500">{stock.stockId}</div>
    </td>
  )
}

function CategoryCell({ stock }: { stock: Stock }) {
  return (
    <td className="py-2 px-3 text-right">
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STOCK_CATEGORY_COLORS[stock.category]}`}>
        {STOCK_CATEGORY_ZH_MAP[stock.category]}
      </span>
    </td>
  )
}

// ── per-tab row renderers ───────────────────────────────────────

function TodayRow({ stock, onSelect }: RowBase) {
  return (
    <StockTr stock={stock} onSelect={onSelect}>
      <StockCell stock={stock} />
      <td className={`py-2 px-3 text-sm font-semibold text-right ${changeColorClass(stock.change)}`}>
        {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
      </td>
      <td className={`py-2 px-3 text-sm text-right tabular-nums ${changeColorClass(stock.weekChange)}`}>
        {stock.weekChange > 0 ? '+' : ''}{stock.weekChange.toFixed(2)}%
      </td>
      <td className={`py-2 px-3 text-sm text-right ${changeColorClass(stock.relativeStrength)}`}>
        {stock.relativeStrength > 0 ? '+' : ''}{stock.relativeStrength.toFixed(2)}
      </td>
      <td className={`py-2 px-3 text-sm text-right ${changeColorClass(stock.institutionalFlow)}`}>
        <div className="flex items-center justify-end gap-1.5">
          <span className="tabular-nums">{stock.institutionalFlow > 0 ? '+' : ''}{stock.institutionalFlow.toFixed(1)}億</span>
          <StreakBadge streak={stock.institutionalStreak} />
        </div>
      </td>
      <td className={`py-2 px-3 text-sm text-right font-medium ${concentrationColor(stock.concentration)}`}>
        {stock.concentration}
      </td>
      <CategoryCell stock={stock} />
    </StockTr>
  )
}

function PeriodRow({ stock, onSelect }: RowBase) {
  return (
    <StockTr stock={stock} onSelect={onSelect}>
      <StockCell stock={stock} />
      <td className={`py-2 px-3 text-sm text-right ${changeColorClass(stock.monthChange)}`}>
        {stock.monthChange > 0 ? '+' : ''}{stock.monthChange.toFixed(2)}%
      </td>
      <td className={`py-2 px-3 text-sm text-right ${changeColorClass(stock.quarterChange)}`}>
        {stock.quarterChange > 0 ? '+' : ''}{stock.quarterChange.toFixed(2)}%
      </td>
      <CategoryCell stock={stock} />
    </StockTr>
  )
}

function RiskRow({ stock, onSelect }: RowBase) {
  return (
    <StockTr stock={stock} onSelect={onSelect}>
      <StockCell stock={stock} />
      <td className={`py-2 px-3 text-sm text-right ${marginRatioColor(stock.marginRatio)}`}>
        {stock.marginRatio.toFixed(0)}%
      </td>
      <td className={`py-2 px-3 text-sm text-right ${riskRatioColor(stock.shortRatio)}`}>
        {stock.shortRatio.toFixed(0)}%
      </td>
      <td className={`py-2 px-3 text-sm text-right ${riskRatioColor(stock.daytradingRatio)}`}>
        {stock.daytradingRatio.toFixed(0)}%
      </td>
      <td className={`py-2 px-3 text-sm text-right font-medium ${concentrationColor(stock.concentration)}`}>
        {stock.concentration}
      </td>
      <CategoryCell stock={stock} />
    </StockTr>
  )
}

// ── per-tab thead ───────────────────────────────────────────────

function TodayHead({ sort, onSort }: { sort: SortState; onSort: (k: StockSortKey) => void }) {
  return (
    <tr className="border-b border-zinc-800">
      <th className="py-2 px-3 text-xs text-zinc-500 font-medium">個股</th>
      <SortableTh label="今日"    sortKey="change"            current={sort} onSort={onSort} className="text-right" />
      <SortableTh label="近週"    sortKey="weekChange"        current={sort} onSort={onSort} className="text-right" />
      <SortableTh label="相對強弱" sortKey="relativeStrength"  current={sort} onSort={onSort} className="text-right" />
      <SortableTh label="法人"    sortKey="institutionalFlow" current={sort} onSort={onSort} className="text-right" />
      <SortableTh label="集中度"  sortKey="concentration"     current={sort} onSort={onSort} className="text-right" />
      <th className="py-2 px-3 text-xs text-zinc-500 font-medium text-right">分類</th>
    </tr>
  )
}

function PeriodHead({ sort, onSort }: { sort: SortState; onSort: (k: StockSortKey) => void }) {
  return (
    <tr className="border-b border-zinc-800">
      <th className="py-2 px-3 text-xs text-zinc-500 font-medium">個股</th>
      <SortableTh label="一月%"  sortKey="monthChange"   current={sort} onSort={onSort} className="text-right" />
      <SortableTh label="一季%"  sortKey="quarterChange" current={sort} onSort={onSort} className="text-right" />
      <th className="py-2 px-3 text-xs text-zinc-500 font-medium text-right">分類</th>
    </tr>
  )
}

function RiskHead({ sort, onSort }: { sort: SortState; onSort: (k: StockSortKey) => void }) {
  return (
    <tr className="border-b border-zinc-800">
      <th className="py-2 px-3 text-xs text-zinc-500 font-medium">個股</th>
      <SortableTh label="融資使用率" sortKey="marginRatio"     current={sort} onSort={onSort} className="text-right" />
      <SortableTh label="券資比"     sortKey="shortRatio"      current={sort} onSort={onSort} className="text-right" />
      <SortableTh label="當沖比"     sortKey="daytradingRatio" current={sort} onSort={onSort} className="text-right" />
      <SortableTh label="集中度"     sortKey="concentration"   current={sort} onSort={onSort} className="text-right" />
      <th className="py-2 px-3 text-xs text-zinc-500 font-medium text-right">分類</th>
    </tr>
  )
}

// ── main component ──────────────────────────────────────────────

export function BlockE({ date, sectorId, onSelectStock }: BlockEProps) {
  const { data, isLoading, isError, refetch } = useSectorStocks(sectorId, date)
  const { data: sectorsData } = useSectors(date)
  const [activeTab, setActiveTab] = useState<TableTab>('today')
  const [sort, setSort] = useState<SortState>(TAB_DEFAULTS.today)

  const sector = sectorsData?.sectors.find((s) => s.sectorId === sectorId)
  const sectorName = sector?.sectorName ?? sectorId

  function handleTabChange(tab: TableTab) {
    setActiveTab(tab)
    setSort(TAB_DEFAULTS[tab])
  }

  function handleSort(key: StockSortKey) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: 'desc' }
    )
  }

  const sortedStocks = useMemo(() => {
    if (!data) return []
    return [...data.stocks].sort((a, b) =>
      sort.dir === 'desc' ? b[sort.key] - a[sort.key] : a[sort.key] - b[sort.key]
    )
  }, [data, sort])

  const tabBar = (
    <div className="flex gap-0.5">
      {(['today', 'period', 'risk'] as TableTab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabChange(tab)}
          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
            activeTab === tab
              ? 'bg-zinc-700 text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
          }`}
        >
          {TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  )

  return (
    <Card title={`個股結構 — ${sectorName}`} action={tabBar}>
      {isLoading && <SkeletonTable rows={5} />}
      {isError && <ErrorRetry message="個股資料載入失敗" onRetry={() => refetch()} />}

      {data && (
        <div className="overflow-auto max-h-[400px] rounded-lg border border-zinc-800/50">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-zinc-900 z-10">
              {activeTab === 'today'  && <TodayHead  sort={sort} onSort={handleSort} />}
              {activeTab === 'period' && <PeriodHead sort={sort} onSort={handleSort} />}
              {activeTab === 'risk'   && <RiskHead   sort={sort} onSort={handleSort} />}
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {sortedStocks.map((stock) => {
                if (activeTab === 'today')  return <TodayRow  key={stock.stockId} stock={stock} onSelect={onSelectStock} />
                if (activeTab === 'period') return <PeriodRow key={stock.stockId} stock={stock} onSelect={onSelectStock} />
                return                             <RiskRow   key={stock.stockId} stock={stock} onSelect={onSelectStock} />
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
