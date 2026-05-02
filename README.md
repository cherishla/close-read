# 台股盤後決策系統

盤後市場研究中心（Market Research Hub）——幫助個人投資者在收盤後快速完成 Top-down 分析：大盤 → 資金 → 族群 → 個股。

> 工具只提供資料與歷史位置感，判斷由使用者自己做。不給買賣建議，不預測股價。

---

## 功能

| 畫面 | 功能 |
| --- | --- |
| **主頁** | 大盤廣度、指數趨勢、資金流向排行、族群熱力圖、今日新聞、盤後研究摘要 |
| **族群頁** | RS 趨勢、法人買賣超走勢、廣度分析、個股三 Tab 分類（今日/區間/籌碼）、右側個股快速預覽 |
| **個股頁** | 20 日 K 線 + 量、法人籌碼細節、基本面概覽（P/E、P/B、ROE、EPS/營收年增率）、相關新聞 |

所有關鍵數字旁邊都會顯示歷史百分位標籤（偏低 / 中位 / 偏高 / 極高）。

---

## 開發

```bash
npm run dev      # 啟動 Vite dev server
npm run build    # 型別檢查 + 編譯
npm test         # 執行所有測試
npx vitest run src/__tests__/marketBrief.test.ts  # 單一測試檔
```

---

## 技術棧

- **React 19** + **TypeScript** + **Vite 6**
- **TanStack Query v5** — 所有 server state，`staleTime: Infinity`
- **Tailwind CSS v4** — CSS-first（`src/styles/index.css`），無 `tailwind.config.js`
- **Recharts v3** — K 線、折線、熱力圖
- **Vitest** — 純 util 與 service 函式的單元測試

目前所有資料由 `src/services/index.ts` 的 mock 函式提供，替換成真實 API 只需修改這一個檔案。

---

## 專案結構

```
src/
  components/blocks/   # BlockA–H，對應 PRD 區塊編號
  pages/               # SectorPage、StockPage
  hooks/               # 每種資料類型一個 TanStack Query hook
  services/            # 所有 API 呼叫（目前為 mock）
  utils/               # 純函式：marketBrief、percentile、fundamental
  types/               # 單一 types/index.ts，全域型別來源
  mocks/               # Mock 資料
```

導覽邏輯在 `App.tsx` 以 `useState` 管理（`selectedSector` / `selectedStock`），不使用 React Router。
