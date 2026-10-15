import { FormEvent, useEffect, useState } from 'react';
import { NewsArticle, retrieveNews } from '../api/mainNewsAPI';
import './DailyByte.css';

export default function DailyByte() {
  const [topic, setTopic] = useState(() => { try { return localStorage.getItem('topic') || ''; } catch { return ''; } });
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!query) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setArticles([]);
    retrieveNews('', 1, 12, controller.signal, query)
      .then(data => setArticles(data.articles))
      .catch(err => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : 'Search failed.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, attempt]);

  const search = (event: FormEvent) => {
    event.preventDefault();
    const value = topic.trim();
    if (!value) return;
    try { localStorage.setItem('topic', value); } catch { /* Search works without storage. */ }
    setSearched(true);
    setQuery(value);
    setAttempt(current => current + 1);
  };
  return (
    <section className="daily-byte">
      <h1>Your Daily Byte</h1>
      <p>Choose a topic and explore recent reporting. Article descriptions come from the publishers, not an AI summary.</p>
      <form className="daily-byte__search" onSubmit={search}>
        <label htmlFor="news-topic">What would you like to read about?</label>
        <div>
          <input id="news-topic" value={topic} onChange={event => setTopic(event.target.value)} maxLength={120} placeholder="Technology, Michigan, space…" required />
          <button type="submit" disabled={loading}>{loading ? 'Searching…' : 'Find stories'}</button>
        </div>
      </form>
      <div aria-live="polite" aria-busy={loading}>
        {loading && <p role="status">Finding stories about {query}…</p>}
        {error && <p role="alert">{error} Submit your search to retry.</p>}
        {!loading && !error && searched && articles.length === 0 && <p>No stories found. Try a broader topic.</p>}
        {!searched && <p>Enter a topic to get started. No search is sent until you select Find stories.</p>}
        {articles.map(article => (
          <article className="daily-byte__story" key={article.url}>
            <h2><a href={article.url} target="_blank" rel="noopener noreferrer">{article.title}</a></h2>
            <p>{article.description || 'Open the original article to read more.'}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
