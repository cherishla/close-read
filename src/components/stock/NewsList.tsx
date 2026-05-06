import type { StockNewsItem } from '../../types'

type NewsListProps = {
  news: StockNewsItem[]
}

function formatRelTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h > 0) return `${h} 小時前`
  if (m > 0) return `${m} 分鐘前`
  return '剛剛'
}

export function NewsList({ news }: NewsListProps) {
  if (news.length === 0) {
    return <p className="text-sm text-zinc-500 text-center py-6">暫無相關新聞</p>
  }

  return (
    <div className="space-y-3">
      {news.map((item) => (
        <div key={item.id} className="border-b border-zinc-800/60 pb-3 last:border-0">
          <p className="text-sm text-zinc-200 leading-snug mb-1">{item.title}</p>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{item.source}</span>
            <span>·</span>
            <span>{formatRelTime(item.publishedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
