import test from 'node:test';
import assert from 'node:assert/strict';

import { buildProviderKeywords } from '../dist/lib/providerKeywords.js';

test('gaming expands to the priority gaming and PC hardware candidate set', () => {
  const value = buildProviderKeywords('gaming');

  for (const term of ['gaming', 'witcher', 'cd projekt', 'nvidia', 'rtx', 'gpu', 'ram', 'ddr5', 'ssd', 'pc hardware']) {
    assert.ok(value.toLowerCase().split(',').includes(term));
  }
});

test('gaming expansion is case-insensitive and whitespace tolerant', () => {
  assert.equal(buildProviderKeywords('  GAMING  '), buildProviderKeywords('gaming'));
});

test('focused and arbitrary searches pass through unchanged apart from trimming', () => {
  assert.equal(buildProviderKeywords(' NVIDIA GPU '), 'NVIDIA GPU');
  assert.equal(buildProviderKeywords('RAM prices'), 'RAM prices');
  assert.equal(buildProviderKeywords('custom game studio search'), 'custom game studio search');
});

test('empty keywords stay empty', () => {
  assert.equal(buildProviderKeywords('   '), '');
});
