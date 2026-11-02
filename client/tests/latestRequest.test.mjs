import test from 'node:test';
import assert from 'node:assert/strict';

import { createLatestRequestGuard } from '../src/utils/latestRequest.js';

test('only the most recently started request is current', () => {
  const guard = createLatestRequestGuard();
  const first = guard.start();
  const second = guard.start();
  assert.equal(guard.isCurrent(first), false);
  assert.equal(guard.isCurrent(second), true);
});

test('a slow earlier response is ignored after a newer request starts', async () => {
  const guard = createLatestRequestGuard();
  const applied = [];
  const run = async (label, delay) => {
    const token = guard.start();
    await new Promise((resolve) => setTimeout(resolve, delay));
    if (guard.isCurrent(token)) applied.push(label);
  };
  await Promise.all([run('slow-old', 20), run('fast-new', 1)]);
  assert.deepEqual(applied, ['fast-new']);
});

test('invalidate makes an in-flight request stale (unmount)', () => {
  const guard = createLatestRequestGuard();
  const token = guard.start();
  guard.invalidate();
  assert.equal(guard.isCurrent(token), false);
});
