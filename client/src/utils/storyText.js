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

// Same cleanup but keeps case, for names that are also everyday words ("ARK" vs "Lost Ark",
// "DOOM" vs "doom and gloom", "Steam" vs "picks up steam", "Far Cry" vs "a far cry from").
const normalizeCased = (value) =>
  ` ${String(value ?? '')
    .replace(/['’]/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()} `;

// Multi-word labels that are also ordinary English phrases.
const PHRASE_NAMES = new Set(['far cry', 'black ops']);

const needlesFor = ([label, query]) => {
  const needles = [];
  const seen = new Set();
  const add = (raw) => {
    const lower = normalize(raw).trim();
    if (!lower || seen.has(lower)) return;
    seen.add(lower);
    const cased = !lower.includes(' ') || PHRASE_NAMES.has(lower);
    needles.push(cased ? { text: normalizeCased(raw).trim(), cased: true } : { text: lower, cased: false });
    // "The Witcher 3" should also match "Witcher 3".
    if (lower.startsWith('the ')) add(String(raw).replace(/^\s*the\s+/i, ''));
  };
  add(label);
  add(query);
  return needles;
};

const firstIndex = (haystacks, needles) => {
  let best = -1;
  for (const needle of needles) {
    const haystack = needle.cased ? haystacks.cased : haystacks.lower;
    const index = haystack.indexOf(` ${needle.text} `);
    if (index !== -1 && (best === -1 || index < best)) best = index;
  }
  return best;
};

/**
 * Pick the badge for a story: the chip named EARLIEST in the headline (chip order breaks ties),
 * then the same in the summary. One-word names and phrase-like names ("Far Cry") must match
 * case too, so everyday words do not count. Falls back to `fallback`, never an empty badge.
 * @param {{ title?: string, description?: string | null }} article
 * @param {Array<[string, string]>} chips ordered [label, query] pairs
 * @param {string} fallback label used when nothing matches
 */
export const matchStoryTag = (article, chips, fallback) => {
  for (const text of [article?.title, article?.description]) {
    const haystacks = { lower: normalize(text), cased: normalizeCased(text) };
    let best = null;
    for (const chip of chips || []) {
      const index = firstIndex(haystacks, needlesFor(chip));
      if (index !== -1 && (!best || index < best.index)) best = { index, label: chip[0] };
    }
    if (best) return best.label;
  }
  return String(fallback || '').trim() || 'News';
};
