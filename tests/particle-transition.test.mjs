import assert from "node:assert/strict";
import { test } from "node:test";
import { advanceExpansion, resolveParticleChoreography } from "../src/lib/particle-transition.ts";

test("large scroll jumps cannot teleport particles and converge at both ends", () => {
  let value = 0;
  for (let i = 0; i < 600; i++) {
    const next = advanceExpansion(value, 1, 1 / 60);
    assert(next >= value && next - value <= 4 / 60 + 1e-12); value = next;
  }
  assert(value > 0.9999);
  for (let i = 0; i < 600; i++) value = advanceExpansion(value, 0, 1 / 60);
  assert(value < 0.0001);
});
test("mid-expansion reversals stay bounded; background delays and invalid targets cannot skip the journey", () => {
  let value = 0;
  for (let i = 0; i < 6; i++) value = advanceExpansion(value, 1, 1 / 60);
  assert(value > 0.3 && value < 0.5);
  const reversed = advanceExpansion(value, 0, 1 / 60);
  assert(reversed < value && reversed >= 0);
  assert(advanceExpansion(0, 1, 30) <= 0.2 + 1e-12);
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

test("small scroll changes respond within 100ms and settle promptly in either direction", () => {
  for (const fps of [30, 60, 120]) {
    let value = 0;
    for (let i = 0; i < fps / 10; i++) value = advanceExpansion(value, 0.25, 1 / fps);
    assert(value > 0.17 && value < 0.25, "Most of a small change follows within 100ms");
    for (let i = 0; i < fps / 10; i++) value = advanceExpansion(value, 0.25, 1 / fps);
    assert(value > 0.23, "At least 92% follows within 200ms");
    for (let i = 0; i < fps / 5; i++) value = advanceExpansion(value, 0, 1 / fps);
    assert(value < 0.015, "Reverse scrolling settles equally quickly");
  }
});
