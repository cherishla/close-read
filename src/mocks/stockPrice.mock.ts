import type { StockPriceResponse, StockPricePoint } from '../types'

function mkOHLCV(stockId: string, trendBias = 0): StockPricePoint[] {
  const s = parseInt(stockId)
  const start = new Date('2026-02-08')
  let prev = 100
  return Array.from({ length: 60 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const close  = Math.round((prev + Math.sin(s * 0.01 + i * 0.4) * 1.5 + trendBias * 0.18) * 100) / 100
    const range  = Math.abs(Math.sin(s * 0.03 + i) * 1.2) + 0.3
    const open   = Math.round((prev + (close - prev) * 0.3) * 100) / 100
    const high   = Math.round(Math.max(open, close) * (1 + range / 100) * 100) / 100
    const low    = Math.round(Math.min(open, close) * (1 - range / 100) * 100) / 100
    const volume = Math.round(Math.abs(Math.sin(s * 0.02 + i * 0.5)) * 50000 + 5000)
    prev = close
    return { date: d.toISOString().split('T')[0]!, open, high, low, close, volume }
  })
}

export const stockPriceMock: Record<string, StockPriceResponse> = {
  '2330': { stockId: '2330', data: mkOHLCV('2330',  1.2) },
  '2303': { stockId: '2303', data: mkOHLCV('2303',  0.5) },
  '2454': { stockId: '2454', data: mkOHLCV('2454',  1.0) },
  '2379': { stockId: '2379', data: mkOHLCV('2379', -0.3) },
  '3034': { stockId: '3034', data: mkOHLCV('3034',  0.7) },
  '3711': { stockId: '3711', data: mkOHLCV('3711',  0.4) },
  '2449': { stockId: '2449', data: mkOHLCV('2449',  0.2) },
  '2317': { stockId: '2317', data: mkOHLCV('2317',  1.1) },
  '2382': { stockId: '2382', data: mkOHLCV('2382',  0.6) },
  '3231': { stockId: '3231', data: mkOHLCV('3231', -0.2) },
  '2408': { stockId: '2408', data: mkOHLCV('2408',  0.8) },
  '2344': { stockId: '2344', data: mkOHLCV('2344',  0.3) },
  '3017': { stockId: '3017', data: mkOHLCV('3017',  0.9) },
  '3324': { stockId: '3324', data: mkOHLCV('3324',  0.5) },
  '2882': { stockId: '2882', data: mkOHLCV('2882',  0.1) },
  '2881': { stockId: '2881', data: mkOHLCV('2881',  0.0) },
  '2884': { stockId: '2884', data: mkOHLCV('2884', -0.1) },
  '2823': { stockId: '2823', data: mkOHLCV('2823', -0.2) },
  '2833': { stockId: '2833', data: mkOHLCV('2833', -0.3) },
  '4711': { stockId: '4711', data: mkOHLCV('4711',  0.4) },
  '6547': { stockId: '6547', data: mkOHLCV('6547',  0.2) },
  '1527': { stockId: '1527', data: mkOHLCV('1527',  0.3) },
  '4736': { stockId: '4736', data: mkOHLCV('4736',  0.1) },
  '1301': { stockId: '1301', data: mkOHLCV('1301', -0.4) },
  '1303': { stockId: '1303', data: mkOHLCV('1303', -0.5) },
  '1402': { stockId: '1402', data: mkOHLCV('1402', -0.6) },
  '1313': { stockId: '1313', data: mkOHLCV('1313', -0.3) },
  '2603': { stockId: '2603', data: mkOHLCV('2603', -0.8) },
  '2609': { stockId: '2609', data: mkOHLCV('2609', -0.5) },
  '2002': { stockId: '2002', data: mkOHLCV('2002', -0.7) },
  '2015': { stockId: '2015', data: mkOHLCV('2015', -0.4) },
  '1536': { stockId: '1536', data: mkOHLCV('1536',  0.6) },
  '3665': { stockId: '3665', data: mkOHLCV('3665',  0.4) },
}

export const defaultStockPriceMock: StockPriceResponse = {
  stockId: '0000',
  data: mkOHLCV('0000', 0),
}
