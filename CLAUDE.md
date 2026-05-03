# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is the **Kóng台語 跳Swing** landing site. The repository root is the active Astro + Cloudflare Pages app. Work from this directory unless the user explicitly asks you to create a separate git worktree.

```
src/
  layouts/
    BaseLayout.astro     # shared document shell, metadata, nav/footer, shared scripts
  components/
    Nav.astro            # shared top navigation and home language switcher
    Footer.astro         # shared footer variants
  pages/
    index.astro          # home page
    vocabulary.astro     # vocabulary reference page
    events.astro         # events listing page
    api/health.ts        # Cloudflare SSR health endpoint
  styles/
    global.css           # shared tokens, fonts, nav, footer, mobile shell
public/
  fonts/
    iansui/              # IansuiLocal — Taiwanese / POJ glyphs
    gochi-hand-poj/      # GochiHandPOJ — English text
  logo.png
tests/
  site-regression.test.mjs
astro.config.mjs
wrangler.toml
```

## Commands

```bash
npm install          # install dependencies (Node >=20.19.0)
npm run dev          # Astro dev server
npm run build        # build into dist/
npm test             # astro build + regression test
npx wrangler pages dev dist  # preview Cloudflare Pages output
```

Full verification sequence after any change:
1. `npm test`
2. `npx wrangler pages dev dist`
3. `curl -i http://127.0.0.1:8788/api/health`
4. Confirm `/`, `/vocabulary.html`, `/events.html` all return 200.

If wrangler fails to find `@cloudflare/workerd-darwin-arm64`, run `npm install --include=optional`.

## Architecture

**Build format**: `build.format: "file"` in `astro.config.mjs` — pages output as flat `.html` files (not directories). Do not change this.

**SSR vs static**: All pages are statically prerendered except `src/pages/api/health.ts`, which must keep `export const prerender = false`.

**Inline styles and scripts**: Page-level CSS and JS use `is:inline` in every Astro component. The regression test reads raw HTML text and asserts against it, so extracted assets would break tests. Do not remove `is:inline` unless you also update the tests.

**Typography tokens** (present in all three pages):
- `--tai` / `--poj` → `IansuiLocal` (Taiwanese text and romanisation)
- `--en` → `GochiHandPOJ` (English)
- Fonts are self-hosted under `public/fonts/`. Never move them out or switch to external CDN.

**Cross-page navigation**:
- All pages opt into View Transitions (`@view-transition { navigation: auto }`).
- Each page prefetches its sibling pages with `rel="prefetch"`.
- vocabulary and events pages write `sessionStorage.setItem('kts-smooth-target', 'contact')` before returning home; the home page reads this to trigger smooth-scroll.

**Navigation press feedback**:
- `.nav-links a` now uses `display:inline-flex` with a 44px tap target, so button-like nav elements such as `.nav-cta` and the home language switcher may use `transform: scale(.97)` for press feedback.
- Pure text-style inline links should still prefer background or color changes instead of transform-based press feedback.

## Regression Tests

`tests/site-regression.test.mjs` runs against the built `dist/` directory. It asserts:
- Both font files exist under `public/fonts/`.
- Every page declares `@font-face` for both fonts and exposes the `--tai`, `--poj`, `--en` CSS tokens.
- Nav link order is exact (checked by `navHrefs()`).
- View transitions, prefetch links, and content-max token are present.
- Mobile nav uses `.nav-menu` wrapper; `position: fixed` is absent from `.nav-links`.

When changing navigation, fonts, CSS tokens, or cross-page behaviour, run `npm test` and update assertions in lockstep.

## Cloudflare / Wrangler Notes

- `compatibility_date` is pinned to `2026-01-14`. Do not set a future date; Wrangler evaluates it against its bundled runtime.
- `compatibility_flags = ["nodejs_compat"]` is required; do not remove it.
- `dist/` is generated output — never commit it.

## Commit Style

Follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`. When touching `astro.config.mjs`, `wrangler.toml`, routes, or `public/` assets, note Cloudflare deployment implications in the commit message.
