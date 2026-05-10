import type { StockCheck, StockCheckTone } from '../../utils/stockResearch'

type StockResearchChecksProps = {
  checks: StockCheck[]
}

function checkValueColor(tone: StockCheckTone) {
  if (tone === 'positive') return 'text-red-400'
  if (tone === 'risk') return 'text-green-400'
  return 'text-zinc-400'
}

function checkBorderColor(tone: StockCheckTone) {
  if (tone === 'positive') return 'border-red-500/50'
  if (tone === 'risk') return 'border-green-500/40'
  return 'border-zinc-700'
}

function CheckCell({ item }: { item: StockCheck }) {
  return (
    <div className={`bg-zinc-800/70 rounded-lg px-3 py-2.5 border-l-2 ${checkBorderColor(item.tone)}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] text-zinc-500">{item.label}</span>
        <span className={`text-sm font-bold ${checkValueColor(item.tone)}`}>{item.value}</span>
      </div>
      <div className="text-[10px] text-zinc-600 mt-1 leading-snug">{item.detail}</div>
    </div>
  )
}

export function StockResearchChecks({ checks }: StockResearchChecksProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {checks.map((item) => <CheckCell key={item.label} item={item} />)}
    </div>
  )
}
