import { sectorStocksMock } from './sectorStocks.mock'
import { sectorsMock } from './sectors.mock'
import type { StockWithSector } from '../types'

export const allStocksMock: StockWithSector[] = sectorsMock.sectors.flatMap((sector) => {
  const stocks = sectorStocksMock[sector.sectorId]?.stocks ?? []
  return stocks.map((stock) => ({
    ...stock,
    sectorId: sector.sectorId,
    sectorName: sector.sectorName,
    sectorCategory: sector.category,
  }))
})
