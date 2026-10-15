import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:4175';
const browser = await chromium.launch({ headless: true });
const reports = [];
await fs.mkdir('artifacts/screenshots', { recursive: true });
try {
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let failNews = false;
    const requests = [];
    await page.route('**/api/**', route => {
      const url = route.request().url();
      requests.push(url);
      if (url.includes('/news')) return route.fulfill({
        status: failNews ? 502 : 200, contentType: 'application/json',
        body: JSON.stringify(failNews ? { message: 'Provider unavailable' } : {
          articles: [{ title: '<img src=x onerror=window.XSS=true>', description: 'Fixture article, not live news.', url: 'https://example.com/story', image: null }],
          page: 1, perPage: 12, totalResults: 1, hasMore: false,
        }),
      });
      return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Service unavailable"}' });
    });
    for (const path of ['/', '/dailybyte', '/trending', '/sports', '/health', '/technology', '/entertainment', '/horoscope', '/contact', '/login', '/signup', '/missing']) {
      await page.goto(base + path);
      await page.locator('h1').first().waitFor();
      await page.waitForTimeout(200);
      assert.equal(await page.locator('h1').count(), 1, path);
      if (path !== '/missing') assert(await page.evaluate(() => {
        const heading = document.querySelector('h1')?.getBoundingClientRect();
        const header = document.querySelector('.navbar')?.getBoundingClientRect();
        return heading && header && heading.top >= header.bottom - 1;
      }), `header must not cover page heading: ${path}`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width} ${path}`);
      await page.screenshot({ path: `artifacts/screenshots/${width}-${path.replace(/\W/g, '-')}.png` });
      reports.push({ width, path, passed: true });
    }
    await page.goto(base + '/dailybyte');
    const count = requests.length;
    await page.locator('#news-topic').fill('Michigan');
    await page.waitForTimeout(400);
    assert.equal(requests.length, count, 'typing must not trigger provider calls');
    await page.getByRole('button', { name: 'Find stories' }).click();
    await page.locator('.daily-byte__story').waitFor();
    assert.equal(await page.locator('.daily-byte__story img').count(), 0, 'article text must not execute as HTML');
    assert.equal(await page.evaluate(() => !!window.XSS), false);
    assert(requests.some(url => url.includes('q=Michigan')));
    failNews = true;
    await page.goto(base + '/technology');
    await page.getByRole('alert').waitFor();
    assert.equal(await page.getByText('No news available', { exact: true }).count(), 0);
    failNews = false;
    await page.getByRole('button', { name: 'Try again' }).click();
    await page.locator('.news-card').waitFor();
    await page.goto(base + '/signup');
    await page.locator('[name="email"]').fill('local-test@example.com');
    await page.locator('[name="username"]').fill('local-test');
    await page.locator('[name="password"]').fill('throwaway-local-only');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(base + '/');
    assert(!requests.some(url => url.includes('/auth')), 'local signup must not call a nonexistent API');
    assert(await page.evaluate(() => !!localStorage.getItem('daily_bytes_session')));
    await page.addInitScript(() => {
      for (const key of ['localStorage', 'sessionStorage']) Object.defineProperty(window, key, { get() { throw new DOMException('Blocked', 'SecurityError'); } });
      Object.defineProperty(document, 'cookie', { get() { throw new DOMException('Blocked', 'SecurityError'); }, set() { throw new DOMException('Blocked', 'SecurityError'); } });
    });
    await page.goto(base + '/');
    await page.getByRole('heading', { name: /Welcome to/ }).waitFor();
    assert.deepEqual(errors, []);
    reports.push({ width, interactions: 'safe search, no per-keypress requests, error/retry, local signup, restricted storage', passed: true });
    await context.close();
  }
} finally { await browser.close(); }
await fs.writeFile('artifacts/browser-smoke.json', JSON.stringify(reports, null, 2));
console.log(`${reports.length} Daily Bytes checks passed. News responses mocked; no provider or database writes.`);
