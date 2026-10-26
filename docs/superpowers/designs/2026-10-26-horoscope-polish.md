# Horoscope Polish Design

## Intent
The Horoscope route is a real feature backed by the hardened API proxy, but its client still looks and behaves like legacy coursework: it queries the DOM for the selected sign label, logs request failures in the browser, renders placeholder lucky-number/mood fields the provider does not actually supply, and has no explicit loading/error state.

## Goals
- Keep the existing `/horoscope` feature but make it visually consistent with Daily Bytes.
- Represent zodiac signs as data so labels/date ranges come from React state, not DOM lookups.
- Show honest provider-backed fields only: sign, date, and horoscope text.
- Add explicit loading/error/ready states and a working retry flow.
- Remove browser console logging and legacy response-shape comments.
- Cover zodiac metadata and response normalization with the native client test runner.

## Non-goals
- Do not invent lucky numbers, moods, compatibility, or other horoscope data.
- Do not add a second horoscope provider or extra network calls.
- Do not change the server API contract in this pass.

## Approach
Add a dependency-free `horoscopeView.js` utility containing zodiac metadata and response normalization. The React page will derive the selected label/range directly from that data, fetch the existing `/api/horoscope` endpoint with an abort-safe effect, and render styled loading/error/ready cards using the shared Daily Bytes navy/red palette.
