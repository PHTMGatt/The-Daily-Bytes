# Shared News Saving Design

## Intent
Mongo-backed Saved Articles is a core Daily Bytes feature, but bookmark controls currently exist only on the main dashboard. Trending and category pages use the shared NewsComponent, so readers can discover a story there but must navigate elsewhere to save it. Saving should work consistently anywhere Daily Bytes renders a full news card.

## Goals
- Add save/unsave controls to Trending and category cards.
- Reuse the existing `/api/saved` endpoints and authenticated Mongo data.
- Load the reader's saved URLs once per shared news surface when signed in.
- Send signed-out readers to the existing login route when they choose Save.
- Preserve article/source/date/topic metadata when saving from shared feeds.
- Show a compact success/error status without disturbing pagination.

## Non-goals
- Do not change the Mongo schema or saved API contract.
- Do not add persistent local bookmarks for signed-out users.
- Do not refactor the main DailyByte save implementation in this pass.

## Approach
Add one pure client utility that builds a `SavedArticlePayload`-compatible object from normalized card fields and test it with the native client runner. Extend `NewsComponent` with saved URL state, initial saved-list loading, and save/remove actions using the existing API client. The card footer gains the same red-accent bookmark affordance as the main dashboard.
