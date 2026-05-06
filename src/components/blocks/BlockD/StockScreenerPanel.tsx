import { useState, useMemo } from 'react'
import { useAllStocks } from '../../../hooks/useAllStocks'
import { SkeletonTable } from '../../ui/Skeleton'
import { ErrorRetry } from '../../ui/ErrorRetry'
import { STOCK_CATEGORY_COLORS } from '../BlockE/BlockE'
import { STOCK_CATEGORY_ZH_MAP } from '../../../utils/copyFormat'
import type { SectorCategory, StockCategory, StockSortKey, SortDirection, Stock, StockWithSector } from '../../../types'

type StockScreenerPanelProps = {
  date: string
  onSelectStock: (sectorId: string, stock: Stock) => void
}

// ── filter state ─────────────────────────────────────────────────

type Filters = {
  sectorCategories: Set<SectorCategory>
  stockCategories: Set<StockCategory>
  flowDirection: 'buy' | 'sell' | null
  minStreak: number | null
  minConcentration: number | null
}

const INITIAL_FILTERS: Filters = {
  sectorCategories: new Set(),
  stockCategories: new Set(),
  flowDirection: null,
  minStreak: null,
  minConcentration: null,
}

// ── filter labels ────────────────────────────────────────────────

const SECTOR_CAT_LABELS: { key: SectorCategory; label: string }[] = [
  { key: 'strong',           label: '強勢族群' },
  { key: 'fundInWeak',       label: '資金異常' },
  { key: 'techStrongNoFund', label: '技術強' },
  { key: 'weak',             label: '弱勢族群' },
]

const STOCK_CAT_LABELS: { key: StockCategory; label: string }[] = [
  { key: 'leader',  label: '領漲' },
  { key: 'catchUp', label: '補漲' },
  { key: 'turning', label: '轉弱' },
  { key: 'weak',    label: '弱勢' },
]

// ── apply filters ────────────────────────────────────────────────

function applyFilters(stocks: StockWithSector[], f: Filters): StockWithSector[] {
  return stocks.filter((s) => {
    if (f.sectorCategories.size > 0 && !f.sectorCategories.has(s.sectorCategory)) return false
    if (f.stockCategories.size > 0 && !f.stockCategories.has(s.category)) return false
    if (f.flowDirection === 'buy'  && s.institutionalFlow <= 0) return false
    if (f.flowDirection === 'sell' && s.institutionalFlow >= 0) return false
    if (f.minStreak !== null && s.institutionalStreak < f.minStreak) return false
    if (f.minConcentration !== null && s.concentration < f.minConcentration) return false
    return true
  })
}

// ── colour helpers ────────────────────────────────────────────────

function signColor(v: number) {
  return v > 0 ? 'text-red-400' : v < 0 ? 'text-blue-400' : 'text-zinc-400'
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return null
  if (streak >= 3)  return <span className="text-[10px] px-1 py-0.5 rounded bg-green-900/60 text-green-400 font-medium whitespace-nowrap">連買{streak}日</span>
  if (streak <= -3) return <span className="text-[10px] px-1 py-0.5 rounded bg-blue-900/60 text-blue-400 font-medium whitespace-nowrap">連賣{Math.abs(streak)}日</span>
  const color = streak > 0 ? 'text-green-700' : 'text-blue-700'
  return <span className={`text-[10px] ${color}`}>{streak > 0 ? '+' : ''}{streak}d</span>
}

// ── filter chip button ────────────────────────────────────────────

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
        active
          ? 'bg-zinc-600 border-zinc-500 text-zinc-100'
          : 'bg-transparent border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
      }`}
    >
      {children}
    </button>
  )
}

// ── main component ────────────────────────────────────────────────

export function StockScreenerPanel({ date, onSelectStock }: StockScreenerPanelProps) {
  const { data, isLoading, isError, refetch } = useAllStocks(date)
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [sort, setSort] = useState<{ key: StockSortKey; dir: SortDirection }>({ key: 'relativeStrength', dir: 'desc' })

  function toggleSectorCat(key: SectorCategory) {
    setFilters((f) => {
      const next = new Set(f.sectorCategories)
      next.has(key) ? next.delete(key) : next.add(key)
      return { ...f, sectorCategories: next }
    })
  }

  function toggleStockCat(key: StockCategory) {
    setFilters((f) => {
      const next = new Set(f.stockCategories)
      next.has(key) ? next.delete(key) : next.add(key)
      return { ...f, stockCategories: next }
    })
  }

  function handleSort(key: StockSortKey) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: 'desc' }
    )
  }

  const hasFilters =
    filters.sectorCategories.size > 0 ||
    filters.stockCategories.size > 0 ||
    filters.flowDirection !== null ||
    filters.minStreak !== null ||
    filters.minConcentration !== null

  const results = useMemo(() => {
    if (!data) return []
    const filtered = applyFilters(data, filters)
    return [...filtered].sort((a, b) =>
      sort.dir === 'desc' ? b[sort.key] - a[sort.key] : a[sort.key] - b[sort.key]
    )
  }, [data, filters, sort])

  function SortTh({ label, sortKey, className = '' }: { label: string; sortKey: StockSortKey; className?: string }) {
    const active = sort.key === sortKey
    return (
      <th
        className={`py-2 px-2 text-xs text-zinc-500 font-medium cursor-pointer select-none hover:text-zinc-300 ${className}`}
        onClick={() => handleSort(sortKey)}
      >
        {label}
        <span className={`ml-1 ${active ? 'text-zinc-400' : 'text-zinc-700'}`}>
          {active ? (sort.dir === 'desc' ? '↓' : '↑') : '↕'}
        </span>
      </th>
    )
  }

  return (
    <div className="space-y-3">
      {/* ── 篩選條件 ── */}
      <div className="space-y-2 p-3 bg-zinc-800/40 rounded-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-600 w-12 shrink-0">族群</span>
          {SECTOR_CAT_LABELS.map(({ key, label }) => (
            <Chip key={key} active={filters.sectorCategories.has(key)} onClick={() => toggleSectorCat(key)}>
              {label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-600 w-12 shrink-0">個股</span>
          {STOCK_CAT_LABELS.map(({ key, label }) => (
            <Chip key={key} active={filters.stockCategories.has(key)} onClick={() => toggleStockCat(key)}>
              {label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 shrink-0">法人</span>
            <Chip active={filters.flowDirection === 'buy'}  onClick={() => setFilters((f) => ({ ...f, flowDirection: f.flowDirection === 'buy' ? null : 'buy' }))}>買超</Chip>
            <Chip active={filters.flowDirection === 'sell'} onClick={() => setFilters((f) => ({ ...f, flowDirection: f.flowDirection === 'sell' ? null : 'sell' }))}>賣超</Chip>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 shrink-0">連續</span>
            {([3, 5, 7] as const).map((n) => (
              <Chip key={n} active={filters.minStreak === n} onClick={() => setFilters((f) => ({ ...f, minStreak: f.minStreak === n ? null : n }))}>≥{n}日</Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-600 shrink-0">集中度</span>
            {([50, 60, 70] as const).map((n) => (
              <Chip key={n} active={filters.minConcentration === n} onClick={() => setFilters((f) => ({ ...f, minConcentration: f.minConcentration === n ? null : n }))}>≥{n}%</Chip>
            ))}
          </div>
          {hasFilters && (
            <button
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="text-xs text-zinc-600 hover:text-zinc-400 underline"
            >
              清除篩選
            </button>
          )}
        </div>
      </div>

      {/* ── 結果 ── */}
      {isLoading && <SkeletonTable rows={6} />}
      {isError && <ErrorRetry message="個股資料載入失敗" onRetry={() => refetch()} />}

      {data && (
        <>
          <p className="text-xs text-zinc-600">
            {hasFilters ? `篩選結果 ${results.length} 檔` : `全市場 ${results.length} 檔`}
            {results.length === 0 && <span className="ml-2 text-zinc-700">無符合條件的個股</span>}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="py-2 px-2 text-xs text-zinc-500 font-medium">個股</th>
                  <th className="py-2 px-2 text-xs text-zinc-500 font-medium">族群</th>
                  <SortTh label="漲跌"    sortKey="change"            className="text-right" />
                  <SortTh label="相對強弱" sortKey="relativeStrength"  className="text-right" />
                  <SortTh label="法人"    sortKey="institutionalFlow" className="text-right" />
                  <SortTh label="集中度"  sortKey="concentration"     className="text-right" />
                  <th className="py-2 px-2 text-xs text-zinc-500 font-medium text-right">分類</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {results.map((s) => (
                  <tr
                    key={`${s.sectorId}-${s.stockId}`}
                    className="hover:bg-zinc-800/70 cursor-pointer transition-colors"
                    onClick={() => onSelectStock(s.sectorId, s)}
                  >
                    <td className="py-2 px-2">
                      <div className="text-sm font-medium text-zinc-200">{s.stockName}</div>
                      <div className="text-xs text-zinc-500">{s.stockId}</div>
                    </td>
                    <td className="py-2 px-2 text-xs text-zinc-500 whitespace-nowrap">{s.sectorName}</td>
                    <td className={`py-2 px-2 text-sm font-semibold text-right tabular-nums ${signColor(s.change)}`}>
                      {s.change > 0 ? '+' : ''}{s.change.toFixed(2)}%
                    </td>
                    <td className={`py-2 px-2 text-sm text-right tabular-nums ${signColor(s.relativeStrength)}`}>
                      {s.relativeStrength > 0 ? '+' : ''}{s.relativeStrength.toFixed(2)}
                    </td>
                    <td className={`py-2 px-2 text-sm text-right ${signColor(s.institutionalFlow)}`}>
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="tabular-nums">{s.institutionalFlow > 0 ? '+' : ''}{s.institutionalFlow.toFixed(1)}億</span>
                        <StreakBadge streak={s.institutionalStreak} />
                      </div>
                    </td>
                    <td className={`py-2 px-2 text-sm text-right font-medium tabular-nums ${s.concentration >= 70 ? 'text-red-400' : s.concentration <= 30 ? 'text-blue-400' : 'text-zinc-400'}`}>
                      {s.concentration}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STOCK_CATEGORY_COLORS[s.category]}`}>
                        {STOCK_CATEGORY_ZH_MAP[s.category]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > 0 && (
              <p className="text-xs text-zinc-700 mt-2 px-1">點擊個股進入詳細研究頁</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
