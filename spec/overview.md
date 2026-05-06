# 台股盤後決策系統 — 現行功能規格說明書

> 版本：2026-05-07 ｜ 基礎：目前已實作的 codebase（mock 資料驅動）

---

## 一、產品定位

**目標使用者**：每日收盤後自主研究台股的個人投資者

**核心流程**：快速掃描（3–5 分鐘）→ 深入研究（不限時）兩段式漏斗

**產品定位**：盤後市場結構研究工具，協助使用者整理「市場狀態、結構矛盾、研究優先順序」

**產品原則**：客觀呈現市場狀態、每個數字附歷史百分位、不提供買賣建議、不輸出多空結論、不做個股推薦排名

V1 的價值不是給答案，而是把每天分散在大盤、資金、族群、個股的資料整理成可檢查的研究流程。使用者最後仍自行判斷，但不需要從零拼湊市場全貌。

### 命名與功能邊界

| 避免使用 | 改用 |
|----------|------|
| 買進 / 賣出 / 進場 / 出場 | 資金結構、籌碼支撐、延續性確認 |
| 推薦個股 / AI 嚴選 / 飆股雷達 | 個股研究、條件篩選、結構異常 |
| 明日觀察清單 | 待驗證清單 / 研究清單 |
| 市場劇本 | 市場環境分型 |
| 異常訊號 | 結構分歧 |
| 股票總分 / 多空評分 | 趨勢、籌碼、評價、成長四面向檢查 |

---

## 二、技術架構

| 層次 | 技術 |
|------|------|
| UI 框架 | React 19 + TypeScript |
| 狀態管理 | `useState`（頁面導航），TanStack Query（遠端資料），localStorage（研究清單） |
| 資料層 | `src/services/index.ts`（目前全部回傳 mock + setTimeout 延遲） |
| 樣式 | Tailwind CSS v4（CSS-first，無 tailwind.config.js） |
| 圖表 | Recharts |
| 測試 | Vitest（覆蓋純 utils，無元件測試） |

### 導航模型

無 React Router。`App.tsx` 以 `useState` 驅動三層狀態：

```
selectedSector = null, selectedStock = null   → 主頁
selectedSector = "xxx", selectedStock = null  → SectorPage
selectedSector = "xxx", selectedStock = {...} → StockPage
```

切換時完全 unmount/remount，無 URL 變更。切換日期自動清空 selectedSector / selectedStock。

### 快取策略

所有 TanStack Query hook 設定 `staleTime: Infinity`。Query key 格式：`[資源名稱, id?, date]`。

### 目錄結構

```
src/
├── components/
│   ├── blocks/           # 按 Block 命名的頁面區塊元件（BlockA–H）
│   ├── stock/            # 跨頁面共用的個股元件
│   │   ├── ChipFlowSection.tsx     # 法人籌碼橫條組
│   │   ├── FlowBar.tsx             # 單條流向橫條
│   │   ├── NewsList.tsx            # 新聞列表
│   │   └── StockResearchChecks.tsx # 四面向檢查卡片
│   ├── layout/           # PageHeader
│   └── ui/               # Card, Skeleton, ErrorRetry, IndicatorRow, PercentilePill, DeltaBadge
├── hooks/                # 一個 hook 對應一個資料來源
├── pages/                # SectorPage, StockPage
├── services/index.ts     # 唯一的資料層（換 API 只改這裡）
├── types/index.ts        # 單一型別來源
└── utils/
    ├── marketBrief.ts    # buildMarketBrief() 純函式規則引擎
    ├── stockResearch.ts  # buildStockChecks(), getStockRank()
    ├── fundamental.ts    # fundamentalMetricColor() 基本面色彩映射
    ├── percentile.ts     # getPercentileColor(), getPercentileLabelZh()
    ├── copyFormat.ts     # buildCopyText() 研究清單複製格式
    └── formatters.ts     # 通用格式化函式
```

---

## 三、研究漏斗

```
主頁
  ├── BlockB：今天整體狀況如何？（盤後研究摘要，預設收合）
  ├── BlockA：大盤健不健康？（廣度 + 百分位）
  ├── BlockC + BlockD：資金往哪裡跑？（族群流向 + 熱力圖）
  ├── BlockG：大盤趨勢脈絡（加權 / 上櫃 / 台指期）
  ├── BlockH：今日市場新聞
  └── BlockF：研究清單（加入後在此查看 / 備註 / 複製）
         ↓ 點熱力圖格子
SectorPage
  ├── SectorStats：族群轉強還是轉弱？（資金買賣超 + 廣度 + 三大法人）
  ├── SectorPerfChart：量價合一圖（區間走勢 + 成交量 + 加權對比）
  └── BlockE 三 Tab：族群內哪些個股值得研究？
         ↓ 點個股列 → 右欄 StockDetailPanel 即時更新
StockDetailPanel
  ├── 族群排名 + 相對強弱
  ├── 籌碼摘要（法人 / 主力 / 大單 / 融資券）
  ├── + 加入研究清單 按鈕
  └── 詳細研究 → 進入 StockPage
         ↓
StockPage
  ├── 四面向檢查（趨勢 / 籌碼 / 評價 / 成長）
  ├── 今日族群定位 + 區間表現 + 籌碼風險 指標卡
  ├── 基本面概覽（P/E / P/B / ROE / EPS YoY / 營收 YoY）
  ├── 近 20 日 K 線 + 成交量
  └── 法人籌碼 / 相關新聞（Tab 切換）
```

---

## 四、頁面與元件規格

### 4.1 PageHeader（全域 Header）

- 顯示：系統名稱、日期選擇器
- 行為：切換日期清空所有導航狀態，強制回主頁

---

### 4.2 主頁

**佈局（響應式）**：

```
BlockB  ─────── 全寬，預設收合
StepIndicator（市場總覽 → 資金流向 → 產業熱力圖 → 點族群進入個股）
Grid（md: 4欄）
├── 1欄：BlockA
├── 2欄：BlockG + BlockD
└── 1欄：BlockC + BlockH
BlockF  ─────── 全寬，研究清單
```

---

#### BlockB — 盤後研究摘要

**互動**：點擊 header 展開 / 收合。各資料源獨立錯誤處理（ErrorRetry 可獨立重試）。

**收合預覽列（單行）**：

```
市場環境分型 · 廣度分數 · 流入 Top1 · 強勢N族群 · 分歧N（有時）
```

**展開後五個區塊**：

| 區塊 | 內容 | 資料來源 |
|------|------|----------|
| 市場環境 | regime label badge + 描述文字 | `buildMarketBrief()` |
| 大盤狀態 | 廣度分數 + 百分位標籤、量能倍率 + 百分位、集中度百分位 | `useMarketStructure` + `useMarketSummary` |
| 資金方向 | 流入 Top3 / 流出 Top3 + 集中度百分位標籤 | `useFundFlow` |
| 強勢族群 | 最多 3 個：名稱 + 漲跌% + 法人億 + 廣度% | `useSectors`（category === 'strong'） |
| 弱勢族群 | 最多 3 個，同上 | `useSectors`（category === 'weak'） |
| 結構分歧 | 各類異常描述（無資料時整個區塊不渲染） | `buildMarketBrief()` |

**市場環境分型（`buildMarketRegime()` 純函式，7 種）**：

| label | 判斷語意 |
|-------|---------|
| 擴散型上漲 | 指數漲 + 廣度 ≥ 60% + 強勢族群多 + 集中度不高 |
| 集中型上漲 | 指數漲 + 集中度偏高，少數族群主導 |
| 指數強廣度弱 | 指數漲但廣度 < 50% |
| 資金輪動 | 流入流出族群都明確，強弱切換清晰 |
| 弱勢反彈 | 指數小漲但量能 < 1 倍且廣度 < 55% |
| 全面轉弱 | 指數跌 + 廣度 < 40% + 弱勢族群多 |
| 結構分歧 | 指標互相矛盾，無清楚方向 |

**結構分歧類型（`buildContradictions()` 純函式，最多 6 條）**：

| type | 觸發條件 |
|------|---------|
| indexUpBreadthWeak | 指數漲 > 0.2% 且廣度 < 50% |
| sectorUpInstitutionalSell | 族群漲 > 0.5% 且法人賣超 |
| institutionalBuyPriceFlat | 法人買超 > 40 億且族群漲跌 < 0.3% |
| priceStrongVolumeLight | 族群漲 > 1.2% 且成交占比 < 4% |
| fundInWeak | category === 'fundInWeak' |
| techStrongNoFund | category === 'techStrongNoFund' |

---

#### BlockA — 市場總覽

| 欄位 | 說明 |
|------|------|
| 市場概況 narrative | 純文字描述今日大盤狀況 |
| StateSummarySlot | AI 狀態摘要預留區（mock：顯示快取評語 + 產生時間） |
| 市場廣度分數 | breadthScore + 進度條（顏色依 advanceRatio 百分位） |
| 指數漲跌 | value + 百分位標籤 |
| 成交量 / 20MA | value + 百分位標籤 |
| 三大法人 | value + 百分位標籤 |
| 上漲家數比例 | value + 百分位標籤 |
| 資金集中度 | value + 百分位標籤 |
| 創新高 / 創新低家數 | 紅 / 藍色計數方塊 |

---

#### BlockG — 指數趨勢比較

- 加權 / 上櫃 / 台指期 三條折線；Y 軸為基準化相對值（起點 = 100）
- 切換：20 日 / 60 日（右上角按鈕）
- Hover tooltip 顯示當日各指數值

---

#### BlockD — 產業熱力圖 + 個股研究

**Tab 切換（5 個）**：

| Tab | 說明 |
|-----|------|
| 漲跌 | 格子顏色 = 當日漲跌幅（深紅/紅/灰/藍/深藍） |
| 廣度 | 格子顏色 = 上漲家數比例 |
| 法人 | 格子顏色 = 三大法人淨流入 |
| 強度 | 格子顏色 = strengthScore |
| 個股研究 | 切換為 StockScreenerPanel（跨族群個股列表） |

**熱力圖規格**：
- 格子大小 = 成交量占比（volumeShare）
- 右上角彩色圓點 = 四象限分類（strong 紅 / fundInWeak 橙 / techStrongNoFund 黃 / weak 藍）
- 點擊格子 → 進入 SectorPage
- Hover → tooltip 顯示族群名稱 + 當前 indicator 數值 + 分類

**StockScreenerPanel**：跨所有族群的個股列表，支援多欄排序，可直接進入 StockPage。

---

#### BlockC — 資金流向

| 欄位 | 說明 |
|------|------|
| 資金集中度 | IndicatorRow：value + 百分位標籤 |
| 流入 Top5 | 族群名 + 金額（億），橫條比例圖 |
| 流出 Top5 | 同上 |

---

#### BlockH — 市場新聞

- 新聞標題、來源、發布時間列表
- 主頁嵌入右欄，標題「今日市場新聞」

---

#### BlockF — 研究清單

**資料持久化**：`useObservationList` hook 透過 localStorage（key: `close-read-observations`）保留，頁面重整不丟失。

**加入清單的入口**：
- SectorPage StockDetailPanel → 「+ 加入研究清單」按鈕（在「詳細研究 →」下方）
- StockPage sub-header → 「+ 研究清單」按鈕（右側，需 sector 資料載入後顯示）

**ObservationItem 欄位**：

```typescript
{
  stockId: string
  stockName: string
  sector: string           // 族群名稱（sectorName）
  stockCategory: StockCategory
  sectorCategory: SectorCategory
  breadthScore: number     // Math.round(sector.breadth * 100)
  note?: string
}
```

**清單功能**：

| 功能 | 說明 |
|------|------|
| 顯示 | 代號 + 名稱 + 族群 / 個股分類 badge / 族群廣度 |
| 備註 | 點擊展開行內編輯，Enter 或按「儲存」確認 |
| 刪除 | 每筆右上角 ✕ |
| 清空 | header 右上「清空」（只在有項目時顯示） |
| 複製 | header 右上「複製」，`buildCopyText()` 格式化純文字，2 秒後按鈕恢復 |
| 去重 | `add()` 內部以 stockId 比對，重複加入不產生重複項目 |

---

### 4.3 SectorPage（族群頁）

**觸發**：主頁點擊熱力圖格子

**佈局（響應式三欄）**：

```
SubHeader（麵包屑 + 族群 stats 列：漲跌% / 分類 / 成交占比 / 法人 / 廣度）

xl 以上三欄：
├── 左 280px（sticky top）：SectorStats
├── 中 1fr：SectorPerfChart + BlockE
└── 右 320px（sticky top）：StockDetailPanel

< xl：中欄（SectorPerfChart + BlockE）+ 選中時 StockDetailPanel 追加於下方
```

---

#### SectorStats — 族群分析

| 區塊 | 說明 |
|------|------|
| 上漲家數比例 | breadth% + 彩色進度條 |
| 個股分類分布 | 比例條：領漲 / 補漲 / 轉弱 / 弱勢 + 各類數量 |
| 整體資金買賣超（近 20 日）| Bar Chart（紅 / 藍色柱），X 軸日期，hover tooltip |
| 三大法人明細 | 外資 / 投信 / 自營 橫條 + 連買 / 連賣天數 badge |

---

#### SectorPerfChart — 量價合一圖

- 近 20 日複合圖：產業 RS 折線（彩色，依族群分類決定顏色）+ 加權指數折線（灰色虛線）+ 成交量 Bar（透明疊底）
- 雙 Y 軸：左 = 累計漲跌%，右 = 成交量（億）
- X 軸日期；hover tooltip 顯示三欄數值

---

#### BlockE — 個股結構表

**三個 Tab**，各有獨立排序狀態（預設 desc，點同欄切換 asc/desc）：

| Tab | 欄位 | 預設排序 |
|-----|------|----------|
| 今日概覽 | 個股、漲跌%、相對強弱、法人億（含連買/連賣 badge）、集中度、分類 | 相對強弱 desc |
| 區間表現 | 個股、近5日%、近20日%、近60日%、分類 | 近5日 desc |
| 籌碼風險 | 個股、融資使用率%、券資比%、當沖比%、集中度、分類 | 融資使用率 desc |

**互動**：
- 點擊列 → 右側 StockDetailPanel 更新
- 再次點擊同列 → 取消選取（面板回空狀態）
- 點擊表頭 → 排序切換

---

#### StockDetailPanel — 個股快速預覽（右欄）

| 區塊 | 說明 |
|------|------|
| Header | 名稱、代號、今日漲跌%、分類 badge |
| 族群排名 strip | `#N/總支數`（依相對強弱排序）+ 相對強弱值 |
| CTAs | 「詳細研究 →」（進入 StockPage）/ 「+ 加入研究清單」 |
| 籌碼 Tab | 外資 / 投信 / 自營 / 主力 橫條 + 大單差橫條 + 融資餘額 / 融券餘額（張）|
| 新聞 Tab | 個股相關新聞 + 相對時間 |

空狀態（未選取）：「← 點選個股查看詳情」

---

### 4.4 StockPage（個股頁）

**觸發**：StockDetailPanel「詳細研究 →」或 StockScreenerPanel 直接點擊

**佈局**：單欄，`max-w-3xl`

```
SubHeader（麵包屑 + 個股名稱 + 漲跌% + 分類 badge + 「+ 研究清單」按鈕）
指標總覽卡（四面向 + 今日定位 + 區間表現 + 籌碼風險 + 基本面概覽）
K 線 + 成交量
法人籌碼 / 相關新聞（Tab 切換）
```

---

#### 四面向檢查（`buildStockChecks()` 純函式）

每個面向獨立評分，**不組合成總分**，不輸出買賣建議。

| 面向 | 判斷依據 | 可能輸出 |
|------|----------|----------|
| 趨勢 | RS ± 1、週 / 月 / 季漲跌正負各 +1/-1 加總 | 強 / 中 / 弱 |
| 籌碼 | 法人方向 + 連買連賣天數 + 集中度 + 融資率 + 當沖比 | 支持 / 分歧 / 偏弱 |
| 評價 | P/E + P/B 百分位平均（需基本面資料）| 偏低 / 合理 / 偏高 |
| 成長 | ROE > 12% + EPS YoY + 營收 YoY 正負（需基本面資料）| 改善 / 持平 / 衰退 |

顏色：`positive` = 藍綠，`neutral` = 灰，`risk` = 紅橙。基本面未載入時評價和成長顯示「—」。

---

#### 指標卡（三組）

| 組別 | 欄位 |
|------|------|
| 今日 · 族群定位 | 族群排名、相對強弱、法人買賣超（億）、大單集中度 |
| 區間表現 | 近5日%、近20日%、近60日% |
| 籌碼風險 | 融資使用率%、券資比%、當沖比% |

---

#### 基本面概覽

五個指標卡，各附當期值 + 百分位色彩 + 中文百分位標籤。無資料時整組不渲染。

| 指標 | 色彩語意（`fundamentalMetricColor`） |
|------|--------------------------------------|
| P/E、P/B | valuation：低百分位 = 藍（偏低），高百分位 = 橙/紅（偏高） |
| ROE、EPS YoY、營收 YoY | quality/growth：高百分位 = 藍（改善），低百分位 = 橙/紅（衰退） |

---

#### K 線 + 成交量

- 近 20 日 Candlestick（自製 SVG shape via Recharts Bar；上漲紅 / 下跌藍）
- 背景半透明灰色量柱（右 Y 軸，≥1000 張自動顯示 k）
- Hover tooltip：開高低收 + 量（張）

---

#### 法人籌碼 Tab（`ChipFlowSection`）

外資 / 投信 / 自營 / 主力 橫條 + 大單差橫條 + 融資餘額 / 融券餘額（張）

#### 相關新聞 Tab（`NewsList`）

標題、來源、相對時間（幾小時前 / 幾分鐘前 / 剛剛）

---

## 五、核心 utilities

### marketBrief.ts

```
buildMarketBrief(structure, summary, flow, sectors) → MarketBriefData
  ├── buildMarketRegime()   → MarketRegime（7 種環境分型）
  └── buildContradictions() → ContradictionItem[]（最多 6 條）
```

所有輸入均來自已有 hooks，無新 API 需求。有 Vitest 單元測試。

### stockResearch.ts

```
buildStockChecks(stock, fundamental?) → StockCheck[4]   ← 四面向計算
getStockRank(stockId, sectorStocks)  → number | null    ← 族群排名
```

### fundamental.ts

```
fundamentalMetricColor(label, kind) → Tailwind class
  kind = 'valuation'           → 低百分位 = 藍（便宜），高百分位 = 紅（貴）
  kind = 'quality' | 'growth'  → 反向：高百分位 = 藍（好），低百分位 = 紅（差）
```

### percentile.ts

```
getPercentileColor(label)    → Tailwind bg+text class（用於百分位 badge）
getPercentileLabelZh(label)  → 偏低 / 略低 / 中等 / 略高 / 偏高
getPercentileBarColor(label) → Tailwind bg class（用於進度條）
```

### copyFormat.ts

```
buildCopyText(items, date) → string   ← 研究清單複製成純文字格式
```

---

## 六、百分位顏色系統

```
veryLow  → 藍色  (text-blue-400 / bg-blue-950)
low      → 淡藍  (text-blue-300)
mid      → 灰色  (text-zinc-400)
high     → 橙色  (text-orange-400)
veryHigh → 紅色  (text-red-400)
```

台股慣例：漲 = 紅，跌 = 藍。

**百分位語意規則（不同指標方向不同）**：

| 類型 | 指標 | 解讀 |
|------|------|------|
| 越高越強 | RS、上漲比例、ROE、EPS YoY、營收 YoY | 高百分位 = 相對強勢 / 品質改善 |
| 越高風險越高 | 融資使用率、當沖比、P/E、P/B | 高百分位 = 擁擠 / 昂貴 / 短線風險 |
| 需情境判讀 | 成交量、法人買賣超、資金集中度 | 需搭配價格與廣度判斷 |

---

## 七、資料模型摘要

| 型別 | 說明 |
|------|------|
| `PercentileLabel` | `veryLow / low / mid / high / veryHigh` |
| `SectorCategory` | `strong / fundInWeak / techStrongNoFund / weak` |
| `StockCategory` | `leader / catchUp / turning / weak` |
| `IndicatorValue` | `{ value, unit, deltaVsYesterday, percentile1Y, percentileLabel }` |
| `Stock` | 今日 + 區間表現 + 籌碼風險三組欄位合併 |
| `ObservationItem` | `{ stockId, stockName, sector, stockCategory, sectorCategory, breadthScore, note? }` |
| `MarketBriefData` | `{ regime, marketStatus, fundFlow, strongSectors, weakSectors, contradictions }` |
| `StockCheck` | `{ label, value, tone, detail }` — 四面向檢查單筆 |

---

## 八、錯誤 / 載入狀態規格

| 狀態 | 呈現方式 |
|------|----------|
| Loading | Skeleton（灰色閃爍佔位） |
| Error | ErrorRetry 元件：訊息 + 重試按鈕 |
| 各 Block 獨立 | 任一資料源失敗不影響其他 Block |
| 無基本面資料 | StockPage 基本面概覽整組不渲染 |
| 無結構分歧 | BlockB 分歧區塊完全不顯示 |
| 研究清單空狀態 | BlockF 顯示「尚無研究項目」提示文字 |

---

## 九、優缺點分析

### 優點

**1. 研究漏斗責任明確**
每一層（主頁 → 族群頁 → 個股頁）回答不同問題，使用者不會迷失在資訊裡。

**2. 資料層完全解耦**
`src/services/index.ts` 是唯一與資料打交道的地方，換成真實 API 只需改這一個檔案。

**3. 純函式集中，可測試**
`buildMarketBrief()`、`buildStockChecks()` 等核心邏輯都是純函式，有 Vitest 覆蓋。

**4. 共用元件已抽出**
`src/components/stock/`（ChipFlowSection、NewsList、StockResearchChecks）消除 StockDetailPanel 與 StockPage 的重複程式碼。

**5. 基本面色彩語意正確**
`fundamentalMetricColor()` 按指標類型（valuation vs quality/growth）反轉顏色方向，不把高 P/E 標示為「好」。

**6. 研究清單持久化**
`useObservationList` 用 localStorage 保留清單，重整後不丟失，可加備註後複製成純文字。

**7. 獨立錯誤邊界**
各 Block 錯誤互不干擾，避免一個 API 壞掉讓整頁白屏。

---

### 缺點

**1. 導航無 URL**
切換族群或個股不改 URL，無法存書籤，瀏覽器上一頁會直接回主頁而非族群頁。

**2. `Stock` 型別太胖**
今日、區間、籌碼風險三組欄位全合一個型別，取族群個股清單時傳入所有欄位，後端 API 設計被型別牽制。

**3. 研究清單按鈕無已加入視覺回饋**
「加入研究清單」按鈕點了沒有狀態變化（hook 內部去重但 UI 不知道），容易讓使用者不確定是否成功。

**4. StockPage 重複查詢族群資料**
StockPage 自己再跑 `useSectors` + `useSectorStocks` 算族群排名，但來自 SectorPage 的資料已在 TanStack Query 快取中，邏輯冗餘。

**5. BlockF breadthScore 標籤不直觀**
目前顯示 `breadthScore pXX`，應改為「族群廣度 XX%」較易閱讀。

**6. 目前全部是 mock 資料**
無法驗證實際 API 延遲、分頁、格式邊界。基本面百分位計算方式尚未經後端確認。

**7. 元件層級無測試**
BlockE 三 Tab 排序、BlockF 備註編輯等互動邏輯都沒有測試，重構風險高。

**8. 消費者化功能（Sprint 2+）尚未實作**
市場劇本 narrative 卡片、資金熱度榜、全局搜尋列、懶人 / 專業模式切換、PRO badge 均未動工。

---

## 十、待後端確認事項

| 項目 | 狀態 |
|------|------|
| 基本面資料（P/E / P/B / ROE / EPS YoY / 營收 YoY）歷史百分位計算方式 | 前端 mock 完成，後端待確認 |
| AI 狀態摘要（StateSummarySlot）接入方式 | mock 快取佔位，LLM 接入方式待定 |
| 真實 API 格式 / 端點 | 目前所有資料均為靜態 mock |
