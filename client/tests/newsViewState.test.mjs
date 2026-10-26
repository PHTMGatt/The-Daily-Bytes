import test from 'node:test';
import assert from 'node:assert/strict';

import { getNewsViewState } from '../src/utils/newsViewState.js';

test('loading takes precedence before a request finishes', () => {
  assert.equal(getNewsViewState({ loading: true, error: '', articleCount: 0 }), 'loading');
});

test('error displays after loading ends', () => {
  assert.equal(getNewsViewState({ loading: false, error: 'Provider failed', articleCount: 0 }), 'error');
});

test('empty only displays after a successful zero-result request', () => {
  assert.equal(getNewsViewState({ loading: false, error: '', articleCount: 0 }), 'empty');
});

test('ready displays when articles are available', () => {
  assert.equal(getNewsViewState({ loading: false, error: '', articleCount: 3 }), 'ready');
});

test('loading still wins if stale articles are present during refresh', () => {
  assert.equal(getNewsViewState({ loading: true, error: '', articleCount: 3 }), 'loading');
});
