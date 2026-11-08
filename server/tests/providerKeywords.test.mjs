import test from 'node:test';
import assert from 'node:assert/strict';

import { buildProviderKeywords } from '../dist/lib/providerKeywords.js';

test('gaming expands to the priority gaming and PC hardware candidate set', () => {
  const value = buildProviderKeywords('gaming');

  for (const term of [
    'gaming',
    'video games',
    'witcher',
    'cd projekt',
    'nvidia',
    'geforce',
    'rtx',
    'gpu',
    'amd',
    'radeon',
    'ram',
    'ddr5',
    'ssd',
    'pc hardware',
    'xbox',
    'playstation',
    'nintendo',
    'steam',
  ]) {
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

test('"my games" expands to every game in the My games row', () => {
  const terms = buildProviderKeywords('My Games').toLowerCase().split(',');
  for (const term of ['witcher', 'assassins creed', 'crimson desert', 'apex legends', 'hitman', 'doom']) {
    assert.ok(terms.includes(term), term);
  }
  assert.ok(!terms.includes('gaming'));
});

test('"my gear" expands to every part and brand in the My gear row', () => {
  const terms = buildProviderKeywords('my gear').toLowerCase().split(',');
  for (const term of ['rtx 5090', 'corsair', 'dominator', 'razer', 'raspberry pi']) {
    assert.ok(terms.includes(term), term);
  }
});
