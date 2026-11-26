import test from 'node:test';
import assert from 'node:assert/strict';

import { IMAGE_STALL_MS, getImageSlotState, shouldDisplayArticleImage } from '../src/utils/articleImage.js';

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

test('image slot shows a skeleton while loading, the picture once loaded, and the fallback otherwise', () => {
  assert.equal(getImageSlotState('https://example.com/gpu.jpg'), 'loading');
  assert.equal(getImageSlotState('https://example.com/gpu.jpg', 'loading'), 'loading');
  assert.equal(getImageSlotState('https://example.com/gpu.jpg', 'loaded'), 'ready');
  assert.equal(getImageSlotState('https://example.com/gpu.jpg', 'failed'), 'fallback');
  assert.equal(getImageSlotState('', 'loaded'), 'fallback');
  assert.equal(getImageSlotState(null), 'fallback');
});

test('a stalled image gives up within a reasonable time', () => {
  assert.ok(IMAGE_STALL_MS >= 5000 && IMAGE_STALL_MS <= 20000);
});
