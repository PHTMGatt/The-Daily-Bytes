export interface NewsQualityArticle {
  title?: unknown;
  url?: unknown;
  description?: unknown;
  published_at?: unknown;
  publishedAt?: unknown;
}

const STOP_WORDS = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'this', 'that']);

export const normalizeHeadline = (value: unknown) =>
  String(value || '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const getQueryTokens = (query: string) =>
  normalizeHeadline(query)
    .split(' ')
    .filter((token) => token && !STOP_WORDS.has(token));

const getPublishedTime = (article: NewsQualityArticle) => {
  const value = article.published_at || article.publishedAt;
  if (!value) return 0;
  const time = new Date(String(value)).getTime();
  return Number.isFinite(time) ? time : 0;
};

const relevanceScore = (article: NewsQualityArticle, query: string, tokens: string[]) => {
  const title = normalizeHeadline(article.title);
  const description = normalizeHeadline(article.description);
  const normalizedQuery = normalizeHeadline(query);
  const titleWords = new Set(title.split(' ').filter(Boolean));
  const descriptionWords = new Set(description.split(' ').filter(Boolean));
  let score = 0;

  const exactTitleMatch = tokens.length === 1
    ? titleWords.has(tokens[0])
    : Boolean(normalizedQuery && title.includes(normalizedQuery));

  if (exactTitleMatch) score += 40;

  let titleMatches = 0;
  for (const token of tokens) {
    if (titleWords.has(token)) {
      score += 12;
      titleMatches += 1;
    } else if (descriptionWords.has(token)) {
      score += 3;
    }
  }

  if (tokens.length > 1 && titleMatches === tokens.length) score += 16;
  return score;
};

export const rankAndDedupeArticles = <T extends NewsQualityArticle>(articles: T[], query: string): T[] => {
  const unique: Array<{ article: T; index: number }> = [];
  const seenUrls = new Set<string>();
  const seenHeadlines = new Set<string>();

  articles.forEach((article, index) => {
    const url = String(article.url || '').trim().toLowerCase();
    const headline = normalizeHeadline(article.title);

    if (!headline || !url || seenUrls.has(url) || seenHeadlines.has(headline)) return;

    seenUrls.add(url);
    seenHeadlines.add(headline);
    unique.push({ article, index });
  });

  const tokens = getQueryTokens(query);
  if (!tokens.length) return unique.map(({ article }) => article);

  return unique
    .map(({ article, index }) => ({
      article,
      index,
      score: relevanceScore(article, query, tokens),
      publishedTime: getPublishedTime(article),
    }))
    .sort((a, b) =>
      b.score - a.score ||
      b.publishedTime - a.publishedTime ||
      a.index - b.index
    )
    .map(({ article }) => article);
};
