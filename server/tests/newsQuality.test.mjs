import test from 'node:test';
import assert from 'node:assert/strict';

import { canonicalizeUrl, diversifySources, normalizeHeadline, rankAndDedupeArticles } from '../dist/lib/newsQuality.js';

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

test('rankAndDedupeArticles lets fresh stories edge out equally relevant stale ones', () => {
  const now = new Date('2026-10-28T12:00:00Z').getTime();
  const results = rankAndDedupeArticles([
    article({ title: 'NVIDIA GPU supply outlook for the holidays', url: 'https://a.example/old', published_at: '2026-09-01T12:00:00Z' }),
    article({ title: 'NVIDIA GPU stock levels this week at retailers', url: 'https://b.example/new', published_at: '2026-10-28T06:00:00Z' }),
  ], 'NVIDIA GPU', now);

  assert.equal(results[0].url, 'https://b.example/new');
});

test('rankAndDedupeArticles freshness never outweighs a clear title match', () => {
  const now = new Date('2026-10-28T12:00:00Z').getTime();
  const results = rankAndDedupeArticles([
    article({ title: 'Unrelated celebrity news', url: 'https://a.example/fresh', published_at: '2026-10-28T11:00:00Z' }),
    article({ title: 'NVIDIA GPU roadmap leaks', url: 'https://b.example/relevant', published_at: '2026-09-01T12:00:00Z' }),
  ], 'NVIDIA GPU', now);

  assert.equal(results[0].url, 'https://b.example/relevant');
});

test('gaming profile ranks AMD Radeon hardware stories above generic gaming mentions', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'Gaming industry sees steady quarter',
      url: 'https://example.com/generic-gaming-quarter',
      published_at: '2026-10-27T12:00:00Z',
    }),
    article({
      title: 'AMD Radeon refresh targets midrange gaming',
      url: 'https://example.com/amd-radeon',
      published_at: '2026-10-20T12:00:00Z',
    }),
  ], 'gaming', Date.parse('2026-10-28T12:00:00Z'));

  assert.equal(results[0].url, 'https://example.com/amd-radeon');
});

test('typed aliases reuse the curated profile ("nvidia" ranks GeForce hardware above finance mentions)', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'NVIDIA shares move after earnings call',
      url: 'https://example.com/nvidia-finance',
      published_at: '2026-10-27T12:00:00Z',
    }),
    article({
      title: 'NVIDIA GeForce RTX driver adds DLSS support',
      url: 'https://example.com/nvidia-geforce',
      published_at: '2026-10-26T12:00:00Z',
    }),
  ], 'NVIDIA', Date.parse('2026-10-28T12:00:00Z'));

  assert.equal(results[0].url, 'https://example.com/nvidia-geforce');
});

test('gaming profile recognizes Intel and Ryzen CPU stories', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'Gaming market remains active this quarter',
      url: 'https://example.com/generic',
      published_at: '2026-10-27T12:00:00Z',
    }),
    article({
      title: 'Ryzen gaming chip tops Intel in new benchmarks',
      url: 'https://example.com/ryzen',
      published_at: '2026-10-26T12:00:00Z',
    }),
  ], 'gaming', Date.parse('2026-10-28T12:00:00Z'));

  assert.equal(results[0].url, 'https://example.com/ryzen');
});

test('diversifySources limits consecutive stories from one source without dropping any', () => {
  const stories = ['A', 'A', 'A', 'A', 'B', 'C'].map((source, i) => ({ title: `s${i}`, source }));
  const result = diversifySources(stories);

  assert.equal(result.length, stories.length);
  assert.deepEqual(result.map((s) => s.title), ['s0', 's1', 's4', 's2', 's3', 's5'].slice(0, 0).concat(['s0', 's1', 's4', 's2', 's3', 's5']));
  assert.deepEqual(result.map((s) => s.source), ['A', 'A', 'B', 'A', 'A', 'C']);
});

test('diversifySources keeps order when sources are unknown or already varied', () => {
  const stories = [{ title: 'x' }, { title: 'y' }, { title: 'z', source: 'A' }, { title: 'w', source: 'B' }];
  assert.deepEqual(diversifySources(stories).map((s) => s.title), ['x', 'y', 'z', 'w']);
});

test('diversifySources falls back to original order when only one source exists', () => {
  const stories = [1, 2, 3, 4].map((n) => ({ title: `t${n}`, source: 'Only' }));
  assert.deepEqual(diversifySources(stories).map((s) => s.title), ['t1', 't2', 't3', 't4']);
});

test('rankAndDedupeArticles interleaves a dominant source after ranking', () => {
  const stories = [1, 2, 3, 4].map((n) => article({ title: `Nvidia story number ${n} alpha${n}`, url: `https://a.com/${n}`, source: 'Same' }))
    .concat(article({ title: 'Nvidia other outlet beta', url: 'https://b.com/1', source: 'Other', description: '' }));
  const result = rankAndDedupeArticles(stories, 'nvidia', Date.parse('2026-10-26T13:00:00Z'));
  assert.equal(result.length, 5);
  assert.notEqual(result[2].source, 'Same');
});

test('gaming profile recognizes console and handheld coverage such as Game Pass and Switch 2', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'Quarterly retail earnings beat estimates',
      url: 'https://example.com/earnings',
      description: 'Retailers report strong holiday outlook.',
    }),
    article({
      title: 'Game Pass adds new titles as Switch 2 handheld sales climb',
      url: 'https://example.com/console',
      description: 'Console makers see growth.',
    }),
  ], 'gaming');

  assert.equal(results[0].url, 'https://example.com/console');
});

test('future-dated stories do not outrank equally relevant, genuinely dated ones', () => {
  const now = Date.parse('2026-10-29T12:00:00Z');
  const results = rankAndDedupeArticles([
    article({ title: 'Nvidia scheduled teaser', url: 'https://a.example/future', published_at: '2027-01-01T00:00:00Z' }),
    article({ title: 'Nvidia older driver news', url: 'https://b.example/recent', published_at: '2026-09-29T08:00:00Z' }),
  ], 'nvidia', now);

  assert.deepEqual(results.map((item) => item.url), ['https://b.example/recent', 'https://a.example/future']);
});

test('plural and singular forms count as the same keyword when ranking', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Quarterly retail earnings beat estimates', url: 'https://example.com/earnings' }),
    article({ title: 'New GPUs head to market this quarter', url: 'https://example.com/hardware' }),
  ], 'gaming');

  assert.equal(results[0].url, 'https://example.com/hardware');
});
