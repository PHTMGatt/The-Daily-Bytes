import test from 'node:test';
import assert from 'node:assert/strict';

import { securityHeaders } from '../dist/lib/securityHeaders.js';

const run = (req) => {
  const headers = {};
  let nexted = false;
  securityHeaders(req, { setHeader: (k, v) => { headers[k] = v; } }, () => { nexted = true; });
  return { headers, nexted };
};

test('sets baseline hardening headers and continues the chain', () => {
  const { headers, nexted } = run({ path: '/', secure: false });
  assert.equal(nexted, true);
  assert.equal(headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(headers['X-Frame-Options'], 'DENY');
  assert.equal(headers['Referrer-Policy'], 'strict-origin-when-cross-origin');
  assert.ok(headers['Permissions-Policy']);
});

test('only sends HSTS over secure requests', () => {
  assert.equal(run({ path: '/', secure: false }).headers['Strict-Transport-Security'], undefined);
  assert.match(run({ path: '/', secure: true }).headers['Strict-Transport-Security'], /max-age=\d+/);
});

test('marks API responses no-store but not static assets', () => {
  assert.equal(run({ path: '/api/saved', secure: true }).headers['Cache-Control'], 'no-store');
  assert.equal(run({ path: '/api', secure: true }).headers['Cache-Control'], 'no-store');
  assert.equal(run({ path: '/assets/app.js', secure: true }).headers['Cache-Control'], undefined);
  assert.equal(run({ path: '/apiary', secure: true }).headers['Cache-Control'], undefined);
});

test('CSP blocks framing/plugins but leaves publisher images alone', () => {
  const csp = run({ path: '/', secure: true }).headers['Content-Security-Policy'];
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.doesNotMatch(csp, /img-src/);
});
