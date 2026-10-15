import { API_ORIGIN } from './config';
export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  image?: string | null;
  published_at?: string;
  publishedAt?: string;
}
export interface NewsPage {
  articles: NewsArticle[];
  page: number;
  perPage: number;
  totalResults: number;
  hasMore: boolean;
}

export const safeHttpUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
};

export async function retrieveNews(category = '', page = 1, pageSize = 12, signal?: AbortSignal, query = ''): Promise<NewsPage> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (query) params.set('q', query);
  const response = await fetch(`${API_ORIGIN}/api/news${category ? `/${encodeURIComponent(category)}` : ''}?${params}`, { signal });
  if (!response.ok) throw new Error(response.status === 503
    ? 'The news service is not configured. Please try again later.'
    : 'News could not be loaded. Please try again.');
  const data = await response.json();
  if (!Array.isArray(data.articles)) throw new Error('The news service returned an unexpected response.');
  return { ...data, articles: data.articles.filter((article: NewsArticle) => article && safeHttpUrl(article.url)) };
}
