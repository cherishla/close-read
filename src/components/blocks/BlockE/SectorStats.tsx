import { useMemo } from 'react'
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useSectorDetail } from '../../../hooks/useSectorDetail'
import { useSectorFundFlow } from '../../../hooks/useSectorFundFlow'
import { useSectorStocks } from '../../../hooks/useSectorStocks'
import { Card } from '../../ui/Card'
import type { Sector, StockCategory } from '../../../types'

type SectorStatsProps = {
  sectorId: string
  date: string
  sector: Sector
}

const STOCK_CAT_ZH: Record<StockCategory, string> = {
  leader: '領漲', catchUp: '補漲', turning: '轉弱', weak: '弱勢',
}

const STOCK_CAT_COLOR: Record<StockCategory, string> = {
  leader: '#f87171', catchUp: '#fb923c', turning: '#facc15', weak: '#60a5fa',
}

const STOCK_CATS: StockCategory[] = ['leader', 'catchUp', 'turning', 'weak']

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getMonth() + 1}/${dt.getDate()}`
}

function SectorStreakBadge({ streak }: { streak: number }) {
  if (streak >= 3)  return <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900/60 text-green-400 font-medium">法人連買{streak}日</span>
  if (streak <= -3) return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-400 font-medium">法人連賣{Math.abs(streak)}日</span>
  const color = streak > 0 ? 'text-green-700' : 'text-blue-700'
  return <span className={`text-[10px] ${color}`}>法人 {streak > 0 ? '+' : ''}{streak}d</span>
}

function FlowBar({ label, value, maxAbs }: { label: string; value: number; maxAbs: number }) {
  const pct = maxAbs > 0 ? Math.abs(value) / maxAbs : 0
  const color = value >= 0 ? '#f87171' : '#60a5fa'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500 w-8">{label}</span>
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

const CHART_STYLE = { backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }

export function SectorStats({ sectorId, date, sector }: SectorStatsProps) {
  const { data: detail }   = useSectorDetail(sectorId, date)
  const { data: fundFlow } = useSectorFundFlow(sectorId, date)
  const { data: stocks }   = useSectorStocks(sectorId, date)

  const flowData = useMemo(
    () => fundFlow?.data.map((p) => ({ date: formatDate(p.date), flow: p.flow })) ?? [],
    [fundFlow]
  )

  const catCounts = useMemo(() => {
    const c: Record<StockCategory, number> = { leader: 0, catchUp: 0, turning: 0, weak: 0 }
    for (const s of stocks?.stocks ?? []) c[s.category]++
    return c
  }, [stocks])

  const totalStocks = stocks?.stocks.length ?? 0
  const maxInst = detail
    ? Math.max(Math.abs(detail.foreignFlow), Math.abs(detail.trustFlow), Math.abs(detail.dealerFlow), 1)
    : 1
  const breadthPct = Math.round(sector.breadth * 100)
  const flowReady = flowData.length > 0

  return (
    <Card title="族群分析">
      <div className="space-y-5">

        {/* ── 廣度 + 個股分類（頂部） ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1.5">上漲家數比例</p>
            <span className="text-2xl font-bold" style={{ color: breadthPct >= 50 ? '#f87171' : '#60a5fa' }}>
              {breadthPct}%
            </span>
            <div className="mt-1.5 w-full bg-zinc-700 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full"
                style={{ width: `${breadthPct}%`, backgroundColor: breadthPct >= 50 ? '#f87171' : '#60a5fa' }}
              />
            </div>
          </div>

          {totalStocks > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-1.5">個股分類（{totalStocks} 支）</p>
              <div className="flex h-2 rounded-full overflow-hidden mb-2">
                {STOCK_CATS.map((cat) => {
                  const pct = (catCounts[cat] / totalStocks) * 100
                  return pct > 0 ? (
                    <div key={cat} style={{ width: `${pct}%`, backgroundColor: STOCK_CAT_COLOR[cat] }} />
                  ) : null
                })}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {STOCK_CATS.filter((c) => catCounts[c] > 0).map((cat) => (
                  <div key={cat} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STOCK_CAT_COLOR[cat] }} />
                    <span className="text-xs text-zinc-400">{STOCK_CAT_ZH[cat]} {catCounts[cat]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── 整體資金買賣超 ── */}
        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-500 mb-2">整體資金買賣超（近 20 日，億）</p>
          {flowReady ? (
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={flowData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <ReferenceLine y={0} stroke="#52525b" />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(0)}`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={CHART_STYLE}
                  formatter={(v) => { const n = v as number; return [`${n > 0 ? '+' : ''}${n.toFixed(1)}億`, '整體買賣超'] }}
                />
                <Bar dataKey="flow" radius={[2, 2, 0, 0]}>
                  {flowData.map((entry, i) => (
                    <Cell key={i} fill={entry.flow >= 0 ? '#f87171' : '#60a5fa'} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-24 bg-zinc-800/50 rounded animate-pulse" />
          )}
        </div>

        {/* ── 三大法人 ── */}
        {detail && (
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-zinc-500">三大法人（億）</p>
              {sector.institutionalStreak !== undefined && sector.institutionalStreak !== 0 && (
                <SectorStreakBadge streak={sector.institutionalStreak} />
              )}
            </div>
            <div className="space-y-2">
              <FlowBar label="外資" value={detail.foreignFlow} maxAbs={maxInst} />
              <FlowBar label="投信" value={detail.trustFlow}   maxAbs={maxInst} />
              <FlowBar label="自營" value={detail.dealerFlow}  maxAbs={maxInst} />
            </div>
          </div>
        )}

      </div>
    </Card>
  )
}
