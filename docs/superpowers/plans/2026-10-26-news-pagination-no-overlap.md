# News Pagination No-Overlap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure adjacent news pages neither skip nor repeat provider rows.

**Architecture:** Tighten the existing pure `getNewsWindow` helper so each visible page requests exactly one page-sized provider window. Keep ranking/deduplication, cache keys, and response shape unchanged.

**Tech Stack:** TypeScript, Node native test runner, existing Express news proxy

**Spec:** `docs/superpowers/designs/2026-10-26-news-pagination-no-overlap.md`

## Global Constraints
- No extra provider calls.
- No overlapping or skipped provider windows.
- Existing page/pageSize clamps and API response shape remain unchanged.
- Client/server production gates remain green.

## Review Focus
- Page 1, size 12 => limit 12, offset 0.
- Page 2, size 12 => limit 12, offset 12.
- Page 3, size 12 => limit 12, offset 24.
- Size 24 => limit 24 and offset advances by 24.
- Invalid negative page input is still clamped safely by helper/route behavior.

---

### Task 1: Remove provider window overlap

**Files:**
- Modify: `server/tests/newsPagination.test.mjs`
- Modify: `server/src/lib/newsPagination.ts`

**Interfaces:**
- Preserves: `getNewsWindow(page: number, pageSize: number): { fetchLimit: number; offset: number }`

- [ ] **Step 1: Update tests first** to require page-sized non-overlapping windows.
- [ ] **Step 2: Run server pagination tests and verify RED** under the current 2x fetch behavior.
- [ ] **Step 3: Change `fetchLimit` to the visible page size.**
- [ ] **Step 4: Run pagination tests and full server suite.**
- [ ] **Step 5: PR review, squash merge, Render deploy, and full live verification.**
