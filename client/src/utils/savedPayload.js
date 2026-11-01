// Builds the payload for POST /api/saved from a news feed article. Provider articles use
// several field spellings (image/urlToImage, published_at/publishedAt, string/object source).
const sourceName = (article) => {
  if (typeof article.source === 'string' && article.source) return article.source;
  return article.source?.name || article.author || 'News source';
};

export const buildSavedPayload = (article, topic = '') => ({
  title: article.title,
  url: article.url,
  description: (article.description || '').trim(),
  image: article.image || article.urlToImage || '',
  source: sourceName(article),
  publishedAt: article.publishedAt || article.published_at || '',
  topic: topic || '',
});
