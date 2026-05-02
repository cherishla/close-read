# 族群頁強化規格 — 內嵌連動面板 + 個股表格排序

> 版本：v1.0 | 日期：2026-04-26

---

## 目標

1. **連動取代 popup**：點選個股時，右側出現常駐詳情面板並立即更新，不彈出 overlay Modal
2. **表格排序**：點欄位 header 可對個股列表做升降排序
3. **族群排名**：詳情面板顯示該股在族群內的相對強弱排名

---

## 互動流程

```
點選個股列 → selectedStock 更新 → 右側 StockDetailPanel 同步顯示
再次點擊同一列 → 取消選取 → 面板回到空狀態（← 點選個股查看詳情）
```

---

## 版面佈局（三欄）

| 斷點 | 左欄 | 中欄 | 右欄 |
|------|------|------|------|
| < lg | 全寬堆疊 | 全寬堆疊 | 選取後才顯示 |
| lg | 280px | 1fr | hidden |
| xl | 280px | 1fr | 320px 常駐 |

```
xl:grid-cols-[280px_minmax(300px,1fr)_320px]
```

---

## 新增元件：StockDetailPanel

**路徑：** `src/components/blocks/BlockE/StockDetailPanel.tsx`

**Props：**
```ts
type StockDetailPanelProps = {
  stock: Stock | null
  date: string
  sectorStocks: Stock[]  // 計算族群排名用
}
```

**結構：**
- Empty state：`← 點選個股查看詳情`
- Header：名稱 + 代號 + 漲跌% + 分類 badge
- Rank strip：族群排名 `#rank/total` + 相對強弱值（按 relativeStrength desc 排）
- Tab bar：籌碼 | 新聞
- Content：FlowBar × 5（外資/投信/自營/主力/大單差）+ 融資/融券 grid + 新聞列表

---

## BlockE 更新

**State 上移：** `selectedStock` 移至 `SectorPage`，BlockE 接收 `selectedStock` + `onSelectStock` props

**排序欄位：** 漲跌、相對強弱（預設 desc）、法人、集中度

**選取列樣式：** `bg-zinc-700/60 border-l-2 border-l-zinc-400`（未選 border-l-transparent）

---

## Type 新增

```ts
export type StockSortKey = 'change' | 'relativeStrength' | 'institutionalFlow' | 'concentration'
export type SortDirection = 'asc' | 'desc'
```

---

---

## 量價合一圖 + 版面重組（v1.1）

### 決策依據
- 成交量柱 + 區間表現雙線合併為標準「量價合一圖」（ComposedChart），符合盤後資金研究慣例
- 廣度（上漲家數比例）移至左欄頂部，是進入族群頁最優先確認的問題
- 合併圖移至個股清單上方（中欄），提供股票結構分析前的脈絡

### 新元件：SectorPerfChart

路徑：`src/components/blocks/BlockE/SectorPerfChart.tsx`

Props：`{ sectorId: string; date: string; sectorCategory: Sector['category'] }`

Recharts ComposedChart：
- 左 Y 軸（%）：產業線（category 顏色實線）+ 加權線（灰虛線）
- 右 Y 軸（億）：成交量柱（category 顏色，opacity 0.4，背景層）
- 高度 160px，雙 Y 軸獨立 auto scale

### SectorStats 更新

移除：成交量 chart、區間表現 chart（移至 SectorPerfChart）
移動：廣度 + 個股分類 → 升至 Card 頂部
保留：整體資金買賣超 chart、三大法人

### SectorPage 更新

中欄結構：
```
<SectorPerfChart />   ← 新增，在 BlockE Card 上方
<BlockE />
```

---

## 個股結構三 Tab（v1.2）

### 決策依據

- 今日概覽（現有欄位）只能看當日強弱，無法判斷是「持續動能」還是「單日爆衝」
- 區間表現：跨股比較一週/一月/一季累計%，用來確認 RS 強的股票是否具備中期趨勢
- 籌碼風險：融資使用率、券資比、當沖比跨股比較，StockDetailPanel 只看單股絕對值，無法橫向對比
- 大小單差（集中度已涵蓋）、基本面（月頻資料）列為後續再議

### Tab 規格

| Tab | Label | 預設排序 | 欄位 |
|-----|-------|---------|------|
| `today` | 今日概覽 | relativeStrength ↓ | 漲跌、相對強弱、法人、集中度、分類 |
| `period` | 區間表現 | weekChange ↓ | 一週%、一月%、一季%、分類 |
| `risk` | 籌碼風險 | marginRatio ↓ | 融資使用率、券資比、當沖比、集中度、分類 |

切換 tab 時 sort 重設為該 tab 預設；selectedStock（右側面板）不受影響。

### Stock Type 新增欄位

```ts
// 區間表現
weekChange: number       // 近5交易日累計%
monthChange: number      // 近20交易日累計%
quarterChange: number    // 近60交易日累計%
// 籌碼風險
marginRatio: number      // 融資使用率 0–100
shortRatio: number       // 券資比 0–100
daytradingRatio: number  // 當沖比 0–100
```

StockSortKey 擴充加入上述 6 個 key。

### Mock 生成

檔案頂部加入 `mkPeriod(stockId, weekBias)` 與 `mkRisk(stockId, marginBias, daytradeBias)` helper（deterministic sin/cos，無 Math.random），各 stock 物件以 spread 加入。

強勢族群（semi/ai）weekBias +2.5、marginBias 低；弱勢族群（ship/trad/steel）weekBias −2.5、marginBias 高、daytradeBias 高。

### BlockE 色彩規則

- 區間表現欄：正紅負藍（同漲跌邏輯）
- 融資使用率：≥70 紅、40–69 黃、<40 灰
- 券資比 / 當沖比：≥30 紅、<30 灰

### Tab Bar 位置

使用 Card 現有 `action` prop（header 右側），渲染三個 pill 按鈕（active: `bg-zinc-700 text-zinc-100`）。

---

## 驗收條件

- [ ] xl 寬度三欄同時可見
- [ ] 點選個股 → 右側面板立即更新，無 popup
- [ ] 再次點擊 → 取消選取
- [ ] 面板顯示族群排名（#2/8 格式）
- [ ] 點欄位 header 排序，active 欄顯示 ↓/↑
- [ ] 選中列左側邊框高亮
- [ ] Card header 出現三個 tab 按鈕，切換後欄位與排序正確更新
- [ ] 切換 tab 時右側 StockDetailPanel 不消失
- [ ] 區間表現：正紅負藍；籌碼風險：融資≥70 紅、40-69 黃
- [ ] `npx tsc --noEmit` 無錯誤
