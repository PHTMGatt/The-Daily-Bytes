# Article Image Resilience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent broken third-party news thumbnails from appearing in live and saved Daily Bytes cards.

**Architecture:** Add a dependency-free helper that decides whether a remote source is displayable, cover it with the existing native client tests, and use it inside a reusable stateful `ArticleImage` React component. Replace duplicated image branches in the feed and Saved page without changing article data.

**Tech Stack:** React, TypeScript, JavaScript utility, Node native test runner

**Spec:** `docs/superpowers/designs/2026-10-26-image-resilience.md`

## Global Constraints
- No new dependency or external image proxy.
- Existing article/Mongo data shapes remain unchanged.
- Broken, blank, or failed image sources render an intentional fallback.
- Render production gate continues running client and server tests.

## Review Focus
- Blank/whitespace URL renders fallback.
- Valid URL renders image until an error occurs.
- Failed state renders fallback.
- New source resets prior failure state.
- Live and Saved cards retain their existing media sizing and topic badges.

---

### Task 1: Reusable resilient article image

**Files:**
- Create: `client/src/utils/articleImage.js`
- Create: `client/src/components/ArticleImage.tsx`
- Modify: `client/tests/navigationSearch.test.mjs`
- Modify: `client/src/pages/DailyByte.tsx`
- Modify: `client/src/pages/Saved.tsx`

**Interfaces:**
- Produces: `shouldDisplayArticleImage(src: unknown, failed?: boolean): boolean`
- Produces: `ArticleImage({ src, alt?, fallbackLabel?, fallbackClassName? })`

- [ ] **Step 1: Add failing utility tests** for blank, valid, failed, and replacement-source conditions.
- [ ] **Step 2: Run client tests and verify RED** because the helper is missing.
- [ ] **Step 3: Implement the helper and `ArticleImage` component.**
- [ ] **Step 4: Replace live and Saved card image branches.**
- [ ] **Step 5: Run client tests; then PR, merge, Render build, server tests, and live startup verification.**
