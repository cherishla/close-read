import { useState } from 'react'
import { useSectors } from '../hooks/useSectors'
import { useSectorStocks } from '../hooks/useSectorStocks'
import { BlockE } from '../components/blocks/BlockE/BlockE'
import { SectorStats } from '../components/blocks/BlockE/SectorStats'
import { SectorPerfChart } from '../components/blocks/BlockE/SectorPerfChart'
import { StockDetailPanel } from '../components/blocks/BlockE/StockDetailPanel'
import { SECTOR_CATEGORY_ZH } from '../utils/copyFormat'
import { useMarketStructure } from '../hooks/useMarketStructure'
import type { Stock } from '../types'

type SectorPageProps = {
  sectorId: string
  date: string
  onBack: () => void
  onOpenStock: (s: Stock) => void
}

export function SectorPage({ sectorId, date, onBack, onOpenStock }: SectorPageProps) {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  const { data: sectorsData } = useSectors(date)
  const { data: structureData } = useMarketStructure(date)
  const { data: sectorStocksData } = useSectorStocks(sectorId, date)

  const sector = sectorsData?.sectors.find((s) => s.sectorId === sectorId)
  const breadthScore = structureData?.breadthScore ?? 0
  const sectorStocks = sectorStocksData?.stocks ?? []

  const changeColor =
    (sector?.change ?? 0) > 0 ? 'text-red-400' :
    (sector?.change ?? 0) < 0 ? 'text-blue-400' : 'text-zinc-400'

  function handleSelectStock(stock: Stock) {
    setSelectedStock((prev) => prev?.stockId === stock.stockId ? null : stock)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Sub-header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 sticky top-14.25 z-9">
        <div className="max-w-7xl mx-auto space-y-1.5">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500">
            <button onClick={onBack} className="hover:text-zinc-300 transition-colors">
              總覽
            </button>
            <span>/</span>
            <span className="text-zinc-300">{sector?.sectorName ?? sectorId}</span>
          </nav>

          {/* Sector stats row */}
          {sector && (
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-base font-bold text-zinc-100">{sector.sectorName}</span>
              <span className={`text-sm font-semibold ${changeColor}`}>
                {sector.change > 0 ? '+' : ''}{sector.change.toFixed(2)}%
              </span>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {SECTOR_CATEGORY_ZH[sector.category]}
              </span>
              <span className="text-xs text-zinc-500">
                成交占比 {sector.volumeShare.toFixed(1)}%
              </span>
              <span className="text-xs text-zinc-500">
                法人 {sector.institutionalFlow > 0 ? '+' : ''}{sector.institutionalFlow.toFixed(1)}億
              </span>
              <span className="text-xs text-zinc-500">
                廣度 {Math.round(sector.breadth * 100)}%
              </span>
            </div>
          )}

        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_minmax(300px,1fr)_320px] gap-4 items-start">

          {/* Left: Sector analysis */}
          <div className="lg:sticky lg:top-32.5">
            {sector && (
              <SectorStats sectorId={sectorId} date={date} sector={sector} />
            )}
          </div>

          {/* Center: Perf chart + stock table */}
          <div className="space-y-4">
            {sector && (
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-4">
                <SectorPerfChart
                  sectorId={sectorId}
                  date={date}
                  sectorCategory={sector.category}
                />
              </div>
            )}
            <BlockE
              date={date}
              sectorId={sectorId}
              breadthScore={breadthScore}
              selectedStock={selectedStock}
              onSelectStock={handleSelectStock}
            />
            {/* < xl: show panel below table when stock selected */}
            {selectedStock && (
              <div className="xl:hidden">
                <StockDetailPanel
                  stock={selectedStock}
                  date={date}
                  sectorStocks={sectorStocks}
                  onOpenStock={onOpenStock}
                />
              </div>
            )}
          </div>

          {/* Right: Stock detail panel (xl+) */}
          <div className="hidden xl:block xl:sticky xl:top-32.5">
            <StockDetailPanel
              stock={selectedStock}
              date={date}
              sectorStocks={sectorStocks}
              onOpenStock={onOpenStock}
            />
          </div>

        </div>
      </main>
    </div>
  )
}
