import express from 'express';
import axios from 'axios';
import { normalizeZodiacSign } from '../../lib/horoscope.js';

const router = express.Router();

router.get('/', async (req, res) => {
  let zodiacSign: string;
  try {
    zodiacSign = normalizeZodiacSign(req.query.zodiacSign);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Please provide a valid zodiac sign.',
    });
  }

  const apiKey = process.env.API_NINJAS_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Horoscope service is not configured.' });
  }

  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/horoscope', {
      params: { zodiac: zodiacSign },
      headers: { 'X-Api-Key': apiKey },
      timeout: 8000,
    });

    return res.json(response.data);
  } catch (error: any) {
    console.error('Horoscope API request failed:', error?.response?.status || error?.code || 'unknown error');
    return res.status(502).json({ error: 'Failed to fetch horoscope.' });
  }
});

export default router;
