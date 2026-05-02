import { useState } from 'react'
import { Treemap, ResponsiveContainer } from 'recharts'
import type { Sector, SectorCategory, HeatmapIndicator } from '../../../types'

type SectorHeatmapProps = {
  sectors: Sector[]
  indicator: HeatmapIndicator
  onSelectSector: (sectorId: string) => void
}

type HoveredSector = {
  name: string
  change: number
  strengthScore: number
  breadth: number
  institutionalFlow: number
  category: SectorCategory
}

export const CATEGORY_DOT_COLOR: Record<SectorCategory, string> = {
  strong:           '#22c55e',
  fundInWeak:       '#f97316',
  techStrongNoFund: '#eab308',
  weak:             '#71717a',
}

export const CATEGORY_ZH: Record<SectorCategory, string> = {
  strong:           '強勢族群',
  fundInWeak:       '資金入但弱',
  techStrongNoFund: '技術強無資金',
  weak:             '弱勢族群',
}

function changeToColor(change: number): string {
  if (change >= 3)   return '#7f1d1d'
  if (change >= 2)   return '#991b1b'
  if (change >= 1)   return '#b91c1c'
  if (change >= 0.3) return '#dc2626'
  if (change > -0.3) return '#3f3f46'
  if (change > -1)   return '#1d4ed8'
  if (change > -2)   return '#1e40af'
  if (change > -3)   return '#1e3a8a'
  return '#172554'
}

function breadthToColor(b: number): string {
  if (b >= 0.75) return '#b91c1c'
  if (b >= 0.6)  return '#dc2626'
  if (b >= 0.4)  return '#3f3f46'
  if (b >= 0.25) return '#1d4ed8'
  return '#1e3a8a'
}

function flowToColor(flow: number, maxAbs: number): string {
  if (maxAbs === 0) return '#3f3f46'
  const ratio = flow / maxAbs
  if (ratio >= 0.6)  return '#b91c1c'
  if (ratio >= 0.2)  return '#dc2626'
  if (ratio > -0.2)  return '#3f3f46'
  if (ratio > -0.6)  return '#1d4ed8'
  return '#1e3a8a'
}

function strengthToColor(score: number): string {
  if (score >= 75) return '#b91c1c'
  if (score >= 60) return '#dc2626'
  if (score >= 40) return '#3f3f46'
  if (score >= 25) return '#1d4ed8'
  return '#1e3a8a'
}

function valueToColor(s: HoveredSector, indicator: HeatmapIndicator, maxFlow: number): string {
  switch (indicator) {
    case 'change':            return changeToColor(s.change)
    case 'breadth':           return breadthToColor(s.breadth)
    case 'institutionalFlow': return flowToColor(s.institutionalFlow, maxFlow)
    case 'strengthScore':     return strengthToColor(s.strengthScore)
  }
}

function formatValue(s: HoveredSector, indicator: HeatmapIndicator): string {
  const sign = (n: number) => n > 0 ? '+' : ''
  switch (indicator) {
    case 'change':            return `${sign(s.change)}${s.change.toFixed(2)}%`
    case 'breadth':           return `${(s.breadth * 100).toFixed(0)}%`
    case 'institutionalFlow': return `${sign(s.institutionalFlow)}${s.institutionalFlow.toFixed(1)}億`
    case 'strengthScore':     return `${s.strengthScore.toFixed(1)}`
  }
}

type CellProps = {
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  sectorId?: string
  bgColor: string
  displayValue: string
  category: SectorCategory
  onSelectSector: (sectorId: string) => void
  onHover: (sector: HoveredSector | null) => void
  hoverData: HoveredSector
}

function TreemapCell({
  x = 0, y = 0, width = 0, height = 0,
  name = '', sectorId = '',
  bgColor, displayValue, category,
  onSelectSector, onHover, hoverData,
}: CellProps) {
  const tooSmall = width < 60 || height < 40
  const textColor = '#f4f4f5'

  return (
    <g>
      <rect
        x={x + 1} y={y + 1}
        width={width - 2} height={height - 2}
        rx={4}
        fill={bgColor}
        stroke="#09090b"
        strokeWidth={2}
        style={{ cursor: 'pointer' }}
        onClick={() => onSelectSector(sectorId)}
        onMouseEnter={() => onHover(hoverData)}
        onMouseLeave={() => onHover(null)}
      />

      {/* 四象限角標 */}
      {!tooSmall && (
        <circle
          cx={x + width - 8}
          cy={y + 8}
          r={4}
          fill={CATEGORY_DOT_COLOR[category]}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* 主要文字 */}
      {!tooSmall && (
        <>
          <text
            x={x + width / 2} y={y + height / 2 - 8}
            textAnchor="middle" dominantBaseline="middle"
            fill={textColor}
            fontSize={Math.min(14, width / 5)}
            fontWeight="600"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {name}
          </text>
          <text
            x={x + width / 2} y={y + height / 2 + 10}
            textAnchor="middle" dominantBaseline="middle"
            fill={textColor}
            fontSize={Math.min(12, width / 6)}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {displayValue}
          </text>
        </>
      )}

      {/* 格子太小時只顯示縮寫 */}
      {tooSmall && width >= 30 && height >= 20 && (
        <text
          x={x + width / 2} y={y + height / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill={textColor}
          fontSize={10}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {name.slice(0, 2)}
        </text>
      )}
    </g>
  )
}

export function SectorHeatmap({ sectors, indicator, onSelectSector }: SectorHeatmapProps) {
  const [hoveredSector, setHoveredSector] = useState<HoveredSector | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const maxFlow = Math.max(...sectors.map((s) => Math.abs(s.institutionalFlow)), 1)

  const data = sectors.map((s) => ({
    name: s.sectorName,
    size: s.volumeShare,
    sectorId: s.sectorId,
    change: s.change,
    strengthScore: s.strengthScore,
    breadth: s.breadth,
    institutionalFlow: s.institutionalFlow,
    category: s.category,
  }))

  return (
    <div
      className="relative w-full h-105"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      }}
      onMouseLeave={() => setHoveredSector(null)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4 / 3}
          content={(props) => {
            const p = props as typeof props & {
              change: number
              strengthScore: number
              breadth: number
              institutionalFlow: number
              category: SectorCategory
              sectorId: string
            }
            const hoverData: HoveredSector = {
              name: p.name ?? '',
              change: p.change ?? 0,
              strengthScore: p.strengthScore ?? 0,
              breadth: p.breadth ?? 0,
              institutionalFlow: p.institutionalFlow ?? 0,
              category: p.category ?? 'weak',
            }
            return (
              <TreemapCell
                x={p.x} y={p.y}
                width={p.width} height={p.height}
                name={p.name} sectorId={p.sectorId}
                bgColor={valueToColor(hoverData, indicator, maxFlow)}
                displayValue={formatValue(hoverData, indicator)}
                category={p.category}
                onSelectSector={onSelectSector}
                onHover={setHoveredSector}
                hoverData={hoverData}
              />
            )
          }}
        />
      </ResponsiveContainer>

      {/* Tooltip */}
      {hoveredSector && (
        <div
          className="absolute z-20 bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-xl pointer-events-none text-xs space-y-1 min-w-35"
          style={{
            left: mousePos.x > 240 ? mousePos.x - 152 : mousePos.x + 12,
            top: Math.max(0, mousePos.y - 10),
          }}
        >
          <div className="font-semibold text-zinc-100 mb-1">{hoveredSector.name}</div>
          <div className="text-zinc-400">
            漲跌：<span className={hoveredSector.change >= 0 ? 'text-red-400' : 'text-blue-400'}>
              {hoveredSector.change > 0 ? '+' : ''}{hoveredSector.change.toFixed(2)}%
            </span>
          </div>
          <div className="text-zinc-400">
            強度分數：<span className="text-zinc-200">{hoveredSector.strengthScore.toFixed(1)}</span>
          </div>
          <div className="text-zinc-400">
            廣度：<span className="text-zinc-200">{(hoveredSector.breadth * 100).toFixed(0)}%</span>
          </div>
          <div className="text-zinc-400">
            法人：<span className={hoveredSector.institutionalFlow >= 0 ? 'text-red-400' : 'text-blue-400'}>
              {hoveredSector.institutionalFlow > 0 ? '+' : ''}{hoveredSector.institutionalFlow.toFixed(1)}億
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-700">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: CATEGORY_DOT_COLOR[hoveredSector.category] }}
            />
            <span className="text-zinc-400">{CATEGORY_ZH[hoveredSector.category]}</span>
          </div>
        </div>
      )}
    </div>
  )
}
