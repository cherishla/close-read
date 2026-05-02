import { useMemo } from 'react'
import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ReferenceLine, Legend, ResponsiveContainer,
} from 'recharts'
import { useSectorTrend } from '../../../hooks/useSectorTrend'
import { useSectorVolume } from '../../../hooks/useSectorVolume'
import { useIndexTrend } from '../../../hooks/useIndexTrend'
import type { Sector } from '../../../types'

type SectorPerfChartProps = {
  sectorId: string
  date: string
  sectorCategory: Sector['category']
}

const CATEGORY_COLOR: Record<Sector['category'], string> = {
  strong:           '#f87171',
  fundInWeak:       '#f97316',
  techStrongNoFund: '#facc15',
  weak:             '#60a5fa',
}

function formatDate(d: string) {
  const dt = new Date(d)
  return `${dt.getMonth() + 1}/${dt.getDate()}`
}

const CHART_STYLE = { backgroundColor: '#18181b', border: '1px solid #3f3f46', fontSize: 11 }

export function SectorPerfChart({ sectorId, date, sectorCategory }: SectorPerfChartProps) {
  const { data: trend }      = useSectorTrend(sectorId, date)
  const { data: indexTrend } = useIndexTrend(20, date)
  const { data: volumeData } = useSectorVolume(sectorId, date)

  const chartData = useMemo(() => {
    if (!trend || !indexTrend || !volumeData) return []
    const taiex = indexTrend.indices.find((s) => s.indexId === 'taiex')
    if (!taiex) return []
    return trend.data.map((p, i) => ({
      date:   formatDate(p.date),
      sector: Math.round(p.value * 100) / 100,
      taiex:  Math.round(((taiex.data[i]?.value ?? 100) - 100) * 100) / 100,
      volume: volumeData.data[i]?.volume ?? 0,
    }))
  }, [trend, indexTrend, volumeData])

  const lineColor = CATEGORY_COLOR[sectorCategory]
  const ready = chartData.length > 0

  if (!ready) {
    return <div className="h-40 bg-zinc-800/50 rounded animate-pulse" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-zinc-500">區間表現 + 成交量（近 20 日）</p>
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 h-0.5" style={{ backgroundColor: lineColor }} />
            產業%
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-4 border-t border-dashed border-zinc-500" />
            加權%
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-2.5 opacity-40" style={{ backgroundColor: lineColor }} />
            量（億）
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 36, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <ReferenceLine y={0} yAxisId="perf" stroke="#52525b" strokeDasharray="4 4" />

          <XAxis
            dataKey="date"
            tick={{ fill: '#71717a', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />

          {/* Left Y-axis: performance % */}
          <YAxis
            yAxisId="perf"
            orientation="left"
            tick={{ fill: '#71717a', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`}
            domain={['auto', 'auto']}
          />

          {/* Right Y-axis: volume 億 */}
          <YAxis
            yAxisId="vol"
            orientation="right"
            tick={{ fill: '#3f3f46', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`}
          />

          <Tooltip
            contentStyle={CHART_STYLE}
            formatter={(v, name) => {
              const n = v as number
              if (name === 'volume') return [`${n.toFixed(0)} 億`, '成交量']
              if (name === 'sector') return [`${n > 0 ? '+' : ''}${n.toFixed(2)}%`, '產業']
              return [`${n > 0 ? '+' : ''}${n.toFixed(2)}%`, '加權']
            }}
          />

          {/* Volume bars — background layer */}
          <Bar
            yAxisId="vol"
            dataKey="volume"
            fill={lineColor}
            fillOpacity={0.25}
            radius={[2, 2, 0, 0]}
            isAnimationActive={false}
          />

          {/* TAIEX line */}
          <Line
            yAxisId="perf"
            type="monotone"
            dataKey="taiex"
            stroke="#71717a"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            dot={false}
            activeDot={{ r: 3 }}
            isAnimationActive={false}
          />

          {/* Sector line — foreground */}
          <Line
            yAxisId="perf"
            type="monotone"
            dataKey="sector"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
            isAnimationActive={false}
          />

          <Legend
            wrapperStyle={{ display: 'none' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
