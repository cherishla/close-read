import type { FundFlowResponse } from '../types'

export const fundFlowMock: FundFlowResponse = {
  inflow: [
    { sectorId: 'semi', sectorName: '半導體', amount: 312.5 },
    { sectorId: 'ai', sectorName: 'AI 伺服器', amount: 198.3 },
    { sectorId: 'fin', sectorName: '金融-銀行', amount: 87.1 },
    { sectorId: 'bio', sectorName: '生技', amount: 45.2 },
    { sectorId: 'chem', sectorName: '化工', amount: 23.8 },
  ],
  outflow: [
    { sectorId: 'trad', sectorName: '傳產-紡織', amount: -89.4 },
    { sectorId: 'steel', sectorName: '鋼鐵', amount: -67.2 },
    { sectorId: 'ship', sectorName: '航運', amount: -54.1 },
    { sectorId: 'food', sectorName: '食品', amount: -32.6 },
    { sectorId: 'paper', sectorName: '造紙', amount: -18.3 },
  ],
  concentration: {
    value: 38.2,
    unit: '%',
    deltaVsYesterday: 1.8,
    percentile1Y: 72,
    percentileLabel: 'high',
  },
}
