import test from 'node:test';
import assert from 'node:assert/strict';

import { getNewsWindow } from '../dist/lib/newsPagination.js';

test('page one starts at offset zero and fetches a multi-page block', () => {
  assert.deepEqual(getNewsWindow(1, 12), { fetchLimit: 48, offset: 0, block: 0, sliceStart: 0 });
});

test('pages inside one block share the same provider request and slice it', () => {
  const windows = [1, 2, 3, 4].map((page) => getNewsWindow(page, 12));
  assert.ok(windows.every((w) => w.offset === 0 && w.fetchLimit === 48));
  assert.deepEqual(windows.map((w) => w.sliceStart), [0, 12, 24, 36]);
});

test('the next block starts at the following provider offset', () => {
  assert.deepEqual(getNewsWindow(5, 12), { fetchLimit: 48, offset: 48, block: 1, sliceStart: 0 });
  assert.deepEqual(getNewsWindow(6, 12), { fetchLimit: 48, offset: 48, block: 1, sliceStart: 12 });
});

test('block size stays within the provider limit and aligns to the page size', () => {
  assert.deepEqual(getNewsWindow(2, 24), { fetchLimit: 96, offset: 0, block: 0, sliceStart: 24 });
  assert.deepEqual(getNewsWindow(5, 24), { fetchLimit: 96, offset: 96, block: 1, sliceStart: 0 });
  assert.equal(getNewsWindow(1, 7).fetchLimit, 28);
});

test('negative page input never creates a negative provider offset', () => {
  assert.deepEqual(getNewsWindow(-2, 12), { fetchLimit: 48, offset: 0, block: 0, sliceStart: 0 });
});
