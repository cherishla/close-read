import type { SectorTrendResponse, SectorTrendPoint } from '../types'

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

// value = cumulative % change from period start (0-based, not 100-based)
function generateTrend(dates: string[], mu: number, volatility: number, shift: number): SectorTrendPoint[] {
  const vals = [0]
  for (let i = 1; i < dates.length; i++) {
    const noise =
      Math.sin(i * 0.7 + shift) * volatility +
      Math.cos(i * 1.3 + shift) * volatility * 0.5
    vals.push(Math.round((vals[i - 1]! + mu + noise) * 100) / 100)
  }
  return dates.map((date, i) => ({ date, value: vals[i]! }))
}

const DAYS = tradingDays('2026-04-26', 20)

const SECTOR_PARAMS: Record<string, [number, number, number]> = {
  semi:  [ 0.35, 1.0,  0.0],
  ai:    [ 0.45, 0.85, 1.1],
  fin:   [ 0.10, 0.7,  2.2],
  bio:   [ 0.25, 1.1,  3.3],
  oled:  [ 0.20, 1.0,  4.4],
  trad:  [-0.20, 0.8,  5.5],
  steel: [-0.15, 0.8,  0.7],
  ship:  [-0.30, 1.0,  1.8],
  chem:  [ 0.06, 0.7,  2.9],
  elec:  [ 0.08, 0.8,  3.6],
}

const DEFAULT_PARAMS: [number, number, number] = [0.05, 0.9, 0.5]

function buildTrend(sectorId: string): SectorTrendResponse {
  const [mu, vol, shift] = SECTOR_PARAMS[sectorId] ?? DEFAULT_PARAMS
  return { sectorId, data: generateTrend(DAYS, mu!, vol!, shift!) }
}

export const sectorTrendMock: Record<string, SectorTrendResponse> = Object.fromEntries(
  Object.keys(SECTOR_PARAMS).map((id) => [id, buildTrend(id)])
)

export const defaultSectorTrend: SectorTrendResponse = {
  sectorId: '',
  data: generateTrend(DAYS, ...DEFAULT_PARAMS),
}
