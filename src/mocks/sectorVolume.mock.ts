import type { SectorVolumeResponse, SectorVolumePoint } from '../types'

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

function generateVolume(
  dates: string[],
  avgVolume: number,
  amplitude: number,
  shift: number
): SectorVolumePoint[] {
  return dates.map((date, i) => {
    const noise =
      Math.sin(i * 0.8 + shift) * amplitude +
      Math.cos(i * 1.5 + shift) * amplitude * 0.3
    return {
      date,
      volume: Math.max(1, Math.round((avgVolume + noise) * 10) / 10),
    }
  })
}

const DAYS = tradingDays('2026-04-26', 20)

// Daily sector trading volume (億), representative for each sector
const SECTOR_PARAMS: Record<string, [number, number, number]> = {
  semi:  [920,  180, 0.0],
  ai:    [540,  130, 1.3],
  fin:   [280,   90, 2.6],
  bio:   [120,   50, 3.9],
  oled:  [190,   70, 5.2],
  trad:  [ 85,   30, 0.8],
  steel: [ 65,   25, 2.1],
  ship:  [ 98,   40, 3.4],
  chem:  [ 72,   28, 4.7],
  elec:  [160,   60, 1.9],
}

const DEFAULT_PARAMS: [number, number, number] = [100, 40, 0.5]

export const sectorVolumeMock: Record<string, SectorVolumeResponse> = Object.fromEntries(
  Object.keys(SECTOR_PARAMS).map((id) => {
    const [avg, amp, shift] = SECTOR_PARAMS[id]!
    return [id, { sectorId: id, data: generateVolume(DAYS, avg!, amp!, shift!) }]
  })
)

export const defaultSectorVolume: SectorVolumeResponse = {
  sectorId: '',
  data: generateVolume(DAYS, ...DEFAULT_PARAMS),
}
