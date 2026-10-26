# Gaming Priority Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the default gaming feed and priority hardware searches rank the user's preferred gaming/PC topics higher without making extra news-provider requests.

**Architecture:** Extend `server/src/lib/newsQuality.ts` with deterministic query profiles used only during scoring. Exact query matches keep their existing weights; profile aliases receive smaller bonuses. The existing route, cache and API response shape stay unchanged.

**Tech Stack:** TypeScript, Node.js, native Node test runner

**Spec:** `docs/superpowers/designs/2026-10-26-gaming-priority-ranking.md`

## Global Constraints
- No new runtime dependency.
- No extra Mediastack requests.
- Never filter a valid unique story solely because it lacks a preferred term.
- Unknown queries must preserve current ranking behavior.
- Production Render builds continue running the full server unit suite.

## Review Focus
- Default `gaming` query boosts Witcher/CDPR and NVIDIA/RTX/PC-hardware stories.
- `RAM prices` recognizes DDR5/memory/DRAM aliases without substring false positives.
- `GPU prices` recognizes RTX/GeForce/Radeon/graphics-card aliases.
- Exact query title matches still outrank alias-only matches.
- Unknown searches receive no profile bonus.

---

### Task 1: Add query-profile ranking

**Files:**
- Modify: `server/tests/newsQuality.test.mjs`
- Modify: `server/src/lib/newsQuality.ts`

**Interfaces:**
- Preserves: `rankAndDedupeArticles<T extends NewsQualityArticle>(articles: T[], query: string): T[]`

- [ ] **Step 1: Add failing regression tests** for default gaming priorities, RAM/GPU aliases, exact-vs-alias precedence, and unknown-query behavior.
- [ ] **Step 2: Run `cd server && npm test`** and verify the new tests fail under current scoring.
- [ ] **Step 3: Add the deterministic profile map and bounded alias scoring** to `newsQuality.ts`.
- [ ] **Step 4: Run `cd server && npm test`** and verify the complete suite passes.
- [ ] **Step 5: Open/review a PR, squash merge, deploy through Render, and verify build + tests + live startup.**
