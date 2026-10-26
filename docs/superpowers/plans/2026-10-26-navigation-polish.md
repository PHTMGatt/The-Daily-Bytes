# Navigation Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the global search field in sync with navigation and replace the rough 404 with a branded recovery experience.

**Architecture:** Add one dependency-free client URL-state helper, test it with Node's native test runner, and use it from Navbar. Add client tests to the root production gate. Restyle ErrorPage with existing Daily Bytes design tokens and recovery links.

**Tech Stack:** React, React Router, JavaScript utility, CSS, Node native test runner

**Spec:** `docs/superpowers/designs/2026-10-26-navigation-polish.md`

## Global Constraints
- No new dependency.
- Existing routes and auth behavior remain unchanged.
- Navbar search value is derived from the current URL `q` value; no `q` means an empty input.
- Render production builds must run both client regression tests and the existing server suite.

## Review Focus
- Navigate from `?q=NVIDIA%20GPU` to `/`: search field clears.
- Navigate between two query URLs: search field reflects the new query.
- Encoded query values decode normally through URLSearchParams.
- Empty `q=` behaves as empty search text.
- 404 recovery links resolve to valid existing routes.

---

### Task 1: Search-state regression guard

**Files:**
- Create: `client/src/utils/navigationSearch.js`
- Create: `client/tests/navigationSearch.test.mjs`
- Modify: `client/package.json`
- Modify: `package.json`
- Modify: `client/src/components/Navbar.tsx`

**Interfaces:**
- Produces: `getNavigationSearchValue(search: string): string`

- [ ] **Step 1: Write failing native Node tests** for query decoding, clearing when absent, query changes, and empty `q=`.
- [ ] **Step 2: Run `cd client && npm test`** and verify failure because the helper does not exist.
- [ ] **Step 3: Implement the helper and wire Navbar to always set search from it.**
- [ ] **Step 4: Add client tests to the root `test` and `build` scripts.**
- [ ] **Step 5: Run the client tests and full build gate.**

### Task 2: Branded error recovery page

**Files:**
- Modify: `client/src/pages/ErrorPage.tsx`
- Create: `client/src/pages/ErrorPage.css`

**Interfaces:**
- Uses existing routes `/`, `/dailybyte?q=gaming`, `/dailybyte?q=The%20Witcher%203`, and `/dailybyte?q=NVIDIA%20GPU`.

- [ ] **Step 1: Replace the raw 404 markup** with branded copy, gaming-first recovery links, and accessible structure.
- [ ] **Step 2: Add responsive dark/red styling using existing CSS variables.**
- [ ] **Step 3: Run client tests and the production build gate.**
- [ ] **Step 4: Review PR diff, squash merge, deploy to Render, and verify client tests + server tests + live startup.**
