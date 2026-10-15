# The Daily Bytes: review pass

This branch fixes the existing browser-local reader demo. It does not migrate accounts to MongoDB or PostgreSQL.

## Implemented
- One canonical auth module replaces conflicting `.js`, `.ts` and `.tsx` implementations.
- Local demo-account behavior and password limitations are disclosed on account screens.
- News provider calls move behind a server-only, HTTPS proxy. The client no longer includes the provider key.
- Search is explicit-submit, cancellable and rendered as text instead of injected HTML.
- Correct provider pagination, timeouts, input/URL validation, image-optional stories, visible configuration/failure responses and retry controls.
- Horoscope errors are visible, API failures do not leak request configuration, unknown API paths return JSON 404s.
- Server module output now matches its ESM package configuration; static paths are independent of launch directory.
- Mobile navigation no longer overlays headings. Added accessible theme/navigation/category controls, real category links, titles, favicon and skip navigation.
- Removed a contact form that claimed success without delivering a message; replaced with honest project/contact information.
- Tests, CI, dependency refresh and server environment example.

## Verified locally
- Server and client production builds, four server tests and 26 desktop/mobile browser checks pass.
- Tests use fixture news, simulate upstream failure/retry, verify text injection is inert and test local signup without nonexistent auth requests.
- No live news-provider call, database write or real contact message was made.

## Release gates
- Rotate the news key previously embedded in client source. Historical Git commits and deployed bundles can still expose it.
- Configure `MEDIASTACK_API_KEY` and `API_NINJAS_KEY` on the production server and validate provider account capabilities.
- Local passwords are not suitable for secure cloud authentication. Keep the demo clearly labeled; implement a separately reviewed server-backed auth design before private user data is introduced.
- Connected MongoDB discovery failed authentication and PostgreSQL connectivity failed. No database migration or schema change was performed.
- Final local production npm audits still report two moderate Sequelize/uuid advisories in each dependency tree; these are overlapping findings, not six distinct vulnerabilities. Review the legacy SQL dependency footprint separately.
- `VITE_API_ORIGIN` is optional and intended for isolated previews; normal production uses same-origin `/api` routes.
