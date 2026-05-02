import { stockFundamentalMock } from '../mocks/stockFundamental.mock'
import { marketSummaryMock } from '../mocks/marketSummary.mock'
import { marketStructureMock } from '../mocks/marketStructure.mock'
import { fundFlowMock } from '../mocks/fundFlow.mock'
import { sectorsMock } from '../mocks/sectors.mock'
import { sectorStocksMock, defaultStocksMock } from '../mocks/sectorStocks.mock'
import { indexTrendMock } from '../mocks/indexTrend.mock'
import { sectorDetailMock, defaultSectorDetail } from '../mocks/sectorDetail.mock'
import { sectorTrendMock, defaultSectorTrend } from '../mocks/sectorTrend.mock'
import { sectorFundFlowMock, defaultSectorFundFlow } from '../mocks/sectorFundFlow.mock'
import { sectorVolumeMock, defaultSectorVolume } from '../mocks/sectorVolume.mock'
import { stockDetailMock, defaultStockDetail } from '../mocks/stockDetail.mock'
import { stockPriceMock, defaultStockPriceMock } from '../mocks/stockPrice.mock'
import { marketNewsMock } from '../mocks/marketNews.mock'
import type {
  MarketSummaryResponse,
  MarketStructureResponse,
  FundFlowResponse,
  SectorsResponse,
  SectorStocksResponse,
  IndexTrendResponse,
  SectorDetailResponse,
  SectorTrendResponse,
  SectorFundFlowResponse,
  SectorVolumeResponse,
  StockDetailResponse,
  StockPriceResponse,
  MarketNewsResponse,
  StockFundamentalResponse,
} from '../types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function fetchMarketSummary(_date: string): Promise<MarketSummaryResponse> {
  await delay(400)
  return marketSummaryMock
}

export async function fetchMarketStructure(_date: string): Promise<MarketStructureResponse> {
  await delay(350)
  return marketStructureMock
}

export async function fetchFundFlow(_date: string): Promise<FundFlowResponse> {
  await delay(450)
  return fundFlowMock
}

export async function fetchSectors(_date: string): Promise<SectorsResponse> {
  await delay(500)
  return sectorsMock
}

export async function fetchSectorStocks(
  sectorId: string,
  _date: string
): Promise<SectorStocksResponse> {
  await delay(380)
  return sectorStocksMock[sectorId] ?? defaultStocksMock
}

export async function fetchIndexTrend(
  period: 20 | 60,
  _date: string
): Promise<IndexTrendResponse> {
  await delay(300)
  return indexTrendMock[period]
}

export async function fetchSectorDetail(
  sectorId: string,
  _date: string
): Promise<SectorDetailResponse> {
  await delay(320)
  return sectorDetailMock[sectorId] ?? defaultSectorDetail
}

export async function fetchSectorTrend(
  sectorId: string,
  _date: string
): Promise<SectorTrendResponse> {
  await delay(340)
  return sectorTrendMock[sectorId] ?? defaultSectorTrend
}

export async function fetchSectorFundFlow(
  sectorId: string,
  _date: string
): Promise<SectorFundFlowResponse> {
  await delay(360)
  return sectorFundFlowMock[sectorId] ?? defaultSectorFundFlow
}

export async function fetchSectorVolume(
  sectorId: string,
  _date: string
): Promise<SectorVolumeResponse> {
  await delay(330)
  return sectorVolumeMock[sectorId] ?? defaultSectorVolume
}

export async function fetchStockDetail(
  stockId: string,
  _date: string
): Promise<StockDetailResponse> {
  await delay(280)
  return stockDetailMock[stockId] ?? defaultStockDetail
}

export async function fetchStockPrice(
  stockId: string,
  _date: string
): Promise<StockPriceResponse> {
  await delay(120)
  return stockPriceMock[stockId] ?? defaultStockPriceMock
}

export async function fetchMarketNews(_date: string): Promise<MarketNewsResponse> {
  await delay(400)
  return marketNewsMock
}

export async function fetchStockFundamental(
  stockId: string,
  _date: string
): Promise<StockFundamentalResponse | null> {
  await delay(250)
  return stockFundamentalMock[stockId] ?? null
}
