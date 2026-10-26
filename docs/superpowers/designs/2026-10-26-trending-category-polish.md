# Trending and Category Polish Design

## Intent
The main Daily Bytes dashboard is now gaming-first, but the one-click Trending and legacy category routes still feel like a generic starter news app. This pass makes the shared news grid consistent with the polished dashboard while keeping those routes useful.

## Goals
- Make `/trending` a gaming-first priority watch rather than a misleading generic "Latest News" page.
- Add an intentional loading state instead of briefly showing "No news available" while a request is still pending.
- Reuse resilient article thumbnails so broken provider images never surface.
- Let the shared news grid accept custom heading/subtitle/keyword inputs without changing existing category URLs.
- Remove stale TODO/comment scaffolding from thin category pages touched by this surface.
- Keep pagination and the existing `/api/news` contract.

## Non-goals
- Do not claim social engagement or popularity data we do not have.
- Do not add a second news provider or extra requests per page load.
- Do not remove the existing Technology, Health, Sports, or Entertainment routes.

## Approach
Extend `NewsComponent` with optional `heading`, `subtitle`, and `keywords` props. Trending will request the already-supported `gaming` keyword and label itself "Trending Watch" / latest priority stories rather than pretending Mediastack exposes engagement rankings. A tiny pure view-state helper will drive loading/error/empty/ready rendering and be covered by the existing native client test runner. Article cards will use the shared `ArticleImage` component.
