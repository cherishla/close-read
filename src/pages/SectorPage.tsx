import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSectors } from '../hooks/useSectors'
import { useSectorStocks } from '../hooks/useSectorStocks'
import { BlockE } from '../components/blocks/BlockE/BlockE'
import { SectorStats } from '../components/blocks/BlockE/SectorStats'
import { SectorPerfChart } from '../components/blocks/BlockE/SectorPerfChart'
import { SectorResearchSummary } from '../components/blocks/BlockE/SectorResearchSummary'
import { buildSectorSummary } from '../utils/sectorSummary'
import { SECTOR_CATEGORY_ZH } from '../utils/copyFormat'
import type { Stock } from '../types'

type SectorPageProps = {
  sectorId: string
  date: string
  onOpenStock: (s: Stock) => void
}

export function SectorPage({ sectorId, date, onOpenStock }: SectorPageProps) {
  const { data: sectorsData }   = useSectors(date)
  const { data: sectorStocksData } = useSectorStocks(sectorId, date)

  const sector = sectorsData?.sectors.find((s) => s.sectorId === sectorId)

  const sectorSummary = useMemo(() => {
    if (!sector || !sectorStocksData) return null
    return buildSectorSummary(sector, sectorStocksData.stocks)
  }, [sector, sectorStocksData])

  const changeColor =
    (sector?.change ?? 0) > 0 ? 'text-red-400' :
    (sector?.change ?? 0) < 0 ? 'text-green-400' : 'text-zinc-400'

  const streak = sector?.institutionalStreak ?? 0
  const streakStyle = streak > 0 ? 'bg-red-950 text-red-400' : 'bg-green-950 text-green-400'

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sub-header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 sticky top-14.25 z-9">
        <div className="max-w-7xl mx-auto space-y-1.5">

          <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Link to="/" className="hover:text-zinc-300 transition-colors">總覽</Link>
            <span>/</span>
            <span className="text-zinc-300">{sector?.sectorName ?? sectorId}</span>
          </nav>

          {sector && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-base font-bold text-zinc-100">{sector.sectorName}</span>
              <span className={`text-sm font-semibold ${changeColor}`}>
                {sector.change > 0 ? '+' : ''}{sector.change.toFixed(2)}%
              </span>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {SECTOR_CATEGORY_ZH[sector.category]}
              </span>
              <span className="text-xs text-zinc-500">成交占比 {sector.volumeShare.toFixed(1)}%</span>
              <span className={`text-xs text-zinc-500 ${sector.institutionalFlow > 0 ? 'text-red-400' : 'text-green-400'}`}>
                法人 {sector.institutionalFlow > 0 ? '+' : ''}{sector.institutionalFlow.toFixed(1)}億
              </span>
              <span className="text-xs text-zinc-500">廣度 {Math.round(sector.breadth * 100)}%</span>
              {streak !== 0 && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums ${streakStyle}`}>
                  {streak > 0 ? '+' : ''}{streak}日
                </span>
              )}
            </div>
          )}

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 items-start">

          {/* Left: Sector analysis (sticky) */}
          <div className="lg:sticky lg:top-32.5">
            {sector && (
              <SectorStats sectorId={sectorId} date={date} sector={sector} />
            )}
          </div>

          {/* Center: Summary + Perf chart + stock table */}
          <div className="space-y-4">
            <SectorResearchSummary summary={sectorSummary} />

            {sector && (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-4">
                <SectorPerfChart
                  sectorId={sectorId}
                  date={date}
                  sectorCategory={sector.category}
                />
              </div>
            )}

            {sectorSummary && (
              <p className="text-xs text-zinc-500 px-1">{sectorSummary.rolesSummary}</p>
            )}

            <BlockE
              date={date}
              sectorId={sectorId}
              onSelectStock={onOpenStock}
            />
          </div>

        </div>
      </main>
    </div>
  )
}
