import { cleanProviderText } from './textCleanup.js';

export interface NewsQualityArticle {
  title?: unknown;
  url?: unknown;
  description?: unknown;
  published_at?: unknown;
  publishedAt?: unknown;
  source?: unknown;
}

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'this', 'that']);
const PROFILE_TITLE_BONUS = 6;
const PROFILE_DESCRIPTION_BONUS = 2;
const PROFILE_BONUS_CAP = 24;

const QUERY_PROFILES: Record<string, string[]> = {
  gaming: [
    'witcher', 'cd projekt', 'cdpr', 'nvidia', 'rtx', 'geforce', 'gpu', 'pc', 'hardware',
    'amd', 'radeon', 'steam', 'xbox', 'playstation', 'nintendo', 'ram', 'ddr5', 'ssd',
    'intel', 'ryzen', 'dlss', 'ps5', 'steam deck', 'epic games', 'game pass', 'switch 2',
    'graphics card', 'dram', 'handheld',
    'vram', 'gddr7', 'blackwell', 'rdna', 'fsr', 'ray tracing', 'nvme', 'rog ally',
    'legion go', 'steam machine', 'xbox series',
  ],
  'the witcher 3': ['witcher', 'wild hunt', 'geralt', 'cd projekt', 'cdpr'],
  'nvidia gpu': ['nvidia', 'geforce', 'rtx', 'gpu', 'dlss'],
  'amd gpu': ['amd', 'radeon', 'rdna', 'fsr', 'ryzen', 'gpu', 'graphics card'],
  'gpu prices': ['gpu', 'graphics card', 'rtx', 'geforce', 'radeon'],
  'ram prices': ['ram', 'ddr5', 'dram', 'memory'],
  'ram ssd prices': ['ram', 'ddr5', 'dram', 'memory', 'ssd', 'nvme', 'storage'],
  'pc hardware': [
    'pc', 'hardware', 'gpu', 'cpu', 'ram', 'ddr5', 'ssd', 'nvme', 'motherboard', 'cooling',
    'case', 'monitor',
  ],
  'video game releases': ['release', 'launch', 'game', 'gaming', 'steam', 'xbox', 'playstation', 'nintendo'],
};

// Common typed spellings that should reuse a curated profile.
const PROFILE_ALIASES: Record<string, string> = {
  nvidia: 'nvidia gpu',
  rtx: 'nvidia gpu',
  geforce: 'nvidia gpu',
  witcher: 'the witcher 3',
  'witcher 3': 'the witcher 3',
  amd: 'amd gpu',
  radeon: 'amd gpu',
  ryzen: 'amd gpu',
  'gpu price': 'gpu prices',
  gpu: 'gpu prices',
  gpus: 'gpu prices',
  'graphics cards': 'gpu prices',
  'graphics card': 'gpu prices',
  'memory prices': 'ram prices',
  'dram prices': 'ram prices',
  'ddr5 prices': 'ram prices',
  'ssd price': 'ram ssd prices',
  hardware: 'pc hardware',
  'pc gaming': 'gaming',
  'graphics card prices': 'gpu prices',
  'ram price': 'ram prices',
  'ssd prices': 'ram ssd prices',
  'game releases': 'video game releases',
  'video games': 'gaming',
};

export const normalizeHeadline = (value: unknown) =>
  String(value || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const TRACKING_PARAM = /^(utm_|fbclid$|gclid$|mc_|ref$|ref_src$)/;
const NEAR_DUPLICATE_THRESHOLD = 0.75;
const NEAR_DUPLICATE_MIN_TOKENS = 4;

export const canonicalizeUrl = (value: unknown) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const url = new URL(raw);
    url.hash = '';
    url.hostname = url.hostname.replace(/^www\./, '');
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAM.test(key.toLowerCase())) url.searchParams.delete(key);
    }
    url.searchParams.sort();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString().replace(/\/$/, '').toLowerCase();
  } catch {
    return raw.toLowerCase();
  }
};

// Article URLs are rendered as links, so only plain web URLs are acceptable.
export const isHttpUrl = (value: unknown) => {
  try {
    const { protocol } = new URL(String(value || '').trim());
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

// Syndicated titles often end with " - Outlet"; drop it only when it names the article's own
// source, so genuine subtitles ("Elden Ring - Shadow of the Erdtree") are never altered.
const stripSourceSuffix = (title: unknown, source: unknown) => {
  const text = String(title || '');
  const outlet = normalizeHeadline(source);
  if (!outlet) return text;
  const match = text.match(/^(.*\S)\s+[-–—|:]\s+([^-–—|:]+)$/);
  return match && normalizeHeadline(match[2]) === outlet ? match[1] : text;
};

const headlineTokens = (headline: string) =>
  new Set(headline.split(' ').filter((token) => token && !STOP_WORDS.has(token)));

const isNearDuplicate = (a: Set<string>, b: Set<string>) => {
  if (a.size < NEAR_DUPLICATE_MIN_TOKENS || b.size < NEAR_DUPLICATE_MIN_TOKENS) return false;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / (a.size + b.size - shared) >= NEAR_DUPLICATE_THRESHOLD;
};

const getQueryTokens = (query: string) =>
  normalizeHeadline(query)
    .split(' ')
    .filter((token) => token && !STOP_WORDS.has(token));

// Providers occasionally emit future-dated stories (bad timezone, scheduled posts);
// beyond a small clock-skew allowance the timestamp is untrustworthy, so ignore it.
const FUTURE_SKEW_MS = 60 * 60 * 1000;

const getPublishedTime = (article: NewsQualityArticle, now: number) => {
  const value = article.published_at || article.publishedAt;
  if (!value) return 0;
  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) && time <= now + FUTURE_SKEW_MS ? time : 0;
};

// Treat simple plurals as the same word so "GPUs" matches "gpu" and "console" matches "consoles".
const hasWord = (words: Set<string>, word: string) =>
  words.has(word) ||
  words.has(`${word}s`) ||
  (word.length > 3 && word.endsWith('s') && words.has(word.slice(0, -1)));

const matchesTerm = (normalizedText: string, words: Set<string>, term: string) =>
  term.includes(' ') ? normalizedText.includes(term) : hasWord(words, term);

const profileBonus = (
  title: string,
  description: string,
  normalizedQuery: string,
  queryTokens: Set<string>,
) => {
  const profile = QUERY_PROFILES[PROFILE_ALIASES[normalizedQuery] ?? normalizedQuery];
  if (!profile) return 0;

  const titleWords = new Set(title.split(' ').filter(Boolean));
  const descriptionWords = new Set(description.split(' ').filter(Boolean));
  let bonus = 0;

  for (const term of profile) {
    if (term === normalizedQuery || (!term.includes(' ') && queryTokens.has(term))) continue;

    if (matchesTerm(title, titleWords, term)) {
      bonus += PROFILE_TITLE_BONUS;
    } else if (matchesTerm(description, descriptionWords, term)) {
      bonus += PROFILE_DESCRIPTION_BONUS;
    }

    if (bonus >= PROFILE_BONUS_CAP) return PROFILE_BONUS_CAP;
  }

  return bonus;
};

const HOUR_MS = 60 * 60 * 1000;
const FRESHNESS_TIERS: Array<[number, number]> = [
  [24 * HOUR_MS, 10],
  [72 * HOUR_MS, 6],
  [7 * 24 * HOUR_MS, 3],
];

const freshnessBonus = (publishedTime: number, now: number) => {
  if (!publishedTime) return 0;
  const age = now - publishedTime;
  if (age < 0) return 0;
  for (const [maxAge, bonus] of FRESHNESS_TIERS) if (age <= maxAge) return bonus;
  return 0;
};

const relevanceScore = (article: NewsQualityArticle, query: string, tokens: string[]) => {
  const title = normalizeHeadline(article.title);
  const description = normalizeHeadline(article.description);
  const normalizedQuery = normalizeHeadline(query);
  const titleWords = new Set(title.split(' ').filter(Boolean));
  const descriptionWords = new Set(description.split(' ').filter(Boolean));
  const queryTokenSet = new Set(tokens);
  let score = 0;

  const exactTitleMatch = tokens.length === 1
    ? hasWord(titleWords, tokens[0])
    : Boolean(normalizedQuery && title.includes(normalizedQuery));

  if (exactTitleMatch) score += 40;

  let titleMatches = 0;
  for (const token of tokens) {
    if (hasWord(titleWords, token)) {
      score += 12;
      titleMatches += 1;
    } else if (hasWord(descriptionWords, token)) {
      score += 3;
    }
  }

  if (tokens.length > 1 && titleMatches === tokens.length) score += 16;
  score += profileBonus(title, description, normalizedQuery, queryTokenSet);
  return score;
};

const MAX_CONSECUTIVE_PER_SOURCE = 2;

// Stable reorder: defer a story when its source already filled the last slots,
// so one outlet cannot take over the top of the feed. Nothing is dropped.
export const diversifySources = <T extends NewsQualityArticle>(
  articles: T[],
  maxRun: number = MAX_CONSECUTIVE_PER_SOURCE,
): T[] => {
  const sourceOf = (article: T) => String(article.source || '').trim().toLowerCase();
  const pending = [...articles];
  const result: T[] = [];
  let runSource = '';
  let runLength = 0;

  while (pending.length) {
    let pick = pending.findIndex((article) => {
      const source = sourceOf(article);
      return !source || source !== runSource || runLength < maxRun;
    });
    if (pick === -1) pick = 0;
    const [article] = pending.splice(pick, 1);
    const source = sourceOf(article);
    runLength = source && source === runSource ? runLength + 1 : 1;
    runSource = source;
    result.push(article);
  }

  return result;
};

export const rankAndDedupeArticles = <T extends NewsQualityArticle>(
  articles: T[],
  query: string,
  now: number = Date.now(),
): T[] => {
  const cleaned = articles.map((article) => ({
    ...article,
    title: typeof article.title === 'string' ? cleanProviderText(article.title) : article.title,
    description: typeof article.description === 'string'
      ? cleanProviderText(article.description)
      : article.description,
  }));
  const unique: Array<{ article: T; index: number }> = [];
  const seenUrls = new Set<string>();
  const seenHeadlines = new Set<string>();

  cleaned.forEach((article, index) => {
    const url = canonicalizeUrl(article.url);
    const headline = normalizeHeadline(stripSourceSuffix(article.title, article.source));

    if (!headline || !url || !isHttpUrl(article.url) || seenUrls.has(url) || seenHeadlines.has(headline)) return;

    seenUrls.add(url);
    seenHeadlines.add(headline);
    unique.push({ article, index });
  });

  const dropNearDuplicates = (items: T[]) => {
    const kept: T[] = [];
    const keptTokens: Array<Set<string>> = [];
    for (const item of items) {
      const tokens = headlineTokens(normalizeHeadline(stripSourceSuffix(item.title, item.source)));
      if (keptTokens.some((existing) => isNearDuplicate(existing, tokens))) continue;
      kept.push(item);
      keptTokens.push(tokens);
    }
    return kept;
  };

  const tokens = getQueryTokens(query);
  if (!tokens.length) return diversifySources(dropNearDuplicates(unique.map(({ article }) => article)));

  return diversifySources(dropNearDuplicates(unique
    .map(({ article, index }) => {
      const relevance = relevanceScore(article, query, tokens);
      return {
        article,
        index,
        // Freshness only breaks ties among matching stories; it must not lift unrelated ones.
        score: relevance > 0 ? relevance + freshnessBonus(getPublishedTime(article, now), now) : 0,
        publishedTime: getPublishedTime(article, now),
      };
    })
    .sort((a, b) =>
      b.score - a.score ||
      b.publishedTime - a.publishedTime ||
      a.index - b.index
    )
    .map(({ article }) => article)));
};
