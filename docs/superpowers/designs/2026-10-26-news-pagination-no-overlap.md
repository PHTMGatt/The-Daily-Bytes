# News Pagination No-Overlap Design

## Intent
The previous pagination correction fixed skipped provider rows by advancing offset by visible page size, but keeping a 2x fetch window means adjacent provider windows overlap. That can repeat stories across visible pages after relevance ranking. Daily Bytes pagination should be deterministic: every visible page maps to a distinct provider window.

## Goals
- Use one non-overlapping provider window per visible page.
- Page size 12 => page 1 offset 0/limit 12, page 2 offset 12/limit 12, page 3 offset 24/limit 12.
- Preserve existing ranking/deduplication inside each page, cache keys, API response shape, and provider call count.
- Reduce provider payload per request.

## Non-goals
- Do not add extra provider calls or cross-page state.
- Do not change the UI paginator or totalResults reporting.
- Do not introduce cursor pagination.

## Approach
Simplify `getNewsWindow(page, pageSize)` so `fetchLimit` equals the visible `pageSize` (capped by the already-clamped route input) and `offset` remains `(page - 1) * pageSize`. This eliminates both skipped rows and overlapping rows. Relevance ranking remains useful within each provider page and query profiles still prioritize gaming/hardware content.
