import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldDisplayArticleImage } from '../src/utils/articleImage.js';

test('blank image sources use the fallback', () => {
  assert.equal(shouldDisplayArticleImage(''), false);
  assert.equal(shouldDisplayArticleImage('   '), false);
  assert.equal(shouldDisplayArticleImage(null), false);
});

test('a valid source displays until it fails', () => {
  assert.equal(shouldDisplayArticleImage('https://example.com/gpu.jpg'), true);
  assert.equal(shouldDisplayArticleImage('https://example.com/gpu.jpg', true), false);
});

test('a replacement source can display after a prior source failed', () => {
  assert.equal(shouldDisplayArticleImage('https://example.com/new-image.jpg', false), true);
});
