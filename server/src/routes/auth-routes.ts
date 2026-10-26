import bcrypt from 'bcrypt';
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { DailyBytesUser, getDb } from '../config/mongo.js';

const router = Router();

const normalize = (value: unknown) => String(value || '').trim();
const normalizeKey = (value: unknown) => normalize(value).toLowerCase();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) throw new Error('JWT_SECRET_KEY is required');
  return secret;
};

const createToken = (username: string) =>
  jwt.sign({ username }, getJwtSecret(), { expiresIn: '12h' });

router.post('/login', async (req: Request, res: Response) => {
  const username = normalize(req.body?.username);
  const password = normalize(req.body?.password);

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const users = getDb().collection<DailyBytesUser>('users');
    const user = await users.findOne({ usernameNormalized: normalizeKey(username) });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    return res.json({ token: createToken(user.username) });
  } catch (error) {
    console.error('Daily Bytes login failed:', error);
    return res.status(500).json({ message: 'Unable to sign in right now.' });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  const username = normalize(req.body?.username);
  const email = normalize(req.body?.email);
  const password = normalize(req.body?.password);

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required.' });
  }

  if (username.length < 3 || password.length < 8 || !email.includes('@')) {
    return res.status(400).json({
      message: 'Use a 3+ character username, a valid email, and an 8+ character password.',
    });
  }

  if (normalizeKey(username) === 'demo') {
    return res.status(409).json({ message: 'That username is reserved for the demo account.' });
  }

  try {
    const users = getDb().collection<DailyBytesUser>('users');
    await users.insertOne({
      username,
      usernameNormalized: normalizeKey(username),
      email,
      emailNormalized: normalizeKey(email),
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: new Date(),
    });

    return res.status(201).json({ token: createToken(username) });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'That username or email is already registered.' });
    }

    console.error('Daily Bytes registration failed:', error);
    return res.status(500).json({ message: 'Unable to create your account right now.' });
  }
});

export default router;
