# Article Image Resilience Design

## Intent
Third-party news image URLs can be missing, expired, blocked, or return errors after the article data has loaded. Daily Bytes should never show the browser's broken-image icon in portfolio-facing news cards.

## Goals
- Use the existing Daily Bytes visual fallback when an article has no usable image URL.
- Switch to that fallback when a remote image fires an error.
- Reset image state when a card receives a different source URL.
- Apply the behavior consistently to live-feed and saved-story cards.

## Non-goals
- Do not proxy or rehost third-party images.
- Do not make additional provider requests.
- Do not change article or Mongo data shapes.

## Approach
Add a small reusable React `ArticleImage` component backed by a dependency-free image-display helper. Test the helper with the existing native client runner, then replace duplicated `<img>`/fallback branches in DailyByte and Saved. Existing card CSS remains the visual source of truth.
