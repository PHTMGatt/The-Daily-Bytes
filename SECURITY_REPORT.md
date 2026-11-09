# The Daily Bytes: 27-point security report

- **Date:** 2026-11-09, branch `claude-forge`
- **Scope:** code in this repo only. Render dashboard settings, Atlas and DNS were not inspected (UNVERIFIED where they matter).
- **Statuses:** PASS has code or test evidence. UNVERIFIED was not proven. N/A has a reason.

## Automated gates added

| Gate | Where |
|---|---|
| gitleaks working-tree scan (pinned 8.21.2, sha256-checked) with allowlist | [.github/workflows/security-pipeline.yml](.github/workflows/security-pipeline.yml), [.gitleaks.toml](.gitleaks.toml) |
| Scanner proof: 3 fake tokens must give 3 or more findings | built at run time from split strings (nothing token-shaped is committed) |
| `npm audit --audit-level=high` for `.`, `client` (production deps) and `server` | security.yml |
| Config validation (package.json parses, lockfiles exist, no tracked secret files, `.env` ignored, no secrets in committed config) | [.github/scripts/check-config.mjs](.github/scripts/check-config.mjs) |
| Build and tests | existing [validate.yml](.github/workflows/validate.yml) (client 42 tests, server 125 tests, build). Not duplicated. |

No deploy step exists in any workflow, and the repo has no `render.yaml`, so pushing to `claude-forge` cannot trigger a deploy from CI. Render auto-deploy is a dashboard setting and was not inspected.

## Checklist

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Authentication | PASS | JWT HS256 only, with expiry: `server/src/lib/authSession.ts:20-27`. Tests: `server/tests/authSession.test.mjs`. |
| 2 | API keys server-side | PASS | Mediastack and API Ninjas keys are read from env in server code only: `server/src/routes/api/mainNews.ts:16`, `horoscope.ts:17`. |
| 3 | Database lockdown | UNVERIFIED | Atlas access list and user roles are in Atlas. |
| 4 | HTTPS/TLS | PASS (partial) | Render terminates TLS (`server.ts:15`); HSTS is set on secure requests (`lib/securityHeaders.ts:22-24`). Redirect-to-HTTPS is a Render setting, UNVERIFIED. |
| 5 | Password hashing | PASS | bcrypt cost 12: `routes/auth-routes.ts:112`. Not Argon2id; acceptable, upgrade optional. |
| 6 | Server-side validation | PASS | Input normalizers and email check: `lib/authInputs.ts`; body limit 100 KB: `server.ts:18`. |
| 7 | XSS prevention | UNVERIFIED | Client is React; `dangerouslySetInnerHTML` was not audited. Article text is cleaned in `lib/textCleanup.ts`. |
| 8 | Audit logging without secrets | UNVERIFIED | Only `console.error` on startup failure (`server.ts:33`). No security-event log. |
| 9 | Admin authorization | N/A | No admin role or admin routes. |
| 10 | Injection | PASS | Mongo queries use fixed fields with normalized strings (`routes/api/savedArticles.ts:40-65`). No `$where`. |
| 11 | Env/config security | PASS | `.env` is gitignored; the new config gate enforces it and rejects tracked secret files. |
| 12 | Rate limiting | PASS | Login/register 30 per 15 min, demo/guest 60 per 15 min (`routes/auth-routes.ts:15-30`); news route limited (`routes/api/mainNews.ts:37`). |
| 13 | CORS | PASS | No CORS middleware: same-origin only. |
| 14 | Security headers / CSP | PASS (partial) | `lib/securityHeaders.ts:7-14`: frame-ancestors none, nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP. No script-src (by design, article images from any host). |
| 15 | Session cookies | N/A | Bearer JWT, no cookies. Token storage in the browser was not audited. |
| 16 | CSRF | PASS | No cookie auth, so cross-site requests carry no credentials. |
| 17 | Password reset | N/A | No reset flow. |
| 18 | File uploads | N/A | No upload route. |
| 19 | Price verification | N/A | No commerce. |
| 20 | Debug off in production | PASS | `x-powered-by` disabled (`server.ts:16`). |
| 21 | Vulnerable dependencies | PASS (production) / **FINDING** | Server 0 vulns, root 2 moderate. **Client: 1 high (`vite`, dev server) and 6 moderate in dev tools.** The fix is a major upgrade (vite 8, typescript-eslint). It is not small or safe, so it was not applied. CI gates production deps strictly and warns on dev tools. |
| 22 | Unused packages | UNVERIFIED | Not checked. |
| 23 | Exposed files / source maps | PASS | Only `client/dist` is served (`server.ts:19`). |
| 24 | Git history secret scan | UNVERIFIED | CI scans the working tree. A full-history scan is not set up here. |
| 25 | Revoke/rotate plan | N/A | No leaked secret found. |
| 26 | Full review (IDOR, boundaries) | PASS (partial) | Saved articles are keyed by the username from the verified token (`routes/api/savedArticles.ts:40,58`). **Note (medium):** the seeded `demo` user falls back to the password `dailybytes` when `DEMO_PASSWORD` is unset (`config/mongo.ts:60`). Fine for a public demo; confirm the demo account holds no real data and that Render sets `DEMO_PASSWORD` if it should be private. |
| 27 | Rerun tests, report | PASS | `npm run build`: client 42/42, server 125/125, build ok. This file is the report. |

## Outcome

GO for the checks. No critical issues; one high in client dev tooling (vite) is open and documented.

Open: upgrade vite and typescript-eslint (separate, tested change), full-history scan, confirm `DEMO_PASSWORD` in Render, Atlas review, XSS audit of the client.

## Pipeline levels (one reusable workflow)

[security-pipeline.yml](.github/workflows/security-pipeline.yml) takes a `level` input; three thin callers choose it.

| Level | Caller | Runs on | Adds |
|---|---|---|---|
| LOW | `security-low.yml` | every PR and every claude-forge push | gitleaks (tree + scanner proof), `npm audit` high/critical, config checks, build and tests where the repo's own CI does not already run them |
| MED | `security-med.yml` | nightly and manual | full-history gitleaks, dependency review, red-team tests where the repo has them |
| HIGH | `security-high.yml` | manual / pre-launch | ZAP baseline (and API fuzzing where there is an API) against a local instance with fake data, never production; then a GO / NO-GO verdict. No exemptions at this level: any high or critical advisory, failed check or open FAIL in this report is NO-GO |

Until these files are on the default branch, the med and high callers also run when `claude-forge` changes them, because schedule and manual triggers need the default branch.
