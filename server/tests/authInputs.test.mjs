import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAccountText, normalizeAccountKey, readPassword, isValidEmail } from '../dist/lib/authInputs.js';

test('account text trims display values and normalizes lookup keys', () => {
  assert.equal(normalizeAccountText('  Geralt  '), 'Geralt');
  assert.equal(normalizeAccountKey('  Geralt  '), 'geralt');
});

test('password input preserves leading and trailing spaces', () => {
  assert.equal(readPassword('  silver sword  '), '  silver sword  ');
});

test('email validation rejects malformed addresses', () => {
  assert.equal(isValidEmail('reader@example.com'), true);
  assert.equal(isValidEmail('reader@'), false);
  assert.equal(isValidEmail('@example.com'), false);
  assert.equal(isValidEmail('reader example.com'), false);
});
