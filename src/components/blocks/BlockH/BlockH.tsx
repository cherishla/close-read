import { useMarketNews } from '../../../hooks/useMarketNews'
import type { MarketNewsItem } from '../../../types'

type BlockHProps = {
  date: string
  vertical?: boolean
}

const TAG_COLORS: Record<string, string> = {
  '總經':   'bg-violet-950 text-violet-400',
  '外資動向': 'bg-blue-950 text-blue-400',
  '半導體':  'bg-red-950 text-red-400',
  'AI 題材': 'bg-orange-950 text-orange-400',
  '航運':   'bg-zinc-800 text-zinc-400',
  '生技':   'bg-green-950 text-green-400',
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function NewsCard({ item }: { item: MarketNewsItem }) {
  const tagClass = item.tag ? (TAG_COLORS[item.tag] ?? 'bg-zinc-800 text-zinc-400') : ''
  return (
    <div className="flex-shrink-0 w-60 bg-zinc-800/60 border border-zinc-800 rounded-xl p-4 space-y-2 hover:border-zinc-700 transition-colors cursor-default">
      {item.tag && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tagClass}`}>
          {item.tag}
        </span>
      )}
      <p className="text-sm text-zinc-200 leading-snug line-clamp-3">{item.title}</p>
      <div className="flex items-center gap-1.5 text-xs text-zinc-600">
        <span>{item.source}</span>
        <span>·</span>
        <span>{formatTime(item.publishedAt)}</span>
      </div>
    </div>
  )
}

function NewsRow({ item }: { item: MarketNewsItem }) {
  const tagClass = item.tag ? (TAG_COLORS[item.tag] ?? 'bg-zinc-800 text-zinc-400') : ''
  return (
    <div className="py-2.5 border-b border-zinc-800/60 last:border-0">
      <p className="text-xs text-zinc-200 leading-snug mb-1.5">{item.title}</p>
      <div className="flex items-center gap-1.5 text-[10px] text-zinc-600">
        {item.tag && (
          <span className={`px-1.5 py-0.5 rounded font-medium ${tagClass}`}>{item.tag}</span>
        )}
        <span>{item.source}</span>
        <span>·</span>
        <span>{formatTime(item.publishedAt)}</span>
      </div>
    </div>
  )
}

function SkeletonNewsCard() {
  return (
    <div className="flex-shrink-0 w-60 bg-zinc-800/40 border border-zinc-800 rounded-xl p-4 space-y-2 animate-pulse">
      <div className="h-4 bg-zinc-700 rounded w-16" />
      <div className="space-y-1.5">
        <div className="h-3 bg-zinc-700 rounded w-full" />
        <div className="h-3 bg-zinc-700 rounded w-5/6" />
        <div className="h-3 bg-zinc-700 rounded w-4/6" />
      </div>
      <div className="h-3 bg-zinc-700 rounded w-24" />
    </div>
  )
}

function SkeletonNewsRow() {
  return (
    <div className="py-2.5 border-b border-zinc-800/60 space-y-1.5 animate-pulse">
      <div className="h-3 bg-zinc-800 rounded w-full" />
      <div className="h-3 bg-zinc-800 rounded w-4/5" />
      <div className="h-2.5 bg-zinc-800 rounded w-24 mt-1" />
    </div>
  )
}

export function BlockH({ date, vertical }: BlockHProps) {
  const { data, isLoading } = useMarketNews(date)

  if (vertical) {
    return (
      <div className="space-y-0">
        {isLoading && [0, 1, 2, 3, 4].map((i) => <SkeletonNewsRow key={i} />)}
        {data?.news.map((item) => <NewsRow key={item.id} item={item} />)}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-400 tracking-wide">H｜今日市場新聞</h2>
        <span className="text-xs text-zinc-600">僅供參考，非投資建議</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {isLoading && [0, 1, 2, 3, 4].map((i) => <SkeletonNewsCard key={i} />)}
        {data?.news.map((item) => <NewsCard key={item.id} item={item} />)}
      </div>
    </div>
  )
}
