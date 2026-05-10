import type { FundamentalMetric, Stock, StockFundamentalResponse } from '../types'

export type StockCheckTone = 'positive' | 'neutral' | 'risk'

export type StockCheck = {
  label: string
  value: string
  tone: StockCheckTone
  detail: string
}

function percentileRank(label: FundamentalMetric['percentileLabel']): number {
  const ranks: Record<FundamentalMetric['percentileLabel'], number> = {
    veryLow: 1,
    low: 2,
    mid: 3,
    high: 4,
    veryHigh: 5,
  }
  return ranks[label]
}

export function getStockRank(stockId: string, sectorStocks: Stock[]): number | null {
  if (sectorStocks.length === 0) return null
  const sorted = [...sectorStocks].sort((a, b) => b.relativeStrength - a.relativeStrength)
  const index = sorted.findIndex((stock) => stock.stockId === stockId)
  return index >= 0 ? index + 1 : null
}

export function buildStockChecks(
  stock: Stock,
  fundamental?: StockFundamentalResponse | null
): StockCheck[] {
  const trendScore =
    (stock.relativeStrength >= 1 ? 1 : stock.relativeStrength <= -1 ? -1 : 0) +
    (stock.weekChange > 0 ? 1 : -1) +
    (stock.monthChange > 0 ? 1 : -1) +
    (stock.quarterChange > 0 ? 1 : -1)
  const trend: StockCheck = trendScore >= 3
    ? { label: '趨勢', value: '強', tone: 'positive', detail: '相對強弱與區間表現同步偏強' }
    : trendScore <= -2
      ? { label: '趨勢', value: '弱', tone: 'risk', detail: '相對強弱與區間表現同步偏弱' }
      : { label: '趨勢', value: '中', tone: 'neutral', detail: '走勢仍需確認延續性' }

  const chipScore =
    (stock.institutionalFlow > 0 ? 1 : -1) +
    (stock.institutionalStreak >= 3 ? 1 : stock.institutionalStreak <= -3 ? -1 : 0) +
    (stock.concentration >= 65 ? 1 : stock.concentration <= 35 ? -1 : 0) -
    (stock.marginRatio >= 70 ? 1 : 0) -
    (stock.daytradingRatio >= 30 ? 1 : 0)
  const chip: StockCheck = chipScore >= 2
    ? { label: '籌碼', value: '支持', tone: 'positive', detail: '法人或大單結構偏支持' }
    : chipScore <= -1
      ? { label: '籌碼', value: '偏弱', tone: 'risk', detail: '法人、信用或短線籌碼有壓力' }
      : { label: '籌碼', value: '分歧', tone: 'neutral', detail: '資金結構尚未形成一致方向' }

  let valuation: StockCheck = { label: '評價', value: '—', tone: 'neutral', detail: '基本面資料載入中' }
  let growth: StockCheck = { label: '成長', value: '—', tone: 'neutral', detail: '基本面資料載入中' }

  if (fundamental) {
    const valuationScore =
      (percentileRank(fundamental.pe.percentileLabel) + percentileRank(fundamental.pb.percentileLabel)) / 2
    valuation = valuationScore <= 2
      ? { label: '評價', value: '偏低', tone: 'positive', detail: 'P/E、P/B 位階偏低' }
      : valuationScore >= 4
        ? { label: '評價', value: '偏高', tone: 'risk', detail: 'P/E、P/B 位階偏高' }
        : { label: '評價', value: '合理', tone: 'neutral', detail: '評價位階接近歷史中段' }

    const growthScore =
      (fundamental.roe.value > 12 ? 1 : fundamental.roe.value < 8 ? -1 : 0) +
      (fundamental.epsYoY.value > 0 ? 1 : -1) +
      (fundamental.revenueYoY.value > 0 ? 1 : -1)
    growth = growthScore >= 2
      ? { label: '成長', value: '改善', tone: 'positive', detail: 'ROE 或年增率結構改善' }
      : growthScore <= -2
        ? { label: '成長', value: '衰退', tone: 'risk', detail: '獲利或營收年增率偏弱' }
        : { label: '成長', value: '持平', tone: 'neutral', detail: '成長數據未明顯偏向單側' }
  }

  return [trend, chip, valuation, growth]
}
