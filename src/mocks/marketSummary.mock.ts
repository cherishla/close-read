import type { MarketSummaryResponse } from '../types'

export const marketSummaryMock: MarketSummaryResponse = {
  narrative:
    '今日成交量略高於 20MA，法人轉買但上漲家數比例僅 41%，顯示漲勢集中。資金集中度偏高（近一年 p72），觀察明日是否擴散至中小型股。',
  stateSummary: undefined,
  indicators: {
    indexChange: {
      value: 0.87,
      unit: '%',
      deltaVsYesterday: 0.23,
      percentile1Y: 58,
      percentileLabel: 'mid',
    },
    volume20MA: {
      value: 1.08,
      unit: 'x',
      deltaVsYesterday: 0.05,
      percentile1Y: 62,
      percentileLabel: 'high',
    },
    institutionalFlow: {
      value: 152.4,
      unit: '億',
      deltaVsYesterday: 89.2,
      percentile1Y: 71,
      percentileLabel: 'high',
    },
  },
}
