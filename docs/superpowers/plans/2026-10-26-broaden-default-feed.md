# Broader Gaming Default Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Broaden the default `gaming` candidate feed to include the user's priority gaming and PC hardware topics in one provider request.

**Architecture:** Add a pure provider-keyword translation helper used only when constructing the upstream Mediastack request. Logical query/cache/UI behavior remains `gaming`; focused searches pass through unchanged.

**Tech Stack:** TypeScript, Node native test runner, existing Mediastack proxy

**Spec:** `docs/superpowers/designs/2026-10-26-broaden-default-feed.md`

## Global Constraints
- Exactly one Mediastack request per cache miss.
- Default UI/cache query remains `gaming`.
- Manual/focused queries pass through unchanged.
- Existing ranking, pagination, caching, and response shape remain unchanged.
- Production client/server gates remain green.

## Review Focus
- `gaming` expands case-insensitively.
- Expanded provider query contains gaming, Witcher/CDPR, NVIDIA/RTX/GPU, RAM/DDR5/SSD, and PC hardware terms.
- `NVIDIA GPU`, `RAM prices`, and arbitrary user searches are not broadened.
- Empty keyword stays empty.
- Route uses expanded provider value only in upstream params, not response `query` or cache key.

---

### Task 1: Provider keyword translation

**Files:**
- Create: `server/src/lib/providerKeywords.ts`
- Create: `server/tests/providerKeywords.test.mjs`
- Modify: `server/src/routes/api/mainNews.ts`

**Interfaces:**
- Produces: `buildProviderKeywords(keywords: string): string`

- [ ] **Step 1: Add failing tests** for default expansion, case-insensitivity, pass-through focused searches, and empty input.
- [ ] **Step 2: Run focused tests and verify RED** because the helper is missing.
- [ ] **Step 3: Implement the deterministic helper.**
- [ ] **Step 4: Wire route upstream params to the helper while preserving logical query/cache values.**
- [ ] **Step 5: Run full server suite, review PR, squash merge, deploy through Render, and verify live gates.**
