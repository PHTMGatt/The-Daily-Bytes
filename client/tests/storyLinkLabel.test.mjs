import test from 'node:test';
import assert from 'node:assert/strict';

import { getStoryLinkLabel } from '../src/utils/storyLinkLabel.js';

test('label names the headline, outlet and new-tab behavior', () => {
  assert.equal(
    getStoryLinkLabel('RTX 5090 price drops', 'PC Gamer'),
    'Open RTX 5090 price drops from PC Gamer (opens in a new tab)',
  );
});

test('label collapses whitespace and tolerates missing parts', () => {
  assert.equal(getStoryLinkLabel('  Big \n news ', ''), 'Open Big news (opens in a new tab)');
  assert.equal(getStoryLinkLabel(undefined, null), 'Open story (opens in a new tab)');
});
