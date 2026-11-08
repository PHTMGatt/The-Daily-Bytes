import test from 'node:test';
import assert from 'node:assert/strict';

import { canonicalizeUrl, diversifySources, isLowValueArticle, normalizeHeadline, rankAndDedupeArticles } from '../dist/lib/newsQuality.js';

const article = (overrides = {}) => ({
  title: 'Story',
  url: 'https://example.com/story',
  description: '',
  published_at: '2026-10-26T12:00:00Z',
  ...overrides,
});

test('normalizeHeadline folds accents instead of splitting words', () => {
  assert.equal(normalizeHeadline('Pokémon Café’s Résumé'), 'pokemon cafes resume');
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

test('typed AMD, GPU and memory spellings reuse curated profiles', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  const pick = (query, onTopic, offTopic) => rankAndDedupeArticles([
    article({ title: offTopic, url: 'https://example.com/off', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: onTopic, url: 'https://example.com/on', published_at: '2026-10-26T12:00:00Z' }),
  ], query, now)[0].url;

  assert.equal(pick('AMD', 'Radeon RDNA 4 card undercuts rivals on price', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('graphics cards', 'GeForce RTX card prices fall at retail', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('DRAM prices', 'DDR5 memory kits climb again', 'Retail chain names new chairman'), 'https://example.com/on');
});

test('typed platform queries (Xbox, PlayStation, Nintendo, Steam, Intel) reuse curated profiles', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  const pick = (query, onTopic, offTopic) => rankAndDedupeArticles([
    article({ title: offTopic, url: 'https://example.com/off', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: onTopic, url: 'https://example.com/on', published_at: '2026-10-26T12:00:00Z' }),
  ], query, now)[0].url;

  assert.equal(pick('Xbox', 'Game Pass adds Series X day-one titles', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('PlayStation', 'PS5 Pro price cut arrives before holidays', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('Nintendo', 'Switch 2 sales top forecasts', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('Steam', 'Valve ships Steam Deck update with Proton fixes', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('Intel', 'Core Ultra desktop chips cut CPU prices', 'Retail chain names new chairman'), 'https://example.com/on');
});

test('typed franchise queries (Call of Duty, Fortnite, GTA, Elden Ring) reuse curated profiles', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  const pick = (query, onTopic, offTopic) => rankAndDedupeArticles([
    article({ title: offTopic, url: 'https://example.com/off', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: onTopic, url: 'https://example.com/on', published_at: '2026-10-26T12:00:00Z' }),
  ], query, now)[0].url;

  assert.equal(pick('Call of Duty', 'Warzone season adds Black Ops map', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('COD', 'Activision confirms Modern Warfare update', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('Fortnite', 'Epic Games launches new Fortnite chapter', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('GTA 6', 'Rockstar details Grand Theft Auto launch', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('Elden Ring', 'FromSoftware ships Elden Ring patch', 'Retail chain names new chairman'), 'https://example.com/on');
});

test('typed queries for Minecraft, Pokemon, Battlefield, esports and the game industry reuse curated profiles', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  const pick = (query, onTopic, offTopic) => rankAndDedupeArticles([
    article({ title: offTopic, url: 'https://example.com/off', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: onTopic, url: 'https://example.com/on', published_at: '2026-10-26T12:00:00Z' }),
  ], query, now)[0].url;

  assert.equal(pick('Minecraft', 'Mojang ships Java Edition snapshot with new mobs', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('Pokémon', 'Game Freak reveals next Pokemon legends title', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('Battlefield', 'DICE details Battlefield season roadmap', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('Valorant', 'Esports championship finals draw record viewers', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('game layoffs', 'Publisher announces studio closure and layoffs', 'Museum exhibit opens downtown'), 'https://example.com/on');
});

test('typed queries for Capcom, Square Enix, Ubisoft and Cyberpunk reuse curated profiles', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  const pick = (query, onTopic, offTopic) => rankAndDedupeArticles([
    article({ title: offTopic, url: 'https://example.com/off', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: onTopic, url: 'https://example.com/on', published_at: '2026-10-26T12:00:00Z' }),
  ], query, now)[0].url;

  assert.equal(pick('Capcom', 'Resident Evil gets new Monster Hunter crossover', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('Final Fantasy', 'Square Enix confirms Dragon Quest remake date', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('Ubisoft', 'Assassins Creed team details Far Cry follow-up', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('Cyberpunk', 'Night City expansion ships from CD Projekt', 'Museum exhibit opens downtown'), 'https://example.com/on');
});

test('typed queries for Blizzard, Bethesda, Baldur\'s Gate and Nintendo franchises reuse curated profiles', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  const pick = (query, onTopic, offTopic) => rankAndDedupeArticles([
    article({ title: offTopic, url: 'https://example.com/off', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: onTopic, url: 'https://example.com/on', published_at: '2026-10-26T12:00:00Z' }),
  ], query, now)[0].url;

  assert.equal(pick('Diablo', 'Blizzard details Overwatch and Hearthstone seasons', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('Skyrim', 'Bethesda confirms Elder Scrolls and Fallout plans', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick("Baldur's Gate 3", 'Larian ships a Divinity-era patch for Dungeons and Dragons fans', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('Zelda', 'Nintendo eShop adds new Mario release', 'Museum exhibit opens downtown'), 'https://example.com/on');
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
    article({ title: 'Nvidia older driver news', url: 'https://b.example/recent', published_at: '2026-10-20T08:00:00Z' }),
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

test('gaming profile recognizes GPU memory and architecture coverage such as VRAM, GDDR7 and RDNA', () => {
  const results = rankAndDedupeArticles([
    article({
      title: 'Quarterly retail earnings beat estimates',
      url: 'https://example.com/earnings-2',
      description: 'Retailers report strong holiday outlook.',
    }),
    article({
      title: 'Next RDNA card pairs GDDR7 with more VRAM',
      url: 'https://example.com/gpu-memory',
      description: 'Graphics roadmap leaks.',
    }),
  ], 'gaming');

  assert.equal(results[0].url, 'https://example.com/gpu-memory');
});

test('drops articles whose url is not a plain http(s) link', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Script link story', url: 'javascript:alert(1)' }),
    article({ title: 'Data link story', url: 'data:text/html,hi' }),
    article({ title: 'Relative link story', url: '/relative/path' }),
    article({ title: 'Good plain story', url: 'http://example.com/ok' }),
    article({ title: 'Good secure story', url: 'https://example.com/ok2' }),
  ], '');

  assert.deepEqual(results.map((item) => item.title), ['Good plain story', 'Good secure story']);
});

test('rankAndDedupeArticles collapses a title that only differs by its own source suffix', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'RTX 5090 price drops again - IGN', url: 'https://a.example/1', source: 'IGN' }),
    article({ title: 'RTX 5090 price drops again', url: 'https://b.example/2', source: 'IGN' }),
  ], '');
  assert.equal(results.length, 1);
});

test('rankAndDedupeArticles keeps subtitles that are not the article source', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Elden Ring - Shadow of the Erdtree', url: 'https://a.example/1', source: 'IGN' }),
    article({ title: 'Elden Ring', url: 'https://b.example/2', source: 'PC Gamer' }),
  ], '');
  assert.equal(results.length, 2);
});

test('getRankingQuery gives the technology category a gaming-hardware boost only when no keywords are typed', async () => {
  const { getRankingQuery } = await import('../dist/lib/newsQuality.js');
  assert.equal(getRankingQuery('technology', ''), 'gaming');
  assert.equal(getRankingQuery('Technology', '   '), 'gaming');
  assert.equal(getRankingQuery('technology', 'rust'), 'rust');
  assert.equal(getRankingQuery('sports', ''), '');
  assert.equal(getRankingQuery('', ''), '');
});

test('technology boost lifts gaming hardware stories without dropping other stories', async () => {
  const { getRankingQuery } = await import('../dist/lib/newsQuality.js');
  const now = Date.parse('2026-10-31T12:00:00Z');
  const results = rankAndDedupeArticles([
    article({ title: 'Quarterly cloud software earnings beat estimates', url: 'https://a.com/1', published_at: '2026-10-31T11:00:00Z' }),
    article({ title: 'NVIDIA RTX GPU prices climb as GDDR7 supply tightens', url: 'https://b.com/2', published_at: '2026-10-30T11:00:00Z' }),
  ], getRankingQuery('technology', ''), now);
  assert.equal(results.length, 2);
  assert.match(results[0].title, /NVIDIA/);
});

test('multi-word queries containing a known franchise reuse its curated profile', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'RTX 5090 deals roundup', url: 'https://example.com/a', description: 'A discount roundup.' }),
    article({ title: 'RTX 5090 supply check', url: 'https://example.com/b', description: 'GeForce supply at retailers, DLSS support, fresh GPU shipments.' }),
  ], 'rtx 5090 news');

  assert.equal(results[0].url, 'https://example.com/b');
});

test('very short aliases do not hijack unrelated phrases', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Wow factor in new phones', url: 'https://example.com/a' }),
    article({ title: 'Warcraft raid world first wow factor', url: 'https://example.com/b', description: 'Blizzard diablo overwatch' }),
  ], 'wow factor');

  // No Blizzard profile applied: ordering follows plain relevance (both title-match; stable by index).
  assert.equal(results[0].url, 'https://example.com/a');
});

test('rankAndDedupeArticles drops market-research report spam but keeps real market news', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Global Graphics Card Market Size, Share & Growth Report 2025-2032', url: 'https://spam.example/1' }),
    article({ title: 'Gaming Laptop Industry to Reach $50B by 2031', description: 'The market is expected to grow at a CAGR of 8.2% during the forecast period.', url: 'https://spam.example/2' }),
    article({ title: 'Key Players in the Gaming Monitor Market Research Report', url: 'https://spam.example/3' }),
    article({ title: 'AMD gains GPU market share as RTX 50 supply tightens', url: 'https://news.example/1' }),
    article({ title: 'Memory prices climb as DRAM market tightens', url: 'https://news.example/2' }),
  ], 'gpu');

  assert.deepEqual(results.map((item) => item.url).sort(), ['https://news.example/1', 'https://news.example/2']);
});

test('market-report filtering also applies when there is no query', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Cloud Gaming Market Size Worth $20 Billion', url: 'https://spam.example/4' }),
    article({ title: 'Valve announces new Steam update', url: 'https://news.example/3' }),
  ], '');
  assert.deepEqual(results.map((item) => item.url), ['https://news.example/3']);
});

test('rankAndDedupeArticles drops gambling and bonus-code promotion but keeps genuine casino or betting news', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Best Online Casino Sites for Real Money in 2026', url: 'https://example.com/casino-1' }),
    article({ title: 'Top sportsbook promo codes: claim your bonus bets today', url: 'https://example.com/casino-2' }),
    article({ title: 'Best no deposit bonus offers this week', url: 'https://example.com/casino-3' }),
    article({ title: 'Free spins and welcome bonus: new slots sites ranked', url: 'https://example.com/casino-4' }),
    article({ title: 'Casino operator confirms ransomware attack on its network', url: 'https://example.com/real-1' }),
    article({ title: 'Valve cracks down on loot box gambling in Counter-Strike 2', url: 'https://example.com/real-2' }),
    article({ title: 'Nintendo shows new Switch 2 bundle', url: 'https://example.com/real-3' }),
  ], '');

  assert.deepEqual(
    results.map((a) => a.url).sort(),
    ['https://example.com/real-1', 'https://example.com/real-2', 'https://example.com/real-3'],
  );
});

test('rankAndDedupeArticles drops daily puzzle hint/answer posts but keeps real puzzle-game news', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Wordle today: hints and answer for November 5', url: 'https://example.com/puzzle-1' }),
    article({ title: "NYT Connections answers today (#878) - hints for Nov 5", url: 'https://example.com/puzzle-2' }),
    article({ title: "Today's Quordle answers and clues", url: 'https://example.com/puzzle-3' }),
    article({ title: 'NYT Strands hints, spangram and answers for today', url: 'https://example.com/puzzle-4' }),
    article({ title: 'The New York Times is adding a new Wordle spin-off game', url: 'https://example.com/real-1' }),
    article({ title: 'Answer to the RTX 5090 shortage: Nvidia expands production', url: 'https://example.com/real-2' }),
    article({ title: 'Nintendo shows new Switch 2 bundle', url: 'https://example.com/real-3' }),
  ], '');

  assert.deepEqual(
    results.map((a) => a.url).sort(),
    ['https://example.com/real-1', 'https://example.com/real-2', 'https://example.com/real-3'],
  );
});

test('rankAndDedupeArticles drops coupon and discount-code listings but keeps genuine deal and pricing news', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Best Steam coupon codes and promo codes for November 2026', url: 'https://example.com/coupon-1' }),
    article({ title: 'Newegg discount code: save 15% on GPUs with this coupon', url: 'https://example.com/coupon-2' }),
    article({ title: 'Use code SAVE20 for 20% off gaming laptops', url: 'https://example.com/coupon-3' }),
    article({ title: 'Studio ships update with code review tools for modders', url: 'https://example.com/real-4' }),
    article({ title: 'Nvidia cuts RTX 5070 price by $50 in the US', url: 'https://example.com/real-1' }),
    article({ title: 'Steam Autumn Sale starts with deep discounts on Capcom games', url: 'https://example.com/real-2' }),
    article({ title: 'Valve explains why the Steam Deck coupon scam is spreading', url: 'https://example.com/real-3' }),
  ], '');

  assert.deepEqual(
    results.map((a) => a.url).sort(),
    ['https://example.com/real-1', 'https://example.com/real-2', 'https://example.com/real-3', 'https://example.com/real-4'],
  );
});

test('rankAndDedupeArticles drops affiliate shopping roundups but keeps price and sales reporting', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Best Black Friday gaming monitor deals 2026', url: 'https://example.com/shop-1' }),
    article({ title: 'The 25 best gift ideas for PC gamers', url: 'https://example.com/shop-2' }),
    article({ title: 'GPU buying guide: which graphics card should you get?', url: 'https://example.com/shop-3' }),
    article({ title: 'Cyber Monday deals live blog: the best offers right now', url: 'https://example.com/shop-4' }),
    article({ title: 'DDR5 RAM prices jump 30% as memory shortage deepens', url: 'https://example.com/real-1' }),
    article({ title: 'Steam Autumn Sale starts with deep discounts on Capcom games', url: 'https://example.com/real-2' }),
    article({ title: 'FTC sues retailer over fake Black Friday deals', url: 'https://example.com/real-3' }),
  ], '');

  assert.deepEqual(
    results.map((a) => a.url).sort(),
    ['https://example.com/real-1', 'https://example.com/real-2', 'https://example.com/real-3'],
  );
});

test('rankAndDedupeArticles drops single-product retail deal posts but keeps price and discount news', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Deal alert: Samsung 990 Pro 2TB SSD drops to $119', url: 'https://example.com/deal-1' }),
    article({ title: 'Deals: save 40% on the Xbox Wireless Controller at Amazon', url: 'https://example.com/deal-2' }),
    article({ title: 'The Logitech G Pro X headset is $50 off at Best Buy', url: 'https://example.com/deal-3' }),
    article({ title: 'Grab the ASUS ROG Ally for 25% off at Walmart today', url: 'https://example.com/deal-4' }),
    article({ title: 'DDR5 RAM prices jump 30% as memory shortage deepens', url: 'https://example.com/real-1' }),
    article({ title: 'Nvidia cuts RTX 5070 price by $50 amid weak demand', url: 'https://example.com/real-2' }),
    article({ title: 'Steam Autumn Sale starts with up to 90% off Capcom games', url: 'https://example.com/real-3' }),
    article({ title: 'Amazon deal with Microsoft expands cloud gaming', url: 'https://example.com/real-4' }),
  ], '');

  assert.deepEqual(
    results.map((a) => a.url).sort(),
    ['https://example.com/real-1', 'https://example.com/real-2', 'https://example.com/real-3', 'https://example.com/real-4'],
  );
});

test('rankAndDedupeArticles drops leading "Best <gear>" buying roundups but keeps awards and news', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Best graphics cards for gaming in 2026', url: 'https://example.com/gear-1' }),
    article({ title: 'The 10 best gaming laptops you can buy right now', url: 'https://example.com/gear-2' }),
    article({ title: 'Best budget gaming headsets', url: 'https://example.com/gear-3' }),
    article({ title: 'Best SSDs for PS5 and Xbox Series X', url: 'https://example.com/gear-4' }),
    article({ title: 'Baldur\'s Gate 3 wins best RPG at the awards', url: 'https://example.com/real-1' }),
    article({ title: 'Best Buy to stop selling physical PC games', url: 'https://example.com/real-2' }),
    article({ title: 'Nvidia RTX 5090 review: the best graphics card ever made?', url: 'https://example.com/real-3' }),
  ], '');

  assert.deepEqual(
    results.map((a) => a.url).sort(),
    ['https://example.com/real-1', 'https://example.com/real-2', 'https://example.com/real-3'],
  );
});

test('rankAndDedupeArticles drops sponsored posts and paid wire press releases but keeps real reporting', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Sponsored: Upgrade your rig with Acme gaming chairs', url: 'https://example.com/ad-1' }),
    article({ title: '[Sponsored] The best VPN for gamers', url: 'https://example.com/ad-2' }),
    article({ title: 'Advertorial: Why Acme SSDs are faster', url: 'https://example.com/ad-3' }),
    article({ title: 'Acme launches new GPU cooler', url: 'https://example.com/pr-1', source: 'PR Newswire' }),
    article({ title: 'Acme Studios announces funding round', url: 'https://example.com/pr-2', source: 'openPR' }),
    article({ title: 'Acme unveils headset', url: 'https://example.com/pr-3', source: 'EIN Presswire' }),
    article({ title: 'Sponsorship deal ends as esports team leaves league', url: 'https://example.com/real-1', source: 'PC Gamer' }),
    article({ title: 'Nvidia confirms RTX supply update', url: 'https://example.com/real-2', source: 'Tom\'s Hardware' }),
  ], '');

  assert.deepEqual(
    results.map((a) => a.url).sort(),
    ['https://example.com/real-1', 'https://example.com/real-2'],
  );
});

test('"vr headset" queries reuse the VR profile and rank headset stories above generic mentions', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Headset makers report quarterly sales', url: 'https://example.com/generic', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: 'Meta Quest 3 gets SteamVR streaming update', url: 'https://example.com/quest', published_at: '2026-10-26T12:00:00Z' }),
  ], 'vr headset', Date.parse('2026-10-28T12:00:00Z'));

  assert.equal(results[0].url, 'https://example.com/quest');
});

test('"ai chips" queries reuse the AI hardware profile', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Chips and snacks recall announced', url: 'https://example.com/snacks', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: 'Nvidia Blackwell data center GPU demand lifts AI accelerator supply', url: 'https://example.com/accel', published_at: '2026-10-26T12:00:00Z' }),
  ], 'ai chips', Date.parse('2026-10-28T12:00:00Z'));

  assert.equal(results[0].url, 'https://example.com/accel');
});

test('the bare word "ai" inside an unrelated phrase does not hijack ranking', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Ai Weiwei opens new exhibition', url: 'https://example.com/art' }),
    article({ title: 'Ai Weiwei exhibition with openai chatgpt gpu inference', url: 'https://example.com/ai' }),
  ], 'ai weiwei');

  assert.equal(results[0].url, 'https://example.com/art');
});

test('bare hardware terms ("ram", "ssd", "dlss") reuse their curated profiles', () => {
  const cases = [
    ['ram', 'DDR5 kit prices climb as DRAM supply tightens', 'Council budget vote delayed again'],
    ['ssd', 'NVMe SSD deals hit record lows for storage upgrades', 'Council budget vote delayed again'],
    ['dlss', 'Nvidia RTX GeForce adds DLSS support in new patch', 'Council budget vote delayed again'],
  ];
  for (const [query, good, plain] of cases) {
    const results = rankAndDedupeArticles([
      article({ title: plain, url: 'https://example.com/plain', published_at: '2026-10-27T12:00:00Z' }),
      article({ title: good, url: 'https://example.com/good', published_at: '2026-10-26T12:00:00Z' }),
    ], query, Date.parse('2026-10-28T12:00:00Z'));
    assert.equal(results[0].url, 'https://example.com/good', query);
  }
});

test('"cpu" and "handheld" queries use dedicated profiles', () => {
  const cpu = rankAndDedupeArticles([
    article({ title: 'Council budget vote delayed again', url: 'https://example.com/plain', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: 'Ryzen X3D processor tops gaming benchmark against Core Ultra', url: 'https://example.com/good', published_at: '2026-10-26T12:00:00Z' }),
  ], 'cpu', Date.parse('2026-10-28T12:00:00Z'));
  assert.equal(cpu[0].url, 'https://example.com/good');

  const handheld = rankAndDedupeArticles([
    article({ title: 'Council budget vote delayed again', url: 'https://example.com/plain', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: 'ROG Ally and Steam Deck rivals: Legion Go gets SteamOS update', url: 'https://example.com/good', published_at: '2026-10-26T12:00:00Z' }),
  ], 'handheld', Date.parse('2026-10-28T12:00:00Z'));
  assert.equal(handheld[0].url, 'https://example.com/good');
});

test('rankAndDedupeArticles demotes months-old stories below a slightly weaker but current match', () => {
  const now = new Date('2026-10-28T12:00:00Z').getTime();
  const results = rankAndDedupeArticles([
    article({ title: 'RTX 5090 GeForce DLSS benchmark and review results', url: 'https://a.example/old', published_at: '2025-12-01T12:00:00Z' }),
    article({ title: 'RTX driver update fixes stutter', url: 'https://b.example/new', published_at: '2026-10-27T12:00:00Z' }),
  ], 'RTX', now);

  assert.equal(results[0].url, 'https://b.example/new');
});

test('staleness demotion never drops a matching story or promotes a non-match', () => {
  const now = new Date('2026-10-28T12:00:00Z').getTime();
  const results = rankAndDedupeArticles([
    article({ title: 'Celebrity gossip', url: 'https://a.example/gossip', published_at: '2026-10-28T11:00:00Z' }),
    article({ title: 'RTX history retrospective', url: 'https://b.example/old', published_at: '2024-01-01T12:00:00Z' }),
  ], 'RTX', now);

  assert.equal(results.length, 2);
  assert.equal(results[0].url, 'https://b.example/old');
});

test('stories with unknown or future timestamps are not treated as stale', () => {
  const now = new Date('2026-10-28T12:00:00Z').getTime();
  const results = rankAndDedupeArticles([
    article({ title: 'RTX older benchmark', url: 'https://a.example/old', published_at: '2025-01-01T12:00:00Z' }),
    article({ title: 'RTX undated benchmark', url: 'https://b.example/undated', published_at: undefined }),
  ], 'RTX', now);

  assert.equal(results[0].url, 'https://b.example/undated');
});

test('new franchise and hardware aliases reuse curated profiles and outrank generic matches', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  const cases = [
    ['silksong', 'Hollow Knight Silksong DLC patch from Team Cherry', 'Silk prices rise at the textile market'],
    ['helldivers 2', 'Arrowhead ships Helldivers warbond and patch', 'Divers rescued off the coast near the harbour'],
    ['ps6', 'PS6 and Xbox Next specs rumored for next gen console launch', 'Ps6 printer firmware notice for offices'],
    ['oled', 'QD OLED gaming monitor hits 360Hz with FreeSync support', 'Oled lighting retrofit for office buildings'],
    ['roblox', 'Roblox adds child safety moderation for creator experiences', 'Roblox market opens higher on Tuesday'],
  ];
  for (const [query, good, bad] of cases) {
    const results = rankAndDedupeArticles([
      article({ title: bad, url: 'https://example.com/bad', published_at: '2026-10-27T12:00:00Z' }),
      article({ title: good, url: 'https://example.com/good', published_at: '2026-10-26T12:00:00Z' }),
    ], query, now);
    assert.equal(results[0].url, 'https://example.com/good', query);
  }
});

test('rankAndDedupeArticles drops recurring lottery, mortgage-rate and horoscope utility posts but keeps real reporting', () => {
  const result = rankAndDedupeArticles([
    article({ title: 'Powerball winning numbers for Saturday, Nov. 8, 2026', url: 'https://example.com/util-1' }),
    article({ title: "Mega Millions results: Friday's winning lottery numbers", url: 'https://example.com/util-2' }),
    article({ title: 'Mortgage rates today, November 8: 30-year rates fall', url: 'https://example.com/util-3' }),
    article({ title: 'Current refinance rates for November 8, 2026', url: 'https://example.com/util-4' }),
    article({ title: 'Daily horoscope for Scorpio, November 8', url: 'https://example.com/util-5' }),
    article({ title: 'Your horoscope today: what the stars say', url: 'https://example.com/util-6' }),
    article({ title: 'Valve raises Steam Deck lottery odds after launch backlash', url: 'https://example.com/keep-1' }),
    article({ title: 'NVIDIA RTX 5090 supply improves as DRAM rates ease', url: 'https://example.com/keep-2' }),
    article({ title: 'Horoscope game Zodiac Quest tops Steam wishlists', url: 'https://example.com/keep-3' }),
  ], '');
  assert.deepEqual(result.map((a) => a.url), [
    'https://example.com/keep-1',
    'https://example.com/keep-2',
    'https://example.com/keep-3',
  ]);
});

test('isLowValueArticle flags every dropped category and keeps real news', () => {
  const dropped = [
    'Global Gaming Market Size, Share and CAGR 2025-2032',
    'Best online casino sites with no deposit bonus',
    'Newegg coupon codes for November',
    'Best Black Friday gaming monitor deals 2026',
    'Deal alert: SSD drops to $119',
    'Wordle today: hints and answer for November 8',
    'Powerball winning numbers for Saturday jackpot',
    'Sponsored: Try this new VPN',
    'Lions vs. Packers odds, picks and predictions for Sunday',
    'NFL Week 10 best bets: parlay and player props',
    'Same game parlay picks for Monday night',
    'Summit Capital Management LLC Buys 1,240 Shares of NVIDIA Co. $NVDA',
    'Redwood Wealth Advisors Sells 3,100 Shares of Advanced Micro Devices, Inc.',
    'Harbor Trust Company Acquires New Stake in Take-Two Interactive Software',
    'NVIDIA (NASDAQ:NVDA) Shares Gap Up - Here\'s Why',
    'Micron Technology (NASDAQ:MU) Price Target Raised to $140.00',
  ];
  for (const title of dropped) assert.equal(isLowValueArticle(article({ title })), true, title);
  assert.equal(isLowValueArticle(article({ title: 'Nvidia confirms RTX 5090 supply constraints' })), false);
  for (const title of [
    'What are the odds GTA 6 slips again?',
    'Why the Switch 2 picks up speed in Japan',
    'Valve sues over loot box lawsuit claims',
    'Esports team picks new coach after prediction market fallout',
    'Nvidia takes a stake in Intel as part of $5 billion deal',
    'Microsoft sells 10 million Xbox Series consoles in a quarter',
    'Nintendo shares jump after Switch 2 sales beat forecasts',
    'Sony acquires a majority position in Kadokawa',
  ]) assert.equal(isLowValueArticle(article({ title })), false, title);
  assert.equal(isLowValueArticle(article({ title: 'Press release headline', source: 'PR Newswire' })), true);
});

test('"My games" hub queries reuse their curated game profiles', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  const pick = (query, onTopic, offTopic) => rankAndDedupeArticles([
    article({ title: offTopic, url: 'https://example.com/off', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: onTopic, url: 'https://example.com/on', published_at: '2026-10-26T12:00:00Z' }),
  ], query, now)[0].url;

  assert.equal(pick('Crimson Desert', 'Pearl Abyss shows Kliff exploring Pywel', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('Assassins Creed Black Flag', 'Edward Kenway returns in Black Flag Resynced', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('Assassins Creed Shadows', 'Naoe and Yasuke get new Shadows patch', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('Hitman', 'IO Interactive teases Agent 47 mission', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('Batman Arkham', 'Rocksteady hints at a new Arkham game', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('Far Cry', 'Ubisoft confirms Far Cry 7 open world map', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('ARK Survival', 'Studio Wildcard adds dinosaur to Survival Ascended', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('Rocket League', 'Psyonix announces RLCS season', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('Counter Strike 2', 'Valve updates CS2 ahead of the Major', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('DOOM', 'id Software ships Doom The Dark Ages patch', 'Retail chain names new chairman'), 'https://example.com/on');
});

test('"my games" feed ranks stories about Bryen\'s games above generic gaming news', () => {
  const results = rankAndDedupeArticles([
    article({ title: 'Console sales slow in October', url: 'https://example.com/generic', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: 'Crimson Desert gets Pearl Abyss performance patch', url: 'https://example.com/mine', published_at: '2026-10-26T12:00:00Z' }),
  ], 'my games', Date.parse('2026-10-28T12:00:00Z'));

  assert.equal(results[0].url, 'https://example.com/mine');
});

test('"My gear" tech hub queries reuse their curated hardware profiles', () => {
  const now = Date.parse('2026-10-28T12:00:00Z');
  const pick = (query, onTopic, offTopic) => rankAndDedupeArticles([
    article({ title: offTopic, url: 'https://example.com/off', published_at: '2026-10-27T12:00:00Z' }),
    article({ title: onTopic, url: 'https://example.com/on', published_at: '2026-10-26T12:00:00Z' }),
  ], query, now)[0].url;

  assert.equal(pick('my gear', 'Corsair launches new Dominator Titanium DDR5 kit', 'Console sales slow in October'), 'https://example.com/on');
  assert.equal(pick('RTX 5090', 'GeForce 5090 Founders Edition restock spotted', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('Ryzen 9 9950X3D', 'AMD 9950X3D tops Zen 5 gaming benchmarks', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('Corsair Dominator Titanium', 'Dominator Titanium DDR5 gets faster bins', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('Samsung 9100 Pro', 'Samsung 9100 Pro PCIe 5 NVMe review', 'Retail chain names new chairman'), 'https://example.com/on');
  assert.equal(pick('Razer', 'Razer Blade refresh adds Synapse features', 'Museum exhibit opens downtown'), 'https://example.com/on');
  assert.equal(pick('EK water cooling', 'EKWB custom loop water block for RTX cards', 'Shares dip on quarterly forecast'), 'https://example.com/on');
  assert.equal(pick('Raspberry Pi', 'Raspberry Pi 5 gets new single board kit', 'Retail chain names new chairman'), 'https://example.com/on');
});
