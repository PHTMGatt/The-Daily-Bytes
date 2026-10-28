import test from 'node:test';
import assert from 'node:assert/strict';

import { canonicalizeUrl, normalizeHeadline, rankAndDedupeArticles } from '../dist/lib/newsQuality.js';

const article = (overrides = {}) => ({
  title: 'Story',
  url: 'https://example.com/story',
  description: '',
  published_at: '2026-10-26T12:00:00Z',
  ...overrides,
});

test('normalizeHeadline collapses punctuation, case, and whitespace', () => {
  assert.equal(normalizeHeadline('  RTX 5090: Prices DROP!!  '), 'rtx 5090 prices drop');
});

test('rankAndDedupeArticles removes duplicate urls and near-identical headlines', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Witcher 3 patch lands!', url: 'https://a.example/witcher' }),
    article({ title: 'WITCHER 3 PATCH LANDS', url: 'https://b.example/witcher-copy' }),
    article({ title: 'Different headline', url: 'https://a.example/witcher' }),
    article({ title: 'Another story', url: 'https://c.example/other' }),
  ], 'Witcher 3');

  assert.deepEqual(results.map((item) => item.url), [
    'https://a.example/witcher',
    'https://c.example/other',
  ]);
});

test('rankAndDedupeArticles ranks title matches ahead of description-only matches', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'Hardware market update',
      url: 'https://example.com/description-match',
      description: 'NVIDIA GPU demand remains high.',
    }),
    article({
      title: 'NVIDIA GPU driver update lands today',
      url: 'https://example.com/title-match',
      description: 'New release details.',
    }),
  ], 'NVIDIA GPU');

  assert.equal(results[0].url, 'https://example.com/title-match');
});

test('rankAndDedupeArticles matches short hardware terms as whole words', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'Programming tools roundup',
      url: 'https://example.com/programming',
      published_at: '2026-10-26T12:00:00Z',
    }),
    article({
      title: 'DDR5 memory prices fall again',
      url: 'https://example.com/ram',
      description: 'RAM prices continue to move lower.',
      published_at: '2026-10-25T12:00:00Z',
    }),
  ], 'RAM');

  assert.equal(results[0].url, 'https://example.com/ram');
});

test('rankAndDedupeArticles uses freshness when relevance scores are equal', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'RTX performance analysis',
      url: 'https://example.com/older',
      published_at: '2026-10-20T12:00:00Z',
    }),
    article({
      title: 'RTX benchmark roundup',
      url: 'https://example.com/newer',
      published_at: '2026-10-26T12:00:00Z',
    }),
  ], 'RTX');

  assert.equal(results[0].url, 'https://example.com/newer');
});

test('rankAndDedupeArticles preserves provider order for an empty query', () => {
  const input = [
    article({ title: 'First', url: 'https://example.com/first', published_at: '2026-10-20T12:00:00Z' }),
    article({ title: 'Second', url: 'https://example.com/second', published_at: '2026-10-26T12:00:00Z' }),
  ];

  const results = rankAndDedupeArticles(input, '   ');

  assert.deepEqual(results.map((item) => item.url), [
    'https://example.com/first',
    'https://example.com/second',
  ]);
});

test('gaming profile boosts Witcher and PC hardware stories over generic gaming mentions', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'Publisher business update',
      url: 'https://example.com/generic-gaming',
      description: 'The gaming market remains active this quarter.',
      published_at: '2026-10-26T12:00:00Z',
    }),
    article({
      title: 'CD Projekt details the next Witcher update',
      url: 'https://example.com/witcher-priority',
      description: 'The studio shared new PC details.',
      published_at: '2026-10-25T12:00:00Z',
    }),
  ], 'gaming');

  assert.equal(results[0].url, 'https://example.com/witcher-priority');
});

test('RAM prices profile recognizes DDR5 and memory aliases', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'Component market update',
      url: 'https://example.com/generic-ram',
      description: 'RAM prices moved again this week.',
      published_at: '2026-10-26T12:00:00Z',
    }),
    article({
      title: 'DDR5 memory costs fall for PC builders',
      url: 'https://example.com/ddr5-priority',
      published_at: '2026-10-25T12:00:00Z',
    }),
  ], 'RAM prices');

  assert.equal(results[0].url, 'https://example.com/ddr5-priority');
});

test('GPU prices profile recognizes RTX and GeForce aliases', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'Component pricing roundup',
      url: 'https://example.com/generic-gpu',
      description: 'GPU prices remain volatile.',
      published_at: '2026-10-26T12:00:00Z',
    }),
    article({
      title: 'GeForce RTX cards get major retail cuts',
      url: 'https://example.com/rtx-priority',
      published_at: '2026-10-25T12:00:00Z',
    }),
  ], 'GPU prices');

  assert.equal(results[0].url, 'https://example.com/rtx-priority');
});

test('exact query title matches outrank profile alias-only matches', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'DDR5 memory costs fall again',
      url: 'https://example.com/alias-only',
      published_at: '2026-10-26T12:00:00Z',
    }),
    article({
      title: 'RAM prices fall ahead of holiday builds',
      url: 'https://example.com/exact-query',
      published_at: '2026-10-24T12:00:00Z',
    }),
  ], 'RAM prices');

  assert.equal(results[0].url, 'https://example.com/exact-query');
});

test('unknown queries keep existing relevance behavior without profile bonuses', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'NVIDIA reveals a research demo',
      url: 'https://example.com/nvidia-unrelated',
      published_at: '2026-10-26T12:00:00Z',
    }),
    article({
      title: 'Quantum computing research reaches new milestone',
      url: 'https://example.com/quantum',
      published_at: '2026-10-24T12:00:00Z',
    }),
  ], 'quantum computing');

  assert.equal(results[0].url, 'https://example.com/quantum');
});

test('canonicalizeUrl strips tracking params, fragments, www, and trailing slashes', () => {
  assert.equal(
    canonicalizeUrl('https://www.Example.com/story/?utm_source=x&id=2&fbclid=abc#top'),
    'https://example.com/story?id=2',
  );
  assert.equal(canonicalizeUrl('not a url'), 'not a url');
  assert.equal(canonicalizeUrl(undefined), '');
});

test('rankAndDedupeArticles treats tracking-param url variants as one article', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'First headline', url: 'https://example.com/a?utm_source=rss' }),
    article({ title: 'Second headline', url: 'https://www.example.com/a/' }),
  ], '');

  assert.equal(results.length, 1);
});

test('rankAndDedupeArticles collapses reworded copies of the same story, keeping the best ranked', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Nvidia RTX 5090 price drops to $1,999 at retailers', url: 'https://a.example/1', published_at: '2026-10-26T10:00:00Z' }),
    article({ title: 'RTX 5090 price drops to $1,999 at major retailers', url: 'https://b.example/2', published_at: '2026-10-26T11:00:00Z' }),
    article({ title: 'Steam Deck 2 rumors point to OLED upgrade', url: 'https://c.example/3' }),
  ], '');

  assert.deepEqual(results.map((item) => item.url), ['https://a.example/1', 'https://c.example/3']);
});

test('rankAndDedupeArticles keeps distinct short headlines that share a few words', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'RTX 5090 review', url: 'https://a.example/1' }),
    article({ title: 'RTX 5080 review', url: 'https://b.example/2' }),
  ], '');

  assert.equal(results.length, 2);
});
