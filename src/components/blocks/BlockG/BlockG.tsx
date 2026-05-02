import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { useIndexTrend } from '../../../hooks/useIndexTrend'
import { Card } from '../../ui/Card'
import { ErrorRetry } from '../../ui/ErrorRetry'

type BlockGProps = {
  date: string
}

const INDEX_CONFIG: Record<string, { color: string; name: string }> = {
  taiex:   { color: '#60a5fa', name: '加權' },
  otc:     { color: '#f97316', name: '上櫃' },
  futures: { color: '#a78bfa', name: '台指期' },
}

function formatAxisDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

type TooltipPayloadEntry = {
  dataKey: string
  name: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-xs space-y-1 shadow-xl">
      <div className="text-zinc-400 mb-1">{label}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-zinc-300">{entry.name}</span>
          <span className="text-zinc-100 font-medium ml-auto pl-3">
            {entry.value.toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function BlockG({ date }: BlockGProps) {
  const [period, setPeriod] = useState<20 | 60>(20)
  const { data, isLoading, isError, refetch } = useIndexTrend(period, date)

  const chartData = useMemo(() => {
    if (!data) return []
    const base = data.indices[0]
    if (!base) return []
    return base.data.map((point, i) => {
      const row: Record<string, string | number> = {
        date: formatAxisDate(point.date),
      }
      for (const series of data.indices) {
        row[series.indexId] = series.data[i]?.value ?? 100
      }
      return row
    })
  }, [data])

  const xTickInterval = period === 20 ? 3 : 9

  const periodSelector = (
    <div className="flex gap-1">
      {([20, 60] as const).map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
            period === p
              ? 'bg-zinc-600 text-zinc-100'
              : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {p}日
        </button>
      ))}
    </div>
  )

  return (
    <Card title="G｜指數趨勢比較" action={periodSelector}>
      {isLoading && (
        <div className="h-40 flex items-center justify-center">
          <div className="w-full h-32 bg-zinc-800/50 rounded animate-pulse" />
        </div>
      )}
      {isError && <ErrorRetry message="指數趨勢載入失敗" onRetry={() => refetch()} />}

      {data && (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={xTickInterval}
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(v: number) => v.toFixed(1)}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '12px', color: '#a1a1aa', paddingTop: '4px' }}
            />
            {data.indices.map((series) => {
              const cfg = INDEX_CONFIG[series.indexId]
              return (
                <Line
                  key={series.indexId}
                  type="monotone"
                  dataKey={series.indexId}
                  name={series.indexName}
                  stroke={cfg?.color ?? '#71717a'}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
