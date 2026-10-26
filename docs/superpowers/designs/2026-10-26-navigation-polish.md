# Navigation Polish Design

## Intent
Daily Bytes should feel coherent as people move between the gaming feed, focused searches, saved stories, and bad URLs. The global search field must always reflect the current URL instead of showing a stale previous query, and missing routes should recover into the same dark/red gaming-first experience instead of showing the old bootcamp shrug page.

## Goals
- Keep the navbar search input synchronized with the current `q` query parameter.
- Clear stale search text when navigating to a route with no `q` parameter.
- Add a lightweight native client regression test for URL-to-search-state behavior.
- Replace the raw 404 with a branded recovery page using the existing Daily Bytes color tokens.
- Give the 404 direct paths back to the gaming feed and a priority search.

## Non-goals
- Do not redesign the main news dashboard again.
- Do not add a client testing framework or runtime dependency.
- Do not change route URLs or authentication behavior.

## Approach
Extract URL/search synchronization into a tiny dependency-free client utility that can be tested with Node's native test runner. Navbar consumes that helper on location changes. Add the client test command to the root production build gate. The error page remains a React route component but gets dedicated styling and clear recovery links.
