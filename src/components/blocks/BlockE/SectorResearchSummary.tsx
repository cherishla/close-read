import type { SectorSummaryResult } from '../../../utils/sectorSummary'

type Props = { summary: SectorSummaryResult | null }

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2.5 items-baseline">
      <span className="text-[10px] text-zinc-600 shrink-0 w-14">{label}</span>
      <span className="text-xs text-zinc-300 leading-relaxed">{value}</span>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3 space-y-2.5">
      <div className="h-2 w-16 bg-zinc-800 rounded animate-pulse" />
      {[100, 90, 80].map((w) => (
        <div key={w} className="flex gap-2.5 items-baseline">
          <div className="h-2.5 w-12 bg-zinc-800 rounded animate-pulse shrink-0" />
          <div className="h-2.5 bg-zinc-800/60 rounded animate-pulse" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}

export function SectorResearchSummary({ summary }: Props) {
  if (!summary) return <Skeleton />

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3">
      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wide mb-2.5">
        族群研究摘要
      </p>
      <div className="space-y-2">
        <SummaryRow label="狀態"   value={summary.statusLine}    />
        <SummaryRow label="結構"   value={summary.structureLine} />
        <SummaryRow label="待確認" value={summary.watchLine}     />
      </div>
    </div>
  )
}
