import jwt from 'jsonwebtoken';

export const DEMO_USERNAME = 'demo';
export const SESSION_DURATION = '12h';

export const createSessionToken = (username: string, secret: string) =>
  jwt.sign({ username }, secret, { expiresIn: SESSION_DURATION });

export const verifySessionToken = (token: string, secret: string) =>
  jwt.verify(token, secret, { algorithms: ['HS256'] });
