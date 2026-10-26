# News Pagination Fix Design

## Intent
The shared news UI paginates in 12-story pages, but the server currently advances Mediastack by its over-fetch size (24) instead of the visible page size (12). That skips provider rows between pages and can make later pages go empty early.

## Goals
- Advance provider offset by the requested visible page size.
- Keep over-fetching up to 2x page size so relevance ranking/deduplication still has a useful candidate pool.
- Preserve current page/pageSize clamps, cache keys, response shape, ranking, and call count.

## Non-goals
- Do not change UI pagination controls.
- Do not add cursor pagination or another provider request.
- Do not change Mediastack total reporting.

## Approach
Extract a tiny pure `getNewsWindow(page, pageSize)` helper that returns `{ fetchLimit, offset }`. `fetchLimit` remains `min(100, pageSize * 2)`, while `offset` becomes `(page - 1) * pageSize`. Cover page 1, page 2, and larger page sizes with server regression tests before wiring the helper into the route.
