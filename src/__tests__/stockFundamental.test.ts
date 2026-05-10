import { describe, it, expect } from 'vitest'
import { fundamentalMetricColor, fundamentalValueColor } from '../utils/fundamental'
import { fetchStockFundamental } from '../services'

describe('fundamentalValueColor', () => {
  it('returns neutral for veryLow', () => {
    expect(fundamentalValueColor('veryLow')).toBe('text-zinc-300')
  })
  it('returns neutral for low', () => {
    expect(fundamentalValueColor('low')).toBe('text-zinc-400')
  })
  it('returns zinc for mid', () => {
    expect(fundamentalValueColor('mid')).toBe('text-zinc-400')
  })
  it('returns orange for high', () => {
    expect(fundamentalValueColor('high')).toBe('text-orange-400')
  })
  it('returns red for veryHigh', () => {
    expect(fundamentalValueColor('veryHigh')).toBe('text-red-400')
  })
})

describe('fundamentalMetricColor', () => {
  it('keeps high valuation as risk-colored', () => {
    expect(fundamentalMetricColor('veryHigh', 'valuation')).toBe('text-red-400')
  })
  it('treats high quality as neutral-colored', () => {
    expect(fundamentalMetricColor('veryHigh', 'quality')).toBe('text-zinc-300')
  })
  it('treats low growth as risk-colored', () => {
    expect(fundamentalMetricColor('low', 'growth')).toBe('text-orange-400')
  })
})

describe('fetchStockFundamental', () => {
  it('resolves with a stockId, pe, pb, roe, epsYoY, revenueYoY', async () => {
    const result = await fetchStockFundamental('2330', '2026-05-02')
    expect(result).not.toBeNull()
    if (!result) return
    expect(result.stockId).toBe('2330')
    expect(typeof result.pe.value).toBe('number')
    expect(typeof result.pb.value).toBe('number')
    expect(typeof result.roe.value).toBe('number')
    expect(typeof result.epsYoY.value).toBe('number')
    expect(typeof result.revenueYoY.value).toBe('number')
  })

  it('returns null for unknown stockId', async () => {
    const result = await fetchStockFundamental('UNKNOWN', '2026-05-02')
    expect(result).toBeNull()
  })
})
