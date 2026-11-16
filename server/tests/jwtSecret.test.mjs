import test from 'node:test';
import assert from 'node:assert/strict';

import { assertJwtSecret, TEST_JWT_SECRET } from '../dist/lib/jwtSecret.js';

test('rejects a missing secret', () => {
  assert.throws(() => assertJwtSecret({}), /required/);
});

test('rejects a secret shorter than 32 characters', () => {
  assert.throws(() => assertJwtSecret({ JWT_SECRET_KEY: 'x'.repeat(31) }), /at least 32/);
});

test('accepts a 32+ character secret', () => {
  const secret = 'y'.repeat(32);
  assert.equal(assertJwtSecret({ JWT_SECRET_KEY: secret }), secret);
});

test('test env falls back to the test secret, but still checks a provided one', () => {
  assert.equal(assertJwtSecret({ NODE_ENV: 'test' }), TEST_JWT_SECRET);
  assert.throws(() => assertJwtSecret({ NODE_ENV: 'test', JWT_SECRET_KEY: 'short' }), /at least 32/);
});

test('production does not get the test fallback', () => {
  assert.throws(() => assertJwtSecret({ NODE_ENV: 'production' }), /required/);
});
