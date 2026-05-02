import { describe, it, expect } from 'vitest'
import { buildMarketBrief } from '../utils/marketBrief'
import { marketStructureMock } from '../mocks/marketStructure.mock'
import { marketSummaryMock } from '../mocks/marketSummary.mock'
import { fundFlowMock } from '../mocks/fundFlow.mock'
import { sectorsMock } from '../mocks/sectors.mock'

const brief = buildMarketBrief(marketStructureMock, marketSummaryMock, fundFlowMock, sectorsMock)

describe('buildMarketBrief — marketStatus', () => {
  it('maps breadthScore from structure', () => {
    expect(typeof brief.marketStatus.breadthScore).toBe('number')
  })
  it('maps volumeRatio from summary volume20MA', () => {
    expect(brief.marketStatus.volumeRatio).toBe(marketSummaryMock.indicators.volume20MA.value)
  })
  it('maps concentrationLabel from structure', () => {
    expect(brief.marketStatus.concentrationLabel).toBe(
      marketStructureMock.indicators.concentration.percentileLabel
    )
  })
})

describe('buildMarketBrief — fundFlow', () => {
  it('inflow trimmed to top 3', () => {
    expect(brief.fundFlow.inflow.length).toBeLessThanOrEqual(3)
  })
  it('outflow trimmed to top 3', () => {
    expect(brief.fundFlow.outflow.length).toBeLessThanOrEqual(3)
  })
  it('each inflow item has sectorName and amount', () => {
    brief.fundFlow.inflow.forEach((item) => {
      expect(typeof item.sectorName).toBe('string')
      expect(typeof item.amount).toBe('number')
    })
  })
})

describe('buildMarketBrief — sectors', () => {
  it('strongSectors contains only strong category, max 3', () => {
    expect(brief.strongSectors.length).toBeLessThanOrEqual(3)
    brief.strongSectors.forEach((s) => expect(s.category).toBe('strong'))
  })
  it('weakSectors contains only weak category, max 3', () => {
    expect(brief.weakSectors.length).toBeLessThanOrEqual(3)
    brief.weakSectors.forEach((s) => expect(s.category).toBe('weak'))
  })
  it('strongSectors sorted by strengthScore descending', () => {
    for (let i = 1; i < brief.strongSectors.length; i++) {
      expect(brief.strongSectors[i - 1]!.strengthScore).toBeGreaterThanOrEqual(
        brief.strongSectors[i]!.strengthScore
      )
    }
  })
  it('weakSectors sorted by change ascending (most negative first)', () => {
    for (let i = 1; i < brief.weakSectors.length; i++) {
      expect(brief.weakSectors[i - 1]!.change).toBeLessThanOrEqual(
        brief.weakSectors[i]!.change
      )
    }
  })
})

describe('buildMarketBrief — contradictions', () => {
  it('contradictions only contain fundInWeak or techStrongNoFund', () => {
    brief.contradictions.forEach((c) => {
      expect(['fundInWeak', 'techStrongNoFund']).toContain(c.type)
    })
  })
  it('contradiction type matches sector category', () => {
    brief.contradictions.forEach((c) => {
      expect(c.sector.category).toBe(c.type)
    })
  })
})
