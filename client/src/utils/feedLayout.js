// Feed rhythm and the phone header's hide-on-scroll rule.

// Phones show compact rows (4 per screen) with a full image card every 5th story to break the
// rhythm. Wider screens keep the standard grid.
export const feedVariant = (index, isPhone) => {
  if (!isPhone) return 'standard';
  return index % 5 === 4 ? 'standard' : 'compact';
};

/**
 * How far a horizontal row must scroll so `item` sits fully inside `row`, `clear` px from each
 * edge (the edge fade). Both are viewport boxes; 0 means it is already clear.
 */
export const rowScrollDelta = (item, row, clear) => {
  if (item.left - clear < row.left) return item.left - clear - row.left;
  if (item.right + clear > row.right) return item.right + clear - row.right;
  return 0;
};

const TOP_ZONE = 120; // always show the header near the top of the page
const JITTER = 8; // ignore tiny scroll movements (momentum, address-bar resize)

/**
 * Whether the phone header should be hidden after a scroll from `previousY` to `y`.
 * Hides when scrolling down past the top zone, shows again on any real scroll up.
 */
export const nextHeaderHidden = (previousY, y, hidden) => {
  if (y <= TOP_ZONE) return false;
  const delta = y - previousY;
  if (Math.abs(delta) < JITTER) return hidden;
  return delta > 0;
};
