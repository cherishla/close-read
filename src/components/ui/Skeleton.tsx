export function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-800 last:border-0 animate-pulse">
      <div className="h-4 bg-zinc-700 rounded w-32" />
      <div className="flex flex-col items-end gap-1">
        <div className="h-4 bg-zinc-700 rounded w-20" />
        <div className="h-4 bg-zinc-800 rounded-full w-28" />
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-zinc-700 rounded w-3/4" />
      <div className="h-4 bg-zinc-700 rounded w-full" />
      <div className="h-4 bg-zinc-800 rounded w-2/3" />
    </div>
  )
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="h-4 bg-zinc-700 rounded w-16" />
          <div className="h-4 bg-zinc-700 rounded flex-1" />
          <div className="h-4 bg-zinc-800 rounded w-12" />
          <div className="h-4 bg-zinc-800 rounded w-16" />
        </div>
      ))}
    </div>
  )
}
