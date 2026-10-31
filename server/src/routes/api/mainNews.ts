import express, { Request, Response } from 'express';
import axios from 'axios';
import { getNewsWindow } from '../../lib/newsPagination.js';
import { getRankingQuery, rankAndDedupeArticles } from '../../lib/newsQuality.js';
import { buildProviderKeywords } from '../../lib/providerKeywords.js';
import { InflightRequests } from '../../lib/inflightRequests.js';
import { TimedCache } from '../../lib/timedCache.js';

const router = express.Router();

const MEDIASTACK_API_KEY = process.env.MEDIASTACK_API_KEY;
const BASE_URL = 'https://api.mediastack.com/v1/news';
const NEWS_CACHE_TTL_MS = 15 * 60 * 1000;
const NEWS_STALE_MAX_MS = 6 * 60 * 60 * 1000;

interface NewsBlock {
  articles: any[];
  totalResults: number;
}

const newsCache = new TimedCache<NewsBlock>(NEWS_CACHE_TTL_MS, 100);
const inflightFetches = new InflightRequests<NewsBlock>();

router.get('/:category?', async (req: Request, res: Response) => {
  if (!MEDIASTACK_API_KEY) {
    return res.status(503).json({ message: 'News service is not configured.' });
  }

  let cacheKey = '';
  let respond: ((block: NewsBlock, extra: Record<string, boolean>) => Response) | undefined;

  try {
    const category = (req.params.category || '').trim().toLowerCase();
    const keywords = typeof req.query.keywords === 'string'
      ? req.query.keywords.trim().slice(0, 120)
      : '';
    const providerKeywords = buildProviderKeywords(keywords);
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const pageSize = Math.min(24, Math.max(1, parseInt(req.query.pageSize as string, 10) || 12));
    const { fetchLimit, offset, sliceStart } = getNewsWindow(page, pageSize);
    cacheKey = `${category}|${keywords.toLowerCase()}|${offset}|${fetchLimit}`;
    respond = (block: NewsBlock, extra: Record<string, boolean>) => res.status(200).json({
      articles: block.articles.slice(sliceStart, sliceStart + pageSize),
      page,
      perPage: pageSize,
      totalResults: block.totalResults,
      query: keywords,
      ...extra,
    });
    const cached = newsCache.get(cacheKey);

    if (cached) return respond(cached, { cached: true });

    const params: Record<string, string | number> = {
      access_key: MEDIASTACK_API_KEY,
      countries: 'us',
      languages: 'en',
      sort: 'published_desc',
      limit: fetchLimit,
      offset,
    };

    if (category) params.categories = category;
    if (providerKeywords) params.keywords = providerKeywords;

    const block = await inflightFetches.run(cacheKey, async () => {
      const response = await axios.get(BASE_URL, { params, timeout: 12000 });
      const raw = Array.isArray(response.data?.data) ? response.data.data : [];
      const reportedTotal = Number(response.data?.pagination?.total) || raw.length;
      const fetched: NewsBlock = {
        articles: rankAndDedupeArticles(raw, getRankingQuery(category, keywords)),
        totalResults: reportedTotal,
      };
      newsCache.set(cacheKey, fetched);
      return fetched;
    });

    return respond(block, { cached: false });
  } catch (error: any) {
    const apiMessage = error?.response?.data?.error?.message;
    console.error('Mediastack API error:', apiMessage || error.message);

    const stale = cacheKey ? newsCache.getStale(cacheKey, NEWS_STALE_MAX_MS) : undefined;
    if (stale && respond) {
      return respond(stale, { cached: true, stale: true });
    }

    return res.status(502).json({
      message: apiMessage || 'News provider is temporarily unavailable.',
    });
  }
});

export default router;
