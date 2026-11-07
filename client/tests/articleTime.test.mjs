import test from 'node:test';
import assert from 'node:assert/strict';

import { formatPublishedLabel } from '../src/utils/articleTime.js';

const NOW = Date.parse('2026-10-31T12:00:00Z');
const ago = (ms) => new Date(NOW - ms).toISOString();
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

test('missing or invalid timestamps read as Recent', () => {
  assert.equal(formatPublishedLabel(undefined, NOW), 'Recent');
  assert.equal(formatPublishedLabel('', NOW), 'Recent');
  assert.equal(formatPublishedLabel('not a date', NOW), 'Recent');
});

test('stories under a minute old read as Just now', () => {
  assert.equal(formatPublishedLabel(ago(20 * 1000), NOW), 'Just now');
});

test('minutes, hours and days are shown relatively', () => {
  assert.equal(formatPublishedLabel(ago(5 * MIN), NOW), '5m ago');
  assert.equal(formatPublishedLabel(ago(3 * HOUR + 40 * MIN), NOW), '3h ago');
  assert.equal(formatPublishedLabel(ago(2 * DAY + 5 * HOUR), NOW), '2d ago');
});

test('stories a week or older fall back to a calendar date', () => {
  const label = formatPublishedLabel(ago(8 * DAY), NOW);
  assert.match(label, /2026/);
  assert.doesNotMatch(label, /ago/);
});

test('future-dated stories within clock skew read as Just now, beyond it as a date', () => {
  assert.equal(formatPublishedLabel(new Date(NOW + 10 * MIN).toISOString(), NOW), 'Just now');
  assert.doesNotMatch(formatPublishedLabel(new Date(NOW + 3 * DAY).toISOString(), NOW), /ago|Just now/);
});
