// Story-card text helpers: clean feed summaries and pick the one tag that says why a story is here.

// Feeds often end a description with a literal "Read more", "[...]", "…" or "[+123 chars]".
const TRAILING_NOISE = /(?:\s*(?:\[\+\d+\s*chars?\]|\[(?:…|\.\.\.)\]|read\s+more\.*|continue\s+reading\.*|…|\.\.\.))+\s*$/i;

/**
 * Clean a feed description for display. Drops trailing "Read more"-style noise and, when the text
 * was cut off mid-sentence, trims back to the last full sentence (or drops a dangling comma).
 * Returns '' when nothing readable is left.
 */
export const cleanSummary = (value) => {
  let text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  text = text.replace(TRAILING_NOISE, '').trim();
  if (!text) return '';
  if (/[.!?]["')\]]?$/.test(text)) return text;

  // Cut mid-sentence: keep the last complete sentence when there is a reasonable one.
  const lastStop = Math.max(text.lastIndexOf('. '), text.lastIndexOf('! '), text.lastIndexOf('? '));
  if (lastStop >= 40) return text.slice(0, lastStop + 1);

  // One long fragment: end it cleanly instead of on a comma or dash.
  return `${text.replace(/[\s,;:–—-]+$/, '')}…`;
};

const normalize = (value) =>
  ` ${String(value ?? '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()} `;

const needlesFor = ([label, query]) => {
  const set = new Set();
  for (const raw of [label, query]) {
    const needle = normalize(raw).trim();
    if (needle) set.add(needle);
    // "The Witcher 3" should also match "Witcher 3".
    if (needle.startsWith('the ')) set.add(needle.slice(4));
  }
  return [...set];
};

/**
 * Pick the badge for a story: the first chip (games/gear first, then topics) whose label or query
 * appears in the headline, then in the summary. Falls back to `fallback`, never an empty badge.
 * @param {{ title?: string, description?: string | null }} article
 * @param {Array<[string, string]>} chips ordered [label, query] pairs
 * @param {string} fallback label used when nothing matches
 */
export const matchStoryTag = (article, chips, fallback) => {
  const haystacks = [normalize(article?.title), normalize(article?.description)];
  for (const haystack of haystacks) {
    for (const chip of chips || []) {
      if (needlesFor(chip).some((needle) => haystack.includes(` ${needle} `))) return chip[0];
    }
  }
  return String(fallback || '').trim() || 'News';
};
