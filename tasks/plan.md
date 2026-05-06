# 台股盤後決策系統 — 產品計畫

> 更新：2026-05-02
> 美股 spec 僅作規格設計參考，不在本 repo 實作範圍。

---

## 一、產品目標摘要（源自 spec/專案目標.md v2.0）

**使用者**：每日收盤後自主研究台股的個人投資者

**核心體驗**：快速掃描（3–5 分鐘）+ 深入研究（不限時）兩段式流程

**研究完成的定義**：使用者能清楚回答五個問題：

1. 今天大盤健不健康？
2. 資金在往哪裡跑？
3. 這個族群近期是轉強還是轉弱？
4. 族群裡哪些個股值得進一步研究？
5. 這支股票有沒有足夠的支撐（籌碼 + 基本面）？

---

## 二、V1 產品原則

V1 是**狀態呈現工具，不是交易決策系統**。

不做的事：不提供買賣建議、不輸出多空結論作為訊號、不做個股推薦排名、不預測股價走向。

提供的是：客觀呈現市場狀態、每個數字附歷史百分位、點出異常供使用者判斷、狀態摘要描述狀態（不給方向）。

---

## 三、研究漏斗（每個畫面的存在意義）

```
主頁
  ├── BlockB：今天整體情況如何？（盤後研究摘要 — 規則引擎生成）← Sprint 2 新增
  ├── BlockA：大盤健不健康？（廣度 + 百分位）
  ├── BlockC + BlockD：資金往哪裡跑？（族群流向 + 熱力圖）
  ├── BlockG：大盤趨勢脈絡（加權/上櫃/台指期）
  └── 點族群格子
         ↓
SectorPage
  ├── SectorStats：族群轉強還是轉弱？（RS 折線 + 買賣超 + 廣度）
  ├── SectorPerfChart：量能是否配合走勢？
  ├── BlockE 三 Tab：族群內哪些個股值得研究？
  └── 點個股列 → 右側 StockDetailPanel 即時更新
         ↓
StockDetailPanel（族群頁右欄）
  ├── 族群排名 + 相對強弱：確認個股在族群中的位置
  ├── 籌碼摘要：初步確認資金結構
  └── 點「完整分析 →」
         ↓
StockPage
  ├── K 線 + 量：走勢延續性確認
  ├── 籌碼（法人/主力/大單/融資券）：回答問題五（籌碼面）
  ├── 基本面概覽（P/E + P/B + ROE 等）：回答問題五（基本面）
  └── 相關新聞：事件背景補充
```

---

## 四、各畫面回答什麼問題

| 畫面 | 使用者要回答的問題 | 主要元件 |
| ---- | ------------------ | -------- |
| 主頁 BlockB | 今天整體情況如何？從哪個方向開始研究？ | BlockB 盤後研究摘要 |
| 主頁其他 | 今天市場健不健康？資金往哪裡跑？ | BlockA / BlockC / BlockD / BlockG |
| SectorPage | 這個族群是轉強還是轉弱？內部結構健康嗎？ | SectorStats / SectorPerfChart / BlockE |
| StockDetailPanel | 這檔是否值得進一步研究？ | 個股摘要 / 籌碼摘要 / 族群排名 |
| StockPage | 這檔是否有完整支撐？ | K 線 / 籌碼 / 新聞 / 基本面 |

---

## 五、已完成功能

| 功能 | spec 來源 | 狀態 |
| ---- | --------- | ---- |
| 主頁四欄佈局（BlockA / BlockG+D / BlockC+H）| PRD.md §5 | ✅ |
| BlockA 市場總覽（narrative + breadthScore + 百分位）| PRD.md §5 | ✅ |
| BlockC 資金流向（流入/流出 Top5 + 集中度）| PRD.md §5 | ✅ |
| BlockD 族群熱力圖（多指標切換 + 四象限角標 + hover tooltip）| PRD.md §5 | ✅ |
| BlockG 指數趨勢比較（加權/上櫃/台指期，20/60日切換）| PRD.md §5 | ✅ |
| BlockH 市場新聞（卡片列）| PRD.md §5 | ✅ |
| SectorPage 麵包屑 + 族群 sub-header | PRD.md §5 | ✅ |
| SectorStats 左欄（RS 折線 + 買賣超 Bar + 廣度 + 三大法人）| PRD.md §5 | ✅ |
| SectorPerfChart 量價合一圖 | sector-page-enhancements.md v1.1 | ✅ |
| BlockE 三 Tab（今日概覽 / 區間表現 / 籌碼風險）+ 排序 | sector-page-enhancements.md v1.2 | ✅ |
| SectorPage 三欄整合（StockDetailPanel 右欄 + toggle 選取）| Task A | ✅ |
| StockPage 個股頁（K線 + 籌碼 + 新聞）| PRD.md §5 | ✅ |
| StockPage 基本面概覽（P/E + P/B + ROE + EPS/Rev YoY + 歷史位階）| Task E | ✅ |
| StateSummarySlot 元件（市場層已接入 BlockA）| Task C 部分 | ✅ 市場層完成 |

---

## 六、任務執行順序

```
Task A（SectorPage 三欄）   → ✅ 完成
Task D（基本面 API 確認）   → ✅ 前端 mock 完成，後端串接待確認
Task E（StockPage 基本面）  → ✅ 完成（mock 驅動）
Task F（BlockB 盤後摘要）   → Sprint 2 主任務，立即可做（不依賴後端）
Task B（狀態摘要 spec）     → 與 F 並行，寫 spec 不急著做 UI
Task C（狀態摘要 UI）       → 依賴 Task B spec + 後端接入
```

---

## 七、資料可用性分級

| 資料 | 分級 | 說明 |
| ---- | ---- | ---- |
| 三大法人買賣超 | 已有，可直接做 | 目前 mock 已有，串接後直接用 |
| 個股籌碼（主力/大單/融資券）| 已有，可直接做 | StockPage 已使用 |
| 族群 RS 走勢 / 買賣超 | 已有，可直接做 | SectorStats 已使用 |
| K 線價量資料 | 已有，可直接做 | StockPage 已使用 |
| 大盤廣度 / 量能 / 集中度 | 已有，可直接做 | BlockB 直接使用 |
| 族群分類（strong/weak/fundInWeak/techStrongNoFund）| 已有，可直接做 | BlockB 直接使用 |
| 個股 P/E 當期值 | 有資料但需後端整理 | 需確認歷史序列是否可算百分位 |
| 個股 P/B 當期值 | 有資料但需後端整理 | 同上 |
| ROE%（近四季）| 有資料但需後端整理 | 財報資料需聚合 |
| EPS 年增率 TTM YoY | 有資料但需後端整理 | 需兩期四季加總比較 |
| 營收年增率 TTM YoY | 有資料但需後端整理 | 同上 |
| 狀態摘要（AI）| 不確定，需確認 | 後端 LLM 接入方式待定；規則版先頂替 |
| 主力分點明細 | V1 不做 | 複雜度高，排後續 |

---

## 八、Sprint 1 — SectorPage 研究閉環（Task A）✅ 完成

Task A 已完成。SectorPage 在 xl 寬度下呈現三欄（280px + 1fr + 320px），點個股列更新右側 StockDetailPanel，再次點擊同列取消選取，< xl 時面板追加於中欄下方。

---

## 九、Sprint 2 — 盤後快速掃描閉環（Task F）

**Sprint 目標**：使用者打開主頁後，在 30 秒內能知道「今天整體狀況如何、從哪個方向開始研究」，不需要自己逐格拼湊 BlockA / BlockC / BlockD 的數字。

**核心設計**：BlockB 是一個**純規則引擎**，把主頁已有的四個資料源整合成結構化文字摘要。不需要後端新 API，所有資料已在主頁 hooks 中取得。規則版先上，底部預留 `StateSummarySlot` 供之後替換成 LLM。

**確認的設計決策**：
- 位置：橫跨主頁**全寬**，在主頁最上方、step indicator 和三欄 grid 之前
- 預設**收合**，顯示單行摘要（廣度 + 流入 top1 + 強勢族群數），點擊展開
- 矛盾觀察為空時**整個區塊不顯示**

### 完成後的畫面狀態

BlockB 放在主頁最上方，純文字 + 色塊，不加圖表：

```
┌──────────────────────────────────────────────────┐
│ B｜盤後研究摘要                                   │
│                                                   │
│ 大盤狀態                                          │
│  廣度 72  [偏高]   量能 0.9x  [略縮]   集中度 [偏高] │
│                                                   │
│ 資金方向                                          │
│  流入：半導體 +24億 · 電子零組件 +18億 · 金融 +8億  │
│  流出：航運 −12億 · 生技 −8億 · 紡織 −5億          │
│  資金集中度 [偏高] → 資金向少數族群集中              │
│                                                   │
│ 強勢族群（最多 3 個）                              │
│  ● 半導體  +2.3%  法人 +24億  廣度 78%            │
│  ● 伺服器  +1.8%  法人 +18億  廣度 71%            │
│                                                   │
│ 弱勢族群（最多 3 個）                              │
│  ● 航運  −1.2%  法人 −12億  廣度 28%              │
│                                                   │
│ ⚡ 矛盾觀察                                        │
│  生技：資金流入但走勢弱，廣度僅 31%，需觀察          │
│  電動車：技術面偏強，但法人買超偏弱，籌碼存疑         │
│                                                   │
│ [狀態摘要預留區 ← 未來替換為 LLM]                  │
└──────────────────────────────────────────────────┘
```

### 資料來源（全部已有）

| 區塊 | 資料來源 | hook |
| ---- | -------- | ---- |
| 大盤狀態 | breadthScore + volume20MA + concentration | `useMarketStructure` + `useMarketSummary` |
| 資金方向 | inflow / outflow top3 + concentrationLabel | `useFundFlow` |
| 強勢族群 | `sector.category === 'strong'`（最多 3） | `useSectors` |
| 弱勢族群 | `sector.category === 'weak'`（最多 3） | `useSectors` |
| 矛盾觀察 | `'fundInWeak'`（資金入但走勢弱）+ `'techStrongNoFund'`（技術強無法人） | `useSectors` |

### 矛盾觀察文字規則

| category | 顯示描述 |
| -------- | -------- |
| `fundInWeak` | `{族群名}：資金流入但走勢偏弱，廣度僅 {breadth}%，需觀察是否底部` |
| `techStrongNoFund` | `{族群名}：技術面偏強，但法人買超偏弱，籌碼支撐存疑` |

### 改動範圍

| 檔案 | 說明 |
| ---- | ---- |
| `src/utils/marketBrief.ts`（新增）| 純函式規則引擎，輸入四個 response 型別，輸出 `MarketBriefData` |
| `src/components/blocks/BlockB/BlockB.tsx`（新增）| UI 元件，使用已有 hooks |
| `src/App.tsx`（修改）| 在 BlockA 下方加入 `<BlockB date={date} />` |

### 驗收條件

- [ ] 大盤狀態三格顯示廣度分數 + 百分位標籤、量能倍率、集中度
- [ ] 資金方向流入/流出各顯示 top 3
- [ ] 強勢族群最多 3 個，顯示名稱 + 漲跌 + 法人 + 廣度
- [ ] 弱勢族群最多 3 個，同上
- [ ] 矛盾觀察依 `fundInWeak` / `techStrongNoFund` 顯示對應描述文字
- [ ] 無強勢/弱勢時，該區塊顯示「今日無明顯 X 族群」而非空白
- [ ] 無矛盾觀察時，整個矛盾觀察區塊不顯示
- [ ] 四個資料任一 loading 中，顯示 skeleton
- [ ] 任一資料 error 獨立顯示，不影響其他 Block
- [ ] `src/utils/marketBrief.ts` 純函式有單元測試覆蓋
- [ ] `npx tsc --noEmit` 無錯誤

---

## 十、Task B — 狀態摘要 spec

**完成後的畫面狀態**：每個層次進入時，固定顯示一個淡色文字區塊，描述當前狀態。不是 optional，不是彈出，是頁面固定的一部分。

### 三個接入位置

| 層次 | 位置 | 輸入資料 | 輸出格式 |
| ---- | ---- | -------- | -------- |
| 市場 | BlockA narrative 下方 | breadthScore、advanceRatio、concentration、新高低家數 | 2–3 句，點出今日最值得注意的一件事 |
| 族群 | SectorPage sub-header 下方 | 近 20 日 RS 趨勢、整體買賣超方向、廣度變化 | 1–2 句，說明族群動能狀態 |
| 個股 | StockDetailPanel + StockPage 頂部 | 相對強弱趨勢、外資/投信方向、大單集中度 | 1–2 句，說明籌碼結構 |

### 設計規則

- 穩定輸出，每次進入對應層次必定顯示
- AI 服務失敗：顯示最近一次快取評語 + 產生時間（不顯示空白）
- 語言：描述狀態，不做「應該買/賣」建議

---

## 十一、Task C — 狀態摘要 UI 實作（依賴 Task B spec + 後端）

**改動範圍**：

- `src/components/blocks/BlockA/StateSummarySlot.tsx`（強化現有元件）
- `src/pages/SectorPage.tsx`（加族群層 slot）
- `src/components/blocks/BlockE/StockDetailPanel.tsx`（加個股層 slot）
- `src/pages/StockPage.tsx`（加個股層 slot）

**驗收**：

- [ ] 三層狀態摘要各自顯示在正確位置
- [ ] Loading：單行 skeleton
- [ ] 快取 fallback：顯示評語 + 右下角產生時間（`09:30 更新`）
- [ ] 三個位置的 error 互相獨立，不影響其他 block

---

## 十二、消費者化轉型計畫（v2，2026-05-04 新增）

**策略**：不削減研究深度，在上方加一層「懶人包 + 刺激感」入口層。

**三層架構**：

```
第一層：懶人包（今天發生什麼、主線在哪、市場劇本）
第二層：刺激感（熱度榜、異常雷達、明日觀察清單）
第三層：研究證據（現有功能不動）
```

**命名改版**：

| 原名 | 新名 |
|---|---|
| 盤後研究摘要 | 今日盤後懶人包 |
| 資金流向 | 今日資金主線 |
| 強勢族群 | 今日熱門押注族群 |
| 弱勢族群 | 今日降溫族群 |
| 矛盾觀察 | 今日異常訊號 |
| 今日市場新聞 | 影響今日主線的新聞 |

### Sprint 1 — 懶人包完整化

**T1：BlockB UI 完成**（已有 hooks + utils，補 UI）
收合 preview：廣度分數 / 主線族群 / 熱門族群數 / 異常訊號數。
展開五區塊：大盤狀態 / 今日資金主線 / 熱門押注族群 / 降溫族群 / 今日異常訊號。

**T2：市場劇本分類**
新增 `buildMarketScenario(briefData): MarketScenario`，純 rules-based。
七種劇本從現有 breadthScore / volumeRatio / concentration 推導：全面擴散 / 資金集中 / 指數撐盤 / 弱中透強 / 資金輪動 / 高檔分歧 / 量縮觀望。

**T3：懶人包 narrative 卡片**
BlockB 展開頂部加結構化摘要（rules-based 文字，非 AI）：市場劇本 + 今日主線 + 今日異常 + 明日優先觀察。

### Sprint 2 — 刺激感功能

**T4：資金熱度榜**（擴展 BlockC）
加熱度分數 `heat = volume × institutionalFlow × breadth`（歸一化），Top 5 排行。

**T5：明日觀察清單**
三組（主線延續 / 資金異常 / 風險降溫），每組 2–3 族群 + 族群核心股。
命名：領漲股 → 族群核心股；補漲股 → 族群跟漲股；轉弱股 → 族群轉弱股。

**T6：異常雷達**（升級矛盾觀察）
現有兩種 + 新增兩種：volumeSurgeNoBreadth / indexUpButSmallCapLag。
每條附「異常描述 + 值得注意的原因」，無多空方向。

### Sprint 3 — 快速查詢入口

**T7：可搜尋股票清單服務**
`fetchStockIndex()` → `StockIndexEntry[]`，hook `useStockIndex()`。

**T8：PageHeader 全局搜尋列**
fuzzy match（stockId / stockName / sectorName），結果分族群/個股兩組，選擇直接導航。
鍵盤支援：↑↓ 選擇，Enter 跳入，Esc 關閉。

### Sprint 4 — 模式切換 + 付費架構標記

**T9：懶人/專業模式切換**
Header 右上 toggle；懶人模式預設顯示懶人包 + 觀察清單 + 熱度榜；localStorage 記憶。

**T10：付費功能標記**
觀察清單 / 異常雷達 / 市場劇本加 `PRO` badge，點擊顯示升級說明 modal（placeholder），不做真實 paywall。

**T11：命名全面改版**
依命名表更新所有 section headers、preview 文字、tests。

### Dependency Graph

```
T1 → T2 → T3 (懶人包三步)
T4 ← 現有 sectors + flow data
T5 ← 現有 strong/weak + stockCategory
T6 ← 現有 contradictions + 新分類
T7 → T8 (搜尋兩步)
T9 / T10 / T11 — 獨立
```

---

## 十三、Task D — 個股基本面資料確認（與 Task A 並行）

**前端部分已完成**：`StockFundamentalResponse` 型別已定義，mock 資料已建立（18 支個股），`useStockFundamental` hook 已完成，StockPage 基本面概覽已可用（mock 驅動）。

**待後端確認項目**：

| 指標 | 計算方式 | 分級（待填）|
| ---- | -------- | ----------- |
| P/E 本益比 | 總市值 / 近四季稅後淨利 | 待確認 |
| P/E 歷史位階 | 當期 PE 在 10 年歷史分佈的百分位 | 待確認 |
| P/B 股價淨值比 | 總市值 / 股東權益 | 待確認 |
| ROE% | 近四季稅後淨利 / 股東權益 | 待確認 |
| EPS 年增率 | TTM EPS vs 去年同期 | 待確認 |
| 營收年增率 | TTM 營收 vs 去年同期 | 待確認 |

---

## 十三、Task E — StockPage 基本面概覽 ✅ 完成

StockPage 第四組指標卡已加入，五個指標（P/E / P/B / ROE / EPS YoY / 營收 YoY）顯示當前值 + 歷史位階色彩（藍/灰/橙/紅）+ 百分位中文標籤。無資料時整個 section 不渲染。目前以 mock 資料驅動，等 Task D 後端確認後直接串接。
