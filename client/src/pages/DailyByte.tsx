import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import ChipStrip from '../components/ChipStrip';
import StoryCard, { StoryArticle, StoryVariant } from '../components/StoryCard';
import { getArticleImage } from '../utils/articleImage';
import { HUBS } from '../config/hubs';
import { retrieveNews } from '../api/mainNewsAPI';
import { getSavedArticles, removeSavedArticle, saveArticle } from '../api/savedArticlesAPI';
import auth from '../utils/auth';
import { getArticleSource } from '../utils/articleSource.js';
import { createLatestRequestGuard } from '../utils/latestRequest.js';
import { isStaleFeed } from '../utils/newsViewState.js';
import { hasMoreStories, mergeArticlePages } from '../utils/feedPaging.js';
import { cleanSummary, matchStoryTag } from '../utils/storyText.js';
import { feedVariant } from '../utils/feedLayout.js';
import { buildFrontPage } from '../utils/frontPage.js';
import { useIsPhone } from '../utils/useIsPhone';
import './DailyByte.css';
import './Bookmarks.css';

type SearchArticle = StoryArticle;

const PAGE_SIZE = 12;

const getPublishedAt = (article: SearchArticle) => article.published_at || article.publishedAt || '';

export default function DailyByte({ hub: hubKey = 'gaming' }: { hub?: keyof typeof HUBS }) {
  const hub = HUBS[hubKey];
  const DEFAULT_TOPIC = hub.defaultTopic;
  const location = useLocation();
  const navigate = useNavigate();
  const urlTopic = new URLSearchParams(location.search).get('q')?.trim() || DEFAULT_TOPIC;
  const [activeTopic, setActiveTopic] = useState(urlTopic);
  const [articles, setArticles] = useState<SearchArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  const [savingUrl, setSavingUrl] = useState('');
  const [saveNotice, setSaveNotice] = useState('');
  const [stale, setStale] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState('');
  const requestGuard = useRef(createLatestRequestGuard()).current;
  const isPhone = useIsPhone();

  const fetchTopic = async (query: string) => {
    const token = requestGuard.start();
    setLoading(true);
    setLoadingMore(false);
    setError('');
    setMoreError('');
    setActiveTopic(query);
    // Drop the previous topic's stories so they are never shown under the new topic's heading.
    setArticles([]);
    setPage(1);
    setHasMore(false);

    try {
      const data = await retrieveNews(undefined, 1, PAGE_SIZE, query);
      if (!requestGuard.isCurrent(token)) return;
      const loaded = Array.isArray(data.articles) ? data.articles : [];
      setArticles(loaded);
      setHasMore(hasMoreStories({ page: 1, pageSize: PAGE_SIZE, totalResults: data.totalResults, added: loaded.length }));
      setStale(isStaleFeed(data));
    } catch (err) {
      if (!requestGuard.isCurrent(token)) return;
      setArticles([]);
      setStale(false);
      setError(err instanceof Error ? err.message : 'Unable to load stories right now.');
    } finally {
      if (requestGuard.isCurrent(token)) setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || loading) return;
    const token = requestGuard.start();
    const nextPage = page + 1;
    setLoadingMore(true);
    setMoreError('');

    try {
      const data = await retrieveNews(undefined, nextPage, PAGE_SIZE, activeTopic);
      if (!requestGuard.isCurrent(token)) return;
      const { articles: merged, added } = mergeArticlePages(articles, data.articles);
      setArticles(merged);
      setPage(nextPage);
      setHasMore(hasMoreStories({ page: nextPage, pageSize: PAGE_SIZE, totalResults: data.totalResults, added }));
    } catch (err) {
      if (!requestGuard.isCurrent(token)) return;
      setMoreError(err instanceof Error ? err.message : 'Unable to load more stories.');
    } finally {
      if (requestGuard.isCurrent(token)) setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTopic(urlTopic);
    return () => requestGuard.invalidate();
    // Intentionally keyed to the route only: fetchTopic is recreated each render and must not retrigger the load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, hubKey]);

  useEffect(() => {
    if (!auth.loggedIn()) return;
    getSavedArticles()
      .then((saved) => setSavedUrls(new Set(saved.map((article) => article.url))))
      .catch(() => setSavedUrls(new Set()));
  }, []);

  const openTopic = (query: string) => {
    navigate(`${hub.path}?q=${encodeURIComponent(query)}`);
  };

  const toggleSaved = async (article: SearchArticle) => {
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
        const saved = await saveArticle({
          title: article.title,
          url: article.url,
          description: cleanSummary(article.description),
          image: getArticleImage(article),
          source: getArticleSource(article),
          publishedAt: getPublishedAt(article),
          topic: activeTopic,
        });
        setSavedUrls((current) => new Set(current).add(saved?.url || article.url));
        setSaveNotice('Saved to your reading list.');
      }
    } catch (err) {
      setSaveNotice(err instanceof Error ? err.message : 'Unable to update saved articles.');
    } finally {
      setSavingUrl('');
    }
  };

  // Badge = the game/part/topic the story is actually about, falling back to the focused chip.
  const chips = [...hub.mine, ...hub.topics];
  const activeChip = chips.find(([, query]) => query.toLowerCase() === activeTopic.toLowerCase());
  const tagFor = (article: SearchArticle) =>
    matchStoryTag(article, chips, activeChip?.[0] || hub.fallbackTag);

  const combinedFeed = activeTopic.toLowerCase() === DEFAULT_TOPIC;
  // Lead, rail and cluster come from the first page only, so "Load more" never reshuffles
  // stories above the reader; later pages append to Latest.
  const firstPage = buildFrontPage(articles.slice(0, PAGE_SIZE), {
    tagFor,
    withRail: !isPhone,
    withCluster: combinedFeed,
    genericTags: [hub.fallbackTag, ...hub.topics.map(([label]) => label)],
  });
  const front = { ...firstPage, latest: [...firstPage.latest, ...articles.slice(PAGE_SIZE)] };
  const featured = front.lead;

  const card = (
    article: SearchArticle,
    variant: StoryVariant,
    extra?: { rank?: number; showImage?: boolean; onToggleSave?: undefined },
  ) => (
    <StoryCard
      key={article.url}
      article={article}
      variant={variant}
      tag={tagFor(article)}
      saved={savedUrls.has(article.url)}
      saving={savingUrl === article.url}
      onToggleSave={toggleSaved}
      {...extra}
    />
  );

  return (
    <div className="dailybyte-page">
      <h1 className="sr-only">{hub.title}</h1>
      <ChipStrip
        label={hub.mineLabel}
        allQuery={DEFAULT_TOPIC}
        mine={hub.mine}
        topics={hub.topics}
        active={activeTopic}
        onSelect={openTopic}
      />
      {stale && (
        <div className="db-save-notice" role="status">
          The news provider is unreachable, so these are recently saved stories. Try again shortly for the latest.
        </div>
      )}
      {saveNotice && <div className="db-save-notice" role="status">{saveNotice}</div>}

      {loading && !featured ? (
        <div className="db-loading-card">
          <FiRefreshCw className="spin" />
          <span>Loading the latest {activeTopic} stories...</span>
        </div>
      ) : error ? (
        <div className="db-state-card">
          <h2>Feed unavailable</h2>
          <p>{error}</p>
          <button type="button" onClick={() => fetchTopic(activeTopic)}>Try again</button>
        </div>
      ) : !featured ? (
        <div className="db-state-card">
          <h2>No stories found</h2>
          <p>Try another game or topic, or a broader search.</p>
          <button type="button" onClick={() => openTopic(DEFAULT_TOPIC)}>Back to {hub.allLabel.toLowerCase()}</button>
        </div>
      ) : (
        <>
          <div className={`db-front${front.rail.length ? ' has-rail' : ''}`}>
            {card(featured, 'lead')}
            {front.rail.length > 0 && (
              <section className="db-top-rail" aria-labelledby="db-top-heading">
                <h2 id="db-top-heading" className="db-rail-heading">
                  {!stale && <span className="db-live-dot" aria-hidden="true" />}
                  Top stories
                </h2>
                {front.rail.map((article, index) => card(article, 'compact', { rank: index + 1, showImage: false, onToggleSave: undefined }))}
              </section>
            )}
          </div>

          {front.cluster && (
            <section className="db-cluster" aria-labelledby="db-cluster-heading">
              <div className="db-section-title">
                <h2 id="db-cluster-heading">{front.cluster.tag}</h2>
                <button type="button" className="db-see-all" onClick={() => {
                  const chip = chips.find(([label]) => label === front.cluster?.tag);
                  if (chip) openTopic(chip[1]);
                }}>
                  More {front.cluster.tag} <FiArrowRight aria-hidden="true" />
                </button>
              </div>
              <div className="db-cluster-body">
                {card(front.cluster.items[0], 'standard')}
                <div className="db-cluster-list">
                  {front.cluster.items.slice(1).map((article) => card(article, 'compact'))}
                </div>
              </div>
            </section>
          )}

          {front.latest.length > 0 && (
            <section aria-labelledby="db-latest-heading">
              <div className="db-section-title">
                <h2 id="db-latest-heading">{combinedFeed ? 'Latest' : activeChip?.[0] || activeTopic}</h2>
                {loading && <FiRefreshCw className="spin" aria-label="Refreshing" />}
              </div>
              <div className="db-news-grid">
                {front.latest.map((article, index) => card(article, feedVariant(index, isPhone)))}
              </div>
            </section>
          )}

          {(hasMore || moreError) && (
            <div className="db-load-more">
              {moreError && <p role="alert">{moreError}</p>}
              <button type="button" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? <FiRefreshCw className="spin" aria-hidden="true" /> : null}
                {loadingMore ? 'Loading...' : moreError ? 'Try again' : 'Load more stories'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
