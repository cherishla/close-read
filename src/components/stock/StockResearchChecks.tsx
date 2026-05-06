import type { StockCheck, StockCheckTone } from '../../utils/stockResearch'

type StockResearchChecksProps = {
  checks: StockCheck[]
}

function checkColor(tone: StockCheckTone) {
  if (tone === 'positive') return 'text-blue-400'
  if (tone === 'risk') return 'text-orange-400'
  return 'text-zinc-300'
}

function CheckCell({ item }: { item: StockCheck }) {
  return (
    <div className="bg-zinc-800 rounded-lg px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] text-zinc-500">{item.label}</span>
        <span className={`text-sm font-bold ${checkColor(item.tone)}`}>{item.value}</span>
      </div>
      <div className="text-[10px] text-zinc-500 mt-1 leading-snug">{item.detail}</div>
    </div>
  )
}

export function StockResearchChecks({ checks }: StockResearchChecksProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {checks.map((item) => <CheckCell key={item.label} item={item} />)}
    </div>
  )
}
