type FlowBarProps = {
  label: string
  value: number
  maxAbs: number
}

export function FlowBar({ label, value, maxAbs }: FlowBarProps) {
  const pct = maxAbs > 0 ? Math.abs(value) / maxAbs : 0
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
