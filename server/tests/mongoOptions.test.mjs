import test from 'node:test';
import assert from 'node:assert/strict';

import { mongoClientOptions } from '../dist/config/mongo.js';

test('mongo client has bounded timeouts and pool size', () => {
  assert.ok(mongoClientOptions.serverSelectionTimeoutMS > 0 && mongoClientOptions.serverSelectionTimeoutMS <= 30000);
  assert.ok(mongoClientOptions.connectTimeoutMS > 0 && mongoClientOptions.connectTimeoutMS <= 30000);
  assert.ok(mongoClientOptions.maxPoolSize >= 1 && mongoClientOptions.maxPoolSize <= 50);
});
