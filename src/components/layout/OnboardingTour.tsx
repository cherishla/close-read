import { useEffect, useMemo, useState } from 'react'

type TourStep = {
  target: string
  title: string
  body: string
  placement?: 'top' | 'bottom'
}

type OnboardingTourProps = {
  onClose: () => void
}

const STEPS: TourStep[] = [
  {
    target: 'app-header',
    title: '先確認研究日期',
    body: '右上角日期會同步更新首頁、族群頁與個股頁資料；切換日期後會回到首頁重新看盤後脈絡。',
    placement: 'bottom',
  },
  {
    target: 'daily-brief',
    title: '從盤後決策卡開始',
    body: '這裡把市場格局、資金主軸、風險提醒與明日觀察整理成第一層結論。',
  },
  {
    target: 'comparison-chart',
    title: '對照主要觀察標的',
    body: '多股比較圖放在首頁第一列，方便先看代表性個股或族群標的的相對表現。',
  },
  {
    target: 'validation-checklist',
    title: '再看今日研究清單',
    body: '研究清單把值得追蹤的族群分成今日焦點、重點觀察、資金轉強、風險升高與弱勢觀察。',
  },
  {
    target: 'industry-map',
    title: '用產業地圖找資金落點',
    body: '熱力圖可切換漲跌、廣度、法人與強度；點格子進入族群頁，也可切到個股研究模式。',
  },
  {
    target: 'fund-flow',
    title: '檢查資金與法人連續性',
    body: '右側資金流向區塊用來確認流入流出 Top5、法人連買連賣與籌碼警示。',
  },
  {
    target: 'market-news',
    title: '最後補充市場新聞',
    body: '新聞欄是輔助背景資訊，放在右側 sticky 區域；研究判斷仍以結構、資金與族群資料為主。',
  },
]

function getTargetRect(target: string) {
  const element = document.querySelector<HTMLElement>(`[data-tour="${target}"]`)
  if (!element) {
    return {
      top: Math.max(80, window.innerHeight / 2 - 120),
      left: Math.max(16, window.innerWidth / 2 - 170),
      width: Math.min(340, window.innerWidth - 32),
      height: 160,
    }
  }

  const rect = element.getBoundingClientRect()
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

export function OnboardingTour({ onClose }: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState(() => getTargetRect(STEPS[0].target))
  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1

  const popoverStyle = useMemo(() => {
    if (!rect || !step) return undefined

    const gap = 14
    const width = Math.min(340, window.innerWidth - 32)
    const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, 16), window.innerWidth - width - 16)
    const prefersTop = step.placement === 'top' || rect.top + rect.height + 190 > window.innerHeight
    const top = prefersTop
      ? Math.max(16, rect.top - 190 - gap)
      : Math.min(window.innerHeight - 190 - 16, rect.top + rect.height + gap)

    return { width, left, top }
  }, [rect, step])

  useEffect(() => {
    if (!step) return

    const updateRect = () => setRect(getTargetRect(step.target))
    const element = document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })

    window.setTimeout(updateRect, 260)
    updateRect()

    window.addEventListener('resize', updateRect)
    window.addEventListener('scroll', updateRect, true)
    return () => {
      window.removeEventListener('resize', updateRect)
      window.removeEventListener('scroll', updateRect, true)
    }
  }, [step])

  if (!step || !popoverStyle) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="absolute rounded-xl border-2 border-red-300 shadow-[0_0_0_9999px_rgba(0,0,0,0.68),0_0_32px_rgba(248,113,113,0.55),inset_0_0_0_1px_rgba(255,255,255,0.35)] transition-all duration-200"
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
        }}
      />
      <section
        className="fixed pointer-events-auto rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-2xl"
        style={popoverStyle}
        role="dialog"
        aria-label="新手導覽"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-zinc-500">
              {stepIndex + 1} / {STEPS.length}
            </p>
            <h2 className="mt-1 text-sm font-bold text-zinc-100">{step.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            aria-label="關閉新手導覽"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.293 3.293a1 1 0 011.414 0L8 6.586l3.293-3.293a1 1 0 111.414 1.414L9.414 8l3.293 3.293a1 1 0 01-1.414 1.414L8 9.414l-3.293 3.293a1 1 0 01-1.414-1.414L6.586 8 3.293 4.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <p className="text-sm leading-relaxed text-zinc-300">{step.body}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
            disabled={stepIndex === 0}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-700 disabled:hover:bg-transparent"
          >
            上一步
          </button>
          <button
            type="button"
            onClick={() => {
              if (isLast) {
                onClose()
                return
              }
              setStepIndex((current) => current + 1)
            }}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-white"
          >
            {isLast ? '完成' : '下一步'}
          </button>
        </div>
      </section>
    </div>
  )
}
