import test from 'node:test';
import assert from 'node:assert/strict';

import { getNewsWindow } from '../dist/lib/newsPagination.js';

test('page one starts at provider offset zero while over-fetching two pages', () => {
  assert.deepEqual(getNewsWindow(1, 12), { fetchLimit: 24, offset: 0 });
});

test('visible page stride advances by page size instead of fetch limit', () => {
  assert.deepEqual(getNewsWindow(2, 12), { fetchLimit: 24, offset: 12 });
  assert.deepEqual(getNewsWindow(3, 12), { fetchLimit: 24, offset: 24 });
});

test('larger visible pages keep the same two-page candidate window', () => {
  assert.deepEqual(getNewsWindow(2, 24), { fetchLimit: 48, offset: 24 });
});

test('provider fetch limit remains capped at one hundred', () => {
  assert.deepEqual(getNewsWindow(2, 60), { fetchLimit: 100, offset: 60 });
});
