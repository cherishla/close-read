import { useState, useEffect, useMemo } from 'react'
import { useStockDetail } from '../../../hooks/useStockDetail'
import { getStockRank } from '../../../utils/stockResearch'
import { ChipFlowSection } from '../../stock/ChipFlowSection'
import { NewsList } from '../../stock/NewsList'
import type { Stock } from '../../../types'
import { STOCK_CATEGORY_COLORS } from './BlockE'
import { STOCK_CATEGORY_ZH_MAP } from '../../../utils/copyFormat'

type StockDetailPanelProps = {
  stock: Stock | null
  date: string
  sectorStocks: Stock[]
  onOpenStock: (s: Stock) => void
  onAddToList?: () => void
}

type Tab = 'chip' | 'news'

export function StockDetailPanel({ stock, date, sectorStocks, onOpenStock, onAddToList }: StockDetailPanelProps) {
  const [tab, setTab] = useState<Tab>('chip')
  const { data, isLoading } = useStockDetail(stock?.stockId ?? '', date)

  useEffect(() => { setTab('chip') }, [stock?.stockId])

  const rank = useMemo(() => {
    if (!stock || sectorStocks.length === 0) return null
    return getStockRank(stock.stockId, sectorStocks)
  }, [stock, sectorStocks])

  if (!stock) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-2">
          <div className="text-2xl text-zinc-700">←</div>
          <p className="text-sm text-zinc-600">點選個股查看詳情</p>
        </div>
      </div>
    )
  }

  const changeColor = stock.change > 0 ? 'text-red-400' : stock.change < 0 ? 'text-blue-400' : 'text-zinc-400'
  const rsColor = stock.relativeStrength > 0 ? 'text-red-400' : 'text-blue-400'

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-zinc-800">
        <div>
          <div className="text-sm font-bold text-zinc-100">{stock.stockName}</div>
          <div className="text-xs text-zinc-500">{stock.stockId}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-sm font-semibold ${changeColor}`}>
            {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STOCK_CATEGORY_COLORS[stock.category]}`}>
            {STOCK_CATEGORY_ZH_MAP[stock.category]}
          </span>
        </div>
      </div>

      {/* Rank strip */}
      {rank !== null && (
        <div className="flex items-center gap-4 px-5 py-2 border-b border-zinc-800 bg-zinc-800/30">
          <span className="text-xs text-zinc-500">
            族群排名 <span className="text-zinc-200 font-medium">#{rank}/{sectorStocks.length}</span>
          </span>
          <span className="text-xs text-zinc-500">
            相對強弱 <span className={`font-medium ${rsColor}`}>
              {stock.relativeStrength > 0 ? '+' : ''}{stock.relativeStrength.toFixed(2)}
            </span>
          </span>
        </div>
      )}

      {/* CTAs */}
      <div className="px-4 py-2.5 border-b border-zinc-800 space-y-1.5">
        <button
          onClick={() => onOpenStock(stock)}
          className="w-full text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 rounded-md py-1.5 transition-colors"
        >
          詳細研究 →
        </button>
        {onAddToList && (
          <button
            onClick={onAddToList}
            className="w-full text-xs font-medium text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 rounded-md py-1.5 transition-colors"
          >
            + 加入研究清單
          </button>
        )}
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
      <div className="overflow-y-auto p-5">
        {isLoading && (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-zinc-800/60 rounded animate-pulse" />
            ))}
          </div>
        )}

        {data && tab === 'chip' && <ChipFlowSection chip={data.chip} />}

        {data && tab === 'news' && <NewsList news={data.news} />}
      </div>
    </div>
  )
}
