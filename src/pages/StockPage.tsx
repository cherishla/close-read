import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ComposedChart, Bar, Cell, Line, ReferenceLine, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useStockPrice } from '../hooks/useStockPrice'
import { useStockDetail } from '../hooks/useStockDetail'
import { useStockFundamental } from '../hooks/useStockFundamental'
import { useSectors } from '../hooks/useSectors'
import { useSectorStocks } from '../hooks/useSectorStocks'
import { STOCK_CATEGORY_COLORS } from '../components/blocks/BlockE/BlockE'
import { STOCK_CATEGORY_ZH_MAP } from '../utils/copyFormat'
import { ChipFlowSection } from '../components/stock/ChipFlowSection'
import { StockResearchChecks } from '../components/stock/StockResearchChecks'
import { StockResearchSummary } from '../components/stock/StockResearchSummary'
import { fundamentalMetricColor } from '../utils/fundamental'
import { getPercentileLabelZh } from '../utils/percentile'
import { buildStockChecks, getStockRank } from '../utils/stockResearch'
import type { StockCheck } from '../utils/stockResearch'
import {
  buildStockSummary,
  buildChipRiskLevel,
  buildChipRiskLine,
  buildChipInterpretation,
} from '../utils/stockSummary'
import type { Stock, StockPricePoint, FundamentalMetric } from '../types'
import type { FundamentalMetricKind } from '../utils/fundamental'

type StockPageProps = {
  stock: Stock
  sectorId: string
  date: string
}

type StockChartPoint = StockPricePoint & {
  volumeDelta: number
  volumeDeltaPct: number | null
}

// ── colour helpers ──────────────────────────────────────────────

function signColor(v: number) {
  return v > 0 ? 'text-red-400' : v < 0 ? 'text-green-400' : 'text-zinc-400'
}
function concentrationColor(v: number) {
  return v >= 70 ? 'text-red-400' : v <= 30 ? 'text-green-400' : 'text-zinc-400'
}
function marginRatioColor(v: number) {
  return v >= 70 ? 'text-red-400' : v >= 40 ? 'text-yellow-400' : 'text-zinc-400'
}
function riskColor(v: number) {
  return v >= 30 ? 'text-red-400' : 'text-zinc-400'
}

// ── Assessment summary ──────────────────────────────────────────

function buildAssessmentSummary(checks: StockCheck[], signal: string): string {
  const positives = checks.filter((c) => c.tone === 'positive').map((c) => `${c.label}${c.value}`)
  const neutrals  = checks.filter((c) => c.tone === 'neutral').map((c) => c.label)
  const risks     = checks.filter((c) => c.tone === 'risk').map((c) => `${c.label}${c.value}`)
  const parts: string[] = [`整體${signal}`]
  if (positives.length > 0) parts.push(`主要由${positives.join('與')}帶動`)
  if (neutrals.length > 0 && risks.length === 0) parts.push(`${neutrals.join('、')}尚需確認`)
  if (risks.length > 0) parts.push(`${risks.join('、')}有壓力`)
  return parts.join('，') + '。'
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

function FundamentalMetricCell({
  label,
  metric,
  kind,
}: {
  label: string
  metric: FundamentalMetric
  kind: FundamentalMetricKind
}) {
  const textColor = fundamentalMetricColor(metric.percentileLabel, kind)
  const pctZh = getPercentileLabelZh(metric.percentileLabel)
  const sign = metric.unit === '%' && metric.value > 0 ? '+' : ''
  const display = metric.value === 0 && metric.unit !== '%' ? '—' : `${sign}${metric.value.toFixed(1)}${metric.unit}`
  return (
    <div className="bg-zinc-800 rounded-lg px-1.5 py-2 text-center">
      <div className={`text-xs font-bold tabular-nums ${textColor}`}>{display}</div>
      <div className="text-[9px] text-zinc-500 mt-0.5">{label}</div>
      <div className={`text-[9px] mt-0.5 ${textColor} opacity-60`}>{pctZh}</div>
    </div>
  )
}

// ── StreakBadge ─────────────────────────────────────────────────

function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return null
  if (streak >= 3)  return <span className="text-[10px] px-1 py-0.5 rounded bg-red-900/60 text-red-400 font-medium">連買{streak}日</span>
  if (streak <= -3) return <span className="text-[10px] px-1 py-0.5 rounded bg-green-900/60 text-green-400 font-medium">連賣{Math.abs(streak)}日</span>
  const color = streak > 0 ? 'text-red-700' : 'text-green-700'
  return <span className={`text-[10px] ${color}`}>{streak > 0 ? '+' : ''}{streak}d</span>
}

// ── CandlestickShape ────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CandlestickShape(props: any) {
  const { x, y, width, height, payload } = props as {
    x: number; y: number; width: number; height: number
    payload: StockChartPoint
  }
  if (!payload || x == null || y == null || width == null || height == null) return null

  const range = payload.high - payload.low
  if (range <= 0) return null

  const yForPrice = (price: number) => y + ((payload.high - price) / range) * height
  const yClose = yForPrice(payload.close)
  const yOpen  = yForPrice(payload.open)
  const yHigh  = y
  const yLow   = y + height
  const bodyTop = Math.min(yOpen, yClose)
  const bodyBot = Math.max(yOpen, yClose)
  const midX    = x + width / 2
  const color   = payload.close >= payload.open ? '#f87171' : '#4ade80'
  const bodyWidth = Math.max(Math.min(width - 2, 10), 1)
  const bodyX = midX - bodyWidth / 2
  return (
    <g>
      <line x1={midX} y1={yHigh}   x2={midX} y2={bodyTop} stroke={color} strokeWidth={1} />
      <line x1={midX} y1={bodyBot} x2={midX} y2={yLow}    stroke={color} strokeWidth={1} />
      <rect
        x={bodyX} y={bodyTop}
        width={bodyWidth}
        height={Math.max(bodyBot - bodyTop, 1)}
        fill={color}
      />
    </g>
  )
}

// ── Kline Tooltip ───────────────────────────────────────────────

function KlineTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: StockChartPoint }[]; label?: string }) {
  if (!active || !payload?.length) return null
  const d = payload[0]!.payload
  const parts = (label as string ?? '').split('-')
  const dateStr = `${parts[1]}/${parts[2]}`
  const isUp = d.close >= d.open
  const color = isUp ? '#f87171' : '#4ade80'
  const deltaColor = d.volumeDelta > 0 ? '#f87171' : d.volumeDelta < 0 ? '#4ade80' : '#71717a'
  const deltaSign = d.volumeDelta > 0 ? '+' : ''
  const deltaPctText = d.volumeDeltaPct == null ? '' : ` (${deltaSign}${d.volumeDeltaPct.toFixed(1)}%)`
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs space-y-0.5" style={{ minWidth: 130 }}>
      <p className="text-zinc-400 mb-1">{dateStr}</p>
      <p>開 <span style={{ color }}>{d.open.toFixed(2)}</span></p>
      <p>高 <span style={{ color }}>{d.high.toFixed(2)}</span></p>
      <p>低 <span style={{ color }}>{d.low.toFixed(2)}</span></p>
      <p>收 <span style={{ color }} className="font-bold">{d.close.toFixed(2)}</span></p>
      <p className="text-zinc-500 pt-0.5">量 {d.volume.toLocaleString()} 張</p>
      <p className="text-zinc-500">
        量差 <span style={{ color: deltaColor }}>{deltaSign}{d.volumeDelta.toLocaleString()} 張{deltaPctText}</span>
      </p>
    </div>
  )
}

function formatXDate(dateStr: string): string {
  const p = (dateStr as string).split('-')
  return `${p[1]}/${p[2]}`
}

function priceRange(d: StockChartPoint): [number, number] {
  return [d.low, d.high]
}

// ── main component ──────────────────────────────────────────────

export function StockPage({ stock, sectorId, date }: StockPageProps) {
  const [period, setPeriod] = useState<20 | 60>(20)
  const { data: priceData,       isLoading: priceLoading   } = useStockPrice(stock.stockId, date, period)
  const { data: detailData,      isLoading: detailLoading  } = useStockDetail(stock.stockId, date)
  const { data: fundamentalData, isLoading: fundLoading    } = useStockFundamental(stock.stockId, date)
  const { data: sectorsData  } = useSectors(date)
  const { data: stocksData   } = useSectorStocks(sectorId, date)

  const sector     = sectorsData?.sectors.find((s) => s.sectorId === sectorId)
  const sectorName = sector?.sectorName ?? sectorId
  const chartData = useMemo<StockChartPoint[]>(() => {
    const rows = priceData?.data ?? []
    return rows.map((d, i) => {
      const prevVolume = rows[i - 1]?.volume ?? d.volume
      const volumeDelta = d.volume - prevVolume
      return {
        ...d,
        volumeDelta,
        volumeDeltaPct: i === 0 || prevVolume === 0 ? null : (volumeDelta / prevVolume) * 100,
      }
    })
  }, [priceData])
  const maxVolumeDelta = useMemo(() => {
    const maxDelta = Math.max(...chartData.map((d) => Math.abs(d.volumeDelta)), 1)
    return Math.ceil(maxDelta * 1.25)
  }, [chartData])

  const sectorStocks = stocksData?.stocks ?? []
  const rank = useMemo(() => {
    if (!sectorStocks.length) return null
    return getStockRank(stock.stockId, sectorStocks)
  }, [sectorStocks, stock.stockId])

  const stockChecks = useMemo(
    () => buildStockChecks(stock, fundamentalData),
    [stock, fundamentalData]
  )

  const stockSummary = useMemo(
    () => buildStockSummary(stock, sectorName, detailData?.chip),
    [stock, sectorName, detailData]
  )

  const chipRiskLevel = buildChipRiskLevel(stock)
  const chipRiskLine  = buildChipRiskLine(stock)

  const positiveCount = stockChecks.filter((c) => c.tone === 'positive').length
  const riskCount = stockChecks.filter((c) => c.tone === 'risk').length
  const overallSignal =
    positiveCount >= 3 ? '強勢' :
    positiveCount >= 2 && riskCount === 0 ? '偏強' :
    riskCount >= 2 ? '偏弱' : '中性'
  const overallColor =
    overallSignal === '強勢' || overallSignal === '偏強' ? 'text-red-400' :
    overallSignal === '偏弱' ? 'text-green-400' : 'text-zinc-400'

  const assessmentSummary = useMemo(
    () => buildAssessmentSummary(stockChecks, overallSignal),
    [stockChecks, overallSignal]
  )

  const changeColor = stock.change > 0 ? 'text-red-400' : stock.change < 0 ? 'text-green-400' : 'text-zinc-400'
  const xTickInterval = period === 20 ? 3 : 9
  const klineBarSize = period === 20 ? 10 : 5

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sub-header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 sticky top-14.25 z-9">
        <div className="max-w-6xl mx-auto space-y-1.5">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Link to="/" className="hover:text-zinc-300 transition-colors">總覽</Link>
            <span>/</span>
            <Link to={`/sector/${sectorId}`} className="hover:text-zinc-300 transition-colors">{sectorName}</Link>
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

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 items-start">

          {/* ── Left column: summary cards (sticky) ── */}
          <div className="lg:sticky lg:top-32.5">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800/60">

              {/* 四面向評估 */}
              <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] text-zinc-500 font-semibold tracking-wide">四面向評估</p>
                  <span className={`text-sm font-bold ${overallColor}`}>{overallSignal}</span>
                </div>
                <StockResearchChecks checks={stockChecks} />
                <p className="text-[10px] text-zinc-600 mt-2.5 leading-relaxed">{assessmentSummary}</p>
              </div>

              {/* 族群內角色 */}
              <div className="px-4 py-4">
                <p className="text-[11px] text-zinc-500 font-semibold tracking-wide mb-2.5">族群內角色</p>
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[10px] text-zinc-600">角色</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STOCK_CATEGORY_COLORS[stock.category]}`}>
                    {STOCK_CATEGORY_ZH_MAP[stock.category]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
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
                  <div className="bg-zinc-800 rounded-lg px-3 py-2.5 text-center">
                    <div className={`text-sm font-bold tabular-nums ${signColor(stock.institutionalFlow)}`}>
                      {stock.institutionalFlow > 0 ? '+' : ''}{stock.institutionalFlow.toFixed(1)}億
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">法人買賣超</div>
                    {stock.institutionalStreak !== 0 && (
                      <div className="mt-1 flex justify-center">
                        <StreakBadge streak={stock.institutionalStreak} />
                      </div>
                    )}
                  </div>
                  <MetricCell
                    label="大單集中度"
                    value={String(stock.concentration)}
                    valueClass={concentrationColor(stock.concentration)}
                  />
                </div>
              </div>

              {/* 籌碼風險 */}
              <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] text-zinc-500 font-semibold tracking-wide">籌碼風險</p>
                  <span className={`text-[10px] font-semibold ${chipRiskLevel.color}`}>
                    風險：{chipRiskLevel.label}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
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
                <p className="text-[10px] text-zinc-600 leading-relaxed">{chipRiskLine}</p>
              </div>

              {/* 基本面概覽 */}
              {fundLoading && (
                <div className="px-4 py-4">
                  <p className="text-[11px] text-zinc-500 font-semibold tracking-wide mb-3">基本面</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[0,1,2,3,4].map((i) => (
                      <div key={i} className="bg-zinc-800 rounded-lg h-14 animate-pulse" />
                    ))}
                  </div>
                </div>
              )}
              {fundamentalData && (
                <div className="px-4 py-4">
                  <p className="text-[11px] text-zinc-500 font-semibold tracking-wide mb-3">基本面</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    <FundamentalMetricCell label="P/E"      metric={fundamentalData.pe}         kind="valuation" />
                    <FundamentalMetricCell label="P/B"      metric={fundamentalData.pb}         kind="valuation" />
                    <FundamentalMetricCell label="ROE"      metric={fundamentalData.roe}        kind="quality" />
                    <FundamentalMetricCell label="EPS"      metric={fundamentalData.epsYoY}     kind="growth" />
                    <FundamentalMetricCell label="營收"     metric={fundamentalData.revenueYoY} kind="growth" />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── Right column: K-line + chip detail ── */}
          <div className="space-y-4">

            {/* 個股研究摘要 */}
            <StockResearchSummary summary={stockSummary} />

            {/* K線 */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-zinc-500 font-medium">價格走勢與成交量</p>
                <div className="flex gap-0.5">
                  {([20, 60] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                        period === p
                          ? 'bg-zinc-700 text-zinc-100'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      {p}日
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 mb-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-px bg-zinc-400" />
                  <span className="text-[10px] text-zinc-600">成交量</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-2.5 rounded-sm bg-red-400/30" />
                  <span className="text-[10px] text-zinc-600">量增</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-2.5 rounded-sm bg-green-400/30" />
                  <span className="text-[10px] text-zinc-600">量縮</span>
                </div>
              </div>
              {priceLoading && <div className="h-60 bg-zinc-800/50 rounded animate-pulse" />}
              {priceData && (
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 4, right: 44, bottom: 0, left: 0 }}
                    barGap={-klineBarSize}
                  >
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatXDate}
                      interval={xTickInterval}
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
                    <YAxis
                      yAxisId="volDelta"
                      orientation="right"
                      domain={[-maxVolumeDelta, maxVolumeDelta]}
                      hide
                    />
                    <Tooltip content={<KlineTooltip />} />
                    <ReferenceLine yAxisId="volDelta" y={0} stroke="#3f3f46" strokeOpacity={0.45} />
                    <Bar
                      yAxisId="volDelta"
                      dataKey="volumeDelta"
                      fillOpacity={0.28}
                      barSize={klineBarSize}
                      isAnimationActive={false}
                    >
                      {chartData.map((d) => (
                        <Cell
                          key={d.date}
                          fill={d.volumeDelta > 0 ? '#f87171' : d.volumeDelta < 0 ? '#4ade80' : '#71717a'}
                        />
                      ))}
                    </Bar>
                    <Line
                      yAxisId="vol"
                      dataKey="volume"
                      type="monotone"
                      stroke="#a1a1aa"
                      strokeWidth={1.4}
                      dot={false}
                      activeDot={{ r: 3, fill: '#e4e4e7', stroke: '#18181b', strokeWidth: 1 }}
                      isAnimationActive={false}
                    />
                    {/* candlestick bodies + wicks via custom Bar shape */}
                    <Bar
                      yAxisId="price"
                      dataKey={priceRange}
                      barSize={klineBarSize}
                      shape={<CandlestickShape />}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* 法人籌碼 */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-4">
              <p className="text-xs text-zinc-500 font-medium mb-2">法人籌碼</p>
              {detailLoading && (
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-6 bg-zinc-800/60 rounded animate-pulse" />
                  ))}
                </div>
              )}
              {detailData && (
                <>
                  <p className="text-[10px] text-zinc-600 mb-4">
                    {buildChipInterpretation(detailData.chip)}
                  </p>
                  <ChipFlowSection chip={detailData.chip} />
                </>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
