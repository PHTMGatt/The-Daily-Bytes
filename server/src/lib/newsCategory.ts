// Categories the Mediastack provider supports. Anything else is rejected up front so arbitrary
// path segments cannot reach the provider (comma/minus syntax changes its meaning) or fill the cache.
const SUPPORTED_CATEGORIES = new Set([
  'general',
  'business',
  'entertainment',
  'health',
  'science',
  'sports',
  'technology',
]);

export type ParsedNewsCategory = { ok: true; category: string } | { ok: false };

// The app is gaming- and PC-first: a request with neither a category nor keywords means the home
// gaming feed, not Mediastack's unfiltered general news (which is mostly unrelated headlines).
export const DEFAULT_FEED_KEYWORDS = 'gaming';

export const resolveFeedKeywords = (category: string, keywords: string) =>
  keywords || category ? keywords : DEFAULT_FEED_KEYWORDS;

export const parseNewsCategory =(value: unknown): ParsedNewsCategory => {
  const category = String(value ?? '').trim().toLowerCase();
  if (!category) return { ok: true, category: '' };
  return SUPPORTED_CATEGORIES.has(category) ? { ok: true, category } : { ok: false };
};
