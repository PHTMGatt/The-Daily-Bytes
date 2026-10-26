# Trending and Category Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Trending and shared category news grids consistent with the polished gaming-first Daily Bytes experience.

**Architecture:** Add one dependency-free news view-state helper, extend the existing shared `NewsComponent` with optional heading/subtitle/keyword props, and use the existing `ArticleImage` component for thumbnail resilience. Trending uses `keywords="gaming"` and transparent “Trending Watch” copy rather than claiming engagement data.

**Tech Stack:** React, TypeScript, JavaScript utility, Node native test runner, existing `/api/news` proxy

**Spec:** `docs/superpowers/designs/2026-10-26-trending-category-polish.md`

## Global Constraints
- No new dependency or provider request per render beyond the existing one news request.
- Do not claim social popularity/engagement data.
- Existing category route URLs and pagination remain intact.
- Client and server tests stay in the Render production gate.

## Review Focus
- Initial render shows loading, not empty.
- Request failure shows error even when the previous article array is empty.
- Successful zero-result request shows empty only after loading ends.
- Ready state renders articles and pagination normally.
- Trending passes `gaming` keyword without a category filter.

---

### Task 1: Shared news view state and card polish

**Files:**
- Create: `client/src/utils/newsViewState.js`
- Create: `client/tests/newsViewState.test.mjs`
- Modify: `client/src/components/NewsComponent.tsx`
- Modify: `client/src/components/News.css`

**Interfaces:**
- Produces: `getNewsViewState({ loading, error, articleCount }): 'loading' | 'error' | 'empty' | 'ready'`
- Extends `NewsComponent` props with optional `heading`, `subtitle`, and `keywords`.

- [ ] **Step 1: Add failing client tests** for loading/error/empty/ready precedence.
- [ ] **Step 2: Run client tests and verify RED** because the helper is missing.
- [ ] **Step 3: Implement helper and update NewsComponent** to use loading state, ArticleImage, keyword search, custom copy, and safer error handling.
- [ ] **Step 4: Refine News.css** for header eyebrow/subtitle, loading state, consistent fallbacks, and responsive cards.
- [ ] **Step 5: Run client tests.**

### Task 2: Make Trending honest and gaming-first

**Files:**
- Modify: `client/src/pages/Trending.tsx`
- Modify: `client/src/pages/Technology.tsx`
- Modify: `client/src/pages/Health.tsx`

**Interfaces:**
- Trending calls `NewsComponent` with `keywords="gaming"` plus explicit heading/subtitle.

- [ ] **Step 1: Configure Trending as Gaming + Hardware “Trending Watch”.**
- [ ] **Step 2: Remove stale comments/TODO scaffolding from thin category wrappers.**
- [ ] **Step 3: Run client tests and full production build gate.**
- [ ] **Step 4: PR review, squash merge, Render deploy, and live verification.**
