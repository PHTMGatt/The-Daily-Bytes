import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDemoAuthRequest } from '../src/utils/authRequest.js';

test('demo auth request posts to the server without a credential body', () => {
  const request = buildDemoAuthRequest();

  assert.equal(request.path, '/api/auth/demo');
  assert.equal(request.init.method, 'POST');
  assert.equal('body' in request.init, false);
});
