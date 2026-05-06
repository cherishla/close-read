import { describe, expect, it } from 'vitest'
import { sectorStocksMock } from '../mocks/sectorStocks.mock'
import { stockFundamentalMock } from '../mocks/stockFundamental.mock'
import { buildStockChecks, getStockRank } from '../utils/stockResearch'

describe('getStockRank', () => {
  it('ranks stocks by relativeStrength descending', () => {
    expect(getStockRank('2330', sectorStocksMock.foundry.stocks)).toBe(1)
    expect(getStockRank('2303', sectorStocksMock.foundry.stocks)).toBe(2)
  })

  it('returns null when stock is not in the sector list', () => {
    expect(getStockRank('UNKNOWN', sectorStocksMock.foundry.stocks)).toBeNull()
  })
})

describe('buildStockChecks', () => {
  it('returns the four shared research dimensions', () => {
    const checks = buildStockChecks(sectorStocksMock.foundry.stocks[0]!, stockFundamentalMock['2330'])
    expect(checks.map((check) => check.label)).toEqual(['趨勢', '籌碼', '評價', '成長'])
  })

  it('shows loading placeholders for fundamental-dependent checks without fundamental data', () => {
    const checks = buildStockChecks(sectorStocksMock.foundry.stocks[0]!, null)
    expect(checks.find((check) => check.label === '評價')?.value).toBe('—')
    expect(checks.find((check) => check.label === '成長')?.value).toBe('—')
  })
})
