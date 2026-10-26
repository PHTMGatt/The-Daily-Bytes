import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ZODIAC_SIGNS,
  getZodiacMeta,
  normalizeHoroscopeResponse,
} from '../src/utils/horoscopeView.js';

test('zodiac metadata contains all twelve signs with labels and date ranges', () => {
  assert.equal(ZODIAC_SIGNS.length, 12);
  for (const sign of ZODIAC_SIGNS) {
    assert.ok(sign.value);
    assert.ok(sign.label);
    assert.ok(sign.range);
  }
});

test('getZodiacMeta resolves known signs case-insensitively', () => {
  assert.deepEqual(getZodiacMeta('VIRGO'), {
    value: 'virgo',
    label: 'Virgo',
    range: 'Aug 23 – Sep 22',
  });
});

test('getZodiacMeta falls back to Aries for unknown values', () => {
  assert.equal(getZodiacMeta('not-a-sign').value, 'aries');
});

test('normalizeHoroscopeResponse keeps provider date and horoscope text', () => {
  assert.deepEqual(
    normalizeHoroscopeResponse({ date: '2026-10-26', horoscope: 'Trust your instincts today.' }),
    { date: '2026-10-26', horoscope: 'Trust your instincts today.' },
  );
});

test('normalizeHoroscopeResponse safely handles missing or malformed fields', () => {
  assert.deepEqual(normalizeHoroscopeResponse({}), { date: '', horoscope: '' });
  assert.deepEqual(normalizeHoroscopeResponse(null), { date: '', horoscope: '' });
});
