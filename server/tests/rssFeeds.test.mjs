import test from 'node:test';
import assert from 'node:assert/strict';

import { filterByQuery, parseFeed } from '../dist/lib/rssFeeds.js';

const rss = `<?xml version="1.0"?><rss><channel>
<item><title><![CDATA[Crimson Desert gets a &amp; patch]]></title><link>https://example.com/cd</link>
<description><![CDATA[<p>Pearl Abyss fixes Kliff</p>]]></description><pubDate>Sun, 08 Nov 2026 12:00:00 GMT</pubDate>
<media:content url="https://img.example.com/cd.jpg" medium="image"/></item>
<item><title>RTX 5090 restock spotted</title><link>https://example.com/gpu</link>
<description>GeForce Founders Edition back</description><enclosure url="https://img.example.com/gpu.jpg" type="image/jpeg"/></item>
<item><title>No link here</title></item>
</channel></rss>`;

test('parseFeed reads title, link, cleaned summary, date and image from RSS items', () => {
  const items = parseFeed(rss, 'Example');
  assert.equal(items.length, 2);
  assert.equal(items[0].title, 'Crimson Desert gets a & patch');
  assert.equal(items[0].url, 'https://example.com/cd');
  assert.equal(items[0].description, 'Pearl Abyss fixes Kliff');
  assert.equal(items[0].image, 'https://img.example.com/cd.jpg');
  assert.equal(items[0].published_at, '2026-11-08T12:00:00.000Z');
  assert.equal(items[1].image, 'https://img.example.com/gpu.jpg');
  assert.equal(items[1].source, 'Example');
});

test('parseFeed reads Atom entries', () => {
  const atom = '<feed><entry><title>Atom story</title><link href="https://example.com/a"/><summary>Hi</summary><updated>2026-11-08T10:00:00Z</updated></entry></feed>';
  const [item] = parseFeed(atom, 'Atom');
  assert.equal(item.url, 'https://example.com/a');
  assert.equal(item.published_at, '2026-11-08T10:00:00.000Z');
});

test('filterByQuery keeps only stories matching the query profile', () => {
  const items = parseFeed(rss, 'Example');
  assert.deepEqual(filterByQuery(items, 'Crimson Desert').map((a) => a.url), ['https://example.com/cd']);
  assert.deepEqual(filterByQuery(items, 'RTX 5090').map((a) => a.url), ['https://example.com/gpu']);
  assert.equal(filterByQuery(items, 'my games').length, 1);
  assert.equal(filterByQuery(items, 'my gear').length, 1);
  assert.equal(filterByQuery(items, 'gaming').length, 2);
});
