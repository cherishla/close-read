import type { SectorsResponse } from '../types'

export const sectorsMock: SectorsResponse = {
  sectors: [
    { sectorId: 'foundry',   sectorName: '晶圓代工',   change:  2.87, volumeShare: 14.8, institutionalFlow: 298.4,  institutionalStreak:  6, breadth: 0.82, strengthScore: 91.2, category: 'strong' },
    { sectorId: 'ic_design', sectorName: 'IC 設計',    change:  1.94, volumeShare:  9.3, institutionalFlow: 134.7,  institutionalStreak:  4, breadth: 0.71, strengthScore: 78.5, category: 'strong' },
    { sectorId: 'packaging', sectorName: '封裝測試',   change:  1.23, volumeShare:  5.1, institutionalFlow:  42.1,  institutionalStreak:  2, breadth: 0.64, strengthScore: 62.3, category: 'techStrongNoFund' },
    { sectorId: 'ai_server', sectorName: 'AI 伺服器',  change:  3.45, volumeShare: 11.7, institutionalFlow: 212.8,  institutionalStreak:  5, breadth: 0.85, strengthScore: 94.1, category: 'strong' },
    { sectorId: 'ai_memory', sectorName: '記憶體',     change:  2.11, volumeShare:  6.2, institutionalFlow:  89.3,  institutionalStreak:  4, breadth: 0.73, strengthScore: 80.4, category: 'strong' },
    { sectorId: 'ai_cooling',sectorName: '散熱模組',   change:  1.78, volumeShare:  3.4, institutionalFlow:  31.5,  institutionalStreak:  3, breadth: 0.67, strengthScore: 70.8, category: 'techStrongNoFund' },
    { sectorId: 'bank',      sectorName: '銀行',       change:  0.52, volumeShare:  8.1, institutionalFlow:  76.4,  institutionalStreak:  2, breadth: 0.58, strengthScore: 54.2, category: 'fundInWeak' },
    { sectorId: 'insurance', sectorName: '壽險',       change:  0.31, volumeShare:  4.9, institutionalFlow:  44.8,  institutionalStreak:  1, breadth: 0.51, strengthScore: 47.6, category: 'fundInWeak' },
    { sectorId: 'biotech',   sectorName: '生技製藥',   change:  1.65, volumeShare:  4.3, institutionalFlow:  18.2,  institutionalStreak: -2, breadth: 0.61, strengthScore: 63.4, category: 'techStrongNoFund' },
    { sectorId: 'meddevice', sectorName: '醫療器材',   change:  0.89, volumeShare:  2.8, institutionalFlow:   8.7,  institutionalStreak: -1, breadth: 0.53, strengthScore: 48.9, category: 'techStrongNoFund' },
    { sectorId: 'petrochem', sectorName: '石化',       change: -0.74, volumeShare:  5.6, institutionalFlow: -52.3,  institutionalStreak: -4, breadth: 0.31, strengthScore: 21.7, category: 'weak' },
    { sectorId: 'textile',   sectorName: '紡織',       change: -1.45, volumeShare:  1.8, institutionalFlow: -38.9,  institutionalStreak: -5, breadth: 0.24, strengthScore: 15.3, category: 'weak' },
    { sectorId: 'shipping',  sectorName: '航運',       change: -2.23, volumeShare:  4.7, institutionalFlow: -61.4,  institutionalStreak: -6, breadth: 0.19, strengthScore: 11.8, category: 'weak' },
    { sectorId: 'steel',     sectorName: '鋼鐵',       change: -0.98, volumeShare:  3.1, institutionalFlow: -44.7,  institutionalStreak: -4, breadth: 0.29, strengthScore: 18.2, category: 'weak' },
    { sectorId: 'ev',        sectorName: '電動車/車電', change:  0.67, volumeShare:  3.7, institutionalFlow:  12.3,  institutionalStreak:  1, breadth: 0.48, strengthScore: 41.5, category: 'techStrongNoFund' },
  ],
}
