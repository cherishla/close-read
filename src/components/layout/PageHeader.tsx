type PageHeaderProps = {
  date: string
  onDateChange: (date: string) => void
}

export function PageHeader({ date, onDateChange }: PageHeaderProps) {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-zinc-100">台股盤後決策系統</h1>
          <p className="text-xs text-zinc-500">Market Research Hub</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">日期</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="text-sm bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none focus:border-zinc-500 [color-scheme:dark]"
          />
        </div>
      </div>
    </header>
  )
}
