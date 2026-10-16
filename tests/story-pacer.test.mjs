import assert from "node:assert/strict";
import { test } from "node:test";
import { createStoryPacer } from "../src/lib/story-pacer.ts";

test("large deltas traverse every stage at bounded visual speed", () => {
  const pacer = createStoryPacer(4);
  const stages = [0];
  let previous = 0;
  for (let time = 0; time < 2200; time += 16) {
    const value = pacer.advance(1, 16);
    assert(value >= previous && value <= 1);
    assert(value - previous <= 2.6 / 3 * 0.016 + 1e-9);
    const stage = Math.round(value * 3);
    if (stage !== stages.at(-1)) stages.push(stage);
    previous = value;
  }
  assert.deepEqual(stages, [0, 1, 2, 3]);
  assert.equal(previous, 1);
});

test("reversal catches up without overshooting either end", () => {
  const pacer = createStoryPacer(3);
  let before;
  for (let i = 0; i < 25; i++) before = pacer.advance(1, 16);
  let value;
  for (let i = 0; i < 10; i++) value = pacer.advance(0, 16);
  assert(value < before);
  for (let i = 0; i < 100; i++) { value = pacer.advance(0, 16); assert(value >= 0 && value <= 1); }
  assert.equal(value, 0);
});

test("background delays cannot leap through stages; explicit navigation can reset", () => {
  const pacer = createStoryPacer(4);
  assert(pacer.advance(1, 5000) < 0.05);
  assert.equal(pacer.snap(0.8), 0.8);
  assert.equal(pacer.advance(0.8, 16), 0.8);
});
