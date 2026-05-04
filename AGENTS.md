# AGENTS.md

Guidance for Codex working in this repository. Keep this file short and operational; use `CLAUDE.md` only when deeper Cloudflare/contact-form background is needed.

## Project Snapshot

This repo is the active Astro + Cloudflare Pages app for **Kóng台語 跳Swing**. Work from the repo root unless the user explicitly requests another worktree.

Key structure:

```text
src/layouts/BaseLayout.astro       shared document shell, metadata, nav/footer, shared inline scripts
src/components/                    shared Astro UI components
src/pages/                         flat .html routes plus API routes
src/styles/global.css              font tokens, nav/footer, shared UI primitives
tests/site-regression.test.mjs     build-output regression checks
astro.config.mjs                   Astro config; keep build.format: "file"
wrangler.toml                      Cloudflare Pages/runtime config
```

## Current UI Architecture

The current interface has been refactored into shared UI primitives. Prefer these before adding new page-local markup:

- `PageHero.astro` for subpage hero headers.
- `SectionHeader.astro` for section kicker/title/aside blocks.
- `ButtonLink.astro` for CTA links using `.ui-btn`.
- `StatGrid.astro` for repeated metric rows.
- `InfoCardGrid.astro` for TODO/info card groups.
- `ContactForm.astro` for the contact form markup. Keep field names, option labels, `id="contact-form"`, `.submit`, and `.form-status` stable unless updating API/tests in lockstep.
- `ContactChannels.astro` for IG/email/Facebook/sponsor links.
- `Nav.astro` and `Footer.astro` remain the shared global shell components.

Shared styles live in `src/styles/global.css`: `.page-hero`, `.section-head`, `.ui-btn`, `.chip`, `.stats`, `.info-card*`, `.contact-form`, `.channels`, nav, footer, font tokens, and reduced-motion rules. Page files should keep only page-specific layout, data, and inline scripts.

## Hard Rules

- Do not change `astro.config.mjs` `build.format: "file"`; routes must output flat files like `/about.html`.
- Keep `src/pages/api/health.ts` SSR with `export const prerender = false`.
- Keep page-level CSS/JS inline with `is:inline` unless you also update `tests/site-regression.test.mjs`. The tests inspect built raw HTML.
- Keep self-hosted fonts under `public/fonts/`; do not replace them with CDN-only fonts.
- Keep tokens `--tai`, `--poj`, `--en`, and `--content-max`.
- Keep nav href order exact: `index.html`, `about.html`, `daily.html`, `vocabulary.html`, `events.html`, `faq.html`, `contact.html`.
- Keep the nav brand image path flat-file-safe as `logo.png`; avoid changing it back to `/logo.png` without checking direct `dist/*.html` usage.
- Keep `main#main` visually separated from sticky nav with `--main-nav-gap` and `scroll-margin-top`; this prevents skip links and page starts from hiding under the nav.
- Do not declare Cloudflare Email Routing `send_email` bindings in `wrangler.toml`; Pages rejects that shape.
- `dist/` is generated output; do not commit it.

## Fast Workflow

1. Read the relevant page/component and `tests/site-regression.test.mjs` first.
2. For UI or architecture changes, add/update a regression check before implementation when practical.
3. Reuse existing shared components and `global.css` primitives.
4. Keep page-local scripts inline in the page `afterBody` slot unless the utility is truly cross-page.
5. For cross-page browser utilities, add them once in `BaseLayout.astro` and expose a small `window.*` API.
6. Run `npm test` before claiming completion.
7. Start `npm run dev -- --host 127.0.0.1` when the user should review visual changes locally.

## Commands

```bash
npm install
npm run dev -- --host 127.0.0.1
npm run build
npm test
npx wrangler pages dev dist
```

Full deployment-oriented verification, when Cloudflare behavior matters:

```bash
npm test
npx wrangler pages dev dist
curl -i http://127.0.0.1:8788/api/health
```

Confirm `/`, `/vocabulary.html`, `/events.html`, and any touched routes return 200.

## Regression Test Contract

`tests/site-regression.test.mjs` currently guards:

- Local font files and CSS font token output.
- Shared UI component files.
- Shared `.page-hero` and `.ui-btn` styles in built pages.
- Nav brand logo path and explicit circular image fitting.
- `main#main` nav separation and scroll target offset.
- Nav order and mobile nav structure.
- View transitions, prefetch links, and `--content-max`.
- Contact form shell and `id="contact-form"`.
- Home hero wrapping and smooth-scroll sessionStorage behavior.

When changing nav, fonts, CSS tokens, shared UI components, contact form markup, or cross-page behavior, update the test in the same change.

## Interaction And Accessibility

- Button-like elements need 44px minimum tap targets and `:focus-visible` rings using `var(--mustard)`.
- Toggle/filter chips need `aria-pressed`; the group should have `role="group"` and an `aria-label`.
- Persistent UI state uses `localStorage` keys prefixed with `kts-*`; wrap reads/writes in `try/catch`.
- Async actions such as speech synthesis or form submission must set disabled/loading state and clear it after resolve.
- Motion-heavy or JS scroll behavior must respect `prefers-reduced-motion`; subscribe to changes, not just one-time checks.

## Contact Form/API Coupling

`src/pages/api/contact.ts` expects JSON `{name,email,topic,message}` and validates topic labels against a Set containing the literal option text. If changing `ContactForm.astro` option labels, update the API Set and regression checks together.

The form UI contract is idle/loading/success/error. Do not fake success; send through `/api/contact` and show real error states.

## Data UI Rules

- Do not hand-author duplicate data-driven display. The events calendar is derived from the `events` array with `Object.fromEntries(...)`.
- Cross-section jumps should use stable IDs and real `<a href="#id">` anchors first; JS smooth-scroll/highlight can enhance them.

## Recent Progress

2026-05-04 UI architecture cleanup:

- Added shared UI components under `src/components/`.
- Moved repeated page hero, section header, button, chip, stats, info card, contact form, and channel styles into `src/styles/global.css`.
- Refactored `index.astro`, `about.astro`, `daily.astro`, `vocabulary.astro`, `events.astro`, `faq.astro`, and `contact.astro` to use shared components where practical.
- Added regression checks for the shared UI architecture.
- Verification command run: `npm test` passed.

2026-05-04 nav/main bugfix:

- Nav brand logo now uses relative `logo.png` and explicit `width`, `height`, `object-fit`, and `object-position` CSS inside `.brand-mark`.
- `main#main` now has `margin-top: var(--main-nav-gap)` and `scroll-margin-top: calc(var(--nav-height) + var(--main-nav-gap))`.
- Regression checks now guard logo asset existence, flat-file-safe nav logo path, explicit logo fitting, and main/nav separation.
- Verification command run: `npm test` passed.

## Avoid These Token Sinks

- Do not re-read every page for small UI changes. Start with the touched component/page, `global.css`, and the regression test.
- Do not duplicate page hero/button/chip/form/card CSS in page files; extend global primitives instead.
- Do not browse Astro docs for basic component syntax unless changing framework-level behavior. Current Astro 5 component props, slots, and `class:list` usage are already in place.
- Do not chase Cloudflare Email Routing setup unless the task touches `/api/contact`, `wrangler.toml`, or deployment verification.
- Do not start visual redesign from scratch; the target is a hand-made vintage Swing/Taiwanese language identity with pragmatic shared UI primitives.
