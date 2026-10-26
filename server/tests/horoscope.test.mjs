import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeZodiacSign } from '../dist/lib/horoscope.js';

test('normalizeZodiacSign accepts known signs case-insensitively', () => {
  assert.equal(normalizeZodiacSign(' Virgo '), 'virgo');
  assert.equal(normalizeZodiacSign('ARIES'), 'aries');
});

test('normalizeZodiacSign defaults empty input to aries', () => {
  assert.equal(normalizeZodiacSign(undefined), 'aries');
  assert.equal(normalizeZodiacSign(''), 'aries');
});

test('normalizeZodiacSign rejects unsupported signs', () => {
  assert.throws(() => normalizeZodiacSign('vergo'), /valid zodiac sign/i);
  assert.throws(() => normalizeZodiacSign('dragon'), /valid zodiac sign/i);
});
