export function formatChange(value: number, unit: string = '%'): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}${unit}`
}

export function formatDelta(delta: number, unit: string = '%'): string {
  const sign = delta > 0 ? '▲ +' : delta < 0 ? '▼ ' : ''
  return `${sign}${delta.toFixed(2)}${unit}`
}

export function formatAmount(value: number): string {
  if (Math.abs(value) >= 100) return `${value.toFixed(1)}億`
  return `${value.toFixed(1)}億`
}

export function formatDate(date: string): string {
  return date.replace(/-/g, '/').replace(/^(\d{4})\//, '$1/')
}

export function isDeltaPositive(delta: number): boolean {
  return delta > 0
}
