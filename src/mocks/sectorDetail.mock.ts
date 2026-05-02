import type { SectorDetailResponse } from '../types'

export const sectorDetailMock: Record<string, SectorDetailResponse> = {
  semi:  { sectorId: 'semi',  foreignFlow: 234.1,  trustFlow: 45.2,   dealerFlow: 33.2  },
  ai:    { sectorId: 'ai',    foreignFlow: 134.2,  trustFlow: 38.6,   dealerFlow: 25.5  },
  fin:   { sectorId: 'fin',   foreignFlow: 52.3,   trustFlow: 21.4,   dealerFlow: 13.4  },
  bio:   { sectorId: 'bio',   foreignFlow: -8.2,   trustFlow: 38.4,   dealerFlow: 15.0  },
  oled:  { sectorId: 'oled',  foreignFlow: -21.3,  trustFlow: 7.8,    dealerFlow: 1.2   },
  trad:  { sectorId: 'trad',  foreignFlow: -56.2,  trustFlow: -18.4,  dealerFlow: -14.8 },
  steel: { sectorId: 'steel', foreignFlow: -41.3,  trustFlow: -14.2,  dealerFlow: -11.7 },
  ship:  { sectorId: 'ship',  foreignFlow: -32.4,  trustFlow: -12.8,  dealerFlow: -8.9  },
  chem:  { sectorId: 'chem',  foreignFlow: 12.4,   trustFlow: 8.2,    dealerFlow: 3.2   },
  elec:  { sectorId: 'elec',  foreignFlow: -5.4,   trustFlow: 2.1,    dealerFlow: -4.9  },
}

export const defaultSectorDetail: SectorDetailResponse = {
  sectorId: '',
  foreignFlow: 0,
  trustFlow: 0,
  dealerFlow: 0,
}
