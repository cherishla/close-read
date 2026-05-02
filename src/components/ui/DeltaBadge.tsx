type DeltaBadgeProps = {
  delta: number
  unit?: string
}

export function DeltaBadge({ delta, unit = '%' }: DeltaBadgeProps) {
  if (delta === 0) return <span className="text-gray-400 text-xs">—</span>

  const isPositive = delta > 0
  const arrow = isPositive ? '▲' : '▼'
  const colorClass = isPositive ? 'text-red-500' : 'text-blue-500'
  const sign = isPositive ? '+' : ''

  return (
    <span className={`text-xs font-medium ${colorClass}`}>
      {arrow} {sign}{delta.toFixed(2)}{unit}
    </span>
  )
}
