import test from 'node:test';
import assert from 'node:assert/strict';

import { cleanSummary, matchStoryTag } from '../src/utils/storyText.js';

test('cleanSummary strips trailing "Read more" style noise', () => {
  assert.equal(cleanSummary('Rockstar confirmed the date. Read more'), 'Rockstar confirmed the date.');
  assert.equal(cleanSummary('Rockstar confirmed the date. Read More...'), 'Rockstar confirmed the date.');
  assert.equal(cleanSummary('Patch notes are out. [+1432 chars]'), 'Patch notes are out.');
  assert.equal(cleanSummary('Patch notes are out. […]'), 'Patch notes are out.');
});

test('cleanSummary trims a mid-sentence cut back to the last full sentence', () => {
  const text = 'Workers at the studio voted to form a union this week. The deal covers pay, hours,';
  assert.equal(cleanSummary(text), 'Workers at the studio voted to form a union this week.');
});

test('cleanSummary never ends on a dangling comma', () => {
  assert.equal(cleanSummary('The union deal covers pay, hours,'), 'The union deal covers pay, hours…');
  assert.ok(!cleanSummary('One, two, three,').endsWith(','));
});

test('cleanSummary handles empty and whitespace input', () => {
  assert.equal(cleanSummary(''), '');
  assert.equal(cleanSummary(null), '');
  assert.equal(cleanSummary('   Read more  '), '');
  assert.equal(cleanSummary('  Big \n news.  '), 'Big news.');
});

const chips = [
  ['Witcher 3', 'The Witcher 3'],
  ['AC Shadows', 'Assassins Creed Shadows'],
  ['GTA 6', 'GTA 6'],
  ['DOOM', 'DOOM'],
  ['Xbox', 'Xbox'],
];

test('matchStoryTag names the matched game from the headline', () => {
  assert.equal(matchStoryTag({ title: 'GTA 6 trailer 3 lands next week' }, chips, 'Gaming'), 'GTA 6');
  assert.equal(matchStoryTag({ title: "Assassin's Creed Shadows gets a new patch" }, chips, 'Gaming'), 'AC Shadows');
  assert.equal(matchStoryTag({ title: 'Witcher 3 mod adds ray tracing' }, chips, 'Gaming'), 'Witcher 3');
});

test('matchStoryTag prefers the headline over the summary and earlier chips over later ones', () => {
  const article = { title: 'New Xbox showcase date', description: 'Expect GTA 6 and DOOM news.' };
  assert.equal(matchStoryTag(article, chips, 'Gaming'), 'Xbox');
  assert.equal(matchStoryTag({ title: 'Showcase recap', description: 'DOOM and GTA 6 both appeared.' }, chips, 'Gaming'), 'GTA 6');
});

test('matchStoryTag matches whole words only and falls back to the topic', () => {
  assert.equal(matchStoryTag({ title: 'Doomscrolling is bad for you' }, chips, 'Gaming'), 'Gaming');
  assert.equal(matchStoryTag({ title: 'Nothing here' }, chips, ''), 'News');
  assert.equal(matchStoryTag({}, [], 'Industry'), 'Industry');
});
