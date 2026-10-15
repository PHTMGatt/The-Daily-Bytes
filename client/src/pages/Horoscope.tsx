import React, { useState, useEffect } from 'react';
import './Horoscope.css';
import { API_ORIGIN } from '../api/config';

interface HoroscopeData {
  description: string;
  lucky_number: string;
  mood: string;
}

const Horoscope: React.FC = () => {
  const [selectedSign, setSelectedSign] = useState('aries');
  const [currentDate, setCurrentDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [horoscope, setHoroscope] = useState<HoroscopeData>({
    description: '',
    lucky_number: '',
    mood: ''
  });

useEffect(() => {
  const controller = new AbortController();
  setError('');
  setLoading(true);
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  setCurrentDate(now.toLocaleDateString('en-US', options));

  fetch(`${API_ORIGIN}/api/horoscope?zodiacSign=${selectedSign}`, { signal: controller.signal })
    .then(res => { if (!res.ok) throw new Error('Horoscopes are temporarily unavailable.'); return res.json(); })
    .then(data => {
      const d = data?.data || data; // ✅ fallback for RapidAPI response shape
      setHoroscope({
        description: d.horoscope || 'No description',
        lucky_number: d.lucky_number || 'N/A',
        mood: d.mood || 'Unknown'
      });
    })
    .catch(err => { if (!controller.signal.aborted) setError(err.message); })
    .finally(() => { if (!controller.signal.aborted) setLoading(false); });
  return () => controller.abort();
}, [selectedSign]);

  const handleSignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSign(e.target.value);
  };

  const getSignName = () => {
    const select = document.getElementById('zodiac-sign') as HTMLSelectElement;
    return select?.options[select.selectedIndex]?.text.split(' ')[0] || '';
  };

  return (
    <div className="horoscope-container">
      <div className="horoscope-section">
        <div className="horoscope-header">
          <h1>Daily Horoscope</h1>
          {loading && <p role="status">Loading horoscope…</p>}
          {error && <p role="alert">{error}</p>}
          <div className="date-display">{currentDate}</div>
        </div>

        <select
          className="zodiac-selector"
          id="zodiac-sign"
          value={selectedSign}
          onChange={handleSignChange}
        >
          <option value="aries">Aries (Mar 21 - Apr 19)</option>
          <option value="taurus">Taurus (Apr 20 - May 20)</option>
          <option value="gemini">Gemini (May 21 - Jun 20)</option>
          <option value="cancer">Cancer (Jun 21 - Jul 22)</option>
          <option value="leo">Leo (Jul 23 - Aug 22)</option>
          <option value="virgo">Virgo (Aug 23 - Sep 22)</option>
          <option value="libra">Libra (Sep 23 - Oct 22)</option>
          <option value="scorpio">Scorpio (Oct 23 - Nov 21)</option>
          <option value="sagittarius">Sagittarius (Nov 22 - Dec 21)</option>
          <option value="capricorn">Capricorn (Dec 22 - Jan 19)</option>
          <option value="aquarius">Aquarius (Jan 20 - Feb 18)</option>
          <option value="pisces">Pisces (Feb 19 - Mar 20)</option>
        </select>

        <div className="horoscope-content">
          <h3 className="horoscope-title">{getSignName()}</h3>
          <p className="horoscope-text">{horoscope.description}</p>

          <div className="horoscope-details">
            <div className="lucky-number">
              Lucky Number<br />
              <span>{horoscope.lucky_number}</span>
            </div>
            <div className="mood">
              Mood<br />
              <span>{horoscope.mood}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Horoscope;
