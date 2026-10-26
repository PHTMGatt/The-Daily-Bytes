import test from 'node:test';
import assert from 'node:assert/strict';

import { getNewsWindow } from '../dist/lib/newsPagination.js';

test('page one starts at offset zero with one visible page of provider rows', () => {
  assert.deepEqual(getNewsWindow(1, 12), { fetchLimit: 12, offset: 0 });
});

test('adjacent pages use distinct page-sized provider windows', () => {
  assert.deepEqual(getNewsWindow(2, 12), { fetchLimit: 12, offset: 12 });
  assert.deepEqual(getNewsWindow(3, 12), { fetchLimit: 12, offset: 24 });
});

test('larger visible pages keep matching provider window sizes', () => {
  assert.deepEqual(getNewsWindow(2, 24), { fetchLimit: 24, offset: 24 });
});

test('negative page input never creates a negative provider offset', () => {
  assert.deepEqual(getNewsWindow(-2, 12), { fetchLimit: 12, offset: 0 });
});
