import { useState } from 'react'

type CardProps = {
  title: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}

export function Card({ title, children, className = '', action, collapsible, defaultOpen = true }: CardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const isOpen = !collapsible || open

  return (
    <div className={`bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm ${className}`}>
      <div
        className={`flex items-center justify-between px-5 py-4 ${isOpen ? 'border-b border-zinc-800' : ''} ${collapsible ? 'cursor-pointer select-none hover:bg-zinc-800/40 transition-colors' : ''}`}
        onClick={collapsible ? () => setOpen((v) => !v) : undefined}
      >
        <h2 className="text-sm font-semibold text-zinc-400 tracking-wide">{title}</h2>
        <div className="flex items-center gap-2">
          {action}
          {collapsible && (
            <span className="text-zinc-600 text-sm leading-none">{open ? '∧' : '∨'}</span>
          )}
        </div>
      </div>
      {isOpen && <div className="p-5 text-zinc-200">{children}</div>}
    </div>
  )
}
