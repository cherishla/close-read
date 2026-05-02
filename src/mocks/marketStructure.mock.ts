import type { MarketStructureResponse } from '../types'

export const marketStructureMock: MarketStructureResponse = {
  breadthScore: 62.4,
  indicators: {
    advanceRatio: {
      value: 41,
      unit: '%',
      deltaVsYesterday: -4,
      percentile1Y: 35,
      percentileLabel: 'low',
    },
    above50MA: {
      value: 63,
      unit: '%',
      deltaVsYesterday: 3,
      percentile1Y: 65,
      percentileLabel: 'high',
    },
    newHighCount: 28,
    newLowCount: 12,
    concentration: {
      value: 38.2,
      unit: '%',
      deltaVsYesterday: 1.8,
      percentile1Y: 72,
      percentileLabel: 'high',
    },
  },
}
