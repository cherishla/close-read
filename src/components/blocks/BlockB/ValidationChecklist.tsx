import { useMemo } from 'react'
import { useMarketStructure } from '../../../hooks/useMarketStructure'
import { useMarketSummary } from '../../../hooks/useMarketSummary'
import { useFundFlow } from '../../../hooks/useFundFlow'
import { useSectors } from '../../../hooks/useSectors'
import { buildMarketBrief } from '../../../utils/marketBrief'
import type { ResearchItem, ResearchItemType } from '../../../utils/marketBrief'

type CfgEntry = {
  defaultLabel: string
  color: string
  border: string
  bg: string
  btnColor: string
}

const RESEARCH_CONFIG: Record<ResearchItemType, CfgEntry> = {
  priority:      { defaultLabel: '重點觀察', color: 'text-red-400',    border: 'border-red-900/40',    bg: 'bg-red-950/30',    btnColor: 'text-red-400 hover:text-red-300'      },
  turningStrong: { defaultLabel: '資金轉強', color: 'text-amber-400',  border: 'border-amber-900/40',  bg: 'bg-amber-950/30',  btnColor: 'text-amber-400 hover:text-amber-300'  },
  overheated:    { defaultLabel: '風險升高', color: 'text-violet-400', border: 'border-violet-900/40', bg: 'bg-violet-950/30', btnColor: 'text-violet-400 hover:text-violet-300' },
  weakening:     { defaultLabel: '弱勢觀察', color: 'text-green-400',  border: 'border-green-900/40',  bg: 'bg-green-950/30',  btnColor: 'text-green-400 hover:text-green-300'  },
}

function resolveLabel(item: ResearchItem): string {
  if (item.type === 'priority') return item.rank === 1 ? '今日焦點' : '重點觀察'
  return RESEARCH_CONFIG[item.type].defaultLabel
}

function buildReasonTags(item: ResearchItem): string[] {
  const tags = item.reasons.flatMap((reason) =>
    reason
      .split('，')
      .map((part) => part.replace(/^法人今日 /, '今日 ').trim())
      .filter(Boolean)
  )

  const visibleTags = tags.length > 3 && tags[0]?.startsWith('強度 ')
    ? tags.slice(1)
    : tags

  return visibleTags.slice(0, 3)
}

function ResearchCard({
  item,
  onSelectSector,
}: {
  item: ResearchItem
  onSelectSector?: (id: string) => void
}) {
  const cfg = RESEARCH_CONFIG[item.type]
  const isMain = item.type === 'priority' && item.rank === 1
  const label = resolveLabel(item)
  const canNavigate = item.type !== 'overheated' && onSelectSector
  const reasonTags = buildReasonTags(item)

  return (
    <div
      role={canNavigate ? 'button' : undefined}
      tabIndex={canNavigate ? 0 : undefined}
      onClick={canNavigate ? () => onSelectSector(item.sectorId) : undefined}
      onKeyDown={canNavigate ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelectSector(item.sectorId)
      } : undefined}
      className={`rounded-lg border flex flex-col gap-3 px-3 py-3 transition-colors ${cfg.border} ${cfg.bg} ${canNavigate ? 'cursor-pointer hover:border-zinc-600' : ''} ${isMain ? 'col-span-2 lg:col-span-2' : ''}`}
    >
      {/* Layer 1: conclusion */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className={`font-bold text-zinc-100 leading-snug ${isMain ? 'text-lg' : 'text-sm'}`}>
            {item.sectorName}
          </div>
          <span className={`shrink-0 text-[10px] font-bold tracking-wide ${cfg.color}`}>{label}</span>
        </div>
        <div className="text-xs text-zinc-300 mt-0.5 leading-snug">{item.headline}</div>
      </div>

      {/* Layer 2: evidence */}
      <div className="flex flex-wrap gap-1.5">
        {reasonTags.map((tag) => (
          <span key={tag} className="rounded bg-zinc-950/45 border border-zinc-700/50 px-1.5 py-0.5 text-[10px] text-zinc-300 leading-tight">
            {tag}
          </span>
        ))}
      </div>

      {/* Layer 3: confirmation */}
      {item.watchPoint && (
        <div className="text-[10px] text-zinc-500 leading-relaxed">
          待確認：{item.watchPoint}
        </div>
      )}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-800/20 px-3 py-3 space-y-2 h-32">
          <div className="h-2.5 w-16 bg-zinc-800 rounded animate-pulse" />
          <div className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
          <div className="h-2.5 w-32 bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-2 w-full bg-zinc-800/60 rounded animate-pulse" />
          <div className="h-2 w-3/4 bg-zinc-800/60 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

type ValidationChecklistProps = {
  date: string
  onSelectSector?: (sectorId: string) => void
}

export function ValidationChecklist({ date, onSelectSector }: ValidationChecklistProps) {
  const { data: structure } = useMarketStructure(date)
  const { data: summary } = useMarketSummary(date)
  const { data: flow } = useFundFlow(date)
  const { data: sectors } = useSectors(date)

  const brief = useMemo(() => {
    if (!structure || !summary || !flow || !sectors) return null
    return buildMarketBrief(structure, summary, flow, sectors)
  }, [structure, summary, flow, sectors])

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-4">
      <h2 className="text-xs font-semibold text-zinc-500 tracking-wide mb-3">今日研究清單</h2>
      {!brief ? (
        <Skeleton />
      ) : brief.researchItems.length === 0 ? (
        <p className="text-xs text-zinc-600">今日訊號不足，無法產生研究清單</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {brief.researchItems.map((item, i) => (
            <ResearchCard
              key={`${item.type}-${item.sectorId}-${i}`}
              item={item}
              onSelectSector={onSelectSector}
            />
          ))}
        </div>
      )}
    </div>
  )
}
