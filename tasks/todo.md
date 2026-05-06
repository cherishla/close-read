# TODO

依優先順序排列。Tasks A → E，A 無依賴可立即開始，C/E 有前置條件。

---

## Task A — SectorPage 三欄整合（無依賴，立即可做）✅

**檔案：** `src/pages/SectorPage.tsx`

### 變更

- [x] 加入 `const [selectedStock, setSelectedStock] = useState<Stock | null>(null)`
- [x] import `StockDetailPanel` from `../components/blocks/BlockE/StockDetailPanel`
- [x] 版面：`lg:grid-cols-[280px_1fr]` → `xl:grid-cols-[280px_minmax(300px,1fr)_320px]`
- [x] 渲染第三欄：`<StockDetailPanel stock={selectedStock} date={date} sectorStocks={...} onOpenStock={onOpenStock} />`
- [x] `onSelectStock` 改為 toggle：相同股票再次點擊則 `setSelectedStock(null)`
- [x] `<BlockE>` 傳入 `selectedStock={selectedStock}` + `onSelectStock`
- [x] `< xl` 時：`selectedStock` 不為 null 則在中欄下方顯示 StockDetailPanel

### 驗收

- [x] xl 三欄同時可見（280px + 1fr + 320px）
- [x] 點個股 → panel 即時更新，不跳頁
- [x] 再次點同列 → 面板回到「← 點選個股查看詳情」
- [x] 族群排名 `#2/8` 正確顯示
- [x] 選中列 `border-l-zinc-400` 高亮
- [x] 「完整分析 →」仍可跳 StockPage
- [x] `npx tsc --noEmit` 無錯誤

---

## Task B — 狀態摘要 spec（無依賴，需寫 spec）

**產出物：** `spec/PRD.md` 第 11 節更新，或獨立 `spec/state-summary.md`

- [ ] 定義市場層觸發條件、輸入資料、輸出格式、快取策略
- [ ] 定義族群層輸入資料（近 20 日 RS 趨勢 + 買賣超 + 廣度）、輸出格式
- [ ] 定義個股層輸入資料（相對強弱 + 法人 + 集中度）、輸出格式
- [ ] 定義 API schema（三層各一個 endpoint 或共用一個加 type 參數）
- [ ] 定義失敗行為（快取評語 fallback，顯示產生時間）

---

## Task C — 狀態摘要 UI（依賴：Task B spec + 後端接入）

**檔案：**

- `src/components/blocks/BlockA/StateSummarySlot.tsx`（強化現有元件）
- `src/pages/SectorPage.tsx`（加族群層 slot）
- `src/components/blocks/BlockE/StockDetailPanel.tsx`（加個股層 slot）
- `src/pages/StockPage.tsx`（加個股層 slot）

### 驗收

- [ ] BlockA 下方顯示市場狀態摘要（穩定輸出，非 optional）
- [ ] SectorPage sub-header 下方顯示族群狀態摘要
- [ ] StockDetailPanel 顯示個股狀態摘要
- [ ] Loading：單行 skeleton
- [ ] 快取 fallback：顯示評語 + 右下角產生時間（`09:30 更新`）
- [ ] 三個位置的 error 互相獨立，不影響其他 block

---

---

## 消費者化轉型 Sprint 1 — 懶人包完整化

### T1：BlockB UI 完成

- [ ] 收合 preview 顯示：廣度分數 / 主線族群 / 熱門族群數 / 異常訊號數
- [ ] 展開顯示五區塊（新命名）：大盤狀態 / 今日資金主線 / 熱門押注族群 / 降溫族群 / 今日異常訊號
- [ ] 各區塊錯誤可獨立重試
- [ ] `npx tsc --noEmit` 無錯誤

### T2：市場劇本分類

- [ ] 新增 `src/utils/marketScenario.ts`，`buildMarketScenario(brief): MarketScenario`
- [ ] 七種劇本規則（全面擴散 / 資金集中 / 指數撐盤 / 弱中透強 / 資金輪動 / 高檔分歧 / 量縮觀望）
- [ ] Unit test 覆蓋七種劇本輸入

### T3：懶人包 narrative 卡片

- [ ] BlockB 展開頂部加結構化摘要卡片
- [ ] 四區塊：市場劇本 / 今日主線 / 今日異常 / 明日優先觀察（最多 3 個族群）
- [ ] 所有文字無多空結論、無預測語言

---

## 消費者化轉型 Sprint 2 — 刺激感功能

### T4：資金熱度榜

- [ ] BlockC 加熱度分數欄位
- [ ] 排行 Top 5：熱度分數 + 法人 + 廣度
- [ ] 點擊族群可進入 SectorPage

### T5：明日觀察清單

- [ ] 新 section（BlockB 最底部或獨立 card）
- [ ] 三組：A. 主線延續 B. 資金異常 C. 風險降溫
- [ ] 每組 2–3 族群 + 族群核心股命名（核心股 / 跟漲股 / 轉弱股 / 弱勢股）

### T6：異常雷達升級

- [ ] 新增 `volumeSurgeNoBreadth`、`indexUpButSmallCapLag` 兩種分類
- [ ] 每條異常附說明文字，無多空詞彙
- [ ] Unit test 覆蓋新分類規則

---

## 消費者化轉型 Sprint 3 — 快速查詢

### T7：股票清單服務

- [ ] `fetchStockIndex(): Promise<StockIndexEntry[]>` 加入 `src/services/index.ts`
- [ ] Mock 涵蓋現有 18 支股票 + 所有族群
- [ ] `useStockIndex()` hook

### T8：PageHeader 全局搜尋

- [ ] `src/components/layout/PageHeader.tsx` 加搜尋 input
- [ ] 下拉分族群/個股兩組，fuzzy match
- [ ] 鍵盤支援（↑↓ / Enter / Esc）
- [ ] SectorPage / StockPage 也可用

---

## 消費者化轉型 Sprint 4 — 模式切換 + 付費標記

### T9：懶人/專業模式切換

- [ ] Header 右上 toggle（懶人 / 專業）
- [ ] 懶人模式：BlockA/C/D/G 縮小，BlockB + 觀察清單 + 熱度榜為主
- [ ] localStorage 記憶切換狀態

### T10：付費功能標記

- [ ] 觀察清單 / 異常雷達 / 市場劇本加 `PRO` badge
- [ ] 點擊顯示升級說明 modal（placeholder 文字即可）

### T11：命名全面改版

- [ ] 依命名表更新所有 section headers
- [ ] 更新 BlockB preview 文字
- [ ] 更新相關 tests 字串

---

## Task D — 個股基本面資料確認 ✅（前端 mock 部分完成）

- [ ] 確認後端是否有 P/E 當期值 + 10年歷史序列（待後端確認）
- [ ] 確認後端是否有 P/B 當期值 + 10年歷史序列（待後端確認）
- [ ] 確認後端是否有 ROE%（近四季）（待後端確認）
- [ ] 確認後端是否有 EPS TTM YoY（待後端確認）
- [ ] 確認後端是否有營收 TTM YoY（待後端確認）
- [x] 定義 `/stock-fundamental?stockId=X&date=YYYY-MM-DD` API schema（`StockFundamentalResponse` type）
- [x] 建立 mock 資料（`src/mocks/stockFundamental.mock.ts`）

---

## Task E — StockPage 基本面概覽 ✅

**檔案：** `src/pages/StockPage.tsx`、`src/hooks/useStockFundamental.ts`

在現有三組指標卡（今日族群定位 / 區間表現 / 籌碼風險）後加入「基本面概覽」：

- [x] 新增 `useStockFundamental(stockId, date)` hook
- [x] StockPage 加入基本面指標區塊（P/E + P/B + ROE + EPS YoY + 營收 YoY）
- [x] 每個指標顯示當前值 + 歷史位階色彩（藍/灰/橙/紅）
- [x] Loading：skeleton cards
- [x] 無資料時整個 section 不渲染（不顯示空框）
- [x] `npx tsc --noEmit` 無錯誤
