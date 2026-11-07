import test from 'node:test';
import assert from 'node:assert/strict';

import { cleanProviderText } from '../dist/lib/textCleanup.js';
import { rankAndDedupeArticles } from '../dist/lib/newsQuality.js';

test('cleanProviderText decodes named and numeric entities', () => {
  assert.equal(cleanProviderText('Nintendo &amp; Sony: Don&#8217;t miss &#x27;this&#x27;'), "Nintendo & Sony: Don’t miss 'this'");
});

test('cleanProviderText strips tags, collapses whitespace, and leaves unknown entities', () => {
  assert.equal(cleanProviderText('  <p>RTX   <b>5090</b></p>\n&bogus; &#99999999;'), 'RTX 5090 &bogus; &#99999999;');
});

test('cleanProviderText returns empty string for non-strings', () => {
  assert.equal(cleanProviderText(null), '');
  assert.equal(cleanProviderText(undefined), '');
});

test('rankAndDedupeArticles cleans text and dedupes entity-encoded duplicates', () => {
  const results = rankAndDedupeArticles([
    { title: 'Xbox &amp; PlayStation prices rise', url: 'https://a.example/1', description: '<p>Console costs</p>' },
    { title: 'Xbox & PlayStation prices rise', url: 'https://b.example/2', description: '' },
  ], '');
  assert.equal(results.length, 1);
  assert.equal(results[0].title, 'Xbox & PlayStation prices rise');
  assert.equal(results[0].description, 'Console costs');
});
