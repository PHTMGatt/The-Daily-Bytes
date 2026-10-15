import express from 'express';
import axios from 'axios';
const router = express.Router();
const signs = new Set(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']);
router.get('/', async (req, res) => {
  const sign = typeof req.query.zodiacSign === 'string' ? req.query.zodiacSign.toLowerCase() : 'virgo';
  if (!signs.has(sign)) return res.status(400).json({ error: 'Select a valid zodiac sign.' });
  if (!process.env.API_NINJAS_KEY) return res.status(503).json({ error: 'Horoscope service is not configured.' });
  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/horoscope', {
      params: { zodiac: sign }, timeout: 10000, headers: { 'X-Api-Key': process.env.API_NINJAS_KEY },
    });
    return res.json(response.data);
  } catch {
    console.error('Horoscope provider request failed');
    return res.status(502).json({ error: 'Horoscopes are temporarily unavailable.' });
  }
});
export default router;
