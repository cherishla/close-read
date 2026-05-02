import { useState } from 'react'
import { PageHeader } from './components/layout/PageHeader'
import { BlockA } from './components/blocks/BlockA/BlockA'
import { BlockB } from './components/blocks/BlockB/BlockB'
import { BlockC } from './components/blocks/BlockC/BlockC'
import { BlockD } from './components/blocks/BlockD/BlockD'
import { BlockG } from './components/blocks/BlockG/BlockG'
import { BlockH } from './components/blocks/BlockH/BlockH'
import { SectorPage } from './pages/SectorPage'
import { StockPage } from './pages/StockPage'
import type { Stock } from './types'

function todayString() {
  return new Date().toISOString().split('T')[0] ?? '2026-04-26'
}

export function App() {
  const [date, setDate] = useState(todayString)
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)

  function handleDateChange(d: string) {
    setDate(d)
    setSelectedSector(null)
    setSelectedStock(null)
  }

  function handleSelectSector(id: string) {
    setSelectedSector(id)
    setSelectedStock(null)
  }

  function handleBackToMain() {
    setSelectedSector(null)
    setSelectedStock(null)
  }

  if (selectedSector && selectedStock) {
    return (
      <>
        <PageHeader date={date} onDateChange={handleDateChange} />
        <StockPage
          stock={selectedStock}
          sectorId={selectedSector}
          date={date}
          onBack={() => setSelectedStock(null)}
          onBackToMain={handleBackToMain}
        />
      </>
    )
  }

  if (selectedSector) {
    return (
      <>
        <PageHeader date={date} onDateChange={handleDateChange} />
        <SectorPage
          sectorId={selectedSector}
          date={date}
          onBack={handleBackToMain}
          onOpenStock={setSelectedStock}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <PageHeader date={date} onDateChange={handleDateChange} />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* 盤後研究摘要 — 全寬，預設收合 */}
        <BlockB date={date} />

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs overflow-x-auto pb-1">
          {['市場總覽', '資金流向', '產業熱力圖', '→ 點產業進入個股'].map((step, i) => (
            <span key={step} className="flex items-center gap-2 whitespace-nowrap">
              <span className={i === 3 ? 'text-zinc-500' : 'bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full'}>
                {step}
              </span>
              {i < 2 && <span className="text-zinc-600">→</span>}
            </span>
          ))}
        </div>

        {/* 三欄：左（市場總覽）/ 中（指數趨勢 + 熱力圖）/ 右（資金排行 + 新聞）*/}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          <div>
            <BlockA date={date} />
          </div>
          <div className="md:col-span-2 space-y-4">
            <BlockG date={date} />
            <BlockD date={date} onSelectSector={handleSelectSector} />
          </div>
          <div className="space-y-4">
            <BlockC date={date} />
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-4">
              <h2 className="text-xs font-semibold text-zinc-500 tracking-wide mb-1">今日市場新聞</h2>
              <p className="text-[10px] text-zinc-700 mb-3">僅供參考，非投資建議</p>
              <BlockH date={date} vertical />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
