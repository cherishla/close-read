import { useState } from 'react'
import type { ObservationItem } from '../../../types'
import { Card } from '../../ui/Card'
import { STOCK_CATEGORY_ZH_MAP, SECTOR_CATEGORY_ZH } from '../../../utils/copyFormat'

type BlockFProps = {
  items: ObservationItem[]
  onRemove: (stockId: string) => void
  onClear: () => void
  onUpdateNote: (stockId: string, note: string) => void
  onCopy: () => Promise<string>
}

function ObservationRow({
  item,
  onRemove,
  onUpdateNote,
}: {
  item: ObservationItem
  onRemove: () => void
  onUpdateNote: (note: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [noteValue, setNoteValue] = useState(item.note ?? '')

  function handleSave() {
    onUpdateNote(noteValue)
    setEditing(false)
  }

  return (
    <div className="border border-zinc-800 rounded-lg p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-semibold text-zinc-100">{item.stockId} {item.stockName}</span>
          <span className="ml-2 text-xs text-zinc-500">{item.sector}</span>
        </div>
        <button
          onClick={onRemove}
          className="text-zinc-600 hover:text-red-400 transition-colors text-sm leading-none mt-0.5"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
          {STOCK_CATEGORY_ZH_MAP[item.stockCategory]}
        </span>
        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
          {SECTOR_CATEGORY_ZH[item.sectorCategory]}
        </span>
        <span className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full">
          breadthScore p{Math.round(item.breadthScore)}
        </span>
      </div>

      {editing ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="新增備註..."
            className="flex-1 text-xs bg-zinc-800 border border-zinc-700 text-zinc-200 rounded px-2 py-1 focus:outline-none focus:border-zinc-500"
          />
          <button onClick={handleSave} className="text-xs text-zinc-400 hover:text-zinc-200">儲存</button>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-zinc-600 hover:text-zinc-400"
        >
          {item.note ? `備註：${item.note}` : '+ 新增備註'}
        </button>
      )}
    </div>
  )
}

export function BlockF({ items, onRemove, onClear, onUpdateNote, onCopy }: BlockFProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const action = items.length > 0 ? (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className={`text-xs px-3 py-1 rounded-lg transition-colors ${
          copied
            ? 'bg-green-950 text-green-400'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
        }`}
      >
        {copied ? '已複製' : '複製'}
      </button>
      <button
        onClick={onClear}
        className="text-xs px-3 py-1 rounded-lg bg-zinc-800 hover:bg-red-950 hover:text-red-400 text-zinc-500 transition-colors"
      >
        清空
      </button>
    </div>
  ) : undefined

  return (
    <Card title={`F｜觀察清單（${items.length}）`} action={action}>
      {items.length === 0 ? (
        <div className="text-center py-8 text-zinc-600 text-sm">
          尚無觀察個股<br />
          <span className="text-xs">點選個股列表中的「+ 觀察」加入</span>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ObservationRow
              key={item.stockId}
              item={item}
              onRemove={() => onRemove(item.stockId)}
              onUpdateNote={(note) => onUpdateNote(item.stockId, note)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
