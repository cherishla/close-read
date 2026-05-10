import { useState } from 'react'
import { GuideModal } from './GuideModal'

type PageHeaderProps = {
  date: string
  onDateChange: (date: string) => void
  onStartTour: () => void
}

export function PageHeader({ date, onDateChange, onStartTour }: PageHeaderProps) {
  const [showGuide, setShowGuide] = useState(false)

  return (
    <>
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-10" data-tour="app-header">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-bold text-zinc-100">台股盤後決策系統</h1>
            <p className="text-xs text-zinc-500">Market Research Hub</p>
          </div>
          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap">
            <button
              onClick={onStartTour}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
              title="新手導覽"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1.5a.75.75 0 01.75.75v1.02a4.75 4.75 0 013.98 3.98h1.02a.75.75 0 010 1.5h-1.02a4.75 4.75 0 01-3.98 3.98v1.02a.75.75 0 01-1.5 0v-1.02a4.75 4.75 0 01-3.98-3.98H2.25a.75.75 0 010-1.5h1.02a4.75 4.75 0 013.98-3.98V2.25A.75.75 0 018 1.5zm0 3.25a3.25 3.25 0 100 6.5 3.25 3.25 0 000-6.5zm0 1.75a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
              </svg>
              <span>新手導覽</span>
            </button>
            <button
              onClick={() => setShowGuide(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
              title="使用說明"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zM6.92 6.085c.081-.16.19-.299.34-.398.145-.097.371-.187.74-.187.28 0 .553.087.738.225A.79.79 0 019 6.286c0 .248-.135.459-.415.64-.17.11-.445.214-.736.363-.3.154-.612.354-.836.673C6.759 8.28 6.5 8.805 6.5 9.5a.5.5 0 001 0c0-.47.168-.795.37-1.069.203-.274.478-.456.741-.596.261-.138.54-.245.757-.39C9.667 7.194 10 6.645 10 6.286c0-.668-.37-1.175-.858-1.504A2.777 2.777 0 008 4.5c-.567 0-1.088.16-1.478.437-.388.276-.674.66-.82.956a.5.5 0 10.9.434c.08-.161.19-.3.34-.398z"/>
              </svg>
              <span>使用說明</span>
            </button>
            <div className="flex items-center gap-2" data-tour="date-picker">
              <label className="text-xs text-zinc-500">日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => onDateChange(e.target.value)}
                className="text-sm bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none focus:border-zinc-500 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      </header>

      {showGuide && <GuideModal onClose={() => setShowGuide(false)} />}
    </>
  )
}
