import test from 'node:test';
import assert from 'node:assert/strict';

import { feedVariant, nextHeaderHidden, rowScrollDelta } from '../src/utils/feedLayout.js';

test('desktop feed is all standard cards', () => {
  for (let i = 0; i < 12; i += 1) assert.equal(feedVariant(i, false), 'standard');
});

test('phone feed is compact rows with every 5th story as a full image card', () => {
  const variants = Array.from({ length: 11 }, (_, i) => feedVariant(i, true));
  assert.deepEqual(variants, [
    'compact', 'compact', 'compact', 'compact', 'standard',
    'compact', 'compact', 'compact', 'compact', 'standard',
    'compact',
  ]);
});

test('header stays visible near the top', () => {
  assert.equal(nextHeaderHidden(0, 100, false), false);
  assert.equal(nextHeaderHidden(400, 60, true), false);
});

test('header hides on scroll down and returns on scroll up', () => {
  assert.equal(nextHeaderHidden(200, 260, false), true);
  assert.equal(nextHeaderHidden(600, 540, true), false);
});

test('small jitter keeps the current state', () => {
  assert.equal(nextHeaderHidden(500, 504, true), true);
  assert.equal(nextHeaderHidden(500, 496, false), false);
});

test('rowScrollDelta brings a half-hidden chip fully into its row, clear of the edge fade', () => {
  const row = { left: 100, right: 500 };
  assert.equal(rowScrollDelta({ left: 200, right: 300 }, row, 28), 0);
  assert.equal(rowScrollDelta({ left: 450, right: 560 }, row, 28), 88);
  assert.equal(rowScrollDelta({ left: 60, right: 140 }, row, 28), -68);
});
