# Server-Issued Demo Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep one-click demo access while removing the demo password from all browser code and requests.

**Architecture:** Extract JWT construction into a testable server helper, add a passwordless `/api/auth/demo` route for the seeded demo user, and add a tiny client auth-request helper that makes the no-body demo request contract testable with the native client runner.

**Tech Stack:** TypeScript, React, Express, MongoDB, jsonwebtoken, Node native test runner

**Spec:** `docs/superpowers/designs/2026-10-26-demo-session.md`

## Global Constraints
- No client code or request may contain the demo password.
- `DEMO_PASSWORD` remains server-only and is used only to seed/maintain the demo user.
- Demo receives the same ordinary reader JWT shape/expiry as standard login.
- Normal login/register behavior remains unchanged.
- Production client/server gates remain green.

## Review Focus
- Demo client request is POST with no credential body.
- Session token contains only expected username/iat/exp claims from this helper.
- Demo endpoint looks up the existing normalized `demo` account instead of creating users on request.
- Missing demo account returns a controlled service error.
- No `dailybytes` demo password literal remains in Login/auth client code.

---

### Task 1: Testable session token utility

**Files:**
- Create: `server/src/lib/authSession.ts`
- Create: `server/tests/authSession.test.mjs`
- Modify: `server/src/routes/auth-routes.ts`

**Interfaces:**
- Produces: `DEMO_USERNAME = 'demo'`
- Produces: `createSessionToken(username: string, secret: string): string`

- [ ] **Step 1: Add failing server tests** for username claim and 12-hour expiry window.
- [ ] **Step 2: Verify RED** because the utility is missing.
- [ ] **Step 3: Implement helper and refactor login/register token creation to use it.**
- [ ] **Step 4: Add `/demo` route that finds the seeded demo user and returns the same token shape.**
- [ ] **Step 5: Run server suite.**

### Task 2: Passwordless client demo request

**Files:**
- Create: `client/src/utils/authRequest.js`
- Create: `client/tests/authRequest.test.mjs`
- Modify: `client/src/api/authAPI.ts`
- Modify: `client/src/pages/Login.tsx`

**Interfaces:**
- Produces: `buildDemoAuthRequest(): { path: '/api/auth/demo'; init: RequestInit-like object }`
- Produces: `demoLogin(): Promise<{ token: string }>`

- [ ] **Step 1: Add failing client test** asserting POST/no-body demo request.
- [ ] **Step 2: Verify RED** because helper is missing.
- [ ] **Step 3: Implement helper, `demoLogin()`, and switch the button to it.**
- [ ] **Step 4: Confirm no demo password literal remains in client auth/login code.**
- [ ] **Step 5: PR review, squash merge, Render deploy, and verify full live gate.**
