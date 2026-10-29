import test from 'node:test';
import assert from 'node:assert/strict';
import { InflightRequests } from '../dist/lib/inflightRequests.js';

test('InflightRequests shares one task across concurrent callers with the same key', async () => {
  const inflight = new InflightRequests();
  let calls = 0;
  const task = async () => {
    calls += 1;
    await new Promise((resolve) => setTimeout(resolve, 5));
    return 'result';
  };

  const results = await Promise.all([inflight.run('a', task), inflight.run('a', task)]);

  assert.deepEqual(results, ['result', 'result']);
  assert.equal(calls, 1);
  assert.equal(inflight.size, 0);
});

test('InflightRequests runs separate tasks for different keys', async () => {
  const inflight = new InflightRequests();
  let calls = 0;
  const task = async () => ++calls;

  await Promise.all([inflight.run('a', task), inflight.run('b', task)]);

  assert.equal(calls, 2);
});

test('InflightRequests propagates failures to all waiters and allows a retry', async () => {
  const inflight = new InflightRequests();
  const failing = async () => { throw new Error('provider down'); };

  const settled = await Promise.allSettled([inflight.run('a', failing), inflight.run('a', failing)]);
  assert.deepEqual(settled.map((s) => s.status), ['rejected', 'rejected']);
  assert.equal(inflight.size, 0);

  assert.equal(await inflight.run('a', async () => 'ok'), 'ok');
});
