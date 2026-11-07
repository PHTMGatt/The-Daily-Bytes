import test from 'node:test';
import assert from 'node:assert/strict';
import { RateLimiter, createRateLimitMiddleware } from '../dist/lib/rateLimit.js';

test('RateLimiter allows up to max hits then blocks within the window', () => {
  const limiter = new RateLimiter(1000, 2);
  assert.equal(limiter.hit('a', 0).allowed, true);
  assert.equal(limiter.hit('a', 10).allowed, true);
  const blocked = limiter.hit('a', 20);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 1);
});

test('RateLimiter tracks keys independently and resets after the window', () => {
  const limiter = new RateLimiter(1000, 1);
  assert.equal(limiter.hit('a', 0).allowed, true);
  assert.equal(limiter.hit('a', 1).allowed, false);
  assert.equal(limiter.hit('b', 1).allowed, true);
  assert.equal(limiter.hit('a', 1000).allowed, true);
});

test('RateLimiter keeps memory bounded by maxKeys', () => {
  const limiter = new RateLimiter(10000, 5, 3);
  for (let i = 0; i < 10; i += 1) limiter.hit(`k${i}`, i);
  assert.ok(limiter.buckets.size <= 3);
});

test('middleware responds 429 with Retry-After once the limit is exceeded', () => {
  const middleware = createRateLimitMiddleware({ windowMs: 60000, max: 1 });
  let nextCalls = 0;
  const res = {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
  middleware({ ip: '1.2.3.4' }, res, () => { nextCalls += 1; });
  middleware({ ip: '1.2.3.4' }, res, () => { nextCalls += 1; });
  assert.equal(nextCalls, 1);
  assert.equal(res.code, 429);
  assert.ok(Number(res.headers['Retry-After']) >= 1);
});
