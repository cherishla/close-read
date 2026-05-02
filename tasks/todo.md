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
