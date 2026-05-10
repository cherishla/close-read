import type { StockChip } from '../../types'
import { FlowBar } from './FlowBar'

type ChipFlowSectionProps = {
  chip: StockChip
}

function BalanceBar({ label, value, maxAbs, color }: { label: string; value: number; maxAbs: number; color: string }) {
  const pct = maxAbs > 0 ? value / maxAbs : 0
  const display = value >= 10000 ? `${(value / 1000).toFixed(1)}k` : value.toLocaleString()
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500 w-16">{label}</span>
        <span style={{ color }} className="font-medium tabular-nums">{display} 張</span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-1">
        <div className="h-1 rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export function ChipFlowSection({ chip }: ChipFlowSectionProps) {
  const maxInst = Math.max(
    Math.abs(chip.foreignFlow),
    Math.abs(chip.trustFlow),
    Math.abs(chip.dealerFlow),
    Math.abs(chip.mainPlayerFlow),
    Math.abs(chip.largeOrderDiff),
    1
  )
  const maxBalance = Math.max(chip.marginBalance, chip.shortBalance, 1)

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide">法人買賣超</p>
        <FlowBar label="外資"  value={chip.foreignFlow}    maxAbs={maxInst} />
        <FlowBar label="投信"  value={chip.trustFlow}      maxAbs={maxInst} />
        <FlowBar label="自營商" value={chip.dealerFlow}    maxAbs={maxInst} />
        <FlowBar label="主力"  value={chip.mainPlayerFlow} maxAbs={maxInst} />
      </div>
      <div className="border-t border-zinc-800 pt-3 space-y-2.5">
        <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide">大單 / 信用</p>
        <FlowBar label="大單差"  value={chip.largeOrderDiff} maxAbs={maxInst} />
        <BalanceBar label="融資餘額" value={chip.marginBalance} maxAbs={maxBalance} color="#f59e0b" />
        <BalanceBar label="融券餘額" value={chip.shortBalance}  maxAbs={maxBalance} color="#4ade80" />
      </div>
    </div>
  )
}
