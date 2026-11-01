import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSavedPayload } from '../src/utils/savedPayload.js';

test('maps a provider article (string source, image, published_at) to a save payload', () => {
  const payload = buildSavedPayload(
    {
      title: 'RTX 5090 restock',
      url: 'https://example.com/a',
      description: '  Stock is back.  ',
      image: 'https://example.com/a.jpg',
      source: 'Example News',
      published_at: '2026-10-31T10:00:00Z',
    },
    'Technology'
  );
  assert.deepEqual(payload, {
    title: 'RTX 5090 restock',
    url: 'https://example.com/a',
    description: 'Stock is back.',
    image: 'https://example.com/a.jpg',
    source: 'Example News',
    publishedAt: '2026-10-31T10:00:00Z',
    topic: 'Technology',
  });
});

test('falls back to urlToImage, object source name, author, and empty strings', () => {
  const a = buildSavedPayload({ title: 'T', url: 'https://x.test/1', urlToImage: 'https://x.test/i.png', source: { name: 'Wire' }, publishedAt: 'p' }, '');
  assert.equal(a.image, 'https://x.test/i.png');
  assert.equal(a.source, 'Wire');
  assert.equal(a.publishedAt, 'p');
  assert.equal(a.topic, '');

  const b = buildSavedPayload({ title: 'T', url: 'https://x.test/2', author: 'Jo' }, 'Latest');
  assert.equal(b.source, 'Jo');
  assert.equal(b.description, '');
  assert.equal(b.image, '');
  assert.equal(b.publishedAt, '');
});
