const ZODIAC_SIGNS = new Set([
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
]);

export const normalizeZodiacSign = (value: unknown) => {
  const sign = String(value ?? '').trim().toLowerCase() || 'aries';
  if (!ZODIAC_SIGNS.has(sign)) {
    throw new Error('Please provide a valid zodiac sign.');
  }
  return sign;
};
