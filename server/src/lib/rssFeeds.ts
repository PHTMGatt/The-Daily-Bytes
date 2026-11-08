import axios from 'axios';
import { normalizeHeadline, getQueryTerms } from './newsQuality.js';
import { cleanProviderText } from './textCleanup.js';
import { TimedCache } from './timedCache.js';

// Free gaming + tech RSS feeds: no API key and no request quota. Used when Mediastack is
// rate limited, failing, or has nothing for a gaming/tech query.
export const RSS_FEEDS: Array<{ name: string; url: string }> = [
  { name: 'IGN', url: 'https://feeds.feedburner.com/ign/all' },
  { name: 'PC Gamer', url: 'https://www.pcgamer.com/rss/' },
  { name: 'GameSpot', url: 'https://www.gamespot.com/feeds/mashup/' },
  { name: 'Eurogamer', url: 'https://www.eurogamer.net/feed' },
  { name: 'Rock Paper Shotgun', url: 'https://www.rockpapershotgun.com/feed' },
  { name: 'Polygon', url: 'https://www.polygon.com/rss/index.xml' },
  { name: 'Kotaku', url: 'https://kotaku.com/rss' },
  { name: "Tom's Hardware", url: 'https://www.tomshardware.com/feeds/all' },
  { name: 'Wccftech', url: 'https://wccftech.com/feed/' },
  { name: 'TechPowerUp', url: 'https://www.techpowerup.com/rss/news' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml' },
];

export interface RssArticle {
  title: string;
  url: string;
  description: string;
  image: string;
  source: string;
  published_at: string;
}

const POOL_TTL_MS = 15 * 60 * 1000;
const pool = new TimedCache<RssArticle[]>(POOL_TTL_MS, 2);

const tag = (block: string, name: string) => {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  if (!match) return '';
  return match[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim();
};

const attr = (block: string, name: string, attribute: string) => {
  const match = block.match(new RegExp(`<${name}\\b[^>]*\\b${attribute}=["']([^"']+)["']`, 'i'));
  return match ? match[1] : '';
};

const firstImage = (html: string) => {
  const match = html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  return match ? match[1] : '';
};

const toIso = (value: string) => {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString() : '';
};

// Minimal RSS 2.0 / Atom item parser: title, link, summary, date and the best image we can find.
export const parseFeed = (xml: string, source: string): RssArticle[] => {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  return blocks
    .map((block) => {
      const rawDescription = tag(block, 'description') || tag(block, 'summary') || tag(block, 'content');
      const link = tag(block, 'link') || attr(block, 'link', 'href');
      const image =
        attr(block, 'media:content', 'url') ||
        attr(block, 'media:thumbnail', 'url') ||
        attr(block, 'enclosure', 'url') ||
        firstImage(tag(block, 'content:encoded')) ||
        firstImage(rawDescription.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"'));
      return {
        title: cleanProviderText(tag(block, 'title')),
        url: cleanProviderText(link),
        description: cleanProviderText(rawDescription.replace(/&lt;/g, '<').replace(/&gt;/g, '>')).slice(0, 400),
        image: image.replace(/&amp;/g, '&'),
        source,
        published_at: toIso(tag(block, 'pubDate') || tag(block, 'published') || tag(block, 'updated') || tag(block, 'dc:date')),
      };
    })
    .filter((article) => article.title && /^https?:\/\//.test(article.url));
};

const fetchPool = async (): Promise<RssArticle[]> => {
  const cached = pool.get('all');
  if (cached) return cached;
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const response = await axios.get<string>(feed.url, {
        timeout: 8000,
        responseType: 'text',
        headers: { 'User-Agent': 'TheDailyBytes/1.0 (+https://the-daily-bytes-o4jo.onrender.com)', Accept: 'application/rss+xml, application/xml, text/xml' },
      });
      return parseFeed(String(response.data), feed.name);
    }),
  );
  const articles = results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
  if (articles.length) pool.set('all', articles);
  return articles;
};

// Stories from the RSS pool that match a query's profile terms ("gaming" keeps everything).
export const filterByQuery = (articles: RssArticle[], query: string): RssArticle[] => {
  const terms = getQueryTerms(query);
  if (!terms.length || normalizeHeadline(query) === 'gaming') return articles;
  return articles.filter((article) => {
    const text = ` ${normalizeHeadline(`${article.title} ${article.description}`)} `;
    return terms.some((term) => text.includes(` ${term} `));
  });
};

export const getRssArticles = async (query: string): Promise<RssArticle[]> =>
  filterByQuery(await fetchPool(), query);
