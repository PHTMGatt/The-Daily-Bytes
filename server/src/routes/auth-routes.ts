import bcrypt from 'bcrypt';
import { Router, Request, Response } from 'express';
import { DailyBytesUser, getDb } from '../config/mongo.js';
import {
  isValidEmail,
  normalizeAccountKey,
  normalizeAccountText,
  readPassword,
} from '../lib/authInputs.js';
import { createSessionToken, DEMO_USERNAME } from '../lib/authSession.js';

const router = Router();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) throw new Error('JWT_SECRET_KEY is required');
  return secret;
};

const createToken = (username: string) => createSessionToken(username, getJwtSecret());

router.post('/demo', async (_req: Request, res: Response) => {
  try {
    const users = getDb().collection<DailyBytesUser>('users');
    const user = await users.findOne({ usernameNormalized: DEMO_USERNAME });

    if (!user) {
      return res.status(503).json({ message: 'Demo access is temporarily unavailable.' });
    }

    return res.json({ token: createToken(user.username) });
  } catch (error) {
    console.error('Daily Bytes demo session failed:', error instanceof Error ? error.message : 'unknown error');
    return res.status(500).json({ message: 'Unable to start demo access right now.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const username = normalizeAccountText(req.body?.username);
  const password = readPassword(req.body?.password);

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const users = getDb().collection<DailyBytesUser>('users');
    const user = await users.findOne({ usernameNormalized: normalizeAccountKey(username) });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    return res.json({ token: createToken(user.username) });
  } catch (error) {
    console.error('Daily Bytes login failed:', error instanceof Error ? error.message : 'unknown error');
    return res.status(500).json({ message: 'Unable to sign in right now.' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const username = normalizeAccountText(req.body?.username);
  const email = normalizeAccountText(req.body?.email);
  const password = readPassword(req.body?.password);

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  if (
    username.length < 3 ||
    username.length > 40 ||
    password.length < 8 ||
    password.length > 128 ||
    !isValidEmail(email)
  ) {
    return res.status(400).json({
      message: 'Use a 3–40 character username, a valid email, and an 8–128 character password.',
    });
  }

  if (normalizeAccountKey(username) === DEMO_USERNAME) {
    return res.status(409).json({ message: 'That username is reserved for the demo account.' });
  }

  try {
    const users = getDb().collection<DailyBytesUser>('users');
    await users.insertOne({
      username,
      usernameNormalized: normalizeAccountKey(username),
      email,
      emailNormalized: normalizeAccountKey(email),
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: new Date(),
    });

    return res.status(201).json({ token: createToken(username) });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'That username or email is already registered.' });
    }

    console.error('Daily Bytes registration failed:', error instanceof Error ? error.message : 'unknown error');
    return res.status(500).json({ message: 'Unable to create your account right now.' });
  }
});

export default router;
