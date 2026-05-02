import type { SectorFundFlowResponse, FundFlowTrendPoint } from '../types'

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

// Represents total market buy-sell balance (institutional + retail order flow)
function generateFlow(
  dates: string[],
  avgFlow: number,
  amplitude: number,
  shift: number
): FundFlowTrendPoint[] {
  return dates.map((date, i) => {
    const noise =
      Math.sin(i * 0.9 + shift) * amplitude +
      Math.cos(i * 1.7 + shift) * amplitude * 0.4
    return {
      date,
      flow: Math.round((avgFlow + noise) * 10) / 10,
    }
  })
}

const DAYS = tradingDays('2026-04-26', 20)

// Values represent total order flow (億), ~2-3x institutional alone
const SECTOR_PARAMS: Record<string, [number, number, number]> = {
  semi:  [ 48.0, 28.0, 0.0],
  ai:    [ 35.5, 24.0, 1.3],
  fin:   [ 14.2, 18.0, 2.6],
  bio:   [  8.4, 14.0, 3.9],
  oled:  [ -4.8, 16.0, 5.2],
  trad:  [-16.5, 12.0, 0.8],
  steel: [-13.2, 14.0, 2.1],
  ship:  [-10.8, 17.0, 3.4],
  chem:  [  3.6, 12.0, 4.7],
  elec:  [ -2.4, 13.0, 1.9],
}

const DEFAULT_PARAMS: [number, number, number] = [0, 12, 0.5]

export const sectorFundFlowMock: Record<string, SectorFundFlowResponse> = Object.fromEntries(
  Object.keys(SECTOR_PARAMS).map((id) => {
    const [avg, amp, shift] = SECTOR_PARAMS[id]!
    return [id, { sectorId: id, data: generateFlow(DAYS, avg!, amp!, shift!) }]
  })
)

export const defaultSectorFundFlow: SectorFundFlowResponse = {
  sectorId: '',
  data: generateFlow(DAYS, ...DEFAULT_PARAMS),
}
