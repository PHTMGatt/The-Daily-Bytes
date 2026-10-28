import test from 'node:test';
import assert from 'node:assert/strict';

import { rankAndDedupeArticles } from '../dist/lib/newsQuality.js';

const article = (overrides = {}) => ({
  title: 'Story',
  url: 'https://example.com/story',
  description: '',
  published_at: '2026-10-26T12:00:00Z',
  ...overrides,
});

test('gaming profile boosts AMD and Radeon hardware stories over generic gaming mentions', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'Publisher business update',
      url: 'https://example.com/generic-gaming',
      description: 'The gaming market remains active this quarter.',
      published_at: '2026-10-28T12:00:00Z',
    }),
    article({
      title: 'AMD Radeon flagship prices fall',
      url: 'https://example.com/amd-radeon-priority',
      published_at: '2026-10-27T12:00:00Z',
    }),
  ], 'gaming');

  assert.equal(results[0].url, 'https://example.com/amd-radeon-priority');
});
