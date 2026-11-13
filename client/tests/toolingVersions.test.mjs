import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Regression: vite <= 6.4.3 carries a high-severity dev-server advisory; keep the installed major at 7 or newer.
test('installed vite is not the advisory-affected 5.x/6.x line', () => {
  const pkg = JSON.parse(readFileSync(new URL('../node_modules/vite/package.json', import.meta.url), 'utf8'));
  assert.ok(Number(pkg.version.split('.')[0]) >= 7, `vite ${pkg.version} is too old`);
});
