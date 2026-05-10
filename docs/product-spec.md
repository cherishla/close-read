# 懶人研究包 — 產品規格書

> 版本：2026 Sprint 1–4  
> 更新日期：2026-05-11  
> 負責人：cherishla

---

## 一、產品定位

### 核心主張

「懶人研究包」是一套台股**盤後決策輔助工具**，協助使用者在 5–10 分鐘內完成從大盤 → 族群 → 個股的三層研究流程。

### 設計原則

1. **把資料轉成研究語言**：每一個數字都要有對應的文字結論
2. **中性客觀**：不使用「推薦 / 建議買進 / 適合進場」等字眼，只呈現事實與待確認項目
3. **三層脈絡貫穿**：首頁 → 族群頁 → 個股頁，每層都保留上一層的脈絡
4. **規則式摘要**：所有文字結論都由規則引擎產生，不依賴 AI，可驗證、可調整

### 目標使用者

- 有一定台股基礎、習慣盤後研究的投資者
- 需要快速定位強勢族群與個股的研究者
- 希望從資金與籌碼角度輔助技術分析的使用者

---

## 二、頁面架構

### 2-1 導航架構

```
首頁（Home）
  ├── 盤後決策卡（DailyBriefCard）
  ├── 多股比較圖（BlockG）
  ├── 今日研究清單
  ├── 產業地圖（熱力圖）
  ├── 個股研究（篩選器）
  ├── 資金流向 / 法人
  └── 今日市場新聞（右側 sticky 欄）

族群研究頁（SectorPage）
  ├── 族群研究摘要
  ├── 族群走勢圖
  ├── 族群分析（左欄）
  └── 個股表格

個股研究頁（StockPage）
  ├── 個股研究摘要
  ├── 四面向評估
  ├── 族群內角色
  ├── 籌碼風險
  ├── 基本面
  ├── 價格走勢與成交量（K 線）
  └── 法人籌碼
```

### 2-2 路由實作

使用 React Router：

```txt
/                              首頁
/sector/:sectorId              族群研究頁
/sector/:sectorId/stock/:stockId 個股研究頁
```

頁首日期由 `App.tsx` state 管理，切換日期時更新全站查詢參數並導回首頁。族群與個股頁可透過 URL 分享。

### 2-3 說明與導覽

| 元件 | 定位 | 行為 |
|---|---|---|
| `GuideModal` | 一般說明彈窗 | 由頁首「使用說明」開啟，提供首頁、產業頁、個股頁、顏色規則等完整參考，不做逐步高亮 |
| `OnboardingTour` | 新手逐步導覽 | 由頁首「新手導覽」開啟，回到首頁後依序高亮日期、盤後決策卡、多股比較、今日研究清單、產業地圖、資金流向、新聞欄 |

導覽錨點使用 `data-tour` 標記在目前首頁主要區塊上，避免和一般說明彈窗耦合。

---

## 三、資料層規格

### 3-1 API 接口

所有資料通過 `src/services/index.ts` 取得，目前為 mock 實作（含 setTimeout 延遲模擬載入）。實際串接時只需修改此檔案，hooks 與元件不需異動。

### 3-2 Hook 清單

| Hook | 參數 | 說明 |
|---|---|---|
| `useMarketStructure(date)` | 日期 | 廣度、集中度等結構指標 |
| `useMarketSummary(date)` | 日期 | 指數漲跌、成交量等摘要 |
| `useFundFlow(date)` | 日期 | 資金流入 / 流出族群 |
| `useSectors(date)` | 日期 | 所有族群資料 |
| `useSectorTrend(sectorId, date)` | 族群 ID、日期 | 族群近 N 日漲跌趨勢 |
| `useSectorVolume(sectorId, date)` | 族群 ID、日期 | 族群近 N 日成交量 |
| `useSectorDetail(sectorId, date)` | 族群 ID、日期 | 三大法人買賣超明細 |
| `useSectorFundFlow(sectorId, date)` | 族群 ID、日期 | 族群近 N 日整體資金 |
| `useSectorStocks(sectorId, date)` | 族群 ID、日期 | 族群內個股清單 |
| `useIndexTrend(days, date)` | 天數、日期 | 指數近 N 日趨勢 |
| `useStockPrice(stockId, date, period)` | 個股 ID、日期、期間 | K 線資料 |
| `useStockDetail(stockId, date)` | 個股 ID、日期 | 個股籌碼明細 |
| `useStockFundamental(stockId, date)` | 個股 ID、日期 | 個股基本面資料 |

所有 hook 使用 TanStack Query v5，`staleTime: Infinity`（mock 資料不失效）。同一個 hook 在多個元件呼叫不會產生重複請求。

---

## 四、規則引擎規格

### 4-1 市場格局判斷（`buildMarketRegime`）

位置：`src/utils/marketBrief.ts`

輸入：指數漲跌、廣度（上漲家數比例）、成交量比、資金集中度、強弱族群數量

| 格局 | 觸發條件 |
|---|---|
| 全面轉弱 | 指數 < -0.3%、廣度 < 40%、弱勢族群 ≥ 強勢族群 |
| 擴散型上漲 | 指數 > 0.2%、廣度 ≥ 60%、強勢族群 ≥ 3 個、集中度不高 |
| 指數強廣度弱 | 指數 > 0.2%、廣度 < 50% |
| 集中型上漲 | 指數 > 0.2%、集中度高 |
| 資金輪動 | 流入流出族群均明確，有強有弱 |
| 弱勢反彈 | 指數 > 0、量能 < 1 倍、廣度 < 55% |
| 結構分歧 | 以上皆不符合 |

---

### 4-2 今日研究清單（`buildResearchItems`）

位置：`src/utils/marketBrief.ts`

| 類別 | 觸發條件 | 上限 |
|---|---|---|
| 今日焦點（priority rank=1） | 強勢族群按強度第一名 | 1 |
| 重點觀察（priority rank=2+） | 強勢族群 + 法人連買 ≥ 2 日 + 今日流入 > 20 億 | 2 |
| 資金轉強（turningStrong） | `fundInWeak` 族群 + 法人方向為正 | 2 |
| 風險升高（overheated） | 融資使用率 > 60% 或當沖比 > 45% | 2 |
| 弱勢觀察（weakening） | `weak` 族群 + 法人連賣 ≥ 2 日 | 2 |

每個研究項目包含：`type` / `sectorId` / `sectorName` / `headline` / `reasons[]` / `watchPoint?` / `rank?`

---

### 4-3 族群研究摘要（`buildSectorSummary`）

位置：`src/utils/sectorSummary.ts`

輸入：`Sector` 物件 + 族群內個股清單

| 欄位 | 邏輯摘要 |
|---|---|
| `statusLine` | 依 category（strong/fundInWeak/weak/techStrongNoFund）、breadth、streak 組合 |
| `structureLine` | 廣度% + 法人連買連賣 + 今日流量 |
| `watchLine` | 依領漲股數量、廣度臨界值、族群類別組合 |
| `rolesSummary` | 領漲/補漲/轉弱個股名稱串接 |

---

### 4-4 個股研究摘要（`buildStockSummary`）

位置：`src/utils/stockSummary.ts`

輸入：`Stock` 物件 + sectorName + `StockChip?`（選擇性，晚於初始渲染載入）

| 欄位 | 邏輯摘要 |
|---|---|
| `roleLabel` | 族群名 + 角色中文（領漲股/補漲觀察股/轉弱觀察股/弱勢股） |
| `strengthLine` | RS > 0.5 / 法人流入 / 連買天數 / 集中度高 / 近週延續，最多 3 點以 ｜ 分隔 |
| `riskLine` | 融資 ≥ 70% / 當沖 ≥ 45% / 主力流出 / RS 偏低，以 ；分隔 |
| `watchPoint` | 依優先級：法人連買 → 融資高 → 主力分歧 → 補漲延續 → 轉弱觀察 → 弱勢觀察 → 預設 |

---

### 4-5 四面向評估（`buildStockChecks`）

位置：`src/utils/stockResearch.ts`

| 面向 | 評分輸入 | 結果 |
|---|---|---|
| 趨勢 | RS + 週 / 月 / 季漲跌 | 強 / 中 / 弱 |
| 籌碼 | 法人方向 + 連買天數 + 集中度 - 融資高 - 當沖高 | 支持 / 分歧 / 偏弱 |
| 評價 | P/E + P/B percentileLabel 平均 | 偏低 / 合理 / 偏高 |
| 成長 | ROE + EPS YoY + 營收 YoY | 改善 / 持平 / 衰退 |

四面向合計 positive / risk 數量 → 整體信號（強勢 / 偏強 / 中性 / 偏弱）  
由 `buildAssessmentSummary()` 組合成一句總結（例：「整體偏強，主要由籌碼支持與成長改善帶動，趨勢尚需確認。」）

---

### 4-6 籌碼風險等級（`buildChipRiskLevel`）

位置：`src/utils/stockSummary.ts`

| 等級 | 觸發條件 | 顏色 |
|---|---|---|
| 高 | 融資 ≥ 70% 且當沖 ≥ 45% | 紅 |
| 偏高 | 融資 ≥ 70% 或當沖 ≥ 45% | 橙 |
| 中 | 融資 ≥ 50% 或當沖 ≥ 30% | 黃 |
| 低 | 其餘 | 灰 |

---

### 4-7 法人籌碼解讀（`buildChipInterpretation`）

位置：`src/utils/stockSummary.ts`

| 情境 | 文案 |
|---|---|
| 法人合計買 + 主力買 | 法人與主力同步買超，籌碼結構偏支持 |
| 法人合計買 + 主力賣 | 法人合計買超，但主力大單偏流出，籌碼結構略有分歧 |
| 法人合計賣 + 主力買 | 法人合計賣超，主力大單偏流入，方向尚不一致 |
| 法人合計賣 + 主力賣 | 法人與主力均偏賣出，籌碼壓力較明顯 |

---

## 五、類型系統

### 5-1 核心枚舉

```typescript
// 族群類別（由伺服器計算）
type SectorCategory = 'strong' | 'fundInWeak' | 'techStrongNoFund' | 'weak'

// 個股類別（由伺服器計算）
type StockCategory = 'leader' | 'catchUp' | 'turning' | 'weak'

// 位階標籤（P/E、廣度等歷史分位）
type PercentileLabel = 'veryLow' | 'low' | 'mid' | 'high' | 'veryHigh'

// 今日研究清單類別
type ResearchItemType = 'priority' | 'turningStrong' | 'overheated' | 'weakening'

// 市場格局類別
type MarketRegimeType =
  | 'broadAdvance' | 'concentratedAdvance' | 'indexStrongBreadthWeak'
  | 'rotation'     | 'weakRebound'         | 'broadWeakness' | 'divergent'
```

### 5-2 Stock 物件關鍵欄位

```typescript
type Stock = {
  stockId: string
  stockName: string
  change: number            // 今日漲跌幅 %
  relativeStrength: number  // 相對族群強弱（RS）
  institutionalFlow: number // 法人今日買賣超（億）
  institutionalStreak: number // 正=連買天數，負=連賣天數，0=今天換方向
  volume: number
  category: StockCategory
  concentration: number     // 大單集中度 0–100
  weekChange: number        // 近 5 日累計 %
  monthChange: number       // 近 20 日累計 %
  quarterChange: number     // 近 60 日累計 %
  marginRatio: number       // 融資使用率 0–100
  shortRatio: number        // 券資比 0–100
  daytradingRatio: number   // 當沖比 0–100
}
```

---

## 六、顏色規範

| 用途 | 顏色 | Tailwind | Hex |
|---|---|---|---|
| 上漲 / 正面 / 買超 | 紅 | `text-red-400` | `#f87171` |
| 下跌 / 負面 / 賣超 | 綠 | `text-green-400` | `#4ade80` |
| 中性 | 灰 | `text-zinc-400` | — |
| 融資中度風險 | 黃 | `text-yellow-400` | — |
| 雙重籌碼風險 | 橙 | `text-orange-400` | — |
| K 線漲 | 紅 | — | `#f87171` |
| K 線跌 | 綠 | — | `#4ade80` |
| 流量 bar 正 | 紅 | — | `#f87171` |
| 流量 bar 負 | 綠 | — | `#4ade80` |
| 連買 badge | 紅底 | `bg-red-900/60 text-red-400` | — |
| 連賣 badge | 綠底 | `bg-green-900/60 text-green-400` | — |

> **特例**：基本面估值（`fundamental.ts`）中，PE/PB「偏低」用藍色（`text-blue-400`）代表「低估值」，與方向性顏色語義不同，屬獨立設計，不調整。

---

## 七、元件架構

### 7-1 Block 命名對應

| Block | 說明 |
|---|---|
| BlockA | 大盤廣度指標（上漲家數、高低家數） |
| BlockB | 盤後決策卡 + 今日研究清單 |
| BlockC | 資金流向 / 法人連買連賣 |
| BlockD | 產業熱力圖 + 個股篩選器 |
| BlockE | 族群個股表格（含 StockDetailPanel 側欄） |
| BlockF | 個股區間表現圖 |
| BlockG | 多股比較圖 |
| BlockH | 個股法人趨勢圖 |

### 7-2 純工具函式（`src/utils/`）

| 檔案 | 主要匯出 |
|---|---|
| `marketBrief.ts` | `buildMarketBrief()` → 含格局判斷、研究清單、資金摘要 |
| `sectorSummary.ts` | `buildSectorSummary()` → 族群三段摘要 |
| `stockSummary.ts` | `buildStockSummary()` / `buildChipRiskLevel()` / `buildChipRiskLine()` / `buildChipInterpretation()` |
| `stockResearch.ts` | `buildStockChecks()` / `getStockRank()` |
| `percentile.ts` | `getPercentileColor()` / `getPercentileLabelZh()` |
| `fundamental.ts` | `fundamentalMetricColor()` |
| `copyFormat.ts` | 中文標籤對照表（族群/個股類別等） |

---

## 八、已知限制

| 項目 | 說明 |
|---|---|
| 資料來源 | 目前全為 mock，需串接真實 API |
| 無登入 / 個人化 | 無法儲存觀察清單或自訂條件 |
| 基本面顏色例外 | PE/PB 低估用藍色，未遵循正紅負綠 |
| 測試覆蓋 | 僅 pure utils 有測試，元件未測試 |

---

## 九、Roadmap

### P0（已完成）

- 首頁三層架構：盤後決策卡 + 研究清單 + 熱力圖
- 族群研究頁：摘要 + 走勢圖 + 三大法人 + 籌碼警示
- 個股研究頁：摘要 + 四面向 + 族群角色 + K 線 + 籌碼風險 + 法人解讀
- 全站顏色統一（紅漲綠跌）

### P1（規劃中）

- 分類 badge 加 tooltip 說明
- 基本面加一句總結句
- 法人籌碼分區視覺整理
- 熱力圖 hover 強化

### P2（之後）

- AI 改寫摘要文字
- 個人化觀察清單
- 歷史訊號回測
- 警示推播

---

## 十、開發相關

### 技術棧

- React 19 + TypeScript
- Tailwind CSS v4（CSS-first，無 `tailwind.config.js`，入口 `src/styles/index.css`）
- TanStack Query v5
- Recharts（K 線、走勢圖、長條圖）
- Vite + Vitest

### 常用指令

```bash
npm run dev                                    # 開發伺服器（hot reload）
npm run build                                  # tsc -b && vite build
npm test                                       # vitest run
npx tsc -p tsconfig.app.json --noEmit         # 型別檢查
npx vitest run src/__tests__/xxx.test.ts      # 單一測試檔
```

### 測試原則

- Pure utils（`src/utils/`）需有單元測試，測試資料與 mock 資料分離
- 元件不測試（UI 正確性以目視驗證）

---

*資料僅供研究參考，不構成任何投資建議。*
