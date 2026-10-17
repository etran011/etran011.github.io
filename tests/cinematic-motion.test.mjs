import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openingCameraWeight } from '../src/lib/cinematic-motion.ts';

test('opening camera settles monotonically and cannot replay after active time advances', () => {
  assert.equal(openingCameraWeight(0), 1);
  let previous = 1;
  for (let i = 0; i <= 160; i++) {
    const current = openingCameraWeight(i / 100);
    assert(current <= previous && current >= 0);
    previous = current;
  }
  assert.equal(openingCameraWeight(1.6), 0);
  assert.equal(openingCameraWeight(600), 0);
});
