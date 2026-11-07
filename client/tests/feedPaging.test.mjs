import test from 'node:test';
import assert from 'node:assert/strict';

import { hasMoreStories, mergeArticlePages } from '../src/utils/feedPaging.js';

const story = (url, title) => ({ url, title });

test('appends new stories after the existing ones', () => {
  const { articles, added } = mergeArticlePages([story('a', 'One')], [story('b', 'Two')]);
  assert.deepEqual(articles.map((s) => s.url), ['a', 'b']);
  assert.equal(added, 1);
});

test('drops repeats by URL or accent/punctuation-insensitive headline', () => {
  const { articles, added } = mergeArticlePages(
    [story('a', 'Pokémon Legends: Z-A launches')],
    [story('a', 'Different title'), story('c', 'Pokemon legends z a launches!'), story('d', 'Fresh')],
  );
  assert.deepEqual(articles.map((s) => s.url), ['a', 'd']);
  assert.equal(added, 1);
});

test('ignores entries without a URL and tolerates bad input', () => {
  assert.equal(mergeArticlePages(undefined, [{ title: 'No url' }]).added, 0);
  assert.deepEqual(mergeArticlePages([story('a', 'x')], null).articles.length, 1);
});

test('does not mutate the current list', () => {
  const current = [story('a', 'One')];
  mergeArticlePages(current, [story('b', 'Two')]);
  assert.equal(current.length, 1);
});

test('hasMoreStories requires new stories and remaining provider results', () => {
  assert.equal(hasMoreStories({ page: 1, pageSize: 12, totalResults: 100, added: 12 }), true);
  assert.equal(hasMoreStories({ page: 1, pageSize: 12, totalResults: 100, added: 0 }), false);
  assert.equal(hasMoreStories({ page: 9, pageSize: 12, totalResults: 100, added: 5 }), false);
  assert.equal(hasMoreStories({ page: 1, pageSize: 12, totalResults: undefined, added: 5 }), false);
});
