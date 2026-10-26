# Server-Issued Demo Session Design

## Intent
The login page currently hard-codes the demo account password in the browser. Production seeds the demo account from `DEMO_PASSWORD`, so the button can break when the server password changes and it unnecessarily duplicates a credential in client code. Demo access should be intentionally public without exposing or depending on the demo password.

## Goals
- Keep one-click portfolio demo access.
- Remove the demo password from all client code and browser requests.
- Add `POST /api/auth/demo` that issues a normal 12-hour JWT for the existing seeded demo user.
- Reuse the same session-token construction as regular login/register.
- Fail safely if the demo account is unexpectedly missing.
- Add regression coverage for session token claims and the client demo-request shape.

## Non-goals
- Do not expose `DEMO_PASSWORD` or any Render secret.
- Do not create a privileged demo role; demo remains an ordinary reader account.
- Do not change normal username/password login or signup behavior.
- Do not add OAuth or another authentication provider.

## Approach
Extract JWT creation into a small server utility with a constant demo username and a testable token function. Add a passwordless `/demo` auth route that looks up the seeded `demo` user and returns a standard session token. On the client, add a dependency-free auth request helper so the native client suite can verify that demo access sends no password/body; `authAPI.ts` and `Login.tsx` consume that path.
