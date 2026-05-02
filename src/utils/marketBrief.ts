import type {
  MarketStructureResponse,
  MarketSummaryResponse,
  FundFlowResponse,
  SectorsResponse,
  Sector,
  PercentileLabel,
} from '../types'

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
  type: 'fundInWeak' | 'techStrongNoFund'
  sector: Sector
}

export type MarketBriefData = {
  marketStatus: MarketStatusBrief
  fundFlow: FundFlowBrief
  strongSectors: Sector[]
  weakSectors: Sector[]
  contradictions: ContradictionItem[]
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

  const contradictions: ContradictionItem[] = sectors.sectors
    .filter((s) => s.category === 'fundInWeak' || s.category === 'techStrongNoFund')
    .map((s) => ({ type: s.category as 'fundInWeak' | 'techStrongNoFund', sector: s }))

  return {
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
    contradictions,
  }
}
