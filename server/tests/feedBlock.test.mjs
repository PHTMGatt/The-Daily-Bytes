import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveFetchedBlock, EMPTY_BLOCK_TTL_MS } from '../dist/lib/feedBlock.js';
import { TimedCache } from '../dist/lib/timedCache.js';

const full = { articles: [{ title: 'a' }], totalResults: 5 };
const empty = { articles: [], totalResults: 0 };

test('a non-empty fetch is used and cached normally', () => {
  const d = resolveFetchedBlock(full, undefined);
  assert.equal(d.block, full);
  assert.equal(d.stale, false);
  assert.equal(d.cacheTtlMs, undefined);
});

test('an empty fetch falls back to the previous non-empty block', () => {
  const d = resolveFetchedBlock(empty, full);
  assert.equal(d.block, full);
  assert.equal(d.stale, true);
});

test('an empty fetch with nothing to fall back on is cached only briefly', () => {
  assert.equal(resolveFetchedBlock(empty, undefined).cacheTtlMs, EMPTY_BLOCK_TTL_MS);
  assert.equal(resolveFetchedBlock(empty, empty).cacheTtlMs, EMPTY_BLOCK_TTL_MS);
});

test('TimedCache.set accepts a per-entry ttl', () => {
  const cache = new TimedCache(10000, 10);
  cache.set('k', 1, 1000, 100);
  assert.equal(cache.get('k', 1050), 1);
  assert.equal(cache.get('k', 1101), undefined);
});
