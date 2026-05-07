import type {
  MarketStructureResponse,
  MarketSummaryResponse,
  FundFlowResponse,
  SectorsResponse,
  Sector,
  PercentileLabel,
} from '../types'

export type MarketRegimeType =
  | 'broadAdvance'
  | 'concentratedAdvance'
  | 'indexStrongBreadthWeak'
  | 'rotation'
  | 'weakRebound'
  | 'broadWeakness'
  | 'divergent'

export type MarketRegime = {
  type: MarketRegimeType
  label: string
  description: string
}

export type MarketStatusBrief = {
  breadthScore: number
  breadthLabel: PercentileLabel
  volumeRatio: number
  volumeLabel: PercentileLabel
  concentrationLabel: PercentileLabel
}

export type FundFlowBrief = {
  inflow: { sectorName: string; amount: number }[]
  outflow: { sectorName: string; amount: number }[]
  concentrationLabel: PercentileLabel
}

export type ContradictionItem = {
  type:
    | 'indexUpBreadthWeak'
    | 'sectorUpInstitutionalSell'
    | 'institutionalBuyPriceFlat'
    | 'priceStrongVolumeLight'
    | 'fundInWeak'
    | 'techStrongNoFund'
  title: string
  description: string
  sector?: Sector
}

export type BriefInsightItem = {
  title: string
  description: string
  sector?: Sector
}

export type MarketBriefData = {
  regime: MarketRegime
  lazySummary: string
  marketStatus: MarketStatusBrief
  fundFlow: FundFlowBrief
  strongSectors: Sector[]
  weakSectors: Sector[]
  validationItems: BriefInsightItem[]
  continuityItems: BriefInsightItem[]
  contradictions: ContradictionItem[]
}

function isHigh(label: PercentileLabel): boolean {
  return label === 'high' || label === 'veryHigh'
}

function sectorNames(sectors: Sector[]): string {
  return sectors.slice(0, 2).map((s) => s.sectorName).join('與') || '少數族群'
}

function buildMarketRegime(
  structure: MarketStructureResponse,
  summary: MarketSummaryResponse,
  flow: FundFlowResponse,
  strongSectors: Sector[],
  weakSectors: Sector[]
): MarketRegime {
  const indexChange = summary.indicators.indexChange.value
  const advanceRatio = structure.indicators.advanceRatio.value
  const volumeRatio = summary.indicators.volume20MA.value
  const concentrated = isHigh(structure.indicators.concentration.percentileLabel)
  const hasRotation = flow.inflow.length > 0 && flow.outflow.length > 0 && strongSectors.length > 0 && weakSectors.length > 0

  if (indexChange < -0.3 && advanceRatio < 40 && weakSectors.length >= strongSectors.length) {
    return {
      type: 'broadWeakness',
      label: '全面轉弱',
      description: `指數下跌且上漲家數比例僅 ${advanceRatio.toFixed(0)}%，弱勢族群數量增加，資金流出範圍偏廣。`,
    }
  }

  if (indexChange > 0.2 && advanceRatio >= 60 && strongSectors.length >= 3 && !concentrated) {
    return {
      type: 'broadAdvance',
      label: '擴散型上漲',
      description: `指數上漲且廣度達 ${advanceRatio.toFixed(0)}%，強勢族群不只集中在單一方向。`,
    }
  }

  if (indexChange > 0.2 && advanceRatio < 50) {
    return {
      type: 'indexStrongBreadthWeak',
      label: '指數強廣度弱',
      description: `指數上漲 ${indexChange.toFixed(2)}%，但上漲家數比例僅 ${advanceRatio.toFixed(0)}%，盤面由少數權值或族群支撐。`,
    }
  }

  if (indexChange > 0.2 && concentrated) {
    return {
      type: 'concentratedAdvance',
      label: '集中型上漲',
      description: `指數上漲但資金集中度偏高，主要由 ${sectorNames(strongSectors)} 主導盤面。`,
    }
  }

  if (hasRotation) {
    return {
      type: 'rotation',
      label: '資金輪動',
      description: `流入與流出族群都明確，${sectorNames(strongSectors)} 偏強，${sectorNames(weakSectors)} 偏弱。`,
    }
  }

  if (indexChange > 0 && volumeRatio < 1 && advanceRatio < 55) {
    return {
      type: 'weakRebound',
      label: '弱勢反彈',
      description: `指數短線反彈，但量能僅 ${volumeRatio.toFixed(1)} 倍且廣度未明顯擴散。`,
    }
  }

  return {
    type: 'divergent',
    label: '結構分歧',
    description: '主要指標沒有形成單一清楚方向，需回到族群與個股層檢查資金與價格是否一致。',
  }
}

function buildContradictions(
  structure: MarketStructureResponse,
  summary: MarketSummaryResponse,
  sectors: Sector[]
): ContradictionItem[] {
  const items: ContradictionItem[] = []
  const advanceRatio = structure.indicators.advanceRatio.value
  const indexChange = summary.indicators.indexChange.value

  if (indexChange > 0.2 && advanceRatio < 50) {
    items.push({
      type: 'indexUpBreadthWeak',
      title: '指數漲但廣度弱',
      description: `指數上漲 ${indexChange.toFixed(2)}%，但上漲家數比例僅 ${advanceRatio.toFixed(0)}%，盤面由少數權值或族群支撐。`,
    })
  }

  sectors.forEach((sector) => {
    if (sector.category === 'fundInWeak') {
      items.push({
        type: 'fundInWeak',
        title: '資金入但走勢弱',
        sector,
        description: `資金流入但走勢偏弱，廣度僅 ${Math.round(sector.breadth * 100)}%，需追蹤是否只是低檔承接。`,
      })
      return
    }

    if (sector.category === 'techStrongNoFund') {
      items.push({
        type: 'techStrongNoFund',
        title: '技術強無法人',
        sector,
        description: '技術面偏強，但法人買超偏弱，籌碼支撐存疑。',
      })
      return
    }

    if (sector.change > 0.5 && sector.institutionalFlow < 0) {
      items.push({
        type: 'sectorUpInstitutionalSell',
        title: '族群漲但法人賣',
        sector,
        description: `族群上漲 ${sector.change.toFixed(1)}%，但法人賣超 ${Math.abs(sector.institutionalFlow).toFixed(0)} 億，延續性需回到個股籌碼確認。`,
      })
      return
    }

    if (sector.institutionalFlow > 40 && Math.abs(sector.change) < 0.3) {
      items.push({
        type: 'institutionalBuyPriceFlat',
        title: '法人買但價格不動',
        sector,
        description: `法人買超 ${sector.institutionalFlow.toFixed(0)} 億，但族群漲跌僅 ${sector.change.toFixed(1)}%，可能存在上檔壓力或吸籌狀態。`,
      })
      return
    }

    if (sector.change > 1.2 && sector.volumeShare < 4) {
      items.push({
        type: 'priceStrongVolumeLight',
        title: '價格強但量能輕',
        sector,
        description: `族群上漲 ${sector.change.toFixed(1)}%，但成交占比僅 ${sector.volumeShare.toFixed(1)}%，追價意願仍需確認。`,
      })
    }
  })

  return items.slice(0, 6)
}

function buildLazySummary(
  regime: MarketRegime,
  structure: MarketStructureResponse,
  summary: MarketSummaryResponse,
  flow: FundFlowResponse,
  strongSectors: Sector[],
  weakSectors: Sector[],
  contradictions: ContradictionItem[]
): string {
  const indexChange = summary.indicators.indexChange.value
  const advanceRatio = structure.indicators.advanceRatio.value
  const topInflow = flow.inflow[0]?.sectorName
  const topOutflow = flow.outflow[0]?.sectorName
  const direction = indexChange > 0.2 ? '指數收高' : indexChange < -0.2 ? '指數收低' : '指數變化不大'
  const breadthText = advanceRatio >= 60
    ? '上漲家數擴散'
    : advanceRatio < 50
      ? '但上漲家數沒有跟上'
      : '廣度大致維持中性'
  const flowText = topInflow && topOutflow
    ? `資金主要流向 ${topInflow}，${topOutflow} 資金壓力較明顯`
    : topInflow
      ? `資金主要流向 ${topInflow}`
      : '資金主線不明顯'
  const strongText = strongSectors.length > 0
    ? `強勢族群集中在 ${sectorNames(strongSectors)}`
    : '今天沒有明顯強勢族群'
  const weakText = weakSectors.length > 0 ? `，弱勢端以 ${sectorNames(weakSectors)} 較明顯` : ''
  const splitText = contradictions.length > 0 ? `，另有 ${contradictions.length} 個結構分歧需要追蹤` : ''

  return `${direction}，${breadthText}，整體屬於「${regime.label}」。${flowText}，${strongText}${weakText}${splitText}。`
}

function buildValidationItems(
  strongSectors: Sector[],
  contradictions: ContradictionItem[],
  flow: FundFlowResponse
): BriefInsightItem[] {
  const items: BriefInsightItem[] = []

  contradictions.slice(0, 3).forEach((item) => {
    items.push({
      title: item.sector?.sectorName ?? item.title,
      description: item.description,
      sector: item.sector,
    })
  })

  strongSectors.slice(0, 2).forEach((sector) => {
    items.push({
      title: sector.sectorName,
      description: `強度與廣度同步偏強，法人 ${sector.institutionalFlow > 0 ? '仍為流入' : '未同步支持'}，適合追蹤隔日是否延續到更多族群內個股。`,
      sector,
    })
  })

  const topInflowName = flow.inflow[0]?.sectorName
  if (topInflowName && !items.some((item) => item.title === topInflowName)) {
    items.push({
      title: topInflowName,
      description: '今日資金流入最明顯，需驗證後續是否只是單日集中，或能擴散成族群動能。',
    })
  }

  return items.slice(0, 5)
}

function streakText(streak?: number): string {
  if (!streak) return '法人方向尚未形成明顯連續性'
  if (streak > 0) return `法人連續流入 ${streak} 日`
  return `法人連續流出 ${Math.abs(streak)} 日`
}

function buildContinuityItems(strongSectors: Sector[], weakSectors: Sector[], sectors: Sector[]): BriefInsightItem[] {
  const items: BriefInsightItem[] = []

  strongSectors.slice(0, 3).forEach((sector) => {
    items.push({
      title: sector.sectorName,
      description: `${streakText(sector.institutionalStreak)}，今日廣度 ${Math.round(sector.breadth * 100)}%，用來追蹤昨日強勢是否仍在擴散。`,
      sector,
    })
  })

  sectors
    .filter((sector) => sector.category === 'fundInWeak' || sector.category === 'techStrongNoFund')
    .slice(0, 2)
    .forEach((sector) => {
      items.push({
        title: sector.sectorName,
        description: `${streakText(sector.institutionalStreak)}，但價格、資金或廣度未完全同步，需追蹤延續性是否改善。`,
        sector,
      })
    })

  weakSectors.slice(0, 2).forEach((sector) => {
    items.push({
      title: sector.sectorName,
      description: `${streakText(sector.institutionalStreak)}，廣度僅 ${Math.round(sector.breadth * 100)}%，需確認資金是否持續撤退。`,
      sector,
    })
  })

  return items.slice(0, 5)
}

export function buildMarketBrief(
  structure: MarketStructureResponse,
  summary: MarketSummaryResponse,
  flow: FundFlowResponse,
  sectors: SectorsResponse
): MarketBriefData {
  const strongSectors = sectors.sectors
    .filter((s) => s.category === 'strong')
    .sort((a, b) => b.strengthScore - a.strengthScore)
    .slice(0, 3)

  const weakSectors = sectors.sectors
    .filter((s) => s.category === 'weak')
    .sort((a, b) => a.change - b.change)
    .slice(0, 3)

  const regime = buildMarketRegime(structure, summary, flow, strongSectors, weakSectors)
  const contradictions = buildContradictions(structure, summary, sectors.sectors)
  const lazySummary = buildLazySummary(regime, structure, summary, flow, strongSectors, weakSectors, contradictions)
  const validationItems = buildValidationItems(strongSectors, contradictions, flow)
  const continuityItems = buildContinuityItems(strongSectors, weakSectors, sectors.sectors)

  return {
    regime,
    lazySummary,
    marketStatus: {
      breadthScore: structure.breadthScore,
      breadthLabel: structure.indicators.advanceRatio.percentileLabel,
      volumeRatio: summary.indicators.volume20MA.value,
      volumeLabel: summary.indicators.volume20MA.percentileLabel,
      concentrationLabel: structure.indicators.concentration.percentileLabel,
    },
    fundFlow: {
      inflow: flow.inflow.slice(0, 3).map((f) => ({ sectorName: f.sectorName, amount: f.amount })),
      outflow: flow.outflow.slice(0, 3).map((f) => ({ sectorName: f.sectorName, amount: f.amount })),
      concentrationLabel: flow.concentration.percentileLabel,
    },
    strongSectors,
    weakSectors,
    validationItems,
    continuityItems,
    contradictions,
  }
}
