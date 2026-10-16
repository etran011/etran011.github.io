import assert from "node:assert/strict";
import { test } from "node:test";
import { chooseAtmosphereQuality, createAtmosphereBudget } from "../src/lib/atmosphere-budget.ts";

test("device hints choose bounded starting geometry", () => {
  assert.equal(chooseAtmosphereQuality(2, false), "low");
  assert.equal(chooseAtmosphereQuality(6, false), "medium");
  assert.equal(chooseAtmosphereQuality(12, false), "high");
  assert.equal(chooseAtmosphereQuality(12, true), "low");
});
test("healthy animation retains sixty FPS and ignores isolated pauses", () => {
  const budget = createAtmosphereBudget("high");
  for (let i = 0; i < 500; i++) { budget.observe(16.67); if (i % 50 === 0) budget.observe(1000); }
  assert.equal(budget.quality, "high"); assert.equal(budget.frameRate, 60);
});
test("sustained pressure reduces density before reducing cadence and never oscillates", () => {
  const budget = createAtmosphereBudget("high");
  for (let i = 0; i < 120; i++) budget.observe(33.3);
  assert.equal(budget.quality, "medium"); assert.equal(budget.frameRate, 60);
  for (let i = 0; i < 60; i++) budget.observe(33.3);
  assert.equal(budget.quality, "low"); assert.equal(budget.frameRate, 60);
  for (let i = 0; i < 60; i++) budget.observe(33.3);
  assert.equal(budget.frameRate, 30);
  for (let i = 0; i < 500; i++) budget.observe(8.3);
  assert.equal(budget.quality, "low"); assert.equal(budget.frameRate, 30);
});
