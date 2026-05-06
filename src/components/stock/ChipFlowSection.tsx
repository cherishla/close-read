import type { StockChip } from '../../types'
import { FlowBar } from './FlowBar'

type ChipFlowSectionProps = {
  chip: StockChip
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

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide">法人買賣超</p>
        <FlowBar label="外資" value={chip.foreignFlow} maxAbs={maxInst} />
        <FlowBar label="投信" value={chip.trustFlow} maxAbs={maxInst} />
        <FlowBar label="自營商" value={chip.dealerFlow} maxAbs={maxInst} />
        <FlowBar label="主力" value={chip.mainPlayerFlow} maxAbs={maxInst} />
      </div>
      <div className="border-t border-zinc-800 pt-3 space-y-2.5">
        <p className="text-xs text-zinc-600 font-medium uppercase tracking-wide">大單 / 信用</p>
        <FlowBar label="大單差" value={chip.largeOrderDiff} maxAbs={maxInst} />
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <div className="text-base font-bold text-zinc-200">
              {chip.marginBalance.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">融資餘額（張）</div>
          </div>
          <div className="bg-zinc-800 rounded-lg p-3 text-center">
            <div className="text-base font-bold text-zinc-200">
              {chip.shortBalance.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">融券餘額（張）</div>
          </div>
        </div>
      </div>
    </div>
  )
}
