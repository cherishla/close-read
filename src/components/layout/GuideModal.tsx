import { useState } from 'react'

type Section = { id: string; label: string }

const SECTIONS: Section[] = [
  { id: 'start',  label: '快速上手' },
  { id: 'home',   label: '首頁' },
  { id: 'sector', label: '產業頁' },
  { id: 'stock',  label: '個股頁' },
  { id: 'colors', label: '顏色說明' },
]

function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mt-5 mb-2 first:mt-0">{children}</h3>
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-zinc-300 leading-relaxed mb-2">{children}</p>
}
function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return <span className={`inline-block text-[11px] px-1.5 py-0.5 rounded font-medium ${color}`}>{children}</span>
}

function Row({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex gap-3 py-1.5 border-b border-zinc-800 last:border-0">
      <span className="text-xs text-zinc-400 w-24 shrink-0">{label}</span>
      <span className="text-xs text-zinc-300">{desc}</span>
    </div>
  )
}

function StartSection() {
  return (
    <>
      <P>懶人研究包把大盤狀態、產業資金流向、個股籌碼整合在同一畫面。建議使用流程：</P>
      <div className="space-y-2 mb-4">
        {[
          ['① 選日期', '右上角切換交易日，全頁資料同步更新'],
          ['② 看懶人包', '確認今日市場是「全面上漲」還是「資金輪動」或「弱勢」'],
          ['③ 點產業', '從熱力圖點擊感興趣的族群格子，進入產業頁'],
          ['④ 點個股', '從個股表格進入詳細研究頁，看四面向評估'],
        ].map(([step, desc]) => (
          <div key={step} className="flex gap-3 items-start">
            <span className="text-xs font-mono text-zinc-500 w-20 shrink-0 pt-0.5">{step}</span>
            <span className="text-sm text-zinc-300">{desc}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function HomeSection() {
  return (
    <>
      <Heading>懶人包 — 7 種市場狀態</Heading>
      <div className="space-y-0">
        {[
          ['全面上漲', 'text-red-400',    '多族群同步強，廣度高，可積極做多'],
          ['集中上漲', 'text-amber-400',  '少數族群帶動，存在輪動風險'],
          ['指強廣弱', 'text-orange-400', '指數被權值股撐起，多數個股跌'],
          ['資金輪動', 'text-zinc-400',   '資金大規模跨族群移動'],
          ['弱勢反彈', 'text-yellow-400', '小漲但量縮廣度不足，謹慎對待'],
          ['全面下跌', 'text-green-400',  '多數族群弱，考慮降低部位'],
          ['訊號分歧', 'text-zinc-400',   '指標矛盾無明確方向'],
        ].map(([name, color, desc]) => (
          <div key={name} className="flex gap-3 py-1.5 border-b border-zinc-800/60 last:border-0 items-start">
            <span className={`text-xs font-semibold w-20 shrink-0 pt-0.5 ${color}`}>{name}</span>
            <span className="text-xs text-zinc-400">{desc}</span>
          </div>
        ))}
      </div>

      <Heading>資金流向（3 個 tab）</Heading>
      <Row label="流向 tab" desc="前 5 大淨流入（紅色）/ 流出族群（綠色），億元橫條" />
      <Row label="法人 tab" desc="連續買超 / 賣超族群、天數 badge、近 5 日累計金額、法人均成本" />
      <Row label="籌碼 tab" desc="融資 > 60% 或當沖比 > 45% 的警示族群" />

      <Heading>產業熱力圖</Heading>
      <P>格子大小 = 成交量；顏色深淺 = 所選指標強弱。右上角角標小圓點代表四象限分類：</P>
      <div className="flex gap-3 flex-wrap">
        <Tag color="bg-red-950 text-red-400">● 強勢族群</Tag>
        <Tag color="bg-orange-950 text-orange-400">● 資金入但弱</Tag>
        <Tag color="bg-yellow-950 text-yellow-400">● 技術強無資金</Tag>
        <Tag color="bg-green-950 text-green-400">● 弱勢族群</Tag>
      </div>
    </>
  )
}

function SectorSection() {
  return (
    <>
      <Heading>頂部資訊列欄位</Heading>
      <Row label="成交占比" desc="本族群成交量佔大盤比重" />
      <Row label="法人" desc="今日法人淨買超（紅買超 / 綠賣超），億元" />
      <Row label="廣度" desc="族群內上漲個股比例" />
      <Row label="連買/賣 N 日" desc="法人連續幾日同方向，代表建倉意圖強弱" />

      <Heading>左欄 — 產業統計</Heading>
      <Row label="廣度儀表盤" desc="> 50% 顯示紅色（多數上漲），< 50% 顯示綠色" />
      <Row label="三大法人拆分" desc="外資 / 投信 / 自營商個別買賣超，投信為台股特有力量" />
      <Row label="20 日流量圖" desc="近 20 日法人每日淨買賣長條，判斷是否持續建倉" />
      <Row label="籌碼警示" desc="族群內融資率偏高或當沖比偏高的個股名單" />

      <Heading>個股表格（3 個 tab）</Heading>
      <Row label="今日概覽" desc="漲跌 % / 近週 % / 法人 / 連買賣天數 / 集中度 / 分類" />
      <Row label="區間表現" desc="近月 % / 近季 %（長線視角）" />
      <Row label="籌碼風險" desc="融資率 / 券資比 / 當沖比" />
    </>
  )
}

function StockSection() {
  return (
    <>
      <Heading>四面向評估</Heading>
      <P>右上角整體訊號：<span className="text-red-400 font-semibold">強勢</span>（3 項正面）、<span className="text-red-400">偏強</span>、<span className="text-zinc-400">中性</span>、<span className="text-green-400">偏弱</span>（2 項以上風險）</P>
      {[
        ['趨勢', '相對強弱 + 5/20/60 日報酬多週期向上 → 正面'],
        ['籌碼', '法人持續買 + 大單集中 → 正面；融資高 + 當沖重 → 風險'],
        ['估值', 'P/E + P/B 歷史百分位雙低 → 正面；雙高 → 風險'],
        ['成長', 'ROE > 12% + EPS / 營收年增 → 正面；雙降 → 風險'],
      ].map(([dim, desc]) => (
        <div key={dim} className="flex gap-3 py-1.5 border-b border-zinc-800/60 last:border-0">
          <span className="text-xs font-semibold text-zinc-300 w-12 shrink-0 pt-0.5">{dim}</span>
          <span className="text-xs text-zinc-400">{desc}</span>
        </div>
      ))}

      <Heading>籌碼風險閾值</Heading>
      <Row label="融資使用率" desc="≥ 70% 紅色警示　40–70% 黃色提示" />
      <Row label="券資比" desc="≥ 30% 紅色（有人放空對沖）" />
      <Row label="當沖比" desc="≥ 30% 紅色（投機氣氛偏重）" />

      <Heading>K 線圖</Heading>
      <Row label="20 / 60 日" desc="右上角按鈕切換顯示區間" />
      <Row label="紅色 K 棒" desc="收盤 ≥ 開盤（上漲日）" />
      <Row label="綠色 K 棒" desc="收盤 < 開盤（下跌日）" />
      <Row label="Tooltip" desc="滑鼠移入顯示開 / 高 / 低 / 收 / 成交量" />
    </>
  )
}

function ColorsSection() {
  return (
    <>
      <P>本產品依台股慣例：<span className="text-red-400 font-semibold">紅色 = 上漲 / 偏多</span>，<span className="text-green-400 font-semibold">綠色 = 下跌 / 偏空</span>。K 線、資金流向、法人買賣超均依此規則上色。</P>
      <div className="space-y-0">
        {[
          ['text-red-400',    '紅色', '上漲、買超、資金流入、正面訊號'],
          ['text-green-400',  '綠色', '下跌、賣超、資金流出、負面訊號'],
          ['text-yellow-400', '黃色', '融資中等風險（40–70%）'],
          ['text-orange-400', '橙色', '雙重籌碼警示'],
          ['text-zinc-400',   '灰色', '中性、無明確方向'],
        ].map(([cls, name, desc]) => (
          <div key={name} className="flex gap-3 py-1.5 border-b border-zinc-800/60 last:border-0 items-center">
            <span className={`text-sm font-bold w-16 shrink-0 ${cls}`}>{name}</span>
            <span className="text-xs text-zinc-400">{desc}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          資料為每日收盤後靜態快照，非盤中即時報價。<br />
          四面向評估為輔助研究工具，不構成任何投資建議。
        </p>
      </div>
    </>
  )
}

const CONTENT: Record<string, React.ReactNode> = {
  start:  <StartSection />,
  home:   <HomeSection />,
  sector: <SectorSection />,
  stock:  <StockSection />,
  colors: <ColorsSection />,
}

type GuideModalProps = {
  onClose: () => void
}

export function GuideModal({ onClose }: GuideModalProps) {
  const [active, setActive] = useState('start')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <div>
            <h2 className="text-sm font-bold text-zinc-100">使用說明</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">懶人研究包功能導覽</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded-lg hover:bg-zinc-800"
            aria-label="關閉"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.293 3.293a1 1 0 011.414 0L8 6.586l3.293-3.293a1 1 0 111.414 1.414L9.414 8l3.293 3.293a1 1 0 01-1.414 1.414L8 9.414l-3.293 3.293a1 1 0 01-1.414-1.414L6.586 8 3.293 4.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-4 pt-3 pb-0 overflow-x-auto scrollbar-hide">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                active === s.id
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {CONTENT[active]}
        </div>
      </div>
    </div>
  )
}
