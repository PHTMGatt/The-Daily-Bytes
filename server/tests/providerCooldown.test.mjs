import test from 'node:test';
import assert from 'node:assert/strict';
import { ProviderCooldown } from '../dist/lib/providerCooldown.js';

test('ProviderCooldown starts closed', () => {
  const cooldown = new ProviderCooldown(1000, 8000);
  assert.equal(cooldown.isOpen(0), false);
  assert.equal(cooldown.remaining(0), 0);
});

test('ProviderCooldown opens after a failure and closes when it elapses', () => {
  const cooldown = new ProviderCooldown(1000, 8000);
  assert.equal(cooldown.recordFailure(5000), 1000);
  assert.equal(cooldown.isOpen(5500), true);
  assert.equal(cooldown.remaining(5500), 500);
  assert.equal(cooldown.isOpen(6000), false);
});

test('ProviderCooldown doubles on consecutive failures up to the cap', () => {
  const cooldown = new ProviderCooldown(1000, 3000);
  assert.equal(cooldown.recordFailure(0), 1000);
  assert.equal(cooldown.recordFailure(0), 2000);
  assert.equal(cooldown.recordFailure(0), 3000);
  assert.equal(cooldown.recordFailure(0), 3000);
});

test('ProviderCooldown resets after a success', () => {
  const cooldown = new ProviderCooldown(1000, 8000);
  cooldown.recordFailure(0);
  cooldown.recordFailure(0);
  cooldown.recordSuccess();
  assert.equal(cooldown.isOpen(1), false);
  assert.equal(cooldown.recordFailure(10), 1000);
});
