# Daily Bytes Saved Articles Design

## Intent
Turn MongoDB into a visible product feature, not just the auth store. Signed-in readers can save stories from the gaming-first feed and revisit them from a dedicated Saved page.

## Goals
- Save and unsave live news articles per signed-in user.
- Persist bookmarks in MongoDB Atlas.
- Keep article cards visually consistent with the navy/red portfolio direction.
- Keep the existing gaming-first default experience unchanged for anonymous visitors.
- Remove the dead Sequelize user CRUD surface once the Mongo replacement is complete.

## Non-goals
- No social sharing, folders, tags, or recommendation engine in this pass.
- No scraping article bodies.

## Approach
Use a separate `saved_articles` collection with a unique compound index on `{ usernameNormalized, url }`. JWT authentication identifies the user; the client never sends a username as authority. Article metadata is stored as a snapshot so saved stories remain useful even after they disappear from the live feed.
