const clean = (value) => (typeof value === 'string' ? value.trim() : '');

export const buildSavedArticlePayload = (article, topic) => ({
  title: clean(article?.title),
  url: clean(article?.url),
  description: clean(article?.description),
  image: clean(article?.image),
  source: clean(article?.source),
  publishedAt: clean(article?.publishedAt),
  topic: clean(topic) || 'Latest',
});
