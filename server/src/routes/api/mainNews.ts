import express, { Request, Response } from 'express';
import axios from 'axios';
import { getNewsWindow } from '../../lib/newsPagination.js';
import { getRankingQuery, rankAndDedupeArticles } from '../../lib/newsQuality.js';
import { parseNewsCategory } from '../../lib/newsCategory.js';
import { buildProviderKeywords } from '../../lib/providerKeywords.js';
import { InflightRequests } from '../../lib/inflightRequests.js';
import { TimedCache } from '../../lib/timedCache.js';
import { resolveFetchedBlock } from '../../lib/feedBlock.js';
import { ProviderCooldown, shouldCooldownOnError } from '../../lib/providerCooldown.js';
import { getRssArticles } from '../../lib/rssFeeds.js';

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
const inflightFetches = new InflightRequests<{ block: NewsBlock; stale: boolean }>();
// After a provider failure (e.g. Mediastack rate limiting) stop calling it for a while
// and serve stale cache instead of retrying on every request.
const providerCooldown = new ProviderCooldown(30 * 1000, 10 * 60 * 1000);
const PROVIDER_COOLDOWN_MESSAGE = 'News provider is temporarily unavailable.';

class ProviderCooldownError extends Error {}

router.get('/:category?', async (req: Request, res: Response) => {
  if (!MEDIASTACK_API_KEY) {
    return res.status(503).json({ message: 'News service is not configured.' });
  }

  let cacheKey = '';
  let respond: ((block: NewsBlock, extra: Record<string, boolean>) => Response) | undefined;

  try {
    const parsedCategory = parseNewsCategory(req.params.category);
    if (!parsedCategory.ok) {
      return res.status(400).json({ message: 'Unknown news category.' });
    }
    const { category } = parsedCategory;
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
      let raw: any[] = [];
      let reportedTotal = 0;
      let providerError: unknown;

      if (providerCooldown.isOpen()) {
        providerError = new ProviderCooldownError(PROVIDER_COOLDOWN_MESSAGE);
      } else {
        try {
          const response = await axios.get(BASE_URL, { params, timeout: 12000 });
          providerCooldown.recordSuccess();
          raw = Array.isArray(response.data?.data) ? response.data.data : [];
          reportedTotal = Number(response.data?.pagination?.total) || raw.length;
        } catch (fetchError) {
          if (shouldCooldownOnError(fetchError)) providerCooldown.recordFailure();
          providerError = fetchError;
        }
      }

      // Gaming / tech searches fall back to free RSS feeds when Mediastack is rate limited,
      // failing, or simply has nothing for the query.
      if (!raw.length && !category) {
        try {
          const rss = await getRssArticles(keywords || 'gaming');
          raw = rss.slice(offset, offset + fetchLimit);
          reportedTotal = rss.length;
          if (raw.length) providerError = undefined;
        } catch (rssError) {
          console.error('RSS fallback error:', rssError instanceof Error ? rssError.message : rssError);
        }
      }

      if (providerError) throw providerError;
      const fetched: NewsBlock = {
        articles: rankAndDedupeArticles(raw, getRankingQuery(category, keywords)),
        totalResults: reportedTotal,
      };
      const decision = resolveFetchedBlock(fetched, newsCache.getStale(cacheKey, NEWS_STALE_MAX_MS));
      // A stale fallback keeps its original cache entry so it still ages out; only fresh data is stored.
      if (!decision.stale) newsCache.set(cacheKey, decision.block, Date.now(), decision.cacheTtlMs);
      return decision;
    });

    return respond(block.block, block.stale ? { cached: true, stale: true } : { cached: false });
  } catch (error: any) {
    const apiMessage = error?.response?.data?.error?.message;
    if (!(error instanceof ProviderCooldownError)) {
      console.error('Mediastack API error:', apiMessage || error.message);
    }

    const stale = cacheKey ? newsCache.getStale(cacheKey, NEWS_STALE_MAX_MS) : undefined;
    if (stale && respond) {
      return respond(stale, { cached: true, stale: true });
    }

    return res.status(502).json({
      message: PROVIDER_COOLDOWN_MESSAGE,
    });
  }
});

export default router;
