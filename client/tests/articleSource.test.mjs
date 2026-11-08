import test from 'node:test';
import assert from 'node:assert/strict';

import { formatSourceName, getArticleSource } from '../src/utils/articleSource.js';

test('known gaming and tech outlet slugs get their brand names', () => {
  assert.equal(formatSourceName('pcgamer'), 'PC Gamer');
  assert.equal(formatSourceName('ign'), 'IGN');
  assert.equal(formatSourceName('the-verge'), 'The Verge');
  assert.equal(formatSourceName('tomshardware'), "Tom's Hardware");
  assert.equal(formatSourceName('Rock Paper Shotgun'), 'Rock Paper Shotgun');
});

test('unknown hyphenated slugs are title-cased and everything else is left alone', () => {
  assert.equal(formatSourceName('daily-star'), 'Daily Star');
  assert.equal(formatSourceName('seeking_alpha'), 'Seeking Alpha');
  assert.equal(formatSourceName('Eurogamer.net'), 'Eurogamer.net');
  assert.equal(formatSourceName('unknownoutlet'), 'unknownoutlet');
  assert.equal(formatSourceName('The Guardian'), 'The Guardian');
});

test('empty values fall back to a neutral label', () => {
  assert.equal(formatSourceName(''), 'News source');
  assert.equal(formatSourceName('   '), 'News source');
  assert.equal(formatSourceName(undefined), 'News source');
});

test('article sources resolve from string, object, or author', () => {
  assert.equal(getArticleSource({ source: 'pcgamer' }), 'PC Gamer');
  assert.equal(getArticleSource({ source: { name: 'engadget' } }), 'Engadget');
  assert.equal(getArticleSource({ source: '', author: 'Jane Doe' }), 'Jane Doe');
  assert.equal(getArticleSource({}), 'News source');
  assert.equal(getArticleSource(null), 'News source');
});
