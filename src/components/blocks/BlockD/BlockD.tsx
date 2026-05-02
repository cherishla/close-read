import { useState } from 'react'
import { useSectors } from '../../../hooks/useSectors'
import { Card } from '../../ui/Card'
import { SkeletonTable } from '../../ui/Skeleton'
import { ErrorRetry } from '../../ui/ErrorRetry'
import { SectorHeatmap, CATEGORY_DOT_COLOR, CATEGORY_ZH } from './SectorHeatmap'
import type { HeatmapIndicator, SectorCategory } from '../../../types'

type BlockDProps = {
  date: string
  onSelectSector: (sectorId: string) => void
}

const INDICATOR_OPTIONS: { key: HeatmapIndicator; label: string }[] = [
  { key: 'change',            label: '漲跌' },
  { key: 'breadth',           label: '廣度' },
  { key: 'institutionalFlow', label: '法人' },
  { key: 'strengthScore',     label: '強度' },
]

type LegendStep = { label: string; color: string }

const LEGEND_STEPS: Record<HeatmapIndicator, LegendStep[]> = {
  change: [
    { label: '≥+3%', color: '#7f1d1d' },
    { label: '+1%',  color: '#b91c1c' },
    { label: '平盤', color: '#3f3f46' },
    { label: '-1%',  color: '#1e40af' },
    { label: '≤-3%', color: '#172554' },
  ],
  breadth: [
    { label: '>75%', color: '#b91c1c' },
    { label: '>60%', color: '#dc2626' },
    { label: '~50%', color: '#3f3f46' },
    { label: '<40%', color: '#1d4ed8' },
    { label: '<25%', color: '#1e3a8a' },
  ],
  institutionalFlow: [
    { label: '大買', color: '#b91c1c' },
    { label: '買',   color: '#dc2626' },
    { label: '中性', color: '#3f3f46' },
    { label: '賣',   color: '#1d4ed8' },
    { label: '大賣', color: '#1e3a8a' },
  ],
  strengthScore: [
    { label: '>75', color: '#b91c1c' },
    { label: '>60', color: '#dc2626' },
    { label: '~50', color: '#3f3f46' },
    { label: '<40', color: '#1d4ed8' },
    { label: '<25', color: '#1e3a8a' },
  ],
}

const CATEGORY_ITEMS: { key: SectorCategory; label: string }[] = [
  { key: 'strong',           label: '強勢族群' },
  { key: 'fundInWeak',       label: '資金入但弱' },
  { key: 'techStrongNoFund', label: '技術強無資金' },
  { key: 'weak',             label: '弱勢族群' },
]

function ColorLegend({ indicator }: { indicator: HeatmapIndicator }) {
  const steps = LEGEND_STEPS[indicator]
  return (
    <div className="flex items-center gap-3">
      {steps.map((s) => (
        <div key={s.label} className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
          <span className="text-xs text-zinc-500">{s.label}</span>
        </div>
      ))}
    </div>
  )
}

function CategoryLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {CATEGORY_ITEMS.map((item) => (
        <div key={item.key} className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: CATEGORY_DOT_COLOR[item.key] }}
          />
          <span className="text-xs text-zinc-500">{CATEGORY_ZH[item.key]}</span>
        </div>
      ))}
      <span className="text-xs text-zinc-700">右上角圓點</span>
    </div>
  )
}

export function BlockD({ date, onSelectSector }: BlockDProps) {
  const { data, isLoading, isError, refetch } = useSectors(date)
  const [indicator, setIndicator] = useState<HeatmapIndicator>('change')

  const indicatorSelector = (
    <div className="flex items-center gap-1">
      {INDICATOR_OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => setIndicator(opt.key)}
          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
            indicator === opt.key
              ? 'bg-zinc-600 text-zinc-100'
              : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )

  return (
    <Card title="D｜產業熱力圖" action={indicatorSelector}>
      {isLoading && <SkeletonTable rows={6} />}
      {isError && <ErrorRetry message="族群資料載入失敗" onRetry={() => refetch()} />}

      {data && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-zinc-600">格子大小 = 成交占比。點格子進入產業頁。</p>
            <ColorLegend indicator={indicator} />
          </div>
          <SectorHeatmap
            sectors={data.sectors}
            indicator={indicator}
            onSelectSector={onSelectSector}
          />
          <CategoryLegend />
        </div>
      )}
    </Card>
  )
}
