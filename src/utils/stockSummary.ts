import type { Stock, StockChip } from '../types'

export type StockSummaryResult = {
  roleLabel: string
  strengthLine: string
  riskLine: string
  watchPoint: string
}

export function buildStockSummary(
  stock: Stock,
  sectorName: string,
  chip?: StockChip | null
): StockSummaryResult {
  const roleZh: Record<Stock['category'], string> = {
    leader:  '領漲股',
    catchUp: '補漲觀察股',
    turning: '轉弱觀察股',
    weak:    '弱勢股',
  }
  const roleLabel = `${sectorName}族群${roleZh[stock.category]}`

  // ── Strength line ────────────────────────────────────────────
  const strengthParts: string[] = []

  if (stock.relativeStrength > 0.5) {
    strengthParts.push(`今日表現強於族群（+${stock.relativeStrength.toFixed(2)}%）`)
  }
  if (stock.institutionalFlow > 0) {
    const streakPart = stock.institutionalStreak >= 3 ? `，連買 ${stock.institutionalStreak} 日` : ''
    strengthParts.push(`法人流入 +${stock.institutionalFlow.toFixed(1)} 億${streakPart}`)
  } else if (chip && chip.foreignFlow > 0 && chip.trustFlow > 0) {
    strengthParts.push('外資與投信同步買超')
  }
  if (stock.concentration >= 70) {
    strengthParts.push(`大單集中度偏高（${stock.concentration}）`)
  }
  if (strengthParts.length < 2 && stock.weekChange > 0 && stock.monthChange > 0) {
    strengthParts.push('近週走勢維持延續')
  }
  const strengthLine = strengthParts.slice(0, 3).join(' ｜ ') || '今日表現符合族群整體走勢'

  // ── Risk line ─────────────────────────────────────────────────
  const riskParts: string[] = []

  if (stock.marginRatio >= 70) {
    riskParts.push(`融資使用率 ${stock.marginRatio.toFixed(0)}%，槓桿偏高`)
  }
  if (stock.daytradingRatio >= 45) {
    riskParts.push(`當沖比 ${stock.daytradingRatio.toFixed(0)}%，短線波動風險大`)
  }
  if (riskParts.length < 1 && chip && chip.mainPlayerFlow < 0 && stock.institutionalFlow > 0) {
    riskParts.push('主力大單偏流出，籌碼結構略有分歧')
  }
  if (riskParts.length < 1 && stock.relativeStrength < -0.5) {
    riskParts.push('今日表現落後族群平均')
  }
  const riskLine = riskParts.slice(0, 2).join('；') || '目前無明顯籌碼風險訊號'

  // ── Watch point ───────────────────────────────────────────────
  let watchPoint: string
  if (stock.institutionalStreak >= 3) {
    watchPoint = `法人買盤是否延續（已連買 ${stock.institutionalStreak} 日），且是否維持強於族群`
  } else if (stock.marginRatio >= 70) {
    watchPoint = '融資使用率是否回落，避免高槓桿加劇短線波動風險'
  } else if (chip && chip.mainPlayerFlow < 0 && stock.institutionalFlow > 0) {
    watchPoint = '主力大單是否轉為流入，法人與主力是否形成共識'
  } else if (stock.category === 'catchUp') {
    watchPoint = '補漲動能是否持續，相對強弱是否追近領漲股'
  } else if (stock.category === 'turning') {
    watchPoint = '走勢是否進一步走弱，法人資金是否出現撤出跡象'
  } else if (stock.category === 'weak') {
    watchPoint = '是否出現止跌訊號，或資金流出是否持續擴大'
  } else {
    watchPoint = '觀察資金延續性與是否維持強於族群平均'
  }

  return { roleLabel, strengthLine, riskLine, watchPoint }
}

export function buildChipRiskLevel(stock: Stock): { label: string; color: string } {
  if (stock.marginRatio >= 70 && stock.daytradingRatio >= 45) return { label: '高',  color: 'text-red-400'    }
  if (stock.marginRatio >= 70 || stock.daytradingRatio >= 45) return { label: '偏高', color: 'text-orange-400' }
  if (stock.marginRatio >= 50 || stock.daytradingRatio >= 30) return { label: '中',  color: 'text-yellow-400' }
  return { label: '低', color: 'text-zinc-500' }
}

export function buildChipRiskLine(stock: Stock): string {
  const parts: string[] = []
  if (stock.marginRatio >= 70)       parts.push(`融資 ${stock.marginRatio.toFixed(0)}% 偏高`)
  else if (stock.marginRatio >= 50)  parts.push(`融資 ${stock.marginRatio.toFixed(0)}% 適中`)
  if (stock.daytradingRatio >= 45)   parts.push(`當沖 ${stock.daytradingRatio.toFixed(0)}% 偏高`)
  else if (stock.daytradingRatio >= 30) parts.push(`當沖 ${stock.daytradingRatio.toFixed(0)}% 中等`)
  return parts.length > 0 ? parts.join('，') : '各指標均在正常範圍'
}

export function buildChipInterpretation(chip: StockChip): string {
  const instTotal  = chip.foreignFlow + chip.trustFlow + chip.dealerFlow
  const instBuy    = instTotal > 0
  const mainBuy    = chip.mainPlayerFlow > 0
  if (instBuy && mainBuy)   return '法人與主力同步買超，籌碼結構偏支持'
  if (instBuy && !mainBuy)  return '法人合計買超，但主力大單偏流出，籌碼結構略有分歧'
  if (!instBuy && mainBuy)  return '法人合計賣超，主力大單偏流入，方向尚不一致'
  return '法人與主力均偏賣出，籌碼壓力較明顯'
}
