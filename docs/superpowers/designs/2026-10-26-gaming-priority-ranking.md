# Gaming Priority Ranking Design

## Intent
Daily Bytes should feel deliberately built around gaming and enthusiast PC hardware. The default `gaming` search should favor Witcher/CDPR, NVIDIA/RTX/GPU, RAM/DDR5/SSD, PC hardware, Steam and major gaming-platform stories when those stories are present, while still preserving every unique provider result.

## Goals
- Boost gaming and PC-hardware priority terms for the default `gaming` feed.
- Recognize useful aliases for focused searches such as RAM prices, GPU prices, PC hardware, Witcher 3 and NVIDIA.
- Keep direct query matches stronger than alias-only matches.
- Preserve existing dedupe, freshness tie-breaking, cache behavior and response shape.

## Non-goals
- Do not add more provider requests or spend more Mediastack quota.
- Do not filter out valid unique stories.
- Do not add ML, an editorial CMS or a new dependency.

## Approach
Extend the existing pure server-side scoring helper with a small deterministic query-profile map. Each recognized query gets a bounded list of related terms. Direct query tokens keep the existing high weights; profile aliases receive a smaller bonus so they improve ordering without overpowering exact matches. Unknown queries retain the current behavior unchanged.
