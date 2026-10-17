import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRingGeometry } from '../src/lib/atmosphere-rings.ts';

test('three sparse coordinate rings share one bounded static buffer', () => {
  const data = createRingGeometry();
  assert.deepEqual(data, createRingGeometry());
  assert(data.byteLength < 120000);
  const rings = new Set(), speeds = new Set();
  for (let i = 0; i < data.length; i += 13) {
    assert(Array.from(data.slice(i, i + 13)).every(Number.isFinite));
    rings.add(data[i + 7]); speeds.add(data[i + 8]);
    assert(data[i + 6] >= 0 && data[i + 6] < 1);
    assert(Math.hypot(data[i], data[i + 1] + .12, data[i + 2]) > 1.5);
  }
  assert.equal(createRingGeometry(false).length * 3, data.length, 'Static strokes and live ribbons share the same arc/tick layout');
  assert.equal(rings.size, 3); assert.equal(speeds.size, 3);
  assert.equal(data.length % 78, 0, 'Every ribbon segment contains two triangles');
});

import { resolveRingChoreography } from '../src/lib/particle-transition.ts';
test('rings expand, fragment and fade continuously with exact reverse reconstruction', () => {
  const sample = p => { const state = {}; resolveRingChoreography(p, state); return state; };
  assert.deepEqual(sample(0), { expansion: 0, fragments: 0, opacity: 1 });
  assert.deepEqual(sample(1), { expansion: 1, fragments: 1, opacity: 0 });
  let previous = sample(0);
  const forward = [];
  for (let i = 0; i <= 100; i++) {
    const current = sample(i / 100); forward.push(current);
    assert(current.expansion >= previous.expansion && current.fragments >= previous.fragments && current.opacity <= previous.opacity);
    assert(Math.abs(current.opacity - previous.opacity) < .03);
    previous = current;
  }
  for (let i = 100; i >= 0; i--) assert.deepEqual(sample(i / 100), forward[i]);
  assert.equal(sample(.1).fragments, 0, 'Initial scroll preserves coherent coordinate arcs');
  assert(sample(.5).opacity > 0, 'Fragments remain after surface links disappear');
});
