import assert from "node:assert/strict";
import { test } from "node:test";
import { advanceExpansion, resolveParticleChoreography } from "../src/lib/particle-transition.ts";

test("large scroll jumps cannot teleport particles and converge at both ends", () => {
  let value = 0;
  for (let i = 0; i < 600; i++) {
    const next = advanceExpansion(value, 1, 1 / 60);
    assert(next >= value && next - value <= 0.85 / 60 + 1e-12); value = next;
  }
  assert(value > 0.9999);
  for (let i = 0; i < 600; i++) value = advanceExpansion(value, 0, 1 / 60);
  assert(value < 0.0001);
});
test("mid-expansion reversals stay bounded; background delays and invalid targets cannot skip the journey", () => {
  let value = 0;
  for (let i = 0; i < 30; i++) value = advanceExpansion(value, 1, 1 / 60);
  assert(value > 0.2 && value < 0.5);
  const reversed = advanceExpansion(value, 0, 1 / 60);
  assert(reversed < value && reversed >= 0);
  assert(advanceExpansion(0, 1, 30) <= 0.0425 + 1e-12);
  assert.equal(advanceExpansion(0, -1, 0.05), 0);
  assert.equal(advanceExpansion(1, 2, 0.05), 1);
});

test("clusters separate and links fade before full particle release; reverse reconstruction is exact", () => {
  const state = {};
  resolveParticleChoreography(0, state);
  assert.deepEqual(state, { separation: 0, release: 0, links: 1 });
  resolveParticleChoreography(0.12, state);
  assert(state.separation > 0.2 && state.release === 0 && state.links < 1);
  resolveParticleChoreography(0.36, state);
  assert.equal(state.separation, 1);
  assert.equal(state.links, 0);
  assert(state.release > 0 && state.release < 0.2);
  let previousRelease = 0, previousLinks = 1;
  const forward = [];
  for (let i = 0; i <= 100; i++) {
    resolveParticleChoreography(i / 100, state);
    assert(state.release >= previousRelease && state.links <= previousLinks);
    assert(Object.values(state).every(value => value >= 0 && value <= 1));
    previousRelease = state.release; previousLinks = state.links;
    forward.push({ ...state });
  }
  assert.deepEqual(state, { separation: 0, release: 1, links: 0 });
  for (let i = 100; i >= 0; i--) {
    resolveParticleChoreography(i / 100, state);
    assert.deepEqual(state, forward[i]);
  }
});
