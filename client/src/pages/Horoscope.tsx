import { useEffect, useMemo, useState } from 'react';
import { FiRefreshCw, FiStar, FiZap } from 'react-icons/fi';
import {
  ZODIAC_SIGNS,
  getZodiacMeta,
  normalizeHoroscopeResponse,
} from '../utils/horoscopeView';
import './Horoscope.css';

interface HoroscopeData {
  date: string;
  horoscope: string;
}

const formatHoroscopeDate = (value: string) => {
  if (!value) {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const Horoscope = () => {
  const [selectedSign, setSelectedSign] = useState('aries');
  const [data, setData] = useState<HoroscopeData>({ date: '', horoscope: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const selectedMeta = useMemo(() => getZodiacMeta(selectedSign), [selectedSign]);

  useEffect(() => {
    const controller = new AbortController();

    const loadHoroscope = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/horoscope?zodiacSign=${encodeURIComponent(selectedMeta.value)}`,
          { signal: controller.signal },
        );
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message = typeof payload?.error === 'string'
            ? payload.error
            : 'Unable to load today’s horoscope.';
          throw new Error(message);
        }

        const normalized = normalizeHoroscopeResponse(payload);
        if (!normalized.horoscope) {
          throw new Error('The horoscope provider returned an empty reading.');
        }

        setData(normalized);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        setData({ date: '', horoscope: '' });
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load today’s horoscope.',
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadHoroscope();
    return () => controller.abort();
  }, [selectedMeta.value, retryKey]);

  return (
    <section className="horoscope-page">
      <header className="horoscope-hero">
        <div>
          <span className="horoscope-kicker"><FiZap /> DAILY EXTRA</span>
          <h1>Daily Horoscope</h1>
          <p>
            Pick your sign for a lightweight daily reading alongside your gaming and hardware feed.
          </p>
        </div>
        <div className="horoscope-orbit" aria-hidden="true">
          <FiStar />
        </div>
      </header>

      <div className="horoscope-layout">
        <aside className="horoscope-picker">
          <label htmlFor="zodiac-sign">Choose your sign</label>
          <select
            id="zodiac-sign"
            value={selectedSign}
            onChange={(event) => setSelectedSign(event.target.value)}
          >
            {ZODIAC_SIGNS.map((sign) => (
              <option key={sign.value} value={sign.value}>
                {sign.label} · {sign.range}
              </option>
            ))}
          </select>

          <div className="horoscope-sign-summary">
            <span>{selectedMeta.label}</span>
            <strong>{selectedMeta.range}</strong>
            <small>Daily reading supplied by the connected horoscope provider.</small>
          </div>
        </aside>

        <article className="horoscope-card" aria-live="polite">
          <div className="horoscope-card-header">
            <div>
              <span>TODAY’S READING</span>
              <h2>{selectedMeta.label}</h2>
            </div>
            {!loading && !error && data.date && (
              <time dateTime={data.date}>{formatHoroscopeDate(data.date)}</time>
            )}
          </div>

          {loading ? (
            <div className="horoscope-state">
              <FiRefreshCw className="horoscope-spin" aria-hidden="true" />
              <strong>Reading the stars...</strong>
              <p>Loading today’s {selectedMeta.label} horoscope.</p>
            </div>
          ) : error ? (
            <div className="horoscope-state horoscope-error" role="alert">
              <strong>Reading unavailable</strong>
              <p>{error}</p>
              <button type="button" onClick={() => setRetryKey((current) => current + 1)}>
                Try again
              </button>
            </div>
          ) : (
            <div className="horoscope-reading">
              <p>{data.horoscope}</p>
              <div className="horoscope-date-line">
                <FiStar aria-hidden="true" />
                <span>{formatHoroscopeDate(data.date)}</span>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
};

export default Horoscope;
