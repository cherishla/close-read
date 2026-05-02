# 技術實作計畫：台股系統補強 + 產業熱力圖多指標

## 背景

目前 Block D（產業熱力圖）有兩個主要缺口：

1. `sector.category`（四象限分類）已在資料層，但 UI 完全沒有顯示
2. `sector.strengthScore`、`sector.breadth`、`sector.institutionalFlow` 等欄位也都有，但熱力圖只用了 `change` 做顏色

計畫分兩個 Phase，Phase 1 是資料已存在、只需 UI 改動；Phase 2 是加入指標切換器。

---

## Phase 1：Block D 四象限標籤 + Hover Tooltip

### 目標

- 每個格子右上角顯示小圓點，顏色代表四象限分類
- 滑鼠懸停時顯示 tooltip，列出所有關鍵數據
- Block D 下方補充四象限分類說明 legend

### 涉及檔案

- `src/components/blocks/BlockD/SectorHeatmap.tsx`（主要改動）
- `src/components/blocks/BlockD/BlockD.tsx`（加 legend）

---

### Step 1-1：SectorHeatmap — 加入 hover state + tooltip

在 `SectorHeatmap` 加 state：

```ts
const [tooltip, setTooltip] = useState<{
  x: number; y: number;
  sector: { name: string; change: number; strengthScore: number;
             breadth: number; institutionalFlow: number; category: SectorCategory }
} | null>(null)
```

在最外層 `<div>` 上攔截 `onMouseLeave={() => setTooltip(null)}`，
在 `TreemapCell` 的 `<rect>` 上加 `onMouseMove={(e) => onHover(e, data)}`。

Tooltip 浮動 div（absolute positioned，跟著滑鼠）：

```tsx
{tooltip && (
  <div
    className="absolute z-20 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-xs shadow-lg pointer-events-none"
    style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
  >
    <div className="font-semibold text-zinc-100 mb-1">{tooltip.sector.name}</div>
    <div>漲跌：{sign}{change.toFixed(2)}%</div>
    <div>強度分數：{strengthScore.toFixed(1)}</div>
    <div>廣度：{(breadth * 100).toFixed(0)}%</div>
    <div>法人：{flow > 0 ? '+' : ''}{flow.toFixed(1)}億</div>
    <div className="mt-1 text-zinc-400">{CATEGORY_ZH[category]}</div>
  </div>
)}
```

SectorHeatmap 需要改成 `relative` positioning，tooltip 才能正確定位。

### Step 1-2：TreemapCell — 加四象限角標

在 `<g>` 最後加一個小圓（SVG `<circle>`）在右上角：

```tsx
const CATEGORY_DOT_COLOR: Record<SectorCategory, string> = {
  strong:           '#22c55e',   // green-500
  fundInWeak:       '#f97316',   // orange-500
  techStrongNoFund: '#eab308',   // yellow-500
  weak:             '#71717a',   // zinc-500
}

// 右上角小圓點，半徑 4，只在格子夠大時顯示
{!tooSmall && (
  <circle
    cx={x + width - 8}
    cy={y + 8}
    r={4}
    fill={CATEGORY_DOT_COLOR[category]}
    style={{ pointerEvents: 'none' }}
  />
)}
```

TreemapCell 的 data mapping 需要補 `category`、`strengthScore`、`breadth`、`institutionalFlow`：

```ts
const data = sectors.map((s) => ({
  name: s.sectorName,
  size: s.volumeShare,
  change: s.change,
  sectorId: s.sectorId,
  category: s.category,                   // 新增
  strengthScore: s.strengthScore,         // 新增
  breadth: s.breadth,                     // 新增
  institutionalFlow: s.institutionalFlow, // 新增
}))
```

### Step 1-3：BlockD — 加四象限 legend

在 `<SectorHeatmap>` 下方加一排說明：

```tsx
const CATEGORY_ITEMS = [
  { key: 'strong',           label: '強勢族群',     color: '#22c55e' },
  { key: 'fundInWeak',       label: '資金入但弱',   color: '#f97316' },
  { key: 'techStrongNoFund', label: '技術強無資金', color: '#eab308' },
  { key: 'weak',             label: '弱勢族群',     color: '#71717a' },
]
```

---

## Phase 2：產業熱力圖多指標切換器

### 目標

加入指標選擇器，支援以下 4 個指標（全部已在現有資料中）：

| 指標 key | 欄位 | 顏色語意 |
|----------|------|----------|
| `change` | `sector.change` | 紅（漲）↔ 藍（跌） |
| `breadth` | `sector.breadth` (0–1) | 紅（>70%）↔ 藍（<30%） |
| `institutionalFlow` | `sector.institutionalFlow` | 紅（法人買）↔ 藍（法人賣） |
| `strengthScore` | `sector.strengthScore` (0–100) | 紅（>60）↔ 藍（<40） |

### 涉及檔案

- `src/types/index.ts`（加 HeatmapIndicator type）
- `src/components/blocks/BlockD/BlockD.tsx`（加 state + selector UI）
- `src/components/blocks/BlockD/SectorHeatmap.tsx`（generalize 顏色函式 + 顯示值）

---

### Step 2-1：types/index.ts — 加型別

```ts
export type HeatmapIndicator = 'change' | 'breadth' | 'institutionalFlow' | 'strengthScore'
```

### Step 2-2：BlockD — 加 state + 選擇器 UI

```tsx
const [indicator, setIndicator] = useState<HeatmapIndicator>('change')

const INDICATOR_OPTIONS: { key: HeatmapIndicator; label: string }[] = [
  { key: 'change',            label: '1D 漲跌' },
  { key: 'breadth',           label: '廣度' },
  { key: 'institutionalFlow', label: '法人' },
  { key: 'strengthScore',     label: '強度分數' },
]
```

選擇器放在 Card 的 `action` slot（跟 ColorLegend 同一行），按鈕組形式：

```tsx
<div className="flex items-center gap-1">
  {INDICATOR_OPTIONS.map((opt) => (
    <button
      key={opt.key}
      onClick={() => setIndicator(opt.key)}
      className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
        indicator === opt.key
          ? 'bg-zinc-600 text-zinc-100'
          : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {opt.label}
    </button>
  ))}
</div>
```

`<SectorHeatmap>` 加 `indicator={indicator}` prop。

### Step 2-3：SectorHeatmap — 泛化顏色函式

新增各指標的顏色函式：

```ts
// breadth: 0(0%) → 藍, 0.5(50%) → 中性灰, 1(100%) → 紅
function breadthToColor(b: number): string {
  if (b >= 0.75) return '#b91c1c'
  if (b >= 0.6)  return '#dc2626'
  if (b >= 0.4)  return '#3f3f46'
  if (b >= 0.25) return '#1d4ed8'
  return '#1e3a8a'
}

// institutionalFlow: positive → 紅, negative → 藍（相對最大值正規化）
function flowToColor(flow: number, max: number): string {
  if (max === 0) return '#3f3f46'
  const ratio = flow / max  // -1 ~ 1
  if (ratio >= 0.6)  return '#b91c1c'
  if (ratio >= 0.2)  return '#dc2626'
  if (ratio > -0.2)  return '#3f3f46'
  if (ratio > -0.6)  return '#1d4ed8'
  return '#1e3a8a'
}

// strengthScore: 0–100, 50 為中性
function strengthToColor(score: number): string {
  if (score >= 75) return '#b91c1c'
  if (score >= 60) return '#dc2626'
  if (score >= 40) return '#3f3f46'
  if (score >= 25) return '#1d4ed8'
  return '#1e3a8a'
}
```

`valueToColor(sector, indicator)` 統一入口。

顯示值（格子中第二行文字）也依 indicator 切換：

- `change`：`+2.34%`
- `breadth`：`78%`
- `institutionalFlow`：`+312億`
- `strengthScore`：`88.5`

### Step 2-4：ColorLegend 動態化

根據 indicator 顯示對應的圖例說明：

| indicator | 圖例內容 |
|-----------|----------|
| change | ≥+3% / +1% / 平盤 / -1% / ≤-3% |
| breadth | >75% / >60% / ~50% / <40% / <25% |
| institutionalFlow | 大買 / 買 / 中性 / 賣 / 大賣 |
| strengthScore | >75 / >60 / ~50 / <40 / <25 |

---

## 驗證清單

### Phase 1

- [ ] 每個格子右上角顯示彩色小圓點（strong=綠, fundInWeak=橙, techStrongNoFund=黃, weak=灰）
- [ ] 滑鼠移入格子時顯示 tooltip（名稱/漲跌/強度/廣度/法人/分類）
- [ ] 滑鼠離開熱力圖時 tooltip 消失
- [ ] 格子太小時不顯示圓點（width < 60 || height < 40）
- [ ] Block D 下方四象限 legend 文字清楚可讀

### Phase 2

- [ ] Block D header 有 4 個指標切換按鈕（當前選中有 highlight）
- [ ] 切換指標後格子顏色立即更新
- [ ] 切換指標後格子第二行文字顯示對應數值
- [ ] ColorLegend 隨 indicator 更新
- [ ] 切換回 change 時，行為與原本一致

---

## 實作順序

1. Phase 1 Step 1-2（TreemapCell 角標，不需 state）
2. Phase 1 Step 1-1（Tooltip hover state）
3. Phase 1 Step 1-3（BlockD 四象限 legend）
4. Phase 2 Step 2-1（types）
5. Phase 2 Step 2-2（BlockD 選擇器）
6. Phase 2 Step 2-3（SectorHeatmap 泛化）
7. Phase 2 Step 2-4（ColorLegend 動態）
