import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const DEMO_USERNAME = 'demo';
export const SESSION_DURATION = '12h';

// Each "Try the demo" visitor gets a private, throwaway guest identity so two visitors
// never see or change each other's saved articles. Guest saves expire with the session.
export const GUEST_PREFIX = 'guest-';
export const GUEST_SESSION_SECONDS = 24 * 60 * 60;

export const createGuestUsername = () => `${GUEST_PREFIX}${crypto.randomBytes(9).toString('hex')}`;

export const isGuestUsername = (username: string) => username.toLowerCase().startsWith(GUEST_PREFIX);

/** Names nobody may register or log in with (the old shared demo and the guest namespace). */
export const isReservedUsername = (usernameNormalized: string) =>
  usernameNormalized === DEMO_USERNAME || isGuestUsername(usernameNormalized);

export const createGuestSessionToken = (secret: string) =>
  jwt.sign({ username: createGuestUsername(), guest: true }, secret, { expiresIn: GUEST_SESSION_SECONDS });

export const createSessionToken = (username: string, secret: string) =>
  jwt.sign({ username }, secret, { expiresIn: SESSION_DURATION });

export const verifySessionToken = (token: string, secret: string) =>
  jwt.verify(token, secret, { algorithms: ['HS256'] });
