# Horoscope Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Horoscope route into the current Daily Bytes design/quality bar without inventing unsupported horoscope fields.

**Architecture:** Add a small client utility for zodiac metadata and API response normalization, test it with Node's native runner, and rewrite the page to use React state/effects only. The existing `/api/horoscope` proxy remains unchanged.

**Tech Stack:** React, TypeScript, JavaScript utility, CSS, Node native test runner

**Spec:** `docs/superpowers/designs/2026-10-26-horoscope-polish.md`

## Global Constraints
- No new dependency or provider call.
- Do not invent lucky number, mood, compatibility, or similar fields.
- No DOM lookup for selected sign metadata.
- No browser console logging for expected request failures.
- Client/server production gates remain green.

## Review Focus
- All 12 signs map to stable labels/date ranges.
- Unknown sign metadata safely falls back to Aries.
- API response with horoscope/date normalizes cleanly.
- Missing horoscope text produces a safe empty value instead of crashing.
- Changing sign aborts/ignores stale request results and shows loading before the new result.

---

### Task 1: Zodiac metadata and response normalization

**Files:**
- Create: `client/src/utils/horoscopeView.js`
- Create: `client/tests/horoscopeView.test.mjs`

**Interfaces:**
- Produces: `ZODIAC_SIGNS`
- Produces: `getZodiacMeta(sign: unknown)`
- Produces: `normalizeHoroscopeResponse(payload: unknown)`

- [ ] **Step 1: Add failing tests** for sign metadata, fallback, and response normalization.
- [ ] **Step 2: Run client tests and verify RED** because the utility is missing.
- [ ] **Step 3: Implement the utility.**
- [ ] **Step 4: Run client tests and verify GREEN.**

### Task 2: Rewrite and restyle Horoscope page

**Files:**
- Modify: `client/src/pages/Horoscope.tsx`
- Modify: `client/src/pages/Horoscope.css`

**Interfaces:**
- Consumes `ZODIAC_SIGNS`, `getZodiacMeta`, and `normalizeHoroscopeResponse`.
- Uses existing `GET /api/horoscope?zodiacSign=<sign>`.

- [ ] **Step 1: Replace DOM lookup/console logging/unsupported fields with React state and honest provider data.**
- [ ] **Step 2: Add explicit loading, error, ready, and retry behavior.**
- [ ] **Step 3: Restyle using Daily Bytes navy/red tokens and responsive layout.**
- [ ] **Step 4: Run client tests + build, review PR, merge, Render deploy, and verify full production gate.**
