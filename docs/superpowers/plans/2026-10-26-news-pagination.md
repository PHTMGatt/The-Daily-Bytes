# News Pagination Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop Daily Bytes from skipping news rows between visible 12-story pages while retaining the current ranking over-fetch.

**Architecture:** Add a pure server helper for the provider fetch window and use it from the existing news proxy. The helper separates visible pagination stride from the larger ranking candidate limit.

**Tech Stack:** TypeScript, Node native test runner, existing Express news proxy

**Spec:** `docs/superpowers/designs/2026-10-26-news-pagination.md`

## Global Constraints
- No extra provider request.
- Keep ranking/dedupe and 15-minute cache unchanged.
- Keep response shape and page/pageSize behavior unchanged.
- Production client/server gates remain green.

## Review Focus
- Page 1, size 12 => offset 0, fetchLimit 24.
- Page 2, size 12 => offset 12, fetchLimit 24.
- Page 3, size 12 => offset 24, fetchLimit 24.
- Size 24 => fetchLimit 48 and visible offset advances by 24.
- Fetch limit remains capped at 100.

---

### Task 1: Correct provider pagination window

**Files:**
- Create: `server/src/lib/newsPagination.ts`
- Create: `server/tests/newsPagination.test.mjs`
- Modify: `server/src/routes/api/mainNews.ts`

**Interfaces:**
- Produces: `getNewsWindow(page: number, pageSize: number): { fetchLimit: number; offset: number }`

- [ ] **Step 1: Add failing tests** for page 1/2/3 stride and fetch-limit cap.
- [ ] **Step 2: Run server tests and verify RED** because the helper does not exist.
- [ ] **Step 3: Implement the pure helper.**
- [ ] **Step 4: Replace inline fetchLimit/offset math in the route.**
- [ ] **Step 5: Run full server suite, then PR/merge/Render production gate.**
