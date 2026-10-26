export const ZODIAC_SIGNS = [
  { value: 'aries', label: 'Aries', range: 'Mar 21 – Apr 19' },
  { value: 'taurus', label: 'Taurus', range: 'Apr 20 – May 20' },
  { value: 'gemini', label: 'Gemini', range: 'May 21 – Jun 20' },
  { value: 'cancer', label: 'Cancer', range: 'Jun 21 – Jul 22' },
  { value: 'leo', label: 'Leo', range: 'Jul 23 – Aug 22' },
  { value: 'virgo', label: 'Virgo', range: 'Aug 23 – Sep 22' },
  { value: 'libra', label: 'Libra', range: 'Sep 23 – Oct 22' },
  { value: 'scorpio', label: 'Scorpio', range: 'Oct 23 – Nov 21' },
  { value: 'sagittarius', label: 'Sagittarius', range: 'Nov 22 – Dec 21' },
  { value: 'capricorn', label: 'Capricorn', range: 'Dec 22 – Jan 19' },
  { value: 'aquarius', label: 'Aquarius', range: 'Jan 20 – Feb 18' },
  { value: 'pisces', label: 'Pisces', range: 'Feb 19 – Mar 20' },
];

export const getZodiacMeta = (sign) => {
  const normalized = typeof sign === 'string' ? sign.trim().toLowerCase() : '';
  return ZODIAC_SIGNS.find((item) => item.value === normalized) || ZODIAC_SIGNS[0];
};

export const normalizeHoroscopeResponse = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return { date: '', horoscope: '' };
  }

  const date = typeof payload.date === 'string' ? payload.date.trim() : '';
  const horoscope = typeof payload.horoscope === 'string' ? payload.horoscope.trim() : '';
  return { date, horoscope };
};
