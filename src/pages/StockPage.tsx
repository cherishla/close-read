import { useState, useMemo } from 'react'
import {
  ComposedChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useStockPrice } from '../hooks/useStockPrice'
import { useStockDetail } from '../hooks/useStockDetail'
import { useStockFundamental } from '../hooks/useStockFundamental'
import { useSectors } from '../hooks/useSectors'
import { useSectorStocks } from '../hooks/useSectorStocks'
import { STOCK_CATEGORY_COLORS } from '../components/blocks/BlockE/BlockE'
import { STOCK_CATEGORY_ZH_MAP } from '../utils/copyFormat'
import { fundamentalValueColor } from '../utils/fundamental'
import { getPercentileLabelZh } from '../utils/percentile'
import type { Stock, StockChip, StockPricePoint, FundamentalMetric } from '../types'

type StockPageProps = {
  stock: Stock
  sectorId: string
  date: string
  onBack: () => void
  onBackToMain: () => void
}

// ── colour helpers ──────────────────────────────────────────────

function signColor(v: number) {
  return v > 0 ? 'text-red-400' : v < 0 ? 'text-blue-400' : 'text-zinc-400'
}
function concentrationColor(v: number) {
  return v >= 70 ? 'text-red-400' : v <= 30 ? 'text-blue-400' : 'text-zinc-400'
}
function marginRatioColor(v: number) {
  return v >= 70 ? 'text-red-400' : v >= 40 ? 'text-yellow-400' : 'text-zinc-400'
}
function riskColor(v: number) {
  return v >= 30 ? 'text-red-400' : 'text-zinc-400'
}

// ── MetricCell ──────────────────────────────────────────────────

function MetricCell({ label, value, valueClass }: { label: string; value: string; valueClass: string }) {
  return (
    <div className="bg-zinc-800 rounded-lg px-3 py-2.5 text-center">
      <div className={`text-sm font-bold tabular-nums ${valueClass}`}>{value}</div>
      <div className="text-[10px] text-zinc-500 mt-0.5">{label}</div>
    </div>
  )
}

function FundamentalMetricCell({ label, metric }: { label: string; metric: FundamentalMetric }) {
  const textColor = fundamentalValueColor(metric.percentileLabel)
  const pctZh = getPercentileLabelZh(metric.percentileLabel)
  const sign = metric.unit === '%' && metric.value > 0 ? '+' : ''
  const display = metric.value === 0 && metric.unit !== '%' ? '—' : `${sign}${metric.value.toFixed(1)}${metric.unit}`
  return (
    <div className="bg-zinc-800 rounded-lg px-3 py-2.5 text-center">
      <div className={`text-sm font-bold tabular-nums ${textColor}`}>{display}</div>
      <div className="text-[10px] text-zinc-500 mt-0.5">{label}</div>
      <div className={`text-[9px] mt-0.5 ${textColor} opacity-60`}>{pctZh}</div>
    </div>
  )
}

// ── K-line candlestick custom shape ────────────────────────────

function CandlestickShape(props: unknown) {
  const { x, y: _y, width, payload, yAxis } = props as {
    x: number; y: number; width: number
    payload: StockPricePoint
    yAxis: { scale: (v: number) => number }
  }
  if (!yAxis?.scale) return null
  const { open, high, low, close } = payload
  const isUp   = close >= open
  const color  = isUp ? '#f87171' : '#60a5fa'
  const scale  = yAxis.scale
  const bodyY1 = scale(Math.max(open, close))
  const bodyY2 = scale(Math.min(open, close))
  const highY  = scale(high)
  const lowY   = scale(low)
  const bodyH  = Math.max(Math.abs(bodyY2 - bodyY1), 1)
  const midX   = x + width / 2
  const bw     = Math.max(width - 2, 1)
  return (
    <g>
      <line x1={midX} y1={highY}  x2={midX} y2={bodyY1} stroke={color} strokeWidth={1} />
      <line x1={midX} y1={bodyY2} x2={midX} y2={lowY}   stroke={color} strokeWidth={1} />
      <rect x={x + 1} y={bodyY1} width={bw} height={bodyH} fill={color} />
    </g>
  )
}

// ── Kline Tooltip ───────────────────────────────────────────────

function KlineTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: StockPricePoint }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  const parts = (label as string ?? '').split('-')
  const dateStr = `${parts[1]}/${parts[2]}`
  const isUp = d.close >= d.open
  const color = isUp ? '#f87171' : '#60a5fa'
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs space-y-0.5" style={{ minWidth: 130 }}>
      <p className="text-zinc-400 mb-1">{dateStr}</p>
      <p>開 <span style={{ color }}>{d.open.toFixed(2)}</span></p>
      <p>高 <span style={{ color }}>{d.high.toFixed(2)}</span></p>
      <p>低 <span style={{ color }}>{d.low.toFixed(2)}</span></p>
      <p>收 <span style={{ color }} className="font-bold">{d.close.toFixed(2)}</span></p>
      <p className="text-zinc-500 pt-0.5">量 {d.volume.toLocaleString()} 張</p>
    </div>
  )
}

// ── FlowBar ─────────────────────────────────────────────────────

function FlowBar({ label, value, maxAbs }: { label: string; value: number; maxAbs: number }) {
  const pct   = maxAbs > 0 ? Math.abs(value) / maxAbs : 0
  const color = value >= 0 ? '#f87171' : '#60a5fa'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500 w-16">{label}</span>
        <span style={{ color }} className="font-medium tabular-nums">
          {value > 0 ? '+' : ''}{value.toFixed(1)}億
        </span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-1">
        <div className="h-1 rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function ChipSection({ chip }: { chip: StockChip }) {
  const maxInst = Math.max(
    Math.abs(chip.foreignFlow), Math.abs(chip.trustFlow), Math.abs(chip.dealerFlow),
    Math.abs(chip.mainPlayerFlow), Math.abs(chip.largeOrderDiff), 1
  )
  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide">法人買賣超</p>
        <FlowBar label="外資"   value={chip.foreignFlow}    maxAbs={maxInst} />
        <FlowBar label="投信"   value={chip.trustFlow}      maxAbs={maxInst} />
        <FlowBar label="自營商" value={chip.dealerFlow}     maxAbs={maxInst} />
        <FlowBar label="主力"   value={chip.mainPlayerFlow} maxAbs={maxInst} />
      </div>
      <div className="border-t border-zinc-800 pt-3 space-y-2.5">
        <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide">大單 / 信用</p>
        <FlowBar label="大單差" value={chip.largeOrderDiff} maxAbs={maxInst} />
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <div className="text-base font-bold text-zinc-200">{chip.marginBalance.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-0.5">融資餘額（張）</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <div className="text-base font-bold text-zinc-200">{chip.shortBalance.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-0.5">融券餘額（張）</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatRelTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h > 0) return `${h} 小時前`
  if (m > 0) return `${m} 分鐘前`
  return '剛剛'
}

function formatXDate(dateStr: string): string {
  const p = (dateStr as string).split('-')
  return `${p[1]}/${p[2]}`
}

type DetailTab = 'chip' | 'news'

// ── main component ──────────────────────────────────────────────

export function StockPage({ stock, sectorId, date, onBack, onBackToMain }: StockPageProps) {
  const [tab, setTab] = useState<DetailTab>('chip')
  const { data: priceData,       isLoading: priceLoading   } = useStockPrice(stock.stockId, date)
  const { data: detailData,      isLoading: detailLoading  } = useStockDetail(stock.stockId, date)
  const { data: fundamentalData, isLoading: fundLoading    } = useStockFundamental(stock.stockId, date)
  const { data: sectorsData  } = useSectors(date)
  const { data: stocksData   } = useSectorStocks(sectorId, date)

  const sector     = sectorsData?.sectors.find((s) => s.sectorId === sectorId)
  const sectorName = sector?.sectorName ?? sectorId

  const sectorStocks = stocksData?.stocks ?? []
  const rank = useMemo(() => {
    if (!sectorStocks.length) return null
    const sorted = [...sectorStocks].sort((a, b) => b.relativeStrength - a.relativeStrength)
    return sorted.findIndex(s => s.stockId === stock.stockId) + 1
  }, [sectorStocks, stock.stockId])

  const changeColor = stock.change > 0 ? 'text-red-400' : stock.change < 0 ? 'text-blue-400' : 'text-zinc-400'

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sub-header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 sticky top-14.25 z-9">
        <div className="max-w-3xl mx-auto space-y-1.5">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
            <button onClick={onBackToMain} className="hover:text-zinc-300 transition-colors">總覽</button>
            <span>/</span>
            <button onClick={onBack} className="hover:text-zinc-300 transition-colors">{sectorName}</button>
            <span>/</span>
            <span className="text-zinc-300">{stock.stockName} {stock.stockId}</span>
          </nav>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-base font-bold text-zinc-100">{stock.stockName}</span>
            <span className="text-sm text-zinc-500">{stock.stockId}</span>
            <span className={`text-sm font-semibold ${changeColor}`}>
              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STOCK_CATEGORY_COLORS[stock.category]}`}>
              {STOCK_CATEGORY_ZH_MAP[stock.category]}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* ── 指標總覽 ── */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-4 space-y-4">
          {/* 今日 · 族群定位 */}
          <div>
            <p className="text-xs text-zinc-600 font-medium mb-2">今日 · 族群定位</p>
            <div className="grid grid-cols-4 gap-2">
              <MetricCell
                label="族群排名"
                value={rank !== null ? `#${rank}/${sectorStocks.length}` : '—'}
                valueClass="text-zinc-200"
              />
              <MetricCell
                label="相對強弱"
                value={`${stock.relativeStrength > 0 ? '+' : ''}${stock.relativeStrength.toFixed(2)}`}
                valueClass={signColor(stock.relativeStrength)}
              />
              <MetricCell
                label="法人買賣超"
                value={`${stock.institutionalFlow > 0 ? '+' : ''}${stock.institutionalFlow.toFixed(1)}億`}
                valueClass={signColor(stock.institutionalFlow)}
              />
              <MetricCell
                label="大單集中度"
                value={String(stock.concentration)}
                valueClass={concentrationColor(stock.concentration)}
              />
            </div>
          </div>

          {/* 區間表現 */}
          <div>
            <p className="text-xs text-zinc-600 font-medium mb-2">區間表現</p>
            <div className="grid grid-cols-3 gap-2">
              <MetricCell
                label="近 5 日"
                value={`${stock.weekChange > 0 ? '+' : ''}${stock.weekChange.toFixed(2)}%`}
                valueClass={signColor(stock.weekChange)}
              />
              <MetricCell
                label="近 20 日"
                value={`${stock.monthChange > 0 ? '+' : ''}${stock.monthChange.toFixed(2)}%`}
                valueClass={signColor(stock.monthChange)}
              />
              <MetricCell
                label="近 60 日"
                value={`${stock.quarterChange > 0 ? '+' : ''}${stock.quarterChange.toFixed(2)}%`}
                valueClass={signColor(stock.quarterChange)}
              />
            </div>
          </div>

          {/* 籌碼風險 */}
          <div>
            <p className="text-xs text-zinc-600 font-medium mb-2">籌碼風險</p>
            <div className="grid grid-cols-3 gap-2">
              <MetricCell
                label="融資使用率"
                value={`${stock.marginRatio.toFixed(0)}%`}
                valueClass={marginRatioColor(stock.marginRatio)}
              />
              <MetricCell
                label="券資比"
                value={`${stock.shortRatio.toFixed(0)}%`}
                valueClass={riskColor(stock.shortRatio)}
              />
              <MetricCell
                label="當沖比"
                value={`${stock.daytradingRatio.toFixed(0)}%`}
                valueClass={riskColor(stock.daytradingRatio)}
              />
            </div>
          </div>

          {/* 基本面概覽 */}
          {fundLoading && (
            <div>
              <p className="text-xs text-zinc-600 font-medium mb-2">基本面概覽</p>
              <div className="grid grid-cols-5 gap-2">
                {[0,1,2,3,4].map((i) => (
                  <div key={i} className="bg-zinc-800 rounded-lg h-16 animate-pulse" />
                ))}
              </div>
            </div>
          )}
          {fundamentalData && (
            <div>
              <p className="text-xs text-zinc-600 font-medium mb-2">基本面概覽</p>
              <div className="grid grid-cols-5 gap-2">
                <FundamentalMetricCell label="P/E"   metric={fundamentalData.pe} />
                <FundamentalMetricCell label="P/B"   metric={fundamentalData.pb} />
                <FundamentalMetricCell label="ROE"   metric={fundamentalData.roe} />
                <FundamentalMetricCell label="EPS YoY"  metric={fundamentalData.epsYoY} />
                <FundamentalMetricCell label="營收 YoY" metric={fundamentalData.revenueYoY} />
              </div>
            </div>
          )}
        </div>

        {/* ── K 線 + 成交量 ── */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-4">
          <p className="text-xs text-zinc-500 font-medium mb-3">近 20 日 K 線</p>
          {priceLoading && <div className="h-60 bg-zinc-800/50 rounded animate-pulse" />}
          {priceData && (
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={priceData.data} margin={{ top: 4, right: 44, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXDate}
                  interval={3}
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="price"
                  orientation="left"
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <YAxis
                  yAxisId="vol"
                  orientation="right"
                  domain={[0, 'auto']}
                  tick={{ fontSize: 9, fill: '#52525b' }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                />
                <Tooltip content={<KlineTooltip />} />
                {/* Volume bars (background) */}
                <Bar
                  yAxisId="vol"
                  dataKey="volume"
                  fill="#71717a"
                  fillOpacity={0.25}
                  isAnimationActive={false}
                />
                {/* Candlestick bars */}
                <Bar
                  yAxisId="price"
                  dataKey="close"
                  shape={CandlestickShape}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── 法人籌碼 + 新聞 ── */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800">
          <div className="flex border-b border-zinc-800">
            {(['chip', 'news'] as DetailTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'text-zinc-100 border-b-2 border-zinc-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {t === 'chip' ? '法人籌碼' : '相關新聞'}
              </button>
            ))}
          </div>

          <div className="p-5">
            {detailLoading && (
              <div className="space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-6 bg-zinc-800/60 rounded animate-pulse" />
                ))}
              </div>
            )}
            {detailData && tab === 'chip' && <ChipSection chip={detailData.chip} />}
            {detailData && tab === 'news' && (
              <div className="space-y-3">
                {detailData.news.length === 0 && (
                  <p className="text-sm text-zinc-500 text-center py-6">暫無相關新聞</p>
                )}
                {detailData.news.map((item) => (
                  <div key={item.id} className="border-b border-zinc-800/60 pb-3 last:border-0">
                    <p className="text-sm text-zinc-200 leading-snug mb-1">{item.title}</p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{item.source}</span>
                      <span>·</span>
                      <span>{formatRelTime(item.publishedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}
