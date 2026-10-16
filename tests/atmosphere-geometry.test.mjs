import assert from "node:assert/strict";
import { test } from "node:test";
import { atmosphereQuality, createRibbonGeometry, projectRibbonPoint, ribbonPoint } from "../src/lib/atmosphere-geometry.ts";

test("the ribbon closes with a continuous half twist", () => {
  for (const v of [-1, -0.5, 0, 0.5, 1]) {
    const start = ribbonPoint(0, -v); const end = ribbonPoint(Math.PI * 2, v);
    assert(start.every((value, index) => Math.abs(value - end[index]) < 1e-12));
  }
});
test("bounded quality tiers generate finite, complete line and point buffers", () => {
  let previous = Infinity;
  for (const quality of Object.keys(atmosphereQuality)) {
    const geometry = createRibbonGeometry(quality);
    assert(geometry.lines.length % 6 === 0 && geometry.points.length % 3 === 0);
    assert(geometry.lines.length < previous); previous = geometry.lines.length;
    assert(geometry.lines.every((value) => Number.isFinite(value) && Math.abs(value) < 1.7));
    assert(geometry.points.every(Number.isFinite));
    assert(geometry.lines.byteLength < 100_000);
  }
});
test("the fallback projects safely at the same resting pose", () => {
  for (let u = 0; u < Math.PI * 2; u += 0.05) for (const v of [-1, 0, 1]) {
    const projected = projectRibbonPoint(ribbonPoint(u, v));
    assert(projected.every(Number.isFinite));
    assert(Math.abs(projected[0]) < 2 && Math.abs(projected[1]) < 2);
  }
});
