# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Vite dev server (hot reload)
npm run build        # tsc -b && vite build
npm test             # vitest run (all tests, once)
npx vitest run src/__tests__/marketBrief.test.ts   # single test file
npx tsc --noEmit     # type-check only (resolves via tsconfig.app.json)
```

> `tsc --noEmit` uses the root `tsconfig.json` which sets `"files": []`; if you get no errors but suspect a real type issue, run `npx tsc -p tsconfig.app.json --noEmit` instead.

## Architecture

**Navigation** — No React Router. `App.tsx` drives the entire navigation tree via `useState` (`selectedSector`, `selectedStock`). Switching states unmounts/remounts pages; no URL changes.

**Data layer** — All fetches go through `src/services/index.ts`, which currently returns mock data with artificial `setTimeout` delays. Swapping in a real API requires only editing this file.

**Hooks** — One TanStack Query hook per data type in `src/hooks/`. Every query uses `staleTime: Infinity` (mock data never goes stale). Query keys follow `[resource-name, id, date]`.

**Types** — `src/types/index.ts` is the single source of truth. Key enums:
- `PercentileLabel`: `veryLow | low | mid | high | veryHigh` — drives all color coding via `src/utils/percentile.ts`
- `SectorCategory`: `strong | fundInWeak | techStrongNoFund | weak` — quadrant classification from the server

**Block naming** — Components `BlockA`–`BlockH` correspond directly to section IDs in `spec/PRD.md`. `BlockB` is the full-width collapsible market brief at the top of the main page.

**Pure rule engines** — Derived/computed data lives in `src/utils/`, never in hooks or components:
- `src/utils/marketBrief.ts` — `buildMarketBrief()` computes `MarketBriefData` from 4 API responses (strong/weak sectors, contradictions, fund flow summary)
- `src/utils/percentile.ts` — `getPercentileColor()` / `getPercentileLabelZh()` map `PercentileLabel` → Tailwind class / Chinese label
- `src/utils/fundamental.ts` — `fundamentalValueColor()` maps `PercentileLabel` → color for P/E, P/B, ROE metrics

**Styling** — Tailwind CSS v4 (CSS-first config). Entry point is `src/styles/index.css` with `@import "tailwindcss"`. No `tailwind.config.js`.

**Tests** — Vitest, `environment: 'node'`. Tests live in `src/__tests__/`. Test pure utils and service functions; components are not tested.
