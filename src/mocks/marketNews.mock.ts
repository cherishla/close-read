import type { MarketNewsResponse } from '../types'

export const marketNewsMock: MarketNewsResponse = {
  news: [
    {
      id: 'news-1',
      title: 'Fed 官員暗示 6 月暫停升息，美債殖利率回落，科技股受惠',
      source: '路透社',
      publishedAt: '2026-04-26T08:12:00',
      tag: '總經',
    },
    {
      id: 'news-2',
      title: '外資本週連五買，累計買超台股逾 400 億，聚焦半導體與 AI 族群',
      source: 'MoneyDJ',
      publishedAt: '2026-04-26T09:35:00',
      tag: '外資動向',
    },
    {
      id: 'news-3',
      title: '台積電法說前瞻：CoWoS 產能全年滿載，2nm 量產時程提前',
      source: '電子時報',
      publishedAt: '2026-04-26T10:08:00',
      tag: '半導體',
    },
    {
      id: 'news-4',
      title: 'AI 伺服器需求超預期，鴻海、廣達、緯創 Q2 出貨量上修',
      source: '工商時報',
      publishedAt: '2026-04-26T11:20:00',
      tag: 'AI 題材',
    },
    {
      id: 'news-5',
      title: '央行理事會即將登場，市場關注新台幣走勢與升息決策',
      source: '財訊',
      publishedAt: '2026-04-26T12:45:00',
      tag: '總經',
    },
    {
      id: 'news-6',
      title: '紅海航線費率持穩，航運族群短線情緒回溫',
      source: 'DigiTimes',
      publishedAt: '2026-04-26T13:10:00',
      tag: '航運',
    },
    {
      id: 'news-7',
      title: '台灣生技指數創波段新高，新藥臨床進展激勵資金回流',
      source: '經濟日報',
      publishedAt: '2026-04-26T14:00:00',
      tag: '生技',
    },
  ],
}
