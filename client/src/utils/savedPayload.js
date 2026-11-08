import { getArticleSource } from './articleSource.js';

// Builds the payload for POST /api/saved from a news feed article. Provider articles use
// several field spellings (image/urlToImage, published_at/publishedAt, string/object source).
export const buildSavedPayload = (article, topic = '') => ({
  title: article.title,
  url: article.url,
  description: (article.description || '').trim(),
  image: article.image || article.urlToImage || '',
  source: getArticleSource(article),
  publishedAt: article.publishedAt || article.published_at || '',
  topic: topic || '',
});
