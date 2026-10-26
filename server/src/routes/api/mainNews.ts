import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

const MEDIASTACK_API_KEY = process.env.MEDIASTACK_API_KEY;
const BASE_URL = 'https://api.mediastack.com/v1/news';

router.get('/:category?', async (req: Request, res: Response) => {
  if (!MEDIASTACK_API_KEY) {
    return res.status(503).json({ message: 'News service is not configured.' });
  }

  try {
    const category = (req.params.category || '').trim().toLowerCase();
    const keywords = typeof req.query.keywords === 'string'
      ? req.query.keywords.trim().slice(0, 120)
      : '';
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.min(24, Math.max(1, parseInt(req.query.pageSize as string, 10) || 12));
    const fetchLimit = Math.min(100, pageSize * 2);
    const offset = (page - 1) * fetchLimit;

    const params: Record<string, string | number> = {
      access_key: MEDIASTACK_API_KEY,
      countries: 'us',
      languages: 'en',
      sort: 'published_desc',
      limit: fetchLimit,
      offset,
    };

    if (category) params.categories = category;
    if (keywords) params.keywords = keywords;

    console.log('Fetching Mediastack news', {
      category: category || 'all',
      keywords: keywords || 'none',
      page,
      limit: fetchLimit,
    });

    const response = await axios.get(BASE_URL, { params, timeout: 12000 });
    const raw = Array.isArray(response.data?.data) ? response.data.data : [];
    const reportedTotal = Number(response.data?.pagination?.total) || raw.length;

    const unique: any[] = [];
    const seen = new Set<string>();

    for (const article of raw) {
      if (!article?.title || !article?.url) continue;
      const key = String(article.url || article.title).toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(article);
    }

    return res.status(200).json({
      articles: unique.slice(0, pageSize),
      page,
      perPage: pageSize,
      totalResults: reportedTotal,
      query: keywords,
    });
  } catch (error: any) {
    const apiMessage = error?.response?.data?.error?.message;
    console.error('Mediastack API error:', apiMessage || error.message);
    return res.status(502).json({
      message: apiMessage || 'News provider is temporarily unavailable.',
    });
  }
});

export default router;
