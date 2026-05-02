import type { StockFundamentalResponse, PercentileLabel } from '../types'

function pctLabel(pct: number): PercentileLabel {
  if (pct < 20) return 'veryLow'
  if (pct < 40) return 'low'
  if (pct < 60) return 'mid'
  if (pct < 80) return 'high'
  return 'veryHigh'
}

const FUNDAMENTALS: Record<string, [number, number, number, number, number, number, number, number, number, number]> = {
  // [pe, pe_pct, pb, pb_pct, roe, roe_pct, epsYoY, eps_pct, revYoY, rev_pct]
  '2330': [22.4, 55, 6.1, 72, 28.3, 68, 18.5, 74, 22.1, 78],
  '2303': [14.2, 38, 1.8, 42, 12.1, 45, -8.2, 22, -5.4, 28],
  '2308': [18.7, 61, 3.2, 58, 17.6, 64, 24.3, 71, 19.8, 69],
  '6770': [11.3, 32, 1.2, 28, 9.8,  36,  5.1, 48,  8.3, 52],
  '2379': [16.5, 49, 2.7, 51, 15.3, 55, 11.2, 58, 14.7, 63],
  '2317': [13.1, 35, 1.5, 33, 11.4, 40,  7.8, 53,  9.2, 55],
  '3008': [28.6, 82, 8.4, 88, 31.2, 85, 32.1, 88, 28.4, 85],
  '2382': [19.2, 64, 3.8, 65, 20.1, 67, 26.4, 76, 23.5, 74],
  '3231': [17.8, 56, 3.1, 55, 18.5, 62, 22.7, 73, 20.3, 71],
  '2882': [12.4, 41, 1.4, 38, 10.2, 44, 12.3, 62,  8.7, 54],
  '2881': [11.8, 39, 1.6, 44, 11.7, 48, 14.5, 65,  9.1, 57],
  '2884': [10.9, 34, 1.2, 31,  9.6, 38, 10.8, 59,  7.4, 51],
  '4711': [68.2, 91, 4.2, 69, 6.1,  28, 45.2, 93, 38.7, 91],
  '6547': [0,    10, 2.8, 54, -3.1, 15, -60.0,5,  -22.1,8 ],
  '1402': [ 9.2, 28, 0.9, 22, 8.7,  33,  4.2, 45,  3.8, 44],
  '1313': [ 8.8, 25, 0.8, 18, 7.3,  29, -2.1, 30, -1.4, 32],
  '2603': [10.5, 30, 1.1, 26, 9.4,  35,  6.3, 50,  5.1, 48],
  '2609': [ 9.7, 27, 1.0, 24, 8.1,  31,  3.7, 42,  2.9, 40],
}

export const stockFundamentalMock: Record<string, StockFundamentalResponse> = Object.fromEntries(
  Object.entries(FUNDAMENTALS).map(([id, d]) => [
    id,
    {
      stockId: id,
      pe:         { value: d[0], unit: 'x',  percentileLabel: pctLabel(d[1]) },
      pb:         { value: d[2], unit: 'x',  percentileLabel: pctLabel(d[3]) },
      roe:        { value: d[4], unit: '%',  percentileLabel: pctLabel(d[5]) },
      epsYoY:     { value: d[6], unit: '%',  percentileLabel: pctLabel(d[7]) },
      revenueYoY: { value: d[8], unit: '%',  percentileLabel: pctLabel(d[9]) },
    } satisfies StockFundamentalResponse,
  ])
)
