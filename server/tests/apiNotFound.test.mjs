import test from 'node:test';
import assert from 'node:assert/strict';

import { apiNotFound } from '../dist/lib/apiNotFound.js';

test('unknown API paths answer a JSON 404 instead of the SPA index page', () => {
  const sent = {};
  const res = {
    status(code) { sent.status = code; return this; },
    json(body) { sent.body = body; return this; },
  };
  apiNotFound({}, res);
  assert.equal(sent.status, 404);
  assert.deepEqual(sent.body, { message: 'Not found.' });
});
