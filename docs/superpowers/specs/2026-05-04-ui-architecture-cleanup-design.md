# UI Architecture Cleanup Design

## Goal

整理目前 Astro 站點的 UI 框架，保留 Kóng 台語 跳Swing 的手作復古品牌感，同時降低頁面內重複 CSS 與重複 markup，讓後續維護按鈕、頁首、卡片、表單與資訊區塊時更穩定。

## Scope

- 保留現有 routes、Cloudflare Pages 設定、`build.format: "file"`、字型 token、inline style/script 輸出契約與 regression tests。
- 新增共享 Astro components，處理低風險且重複的 UI：page hero、section heading、button link、stat grid、info card grid、contact form、contact channels。
- 將跨頁重複的 UI 樣式搬到 `src/styles/global.css`，頁面只保留該頁專屬 layout、資料與互動樣式。
- 不重寫品牌視覺，不重建資訊架構，不改 API 行為。

## Architecture

`BaseLayout.astro` 繼續注入 `global.css?raw`，維持 raw HTML regression checks。共享元件只輸出 HTML 結構與 class，不引入外部 client bundle。互動頁面仍把必要 script 放在頁面 `afterBody` slot，避免改變目前測試與 Cloudflare Pages 行為。

## Components

- `PageHero.astro`: 子頁共用頁首，支援 kicker、title、hand text、lede，以及深色 FAQ 變體。
- `SectionHeader.astro`: 首頁分段標題，支援右側 meta 內容。
- `ButtonLink.astro`: 統一主要、次要、ghost 連結按鈕。
- `StatGrid.astro`: 關於區共用數字資訊。
- `InfoCardGrid.astro`: TODO / 後續內容卡片。
- `ContactForm.astro`: 聯絡表單 markup，保留原本欄位 id/name 與 JS contract。
- `ContactChannels.astro`: 聯絡渠道列表。

## Testing

先擴充 `tests/site-regression.test.mjs`，要求共享元件檔存在、built CSS 含共享 UI class、以及 contact form contract 仍存在。之後跑 `npm test` 驗證 Astro build 與 regression checks。
