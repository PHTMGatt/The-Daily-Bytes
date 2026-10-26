import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSavedArticle } from '../dist/lib/savedArticles.js';

test('normalizeSavedArticle trims fields and keeps supported article metadata', () => {
  const article = normalizeSavedArticle({
    title: '  Witcher 3 update  ',
    url: ' https://example.com/witcher ',
    description: '  Patch notes  ',
    image: ' https://example.com/image.jpg ',
    source: '  Example News  ',
    publishedAt: '2026-10-25T20:00:00Z',
    topic: '  Witcher 3  ',
  });

  assert.deepEqual(article, {
    title: 'Witcher 3 update',
    url: 'https://example.com/witcher',
    description: 'Patch notes',
    image: 'https://example.com/image.jpg',
    source: 'Example News',
    publishedAt: '2026-10-25T20:00:00Z',
    topic: 'Witcher 3',
  });
});

test('normalizeSavedArticle rejects missing title or invalid URL', () => {
  assert.throws(() => normalizeSavedArticle({ title: '', url: 'https://example.com' }), /title/i);
  assert.throws(() => normalizeSavedArticle({ title: 'Story', url: 'javascript:alert(1)' }), /url/i);
});
