import test from 'node:test';
import assert from 'node:assert/strict';

import { buildFrontPage } from '../src/utils/frontPage.js';

const story = (id, tag) => ({ url: `u${id}`, title: `t${id}`, tag });
const tagFor = (article) => article.tag;
const urls = (items) => items.map((item) => item.url);

const feed = [
  story(0, 'GTA 6'),
  story(1, 'Witcher 3'),
  story(2, 'GTA 6'),
  story(3, 'Gaming'),
  story(4, 'Elden Ring'),
  story(5, 'GTA 6'),
  story(6, 'Gaming'),
  story(7, 'GTA 6'),
  story(8, 'Gaming'),
  story(9, 'GTA 6'),
  story(10, 'Witcher 3'),
  story(11, 'GTA 6'),
];

test('plain feed: lead then everything else, nothing dropped', () => {
  const page = buildFrontPage(feed, { tagFor });
  assert.equal(page.lead.url, 'u0');
  assert.deepEqual(page.rail, []);
  assert.equal(page.cluster, null);
  assert.equal(page.latest.length, 11);
});

test('rail takes the next stories in rank order', () => {
  const page = buildFrontPage(feed, { tagFor, withRail: true });
  assert.deepEqual(urls(page.rail), ['u1', 'u2', 'u3', 'u4']);
  assert.equal(page.latest[0].url, 'u5');
});

test('cluster groups the biggest real tag and removes it from latest', () => {
  const page = buildFrontPage(feed, { tagFor, withRail: true, withCluster: true, genericTags: ['Gaming'] });
  assert.equal(page.cluster.tag, 'GTA 6');
  assert.deepEqual(urls(page.cluster.items), ['u5', 'u7', 'u9', 'u11']);
  assert.deepEqual(urls(page.latest), ['u6', 'u8', 'u10']);
  const all = [page.lead, ...page.rail, ...page.cluster.items, ...page.latest];
  assert.equal(new Set(urls(all)).size, feed.length);
});

test('generic fallback tags never form a cluster', () => {
  const generic = Array.from({ length: 6 }, (_, i) => story(i, 'Gaming'));
  assert.equal(buildFrontPage(generic, { tagFor, withCluster: true, genericTags: ['gaming'] }).cluster, null);
});

test('no cluster below the minimum', () => {
  const small = [story(0, 'A'), story(1, 'B'), story(2, 'B'), story(3, 'C')];
  assert.equal(buildFrontPage(small, { tagFor, withCluster: true }).cluster, null);
});

test('cluster caps at clusterMax and leaves the overflow in latest', () => {
  const many = [story(0, 'X'), ...Array.from({ length: 6 }, (_, i) => story(i + 1, 'GTA 6'))];
  const page = buildFrontPage(many, { tagFor, withCluster: true, clusterMax: 4 });
  assert.equal(page.cluster.items.length, 4);
  assert.equal(page.latest.length, 2);
});

test('empty or missing feed', () => {
  assert.deepEqual(buildFrontPage([], { tagFor }), { lead: null, rail: [], cluster: null, latest: [] });
  assert.equal(buildFrontPage(undefined, { tagFor }).lead, null);
});
