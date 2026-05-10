import type { StockSummaryResult } from '../../utils/stockSummary'

type Props = { summary: StockSummaryResult | null }

function Row({ label, value, labelColor = 'text-zinc-600' }: { label: string; value: string; labelColor?: string }) {
  return (
    <div className="flex gap-2.5 items-baseline">
      <span className={`text-[10px] shrink-0 w-12 ${labelColor}`}>{label}</span>
      <span className="text-xs text-zinc-300 leading-relaxed">{value}</span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3 space-y-2.5">
      <div className="h-2 w-16 bg-zinc-800 rounded animate-pulse" />
      {[100, 90, 80, 70].map((w) => (
        <div key={w} className="flex gap-2.5 items-baseline">
          <div className="h-2.5 w-10 bg-zinc-800 rounded animate-pulse shrink-0" />
          <div className="h-2.5 bg-zinc-800/60 rounded animate-pulse" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}

export function StockResearchSummary({ summary }: Props) {
  if (!summary) return <Skeleton />

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3">
      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wide mb-2.5">
        個股研究摘要
      </p>
      <div className="space-y-2">
        <Row label="角色"   value={summary.roleLabel}    />
        <Row label="優勢"   value={summary.strengthLine} />
        <Row label="風險"   value={summary.riskLine}     labelColor="text-orange-700/80" />
        <Row label="待確認" value={summary.watchPoint}   />
      </div>
    </div>
  )
}
