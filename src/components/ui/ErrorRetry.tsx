type ErrorRetryProps = {
  message?: string
  onRetry?: () => void
}

export function ErrorRetry({ message = '載入失敗', onRetry }: ErrorRetryProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
      <p className="text-sm text-zinc-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
        >
          重試
        </button>
      )}
    </div>
  )
}
