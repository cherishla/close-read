import { useState } from 'react'
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom'
import { PageHeader } from './components/layout/PageHeader'
import { OnboardingTour } from './components/layout/OnboardingTour'
import { DailyBriefCard } from './components/blocks/BlockB/DailyBriefCard'
import { ValidationChecklist } from './components/blocks/BlockB/ValidationChecklist'
import { BlockC } from './components/blocks/BlockC/BlockC'
import { BlockD } from './components/blocks/BlockD/BlockD'
import { BlockG } from './components/blocks/BlockG/BlockG'
import { BlockH } from './components/blocks/BlockH/BlockH'
import { SectorPage } from './pages/SectorPage'
import { StockPage } from './pages/StockPage'
import { useSectorStocks } from './hooks/useSectorStocks'
import type { Stock } from './types'

function todayString() {
  return new Date().toISOString().split('T')[0] ?? '2026-04-26'
}

function NewsSection({ date }: { date: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-4" data-tour="market-news">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-zinc-500 tracking-wide">今日市場新聞</h2>
        <span className="text-[10px] text-zinc-700">僅供參考</span>
      </div>
      <BlockH date={date} vertical maxVisible={3} />
    </div>
  )
}

function HomePage({ date }: { date: string }) {
  const navigate = useNavigate()

  function handleSelectSector(id: string) {
    navigate(`/sector/${id}`)
  }

  function handleSelectStock(sectorId: string, stock: Stock) {
    navigate(`/sector/${sectorId}/stock/${stock.stockId}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 items-stretch">
          <div data-tour="daily-brief">
            <DailyBriefCard date={date} onSelectSector={handleSelectSector} />
          </div>
          <div data-tour="comparison-chart">
            <BlockG date={date} />
          </div>
        </div>

        <div data-tour="validation-checklist">
          <ValidationChecklist date={date} onSelectSector={handleSelectSector} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-4 items-start">
            <div data-tour="industry-map">
              <BlockD
                date={date}
                onSelectSector={handleSelectSector}
                onSelectStock={handleSelectStock}
              />
            </div>
            <div data-tour="fund-flow">
              <BlockC date={date} />
            </div>
          </div>
          <div className="lg:sticky lg:top-[4.5rem] lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
            <NewsSection date={date} />
          </div>
        </div>
      </main>
    </div>
  )
}

function SectorPageRoute({ date }: { date: string }) {
  const { sectorId } = useParams<{ sectorId: string }>()
  const navigate = useNavigate()

  if (!sectorId) return <Navigate to="/" replace />

  return (
    <SectorPage
      sectorId={sectorId}
      date={date}
      onOpenStock={(stock) => navigate(`/sector/${sectorId}/stock/${stock.stockId}`)}
    />
  )
}

function StockPageRoute({ date }: { date: string }) {
  const { sectorId, stockId } = useParams<{ sectorId: string; stockId: string }>()
  const { data: sectorStocksData } = useSectorStocks(sectorId ?? '', date)

  if (!sectorId || !stockId) return <Navigate to="/" replace />

  const stock = sectorStocksData?.stocks.find((s) => s.stockId === stockId)

  if (!stock) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 text-sm animate-pulse">載入中...</div>
      </div>
    )
  }

  return (
    <StockPage
      stock={stock}
      sectorId={sectorId}
      date={date}
    />
  )
}

export function App() {
  const [date, setDate] = useState(todayString)
  const [showTour, setShowTour] = useState(false)
  const navigate = useNavigate()

  function handleDateChange(d: string) {
    setDate(d)
    navigate('/')
  }

  return (
    <>
      <PageHeader
        date={date}
        onDateChange={handleDateChange}
        onStartTour={() => {
          setShowTour(false)
          navigate('/')
          window.setTimeout(() => setShowTour(true), 0)
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage date={date} />} />
        <Route path="/sector/:sectorId" element={<SectorPageRoute date={date} />} />
        <Route path="/sector/:sectorId/stock/:stockId" element={<StockPageRoute date={date} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showTour && <OnboardingTour onClose={() => setShowTour(false)} />}
    </>
  )
}
