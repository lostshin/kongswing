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

**Shared client scripts** (`BaseLayout.astro`):
- Cross-page browser utilities live in a single inline script in `BaseLayout.astro`, exposed on `window.*`. This keeps `is:inline` pages compatible with the regression test (it greps raw HTML).
- Current shared APIs:
  - `window.ktsSpeak(text): Promise<boolean>` — Taiwanese SpeechSynthesis with voice fallback (`min-nan|nan|tâi|hokkien|holo` → `zh-TW|cmn-Hant`). Sets `lang='nan-Hant-TW'`. Real devices rarely ship a true Taiwanese voice; the fallback to Mandarin is intentional, do not strip it.
- When adding a new cross-page utility, put it here — do **not** duplicate inline scripts across pages.

## Contact form & Cloudflare Email Routing

- `src/pages/api/contact.ts` is SSR (`prerender = false`), POSTs JSON `{name,email,topic,message}`, sends mail via `cloudflare:email` using the `SEB` binding.
- Env reads come from `locals.runtime.env` (Cloudflare Pages convention): `CONTACT_SENDER`, `CONTACT_RECIPIENT`, `SEB`. If any is missing, return 503 `mail_not_configured` — do not throw, the form's error state expects a JSON `{ok:false,error}` shape.
- Topic validation uses an `ALLOWED_TOPICS` Set keyed on the literal Chinese form labels (`'合作 · Collaboration'` etc.). If you change the form `<option>` text, update the Set in lockstep.
- `wrangler.toml` declares `[[send_email]] name="SEB" destination_address="luljidjemeli@gmail.com"`. The `destination_address` is the **only** address `send_email` may target — Email Routing's free tier requires the destination be a verified address on the zone. Do not switch to an unverified recipient without re-verifying first.
- Sender (`CONTACT_SENDER`) must be on the same Cloudflare-managed zone (`kongswing.cc`); arbitrary external From addresses will be rejected.
- Manual Cloudflare setup (one-time, not in code):
  1. `kongswing.cc` zone → Email → Email Routing → Enable
  2. Verify destination mailbox (e.g. luljidjemeli@gmail.com)
  3. Pages project → Settings → Variables: set `CONTACT_SENDER` and `CONTACT_RECIPIENT`
- Form UX contract (in `index.astro` `#contact-form` handler): four states — idle / loading (`aria-busy`) / success (`status[role=status]`) / error (`status[role=alert]`). Do not collapse to fewer states; the form previously fake-succeeded without sending and that was the bug being fixed.

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

## Accessibility & interaction baseline

- Focus rings: button-like elements use `outline:2px solid var(--mustard); outline-offset:4px; border-radius:6px` on `:focus-visible`. `.nav-links a`, `.nav-toggle`, `.brand`, `.card`, `.voc`, `.qa-q` all conform — match this when adding new interactive elements.
- Toggle / filter chips must have `aria-pressed` reflecting state, and the parent group should carry `role="group"` with an `aria-label`.
- Persistent toggles (e.g. Save) write to `localStorage` under a `kts-*` key (e.g. `kts-saved`). Wrap reads in try/catch — Safari private mode throws.
- Async UI affordances: any button that triggers `ktsSpeak`, fetch, etc. should set `disabled` + a visible `is-playing` / `is-loading` class, and clear it on resolve. Don't fire-and-forget.
- `prefers-reduced-motion`: scroll-driven or JS-driven animations must check `matchMedia('(prefers-reduced-motion:reduce)')` **and** subscribe via `addEventListener('change', ...)` — a one-time snapshot at load is not enough; users toggle it mid-session.

## Data-driven UI

- Don't hand-author display data that already exists in the source array. The events page calendar is derived from `events` via `Object.fromEntries(...)` filtered by month — never re-add fake date cells. If the source array changes, the calendar updates for free.
- Cross-section anchors: when a control on screen A scrolls to a card on screen B (e.g. calendar cell → event card), make sure the card has a stable `id` and the control is an `<a href="#id">` — not a JS-only handler. The handler can layer on smooth-scroll + highlight, but the link must work without JS.

## Commit Style

Follow Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`. When touching `astro.config.mjs`, `wrangler.toml`, routes, or `public/` assets, note Cloudflare deployment implications in the commit message.
