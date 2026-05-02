import { useFundFlow } from '../../../hooks/useFundFlow'
import { Card } from '../../ui/Card'
import { IndicatorRow } from '../../ui/IndicatorRow'
import { SkeletonTable } from '../../ui/Skeleton'
import { ErrorRetry } from '../../ui/ErrorRetry'
import type { SectorFlow } from '../../../types'

type BlockCProps = {
  date: string
}

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
          <span className={`text-xs font-medium w-16 text-right ${isInflow ? 'text-red-400' : 'text-blue-400'}`}>
            {isInflow ? '+' : ''}{item.amount.toFixed(1)}億
          </span>
        </div>
      ))}
    </div>
  )
}

export function BlockC({ date }: BlockCProps) {
  const { data, isLoading, isError, refetch } = useFundFlow(date)

  return (
    <Card title="C｜資金流向">
      {isLoading && <SkeletonTable rows={5} />}
      {isError && <ErrorRetry message="資金流向載入失敗" onRetry={() => refetch()} />}

      {data && (
        <div className="space-y-5">
          {/* Concentration */}
          <IndicatorRow label="資金集中度" indicator={data.concentration} />

          {/* Inflow */}
          <div>
            <div className="text-xs font-semibold text-red-400 mb-2">流入 Top5</div>
            <FlowBar items={data.inflow} isInflow={true} />
          </div>

          {/* Outflow */}
          <div>
            <div className="text-xs font-semibold text-blue-400 mb-2">流出 Top5</div>
            <FlowBar items={data.outflow} isInflow={false} />
          </div>
        </div>
      )}
    </Card>
  )
}
