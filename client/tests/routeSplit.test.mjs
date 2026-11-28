import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');

test('only the home hub is in the first bundle; other pages load with their route', () => {
  for (const page of ['Horoscope', 'Login', 'SignUp', 'Trending', 'Saved']) {
    assert.doesNotMatch(main, new RegExp(`^import .* from './pages/${page}'`, 'm'), `${page} is imported eagerly`);
    assert.ok(main.includes(`import('./pages/${page}')`), `${page} has no lazy import`);
  }
  assert.match(main, /^import DailyByte from '\.\/pages\/DailyByte'/m);
});
