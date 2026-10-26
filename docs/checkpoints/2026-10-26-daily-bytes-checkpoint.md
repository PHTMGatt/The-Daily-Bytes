# Daily Bytes Checkpoint — October 26, 2026

This checkpoint freezes the current Daily Bytes cleanup/polish state before stopping work.

## Production state

- Repository: `PHTMGatt/The-Daily-Bytes`
- Main branch checkpoint commit before this note: `9f36745da561667bccd85a78096d04536f20753d`
- Latest verified production code commit: `1f6fb3f2e9847bf56b6af1ff44d163b4692bfe69`
- Render service: `The-Daily-Bytes`
- Live URL: `https://the-daily-bytes-o4jo.onrender.com`
- Last verified Render deploy: succeeded/live
- Production gate on the live code commit:
  - Client tests: `18/18`
  - Server tests: `33/33`
  - Vite/TypeScript production build: passed

`9f36745` only rewrote the README, so production code is identical to the verified live `1f6fb3f` code state.

## Completed cleanup/polish

- Migrated reader authentication to MongoDB Atlas.
- Added Mongo-backed saved articles with per-user URL uniqueness.
- Added server-issued passwordless demo access; demo credentials are no longer shipped in React.
- Reworked the homepage into a gaming + enthusiast PC dashboard.
- Added Witcher/CDPR, NVIDIA/RTX/GPU, RAM/DDR5/SSD, PC hardware, and gaming-platform ranking priorities.
- Broadened the default `gaming` provider query to the priority topic set in one Mediastack request.
- Kept focused/manual searches unchanged.
- Added deterministic ranking, duplicate URL/headline removal, and freshness tie-breaking.
- Fixed news pagination so adjacent pages neither skip nor overlap provider rows.
- Added a bounded 15-minute news cache.
- Added resilient article thumbnail fallbacks for missing/broken remote images.
- Fixed global-search URL synchronization.
- Replaced the old raw 404 with a branded recovery page.
- Reworked Trending into an honest gaming-first `Trending Watch` surface.
- Upgraded shared category grids with loading/error/empty/retry states and current Daily Bytes styling.
- Removed the fake placeholder Contact route/details/form.
- Rebuilt Horoscope with tested zodiac metadata, provider-backed fields only, loading/error/retry states, and current styling.
- Rewrote the stale README to describe the actual application, stack, APIs, Mongo data, tests, and current repository links.

## Current unmerged work — preserved, do not lose

Branch: `chatgpt/shared-news-saving`

State: **WIP, intentionally not merged.** The branch is preserved and was 5 commits ahead of `main` before this checkpoint note.

Implemented on that branch:

- `client/src/utils/savedArticlePayload.js`
- `client/tests/savedArticlePayload.test.mjs`
- Shared `NewsComponent` save/unsave wiring using the existing Mongo-backed Saved Articles API
- Signed-out Save redirects to `/login`
- Signed-in shared feeds load existing saved URLs and update card state after successful save/remove
- Design/implementation notes under `docs/superpowers/`

Still required before merging:

1. Finish/review the shared-card bookmark styling in `News.css`.
2. Run the full client test suite and production client build.
3. Run the full server suite.
4. Review the branch diff for auth/news regressions.
5. Merge only after the full Render production gate passes.

## Known maintenance issue — intentionally deferred

All three committed npm lockfiles are stale relative to the current manifests.

Examples found during audit:

- `server/package-lock.json` still lists removed SQL-era dependencies such as `pg` and `sequelize` plus stale entries like `cors` / self-file dependencies.
- `client/package-lock.json` still lists old dependencies such as `openai`, `pg`, `sequelize`, Express, and other packages no longer present in `client/package.json`.
- Root `package-lock.json` also reflects an older dependency graph rather than the current root manifest.

Render installs therefore still report npm audit vulnerabilities from dependency trees that include stale/dead packages.

Do **not** run `npm audit fix --force` blindly.

Recommended maintenance path:

1. Regenerate root/server/client lockfiles from the current manifests in a normal networked npm environment.
2. Compare resulting dependency trees before committing.
3. Run `npm audit` separately for root, server, and client.
4. Upgrade only packages that are actually still used, in controlled batches.
5. Run client tests/build + server tests after every batch.
6. Verify Render after each merged batch.

## Mongo / Render notes

- Mongo database: `daily-bytes`
- Reader auth and saved articles are active.
- Demo account is seeded server-side.
- Render secrets/environment values must remain private and must never be copied into repo documentation or client code.

## Recommended next order

1. Resume `chatgpt/shared-news-saving` and finish that UI/verification pass.
2. Regenerate stale lockfiles and remove dead dependency trees.
3. Perform controlled dependency/advisory modernization.
4. Do one final route-by-route visual smoke review after dependency work.

This checkpoint is the handoff point for the next Daily Bytes session.
