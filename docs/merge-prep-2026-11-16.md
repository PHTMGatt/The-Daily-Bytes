# Merge prep: claude-forge to main (PR #37)

State on 2026-11-16: PR #37 is OPEN, MERGEABLE, CLEAN. CI on claude-forge (e6d5bdd): Validate and security-low green; med/high jobs skipped by design. Nothing is merged or deployed.

## 1. Revoke the 3 leaked news keys first (Bryen)

The keys sit in old history only (not in the current tree). Revoking makes them harmless. Key values are never written here.

| Commit | Provider | Where to revoke |
|---|---|---|
| ca73892 (`client/src/pages/DailyByte.tsx`, hardcoded `API_KEY`) | NewsAPI.org | newsapi.org, log in, Account, regenerate API key |
| 5ed14a0 (`NEWS_API_KEY` in DailyByte page) | NewsAPI.org (second key) | Same account page. If it was another account, repeat there. A regenerate kills the old key at once |
| 373781d (new `API_KEY`, Mediastack refactor) | Mediastack (apilayer) | mediastack.com, Dashboard, Your API Access Key, Reset/regenerate |

After revoking: put the new Mediastack key in Render as `MEDIASTACK_API_KEY`. NewsAPI is no longer used by the code, so no new NewsAPI key is needed.
Check: old key calls should return 401/invalid key.

## 2. Pre-flight on Render (Bryen, dashboard, 2 minutes)

- `JWT_SECRET_KEY`: must be 32+ characters. The server now refuses to boot if it is missing or shorter (`server/src/lib/jwtSecret.ts`). Too short means a failed deploy, not a weak deploy, and Render keeps the old version live.
- `DEMO_PASSWORD`: optional. If unset, production generates a random one each boot (demo login then fails unless you read it). Set it if you want the demo login to work. Use a fresh value, the old one counts as exposed.
- `MONGODB_URI`, `MONGODB_DB`, `MEDIASTACK_API_KEY` must be real Render env vars (the server reads them before dotenv).
- Never paste these values in chat.

## 3. Merge (Bryen says yes, then)

PR #37 merge to main. Render and Netlify auto-deploy if wired to main (production deploy gate: yes/no from Bryen).

## 4. Smoke after deploy (20 min live check)

- Home page loads and shows news cards (proves the Mediastack key works).
- Demo login works (if DEMO_PASSWORD set), logout works.
- Save an article, reload, it persists.
- Render logs: no `JWT_SECRET_KEY` error, MongoDB connected.

## 5. Rollback

- Fast: Render dashboard, service, Events, Rollback to previous deploy. Netlify: Deploys, publish previous deploy.
- Code: `git revert -m 1 <merge-commit>` on main via a PR. No force-push.
- Data: this branch changes no schema, so no data rollback.
