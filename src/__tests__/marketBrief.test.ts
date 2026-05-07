import { describe, it, expect } from 'vitest'
import { buildMarketBrief } from '../utils/marketBrief'
import { marketStructureMock } from '../mocks/marketStructure.mock'
import { marketSummaryMock } from '../mocks/marketSummary.mock'
import { fundFlowMock } from '../mocks/fundFlow.mock'
import { sectorsMock } from '../mocks/sectors.mock'
import type { MarketSummaryResponse, MarketStructureResponse, SectorsResponse } from '../types'

const brief = buildMarketBrief(marketStructureMock, marketSummaryMock, fundFlowMock, sectorsMock)

describe('buildMarketBrief — marketStatus', () => {
  it('produces a market regime label and description', () => {
    expect(brief.regime.label).toBeTruthy()
    expect(brief.regime.description).toBeTruthy()
  })
  it('produces a plain-language lazy summary', () => {
    expect(brief.lazySummary).toContain(brief.regime.label)
  })
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

describe('buildMarketBrief — action-oriented research helpers', () => {
  it('produces validation items without recommendation language', () => {
    expect(brief.validationItems.length).toBeGreaterThan(0)
    brief.validationItems.forEach((item) => {
      expect(item.title).toBeTruthy()
      expect(item.description).toBeTruthy()
      expect(item.description).not.toMatch(/買進|賣出|進場|出場|推薦/)
    })
  })

  it('produces continuity tracking items', () => {
    expect(brief.continuityItems.length).toBeGreaterThan(0)
    brief.continuityItems.forEach((item) => {
      expect(item.title).toBeTruthy()
      expect(item.description).toMatch(/追蹤|確認|延續|撤退/)
    })
  })
})

describe('buildMarketBrief — contradictions', () => {
  it('contradictions include renderable title and description', () => {
    brief.contradictions.forEach((c) => {
      expect(c.title).toBeTruthy()
      expect(c.description).toBeTruthy()
    })
  })
  it('sector category contradictions preserve source sector', () => {
    brief.contradictions
      .filter((c) => c.type === 'fundInWeak' || c.type === 'techStrongNoFund')
      .forEach((c) => {
        expect(c.sector).toBeTruthy()
        expect(c.sector?.category).toBe(c.type)
      })
  })
  it('adds index-up breadth-weak contradiction from market structure', () => {
    expect(brief.contradictions.some((c) => c.type === 'indexUpBreadthWeak')).toBe(true)
  })
})

describe('buildMarketBrief — regime rules', () => {
  it('classifies index up with weak breadth as indexStrongBreadthWeak', () => {
    expect(brief.regime.type).toBe('indexStrongBreadthWeak')
  })

  it('classifies broad weakness when index, breadth, and sectors are weak', () => {
    const weakSummary: MarketSummaryResponse = {
      ...marketSummaryMock,
      indicators: {
        ...marketSummaryMock.indicators,
        indexChange: { ...marketSummaryMock.indicators.indexChange, value: -1.2 },
      },
    }
    const weakStructure: MarketStructureResponse = {
      ...marketStructureMock,
      indicators: {
        ...marketStructureMock.indicators,
        advanceRatio: { ...marketStructureMock.indicators.advanceRatio, value: 28 },
      },
    }
    const weakSectors: SectorsResponse = {
      sectors: sectorsMock.sectors.map((sector) => (
        sector.category === 'strong' ? { ...sector, category: 'weak' as const, change: -1.1 } : sector
      )),
    }

    expect(buildMarketBrief(weakStructure, weakSummary, fundFlowMock, weakSectors).regime.type).toBe('broadWeakness')
  })
})
