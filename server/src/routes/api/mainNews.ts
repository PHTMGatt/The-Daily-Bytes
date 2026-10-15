import express from 'express';
import axios from 'axios';

const router = express.Router();
const categories = new Set(['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology']);
const isHttpUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
};
router.get('/:category?', async (req, res) => {
  const category = req.params.category || '';
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const page = Number(req.query.page || 1);
  const perPage = 12;
  if ((category && !categories.has(category)) || query.length > 120 ||
    !Number.isSafeInteger(page) || page < 1 || page > 1000) {
    return res.status(400).json({ message: 'Invalid news search parameters.' });
  }
  if (!process.env.MEDIASTACK_API_KEY) return res.status(503).json({ message: 'News service is not configured.' });
  try {
    const response = await axios.get('https://api.mediastack.com/v1/news', {
      timeout: 10000,
      params: { access_key: process.env.MEDIASTACK_API_KEY, categories: category,
        keywords: query, countries: 'us', languages: 'en', sort: 'published_desc',
        limit: perPage, offset: (page - 1) * perPage },
    });
    if (response.data.error || !Array.isArray(response.data.data)) throw new Error('Invalid provider response');
    const seen = new Set<string>();
    const articles = response.data.data.filter((article: any) => {
      if (!article || !isHttpUrl(article.url) || typeof article.title !== 'string' || seen.has(article.url)) return false;
      seen.add(article.url);
      return true;
    }).map((article: any) => ({
      title: article.title, description: typeof article.description === 'string' ? article.description : '',
      url: article.url, image: isHttpUrl(article.image) ? article.image : null,
      published_at: article.published_at,
    }));
    const reported = Number(response.data.pagination?.total);
    const totalResults = Number.isFinite(reported) && reported >= 0 ? reported : articles.length;
    return res.json({ articles, page, perPage, totalResults, hasMore: page * perPage < totalResults });
  } catch {
    // Never log Axios config: it contains the provider key in query parameters.
    console.error('News provider request failed');
    return res.status(502).json({ message: 'The news provider is temporarily unavailable.' });
  }
});
export default router;
