import test from 'node:test';
import assert from 'node:assert/strict';

import { getNavigationSearchValue } from '../src/utils/navigationSearch.js';

test('returns the decoded q query value', () => {
  assert.equal(getNavigationSearchValue('?q=NVIDIA%20GPU'), 'NVIDIA GPU');
});

test('clears search state when q is absent', () => {
  assert.equal(getNavigationSearchValue(''), '');
  assert.equal(getNavigationSearchValue('?page=2'), '');
});

test('reflects navigation between different search queries', () => {
  assert.equal(getNavigationSearchValue('?q=The%20Witcher%203'), 'The Witcher 3');
  assert.equal(getNavigationSearchValue('?q=RAM%20prices'), 'RAM prices');
});

test('treats an empty q value as empty search text', () => {
  assert.equal(getNavigationSearchValue('?q='), '');
});
