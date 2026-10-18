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

test("proportional expansion preserves links and reversibly shrinks samples", () => {
  const state = {};
  resolveParticleChoreography(0, state);
  assert.deepEqual(state, { scale: 1, links: 1, shrink: 0 });
  let previous = { ...state };
  const forward = [];
  for (let i = 0; i <= 100; i++) {
    resolveParticleChoreography(i / 100, state);
    assert(state.scale >= previous.scale && state.links <= previous.links && state.shrink >= previous.shrink);
    assert(state.links >= .82 && state.scale <= 2.65);
    previous = { ...state }; forward.push({ ...state });
  }
  assert.equal(state.scale, 2.65);
  assert(Math.abs(state.links - .82) < 1e-12);
  assert.equal(state.shrink, 1);
  for (let i = 100; i >= 0; i--) {
    resolveParticleChoreography(i / 100, state);
    assert.deepEqual(state, forward[i]);
  }
});
