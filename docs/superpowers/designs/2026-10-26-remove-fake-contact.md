# Remove Fake Contact Route Design

## Intent
Daily Bytes still exposes a hidden `/contact` route containing placeholder email/phone data, generic social links, an unhandled form, and TODO scaffolding. It is not linked from the current product navigation and creates portfolio risk if discovered.

## Decision
Remove the route, component, and stylesheet entirely. Unknown `/contact` URLs will fall through the existing branded 404 recovery page. No replacement contact form will be invented because the app has no real messaging backend or approved public contact details.

## Constraints
- Do not invent contact information.
- Do not add a mail service or form backend.
- Preserve all current navigated product routes.
