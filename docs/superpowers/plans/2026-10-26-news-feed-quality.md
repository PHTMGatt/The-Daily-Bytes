# News Feed Quality Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Daily Bytes news ordering by ranking relevant stories first and collapsing duplicate headlines without changing the API response shape.

**Architecture:** Add one pure server-side ranking/deduplication helper used by the existing Mediastack proxy after the provider response and before caching. Keep the current cache, pagination inputs, and client contract intact.

**Tech Stack:** TypeScript, Node.js, Express, native Node test runner

**Spec:** `docs/superpowers/designs/2026-10-26-news-feed-quality.md`

## Global Constraints
- No new runtime dependency.
- Keep the existing 15-minute news cache and API response shape unchanged.
- Never filter a valid unique story solely because its relevance score is low.
- Production Render builds must continue running the full server unit suite.

## Review Focus
- Empty query: dedupe only and preserve provider order.
- Case/punctuation variants of the same headline: retain one story.
- Same URL with different title casing: retain one story.
- Strong title match vs description-only match: title match ranks first.
- Equal relevance: newer published story ranks first, then original provider order.

---

### Task 1: Pure relevance ranking and deduplication

**Files:**
- Create: `server/src/lib/newsQuality.ts`
- Test: `server/tests/newsQuality.test.mjs`

**Interfaces:**
- Produces: `rankAndDedupeArticles<T extends NewsQualityArticle>(articles: T[], query: string): T[]`
- Produces: `normalizeHeadline(value: unknown): string`

- [ ] **Step 1: Write failing tests** for duplicate normalized headlines, same-URL duplicates, title-match priority, freshness tie-break, and empty-query provider-order preservation.
- [ ] **Step 2: Run `cd server && npm test`** and verify the new tests fail because `dist/lib/newsQuality.js` does not exist yet.
- [ ] **Step 3: Implement the pure helper** with deterministic token scoring and no external dependencies.
- [ ] **Step 4: Run `cd server && npm test`** and verify the entire suite passes.
- [ ] **Step 5: Commit** the helper and tests.

### Task 2: Integrate ranking into the cached news proxy

**Files:**
- Modify: `server/src/routes/api/mainNews.ts`

**Interfaces:**
- Consumes: `rankAndDedupeArticles(raw, keywords)` from Task 1.
- Preserves: `{ articles, page, perPage, totalResults, query }` response contract.

- [ ] **Step 1: Update the route** so provider rows pass through ranking/deduplication before `pageSize` slicing and before cache storage.
- [ ] **Step 2: Run `cd server && npm test`** and verify the full suite passes.
- [ ] **Step 3: Open a PR, review the diff, merge, and deploy through Render.**
- [ ] **Step 4: Verify Render client build, server TypeScript build, full unit suite, process startup, and final live status.**
