export type PercentileLabel = 'veryLow' | 'low' | 'mid' | 'high' | 'veryHigh'

export type IndicatorValue = {
  value: number
  unit: string
  deltaVsYesterday: number
  percentile1Y: number // 0-100
  percentileLabel: PercentileLabel
}

export type StateSummary = {
  content: string
  model: string
  generatedAt: string
}

export type MarketSummaryResponse = {
  narrative: string
  stateSummary?: StateSummary
  indicators: {
    indexChange: IndicatorValue
    volume20MA: IndicatorValue
    institutionalFlow: IndicatorValue
  }
}

export type MarketStructureResponse = {
  breadthScore: number
  indicators: {
    advanceRatio: IndicatorValue
    above50MA: IndicatorValue
    newHighCount: number
    newLowCount: number
    concentration: IndicatorValue
  }
}

export type SectorFlow = {
  sectorId: string
  sectorName: string
  amount: number
}

export type FundFlowResponse = {
  inflow: SectorFlow[]
  outflow: SectorFlow[]
  concentration: IndicatorValue
}

export type SectorCategory = 'strong' | 'fundInWeak' | 'techStrongNoFund' | 'weak'

export type ObservationItem = {
  stockId: string
  stockName: string
  sector: string
  stockCategory: StockCategory
  sectorCategory: SectorCategory
  breadthScore: number
  note?: string
}

export type HeatmapIndicator = 'change' | 'breadth' | 'institutionalFlow' | 'strengthScore'

export type Sector = {
  sectorId: string
  sectorName: string
  change: number
  volumeShare: number
  institutionalFlow: number
  breadth: number
  strengthScore: number
  category: SectorCategory
}

export type SectorsResponse = {
  sectors: Sector[]
}

export type StockCategory = 'leader' | 'catchUp' | 'turning' | 'weak'
export type StockSortKey =
  | 'change' | 'relativeStrength' | 'institutionalFlow' | 'concentration'
  | 'weekChange' | 'monthChange' | 'quarterChange'
  | 'marginRatio' | 'shortRatio' | 'daytradingRatio'
export type SortDirection = 'asc' | 'desc'

export type Stock = {
  stockId: string
  stockName: string
  change: number
  relativeStrength: number
  institutionalFlow: number
  volume: number
  category: StockCategory
  concentration: number  // 大單集中度 0–100
  // 區間表現 tab
  weekChange: number       // 近5交易日累計%
  monthChange: number      // 近20交易日累計%
  quarterChange: number    // 近60交易日累計%
  // 籌碼風險 tab
  marginRatio: number      // 融資使用率 0–100
  shortRatio: number       // 券資比 0–100
  daytradingRatio: number  // 當沖比 0–100
}

export type StockChip = {
  foreignFlow: number
  trustFlow: number
  dealerFlow: number
  mainPlayerFlow: number
  largeOrderDiff: number
  marginBalance: number
  shortBalance: number
}

export type StockNewsItem = {
  id: string
  title: string
  source: string
  publishedAt: string
}

export type StockDetailResponse = {
  stockId: string
  chip: StockChip
  news: StockNewsItem[]
}

export type MarketNewsItem = {
  id: string
  title: string
  source: string
  publishedAt: string
  tag?: string
}

export type MarketNewsResponse = {
  news: MarketNewsItem[]
}

export type SectorStocksResponse = {
  stocks: Stock[]
}

export type SectorDetailResponse = {
  sectorId: string
  foreignFlow: number
  trustFlow: number
  dealerFlow: number
}

export type SectorTrendPoint = {
  date: string
  value: number
}

export type SectorTrendResponse = {
  sectorId: string
  data: SectorTrendPoint[]
}

export type FundFlowTrendPoint = {
  date: string
  flow: number
}

export type SectorFundFlowResponse = {
  sectorId: string
  data: FundFlowTrendPoint[]
}

export type SectorVolumePoint = {
  date: string
  volume: number  // 億
}

export type SectorVolumeResponse = {
  sectorId: string
  data: SectorVolumePoint[]
}

export type StockPricePoint = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number  // 張
}

export type StockPriceResponse = {
  stockId: string
  data: StockPricePoint[]
}

export type FundamentalMetric = {
  value: number
  unit: string
  percentileLabel: PercentileLabel
}

export type StockFundamentalResponse = {
  stockId: string
  pe: FundamentalMetric
  pb: FundamentalMetric
  roe: FundamentalMetric
  epsYoY: FundamentalMetric
  revenueYoY: FundamentalMetric
}

export type TrendPoint = {
  date: string
  value: number
  rawValue: number
}

export type IndexSeries = {
  indexId: string
  indexName: string
  data: TrendPoint[]
}

export type IndexTrendResponse = {
  period: number
  indices: IndexSeries[]
}
