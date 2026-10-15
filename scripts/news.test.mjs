import test from 'node:test';
import assert from 'node:assert/strict';
import express from '../server/node_modules/express/index.js';
import axios from 'axios';
import news from '../server/dist/routes/api/mainNews.js';
const app = express();
app.use('/api/news', news);
const server = app.listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}/api/news`;
test.after(() => server.close());
test('missing provider configuration is explicit', async () => {
  delete process.env.MEDIASTACK_API_KEY;
  assert.equal((await fetch(base)).status, 503);
});
test('rejects invalid category, page and oversized query', async () => {
  for (const path of ['/bad-category', '?page=-1', '?page=1.2', '?page=Infinity', `?q=${'x'.repeat(121)}`]) {
    assert.equal((await fetch(base + path)).status, 400);
  }
});
test('requests correct offset and keeps safe articles without images', async t => {
  process.env.MEDIASTACK_API_KEY = 'local-test-placeholder';
  const upstream = t.mock.method(axios, 'get', async () => ({ data: { data: [
    { title: 'Story', url: 'https://example.com/story', image: null },
    { title: 'Duplicate', url: 'https://example.com/story' },
    { title: 'Unsafe', url: 'javascript:alert(1)' },
  ], pagination: { total: 25 } } }));
  const response = await fetch(`${base}?page=2&q=Michigan`);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.articles.length, 1);
  assert.equal(body.hasMore, true);
  const [url, options] = upstream.mock.calls[0].arguments;
  assert(url.startsWith('https:'));
  assert.equal(options.params.offset, 12);
  assert.equal(options.params.limit, 12);
  assert.equal(options.params.keywords, 'Michigan');
});
test('provider failures return 502, not a fake empty success', async t => {
  t.mock.method(axios, 'get', async () => { throw new Error('provider failure'); });
  const response = await fetch(base);
  assert.equal(response.status, 502);
  assert(!JSON.stringify(await response.json()).includes(process.env.MEDIASTACK_API_KEY));
});
