import { FormEvent, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiBookmark, FiCheck, FiRefreshCw, FiSearch, FiZap } from 'react-icons/fi';
import ArticleImage from '../components/ArticleImage';
import { retrieveNews } from '../api/mainNewsAPI';
import { getSavedArticles, removeSavedArticle, saveArticle } from '../api/savedArticlesAPI';
import auth from '../utils/auth';
import { formatPublishedLabel } from '../utils/articleTime';
import { getArticleSource } from '../utils/articleSource.js';
import { createLatestRequestGuard } from '../utils/latestRequest.js';
import { isStaleFeed } from '../utils/newsViewState.js';
import { hasMoreStories, mergeArticlePages } from '../utils/feedPaging.js';
import './DailyByte.css';
import './Bookmarks.css';

interface SearchArticle {
  source?: string | { name?: string };
  author?: string | null;
  title: string;
  description?: string | null;
  url: string;
  image?: string | null;
  urlToImage?: string | null;
  published_at?: string;
  publishedAt?: string;
}

const PAGE_SIZE = 12;

type Chip = [label: string, query: string];

interface HubConfig {
  path: string;
  kicker: string;
  title: string;
  intro: string;
  placeholder: string;
  searchLabel: string;
  // The hub opens on one combined feed of everything in the "mine" row.
  defaultTopic: string;
  mineLabel: string;
  allLabel: string;
  mine: Chip[];
  topics: Chip[];
  priority: Array<{ label: string; query: string; copy: string }>;
  note: string;
}

const HUBS: Record<'gaming' | 'tech', HubConfig> = {
  gaming: {
    path: '/dailybyte',
    kicker: 'GAMING',
    title: 'Your gaming pulse.',
    intro: 'Every game you play in one feed. Tap a game to zoom in, or search anything.',
    placeholder: 'Try Witcher 3, Crimson Desert, Apex...',
    searchLabel: 'Search gaming news',
    defaultTopic: 'my games',
    mineLabel: 'My games',
    allLabel: 'All my games',
    // Bryen's own library: what he is playing now first, then the franchises he keeps coming back to.
    mine: [
      ['Witcher 3', 'The Witcher 3'],
      ['AC Black Flag', 'Assassins Creed Black Flag'],
      ['Crimson Desert', 'Crimson Desert'],
      ['AC Shadows', 'Assassins Creed Shadows'],
      ['Cyberpunk 2077', 'Cyberpunk 2077'],
      ['Elden Ring', 'Elden Ring'],
      ['Apex Legends', 'Apex Legends'],
      ['Black Ops', 'Call of Duty Black Ops'],
      ['Hitman', 'Hitman'],
      ['Batman Arkham', 'Batman Arkham'],
      ['Far Cry', 'Far Cry'],
      ['GTA 6', 'GTA 6'],
      ['ARK', 'ARK Survival'],
      ['Rocket League', 'Rocket League'],
      ['CS2', 'Counter Strike 2'],
      ['DOOM', 'DOOM'],
    ],
    topics: [
      ['Gaming', 'gaming'],
      ['Game Releases', 'video game releases'],
      ['Xbox', 'Xbox'],
      ['PlayStation', 'PlayStation'],
      ['Nintendo', 'Nintendo'],
      ['Steam', 'Steam'],
      ['Industry', 'game industry'],
      ['Esports', 'esports'],
    ],
    priority: [
      { label: 'Witcher 3', query: 'The Witcher 3', copy: 'CDPR updates, mods, visuals, and everything around the Continent.' },
      { label: 'Crimson Desert', query: 'Crimson Desert', copy: 'Pearl Abyss updates, patches, and Pywel news.' },
      { label: 'AC Black Flag', query: 'Assassins Creed Black Flag', copy: 'Black Flag Resynced, Kenway, and Ubisoft news.' },
      { label: 'Apex Legends', query: 'Apex Legends', copy: 'Seasons, ranked, legends, and Respawn updates.' },
      { label: 'Game Releases', query: 'video game releases', copy: 'What is launching and what just dropped.' },
    ],
    note: 'Your games load first. Pick one to focus, or tap All my games to see everything again.',
  },
  tech: {
    path: '/tech',
    kicker: 'TECH + PC HARDWARE',
    title: 'Your gear and hardware pulse.',
    intro: 'Everything in your setup in one feed. Tap a part to zoom in, or search anything.',
    placeholder: 'Try RTX 5090, Dominator Titanium, Corsair...',
    searchLabel: 'Search tech and hardware news',
    defaultTopic: 'my gear',
    mineLabel: 'My gear',
    allLabel: 'All my gear',
    // Bryen's build and desk: GPUs, CPU, memory, storage, brands and the gear around it.
    mine: [
      ['RTX 5090', 'RTX 5090'],
      ['RTX 5080', 'RTX 5080'],
      ['Ryzen 9950X3D', 'Ryzen 9 9950X3D'],
      ['Dominator Ti', 'Corsair Dominator Titanium'],
      ['RAM Prices', 'RAM prices'],
      ['9100 Pro SSD', 'Samsung 9100 Pro'],
      ['Corsair', 'Corsair'],
      ['XENEON EDGE', 'Corsair XENEON EDGE'],
      ['Razer', 'Razer'],
      ['ASUS ROG', 'ASUS ROG'],
      ['ROG OLED', 'ROG Swift OLED'],
      ['EK Cooling', 'EK water cooling'],
      ['Raspberry Pi', 'Raspberry Pi'],
      ['Elgato', 'Elgato Stream Deck'],
      ['NVIDIA Drivers', 'NVIDIA driver'],
      ['Logitech G', 'Logitech G'],
    ],
    topics: [
      ['NVIDIA', 'NVIDIA GPU'],
      ['AMD', 'AMD GPU'],
      ['Intel', 'Intel CPU'],
      ['GPU Prices', 'GPU prices'],
      ['RAM + SSD', 'RAM SSD prices'],
      ['PC Hardware', 'PC hardware'],
      ['CPUs', 'CPU'],
      ['Monitors', 'gaming monitor'],
      ['Handhelds', 'handheld PC'],
      ['VR', 'VR'],
      ['AI Chips', 'AI chips'],
      ['Next-gen Consoles', 'next gen consoles'],
    ],
    priority: [
      { label: 'NVIDIA', query: 'NVIDIA GPU', copy: 'GeForce launches, drivers, DLSS, RTX hardware, and GPU moves.' },
      { label: 'GPU Prices', query: 'GPU prices', copy: 'Graphics card pricing, availability, market shifts, and new deals.' },
      { label: 'RAM + SSD', query: 'RAM SSD prices', copy: 'Memory, storage, DDR5, SSD pricing, and component market changes.' },
      { label: 'Corsair', query: 'Corsair', copy: 'Dominator, XENEON, cases, iCUE, and the rest of your build.' },
      { label: 'PC Hardware', query: 'PC hardware', copy: 'CPUs, cooling, cases, displays, builds, and enthusiast hardware.' },
    ],
    note: 'Your gear loads first. Pick a part to focus, or tap All my gear to see everything again.',
  },
};

const getImage = (article: SearchArticle) => article.image || article.urlToImage || '';

const getPublishedAt = (article: SearchArticle) => article.published_at || article.publishedAt || '';

const formatDate = (article: SearchArticle) => formatPublishedLabel(getPublishedAt(article));

const articleSummary = (article: SearchArticle) =>
  article.description?.trim() || 'Open the full story for the latest details.';

export default function DailyByte({ hub: hubKey = 'gaming' }: { hub?: keyof typeof HUBS }) {
  const hub = HUBS[hubKey];
  const DEFAULT_TOPIC = hub.defaultTopic;
  const location = useLocation();
  const navigate = useNavigate();
  const urlTopic = new URLSearchParams(location.search).get('q')?.trim() || DEFAULT_TOPIC;
  const [topic, setTopic] = useState(urlTopic);
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
    setTopic(urlTopic);
    fetchTopic(urlTopic);
    return () => requestGuard.invalidate();
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const query = topic.trim();
    if (query) openTopic(query);
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
          description: articleSummary(article),
          image: getImage(article),
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

  const featured = articles[0];
  const latest = articles.slice(1);

  return (
    <div className="dailybyte-page">
      <section className="db-header-panel">
        <div className="db-heading-copy">
          <span className="db-kicker"><FiZap /> {hub.kicker}</span>
          <h1>{hub.title}</h1>
          <p>{hub.intro}</p>
        </div>

        <form className="db-search" onSubmit={handleSubmit} role="search">
          <FiSearch aria-hidden="true" />
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder={hub.placeholder}
            aria-label={hub.searchLabel}
          />
          <button type="submit">Search</button>
        </form>

        <div className="db-chip-label-row">
          <span className="db-chip-label" id="db-my-games-label">{hub.mineLabel}</span>
          <button
            type="button"
            className={`db-all-games ${activeTopic.toLowerCase() === DEFAULT_TOPIC ? 'active' : ''}`}
            aria-pressed={activeTopic.toLowerCase() === DEFAULT_TOPIC}
            onClick={() => openTopic(DEFAULT_TOPIC)}
          >
            {hub.allLabel}
          </button>
        </div>
        <div className="db-topic-chips db-my-games" aria-labelledby="db-my-games-label">
          {hub.mine.map(([label, query]) => (
            <button
              type="button"
              key={label}
              className={activeTopic.toLowerCase() === query.toLowerCase() ? 'active' : ''}
              aria-pressed={activeTopic.toLowerCase() === query.toLowerCase()}
              onClick={() => openTopic(query)}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="db-chip-label" id="db-topics-label">Topics</span>
        <div className="db-topic-chips" aria-labelledby="db-topics-label">
          {hub.topics.map(([label, query]) => (
            <button
              type="button"
              key={label}
              className={activeTopic.toLowerCase() === query.toLowerCase() ? 'active' : ''}
              aria-pressed={activeTopic.toLowerCase() === query.toLowerCase()}
              onClick={() => openTopic(query)}
            >
              {label}
            </button>
          ))}
        </div>
        {stale && (
          <div className="db-save-notice" role="status">
            The news provider is unreachable, so these are recently saved stories. Try again shortly for the latest.
          </div>
        )}
        {saveNotice && <div className="db-save-notice" role="status">{saveNotice}</div>}
      </section>

      <div className="db-dashboard">
        <div className="db-feed">
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
              <p>Try another priority topic or a broader search.</p>
              <button type="button" onClick={() => openTopic(DEFAULT_TOPIC)}>Back to {hub.allLabel.toLowerCase()}</button>
            </div>
          ) : (
            <>
              <article
                className={`db-feature ${getImage(featured) ? 'has-image' : ''}`}
                style={getImage(featured) ? { backgroundImage: `url("${getImage(featured)}")` } : undefined}
              >
                <div className="db-feature-overlay" />
                <div className="db-feature-content">
                  <span className="db-article-tag">{activeTopic}</span>
                  <h2>{featured.title}</h2>
                  <p>{articleSummary(featured)}</p>
                  <div className="db-article-meta">
                    <span>{getArticleSource(featured)}</span>
                    <span>•</span>
                    <span>{formatDate(featured)}</span>
                  </div>
                  <div className="db-feature-actions">
                    <a href={featured.url} target="_blank" rel="noopener noreferrer">
                      Read story <FiArrowUpRight />
                    </a>
                    <button
                      type="button"
                      className={savedUrls.has(featured.url) ? 'saved' : ''}
                      disabled={savingUrl === featured.url}
                      onClick={() => toggleSaved(featured)}
                    >
                      {savedUrls.has(featured.url) ? <FiCheck /> : <FiBookmark />}
                      {savedUrls.has(featured.url) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </article>

              <div className="db-section-title">
                <div>
                  <span>LATEST NEWS</span>
                  <h2>{activeTopic}</h2>
                </div>
                {loading && <FiRefreshCw className="spin" aria-label="Refreshing" />}
              </div>

              <div className="db-news-grid">
                {latest.map((article) => (
                  <article className="db-news-card" key={article.url}>
                    <div className="db-card-media">
                      <ArticleImage src={getImage(article)} />
                      <span>{activeTopic}</span>
                    </div>
                    <div className="db-card-body">
                      <h3>{article.title}</h3>
                      <p>{articleSummary(article)}</p>
                      <div className="db-article-meta">
                        <span>{getArticleSource(article)}</span>
                        <span>•</span>
                        <span>{formatDate(article)}</span>
                      </div>
                      <div className="db-card-actions">
                        <a href={article.url} target="_blank" rel="noopener noreferrer">
                          Open story <FiArrowUpRight />
                        </a>
                        <button
                          type="button"
                          className={savedUrls.has(article.url) ? 'saved' : ''}
                          disabled={savingUrl === article.url}
                          onClick={() => toggleSaved(article)}
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

        <aside className="db-priority-panel">
          <div className="db-priority-heading">
            <FiZap />
            <div>
              <span>YOUR DEFAULT BEAT</span>
              <h2>Priority Watch</h2>
            </div>
          </div>

          <div className="db-priority-list">
            {hub.priority.map((item, index) => (
              <button type="button" key={item.label} onClick={() => openTopic(item.query)}>
                <span className="db-priority-number">{index + 1}</span>
                <span className="db-priority-copy">
                  <strong>{item.label}</strong>
                  <small>{item.copy}</small>
                </span>
                <FiArrowUpRight />
              </button>
            ))}
          </div>

          <div className="db-priority-note">
            <strong>Built around your feed.</strong>
            <p>{hub.note}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
