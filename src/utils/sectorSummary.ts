import type { Sector, Stock, StockCategory } from '../types'

export type SectorSummaryResult = {
  statusLine: string
  structureLine: string
  watchLine: string
  rolesSummary: string
}

function buildStatusLine(sector: Sector): string {
  const breadthPct = Math.round(sector.breadth * 100)
  const streak = sector.institutionalStreak ?? 0

  if (sector.category === 'strong') {
    if (breadthPct >= 70 && streak >= 3) return '資金與廣度同步偏強'
    if (breadthPct >= 60) return '強度偏高，廣度尚可'
    return '強度偏高但廣度不足，需注意集中風險'
  }
  if (sector.category === 'fundInWeak') {
    return streak > 0 ? '資金轉強，廣度待確認' : '資金流入但技術面未跟上'
  }
  if (sector.category === 'weak') {
    return streak <= -3 ? '弱勢持續，資金持續流出' : '弱勢格局，觀察是否出現止跌訊號'
  }
  return '技術面偏強，但法人資金未同步'
}

function buildStructureLine(sector: Sector): string {
  const breadthPct = Math.round(sector.breadth * 100)
  const streak = sector.institutionalStreak ?? 0
  const flowSign = sector.institutionalFlow > 0 ? '+' : ''
  const flowStr = `法人今日 ${flowSign}${sector.institutionalFlow.toFixed(0)} 億`

  if (streak >= 3) {
    return `上漲家數比例 ${breadthPct}%，連續買超 ${streak} 日，${flowStr}`
  }
  if (streak <= -3) {
    return `上漲家數比例 ${breadthPct}%，連續賣超 ${Math.abs(streak)} 日，${flowStr}`
  }
  return `上漲家數比例 ${breadthPct}%，${flowStr}`
}

function buildWatchLine(sector: Sector, stocks: Stock[]): string {
  const leaders = stocks.filter((s) => s.category === 'leader')
  const breadthPct = Math.round(sector.breadth * 100)

  if (leaders.length === 1 && stocks.length > 2) {
    return `目前由${leaders[0].stockName}領漲，觀察漲勢是否擴散到更多成分股`
  }
  if (breadthPct >= 80) return '廣度已充分擴散，注意籌碼是否降溫'
  if (sector.category === 'fundInWeak') return '觀察廣度是否持續擴散，確認族群方向'
  if (sector.category === 'weak') return '觀察是否持續弱於大盤，或出現資金回流訊號'
  return '觀察資金延續性與族群廣度是否持續擴散'
}

function buildRolesSummary(stocks: Stock[]): string {
  if (stocks.length === 0) return '今日族群結構尚不明確'

  const pick = (cat: StockCategory) => stocks.filter((s) => s.category === cat).map((s) => s.stockName)
  const leaders  = pick('leader')
  const catchUps = pick('catchUp')
  const turnings = pick('turning')

  const parts: string[] = []
  if (leaders.length > 0)  parts.push(`${leaders.join('、')}領漲`)
  if (catchUps.length > 0) parts.push(`${catchUps.join('、')}補漲`)
  if (turnings.length > 0) parts.push(`${turnings.join('、')}轉弱`)

  if (parts.length === 0) return '今日族群結構尚不明確'
  return parts.join('，') + (turnings.length === 0 ? '，尚無明顯轉弱個股' : '')
}

export function buildSectorSummary(sector: Sector, stocks: Stock[]): SectorSummaryResult {
  return {
    statusLine:    buildStatusLine(sector),
    structureLine: buildStructureLine(sector),
    watchLine:     buildWatchLine(sector, stocks),
    rolesSummary:  buildRolesSummary(stocks),
  }
}
