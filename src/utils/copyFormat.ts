import type { ObservationItem, StockCategory, SectorCategory } from '../types'

const STOCK_CATEGORY_ZH: Record<StockCategory, string> = {
  leader: '領漲股',
  catchUp: '補漲股',
  turning: '轉弱股',
  weak: '弱勢股',
}

export function buildCopyText(items: ObservationItem[], date: string): string {
  const dateFormatted = date.replace(/-/g, '-')
  const header = `[盤後 ${dateFormatted}]`
  const rows = items.map((item) => {
    const label = STOCK_CATEGORY_ZH[item.stockCategory]
    return `${item.stockId} ${item.stockName} | ${item.sector} | ${label} | breadthScore p${Math.round(item.breadthScore)}`
  })
  return [header, ...rows].join('\n')
}

export const SECTOR_CATEGORY_ZH: Record<SectorCategory, string> = {
  strong: '強勢族群',
  fundInWeak: '資金入但弱',
  techStrongNoFund: '技術強無資金',
  weak: '弱勢族群',
}

export const STOCK_CATEGORY_ZH_MAP = STOCK_CATEGORY_ZH
