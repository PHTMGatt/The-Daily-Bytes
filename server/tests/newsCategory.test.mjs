import test from 'node:test';
import assert from 'node:assert/strict';

import { parseNewsCategory } from '../dist/lib/newsCategory.js';

test('empty category means the general feed', () => {
  assert.deepEqual(parseNewsCategory(undefined), { ok: true, category: '' });
  assert.deepEqual(parseNewsCategory('  '), { ok: true, category: '' });
});

test('supported categories are normalised to lower case', () => {
  assert.deepEqual(parseNewsCategory('Technology'), { ok: true, category: 'technology' });
  assert.deepEqual(parseNewsCategory(' SPORTS '), { ok: true, category: 'sports' });
  for (const name of ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology']) {
    assert.equal(parseNewsCategory(name).ok, true);
  }
});

test('unknown categories are rejected instead of reaching the provider or cache', () => {
  assert.deepEqual(parseNewsCategory('gaming'), { ok: false });
  assert.deepEqual(parseNewsCategory('tech,sports'), { ok: false });
  assert.deepEqual(parseNewsCategory('-sports'), { ok: false });
  assert.deepEqual(parseNewsCategory('x'.repeat(500)), { ok: false });
});
