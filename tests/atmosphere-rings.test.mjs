import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRingGeometry } from '../src/lib/atmosphere-rings.ts';

test('three sparse coordinate rings share one bounded static buffer', () => {
  const data = createRingGeometry();
  assert.deepEqual(data, createRingGeometry());
  assert(data.byteLength < 40000);
  const rings = new Set(), speeds = new Set();
  for (let i = 0; i < data.length; i += 13) {
    assert(Array.from(data.slice(i, i + 13)).every(Number.isFinite));
    rings.add(data[i + 7]); speeds.add(data[i + 8]);
    assert(data[i + 6] >= 0 && data[i + 6] < 1);
    assert(Math.hypot(data[i], data[i + 1] + .12, data[i + 2]) > 1.5);
  }
  assert.equal(rings.size, 3); assert.equal(speeds.size, 3);
  assert.equal(data.length % 26, 0, 'Every tick and arc segment has paired endpoints');
});
