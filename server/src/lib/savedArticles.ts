export interface SavedArticleInput {
  title?: unknown;
  url?: unknown;
  description?: unknown;
  image?: unknown;
  source?: unknown;
  publishedAt?: unknown;
  topic?: unknown;
}

export interface SavedArticleSnapshot {
  title: string;
  url: string;
  description: string;
  image: string;
  source: string;
  publishedAt: string;
  topic: string;
}

const clean = (value: unknown) => String(value ?? '').trim();

const cleanHttpUrl = (value: unknown, field: string, required = false) => {
  const text = clean(value);
  if (!text && !required) return '';

  try {
    const url = new URL(text);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${field} must be a valid http(s) URL.`);
  }
};

export const normalizeSavedArticle = (input: SavedArticleInput): SavedArticleSnapshot => {
  const title = clean(input.title);
  if (!title) throw new Error('Article title is required.');

  return {
    title,
    url: cleanHttpUrl(input.url, 'Article URL', true),
    description: clean(input.description),
    image: cleanHttpUrl(input.image, 'Article image'),
    source: clean(input.source),
    publishedAt: clean(input.publishedAt),
    topic: clean(input.topic),
  };
};
