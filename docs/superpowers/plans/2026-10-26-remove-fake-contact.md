# Remove Fake Contact Route Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the unlinked placeholder contact surface so the portfolio cannot expose fabricated contact information or a dead form.

**Architecture:** Delete the Contact page and stylesheet and remove its import/route from `client/src/main.tsx`. Existing router error handling becomes the only behavior for `/contact`.

**Tech Stack:** React, React Router, Vite/TypeScript production build

**Spec:** `docs/superpowers/designs/2026-10-26-remove-fake-contact.md`

## Global Constraints
- Do not invent replacement contact information.
- Preserve every currently navigated route.
- Client and server production gates must stay green.

## Review Focus
- `Contact` import is gone.
- `contact` child route is gone.
- `Contact.tsx` and `Contact.css` are deleted.
- App still compiles with no dangling import.
- `/contact` naturally falls through the branded router error element.

---

### Task 1: Remove placeholder contact surface

**Files:**
- Modify: `client/src/main.tsx`
- Delete: `client/src/pages/Contact.tsx`
- Delete: `client/src/pages/Contact.css`

- [ ] **Step 1: Remove Contact import and route from the router.**
- [ ] **Step 2: Delete the unused Contact component and stylesheet.**
- [ ] **Step 3: Review the diff for any unrelated route changes.**
- [ ] **Step 4: Run the existing client tests/build and server tests through the Render production gate after merge.**
