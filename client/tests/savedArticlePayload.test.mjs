import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSavedArticlePayload } from '../src/utils/savedArticlePayload.js';

test('buildSavedArticlePayload preserves normalized article metadata', () => {
  assert.deepEqual(
    buildSavedArticlePayload({
      title: ' RTX 5090 pricing update ',
      url: ' https://example.com/rtx ',
      description: ' New retail pricing. ',
      image: ' https://example.com/rtx.jpg ',
      source: ' Example Tech ',
      publishedAt: ' 2026-10-26T12:00:00Z ',
    }, ' NVIDIA GPU '),
    {
      title: 'RTX 5090 pricing update',
      url: 'https://example.com/rtx',
      description: 'New retail pricing.',
      image: 'https://example.com/rtx.jpg',
      source: 'Example Tech',
      publishedAt: '2026-10-26T12:00:00Z',
      topic: 'NVIDIA GPU',
    },
  );
});

test('buildSavedArticlePayload safely defaults optional metadata', () => {
  assert.deepEqual(
    buildSavedArticlePayload({ title: 'Story', url: 'https://example.com/story' }, ''),
    {
      title: 'Story',
      url: 'https://example.com/story',
      description: '',
      image: '',
      source: '',
      publishedAt: '',
      topic: 'Latest',
    },
  );
});
