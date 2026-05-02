# 台股盤後決策系統 Spec v4.3（Research-first / 完整可開發版）

> 對象：PM / RD / 設計 / Data  
> 目標：可直接進入 Sprint 開發  
> 本版本反映目前完整實作狀態

---

# 合併說明

| 來源 | 採納內容 |
|------|----------|
| v4 | 產品立場（不做結論）、Top-down 架構、指標公式、族群四象限、個股語意分類 |
| v3.3 | 歷史百分位數、敘事語境、AI 接入規格、API response type、可執行驗收條件 |
| v4.2 | 移除觀察清單、新增 Block G 指數趨勢、Block D 多指標熱力圖 |
| v4.3 | A+B 合併為市場總覽、主頁四欄佈局、族群頁兩欄+麵包屑、SectorStats 族群分析、個股集中度+StockModal、Block H 熱門新聞 |

---

# 1. 產品定位

👉 盤後市場研究中心（Market Research Hub）

用途：
- 理解市場結構
- 支援隔日決策準備

非用途：
- 即時交易
- 投資建議
- AI 預測

---

# 2. 核心設計原則

### Top-down 分析

```
大盤 → 資金 → 族群 → 個股
```

### 不做結論

只提供數據與結構，不給多空判斷。  
所有語言使用描述性詞彙（擴散 / 集中 / 強 / 弱），避免方向性詞彙（多 / 空 / 看漲 / 看跌）。

---

# 3. 使用者每日任務

1. 判斷市場結構（擴散 / 集中）
2. 找出資金流向
3. 找出強勢族群
4. 找出主導個股

---

# 4. 完整使用流程（User Flow）

```text
進入頁面
↓
看市場總覽（Block A：概況 + 結構合併）
↓
看資金流向（Block C）＋ 看指數趨勢（Block G）＋ 看族群熱力圖（Block D）
↓
參考熱門市場新聞（Block H）
↓
點族群格子
↓
看族群分析（SectorStats：相對強弱走勢、整體資金買賣超、廣度、三大法人、個股分類）
↓
看個股結構（Block E）
↓
點個股列
↓
查看籌碼細節與新聞（StockModal）
```

---

# 5. UI 定義

---

## 主頁版面配置

主頁由上到下：

1. **Block B**（盤後研究摘要）：全寬，預設收合，協助使用者在 30 秒內掌握今日市場狀態與研究方向。
2. Step indicator：提示研究順序。
3. 四欄格線（`grid-cols-4`，寬螢幕）：

| 欄 | 內容 |
|----|------|
| 左 1 欄 | **Block A**（市場總覽）|
| 中 2 欄 | **Block G**（指數趨勢）+ **Block D**（熱力圖）|
| 右 1 欄 | **Block C**（資金流向）+ **Block H**（今日市場新聞）|

---

## Block B：盤後研究摘要

Block B 是主頁的快速掃描入口，使用前端規則引擎整合既有資料，不依賴新的後端 API。

### 位置與互動

- 位置：主頁最上方，橫跨全寬，在 step indicator 和三欄 grid 之前。
- 預設收合：顯示單行摘要，包含廣度分數、流入 top1、強勢族群數與矛盾觀察數。
- 點擊展開：顯示完整盤後研究摘要。

### 展開內容

1. **大盤狀態**
   - 廣度分數 + 歷史百分位標籤
   - 量能倍率 + 歷史百分位標籤
   - 資金集中度百分位標籤

2. **資金方向**
   - 流入 Top3 族群
   - 流出 Top3 族群
   - 資金集中度百分位標籤

3. **強勢族群**
   - 最多 3 個 `category === 'strong'` 族群
   - 顯示族群名、漲跌、法人買賣超、廣度

4. **弱勢族群**
   - 最多 3 個 `category === 'weak'` 族群
   - 顯示族群名、漲跌、法人買賣超、廣度

5. **矛盾觀察**
   - `fundInWeak`：資金流入但走勢偏弱
   - `techStrongNoFund`：技術面偏強但法人支撐偏弱
   - 無矛盾觀察時整段不顯示

### Loading / Error

- 任一資料 loading 時，顯示摘要 skeleton。
- 任一資料 error 時，在 Block B 內顯示對應資料源的 retry，不影響其他主頁區塊。

---

## Block A：市場總覽

呈現市場概況與市場結構，作為 Block B 摘要的原始資料細節入口。

### 內容（由上到下）

1. **敘事摘要（narrative）**（bg-zinc-800 文字框）  
   rule-engine 產生，2–3 句描述今日結構特徵，不含方向判斷  
   + 狀態摘要 slot（可選，詳見 Section 11）

2. **市場廣度分數（breadthScore）**  
   大數字 + 進度條，顏色依 advanceRatio 百分位

3. **大盤指標**（IndicatorRow，含 ▲▼ 與歷史百分位標籤）
   - 指數漲跌
   - 成交量 / 20MA
   - 三大法人買賣超

4. **廣度指標**（IndicatorRow）
   - 上漲家數比例
   - 資金集中度

5. **創新高 / 創新低**（雙色塊）

### 百分位標籤規格

| 百分位 | 標籤 | 顏色 |
|--------|------|------|
| p0–p20 | 偏低 | 藍 |
| p21–p40 | 中低 | 灰 |
| p41–p60 | 中位 | 灰 |
| p61–p80 | 偏高 | 橙 |
| p81–p100 | 極高 | 紅 |

### breadthScore 公式

```
breadthScore =
  w1 * 上漲家數比例 +
  w2 * 站上50MA比例 +   ← 用於計算，不在 UI 顯示
  w3 * (新高家數 - 新低家數)
```

---

## Block C：資金流向

欄位：
- 流入 Top5 族群（紅色橫條）
- 流出 Top5 族群（藍色橫條）
- 資金集中度（含歷史百分位標籤）

### 資金集中度公式

```
concentration = top3_volume / total_volume
```

---

## Block D：族群強弱熱力圖

Treemap 呈現，格子大小依 `volumeShare` 決定。

### 多指標切換

| 指標 key | 中文 | 色彩邏輯 |
|----------|------|----------|
| `change` | 漲跌 | 正紅負藍，5 段漸層 |
| `breadth` | 廣度 | 高紅低藍 |
| `institutionalFlow` | 法人 | 相對最大值正規化，高紅低藍 |
| `strengthScore` | 強度 | 綜合分數，高紅低藍 |

### 四象限角標

格子右上角 4px 圓點，顏色代表分類：

| 分類 | key | 顏色 |
|------|-----|------|
| 強勢族群 | `strong` | 綠 #22c55e |
| 資金入但弱 | `fundInWeak` | 橙 #f97316 |
| 技術強無資金 | `techStrongNoFund` | 黃 #eab308 |
| 弱勢族群 | `weak` | 灰 #71717a |

格子 < 60×40px 隱藏角標與文字。

### Hover Tooltip

跟隨游標，自動左右避邊，顯示：族群名 / 漲跌 / 強度 / 廣度 / 法人 / 四象限分類

### 格子點擊

→ 進入族群頁（SectorPage）

### strengthScore 公式

```
strengthScore =
  a * 漲跌幅 +
  b * 成交占比變化 +
  c * 法人資金 +
  d * 廣度
```

---

## Block G：指數趨勢比較

**位置**：Block D 上方（主頁中央 2 欄）

**圖表**：多線折線圖（加權 / 上櫃 / 台指期），正規化（區間第一日 = 100），20日 / 60日切換

**互動**：切換重打 `/index-trend`，Hover 顯示各指數數值

---

## Block H：今日市場新聞

**位置**：主頁右欄，Block C 下方

**樣式**：垂直卡片列，每張卡片顯示 tag badge + 標題（2 行截斷）+ 來源 + 時間

**Loading**：水平 skeleton 卡

---

## SectorPage：族群頁

### 導航

- Sub-header 頂部顯示麵包屑：`主頁 / [族群名稱]`，點「主頁」返回
- Sub-header 顯示族群基本資訊：名稱、漲跌、四象限分類、成交占比、法人、廣度

### 版面

三欄（xl：`280px + minmax(300px, 1fr) + 320px`）：
- **左欄**：SectorStats（族群分析）
- **中欄**：SectorPerfChart（量價合一圖）+ Block E（個股結構）
- **右欄**：StockDetailPanel（點選個股後即時更新）

`< xl` 時維持左欄 + 中欄，點選個股後 StockDetailPanel 追加顯示於中欄下方。

---

## SectorStats：族群分析

左欄固定卡片，由上到下：

### 1. 相對強弱 vs 大盤（近 20 日，折線）

- Y 軸：（族群累積 % − TAIEX 累積 %），起點 0
- 正值 = 跑贏市場；負值 = 落後市場
- 線條顏色隨四象限分類（強勢紅 / 資金入橙 / 技術黃 / 弱勢藍）
- 基準虛線在 y = 0

### 2. 整體資金買賣超（近 20 日，Bar chart）

- Y 軸：億，正紅負藍
- 包含法人 + 散戶整體流向（非單純法人）

### 3. 廣度 + 個股分類（底部 Grid 2 cols）

- 上漲家數比例：大數字 + 進度條（≥50% 紅，<50% 藍）
- 個股分類：堆疊色塊條 + 圖例（領漲 / 補漲 / 轉弱 / 弱勢 計數）

### 4. 三大法人（底部，全寬）

外資 / 投信 / 自營 各自 FlowBar，相對最大值正規化

---

## Block E：個股結構

表格欄位（6 欄）：

| 欄 | 說明 |
|----|------|
| 個股 | 名稱 + 代號 |
| 漲跌 | % |
| 相對強弱 | stock_change − sector_change |
| 法人 | 億（正紅負藍）|
| 集中度 | 大單集中度 0–100（≥70 紅 / ≤30 藍 / 其餘灰）|
| 分類 | 領漲 / 補漲 / 轉弱 / 弱勢（badge）|

**點擊任一列 → 開啟 StockModal**

### 個股分類公式

```
relativeStrength = stock_change - sector_change
```

| 分類 | 說明 |
|------|------|
| 領漲股 | relativeStrength 顯著為正 + 法人買超 |
| 補漲股 | relativeStrength 微正，族群已漲一段 |
| 轉弱股 | 近期由強轉弱，relativeStrength 轉負 |
| 弱勢股 | relativeStrength 顯著為負 |

---

## StockModal：個股籌碼與新聞

**觸發**：點擊 Block E 個股列  
**樣式**：居中 overlay（max-w-md），backdrop 點擊或 Esc 關閉

### 籌碼 Tab

| 指標 | 說明 |
|------|------|
| 外資 | 法人買賣超（億） |
| 投信 | 法人買賣超（億） |
| 自營商 | 法人買賣超（億） |
| 主力 | 主力買賣超（億） |
| 大單差 | 大買單 − 大賣單（億） |
| 融資餘額 | 張 |
| 融券餘額 | 張 |

### 新聞 Tab

近期相關新聞列表：標題 + 來源 + 相對時間

---

# 6. State 設計

## Server State

- `marketSummary`（narrative、stateSummary、三大指標）
- `structure`（breadthScore、advanceRatio、concentration、新高低）
- `fundFlow`
- `sectors`
- `stocks`（per sectorId）
- `indexTrend`（per period）
- `sectorDetail`（per sectorId：外資/投信/自營分解）
- `sectorTrend`（per sectorId：20日 RS 走勢）
- `sectorFundFlow`（per sectorId：20日整體買賣超）
- `stockDetail`（per stockId：籌碼 + 新聞）
- `marketNews`

## UI State

- `selectedSector`
- `selectedStock`
- `selectedDate`
- `heatmapIndicator`（預設 `change`）
- `trendPeriod`（預設 `20`）

---

# 7. API 規格

## GET /market-summary

```ts
Response: {
  narrative: string;
  aiComment?: AiComment;
  indicators: {
    indexChange: IndicatorValue;
    volume20MA: IndicatorValue;
    institutionalFlow: IndicatorValue;
  };
}
```

## GET /market-structure

```ts
Response: {
  breadthScore: number;
  indicators: {
    advanceRatio: IndicatorValue;
    above50MA: IndicatorValue;     // 用於 breadthScore 計算，不在 UI 顯示
    newHighCount: number;
    newLowCount: number;
    concentration: IndicatorValue;
  };
}
```

## GET /fund-flow

```ts
Response: {
  inflow: SectorFlow[];
  outflow: SectorFlow[];
  concentration: IndicatorValue;
}
```

## GET /sectors

```ts
Response: { sectors: Sector[] }

type Sector = {
  sectorId: string;
  sectorName: string;
  change: number;
  volumeShare: number;
  institutionalFlow: number;
  breadth: number;
  strengthScore: number;
  category: SectorCategory;
}
```

## GET /sector-stocks

```ts
Response: { stocks: Stock[] }

type Stock = {
  stockId: string;
  stockName: string;
  change: number;
  relativeStrength: number;
  institutionalFlow: number;
  ma50Position: 'above' | 'below' | 'breakout' | 'breakdown';
  volume: number;
  category: StockCategory;
  concentration: number;   // 大單集中度 0–100
}
```

## GET /index-trend

```ts
// ?period=20|60&date=YYYY-MM-DD
Response: {
  period: number;
  indices: IndexSeries[];
}

type IndexSeries = {
  indexId: string;
  indexName: string;
  data: TrendPoint[];
}

type TrendPoint = {
  date: string;
  value: number;      // 正規化（第一日 = 100）
  rawValue: number;
}
```

## GET /sector-detail

```ts
// ?sectorId=X&date=YYYY-MM-DD
Response: {
  sectorId: string;
  foreignFlow: number;
  trustFlow: number;
  dealerFlow: number;
}
```

## GET /sector-trend

```ts
// ?sectorId=X&date=YYYY-MM-DD
Response: {
  sectorId: string;
  data: { date: string; value: number; }[];  // 累積 % change，第一日 = 0
}
```

## GET /sector-fund-flow

```ts
// ?sectorId=X&date=YYYY-MM-DD
Response: {
  sectorId: string;
  data: { date: string; flow: number; }[];   // 日整體買賣超（億）
}
```

## GET /stock-detail

```ts
// ?stockId=X&date=YYYY-MM-DD
Response: {
  stockId: string;
  chip: StockChip;
  news: StockNewsItem[];
}

type StockChip = {
  foreignFlow: number;
  trustFlow: number;
  dealerFlow: number;
  mainPlayerFlow: number;
  largeOrderDiff: number;
  marginBalance: number;
  shortBalance: number;
}

type StockNewsItem = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
}
```

## GET /market-news

```ts
// ?date=YYYY-MM-DD
Response: {
  news: MarketNewsItem[];
}

type MarketNewsItem = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  tag?: string;
}
```

---

### 共用 type

```ts
type IndicatorValue = {
  value: number;
  unit: string;
  deltaVsYesterday: number;
  percentile1Y: number;
  percentileLabel: PercentileLabel;
}

type PercentileLabel = 'veryLow' | 'low' | 'mid' | 'high' | 'veryHigh';
type SectorCategory = 'strong' | 'fundInWeak' | 'techStrongNoFund' | 'weak';
type StockCategory = 'leader' | 'catchUp' | 'turning' | 'weak';
type HeatmapIndicator = 'change' | 'breadth' | 'institutionalFlow' | 'strengthScore';
```

---

# 8. Interaction

| 操作 | 效果 |
|------|------|
| 點族群格子 | 進入族群頁（SectorPage） |
| 族群頁點「主頁」麵包屑 | 返回主頁 |
| 切換熱力圖指標 | 格子顏色即時更新，不重打 API |
| 切指數趨勢區間 | 重打 /index-trend |
| 點個股列 | 開啟 StockModal |
| StockModal 點背景或 Esc | 關閉 Modal |
| 切日期 | reload 所有 Block，重置 selectedSector |

---

# 9. Loading / Empty / Error

- **Loading**：skeleton（Card / Row / Table 各有 skeleton 元件）
- **Empty**：無資料提示（含日期說明）
- **Error**：retry；narrative / stateSummary 獨立 error，不影響其他 Block
- **StockModal Loading**：內容區 skeleton rows

---

# 10. RD 模組

backend:
- `rule-engine`（narrative、族群 / 個股分類）
- `percentile-calculator`（近一年分布）
- `narrative-generator`（規則版，可替換 AI）
- `score-calculator`（breadthScore / strengthScore / relativeStrength / concentration）
- `index-normalizer`（指數正規化序列）
- `chip-aggregator`（籌碼聚合：法人 / 主力 / 大單 / 融資券）
- `news-fetcher`（新聞來源整合）

frontend hooks:
- useMarketSummary / useMarketStructure / useFundFlow
- useSectors / useSectorStocks / useIndexTrend
- useSectorDetail / useSectorTrend / useSectorFundFlow
- useStockDetail / useMarketNews

frontend components:
- BlockA（市場總覽）/ BlockC / BlockD / BlockE / BlockG / BlockH
- SectorPage / SectorStats / StockModal
- SectorHeatmap / IndexTrendChart

---

# 11. 狀態摘要接入點規格

狀態摘要是增強層，v4.3 預留接入點，後端接上 AI 後前端不需改動。

| 位置 | 欄位 | 層級 |
|------|------|------|
| Block A narrative 下方 | `marketSummary.stateSummary` | 市場總覽 |
| SectorPage sub-header 下方（未來）| `sector.stateSummary` | 族群層 |
| StockDetailPanel / StockPage 頂部（未來）| `stock.stateSummary` | 個股層 |

```ts
type StateSummary = {
  content: string;
  model: string;
  generatedAt: string;
}
```

UI：`stateSummary` null → 不顯示；有值 → 顯示「狀態摘要」標籤 + 產生時間；失敗 → 顯示快取評語

擴充路徑：`v4.3 → v4.x族群/個股 → v5.0 對話式`

---

# 12. 驗收條件

## PM
- 能依 Top-down 流程完成每日四個任務
- Block A 合併後能在單一卡片完成市場概況 + 廣度判斷
- 族群頁麵包屑可正確導航返回主頁
- 點選個股可看到籌碼與新聞，不需離開族群頁
- Block H 新聞不影響主要決策流程（底部獨立區塊）

## RD
- 所有公式（breadthScore / strengthScore / relativeStrength / concentration）有計算模組
- `percentile1Y` 與近一年歷史對齊
- API schema 符合本 spec 定義
- StockModal 重複點同一個股不重打 API（react-query 快取）
- Block D 指標切換不重打 API
- 族群 RS 走勢 = 族群累積% − TAIEX 累積%，起點為 0

## UX
- 有方向感（▲▼）
- 有歷史位置感（百分位標籤）
- 有結構分類（四象限 / 個股語意）
- 族群分析左欄 + 個股右欄，資訊密度高但不壓迫
- StockModal Esc / 點背景可關閉，符合直覺

---

# 13. 版本定義

v3.0：系統  
v3.1：產品補強  
v3.2：可開發版本  
v3.3：研究語境強化版  
v4：產品思維重構（公式 + 分類 + 立場）  
v4.1：完整合併版（產品思維 + 開發規格）  
v4.2：移除觀察清單、Block D 多指標熱力圖、Block G 指數趨勢  
**v4.3：A+B 合併為市場總覽、主頁四欄佈局、族群頁兩欄+麵包屑+SectorStats、個股集中度+StockModal、Block H 熱門新聞**
