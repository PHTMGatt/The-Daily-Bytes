# Shared News Saving Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let readers save and unsave stories directly from Trending and category news cards using the existing Mongo-backed reading list.

**Architecture:** Add a pure saved-payload builder covered by native client tests, then extend the existing shared `NewsComponent` with authenticated saved URL state and the existing saved-articles API client. No server/schema changes.

**Tech Stack:** React, TypeScript, existing saved-articles API client, Node native test runner

**Spec:** `docs/superpowers/designs/2026-10-26-shared-news-saving.md`

## Global Constraints
- No Mongo/schema/server changes.
- Signed-out Save routes to `/login`.
- Existing pagination/news fetching remains unchanged.
- Save/remove actions must not refetch the news provider.
- Production client/server gates remain green.

## Review Focus
- Payload trims/falls back safely for optional metadata.
- Initial saved URL lookup runs only for authenticated readers.
- Existing saved stories render Saved immediately after lookup.
- Save and remove update local URL state only after successful API response.
- One failing save/remove does not clear unrelated saved state or news results.

---

### Task 1: Saved payload helper

**Files:**
- Create: `client/src/utils/savedArticlePayload.js`
- Create: `client/tests/savedArticlePayload.test.mjs`

**Interfaces:**
- Produces: `buildSavedArticlePayload(article, topic)` returning title/url/description/image/source/publishedAt/topic.

- [ ] **Step 1: Add failing tests** for metadata preservation and safe optional defaults.
- [ ] **Step 2: Verify RED** because helper is missing.
- [ ] **Step 3: Implement helper.**
- [ ] **Step 4: Run client tests and verify GREEN.**

### Task 2: Shared card save controls

**Files:**
- Modify: `client/src/components/NewsComponent.tsx`
- Modify: `client/src/components/News.css`

**Interfaces:**
- Consumes existing `getSavedArticles`, `saveArticle`, `removeSavedArticle`, `auth`, and `buildSavedArticlePayload`.

- [ ] **Step 1: Load saved URL state for authenticated readers.**
- [ ] **Step 2: Add save/remove action with login redirect for signed-out readers.**
- [ ] **Step 3: Add card footer bookmark button and compact status message.**
- [ ] **Step 4: Run client tests + build; review PR, squash merge, deploy, and verify full production gate.**
