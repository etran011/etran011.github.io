import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRingGeometry } from '../src/lib/atmosphere-rings.ts';

test('three detailed instrument rings share one bounded static buffer', () => {
  const data = createRingGeometry();
  assert.deepEqual(data, createRingGeometry());
  assert(data.byteLength < 400000);
  const rings = new Set(), speeds = new Set(), details = new Set();
  for (let i = 0; i < data.length; i += 13) {
    assert(Array.from(data.slice(i, i + 13)).every(Number.isFinite));
    rings.add(data[i + 7]); speeds.add(data[i + 8]); details.add(data[i + 12]);
    assert(data[i + 6] >= 0 && data[i + 6] < 1);
    assert(Math.hypot(data[i], data[i + 1] + .12, data[i + 2]) > 1.5);
  }
  assert.equal(createRingGeometry(false).length * 3, data.length, 'Static strokes and live ribbons share the same arc/tick layout');
  assert.equal(rings.size, 3); assert.equal(speeds.size, 3);
  assert.deepEqual([...details].sort(), [0,1,2,3]);
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

import { formationCamera, formationView, sculptureRadius, fitSculptureScale, positionSculptureCenter } from '../src/lib/atmosphere-view.mjs';
test('ribbon envelope fits desktop and tall-window frames with safe margins', () => {
  const geometry = createRingGeometry();
  let radius = 0;
  for (let i = 0; i < geometry.length; i += 13) radius = Math.max(radius, Math.hypot(...geometry.slice(i, i + 3)) * .85);
  const projectedEnvelope = radius / Math.sqrt(1 - (radius / formationCamera) ** 2);
  assert(projectedEnvelope <= sculptureRadius);
  for (const aspect of [1.7778, 1.6, 1.44, 1.3333, 1.024, .8533]) {
    for (const dx of [-.025, 0, .025]) {
      const pose = { ...formationView, centerX: formationView.centerX + dx, centerY: .018 };
      const scale = fitSculptureScale(pose, aspect);
      assert(scale <= pose.scale && scale > .25);
      assert(Math.abs(pose.centerX) + projectedEnvelope * scale / aspect <= .961);
      assert(Math.abs(pose.centerY) + projectedEnvelope * scale <= .961);
    }
  }
});

test('rightward positioning uses available space without altering scale or vertical placement', () => {
  for (const aspect of [1.7778, 1.6, 1.44, 1.3333, 1.024, .8533]) {
    const pose = { ...formationView };
    const before = { ...pose }, scale = fitSculptureScale(pose, aspect);
    const center = positionSculptureCenter(pose, aspect);
    assert(center >= pose.centerX);
    assert(center - pose.centerX <= .160001);
    assert(center + sculptureRadius * scale / aspect <= .960001);
    assert.equal(fitSculptureScale(pose, aspect), scale);
    assert.deepEqual(pose, before, 'Positioning must not mutate the shared camera or animations');
  }
  assert(positionSculptureCenter(formationView, 1.6) - formationView.centerX > .1, 'Laptop composition should move noticeably right');
});
