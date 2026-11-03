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

export const parseNewsCategory = (value: unknown): ParsedNewsCategory => {
  const category = String(value ?? '').trim().toLowerCase();
  if (!category) return { ok: true, category: '' };
  return SUPPORTED_CATEGORIES.has(category) ? { ok: true, category } : { ok: false };
};
