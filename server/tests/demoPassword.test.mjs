import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveDemoPassword } from '../dist/config/mongo.js';

test('demo password uses DEMO_PASSWORD when set', () => {
  assert.equal(resolveDemoPassword({ DEMO_PASSWORD: 'set-by-env', NODE_ENV: 'production' }), 'set-by-env');
});

test('production without DEMO_PASSWORD never uses the fixed default', () => {
  const a = resolveDemoPassword({ NODE_ENV: 'production' });
  const b = resolveDemoPassword({ NODE_ENV: 'production' });
  assert.notEqual(a, 'dailybytes');
  assert.ok(a.length >= 24);
  assert.notEqual(a, b);
});

test('local development keeps the documented default', () => {
  assert.equal(resolveDemoPassword({}), 'dailybytes');
});
