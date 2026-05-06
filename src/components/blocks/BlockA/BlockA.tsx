import { useMarketSummary } from '../../../hooks/useMarketSummary'
import { useMarketStructure } from '../../../hooks/useMarketStructure'
import { Card } from '../../ui/Card'
import { IndicatorRow } from '../../ui/IndicatorRow'
import { SkeletonCard, SkeletonRow } from '../../ui/Skeleton'
import { ErrorRetry } from '../../ui/ErrorRetry'
import { getPercentileBarColor } from '../../../utils/percentile'

type BlockAProps = {
  date: string
}

export function BlockA({ date }: BlockAProps) {
  const summary = useMarketSummary(date)
  const structure = useMarketStructure(date)

  const isLoading = summary.isLoading || structure.isLoading

  return (
    <Card title="A｜市場總覽">
      {isLoading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}

      {!isLoading && (
        <div className="space-y-4">
          {/* Narrative */}
          {summary.isError && (
            <ErrorRetry message="市場概況載入失敗" onRetry={() => summary.refetch()} />
          )}
          {summary.data && (
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-sm text-zinc-300 leading-relaxed">{summary.data.narrative}</p>
            </div>
          )}

          {/* BreadthScore */}
          {structure.isError && (
            <ErrorRetry message="市場結構載入失敗" onRetry={() => structure.refetch()} />
          )}
          {structure.data && (
            <>
              <div className="bg-zinc-800 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">市場廣度分數</span>
                  <span className="text-xl font-bold text-zinc-100">
                    {structure.data.breadthScore.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${getPercentileBarColor(structure.data.indicators.advanceRatio.percentileLabel)}`}
                    style={{ width: `${Math.min(structure.data.breadthScore, 100)}%` }}
                  />
                </div>
              </div>

              {/* Market indicators */}
              <div>
                {summary.data && (
                  <>
                    <IndicatorRow label="指數漲跌" indicator={summary.data.indicators.indexChange} />
                    <IndicatorRow label="成交量 / 20MA" indicator={summary.data.indicators.volume20MA} />
                    <IndicatorRow label="三大法人" indicator={summary.data.indicators.institutionalFlow} />
                  </>
                )}
                <IndicatorRow label="上漲家數比例" indicator={structure.data.indicators.advanceRatio} />
                <IndicatorRow label="資金集中度" indicator={structure.data.indicators.concentration} />
              </div>

              {/* New High / Low */}
              <div className="flex gap-3">
                <div className="flex-1 bg-red-950 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-red-400">
                    {structure.data.indicators.newHighCount}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">創新高</div>
                </div>
                <div className="flex-1 bg-blue-950 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {structure.data.indicators.newLowCount}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">創新低</div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Card>
  )
}
