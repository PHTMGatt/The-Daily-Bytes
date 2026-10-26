import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiBookmark, FiCheck, FiRefreshCw, FiSearch, FiZap } from 'react-icons/fi';
import { retrieveNews } from '../api/mainNewsAPI';
import { getSavedArticles, removeSavedArticle, saveArticle } from '../api/savedArticlesAPI';
import auth from '../utils/auth';
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

const DEFAULT_TOPIC = 'gaming';

const priorityTopics = [
  {
    label: 'Witcher 3',
    query: 'The Witcher 3',
    copy: 'CDPR updates, mods, visuals, and everything around the Continent.',
  },
  {
    label: 'NVIDIA',
    query: 'NVIDIA GPU',
    copy: 'GeForce launches, drivers, DLSS, RTX hardware, and GPU moves.',
  },
  {
    label: 'GPU Prices',
    query: 'GPU prices',
    copy: 'Graphics card pricing, availability, market shifts, and new deals.',
  },
  {
    label: 'RAM + SSD',
    query: 'RAM SSD prices',
    copy: 'Memory, storage, DDR5, SSD pricing, and component market changes.',
  },
  {
    label: 'PC Hardware',
    query: 'PC hardware',
    copy: 'CPUs, cooling, cases, displays, builds, and enthusiast hardware.',
  },
];

const quickTopics = [
  ['Gaming', 'gaming'],
  ['Witcher 3', 'The Witcher 3'],
  ['NVIDIA', 'NVIDIA GPU'],
  ['GPU Prices', 'GPU prices'],
  ['RAM Prices', 'RAM prices'],
  ['PC Hardware', 'PC hardware'],
  ['Game Releases', 'video game releases'],
];

const getImage = (article: SearchArticle) => article.image || article.urlToImage || '';

const getSource = (article: SearchArticle) => {
  if (typeof article.source === 'string') return article.source;
  return article.source?.name || article.author || 'News source';
};

const getPublishedAt = (article: SearchArticle) => article.published_at || article.publishedAt || '';

const formatDate = (article: SearchArticle) => {
  const value = getPublishedAt(article);
  if (!value) return 'Recent';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const articleSummary = (article: SearchArticle) =>
  article.description?.trim() || 'Open the full story for the latest details.';

export default function DailyByte() {
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

  const fetchTopic = async (query: string) => {
    setLoading(true);
    setError('');
    setActiveTopic(query);

    try {
      const data = await retrieveNews(undefined, 1, 12, query);
      setArticles(Array.isArray(data.articles) ? data.articles : []);
    } catch (err) {
      setArticles([]);
      setError(err instanceof Error ? err.message : 'Unable to load stories right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTopic(urlTopic);
    fetchTopic(urlTopic);
  }, [location.search]);

  useEffect(() => {
    if (!auth.loggedIn()) return;
    getSavedArticles()
      .then((saved) => setSavedUrls(new Set(saved.map((article) => article.url))))
      .catch(() => setSavedUrls(new Set()));
  }, []);

  const openTopic = (query: string) => {
    navigate(`/dailybyte?q=${encodeURIComponent(query)}`);
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
          source: getSource(article),
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
          <span className="db-kicker"><FiZap /> GAMING + PC HARDWARE</span>
          <h1>Your gaming and hardware pulse.</h1>
          <p>
            Games first, enthusiast hardware close behind. Search anything, or jump straight into
            the topics worth watching.
          </p>
        </div>

        <form className="db-search" onSubmit={handleSubmit} role="search">
          <FiSearch aria-hidden="true" />
          <input
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="Try Witcher 3, NVIDIA, RAM prices..."
            aria-label="Search gaming and hardware news"
          />
          <button type="submit">Search</button>
        </form>

        <div className="db-topic-chips" aria-label="Quick searches">
          {quickTopics.map(([label, query]) => (
            <button
              type="button"
              key={label}
              className={activeTopic.toLowerCase() === query.toLowerCase() ? 'active' : ''}
              onClick={() => openTopic(query)}
            >
              {label}
            </button>
          ))}
        </div>
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
              <button type="button" onClick={() => openTopic(DEFAULT_TOPIC)}>Back to gaming</button>
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
                    <span>{getSource(featured)}</span>
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
                      {getImage(article) ? (
                        <img src={getImage(article)} alt="" loading="lazy" />
                      ) : (
                        <div className="db-image-fallback">DAILY BYTES</div>
                      )}
                      <span>{activeTopic}</span>
                    </div>
                    <div className="db-card-body">
                      <h3>{article.title}</h3>
                      <p>{articleSummary(article)}</p>
                      <div className="db-article-meta">
                        <span>{getSource(article)}</span>
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
            {priorityTopics.map((item, index) => (
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
            <p>Gaming loads first. Hardware and component pricing are always one click away.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
