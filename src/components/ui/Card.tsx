type CardProps = {
  title: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function Card({ title, children, className = '', action }: CardProps) {
  return (
    <div className={`bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-400 tracking-wide">{title}</h2>
        {action}
      </div>
      <div className="p-5 text-zinc-200">{children}</div>
    </div>
  )
}
