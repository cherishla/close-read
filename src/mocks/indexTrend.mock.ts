import type { IndexTrendResponse, TrendPoint } from '../types'

function tradingDays(endDate: string, count: number): string[] {
  const dates: string[] = []
  const d = new Date(endDate)
  while (dates.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.unshift(d.toISOString().split('T')[0] as string)
    }
    d.setDate(d.getDate() - 1)
  }
  return dates
}

function generateSeries(
  dates: string[],
  rawBase: number,
  mu: number,
  volatility: number,
  shift: number
): TrendPoint[] {
  const normalized: number[] = [100]
  const raw: number[] = [rawBase]
  for (let i = 1; i < dates.length; i++) {
    const noise =
      Math.sin(i * 0.7 + shift) * volatility +
      Math.cos(i * 1.3 + shift) * volatility * 0.5
    const prevN = normalized[i - 1]!
    const prevR = raw[i - 1]!
    const delta = mu + noise
    normalized.push(Math.round((prevN + delta) * 100) / 100)
    raw.push(Math.round(prevR * (1 + delta / 100)))
  }
  return dates.map((date, i) => ({
    date,
    value: normalized[i]!,
    rawValue: raw[i]!,
  }))
}

const DAYS_60 = tradingDays('2026-04-26', 60)
const DAYS_30 = DAYS_60.slice(-30)
const DAYS_20 = DAYS_60.slice(-20)

function buildResponse(days: string[]): IndexTrendResponse {
  return {
    period: days.length,
    indices: [
      {
        indexId: 'taiex',
        indexName: '加權',
        data: generateSeries(days, 21850, 0.1, 0.9, 0),
      },
      {
        indexId: 'otc',
        indexName: '上櫃',
        data: generateSeries(days, 258, 0.05, 1.1, 2.1),
      },
      {
        indexId: 'futures',
        indexName: '台指期',
        data: generateSeries(days, 21820, 0.13, 0.85, 4.2),
      },
    ],
  }
}

export const indexTrendMock: Record<20 | 30 | 60, IndexTrendResponse> = {
  20: buildResponse(DAYS_20),
  30: buildResponse(DAYS_30),
  60: buildResponse(DAYS_60),
}
