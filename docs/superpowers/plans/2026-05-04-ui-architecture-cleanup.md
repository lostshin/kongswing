# UI Architecture Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Astro UI into shared components and shared CSS without changing routes, Cloudflare behavior, or the visual identity.

**Architecture:** Keep `BaseLayout.astro` as the single document shell and `global.css?raw` injector. Add low-risk Astro components for repeated markup and move cross-page styles into `src/styles/global.css`; keep page-local scripts inline.

**Tech Stack:** Astro 5, inline CSS via raw import, Node regression test, Cloudflare Pages output.

---

### Task 1: Regression Guard

**Files:**
- Modify: `tests/site-regression.test.mjs`

- [ ] Add checks for shared UI component files.
- [ ] Add checks for shared CSS classes in built pages.
- [ ] Run `npm test` and confirm the new checks fail before implementation.

### Task 2: Shared Components

**Files:**
- Create: `src/components/PageHero.astro`
- Create: `src/components/SectionHeader.astro`
- Create: `src/components/ButtonLink.astro`
- Create: `src/components/StatGrid.astro`
- Create: `src/components/InfoCardGrid.astro`
- Create: `src/components/ContactForm.astro`
- Create: `src/components/ContactChannels.astro`

- [ ] Implement presentational components using Astro props, slots, and `class:list`.
- [ ] Keep class names stable and page-agnostic.
- [ ] Avoid client JavaScript in components.

### Task 3: Shared CSS

**Files:**
- Modify: `src/styles/global.css`

- [ ] Move shared page hero, section heading, button, chip, form, channel, stats, and info card styles into global CSS.
- [ ] Preserve existing font tokens, nav behavior, mobile nav contract, focus rings, and reduced-motion rules.

### Task 4: Page Refactor

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/daily.astro`
- Modify: `src/pages/vocabulary.astro`
- Modify: `src/pages/events.astro`
- Modify: `src/pages/faq.astro`
- Modify: `src/pages/contact.astro`

- [ ] Import and use shared components where they replace repeated markup.
- [ ] Remove duplicate CSS that is now global.
- [ ] Keep page-local data and inline scripts in place.

### Task 5: Verification

**Files:**
- Generated: `dist/`

- [ ] Run `npm test`.
- [ ] Start `npm run dev -- --host 127.0.0.1` for local review.
