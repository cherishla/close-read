import { useState, useEffect, useCallback } from 'react'
import type { ObservationItem } from '../types'
import { buildCopyText } from '../utils/copyFormat'

const STORAGE_KEY = 'close-read-observations'

function loadFromStorage(): ObservationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ObservationItem[]) : []
  } catch {
    return []
  }
}

export function useObservationList(date: string) {
  const [items, setItems] = useState<ObservationItem[]>(loadFromStorage)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const add = useCallback((item: ObservationItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.stockId === item.stockId)) return prev
      return [...prev, item]
    })
  }, [])

  const remove = useCallback((stockId: string) => {
    setItems((prev) => prev.filter((i) => i.stockId !== stockId))
  }, [])

  const clear = useCallback(() => {
    setItems([])
  }, [])

  const updateNote = useCallback((stockId: string, note: string) => {
    setItems((prev) => prev.map((i) => (i.stockId === stockId ? { ...i, note } : i)))
  }, [])

  const copy = useCallback(async () => {
    const text = buildCopyText(items, date)
    await navigator.clipboard.writeText(text)
    return text
  }, [items, date])

  return { items, add, remove, clear, updateNote, copy }
}
