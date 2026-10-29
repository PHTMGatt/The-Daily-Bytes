import test from 'node:test';
import assert from 'node:assert/strict';
import { TimedCache } from '../dist/lib/timedCache.js';

test('TimedCache returns values before expiration', () => {
  const cache = new TimedCache(1000, 10);
  cache.set('gaming', { articles: [1] }, 1000);
  assert.deepEqual(cache.get('gaming', 1500), { articles: [1] });
});

test('TimedCache removes expired values', () => {
  const cache = new TimedCache(1000, 10);
  cache.set('gaming', { articles: [1] }, 1000);
  assert.equal(cache.get('gaming', 2001), undefined);
});

test('TimedCache evicts the oldest entry when capacity is exceeded', () => {
  const cache = new TimedCache(1000, 2);
  cache.set('a', 1, 1000);
  cache.set('b', 2, 1001);
  cache.set('c', 3, 1002);
  assert.equal(cache.get('a', 1003), undefined);
  assert.equal(cache.get('b', 1003), 2);
  assert.equal(cache.get('c', 1003), 3);
});

test('TimedCache getStale serves expired values within the stale window only', () => {
  const cache = new TimedCache(1000, 10);
  cache.set('gaming', { articles: [1] }, 1000);
  assert.equal(cache.get('gaming', 2500), undefined);
  assert.deepEqual(cache.getStale('gaming', 5000, 2500), { articles: [1] });
  assert.equal(cache.getStale('gaming', 5000, 7001), undefined);
  assert.equal(cache.getStale('gaming', 5000, 2500), undefined);
});
