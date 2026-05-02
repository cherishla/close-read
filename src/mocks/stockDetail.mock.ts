import type { StockDetailResponse } from '../types'

const NEWS_POOL: Record<string, { title: string; source: string; tag?: string }[]> = {
  '2330': [
    { title: '台積電 CoWoS 需求爆發，Q2 法說會釋出樂觀展望', source: '工商時報', tag: '半導體' },
    { title: '外資連三日買超台積電，累計逾 18 萬張', source: 'MoneyDJ', tag: '外資動向' },
    { title: '台積電 2nm 良率突破 60%，提前量產規劃', source: '電子時報', tag: '半導體' },
  ],
  '2303': [
    { title: '聯電接獲歐洲車用晶片大單，Q3 稼動率回升', source: '工商時報', tag: '半導體' },
    { title: '聯電與格芯策略合作擴大，布局 12nm 以下', source: 'DigiTimes', tag: '半導體' },
  ],
  '2308': [
    { title: '台達電伺服器電源供應器出貨強勁，AI 需求帶動', source: 'MoneyDJ', tag: 'AI 題材' },
    { title: '台達電綠能業務 Q2 毛利率創高', source: '經濟日報', tag: '電力' },
  ],
  '6770': [
    { title: '力積電宜蘭廠量產時程確認，28nm 產能釋出', source: '電子時報', tag: '半導體' },
  ],
  '2379': [
    { title: '瑞昱以太網路晶片拿下歐洲車廠訂單', source: '工商時報', tag: '汽車電子' },
  ],
  '2317': [
    { title: '鴻海 AI 伺服器出貨量 Q2 季增 45%，微軟、Meta 訂單到位', source: 'MoneyDJ', tag: 'AI 題材' },
    { title: '鴻海電動車 Model B 量產進入倒計時', source: '電子時報', tag: '電動車' },
    { title: '外資今日買超鴻海 2.3 萬張，列買超第一', source: '財訊', tag: '外資動向' },
  ],
  '3008': [
    { title: '大立光 6 月營收月增 12%，鏡頭拉貨確認', source: '經濟日報', tag: '光學' },
    { title: '大立光潛望鏡模組出貨蘋果，市佔率提升', source: 'MoneyDJ', tag: '蘋果供應鏈' },
  ],
  '2382': [
    { title: '廣達 AI 伺服器背板拿下 Google 訂單', source: 'DigiTimes', tag: 'AI 題材' },
  ],
  '3231': [
    { title: '緯創加大 AI 伺服器投資，林口廠擴產計劃啟動', source: '工商時報', tag: 'AI 題材' },
  ],
  '2882': [
    { title: '國泰金控 Q1 EPS 1.45 元，壽險獲利回升', source: '財訊', tag: '金融' },
  ],
  '2881': [
    { title: '富邦金 Q1 淨利創同期新高，壽險利差持續擴大', source: '經濟日報', tag: '金融' },
  ],
  '2884': [
    { title: '玉山金數位金融用戶突破 800 萬，手續費收入增長', source: 'MoneyDJ', tag: '金融' },
  ],
  '4711': [
    { title: '中裕 HIV 新藥美國 FDA 臨床三期結果樂觀', source: '工商時報', tag: '生技' },
  ],
  '6547': [
    { title: '君泰生技癌症免疫療法獲台大醫院合作', source: '財訊', tag: '生技' },
  ],
  '1402': [
    { title: '遠東新印尼廠接單能見度延伸至 Q4', source: '經濟日報', tag: '紡織' },
  ],
  '1313': [
    { title: '聯成化工原料價格回穩，毛利率止跌', source: 'MoneyDJ', tag: '化工' },
  ],
  '2603': [
    { title: '長榮航運紅海航線費率持穩，Q2 運價指數觸底', source: '工商時報', tag: '航運' },
  ],
  '2609': [
    { title: '陽明海運船隊更新計劃啟動，訂購 5 艘新船', source: 'DigiTimes', tag: '航運' },
  ],
}

function makeChip(seed: number): import('../types').StockChip {
  const r = (base: number, range: number) =>
    Math.round((base + Math.sin(seed * 0.7 + base) * range) * 10) / 10
  return {
    foreignFlow:    r(15, 120),
    trustFlow:      r(8,  45),
    dealerFlow:     r(4,  30),
    mainPlayerFlow: r(20, 80),
    largeOrderDiff: r(12, 60),
    marginBalance:  Math.abs(Math.round(r(5000, 8000))),
    shortBalance:   Math.abs(Math.round(r(800, 1200))),
  }
}

const ALL_IDS = Object.keys(NEWS_POOL)

const BASE_TIMESTAMPS = [
  '2026-04-26T14:32:00',
  '2026-04-26T12:18:00',
  '2026-04-26T09:45:00',
]

export const stockDetailMock: Record<string, StockDetailResponse> = Object.fromEntries(
  ALL_IDS.map((id, i) => {
    const newsItems = (NEWS_POOL[id] ?? []).map((n, j) => ({
      id: `${id}-news-${j}`,
      title: n.title,
      source: n.source,
      publishedAt: BASE_TIMESTAMPS[j] ?? `2026-04-26T08:0${j}:00`,
    }))
    return [id, { stockId: id, chip: makeChip(i + 1), news: newsItems }]
  })
)

export const defaultStockDetail: StockDetailResponse = {
  stockId: '',
  chip: makeChip(99),
  news: [],
}
