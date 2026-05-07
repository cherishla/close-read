import { useState, useMemo } from 'react'
import { useMarketStructure } from '../../../hooks/useMarketStructure'
import { useMarketSummary } from '../../../hooks/useMarketSummary'
import { useFundFlow } from '../../../hooks/useFundFlow'
import { useSectors } from '../../../hooks/useSectors'
import { buildMarketBrief } from '../../../utils/marketBrief'
import { getPercentileColor, getPercentileLabelZh } from '../../../utils/percentile'
import { ErrorRetry } from '../../ui/ErrorRetry'
import type { Sector, PercentileLabel } from '../../../types'
import type { BriefInsightItem, ContradictionItem } from '../../../utils/marketBrief'

type BlockBProps = { date: string }

// ── helpers ─────────────────────────────────────────────────────

function PctBadge({ label }: { label: PercentileLabel }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getPercentileColor(label)}`}>
      {getPercentileLabelZh(label)}
    </span>
  )
}

function signColor(v: number) {
  return v > 0 ? 'text-red-400' : v < 0 ? 'text-blue-400' : 'text-zinc-400'
}

function SectorRow({ sector }: { sector: Sector }) {
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-zinc-300 w-28 truncate">{sector.sectorName}</span>
      <span className={`w-14 tabular-nums ${signColor(sector.change)}`}>
        {sector.change > 0 ? '+' : ''}{sector.change.toFixed(1)}%
      </span>
      <span className={`w-20 tabular-nums ${signColor(sector.institutionalFlow)}`}>
        法人 {sector.institutionalFlow > 0 ? '+' : ''}{sector.institutionalFlow.toFixed(0)}億
      </span>
      <span className="text-zinc-500">廣度 {Math.round(sector.breadth * 100)}%</span>
    </div>
  )
}

function ContradictionRow({ item }: { item: ContradictionItem }) {
  return (
    <div className="text-xs text-zinc-400">
      <span className="text-zinc-200 font-medium">{item.sector?.sectorName ?? item.title}</span>
      <span className="text-zinc-600 mx-1">·</span>
      {item.description}
    </div>
  )
}

function InsightRow({ item }: { item: BriefInsightItem }) {
  return (
    <div className="text-xs text-zinc-400">
      <span className="text-zinc-200 font-medium">{item.title}</span>
      <span className="text-zinc-600 mx-1">·</span>
      {item.description}
    </div>
  )
}

// ── skeleton ─────────────────────────────────────────────────────

function BriefSkeleton() {
  return (
    <div className="space-y-3 py-4">
      {[80, 64, 48].map((w) => (
        <div key={w} className={`h-3 bg-zinc-800/60 rounded animate-pulse`} style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

// ── main component ───────────────────────────────────────────────

export function BlockB({ date }: BlockBProps) {
  const [open, setOpen] = useState(false)

  const {
    data: structure,
    isLoading: sl,
    isError: se,
    refetch: refetchStructure,
  } = useMarketStructure(date)
  const {
    data: summary,
    isLoading: ml,
    isError: me,
    refetch: refetchSummary,
  } = useMarketSummary(date)
  const {
    data: flow,
    isLoading: fl,
    isError: fe,
    refetch: refetchFlow,
  } = useFundFlow(date)
  const {
    data: sectors,
    isLoading: ql,
    isError: qe,
    refetch: refetchSectors,
  } = useSectors(date)

  const isLoading = sl || ml || fl || ql
  const hasError = se || me || fe || qe

  const brief = useMemo(() => {
    if (!structure || !summary || !flow || !sectors) return null
    return buildMarketBrief(structure, summary, flow, sectors)
  }, [structure, summary, flow, sectors])

  // Collapsed one-liner preview
  const preview = useMemo(() => {
    if (!brief) return null
    const topInflow = brief.fundFlow.inflow[0]?.sectorName ?? '—'
    const strongCount = brief.strongSectors.length
    const contradiction = brief.contradictions.length > 0
      ? ` · 分歧 ${brief.contradictions.length}` : ''
    return `${brief.regime.label} · 廣度 ${brief.marketStatus.breadthScore.toFixed(0)} · 流入：${topInflow} · 強勢 ${strongCount} 族群${contradiction}`
  }, [brief])

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-zinc-800/40 transition-colors"
      >
        <span className="text-sm font-semibold text-zinc-300">B｜盤後研究摘要</span>
        <span className="text-zinc-600 text-base leading-none">{open ? '∧' : '∨'}</span>
      </button>

      {/* Collapsed preview */}
      {!open && !isLoading && preview && (
        <div className="px-5 pb-3 text-xs text-zinc-500">{preview}</div>
      )}
      {!open && !isLoading && hasError && !preview && (
        <div className="px-5 pb-3 text-xs text-zinc-500">部分盤後摘要資料載入失敗，展開後可重試。</div>
      )}
      {!open && isLoading && (
        <div className="px-5 pb-3">
          <div className="h-3 w-64 bg-zinc-800/60 rounded animate-pulse" />
        </div>
      )}

      {/* Expanded body */}
      {open && (
        <div className="border-t border-zinc-800 px-5 pb-5 pt-4">
          {isLoading && <BriefSkeleton />}

          {!isLoading && hasError && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {se && <ErrorRetry message="大盤結構載入失敗" onRetry={() => refetchStructure()} />}
              {me && <ErrorRetry message="市場概況載入失敗" onRetry={() => refetchSummary()} />}
              {fe && <ErrorRetry message="資金流向載入失敗" onRetry={() => refetchFlow()} />}
              {qe && <ErrorRetry message="族群資料載入失敗" onRetry={() => refetchSectors()} />}
            </div>
          )}

          {brief && (
            <div className="space-y-5">
              {/* 盤後懶人摘要 */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-3">
                <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide mb-1.5">盤後懶人摘要</p>
                <p className="text-sm text-zinc-300 leading-relaxed">{brief.lazySummary}</p>
              </div>

              {/* 市場環境 */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide">市場環境</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium">
                    {brief.regime.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{brief.regime.description}</p>
              </div>

              {/* 待驗證清單 */}
              {brief.validationItems.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide mb-2">待驗證清單</p>
                  <div className="space-y-2">
                    {brief.validationItems.map((item) => (
                      <InsightRow key={`validation-${item.title}`} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* 延續性追蹤 */}
              {brief.continuityItems.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide mb-2">延續性追蹤</p>
                  <div className="space-y-2">
                    {brief.continuityItems.map((item) => (
                      <InsightRow key={`continuity-${item.title}`} item={item} />
                    ))}
                  </div>
                </div>
              )}

              {/* 大盤狀態 */}
              <div>
                <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide mb-2">大盤狀態</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-400">廣度</span>
                    <span className="text-sm font-bold text-zinc-200 tabular-nums">{brief.marketStatus.breadthScore.toFixed(0)}</span>
                    <PctBadge label={brief.marketStatus.breadthLabel} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-400">量能</span>
                    <span className="text-sm font-bold text-zinc-200 tabular-nums">{brief.marketStatus.volumeRatio.toFixed(1)}×</span>
                    <PctBadge label={brief.marketStatus.volumeLabel} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-zinc-400">集中度</span>
                    <PctBadge label={brief.marketStatus.concentrationLabel} />
                  </div>
                </div>
              </div>

              {/* 資金方向 */}
              <div>
                <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide mb-2">資金方向</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-zinc-500 shrink-0">流入</span>
                    {brief.fundFlow.inflow.map((f) => (
                      <span key={f.sectorName} className="text-red-400">
                        {f.sectorName} +{f.amount.toFixed(0)}億
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-zinc-500 shrink-0">流出</span>
                    {brief.fundFlow.outflow.map((f) => (
                      <span key={f.sectorName} className="text-blue-400">
                        {f.sectorName} {f.amount.toFixed(0)}億
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-zinc-500">資金集中度</span>
                    <PctBadge label={brief.fundFlow.concentrationLabel} />
                  </div>
                </div>
              </div>

              {/* 強勢族群 */}
              {brief.strongSectors.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide mb-2">強勢族群</p>
                  <div className="space-y-1.5">
                    {brief.strongSectors.map((s) => <SectorRow key={s.sectorId} sector={s} />)}
                  </div>
                </div>
              )}
              {brief.strongSectors.length === 0 && (
                <div>
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide mb-1">強勢族群</p>
                  <p className="text-xs text-zinc-600">今日無明顯強勢族群</p>
                </div>
              )}

              {/* 弱勢族群 */}
              {brief.weakSectors.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide mb-2">弱勢族群</p>
                  <div className="space-y-1.5">
                    {brief.weakSectors.map((s) => <SectorRow key={s.sectorId} sector={s} />)}
                  </div>
                </div>
              )}
              {brief.weakSectors.length === 0 && (
                <div>
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide mb-1">弱勢族群</p>
                  <p className="text-xs text-zinc-600">今日無明顯弱勢族群</p>
                </div>
              )}

              {/* 結構分歧 — 為空時不渲染 */}
              {brief.contradictions.length > 0 && (
                <div>
                  <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide mb-2">結構分歧</p>
                  <div className="space-y-2">
                    {brief.contradictions.map((c) => (
                      <ContradictionRow key={`${c.type}-${c.sector?.sectorId ?? 'market'}`} item={c} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  )
}
