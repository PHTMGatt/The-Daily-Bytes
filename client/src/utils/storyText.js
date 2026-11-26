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

// Names that are also everyday words ("doom and gloom", "Lost Ark", "picks up steam", "a far cry
// from"). Only these match case-sensitively; brands like NVIDIA or PlayStation match any case.
const CASED_NAMES = new Set(['ark', 'doom', 'steam', 'vr', 'far cry', 'black ops']);

// Title-case forms outlets use for the all-caps names: "Doom: The Dark Ages", "Ark: Survival".
// Broad topics that only win when no specific game, brand or product is named in the same text.
const GENERIC_LABELS = new Set(['gaming', 'game releases', 'industry', 'esports', 'tech', 'hardware', 'pc gaming']);

const titleCase = (text) => text.replace(/\b([A-Z])([A-Z]+)\b/g, (_, first, rest) => first + rest.toLowerCase());

const needlesFor = ([label, query]) => {
  const needles = [];
  const seen = new Set();
  const add = (raw) => {
    const lower = normalize(raw).trim();
    if (!lower || seen.has(lower)) return;
    seen.add(lower);
    if (CASED_NAMES.has(lower)) {
      const cased = normalizeCased(raw).trim();
      needles.push({ text: cased, cased: true });
      const title = titleCase(cased);
      // "Doom"/"Ark" in title case only counts at the start of a headline or before a colon.
      if (title !== cased) needles.push({ text: title, cased: true, titleForm: true });
    } else {
      needles.push({ text: lower, cased: false });
    }
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
    let index;
    if (needle.titleForm) {
      // Title case ("Doom", "Ark") counts only as the headline's first word or right before a colon.
      const raw = haystacks.raw.trim();
      const atStart = new RegExp(`^${needle.text}(?![A-Za-z0-9])`).test(raw);
      const colon = raw.search(new RegExp(`(?<![A-Za-z0-9])${needle.text}\\s*:`));
      index = atStart ? 0 : colon;
    } else {
      const haystack = needle.cased ? haystacks.cased : haystacks.lower;
      index = haystack.indexOf(` ${needle.text} `);
    }
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
    const haystacks = { lower: normalize(text), cased: normalizeCased(text), raw: String(text ?? '') };
    let best = null;
    let generic = null;
    for (const chip of chips || []) {
      const index = firstIndex(haystacks, needlesFor(chip));
      if (index === -1) continue;
      if (GENERIC_LABELS.has(String(chip[0]).trim().toLowerCase())) {
        if (!generic || index < generic.index) generic = { index, label: chip[0] };
      } else if (!best || index < best.index) best = { index, label: chip[0] };
    }
    if (best) return best.label;
    if (generic) return generic.label;
  }
  return String(fallback || '').trim() || 'News';
};
