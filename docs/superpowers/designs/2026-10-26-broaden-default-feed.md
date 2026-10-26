# Broader Gaming Default Feed Design

## Intent
The Daily Bytes homepage is supposed to feel like a gaming + enthusiast PC dashboard, but the provider request currently sends only the literal keyword `gaming`. Server-side ranking can prioritize Witcher, NVIDIA, RAM, and hardware only when those stories are present in the provider response. Mediastack supports multiple comma-separated keywords in one request, so the default feed can broaden its candidate set without spending more API calls.

## Goals
- Keep the public/default logical query as `gaming`.
- Translate only the default `gaming` provider request into one comma-separated gaming/hardware keyword set.
- Include Witcher/CDPR, NVIDIA/RTX/GPU, RAM/DDR5/SSD, and PC hardware candidates in that single request.
- Keep focused/manual user searches unchanged.
- Preserve cache keys, visible query labels, response shape, pagination, call count, and existing ranking/deduplication.

## Non-goals
- Do not issue multiple provider requests and merge them.
- Do not broaden arbitrary user-entered searches.
- Do not change the homepage URL or the ranking weights in this pass.

## Approach
Add a pure `buildProviderKeywords(keywords)` helper in the server. For a normalized logical query of `gaming`, return a fixed comma-separated provider query containing the priority terms. For all other queries, return the trimmed original string unchanged. The news route will use the expanded value only for the upstream Mediastack `keywords` parameter; cache and response metadata continue to use the logical query.
