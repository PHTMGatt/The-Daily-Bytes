import { Router, Request, Response } from 'express';
import { DailyBytesSavedArticle, getDb } from '../../config/mongo.js';
import { verifySessionToken } from '../../lib/authSession.js';
import { normalizeSavedArticle } from '../../lib/savedArticles.js';

const router = Router();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) throw new Error('JWT_SECRET_KEY is required');
  return secret;
};

const getUsernameFromRequest = (req: Request) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) throw new Error('AUTH_REQUIRED');

  const payload = verifySessionToken(token, getJwtSecret());
  if (typeof payload === 'string' || typeof payload.username !== 'string' || !payload.username.trim()) {
    throw new Error('AUTH_REQUIRED');
  }

  return payload.username.trim().toLowerCase();
};

const handleAuthError = (error: unknown, res: Response) => {
  if (error instanceof Error && (error.message === 'AUTH_REQUIRED' || error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError')) {
    res.status(401).json({ message: 'Sign in to manage saved articles.' });
    return true;
  }
  return false;
};

router.get('/', async (req: Request, res: Response) => {
  try {
    const usernameNormalized = getUsernameFromRequest(req);
    const articles = await getDb()
      .collection<DailyBytesSavedArticle>('saved_articles')
      .find({ usernameNormalized })
      .sort({ savedAt: -1 })
      .project({ _id: 0, usernameNormalized: 0 })
      .toArray();

    return res.json({ articles });
  } catch (error) {
    if (handleAuthError(error, res)) return;
    console.error('Failed to load saved Daily Bytes articles:', error);
    return res.status(500).json({ message: 'Unable to load saved articles right now.' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const usernameNormalized = getUsernameFromRequest(req);
    const article = normalizeSavedArticle(req.body || {});
    const savedAt = new Date();

    const collection = getDb().collection<DailyBytesSavedArticle>('saved_articles');
    const result = await collection.updateOne(
      { usernameNormalized, url: article.url },
      { $setOnInsert: { usernameNormalized, ...article, savedAt } },
      { upsert: true }
    );

    const saved = await collection.findOne(
      { usernameNormalized, url: article.url },
      { projection: { _id: 0, usernameNormalized: 0 } }
    );

    return res.status(result.upsertedCount ? 201 : 200).json({ article: saved });
  } catch (error) {
    if (handleAuthError(error, res)) return;
    if (error instanceof Error && /article|url/i.test(error.message)) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Failed to save Daily Bytes article:', error);
    return res.status(500).json({ message: 'Unable to save that article right now.' });
  }
});

router.delete('/', async (req: Request, res: Response) => {
  try {
    const usernameNormalized = getUsernameFromRequest(req);
    const url = String(req.query.url || '').trim();

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({ message: 'A valid article URL is required.' });
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return res.status(400).json({ message: 'A valid article URL is required.' });
    }

    await getDb().collection<DailyBytesSavedArticle>('saved_articles').deleteOne({
      usernameNormalized,
      url: parsed.toString(),
    });

    return res.status(204).send();
  } catch (error) {
    if (handleAuthError(error, res)) return;
    console.error('Failed to remove saved Daily Bytes article:', error);
    return res.status(500).json({ message: 'Unable to remove that saved article right now.' });
  }
});

export default router;
