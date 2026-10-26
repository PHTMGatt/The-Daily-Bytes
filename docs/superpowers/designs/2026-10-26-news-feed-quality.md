# News Feed Quality Design

## Intent
Daily Bytes already has the right gaming-first structure. This pass improves the quality of the stories inside that structure so specific searches such as Witcher 3, NVIDIA, GPU prices, RAM/SSD, and PC hardware feel curated rather than like a raw provider dump.

## Goals
- Rank stronger keyword matches ahead of weak matches.
- Collapse syndicated/near-duplicate headlines so one story does not occupy multiple cards.
- Preserve provider freshness as the tie-breaker.
- Keep generic or empty searches safe: never turn a usable provider response into an empty feed.
- Keep the existing 15-minute news cache and API contract unchanged.

## Non-goals
- Do not replace Mediastack.
- Do not add an editorial CMS, ML model, or external ranking service.
- Do not change the current gaming-first visual layout in this pass.

## Constraints
- No new runtime dependency.
- Pure ranking logic must be covered by server unit tests and run in the Render production gate.
- Response shape remains `{ articles, page, perPage, totalResults, query }`.

## Approaches considered
1. **Filter weak stories out entirely.** Strong relevance, but risky on a small provider result set because specific searches could become empty.
2. **Client-side ranking.** Quick, but duplicates logic across pages and wastes bandwidth/cache entries on poor ordering.
3. **Server-side score + dedupe, then preserve all remaining stories.** Chosen. It improves the first screen without making the provider more brittle, applies consistently to every client, and remains deterministic/testable.

## Chosen behavior
A pure server helper will normalize titles, tokenize the query, remove duplicate URLs and near-identical normalized headlines, score title matches more heavily than description matches, and use published time/provider order as tie-breakers. Empty queries only dedupe and otherwise preserve provider order.
