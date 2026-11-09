import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';

import { createSessionToken, DEMO_USERNAME } from '../dist/lib/authSession.js';

const TEST_SECRET = 'daily-bytes-test-secret-that-is-long-enough';

test('createSessionToken signs the expected username claim', () => {
  const token = createSessionToken('demo', TEST_SECRET);
  const payload = jwt.verify(token, TEST_SECRET);

  assert.equal(typeof payload, 'object');
  assert.equal(payload.username, 'demo');
});

test('createSessionToken uses a twelve-hour expiry window', () => {
  const token = createSessionToken('reader', TEST_SECRET);
  const payload = jwt.verify(token, TEST_SECRET);

  assert.equal(typeof payload, 'object');
  assert.equal(typeof payload.iat, 'number');
  assert.equal(typeof payload.exp, 'number');
  assert.ok(Math.abs((payload.exp - payload.iat) - 12 * 60 * 60) <= 1);
});

test('demo username is stable and normalized', () => {
  assert.equal(DEMO_USERNAME, 'demo');
});

test('verifySessionToken accepts tokens it issued', async () => {
  const { verifySessionToken } = await import('../dist/lib/authSession.js');
  const payload = verifySessionToken(createSessionToken('reader', TEST_SECRET), TEST_SECRET);
  assert.equal(payload.username, 'reader');
});

test('verifySessionToken rejects unsigned and non-HS256 tokens', async () => {
  const { verifySessionToken } = await import('../dist/lib/authSession.js');
  const unsigned = jwt.sign({ username: 'demo' }, '', { algorithm: 'none' });
  assert.throws(() => verifySessionToken(unsigned, TEST_SECRET));
  const hs512 = jwt.sign({ username: 'demo' }, TEST_SECRET, { algorithm: 'HS512' });
  assert.throws(() => verifySessionToken(hs512, TEST_SECRET));
});

import {
  createGuestSessionToken,
  isGuestUsername,
  isReservedUsername,
  GUEST_SESSION_SECONDS,
} from '../dist/lib/authSession.js';

test('every demo visitor gets their own private guest identity (no shared account)', () => {
  const a = jwt.verify(createGuestSessionToken(TEST_SECRET), TEST_SECRET);
  const b = jwt.verify(createGuestSessionToken(TEST_SECRET), TEST_SECRET);
  assert.notEqual(a.username, b.username);
  assert.ok(isGuestUsername(a.username));
  assert.equal(a.guest, true);
  assert.ok(Math.abs((a.exp - a.iat) - GUEST_SESSION_SECONDS) <= 1);
});

test('demo and guest-* names are reserved for registration and login', () => {
  assert.equal(isReservedUsername('demo'), true);
  assert.equal(isReservedUsername('guest-abc'), true);
  assert.equal(isReservedUsername('bryen'), false);
});
