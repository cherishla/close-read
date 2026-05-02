import { useState, useEffect } from 'react'
import { useStockDetail } from '../../../hooks/useStockDetail'
import type { Stock, StockChip } from '../../../types'

type StockModalProps = {
  stock: Stock
  date: string
  onClose: () => void
}

type Tab = 'chip' | 'news'

function FlowBar({ label, value, maxAbs }: { label: string; value: number; maxAbs: number }) {
  const pct = maxAbs > 0 ? Math.abs(value) / maxAbs : 0
  const color = value >= 0 ? '#f87171' : '#60a5fa'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500 w-16">{label}</span>
        <span style={{ color }} className="font-medium tabular-nums">
          {value > 0 ? '+' : ''}{value.toFixed(1)}億
        </span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-1">
        <div className="h-1 rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function ChipTab({ chip }: { chip: StockChip }) {
  const maxInst = Math.max(
    Math.abs(chip.foreignFlow), Math.abs(chip.trustFlow), Math.abs(chip.dealerFlow),
    Math.abs(chip.mainPlayerFlow), Math.abs(chip.largeOrderDiff), 1
  )
  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide">法人買賣超</p>
        <FlowBar label="外資"   value={chip.foreignFlow}    maxAbs={maxInst} />
        <FlowBar label="投信"   value={chip.trustFlow}      maxAbs={maxInst} />
        <FlowBar label="自營商" value={chip.dealerFlow}     maxAbs={maxInst} />
        <FlowBar label="主力"   value={chip.mainPlayerFlow} maxAbs={maxInst} />
      </div>
      <div className="border-t border-zinc-800 pt-3 space-y-2.5">
        <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide">大單 / 信用</p>
        <FlowBar label="大單差" value={chip.largeOrderDiff} maxAbs={maxInst} />
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <div className="text-base font-bold text-zinc-200">
              {chip.marginBalance.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">融資餘額（張）</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <div className="text-base font-bold text-zinc-200">
              {chip.shortBalance.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">融券餘額（張）</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatRelTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h > 0) return `${h} 小時前`
  if (m > 0) return `${m} 分鐘前`
  return '剛剛'
}

export function StockModal({ stock, date, onClose }: StockModalProps) {
  const [tab, setTab] = useState<Tab>('chip')
  const { data, isLoading } = useStockDetail(stock.stockId, date)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const changeColor = stock.change > 0 ? 'text-red-400' : stock.change < 0 ? 'text-blue-400' : 'text-zinc-400'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Panel */}
      <div
        className="relative w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-sm font-bold text-zinc-100">{stock.stockName}</div>
              <div className="text-xs text-zinc-500">{stock.stockId}</div>
            </div>
            <span className={`text-sm font-semibold ${changeColor}`}>
              {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-zinc-800">
          {(['chip', 'news'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-zinc-100 border-b-2 border-zinc-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'chip' ? '籌碼' : '新聞'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoading && (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-6 bg-zinc-800/60 rounded animate-pulse" />
              ))}
            </div>
          )}

          {data && tab === 'chip' && <ChipTab chip={data.chip} />}

          {data && tab === 'news' && (
            <div className="space-y-3">
              {data.news.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-6">暫無相關新聞</p>
              )}
              {data.news.map((item) => (
                <div key={item.id} className="border-b border-zinc-800/60 pb-3 last:border-0">
                  <p className="text-sm text-zinc-200 leading-snug mb-1">{item.title}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span>{item.source}</span>
                    <span>·</span>
                    <span>{formatRelTime(item.publishedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
