import type { SectorStocksResponse } from '../types'

function mkPeriod(id: string, weekBias = 0) {
  const s = parseInt(id)
  return {
    weekChange:    Math.round((Math.sin(s * 0.003 + 1.1) * 6    + weekBias)       * 100) / 100,
    monthChange:   Math.round((Math.sin(s * 0.003 + 2.2) * 14   + weekBias * 2.5) * 100) / 100,
    quarterChange: Math.round((Math.sin(s * 0.003 + 3.3) * 28   + weekBias * 5)   * 100) / 100,
  }
}

function mkRisk(id: string, marginBias = 0, daytradeBias = 0) {
  const s = parseInt(id)
  const clamp = (v: number) => Math.min(100, Math.max(0, Math.round(v)))
  return {
    marginRatio:     clamp(Math.abs(Math.sin(s * 0.007 + 4.4)) * 80 + marginBias),
    shortRatio:      clamp(Math.abs(Math.sin(s * 0.011 + 5.5)) * 50),
    daytradingRatio: clamp(Math.abs(Math.cos(s * 0.009 + 6.6)) * 45 + daytradeBias),
  }
}

export const sectorStocksMock: Record<string, SectorStocksResponse> = {
  foundry: {
    stocks: [
      { stockId: '2330', stockName: '台積電', change:  3.21, relativeStrength:  0.87, institutionalFlow: 189.4, institutionalStreak:  7, volume: 45823, category: 'leader',  concentration: 82, ...mkPeriod('2330',  2.5), ...mkRisk('2330',  0, -5) },
      { stockId: '2303', stockName: '聯電',   change:  1.45, relativeStrength: -0.89, institutionalFlow:  23.1, institutionalStreak:  2, volume: 12340, category: 'catchUp', concentration: 55, ...mkPeriod('2303',  2.5), ...mkRisk('2303',  0, -5) },
    ],
  },
  ic_design: {
    stocks: [
      { stockId: '2454', stockName: '聯發科', change:  2.67, relativeStrength:  0.92, institutionalFlow:  87.3, institutionalStreak:  5, volume: 23410, category: 'leader',  concentration: 74, ...mkPeriod('2454',  2.5), ...mkRisk('2454',  0, -5) },
      { stockId: '2379', stockName: '瑞昱',   change: -1.23, relativeStrength: -3.57, institutionalFlow: -28.7, institutionalStreak: -4, volume:  3241, category: 'weak',    concentration: 21, ...mkPeriod('2379',  2.5), ...mkRisk('2379',  0, -5) },
      { stockId: '3034', stockName: '聯詠',   change:  1.88, relativeStrength: -0.12, institutionalFlow:  14.5, institutionalStreak:  2, volume:  8923, category: 'catchUp', concentration: 58, ...mkPeriod('3034',  2.5), ...mkRisk('3034',  0, -5) },
    ],
  },
  packaging: {
    stocks: [
      { stockId: '3711', stockName: '日月光投控', change:  1.54, relativeStrength:  0.31, institutionalFlow:  32.1, institutionalStreak:  3, volume: 18920, category: 'leader',  concentration: 62, ...mkPeriod('3711',  2.5), ...mkRisk('3711',  0, -5) },
      { stockId: '2449', stockName: '京元電子',   change:  0.78, relativeStrength: -0.44, institutionalFlow:   8.4, institutionalStreak:  1, volume:  6234, category: 'catchUp', concentration: 41, ...mkPeriod('2449',  2.5), ...mkRisk('2449',  0, -5) },
    ],
  },
  ai_server: {
    stocks: [
      { stockId: '2317', stockName: '鴻海',   change:  3.85, relativeStrength:  0.73, institutionalFlow:  98.3, institutionalStreak:  6, volume: 89234, category: 'leader',  concentration: 78, ...mkPeriod('2317',  2.5), ...mkRisk('2317',  0, -5) },
      { stockId: '2382', stockName: '廣達',   change:  1.67, relativeStrength: -1.45, institutionalFlow:  18.9, institutionalStreak:  2, volume: 23412, category: 'catchUp', concentration: 48, ...mkPeriod('2382',  2.5), ...mkRisk('2382',  0, -5) },
      { stockId: '3231', stockName: '緯創',   change:  0.45, relativeStrength: -2.67, institutionalFlow:  -5.4, institutionalStreak: -2, volume: 12890, category: 'weak',    concentration: 31, ...mkPeriod('3231',  2.5), ...mkRisk('3231',  0, -5) },
    ],
  },
  ai_memory: {
    stocks: [
      { stockId: '2408', stockName: '南亞科', change:  2.34, relativeStrength:  0.58, institutionalFlow:  52.1, institutionalStreak:  4, volume: 14320, category: 'leader',  concentration: 69, ...mkPeriod('2408',  2.5), ...mkRisk('2408',  0, -5) },
      { stockId: '2344', stockName: '華邦電', change:  1.12, relativeStrength: -0.87, institutionalFlow:  11.3, institutionalStreak:  1, volume:  9870, category: 'catchUp', concentration: 44, ...mkPeriod('2344',  2.5), ...mkRisk('2344',  0, -5) },
    ],
  },
  ai_cooling: {
    stocks: [
      { stockId: '3017', stockName: '奇鋐',   change:  2.89, relativeStrength:  0.64, institutionalFlow:  21.4, institutionalStreak:  5, volume:  8930, category: 'leader',  concentration: 71, ...mkPeriod('3017',  2.5), ...mkRisk('3017',  0, -5) },
      { stockId: '3324', stockName: '雙鴻',   change:  1.43, relativeStrength: -0.22, institutionalFlow:   7.8, institutionalStreak:  2, volume:  5120, category: 'catchUp', concentration: 52, ...mkPeriod('3324',  2.5), ...mkRisk('3324',  0, -5) },
    ],
  },
  bank: {
    stocks: [
      { stockId: '2882', stockName: '國泰金', change:  0.67, relativeStrength:  0.22, institutionalFlow:  34.2, institutionalStreak:  3, volume: 34521, category: 'leader',  concentration: 43, ...mkPeriod('2882',  0), ...mkRisk('2882', -10, -10) },
      { stockId: '2881', stockName: '富邦金', change:  0.34, relativeStrength: -0.11, institutionalFlow:  21.3, institutionalStreak:  2, volume: 28910, category: 'catchUp', concentration: 38, ...mkPeriod('2881',  0), ...mkRisk('2881', -10, -10) },
      { stockId: '2884', stockName: '玉山金', change:  0.12, relativeStrength: -0.33, institutionalFlow:  -8.9, institutionalStreak: -3, volume: 19234, category: 'weak',    concentration: 25, ...mkPeriod('2884',  0), ...mkRisk('2884', -10, -10) },
    ],
  },
  insurance: {
    stocks: [
      { stockId: '2823', stockName: '中壽',   change:  0.45, relativeStrength:  0.08, institutionalFlow:  18.7, institutionalStreak:  2, volume: 12340, category: 'catchUp', concentration: 34, ...mkPeriod('2823',  0), ...mkRisk('2823', -10, -10) },
      { stockId: '2833', stockName: '台壽保', change:  0.21, relativeStrength: -0.24, institutionalFlow:   7.2, institutionalStreak: -1, volume:  8760, category: 'weak',    concentration: 28, ...mkPeriod('2833',  0), ...mkRisk('2833', -10, -10) },
    ],
  },
  biotech: {
    stocks: [
      { stockId: '4711', stockName: '中裕', change:  2.34, relativeStrength:  0.47, institutionalFlow:  -3.2, institutionalStreak: -2, volume: 5623, category: 'leader',  concentration: 68, ...mkPeriod('4711',  0), ...mkRisk('4711', -5,  5) },
      { stockId: '6547', stockName: '君泰', change:  1.89, relativeStrength:  0.02, institutionalFlow:   2.1, institutionalStreak:  1, volume: 3412, category: 'catchUp', concentration: 52, ...mkPeriod('6547',  0), ...mkRisk('6547', -5,  5) },
    ],
  },
  meddevice: {
    stocks: [
      { stockId: '1527', stockName: '精華',   change:  1.12, relativeStrength:  0.18, institutionalFlow:   4.3, institutionalStreak:  1, volume: 2890, category: 'catchUp', concentration: 47, ...mkPeriod('1527',  0), ...mkRisk('1527', -5,  5) },
      { stockId: '4736', stockName: '泰博',   change:  0.67, relativeStrength: -0.31, institutionalFlow:   1.8, institutionalStreak: -1, volume: 1980, category: 'weak',    concentration: 33, ...mkPeriod('4736',  0), ...mkRisk('4736', -5,  5) },
    ],
  },
  petrochem: {
    stocks: [
      { stockId: '1301', stockName: '台塑', change: -0.87, relativeStrength: -0.34, institutionalFlow: -28.4, institutionalStreak: -5, volume: 12340, category: 'weak',    concentration: 22, ...mkPeriod('1301', -2.5), ...mkRisk('1301', 15, 10) },
      { stockId: '1303', stockName: '南亞', change: -0.54, relativeStrength:  0.12, institutionalFlow: -15.2, institutionalStreak: -3, volume:  9870, category: 'turning', concentration: 31, ...mkPeriod('1303', -2.5), ...mkRisk('1303', 15, 10) },
    ],
  },
  textile: {
    stocks: [
      { stockId: '1402', stockName: '遠東新', change: -1.45, relativeStrength: -0.22, institutionalFlow: -34.2, institutionalStreak: -6, volume:  8923, category: 'weak',    concentration: 19, ...mkPeriod('1402', -2.5), ...mkRisk('1402', 15, 10) },
      { stockId: '1313', stockName: '聯成',   change: -0.98, relativeStrength:  0.25, institutionalFlow: -12.3, institutionalStreak: -4, volume:  5632, category: 'turning', concentration: 33, ...mkPeriod('1313', -2.5), ...mkRisk('1313', 15, 10) },
    ],
  },
  shipping: {
    stocks: [
      { stockId: '2603', stockName: '長榮', change: -2.45, relativeStrength: -0.31, institutionalFlow: -32.1, institutionalStreak: -7, volume: 45678, category: 'weak',    concentration: 24, ...mkPeriod('2603', -2.5), ...mkRisk('2603', 15, 10) },
      { stockId: '2609', stockName: '陽明', change: -1.87, relativeStrength:  0.27, institutionalFlow: -22.0, institutionalStreak: -5, volume: 34521, category: 'turning', concentration: 30, ...mkPeriod('2609', -2.5), ...mkRisk('2609', 15, 10) },
    ],
  },
  steel: {
    stocks: [
      { stockId: '2002', stockName: '中鋼', change: -0.89, relativeStrength: -0.18, institutionalFlow: -23.7, institutionalStreak: -5, volume: 23450, category: 'weak',    concentration: 21, ...mkPeriod('2002', -2.5), ...mkRisk('2002', 15, 10) },
      { stockId: '2015', stockName: '豐興', change: -0.45, relativeStrength:  0.14, institutionalFlow:  -9.8, institutionalStreak: -2, volume:  7890, category: 'turning', concentration: 28, ...mkPeriod('2015', -2.5), ...mkRisk('2015', 15, 10) },
    ],
  },
  ev: {
    stocks: [
      { stockId: '1536', stockName: '和大',     change:  0.98, relativeStrength:  0.34, institutionalFlow:   8.9, institutionalStreak:  2, volume:  6780, category: 'catchUp', concentration: 49, ...mkPeriod('1536',  0), ...mkRisk('1536',  0,  0) },
      { stockId: '3665', stockName: '貿聯-KY',  change:  0.56, relativeStrength: -0.15, institutionalFlow:   3.4, institutionalStreak:  1, volume:  4320, category: 'catchUp', concentration: 41, ...mkPeriod('3665',  0), ...mkRisk('3665',  0,  0) },
    ],
  },
}

export const defaultStocksMock: SectorStocksResponse = {
  stocks: [
    { stockId: '0000', stockName: '範例股票A', change:  0.45, relativeStrength:  0.10, institutionalFlow:  5.2, institutionalStreak:  1, volume: 3200, category: 'catchUp', concentration: 45, ...mkPeriod('0000'), ...mkRisk('0000') },
    { stockId: '0001', stockName: '範例股票B', change: -0.32, relativeStrength: -0.77, institutionalFlow: -8.1, institutionalStreak: -2, volume: 1800, category: 'weak',    concentration: 22, ...mkPeriod('0001'), ...mkRisk('0001') },
  ],
}
