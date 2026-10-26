# Saved Articles + Legacy Cleanup Implementation Plan

**Goal:** Add Mongo-backed saved articles for signed-in Daily Bytes users and remove the remaining dead Sequelize user API surface.

**Architecture:** Store bookmarks in a `saved_articles` Mongo collection keyed by normalized username and article URL. Verify the existing JWT on bookmark routes, expose list/save/delete endpoints, and add a Saved page plus bookmark actions to the gaming-first feed. Remove unmounted legacy Sequelize user CRUD files/dependencies after the Mongo path is proven.

**Tech Stack:** React + TypeScript, Express + TypeScript, MongoDB Atlas, JWT, Node built-in test runner.

## Global Constraints
- Keep the navy/red showcase design.
- Gaming remains the default feed.
- Do not expose secrets in the client.
- Saved article URLs are unique per user.

## Tasks
1. Add testable saved-article normalization helpers and Node tests.
2. Add JWT-protected Mongo saved-article API routes and indexes.
3. Add client saved-article API helper, bookmark controls, Saved page, and navigation.
4. Remove dead Sequelize user CRUD/config/model code and unused Sequelize/Postgres dependencies where safe.
5. Build/test, review diff, merge, deploy, and verify Render startup plus Mongo writes.
