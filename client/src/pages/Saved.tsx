import { useEffect, useState } from 'react';
import { FiArrowUpRight, FiBookmark, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ArticleImage from '../components/ArticleImage';
import { getSavedArticles, removeSavedArticle, SavedArticlePayload } from '../api/savedArticlesAPI';
import auth from '../utils/auth';
import './Saved.css';

const formatDate = (value?: string) => {
  if (!value) return 'Saved story';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved story';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function Saved() {
  const [articles, setArticles] = useState<SavedArticlePayload[]>([]);
  const [loading, setLoading] = useState(auth.loggedIn());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth.loggedIn()) return;

    getSavedArticles()
      .then(setArticles)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load saved stories.'))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (url: string) => {
    try {
      await removeSavedArticle(url);
      setArticles((current) => current.filter((article) => article.url !== url));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove that story.');
    }
  };

  if (!auth.loggedIn()) {
    return (
      <section className="saved-page saved-empty-state">
        <FiBookmark />
        <span className="saved-kicker">YOUR READING LIST</span>
        <h1>Save the stories you want to come back to.</h1>
        <p>Sign in and Daily Bytes will keep your saved gaming and hardware stories in MongoDB.</p>
        <Link to="/login">Sign in to save stories</Link>
      </section>
    );
  }

  return (
    <section className="saved-page">
      <header className="saved-header">
        <div>
          <span className="saved-kicker"><FiBookmark /> SAVED ARTICLES</span>
          <h1>Your reading list.</h1>
          <p>Gaming, hardware, pricing, and anything else you wanted to keep.</p>
        </div>
        <Link to="/">Back to the feed</Link>
      </header>

      {error && <div className="saved-message error">{error}</div>}
      {loading ? (
        <div className="saved-message">Loading saved stories...</div>
      ) : articles.length === 0 ? (
        <div className="saved-empty-state inline">
          <FiBookmark />
          <h2>Nothing saved yet.</h2>
          <p>Bookmark a story from the main feed and it will show up here.</p>
          <Link to="/">Browse gaming news</Link>
        </div>
      ) : (
        <div className="saved-grid">
          {articles.map((article) => (
            <article className="saved-card" key={article.url}>
              <div className="saved-card-media">
                <ArticleImage src={article.image} fallbackClassName="saved-image-fallback" />
                <span>{article.topic || 'Saved'}</span>
              </div>
              <div className="saved-card-body">
                <div className="saved-card-meta">
                  <span>{article.source || 'News source'}</span>
                  <span>•</span>
                  <span>{formatDate(article.publishedAt || article.savedAt)}</span>
                </div>
                <h2>{article.title}</h2>
                <p>{article.description || 'Open the original story for the full details.'}</p>
                <div className="saved-card-actions">
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Open story <FiArrowUpRight />
                  </a>
                  <button type="button" onClick={() => remove(article.url)} aria-label={`Remove ${article.title} from saved articles`}>
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
