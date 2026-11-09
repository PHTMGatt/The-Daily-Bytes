import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiBookmark, FiCheck, FiRefreshCw, FiZap } from 'react-icons/fi';
import { retrieveNews } from '../api/mainNewsAPI';
import { getSavedArticles, removeSavedArticle, saveArticle } from '../api/savedArticlesAPI';
import auth from '../utils/auth';
import { buildSavedPayload } from '../utils/savedPayload';
import ArticleImage from './ArticleImage';
import { formatPublishedLabel } from '../utils/articleTime';
import { getArticleSource } from '../utils/articleSource.js';
import { getStoryLinkLabel } from '../utils/storyLinkLabel.js';
import { feedKeyFor, getEmptyStateCopy, getNewsViewState, isStaleFeed, resolvePage } from '../utils/newsViewState';
import './News.css';

interface NewsSource {
  id?: string | null;
  name?: string;
}

interface Article {
  source?: string | NewsSource;
  author?: string | null;
  title: string;
  description?: string | null;
  url: string;
  image?: string | null;
  urlToImage?: string | null;
  publishedAt?: string;
  published_at?: string;
  content?: string | null;
}

interface NewsComponentProps {
  category?: string;
  heading?: string;
  subtitle?: string;
  keywords?: string;
}

const formatPublishedDate = (article: Article) =>
  formatPublishedLabel(article.publishedAt || article.published_at);

const getImage = (article: Article) => article.image || article.urlToImage || '';

const NewsComponent = ({ category, heading, subtitle, keywords }: NewsComponentProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const feedKey = feedKeyFor(category, keywords);
  const [pageState, setPageState] = useState({ feedKey, page: 1 });
  const page = resolvePage(pageState, feedKey);
  const setPage = (update: (current: number) => number) =>
    setPageState({ feedKey, page: update(page) });
  const [retryKey, setRetryKey] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [stale, setStale] = useState(false);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const [savingUrl, setSavingUrl] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const navigate = useNavigate();
  const articlesPerPage = 12;

  useEffect(() => {
    let active = true;

    const fetchNews = async () => {
      setLoading(true);
      setError('');

      try {
        const data = await retrieveNews(category?.toLowerCase(), page, articlesPerPage, keywords);
        if (!active) return;
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setTotalArticles(Number(data.totalResults) || 0);
        setStale(isStaleFeed(data));
      } catch (fetchError) {
        if (!active) return;
        setArticles([]);
        setTotalArticles(0);
        setStale(false);
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load stories right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      active = false;
    };
  }, [category, keywords, page, retryKey]);

  useEffect(() => {
    if (!auth.loggedIn()) return;
    getSavedArticles()
      .then((saved) => setSavedUrls(new Set(saved.map((item) => item.url))))
      .catch(() => setSavedUrls(new Set()));
  }, []);

  const toggleSaved = async (article: Article) => {
    if (!auth.loggedIn()) {
      navigate('/login');
      return;
    }

    setSavingUrl(article.url);
    setSaveNotice('');

    try {
      if (savedUrls.has(article.url)) {
        await removeSavedArticle(article.url);
        setSavedUrls((current) => {
          const next = new Set(current);
          next.delete(article.url);
          return next;
        });
        setSaveNotice('Removed from saved articles.');
      } else {
        const saved = await saveArticle(buildSavedPayload(article, category || keywords || 'Latest'));
        setSavedUrls((current) => new Set(current).add(saved?.url || article.url));
        setSaveNotice('Saved to your reading list.');
      }
    } catch (saveError) {
      setSaveNotice(saveError instanceof Error ? saveError.message : 'Unable to update saved articles.');
    } finally {
      setSavingUrl('');
    }
  };

  useEffect(() => {
    setSaveNotice('');
  }, [feedKey]);

  const totalPages = Math.max(1, Math.ceil(totalArticles / articlesPerPage));
  const viewState = getNewsViewState({ loading, error, articleCount: articles.length });
  const emptyCopy = getEmptyStateCopy(page);
  const resolvedHeading = heading || (category ? `${category} News` : 'Latest News');
  const resolvedSubtitle = subtitle || (
    category
      ? `Fresh ${category.toLowerCase()} stories from the Daily Bytes news feed.`
      : 'Fresh stories from across the Daily Bytes feed.'
  );

  return (
    <section className="news-container">
      <header className="news-header">
        <span className="news-kicker"><FiZap /> DAILY BYTES FEED</span>
        <h1 className="news-heading">{resolvedHeading}</h1>
        <p>{resolvedSubtitle}</p>
      </header>

      {viewState === 'loading' && (
        <div className="news-state-card" role="status">
          <FiRefreshCw className="news-spin" aria-hidden="true" />
          <h2>Loading stories...</h2>
          <p>Pulling the newest articles for this feed.</p>
        </div>
      )}

      {viewState === 'error' && (
        <div className="news-state-card news-state-error" role="alert">
          <h2>Feed unavailable</h2>
          <p>{error}</p>
          <button type="button" onClick={() => setRetryKey((current) => current + 1)}>
            Try again
          </button>
          {page > 1 && (
            <button type="button" onClick={() => setPage(() => 1)}>
              Back to first page
            </button>
          )}
        </div>
      )}

      {viewState === 'empty' && (
        <div className="news-state-card">
          <h2>{emptyCopy.title}</h2>
          <p>{emptyCopy.message}</p>
          {emptyCopy.canReset && (
            <button type="button" onClick={() => setPage(() => 1)}>
              Back to first page
            </button>
          )}
        </div>
      )}

      {viewState === 'ready' && (
        <>
          {stale && (
            <p className="news-stale-notice" role="status">
              The news provider is unreachable, so these are recently saved stories. Try again shortly for the latest.
            </p>
          )}
          {saveNotice && <p className="news-save-notice" role="status">{saveNotice}</p>}
          <div className="news-grid">
            {articles.map((article) => (
              <article key={article.url} className="news-card">
                <div className="news-card-media">
                  <ArticleImage
                    src={getImage(article)}
                    fallbackLabel={getArticleSource(article) || 'Daily Bytes'}
                    fallbackClassName="news-image-fallback"
                  />
                  <span>{category || keywords || 'Latest'}</span>
                </div>
                <div className="news-card-content">
                  <div className="news-card-meta">
                    <span>{getArticleSource(article)}</span>
                    <span>•</span>
                    <span>{formatPublishedDate(article)}</span>
                  </div>
                  <h2 className="news-title">{article.title}</h2>
                  <p className="news-summary">
                    {article.description?.trim() || 'Open the original story for the latest details.'}
                  </p>
                  <div className="news-card-actions">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="read-more"
                      aria-label={getStoryLinkLabel(article.title, getArticleSource(article))}
                    >
                      Open story <FiArrowUpRight />
                    </a>
                    <button
                      type="button"
                      className={`news-save${savedUrls.has(article.url) ? ' saved' : ''}`}
                      disabled={savingUrl === article.url}
                      onClick={() => toggleSaved(article)}
                      aria-pressed={savedUrls.has(article.url)}
                      aria-label={`${savedUrls.has(article.url) ? 'Remove' : 'Save'} ${article.title}`}
                    >
                      {savedUrls.has(article.url) ? <FiCheck /> : <FiBookmark />}
                      {savedUrls.has(article.url) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="pagination" aria-label="News pagination">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default NewsComponent;
