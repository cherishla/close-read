import type { StateSummary } from '../../../types'

type StateSummarySlotProps = {
  summary?: StateSummary
}

export function StateSummarySlot({ summary }: StateSummarySlotProps) {
  if (!summary) return null

  return (
    <div className="mt-3 pt-3 border-t border-zinc-700">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold bg-purple-950 text-purple-400 px-2 py-0.5 rounded-full">
          狀態摘要
        </span>
        <span className="text-xs text-zinc-500">{summary.generatedAt}</span>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">{summary.content}</p>
    </div>
  )
}
